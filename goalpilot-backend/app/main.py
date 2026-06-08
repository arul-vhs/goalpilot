import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any

from .agents.onboarding_agent import get_onboarding_advice, get_clarifying_questions
from .agents.planner_agent import planner_agent
from .agents.coach_agent import run_coach_chat
from .utils.db_helper import save_tasks_to_db
from .utils.supabase_client import get_supabase_client
from .utils.scheduler import schedule_user_tasks

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
async def start_consultation(data: dict):
    # Expected keys: goal, hours, focus
    advice = get_onboarding_advice(data)
    return {"advice": advice}

@app.post("/clarifying-questions")
async def clarify(data: dict):
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