import os
import json
from app.utils.llm_helper import invoke_llm_with_fallback
from langchain_core.messages import SystemMessage, HumanMessage

def get_onboarding_advice(user_responses: dict) -> dict:
    """
    Analyzes the user's focus, hours, and big vague goal, and proposes 3 strategies.
    Returns a structured dict.
    """
    prompt = f"""
    The user wants to achieve: "{user_responses.get('goal')}"
    Their daily available time: {user_responses.get('hours')} hours
    Their current focus/background: "{user_responses.get('focus')}"
    
    Act as a professional executive coach. Propose exactly 3 distinct strategies for them to achieve this goal:
    1. Fast: Aggressive sprint, high intensity, rapid milestone achievements.
    2. Balanced: Steady and sustainable progression with consistent habits.
    3. Lean: Minimizing resource usage, focusing on research and validation first.

    Compare them based on their available time. Determine which strategy is best suited for them and explain why in the 'reasoning'.
    
    Return ONLY a JSON object in this exact format:
    {{
      "strategies": [
        {{
          "id": "fast",
          "name": "Fast",
          "description": "...",
          "duration": "e.g. 4 Weeks",
          "pros": ["...", "..."],
          "cons": ["...", "..."],
          "recommended": true/false
        }},
        {{
          "id": "balanced",
          "name": "Balanced",
          "description": "...",
          "duration": "e.g. 8 Weeks",
          "pros": ["...", "..."],
          "cons": ["...", "..."],
          "recommended": true/false
        }},
        {{
          "id": "lean",
          "name": "Lean",
          "description": "...",
          "duration": "e.g. 12 Weeks",
          "pros": ["...", "..."],
          "cons": ["...", "..."],
          "recommended": true/false
        }}
      ],
      "reasoning": "Detailed explanation of why the recommended strategy is best suited for their profile."
    }}
    """
    
    try:
        response = invoke_llm_with_fallback([
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
        response = invoke_llm_with_fallback([
            SystemMessage(content="You output ONLY valid, parsable JSON lists without markdown wrapper blocks."),
            HumanMessage(content=prompt)
        ])
        content = response.content.replace('```json', '').replace('```', '').strip()
        return json.loads(content)
    except Exception as e:
        return [f"AI Clarifying Error: {str(e)}"]