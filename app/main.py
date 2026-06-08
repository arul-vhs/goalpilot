import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from supabase import create_client, Client

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