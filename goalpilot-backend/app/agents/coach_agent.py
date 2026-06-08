import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
from langchain_core.tools import tool
from supabase import Client

def run_coach_chat(supabase_client: Client, user_id: str, message: str, history: list) -> dict:
    """
    Runs a single turn of the conversational focus coach.
    Modifies the DB tasks as requested via LLM tool-calling.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"content": "Error: GEMINI_API_KEY not configured on the backend."}

    # Define tools within context so they access supabase_client and user_id directly
    @tool
    def list_tasks() -> str:
        """Lists all goals and tasks currently defined for the user."""
        try:
            res = supabase_client.table("tasks").select("*").eq("user_id", user_id).order("created_at").execute()
            return json.dumps(res.data)
        except Exception as e:
            return f"Error listing tasks: {str(e)}"

    @tool
    def add_task(title: str, description: str, priority: str, effort: int, depends_on_id: str = None) -> str:
        """Adds a new task for the user. priority must be 'low', 'medium', 'high', or 'critical'."""
        try:
            dep = depends_on_id if depends_on_id else None
            
            # Metadata serialization
            desc_json = json.dumps({
                "notes": description,
                "is_goal": False,
                "scheduled_start": None,
                "scheduled_end": None
            })
            
            row = {
                "user_id": user_id,
                "title": title,
                "description": desc_json,
                "priority": priority.lower() if priority.lower() in ["low", "medium", "high", "critical"] else "medium",
                "effort": max(1, min(10, effort)),
                "depends_on": dep,
                "completed": False
            }
            res = supabase_client.table("tasks").insert(row).execute()
            return f"Task added successfully: {json.dumps(res.data)}"
        except Exception as e:
            return f"Error adding task: {str(e)}"

    @tool
    def complete_task(task_id: str) -> str:
        """Marks a specific task (by its UUID id) as completed."""
        try:
            res = supabase_client.table("tasks").update({"completed": True}).eq("id", task_id).eq("user_id", user_id).execute()
            return f"Task completed successfully: {json.dumps(res.data)}"
        except Exception as e:
            return f"Error completing task: {str(e)}"

    @tool
    def reschedule_all() -> str:
        """Triggers a rescheduling of all uncompleted tasks based on availability."""
        try:
            # Fetch tasks
            tasks_res = supabase_client.table("tasks").select("*").eq("user_id", user_id).execute()
            # Fetch profile
            prof_res = supabase_client.table("profiles").select("daily_hours").eq("id", user_id).maybeSingle().execute()
            daily_hours = prof_res.data.get("daily_hours", 2) if prof_res.data else 2
            
            from app.utils.scheduler import schedule_user_tasks
            scheduled = schedule_user_tasks(tasks_res.data, daily_hours, [])
            
            # Save back to database
            for t in scheduled:
                supabase_client.table("tasks").update({"description": t["description"]}).eq("id", t["id"]).eq("user_id", user_id).execute()
                
            return "Rescheduled all uncompleted tasks successfully."
        except Exception as e:
            return f"Error rescheduling: {str(e)}"

    # Set up LLM and bind tools
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=api_key
    )
    
    tools = [list_tasks, add_task, complete_task, reschedule_all]
    llm_with_tools = llm.bind_tools(tools)
    
    # Build history messages
    messages = [
        SystemMessage(content="""You are the GoalPilot Focus Coach, a friendly, encouraging executive coach.
        You help the user manage their tasks, goals, and calendar.
        Use your tools to query the tasks list, add new tasks, mark tasks as completed, or reschedule.
        If a user asks to reschedule, ALWAYS run the reschedule_all tool.
        Always explain what actions you've taken clearly and suggest the next best step for them.
        Keep responses professional and coaching-oriented. Keep formatting clean and concise. Do not use verbose wording.""")
    ]
    
    for h in history:
        role = h.get("role")
        content = h.get("content")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))
            
    messages.append(HumanMessage(content=message))
    
    try:
        # First LLM call
        ai_response = llm_with_tools.invoke(messages)
        
        # Tool call loop
        tool_calls = ai_response.tool_calls
        if tool_calls:
            messages.append(ai_response)
            for tc in tool_calls:
                tool_name = tc["name"]
                tool_args = tc["args"]
                tool_id = tc["id"]
                
                tool_fn = {
                    "list_tasks": list_tasks,
                    "add_task": add_task,
                    "complete_task": complete_task,
                    "reschedule_all": reschedule_all
                }.get(tool_name)
                
                if tool_fn:
                    tool_result = tool_fn.invoke(tool_args)
                    messages.append(ToolMessage(content=tool_result, tool_call_id=tool_id))
                    
            # Run final response generation
            ai_response = llm.invoke(messages)
            
        return {"content": ai_response.content}
    except Exception as e:
        return {"content": f"Coach Chat Error: {str(e)}"}
