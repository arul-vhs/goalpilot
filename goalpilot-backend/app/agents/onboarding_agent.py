import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

def get_onboarding_advice(user_responses: dict) -> dict:
    """
    Analyzes the user's focus, hours, and big vague goal, and proposes 3 strategies.
    Returns a structured dict.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"error": "GEMINI_API_KEY not found."}

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", 
        google_api_key=api_key
    )
    
    prompt = f"""
    The user wants to achieve: "{user_responses.get('goal')}"
    Their daily available time: {user_responses.get('hours')} hours
    Their current focus/background: "{user_responses.get('focus')}"
    
    Act as a professional executive coach. Propose exactly 3 distinct strategies for them to achieve this goal:
    1. Strategy A: Aggressive Sprint (High intensity, fast milestones)
    2. Strategy B: Balanced & Steady (Sustainable daily habits, standard progression)
    3. Strategy C: Research & Skill-First (Focus on learning/auditing before building)

    Compare them based on their available time. Determine which strategy is best suited for them and explain why in the 'reasoning'.
    
    Return ONLY a JSON object in this exact format:
    {{
      "strategies": [
        {{
          "id": "aggressive",
          "name": "Aggressive Sprint",
          "description": "...",
          "duration": "e.g. 4 Weeks",
          "pros": ["...", "..."],
          "cons": ["...", "..."],
          "recommended": true/false
        }},
        ...
      ],
      "reasoning": "Detailed explanation of why the recommended strategy is best suited for their profile."
    }}
    """
    
    try:
        response = llm.invoke([
            SystemMessage(content="You are the GoalPilot Onboarding Consultant. You output ONLY valid, parsable JSON without markdown wrapper blocks."),
            HumanMessage(content=prompt)
        ])
        content = response.content.replace('```json', '').replace('```', '').strip()
        return json.loads(content)
    except Exception as e:
        return {"error": f"AI Strategy Error: {str(e)}"}

def get_clarifying_questions(goal: str, strategy_id: str) -> list:
    """
    Generates 3 highly specific clarifying questions based on the chosen goal and strategy.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return ["Error: GEMINI_API_KEY not found."]

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", 
        google_api_key=api_key
    )
    
    prompt = f"""
    User Goal: "{goal}"
    Selected Strategy: "{strategy_id}"
    
    As an AI coach, generate exactly 3 clarifying questions to help make a precise action plan.
    Avoid generic questions like "what is your goal?". Instead, make them highly specific to the combination of this goal and this strategy.
    
    Return ONLY a JSON list of strings:
    [
      "Question 1?",
      "Question 2?",
      "Question 3?"
    ]
    """
    
    try:
        response = llm.invoke([
            SystemMessage(content="You output ONLY valid, parsable JSON lists without markdown wrapper blocks."),
            HumanMessage(content=prompt)
        ])
        content = response.content.replace('```json', '').replace('```', '').strip()
        return json.loads(content)
    except Exception as e:
        return [f"AI Clarifying Error: {str(e)}"]