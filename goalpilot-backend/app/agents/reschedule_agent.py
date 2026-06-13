import os
import json
from datetime import datetime, timedelta, time
import pytz
from typing import List, Dict, Any, TypedDict
from langgraph.graph import StateGraph, END
from app.utils.llm_helper import invoke_llm_with_fallback
from langchain_core.messages import SystemMessage, HumanMessage

class RescheduleState(TypedDict):
    missed_tasks: List[Dict[str, Any]]
    upcoming_tasks: List[Dict[str, Any]]
    calendar_busy_slots: List[Dict[str, Any]]
    daily_hours: float
    energy_level: str
    start_date: str
    execution_plan: List[Dict[str, Any]]

def rescheduler_node(state: RescheduleState):
    """
    LLM Rescheduling Agent Node.
    Analyzes priorities, goals, energy level, and busy slots to compile a conflict-free execution plan.
    """
    missed = state.get("missed_tasks", [])
    upcoming = state.get("upcoming_tasks", [])
    busy = state.get("calendar_busy_slots", [])
    daily_hours = state.get("daily_hours", 2.0)
    energy = state.get("energy_level", "medium")
    start_date = state.get("start_date") or datetime.now().isoformat()
    
    # Format inputs for LLM prompt
    missed_text = json.dumps([
        {
            "id": t.get("id"),
            "title": t.get("title"),
            "priority": t.get("priority", "medium"),
            "effort": t.get("effort", 2),
            "priority_score": t.get("priority_score", 5),
            "original_scheduled_at": t.get("original_scheduled_at") or t.get("scheduled_at")
        } for t in missed
    ], indent=2)
    
    upcoming_text = json.dumps([
        {
            "id": t.get("id"),
            "title": t.get("title"),
            "priority": t.get("priority", "medium"),
            "effort": t.get("effort", 2),
            "priority_score": t.get("priority_score", 5),
            "scheduled_at": t.get("scheduled_at")
        } for t in upcoming
    ], indent=2)
    
    busy_text = json.dumps(busy, indent=2)
    
    prompt = f"""
    You are the Smart Rescheduling Agent for GoalPilot.
    
    Your task is to take a set of missed tasks (scheduled in the past, but not completed) and upcoming tasks, 
    and produce a conflict-free Execution Plan that maps them to new, non-overlapping timestamps.
    
    User Profile Context:
    - Daily Availability Quota: {daily_hours} hours/day (focus window starts at 09:00 AM local time daily)
    - Current Energy Level: {energy}
    - Current Time (Start of Plan): {start_date}
    
    Inputs:
    1. Missed Tasks (Needs rescheduling immediately):
    {missed_text}
    
    2. Upcoming/Unscheduled Tasks:
    {upcoming_text}
    
    3. Google Calendar Busy Slots (DO NOT schedule tasks during these intervals):
    {busy_text}
    
    Rescheduling Constraints & Rules:
    1. Focus Slot: Tasks must only be scheduled within the user's daily hours window (starts at 09:00 AM and lasts for {daily_hours} hours).
    2. Priority Sequencing: If a critical/high-priority task or missed task was delayed, move it to the earliest possible free slot. If multiple goals clash, prioritize by priority score (1-10) or priority level.
    3. Google Calendar: Check the Google Calendar busy slots. If a focus slot overlaps with a busy slot, shift the tasks so they fall outside busy slots or delay them to the next day.
    4. Non-overlapping: No two tasks can overlap.
    
    Return ONLY a JSON list of objects matching this exact format:
    [
      {{
        "task_id": "UUID",
        "scheduled_start": "ISO_DATETIME_STRING",
        "scheduled_end": "ISO_DATETIME_STRING"
      }},
      ...
    ]
    """
    
    try:
        response = invoke_llm_with_fallback([
            SystemMessage(content="You are the GoalPilot Rescheduling Advisor. You output ONLY valid JSON without markdown formatting."),
            HumanMessage(content=prompt)
        ])
        content = response.content.replace('```json', '').replace('```', '').strip()
        plan = json.loads(content)
        return {"execution_plan": plan}
    except Exception as e:
        print("LLM Reschedule Error:", e)
        return {"execution_plan": []}

def validator_node(state: RescheduleState):
    """
    Post-processing node to validate that the output execution plan 
    doesn't have overlapping timestamps.
    """
    plan = state.get("execution_plan", [])
    if not plan:
        return {"execution_plan": []}
    
    valid_plan = []
    for item in plan:
        if "task_id" in item and "scheduled_start" in item and "scheduled_end" in item:
            valid_plan.append(item)
            
    return {"execution_plan": valid_plan}

workflow = StateGraph(RescheduleState)
workflow.add_node("reschedule", rescheduler_node)
workflow.add_node("validate", validator_node)

workflow.set_entry_point("reschedule")
workflow.add_edge("reschedule", "validate")
workflow.add_edge("validate", END)

reschedule_agent = workflow.compile()
