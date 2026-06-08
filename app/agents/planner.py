import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
import json

# Initialize Gemini
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"))

def breakdown_goal_to_tasks(goal_text: str):
    system_prompt = (
        "You are an expert Project Manager Agent. "
        "Break down the user's goal into a logical list of tasks. "
        "For each task, provide: title, priority (High/Medium/Low), and effort_estimate. "
        "Return ONLY a JSON list of objects."
    )
    
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"My goal is: {goal_text}")
    ])
    
    # This cleans the AI response to make sure it's pure JSON
    content = response.content.replace('```json', '').replace('```', '').strip()
    return json.loads(content)