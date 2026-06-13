import os
import json
from typing import TypedDict, List
from app.utils.llm_helper import invoke_llm_with_fallback
from langgraph.graph import StateGraph, END

# 1. Define the "State"
class GraphState(TypedDict):
    goal: str
    user_context: dict
    tasks: List[dict]

# 2. Define the "Node"
def decomposition_node(state: GraphState):
    strategy = state['user_context'].get('strategy', 'balanced')
    clarifications = state['user_context'].get('clarifications', [])
    
    persona = state['user_context'].get('persona', {})
    full_name = persona.get('full_name', 'User')
    focus_area = persona.get('focus_area', 'General')
    daily_hours = int(persona.get('daily_hours', 2))
    work_style = persona.get('work_style', 'Deep Work')
    user_level = persona.get('user_level', 'Beginner')
    
    clarifications_text = "\n".join([f"Q: {c.get('q')}\nA: {c.get('a')}" for c in clarifications])
    
    prompt = f"""
    You are the personal execution coach for {full_name}.
    User Persona:
    - Focus Area: {focus_area}
    - Available Time: {daily_hours} hours/day
    - Work Style: {work_style}
    - Experience Level: {user_level}
    
    The user's new goal is: "{state['goal']}"
    
    Selected Strategy: "{strategy}"
    
    Clarifying details gathered:
    {clarifications_text}
    
    Break this goal down into 6 to 8 highly actionable tasks structured in a logical flow.
    Make sure some tasks depend on others to form an interconnected graph.
    
    Crucial Persona Adaptation Rules:
    1. Smart Scaling: Since they only have {daily_hours} hours/day, no single task should have an effort greater than {daily_hours}. Split larger objectives into smaller, bite-sized tasks.
    2. Tone & Depth Matching: Since the user level is "{user_level}", explain the tasks and descriptions matching this level (e.g. if Beginner, explain concepts simply and avoid overly technical jargon; if Expert, focus on advanced details).
    
    For each task, define:
    - id: A simple temp ID like "1", "2", "3"
    - title: Brief summary
    - description: Specific actions to perform
    - priority: "low", "medium", "high", or "critical"
    - effort: An integer representing estimated time in hours. Because of the daily limit, effort MUST be between 1 and {daily_hours} (inclusive).
    - depends_on: The ID of a task it depends on, or null if it can start immediately.
    
    Return ONLY a JSON list of objects. Do not include markdown wraps.
    [
      {{"id": "1", "title": "...", "description": "...", "priority": "medium", "effort": {min(1, daily_hours)}, "depends_on": null}},
      ...
    ]
    """
    
    response = invoke_llm_with_fallback(prompt)
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