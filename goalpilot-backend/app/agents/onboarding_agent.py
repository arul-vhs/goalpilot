import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

# Load Gemini
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"))

def get_onboarding_advice(user_responses: dict):
    """
    This function takes the user's onboarding answers and 
    returns a professional recommendation.
    """
    prompt = f"""
    The user wants to achieve: {user_responses.get('goal')}
    Their available time: {user_responses.get('time_commitment')}
    Their background: {user_responses.get('focus_area')}
    
    Act as a high-level executive coach. 
    1. Analyze which strategy is best for them.
    2. Explain WHY it is best.
    3. Suggest a first major milestone.
    Keep the tone professional, encouraging, and brief.
    """
    
    response = llm.invoke([
        SystemMessage(content="You are the GoalPilot Onboarding Consultant."),
        HumanMessage(content=prompt)
    ])
    
    return response.content