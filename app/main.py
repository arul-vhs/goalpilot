import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from supabase import create_client, Client
from .agents.onboarding_agent import get_onboarding_advice
from .agents.planner_agent import planner_agent
from .utils.db_helper import save_tasks_to_db

load_dotenv()

app = FastAPI(title="GoalPilot API")

# Connect to Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# CORS allows Lovable (Frontend) to talk to this Python code
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

# This will be the endpoint for our AI Onboarding Agent
@app.post("/onboarding")
async def start_onboarding(user_id: str, goals: str):
    # We will add Gemini logic here in the next step
    return {"status": "Onboarding initiated", "user": user_id}

@app.post("/consultation")
async def get_consult(data: dict):
    # 'data' will come from the Lovable frontend
    advice = get_onboarding_advice(data)
    return {"advice": advice}

@app.post("/breakdown-goal")
async def breakdown_goal(data: dict):
    # Data expected: { "goal": "Build a startup", "user_id": "...", "context": {...} }
    
    # 1. Run the LangGraph Agent
    inputs = {"goal": data['goal'], "user_context": data.get('context', {}), "tasks": []}
    result = planner_agent.invoke(inputs)
    
    # 2. Save a "Goal" record first (Simplified for now)
    # goal_record = supabase.table("goals").insert({"user_id": data['user_id'], "title": data['goal']}).execute()
    
    # 3. Return the tasks to the frontend immediately
    return {"tasks": result['tasks']}