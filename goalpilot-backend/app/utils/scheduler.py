from datetime import datetime, timedelta, time
import json
import pytz
from typing import List, Dict, Any

def schedule_user_tasks(
    tasks: List[Dict[str, Any]], 
    daily_hours: float, 
    calendar_events: List[Dict[str, Any]], 
    start_date_str: str = None
) -> List[Dict[str, Any]]:
    """
    Schedules tasks using topological sorting and available time slots.
    
    :param tasks: List of database task records.
    :param daily_hours: Number of daily focus hours (e.g. 2.0).
    :param calendar_events: List of busy periods, e.g. [{"start": "...", "end": "..."}].
    :param start_date_str: ISO string of when to start planning (default = today).
    """
    
    # 1. Parse start date (default to today, local time)
    local_tz = pytz.timezone("Asia/Kolkata")  # Matching local metadata timezone or fallback
    if start_date_str:
        start_dt = datetime.fromisoformat(start_date_str.replace("Z", "+00:00")).astimezone(local_tz)
    else:
        start_dt = datetime.now(local_tz)
    
    # 2. Parse calendar events into datetime ranges
    busy_intervals = []
    for ev in calendar_events:
        try:
            ev_start = datetime.fromisoformat(ev["start"].replace("Z", "+00:00")).astimezone(local_tz)
            ev_end = datetime.fromisoformat(ev["end"].replace("Z", "+00:00")).astimezone(local_tz)
            busy_intervals.append((ev_start, ev_end))
        except Exception:
            continue
            
    # Helper to check if a period overlaps with any busy calendar interval
    def get_overlap_duration(period_start: datetime, period_end: datetime) -> float:
        # returns total overlapping hours
        overlap = 0.0
        for b_start, b_end in busy_intervals:
            latest_start = max(period_start, b_start)
            earliest_end = min(period_end, b_end)
            if latest_start < earliest_end:
                overlap += (earliest_end - latest_start).total_seconds() / 3600.0
        return overlap

    # 3. Filter for pending tasks and goals
    pending_tasks = [t for t in tasks if not t.get("completed", False)]
    
    # Exclude root Goal nodes from active scheduling slots (we schedule their subtasks)
    # But wait, we can identify them by checking description
    run_tasks = []
    for t in pending_tasks:
        try:
            desc_data = json.loads(t.get("description", "{}"))
        except Exception:
            desc_data = {}
        if not desc_data.get("is_goal", False):
            run_tasks.append(t)
            
    # If no tasks to schedule, return empty
    if not run_tasks:
        return []

    # 4. Topological Sort with Priority Tie-breaking
    # depends_on represents the parent task (e.g., depends_on: A means this task runs AFTER A)
    # Build adjacency list
    adj = {t["id"]: [] for t in run_tasks}
    in_degree = {t["id"]: 0 for t in run_tasks}
    task_map = {t["id"]: t for t in run_tasks}
    
    for t in run_tasks:
        dep = t.get("depends_on")
        # Ensure dependency is in our set of pending tasks to schedule
        if dep and dep in task_map:
            adj[dep].append(t["id"])
            in_degree[t["id"]] += 1
            
    # Priority score mapping (critical=4, high=3, medium=2, low=1)
    priority_scores = {"critical": 4, "high": 3, "medium": 2, "low": 1}
    
    # Topological sort (Kahn's algorithm)
    # To prioritize high priority tasks, we pull from a sorted list
    queue = [tid for tid, deg in in_degree.items() if deg == 0]
    sorted_tids = []
    
    while queue:
        # Sort queue so that higher priority, then higher effort comes first
        queue.sort(key=lambda tid: (
            priority_scores.get(task_map[tid].get("priority", "medium"), 2),
            task_map[tid].get("effort", 1)
        ), reverse=True)
        
        curr_id = queue.pop(0)
        sorted_tids.append(curr_id)
        
        for neighbor in adj[curr_id]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
                
    # If circular dependencies (should not happen normally), append remaining
    for tid in task_map:
        if tid not in sorted_tids:
            sorted_tids.append(tid)

    # 5. Pack tasks into daily focus slots starting from start_dt
    scheduled_tasks = []
    current_day = start_dt.date()
    
    # Daily focus window starts at 09:00 AM local time
    focus_start_time = time(9, 0)
    
    # We walk through tasks in sorted order
    task_idx = 0
    while task_idx < len(sorted_tids):
        tid = sorted_tids[task_idx]
        task = task_map[tid]
        effort_hours = float(task.get("effort", 3)) # effort in hours
        
        # Find next available time block that fits the effort_hours
        task_scheduled = False
        attempts = 0
        while not task_scheduled and attempts < 100: # limit to avoid infinite loops
            # Define this day's focus window
            day_dt = datetime.combine(current_day, focus_start_time).replace(tzinfo=local_tz)
            focus_end = day_dt + timedelta(hours=daily_hours)
            
            # Check overlap with Google Calendar events
            overlap = get_overlap_duration(day_dt, focus_end)
            available_hours = daily_hours - overlap
            
            # If we have enough available time today, schedule it
            if available_hours >= 0.5:  # At least 30 mins available
                # Calculate scheduled interval. For simplicity, we schedule it during this focus window
                # Adjusting start/end times if calendar events clash is complex, so we simply shift
                # or fit in the window.
                # If there's an event clashing, we schedule around it or push to the next day if it's too full.
                if overlap > 0.3 * daily_hours: # if more than 30% is blocked, push to next day
                    current_day += timedelta(days=1)
                    attempts += 1
                    continue
                
                # Schedule task for today
                start_time = day_dt
                end_time = day_dt + timedelta(hours=effort_hours)
                
                # Update task description with schedule data
                try:
                    desc_data = json.loads(task.get("description", "{}"))
                except Exception:
                    desc_data = {}
                
                desc_data["scheduled_start"] = start_time.isoformat()
                desc_data["scheduled_end"] = end_time.isoformat()
                
                task["description"] = json.dumps(desc_data)
                scheduled_tasks.append(task)
                
                # Advance date for the next task (simple: one major task/milestone per slot)
                current_day += timedelta(days=1)
                task_scheduled = True
            else:
                # Calendar is completely blocked today, go to next day
                current_day += timedelta(days=1)
                
            attempts += 1
        
        task_idx += 1
        
    return scheduled_tasks
