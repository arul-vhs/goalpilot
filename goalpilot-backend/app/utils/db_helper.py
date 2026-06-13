import uuid
import json
from supabase import Client

def save_tasks_to_db(supabase_client: Client, user_id: str, big_goal_title: str, tasks: list):
    """
    Saves a generated list of tasks to Supabase, establishing dependencies.
    First, creates a "Goal" task that serves as the root node, and links all subtasks to it.
    Also inserts a record in public.goals table with the same goal_id.
    """
    # 1. Create a root Goal node
    goal_id = str(uuid.uuid4())
    
    try:
        goal_row_goals = {
            "id": goal_id,
            "user_id": user_id,
            "title": big_goal_title,
            "status": "pending"
        }
        supabase_client.table("goals").insert(goal_row_goals).execute()
    except Exception as e:
        print("Failed to insert into goals table, but proceeding:", e)

    goal_desc = json.dumps({
        "notes": f"Primary goal: {big_goal_title}",
        "is_goal": True,
        "scheduled_start": None,
        "scheduled_end": None
    })
    
    goal_row = {
        "id": goal_id,
        "user_id": user_id,
        "title": big_goal_title,
        "description": goal_desc,
        "priority": "critical",
        "effort": 5,
        "depends_on": None,
        "completed": False,
        "status": "pending",
        "goal_id": None
    }
    
    # 2. Map temp IDs from LLM to UUIDs
    id_map = {}
    for t in tasks:
        temp_id = str(t.get("id"))
        id_map[temp_id] = str(uuid.uuid4())
        
    to_insert = [goal_row]
    
    # 3. Prepare task rows
    for t in tasks:
        db_id = id_map[str(t["id"])]
        
        # Resolve depends_on
        dep_temp = t.get("depends_on")
        db_dep = id_map.get(str(dep_temp)) if dep_temp else goal_id  # default: depend on the root goal
        
        # Parse effort
        effort_val = t.get("effort", "3")
        if isinstance(effort_val, str):
            digits = "".join(filter(str.isdigit, effort_val))
            effort_int = int(digits) if digits else 3
        else:
            effort_int = int(effort_val)
        effort_int = max(1, min(10, effort_int))
        
        # Priority mapping
        pri = str(t.get("priority", "medium")).lower()
        if pri not in ["low", "medium", "high", "critical"]:
            pri = "medium"
            
        desc_json = json.dumps({
            "notes": t.get("description", t.get("title")),
            "is_goal": False,
            "scheduled_start": None,
            "scheduled_end": None
        })
        
        to_insert.append({
            "id": db_id,
            "user_id": user_id,
            "title": t["title"],
            "description": desc_json,
            "priority": pri,
            "effort": effort_int,
            "depends_on": db_dep,
            "completed": False,
            "status": "pending",
            "goal_id": goal_id
        })
        
    result = supabase_client.table("tasks").insert(to_insert).execute()
    return goal_id, result.data