import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

def get_onboarding_advice(user_responses: dict):
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        return "Error: Backend could not find GEMINI_API_KEY."

    # CHANGED: Model updated to Gemma 2 27B
    llm = ChatGoogleGenerativeAI(
        model="gemma-2-27b-it", 
        google_api_key=api_key
    )
    
    prompt = f"""
    The user wants to achieve: {user_responses.get('goal')}
    Their available time: {user_responses.get('hours')}
    Their focus: {user_responses.get('focus')}
    
    Act as a professional executive coach. 
    Analyze which strategy is best for them and explain why.
    Suggest a first major milestone.
    """
    
    try:
        response = llm.invoke([
            SystemMessage(content="You are the GoalPilot Onboarding Consultant."),
            HumanMessage(content=prompt)
        ])
        return response.content
    except Exception as e:
        return f"AI Error: {str(e)}"