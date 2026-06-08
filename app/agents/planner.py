import os
import json
from typing import TypedDict, List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END

# Initialize Gemini
llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", google_api_key=os.getenv("GEMINI_API_KEY"))

# 1. Define the "State" (What the agent remembers)
class GraphState(TypedDict):
    goal: str
    user_context: dict
    tasks: List[dict]

# 2. Define the "Node" (The thinking process)
def decomposition_node(state: GraphState):
    prompt = f"""
    User Goal: {state['goal']}
    Context: {state['user_context']}
    
    Break this goal into 5-8 actionable tasks. 
    Crucially, define dependencies. If Task B cannot be done without Task A, mark Task A as the parent.
    
    Return ONLY a JSON list of objects:
    [
      {{"id": "1", "title": "...", "priority": "High", "effort": "2h", "depends_on": null}},
      {{"id": "2", "title": "...", "priority": "Medium", "effort": "3h", "depends_on": "1"}}
    ]
    """
    
    response = llm.invoke(prompt)
    # Clean the output to ensure it's valid JSON
    raw_content = response.content.replace('```json', '').replace('```', '').strip()
    tasks = json.loads(raw_content)
    
    return {"tasks": tasks}

# 3. Build the Graph structure
workflow = StateGraph(GraphState)
workflow.add_node("decompose", decomposition_node)
workflow.set_entry_point("decompose")
workflow.add_edge("decompose", END)

# Compile the agent
planner_agent = workflow.compile()