from typing import TypedDict, List
from langgraph.graph import StateGraph, END

# This defines what the agent "remembers" during a session
class AgentState(TypedDict):
    goal: str
    user_context: dict
    tasks: List[dict]
    clashes: List[dict]

def analyze_goal_node(state: AgentState):
    # Here Gemini will break down the goal
    # We will add the actual Gemini prompt in the next step
    return {"tasks": [{"id": "t1", "name": "Initial Research"}]}

def check_calendar_clashes(state: AgentState):
    # Logic to check Google Calendar
    return {"clashes": []}

# Build the Graph
workflow = StateGraph(AgentState)
workflow.add_node("analyze", analyze_goal_node)
workflow.add_node("check_calendar", check_calendar_clashes)

workflow.set_entry_point("analyze")
workflow.add_edge("analyze", "check_calendar")
workflow.add_edge("check_calendar", END)

smart_agent = workflow.compile()