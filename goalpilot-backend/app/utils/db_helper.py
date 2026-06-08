from supabase import create_client
import os

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def save_tasks_to_db(user_id: str, goal_id: str, tasks: list):
    """
    Saves tasks to Supabase. Each task is linked to a User and a Goal.
    """
    to_insert = []
    for task in tasks:
        to_insert.append({
            "user_id": user_id,
            "goal_id": goal_id,
            "title": task['title'],
            "priority": task['priority'],
            "effort_estimate": task['effort'],
            "status": "pending"
            # In a real app, we would map dependencies here too
        })
    
    result = supabase.table("tasks").insert(to_insert).execute()
    return result.data