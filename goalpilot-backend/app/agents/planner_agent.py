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

# 2. Define the "Node" (Move the LLM inside here!)
def decomposition_node(state: GraphState):
    api_key = os.getenv("GEMINI_API_KEY")
    
    # Initialize LLM only when this node is executed
    llm = ChatGoogleGenerativeAI(
        model="gemma-2-27b-it", 
        google_api_key=api_key
    )
    
    prompt = f"""
    User Goal: {state['goal']}
    Context: {state['user_context']}
    
    Break this goal into 5 actionable tasks. 
    Define dependencies: If Task B needs Task A, set "depends_on": "ID of Task A".
    
    Return ONLY a JSON list:
    [
      {{"id": "1", "title": "...", "priority": "High", "effort": "2h", "depends_on": null}},
      ...
    ]
    """
    
    response = llm.invoke(prompt)
    raw_content = response.content.replace('```json', '').replace('```', '').strip()
    tasks = json.loads(raw_content)
    
    return {"tasks": tasks}

# 3. Build the Graph
workflow = StateGraph(GraphState)
workflow.add_node("decompose", decomposition_node)
workflow.set_entry_point("decompose")
workflow.add_edge("decompose", END)

planner_agent = workflow.compile()