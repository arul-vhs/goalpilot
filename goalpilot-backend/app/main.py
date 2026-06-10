import os
import json
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from google_auth_oauthlib.flow import Flow

from .agents.onboarding_agent import get_onboarding_advice, get_clarifying_questions
from .agents.planner_agent import planner_agent
from .agents.coach_agent import run_coach_chat
from .utils.db_helper import save_tasks_to_db
from .utils.supabase_client import get_supabase_client, get_supabase_admin_client
from .utils.scheduler import schedule_user_tasks
from .utils.calendar_manager import (
    get_client_secret_path,
    get_busy_times,
    find_next_free_slot,
    create_calendar_event
)
from .utils.crypto_helper import encrypt_data, decrypt_data

app = FastAPI(title="GoalPilot API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "GoalPilot Backend is Live"}

@app.post("/consultation")
async def start_consultation(data: dict, authorization: Optional[str] = Header(None), x_user_id: Optional[str] = Header(None)):
    # Expected keys: goal, hours, focus
    advice = get_onboarding_advice(data)
    return {"advice": advice}

@app.post("/clarifying-questions")
async def clarify(data: dict, authorization: Optional[str] = Header(None), x_user_id: Optional[str] = Header(None)):
    # Expected keys: goal, strategy_id
    goal = data.get("goal")
    strategy_id = data.get("strategy_id")
    if not goal or not strategy_id:
        raise HTTPException(status_code=400, detail="Missing goal or strategy_id")
    
    questions = get_clarifying_questions(goal, strategy_id)
    return {"questions": questions}

@app.post("/breakdown-goal")
async def breakdown_goal(data: dict, authorization: Optional[str] = Header(None)):
    # Expected keys: goal, context (daily_hours, current_focus, strategy, clarifications)
    goal = data.get("goal")
    context = data.get("context", {})
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    
    # 1. Instantiate user-scoped client
    supabase_client = get_supabase_client(authorization)
    
    # 2. Get user info from JWT
    token = authorization.split(" ")[1] if authorization and authorization.startswith("Bearer ") else None
    try:
        user_res = supabase_client.auth.get_user(token)
        if not user_res or not user_res.user:
            raise Exception("No user found in session response.")
        user_id = user_res.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid JWT session: {str(e)}")
        
    # 3. Run LangGraph Planner Agent
    inputs = {"goal": goal, "user_context": context, "tasks": []}
    result = planner_agent.invoke(inputs)
    tasks = result.get("tasks", [])
    
    if not tasks:
        raise HTTPException(status_code=500, detail="AI failed to generate a task breakdown list.")
        
    # 4. Save to Supabase using the user-scoped client
    try:
        saved_tasks = save_tasks_to_db(supabase_client, user_id, goal, tasks)
        return {"status": "success", "tasks": saved_tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database write failed: {str(e)}")

@app.post("/schedule")
async def schedule_tasks(data: dict, authorization: Optional[str] = Header(None)):
    # Expected keys: calendar_events (list), start_date (optional ISO string)
    calendar_events = data.get("calendar_events", [])
    start_date = data.get("start_date")
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
        
    supabase_client = get_supabase_client(authorization)
    
    token = authorization.split(" ")[1] if authorization and authorization.startswith("Bearer ") else None
    try:
        user_res = supabase_client.auth.get_user(token)
        if not user_res or not user_res.user:
            raise Exception("No user found in session response.")
        user_id = user_res.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid JWT session: {str(e)}")
        
    # 1. Fetch user tasks and profile focus hours
    tasks_res = supabase_client.table("tasks").select("*").eq("user_id", user_id).execute()
    prof_res = supabase_client.table("profiles").select("daily_hours").eq("id", user_id).maybe_single().execute()
    
    daily_hours = prof_res.data.get("daily_hours") if prof_res.data and prof_res.data.get("daily_hours") is not None else 2.0
    
    # 2. Run Scheduling Engine
    try:
        scheduled = schedule_user_tasks(tasks_res.data, daily_hours, calendar_events, start_date)
        
        # 3. Save schedules in DB
        for t in scheduled:
            supabase_client.table("tasks").update({"description": t["description"]}).eq("id", t["id"]).eq("user_id", user_id).execute()
            
        return {"status": "success", "scheduled_tasks": scheduled}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scheduling failed: {str(e)}")

@app.post("/chat")
async def chat_coach(data: dict, authorization: Optional[str] = Header(None)):
    # Expected keys: message, history
    message = data.get("message")
    history = data.get("history", [])
    
    if not message:
        raise HTTPException(status_code=400, detail="Missing message")
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
        
    supabase_client = get_supabase_client(authorization)
    
    token = authorization.split(" ")[1] if authorization and authorization.startswith("Bearer ") else None
    try:
        user_res = supabase_client.auth.get_user(token)
        if not user_res or not user_res.user:
            raise Exception("No user found in session response.")
        user_id = user_res.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid JWT session: {str(e)}")
        
    # Run the Focus Coach agent
    res = run_coach_chat(supabase_client, user_id, message, history)
    return res

class OnboardingCompletion(BaseModel):
    user_id: str
    full_name: str
    preferences: dict

@app.get("/google-login")
async def google_login(user_id: str):
    """
    Generates a Google authorization URL for the user to link their calendar.
    """
    try:
        import urllib.parse
        secret_path = get_client_secret_path()
        with open(secret_path, "r") as f:
            secret_data = json.load(f)
            
        web_config = secret_data.get("web", secret_data.get("installed", {}))
        client_id = web_config.get("client_id")
        
        scopes = [
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/userinfo.profile"
        ]
        
        state_token = encrypt_data(user_id)
        
        params = {
            "client_id": client_id,
            "redirect_uri": "http://localhost:8000/google-callback",
            "response_type": "code",
            "scope": " ".join(scopes),
            "access_type": "offline",
            "prompt": "consent",
            "state": state_token,
            "include_granted_scopes": "true"
        }
        
        authorization_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)
        return {"url": authorization_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth initialization failed: {str(e)}")

@app.get("/google-callback", response_class=HTMLResponse)
async def google_callback(code: str, state: str):
    """
    Exchanges OAuth code for credentials, fetches user profile, and stores encrypted tokens in Supabase.
    """
    try:
        try:
            user_id = decrypt_data(state)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid state token.")
            
        secret_path = get_client_secret_path()
        with open(secret_path, "r") as f:
            secret_data = json.load(f)
            
        web_config = secret_data.get("web", secret_data.get("installed", {}))
        client_id = web_config.get("client_id")
        client_secret = web_config.get("client_secret")
        
        # Token exchange request via standard POST
        import urllib.request
        import urllib.parse
        
        token_url = "https://oauth2.googleapis.com/token"
        data = urllib.parse.urlencode({
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": "http://localhost:8000/google-callback",
            "grant_type": "authorization_code"
        }).encode("utf-8")
        
        req = urllib.request.Request(
            token_url,
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            tokens = json.loads(res_body)
            
        access_token = tokens.get("access_token")
        refresh_token = tokens.get("refresh_token")
        
        if not access_token:
            raise Exception("No access token returned from Google.")
            
        # Fetch user info from Google using standard Credentials object
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build as google_build
        
        credentials = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri=token_url,
            client_id=client_id,
            client_secret=client_secret,
            scopes=[
                "https://www.googleapis.com/auth/calendar.events",
                "https://www.googleapis.com/auth/calendar.readonly",
                "https://www.googleapis.com/auth/userinfo.profile"
            ]
        )
        
        service = google_build('oauth2', 'v2', credentials=credentials)
        user_info = service.userinfo().get().execute()
        email = user_info.get("email")
        name = user_info.get("name")
        
        # Encrypt sensitive tokens
        enc_access = encrypt_data(access_token)
        enc_refresh = encrypt_data(refresh_token) if refresh_token else None
        
        admin_client = get_supabase_admin_client()
        
        profile_update = {
            "google_access_token": enc_access,
        }
        if enc_refresh:
            profile_update["google_refresh_token"] = enc_refresh
        if name:
            profile_update["display_name"] = name
        if email:
            profile_update["email"] = email
            
        admin_client.table("profiles").update(profile_update).eq("id", user_id).execute()
        
        return """
        <html>
            <head>
                <title>Linked Successfully</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        background: #0f0a28;
                        color: #ffffff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .container {
                        text-align: center;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 16px;
                        padding: 40px;
                        max-width: 400px;
                        backdrop-filter: blur(10px);
                        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    }
                    h1 {
                        color: #22c55e;
                        font-size: 24px;
                        margin-top: 0;
                    }
                    p {
                        color: #94a3b8;
                        font-size: 15px;
                        line-height: 1.5;
                        margin-bottom: 24px;
                    }
                    button {
                        background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 12px 24px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Linked Successfully!</h1>
                    <p>Your Google Calendar has been securely linked with GoalPilot. You can close this tab and return to the application.</p>
                    <button onclick="window.close()">Close Window</button>
                </div>
            </body>
        </html>
        """
    except Exception as e:
        return f"""
        <html>
            <head><title>Connection Failed</title></head>
            <body style="background:#0f0a28;color:#ef4444;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
                <div style="text-align:center;background:rgba(255,255,255,0.05);border:1px solid rgba(239,68,68,0.2);padding:40px;border-radius:16px;max-width:400px;">
                    <h1 style="margin-top:0;">Connection Failed</h1>
                    <p style="color:#94a3b8;">An error occurred while linking your account:</p>
                    <p style="font-family:monospace;background:rgba(0,0,0,0.2);padding:10px;border-radius:6px;word-break:break-all;">{str(e)}</p>
                    <button onclick="window.close()" style="background:#ef4444;color:white;border:none;border-radius:8px;padding:12px 24px;font-weight:600;cursor:pointer;">Close Window</button>
                </div>
            </body>
        </html>
        """

@app.post("/sync-goal-to-calendar/{goal_id}")
async def sync_goal_to_calendar(goal_id: str, authorization: Optional[str] = Header(None)):
    """
    Schedules all pending subtasks of a goal into Google Calendar.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
        
    supabase_client = get_supabase_client(authorization)
    token = authorization.split(" ")[1] if authorization and authorization.startswith("Bearer ") else None
    
    try:
        user_res = supabase_client.auth.get_user(token)
        if not user_res or not user_res.user:
            raise Exception("No user found in session response.")
        user_id = user_res.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid JWT session: {str(e)}")
        
    # 1. Fetch all tasks for this goal
    try:
        tasks_res = supabase_client.table("tasks").select("*").eq("goal_id", goal_id).eq("user_id", user_id).eq("completed", False).execute()
        tasks_list = tasks_res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tasks for goal: {str(e)}")
        
    if not tasks_list:
        return {"status": "success", "message": "No pending tasks found for this goal to schedule.", "scheduled_count": 0}
        
    # 2. Fetch busy times and timezone
    try:
        busy_times, user_tz = get_busy_times(user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch calendar data. Please ensure Google Calendar is connected: {str(e)}")
        
    # 3. Schedule each task sequentially
    scheduled_count = 0
    import datetime
    
    for task in tasks_list:
        # Determine task duration from effort (1-10)
        effort = task.get("effort", 2)
        # Cap duration at 4 hours to fit within the 9-6 working hours window
        duration_minutes = min(effort, 4) * 60
        
        # Find next free slot in calendar
        slot_start = find_next_free_slot(busy_times, duration_minutes, user_tz)
        
        # Parse notes/details from description JSON if possible
        desc_raw = task.get("description")
        notes = task.get("title")
        if desc_raw:
            try:
                parsed_desc = json.loads(desc_raw)
                notes = parsed_desc.get("notes") or notes
            except Exception:
                notes = desc_raw
                
        event_desc = f"Task: {task.get('title')}\n\nNotes: {notes}\n\nSynced via GoalPilot"
        
        try:
            # Create the calendar event
            event_id = create_calendar_event(user_id, task["title"], event_desc, slot_start, duration_minutes)
            
            # Update busy times locally so next tasks are scheduled in the next open slots
            slot_end = slot_start + datetime.timedelta(minutes=duration_minutes)
            busy_times.append((slot_start, slot_end))
            busy_times.sort(key=lambda x: x[0])
            
            # Update task in Supabase
            supabase_client.table("tasks").update({
                "scheduled_at": slot_start.isoformat(),
                "google_event_id": event_id,
                "status": "scheduled"
            }).eq("id", task["id"]).execute()
            
            scheduled_count += 1
        except Exception as e:
            print(f"Failed to schedule task '{task.get('title')}': {str(e)}")
            
    return {"status": "success", "scheduled_count": scheduled_count}

@app.post("/complete-onboarding")
async def complete_onboarding(data: OnboardingCompletion, authorization: Optional[str] = Header(None)):
    """
    Completes onboarding by updating user profile information.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
        
    supabase_client = get_supabase_client(authorization)
    token = authorization.split(" ")[1] if authorization and authorization.startswith("Bearer ") else None
    
    try:
        user_res = supabase_client.auth.get_user(token)
        if not user_res or not user_res.user:
            raise Exception("No user found in session response.")
        user_id = user_res.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid JWT session: {str(e)}")
        
    if user_id != data.user_id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot update another user's onboarding status")
        
    # Update profile table
    profile_data = {
        "display_name": data.full_name,
        "current_focus": data.preferences.get("current_focus"),
        "daily_hours": data.preferences.get("daily_hours"),
        "big_goal": data.preferences.get("big_goal"),
        "onboarding_completed": True
    }
    
    try:
        res = supabase_client.table("profiles").update(profile_data).eq("id", user_id).execute()
        return {"status": "success", "profile": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save onboarding data: {str(e)}")

@app.post("/onboarding-advice")
async def onboarding_advice(data: dict, authorization: Optional[str] = Header(None), x_user_id: Optional[str] = Header(None)):
    """
    Generates strategic options/advice based on user vague goal, daily commitment, and current focus.
    """
    # Expected keys: goal, hours, focus
    advice = get_onboarding_advice(data)
    return advice

@app.get("/user-goals/{user_id}")
async def get_user_goals(user_id: str, authorization: Optional[str] = Header(None)):
    """
    Fetches all primary goals (tasks where is_goal = true) for the specified user.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
        
    supabase_client = get_supabase_client(authorization)
    token = authorization.split(" ")[1] if authorization and authorization.startswith("Bearer ") else None
    
    try:
        user_res = supabase_client.auth.get_user(token)
        if not user_res or not user_res.user:
            raise Exception("No user found in session response.")
        jwt_user_id = user_res.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid JWT session: {str(e)}")
        
    if jwt_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot view another user's goals")
        
    try:
        # Fetch tasks belonging to the user
        res = supabase_client.table("tasks").select("*").eq("user_id", user_id).execute()
        tasks = res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tasks: {str(e)}")
        
    goals = []
    for t in tasks:
        desc_raw = t.get("description")
        is_goal = False
        notes = t.get("title")
        if desc_raw:
            try:
                parsed = json.loads(desc_raw)
                is_goal = parsed.get("is_goal", False)
                notes = parsed.get("notes") or notes
            except Exception:
                pass
        
        if is_goal:
            goals.append({
                "id": t["id"],
                "title": t["title"],
                "description": notes,
                "completed": t["completed"],
                "created_at": t["created_at"]
            })
            
    return goals