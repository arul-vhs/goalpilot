import os
import json
from typing import TypedDict, List
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END

# 1. Define the "State"
class GraphState(TypedDict):
    goal: str
    user_context: dict
    tasks: List[dict]

# 2. Define the "Node"
def decomposition_node(state: GraphState):
    api_key = os.getenv("GEMINI_API_KEY")
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", 
        google_api_key=api_key
    )
    
    strategy = state['user_context'].get('strategy', 'balanced')
    clarifications = state['user_context'].get('clarifications', [])
    hours = state['user_context'].get('daily_hours', 2)
    focus = state['user_context'].get('current_focus', '')
    
    clarifications_text = "\n".join([f"Q: {c.get('q')}\nA: {c.get('a')}" for c in clarifications])
    
    prompt = f"""
    The user wants to achieve this goal: "{state['goal']}"
    User Profile:
    - Current focus/skills: "{focus}"
    - Daily commitment: {hours} hours
    - Selected Strategy: "{strategy}"
    
    Clarifying details gathered:
    {clarifications_text}
    
    Break this goal into 6 to 8 highly actionable tasks structured in a logical flow.
    Make sure some tasks depend on others (e.g. Task 2 depends on Task 1, Task 4 depends on Task 2 and 3) to form an interconnected graph.
    
    For each task, define:
    - id: A simple temp ID like "1", "2", "3"
    - title: Brief summary
    - description: Specific actions to perform
    - priority: "low", "medium", "high", or "critical"
    - effort: An integer between 1 and 10 representing estimated time/difficulty (where 1 = 1 hour, 10 = 10+ hours)
    - depends_on: The ID of a task it depends on, or null if it can start immediately.
    
    Return ONLY a JSON list of objects. Do not include markdown wraps.
    [
      {{"id": "1", "title": "...", "description": "...", "priority": "medium", "effort": 3, "depends_on": null}},
      ...
    ]
    """
    
    response = llm.invoke(prompt)
    raw_content = response.content.replace('```json', '').replace('```', '').strip()
    try:
        tasks = json.loads(raw_content)
    except Exception as e:
        # Fallback parsing in case model adds formatting
        tasks = []
        
    return {"tasks": tasks}

# 3. Build the Graph
workflow = StateGraph(GraphState)
workflow.add_node("decompose", decomposition_node)
workflow.set_entry_point("decompose")
workflow.add_edge("decompose", END)

planner_agent = workflow.compile()