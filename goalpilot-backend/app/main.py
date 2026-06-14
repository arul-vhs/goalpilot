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
    allow_origins=["https://goalpilot-v1.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_current_user(authorization: Optional[str] = Header(None)) -> Any:
    """
    FastAPI dependency that extracts the Supabase user from the Authorization header JWT.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = authorization.split(" ")[1] if authorization and authorization.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")
    try:
        supabase_client = get_supabase_client(authorization)
        user_res = supabase_client.auth.get_user(token)
        if not user_res or not user_res.user:
            raise Exception("No user found in session response.")
        return user_res.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid JWT session: {str(e)}")

@app.get("/")
async def root():
    return {"message": "GoalPilot Backend is Live"}

@app.post("/consultation")
async def start_consultation(data: dict, current_user: Any = Depends(get_current_user)):
    # Expected keys: goal, hours, focus
    advice = get_onboarding_advice(data)
    return {"advice": advice}

@app.post("/clarifying-questions")
async def clarify(data: dict, current_user: Any = Depends(get_current_user)):
    # Expected keys: goal, strategy_id
    goal = data.get("goal")
    strategy_id = data.get("strategy_id")
    if not goal or not strategy_id:
        raise HTTPException(status_code=400, detail="Missing goal or strategy_id")
    
    questions = get_clarifying_questions(goal, strategy_id)
    return {"questions": questions}

@app.post("/breakdown-goal")
async def breakdown_goal(data: dict, current_user: Any = Depends(get_current_user), authorization: Optional[str] = Header(None)):
    # Expected keys: goal, context (daily_hours, current_focus, strategy, clarifications)
    goal = data.get("goal")
    context = data.get("context", {})
    user_id = current_user.id
    
    # 1. Instantiate user-scoped client
    supabase_client = get_supabase_client(authorization)

    # 2. Fetch profile (persona)
    try:
        profile_res = supabase_client.table("profiles").select("*").eq("id", user_id).maybe_single().execute()
        profile_data = profile_res.data if profile_res else {}
    except Exception as e:
        print("Failed to fetch profiles for planning context:", e)
        profile_data = {}
        
    persona = {
        "full_name": profile_data.get("display_name", "User"),
        "daily_hours": profile_data.get("daily_hours", 2),
        "focus_area": profile_data.get("focus_area") or profile_data.get("current_focus") or "General",
        "work_style": profile_data.get("work_style", "Deep Work"),
        "user_level": profile_data.get("user_level", "Beginner")
    }
    context["persona"] = persona
        
    # 3. Run LangGraph Planner Agent
    inputs = {"goal": goal, "user_context": context, "tasks": []}
    result = planner_agent.invoke(inputs)
    tasks = result.get("tasks", [])
    
    if not tasks:
        raise HTTPException(status_code=500, detail="AI failed to generate a task breakdown list.")
        
    # 4. Save to Supabase using the user-scoped client
    try:
        goal_id, saved_tasks = save_tasks_to_db(supabase_client, user_id, goal, tasks)
        # Update last_active_goal_id in profiles
        try:
            admin_client = get_supabase_admin_client()
            admin_client.table("profiles").update({"last_active_goal_id": goal_id}).eq("id", user_id).execute()
        except Exception as e:
            print("Failed to update profile last_active_goal_id:", e)
            
        return {"status": "success", "goal_id": goal_id, "tasks": saved_tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database write failed: {str(e)}")

@app.post("/create-goal")
async def create_goal(data: dict, current_user: Any = Depends(get_current_user), authorization: Optional[str] = Header(None)):
    """
    Creates a new goal/mission, generates a roadmap, and locks it as the user's active goal.
    """
    return await breakdown_goal(data, current_user, authorization)

@app.post("/schedule")
async def schedule_tasks(data: dict, current_user: Any = Depends(get_current_user), authorization: Optional[str] = Header(None)):
    # Expected keys: calendar_events (list), start_date (optional ISO string)
    calendar_events = data.get("calendar_events", [])
    start_date = data.get("start_date")
    user_id = current_user.id
    
    supabase_client = get_supabase_client(authorization)
        
    # 1. Fetch user tasks and profile focus hours for active goal
    prof_res = supabase_client.table("profiles").select("daily_hours, last_active_goal_id").eq("id", user_id).maybe_single().execute()
    daily_hours = prof_res.data.get("daily_hours") if prof_res.data and prof_res.data.get("daily_hours") is not None else 2.0
    active_goal_id = prof_res.data.get("last_active_goal_id") if prof_res.data else None
    
    if active_goal_id:
        tasks_res = supabase_client.table("tasks").select("*").eq("user_id", user_id).eq("goal_id", active_goal_id).execute()
    else:
        tasks_res = supabase_client.table("tasks").select("*").eq("user_id", user_id).execute()
    
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
async def chat_coach(data: dict, current_user: Any = Depends(get_current_user), authorization: Optional[str] = Header(None)):
    # Expected keys: message, history
    message = data.get("message")
    history = data.get("history", [])
    
    if not message:
        raise HTTPException(status_code=400, detail="Missing message")
        
    supabase_client = get_supabase_client(authorization)
    user_id = current_user.id
        
    # Run the Focus Coach agent
    res = run_coach_chat(supabase_client, user_id, message, history)
    return res

class OnboardingCompletion(BaseModel):
    user_id: str
    full_name: str
    preferences: dict

@app.get("/google-login")
async def google_login(supabase_token: Optional[str] = None, user_id: Optional[str] = None):
    """
    Generates a Google authorization URL for the user to link their calendar.
    """
    if not supabase_token and not user_id:
        raise HTTPException(status_code=400, detail="Missing supabase_token or user_id query parameter.")
    
    target_user_id = user_id
    if supabase_token:
        try:
            admin_client = get_supabase_admin_client()
            user_res = admin_client.auth.get_user(supabase_token)
            if not user_res or not user_res.user:
                raise Exception("No user found for the provided supabase token.")
            target_user_id = user_res.user.id
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid supabase_token: {str(e)}")

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
        
        state_token = encrypt_data(target_user_id)
        
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
async def sync_goal_to_calendar(goal_id: str, current_user: Any = Depends(get_current_user), authorization: Optional[str] = Header(None)):
    """
    Schedules all pending subtasks of a goal into Google Calendar.
    """
    supabase_client = get_supabase_client(authorization)
    user_id = current_user.id
    
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
async def complete_onboarding(data: OnboardingCompletion, current_user: Any = Depends(get_current_user), authorization: Optional[str] = Header(None)):
    """
    Completes onboarding by updating user profile information.
    """
    supabase_client = get_supabase_client(authorization)
    user_id = current_user.id
        
    if user_id != data.user_id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot update another user's onboarding status")
        
    # Update profile table
    profile_data = {
        "display_name": data.full_name,
        "focus_area": data.preferences.get("focus_area", data.preferences.get("current_focus", "General")),
        "current_focus": data.preferences.get("focus_area", data.preferences.get("current_focus", "General")),
        "daily_hours": data.preferences.get("daily_hours"),
        "work_style": data.preferences.get("work_style", "Deep Work"),
        "user_level": data.preferences.get("user_level", "Beginner"),
        "persona_completed": True,
        "onboarding_completed": True
    }
    
    try:
        res = supabase_client.table("profiles").update(profile_data).eq("id", user_id).execute()
        return {"status": "success", "profile": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save onboarding data: {str(e)}")

@app.post("/onboarding-advice")
async def onboarding_advice(data: dict, current_user: Any = Depends(get_current_user), authorization: Optional[str] = Header(None)):
    """
    Generates strategic options/advice based on user vague goal and persona.
    """
    user_id = current_user.id
    supabase_client = get_supabase_client(authorization)
    
    try:
        profile_res = supabase_client.table("profiles").select("*").eq("id", user_id).maybe_single().execute()
        profile_data = profile_res.data if profile_res else {}
    except Exception as e:
        print("Failed to fetch profile for onboarding advice:", e)
        profile_data = {}
        
    goal = data.get("goal")
    hours = profile_data.get("daily_hours")
    if hours is None:
        hours = 2
    focus = profile_data.get("focus_area") or profile_data.get("current_focus") or "General"
    
    advice_payload = {
        "goal": goal,
        "hours": hours,
        "focus": focus
    }
    
    advice = get_onboarding_advice(advice_payload)
    return advice

@app.get("/user-goals")
async def get_user_goals(current_user: Any = Depends(get_current_user), authorization: Optional[str] = Header(None)):
    """
    Fetches all primary goals for the logged-in user.
    """
    user_id = current_user.id
    supabase_client = get_supabase_client(authorization)
    try:
        # Fetch from goals table first
        res = supabase_client.table("goals").select("*").eq("user_id", user_id).execute()
        if res.data:
            # Format to match expectations
            return [
                {
                    "id": g["id"],
                    "user_id": g["user_id"],
                    "title": g["title"],
                    "description": g.get("description", g["title"]),
                    "completed": g.get("status") == "completed",
                    "created_at": g["created_at"]
                }
                for g in res.data
            ]
    except Exception as e:
        print("Failed to fetch from goals table, trying fallback:", e)
        
    try:
        # Fallback to tasks table (is_goal = True in JSON description)
        res = supabase_client.table("tasks").select("*").eq("user_id", user_id).execute()
        tasks = res.data or []
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
                    "user_id": user_id,
                    "title": t["title"],
                    "description": notes,
                    "completed": t["completed"],
                    "created_at": t["created_at"]
                })
        return goals
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch goals: {str(e)}")

@app.get("/user-goals/{user_id}")
async def get_user_goals_legacy(user_id: str, current_user: Any = Depends(get_current_user), authorization: Optional[str] = Header(None)):
    """
    Legacy route compatibility wrapper.
    """
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot view another user's goals")
    return await get_user_goals(current_user, authorization)

@app.post("/check-missed-tasks")
async def check_missed_tasks(current_user: Any = Depends(get_current_user), authorization: Optional[str] = Header(None)):
    """
    Observer check to scan for tasks that are scheduled in the past but remain incomplete.
    """
    import pytz
    from datetime import datetime
    supabase_client = get_supabase_client(authorization)
    user_id = current_user.id
    
    try:
        res = supabase_client.table("tasks").select("*").eq("user_id", user_id).eq("completed", False).execute()
        tasks = res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")
        
    missed_tasks = []
    now_dt = datetime.now(pytz.utc)
    for t in tasks:
        # Exclude goals nodes
        try:
            desc_data = json.loads(t.get("description", "{}"))
        except Exception:
            desc_data = {}
        if desc_data.get("is_goal", False):
            continue
            
        sched_val = t.get("scheduled_at")
        if sched_val:
            try:
                sched_dt = datetime.fromisoformat(sched_val.replace("Z", "+00:00")).astimezone(pytz.utc)
                if sched_dt < now_dt:
                    missed_tasks.append(t)
            except Exception:
                continue
                
    return {
        "needs_rescheduling": len(missed_tasks) > 0,
        "missed_tasks_count": len(missed_tasks),
        "missed_tasks": missed_tasks
    }

@app.post("/reschedule-all")
async def reschedule_all_endpoint(current_user: Any = Depends(get_current_user), authorization: Optional[str] = Header(None)):
    """
    Triggers the smart rescheduler agent to reorganize overdue and upcoming tasks.
    """
    import pytz
    from datetime import datetime
    user_id = current_user.id
    supabase_client = get_supabase_client(authorization)
    
    try:
        prof_res = supabase_client.table("profiles").select("*").eq("id", user_id).maybe_single().execute()
        profile_data = prof_res.data if prof_res else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load profile details: {str(e)}")
        
    daily_hours = profile_data.get("daily_hours") or 2.0
    energy_level = profile_data.get("current_energy_level") or "medium"
    active_goal_id = profile_data.get("last_active_goal_id")
    
    try:
        busy_slots, user_tz = get_busy_times(user_id)
        formatted_busy = []
        for start_dt, end_dt in busy_slots:
            formatted_busy.append({
                "start": start_dt.isoformat(),
                "end": end_dt.isoformat()
            })
    except Exception:
        formatted_busy = []
        
    try:
        if active_goal_id:
            tasks_res = supabase_client.table("tasks").select("*").eq("user_id", user_id).eq("goal_id", active_goal_id).eq("completed", False).execute()
        else:
            tasks_res = supabase_client.table("tasks").select("*").eq("user_id", user_id).eq("completed", False).execute()
        tasks = tasks_res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tasks: {str(e)}")
        
    missed_tasks = []
    upcoming_tasks = []
    now_dt = datetime.now(pytz.utc)
    
    for t in tasks:
        try:
            desc_data = json.loads(t.get("description", "{}"))
        except Exception:
            desc_data = {}
        if desc_data.get("is_goal", False):
            continue
            
        sched_val = t.get("scheduled_at")
        if sched_val:
            try:
                sched_dt = datetime.fromisoformat(sched_val.replace("Z", "+00:00")).astimezone(pytz.utc)
                if sched_dt < now_dt:
                    missed_tasks.append(t)
                else:
                    upcoming_tasks.append(t)
            except Exception:
                upcoming_tasks.append(t)
        else:
            upcoming_tasks.append(t)
            
    if not missed_tasks and not upcoming_tasks:
        return {"status": "success", "message": "No tasks found to reschedule."}
        
    inputs = {
        "missed_tasks": missed_tasks,
        "upcoming_tasks": upcoming_tasks,
        "calendar_busy_slots": formatted_busy,
        "daily_hours": daily_hours,
        "energy_level": energy_level,
        "start_date": datetime.now().isoformat(),
        "execution_plan": []
    }
    
    from .agents.reschedule_agent import reschedule_agent
    try:
        res = reschedule_agent.invoke(inputs)
        plan = res.get("execution_plan", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rescheduling agent failed: {str(e)}")
        
    updated_count = 0
    for item in plan:
        tid = item.get("task_id")
        start_str = item.get("scheduled_start")
        end_str = item.get("scheduled_end")
        
        if not tid or not start_str or not end_str:
            continue
            
        orig_task = next((tk for tk in tasks if tk["id"] == tid), None)
        if not orig_task:
            continue
            
        try:
            desc_data = json.loads(orig_task.get("description", "{}"))
        except Exception:
            desc_data = {}
            
        desc_data["scheduled_start"] = start_str
        desc_data["scheduled_end"] = end_str
        
        prev_resched = orig_task.get("rescheduled_count") or 0
        orig_sched = orig_task.get("original_scheduled_at") or orig_task.get("scheduled_at")
        
        update_row = {
            "scheduled_at": start_str,
            "description": json.dumps(desc_data),
            "rescheduled_count": prev_resched + 1,
            "completion_status": "rescheduled"
        }
        if orig_sched:
            update_row["original_scheduled_at"] = orig_sched
            
        supabase_client.table("tasks").update(update_row).eq("id", tid).eq("user_id", user_id).execute()
        updated_count += 1
        
    try:
        admin_client = get_supabase_admin_client()
        admin_client.table("profiles").update({"last_sync_at": datetime.now().isoformat()}).eq("id", user_id).execute()
    except Exception as e:
        print("Failed to update last_sync_at:", e)
        
    return {
        "status": "success", 
        "message": f"Successfully rescheduled {updated_count} tasks.", 
        "execution_plan_count": len(plan)
    }

@app.post("/request-reschedule")
async def request_reschedule(data: dict = None, current_user: Any = Depends(get_current_user), authorization: Optional[str] = Header(None)):
    """
    Manual trigger for rescheduling when user clicks 'I'm feeling overwhelmed'.
    Can accept optional 'energy_level' parameter (defaulting to low).
    """
    user_id = current_user.id
    supabase_client = get_supabase_client(authorization)
    
    energy = (data or {}).get("energy_level", "low")
    
    try:
        supabase_client.table("profiles").update({"current_energy_level": energy}).eq("id", user_id).execute()
    except Exception as e:
        print("Failed to update profile energy level:", e)
        
    return await reschedule_all_endpoint(current_user, authorization)

@app.post("/reschedule-task/{task_id}")
async def reschedule_single_task(task_id: str, current_user: Any = Depends(get_current_user), authorization: Optional[str] = Header(None)):
    """
    Reschedules a single task by finding the next available slot in the user's calendar.
    """
    import pytz
    from datetime import datetime, timedelta
    supabase_client = get_supabase_client(authorization)
    user_id = current_user.id
    
    # 1. Fetch the task
    try:
        task_res = supabase_client.table("tasks").select("*").eq("id", task_id).eq("user_id", user_id).maybe_single().execute()
        task = task_res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch task: {str(e)}")
        
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    # 2. Fetch busy times and timezone
    try:
        busy_times, user_tz = get_busy_times(user_id)
    except Exception as e:
        # Fallback if calendar is not connected: use current time and find slot
        user_tz = pytz.utc
        busy_times = []
        
    # Determine task duration from effort (1-10)
    effort = task.get("effort", 2)
    duration_minutes = min(effort, 4) * 60
    
    # Find next free slot in calendar
    slot_start = find_next_free_slot(busy_times, duration_minutes, user_tz)
    
    # Update task in Supabase
    try:
        desc_raw = task.get("description")
        desc_data = {}
        if desc_raw:
            try:
                desc_data = json.loads(desc_raw)
            except Exception:
                desc_data = {"notes": desc_raw}
                
        slot_end = slot_start + timedelta(minutes=duration_minutes)
        desc_data["scheduled_start"] = slot_start.isoformat()
        desc_data["scheduled_end"] = slot_end.isoformat()
        
        prev_resched = task.get("rescheduled_count") or 0
        orig_sched = task.get("original_scheduled_at") or task.get("scheduled_at")
        
        update_row = {
            "scheduled_at": slot_start.isoformat(),
            "description": json.dumps(desc_data),
            "rescheduled_count": prev_resched + 1,
            "completion_status": "rescheduled"
        }
        if orig_sched:
            update_row["original_scheduled_at"] = orig_sched
            
        supabase_client.table("tasks").update(update_row).eq("id", task_id).eq("user_id", user_id).execute()
        
        return {"status": "success", "task_id": task_id, "scheduled_at": slot_start.isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reschedule task: {str(e)}")

@app.get("/calendar-timeline")
async def get_calendar_timeline(current_user: Any = Depends(get_current_user), authorization: Optional[str] = Header(None)):
    """
    Exposes user Google Calendar busy slots and scheduled tasks for timeline rendering.
    """
    import pytz
    from datetime import datetime, timedelta
    user_id = current_user.id
    supabase_client = get_supabase_client(authorization)
    
    # 1. Fetch busy slots from Google Calendar
    try:
        busy_slots, user_tz = get_busy_times(user_id)
        formatted_busy = []
        for start_dt, end_dt in busy_slots:
            formatted_busy.append({
                "title": "Google Calendar Busy",
                "start": start_dt.isoformat(),
                "end": end_dt.isoformat(),
                "is_busy": True
            })
    except Exception as e:
        print("Calendar sync error for timeline:", e)
        formatted_busy = []
        user_tz = pytz.utc
        
    # 2. Fetch user's scheduled tasks
    try:
        tasks_res = supabase_client.table("tasks").select("*").eq("user_id", user_id).eq("completed", False).execute()
        tasks = tasks_res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tasks: {str(e)}")
        
    formatted_tasks = []
    for t in tasks:
        # Check if task is scheduled
        sched_val = t.get("scheduled_at")
        if sched_val:
            try:
                # Effort defines duration (effort * 60 minutes)
                effort = t.get("effort", 2)
                duration_minutes = min(effort, 4) * 60
                
                # We can construct end time
                sched_dt = datetime.fromisoformat(sched_val.replace("Z", "+00:00"))
                end_dt = sched_dt + timedelta(minutes=duration_minutes)
                
                formatted_tasks.append({
                    "id": t["id"],
                    "title": t["title"],
                    "start": sched_dt.isoformat(),
                    "end": end_dt.isoformat(),
                    "duration": duration_minutes,
                    "is_busy": False,
                    "priority": t.get("priority", "medium")
                })
            except Exception:
                continue
                
    # Combine and sort all items by start time
    timeline_items = formatted_busy + formatted_tasks
    timeline_items.sort(key=lambda x: x["start"])
    
    return {
        "timezone": str(user_tz),
        "timeline": timeline_items
    }

class ManualOverrideRequest(BaseModel):
    task_id: str
    new_column: str

@app.post("/manual-override")
async def manual_override(data: ManualOverrideRequest, current_user: Any = Depends(get_current_user), authorization: Optional[str] = Header(None)):
    """
    Handles Kanban drag-and-drop overrides. Updates status, sets priority to 10 for in_progress, 
    and triggers reschedule.
    """
    user_id = current_user.id
    supabase_client = get_supabase_client(authorization)
    
    task_id = data.task_id
    new_column = data.new_column # 'backlog' | 'todo' | 'in_progress' | 'completed'
    
    # 1. Fetch the task
    try:
        task_res = supabase_client.table("tasks").select("*").eq("id", task_id).eq("user_id", user_id).maybe_single().execute()
        task = task_res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch task: {str(e)}")
        
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    # 2. Map columns to database fields
    update_row = {}
    if new_column == "completed":
        update_row["completed"] = True
        update_row["completion_status"] = "completed"
    elif new_column == "in_progress":
        update_row["completed"] = False
        update_row["completion_status"] = "in_progress"
        update_row["priority_score"] = 10
        
        # Schedule immediately starting from now
        import pytz
        from datetime import datetime, timedelta
        try:
            # Fetch timezone
            busy_times, user_tz = get_busy_times(user_id)
        except Exception:
            user_tz = pytz.utc
            
        now_tz = datetime.now(user_tz)
        update_row["scheduled_at"] = now_tz.isoformat()
        
        # Also update scheduled start and end in description JSON
        try:
            desc_raw = task.get("description")
            desc_data = json.loads(desc_raw) if desc_raw else {}
        except Exception:
            desc_data = {"notes": task.get("description") or ""}
            
        effort = task.get("effort", 2)
        duration_minutes = min(effort, 4) * 60
        end_tz = now_tz + timedelta(minutes=duration_minutes)
        
        desc_data["scheduled_start"] = now_tz.isoformat()
        desc_data["scheduled_end"] = end_tz.isoformat()
        update_row["description"] = json.dumps(desc_data)
        
    elif new_column == "todo":
        update_row["completed"] = False
        update_row["completion_status"] = "pending"
        update_row["priority_score"] = 5
    elif new_column == "backlog":
        update_row["completed"] = False
        update_row["completion_status"] = "backlog"
        update_row["scheduled_at"] = None
        
        try:
            desc_raw = task.get("description")
            desc_data = json.loads(desc_raw) if desc_raw else {}
        except Exception:
            desc_data = {"notes": task.get("description") or ""}
            
        desc_data["scheduled_start"] = None
        desc_data["scheduled_end"] = None
        update_row["description"] = json.dumps(desc_data)
        
    # 3. Update the task
    try:
        supabase_client.table("tasks").update(update_row).eq("id", task_id).eq("user_id", user_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update task: {str(e)}")
        
    # 4. Trigger auto-reschedule
    try:
        # Re-run schedule algorithm for all tasks around this manual choice
        await reschedule_all_endpoint(current_user, authorization)
    except Exception as e:
        print("Failed to auto-reschedule after manual override:", e)
        
    return {
        "status": "success",
        "message": f"Task updated to {new_column} and reschedule triggered."
    }
