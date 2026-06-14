import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KanbanSquare, Sparkles, Loader2, AlertCircle, Calendar, Plus, Target, CheckCircle2, ChevronRight, BarChart } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { userState, useUserState } from "@/lib/userState";
import { getApiUrl } from "@/lib/api-config";

export const Route = createFileRoute("/_authenticated/kanban")({
  component: KanbanBoardPage,
});

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "critical";
  effort: number;
  completed: boolean;
  completion_status: string | null;
  goal_id: string | null;
};

type ColumnId = "backlog" | "todo" | "in_progress" | "completed";

interface Column {
  id: ColumnId;
  title: string;
  description: string;
  color: string;
}

const COLUMNS: Column[] = [
  { id: "backlog", title: "Backlog", description: "Milestones to tackle later", color: "border-slate-800 bg-slate-900/10 text-slate-400" },
  { id: "todo", title: "To Do", description: "Ready for scheduling", color: "border-primary/20 bg-primary/5 text-primary-glow" },
  { id: "in_progress", title: "In Progress", description: "Currently running slots", color: "border-yellow-500/20 bg-yellow-500/5 text-yellow-400" },
  { id: "completed", title: "Completed", description: "Mission milestones met", color: "border-green-500/20 bg-green-500/5 text-green-400" },
];

function parseDesc(descStr: string | null) {
  try {
    const data = JSON.parse(descStr || "{}");
    return {
      notes: data.notes || descStr || "",
      is_goal: !!data.is_goal,
    };
  } catch (e) {
    return {
      notes: descStr || "",
      is_goal: false,
    };
  }
}

function KanbanBoardPage() {
  const { activeGoalId } = useUserState();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<ColumnId | null>(null);

  const loadGoals = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl("user-goals"), {
        headers: userState.getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to fetch goals");
      const data = await res.json();
      setGoals(data);
    } catch (e) {
      console.error(e);
      toast.error("Could not fetch goals list.");
    }
  }, []);

  const loadTasks = useCallback(async () => {
    if (!activeGoalId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 1. Load active goal info
      const { data: goalData } = await supabase
        .from("goals")
        .select("*")
        .eq("id", activeGoalId)
        .maybeSingle();
      setSelectedGoal(goalData);

      // 2. Fetch tasks for this goal
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("id,title,description,priority,effort,completed,goal_id,completion_status")
        .eq("goal_id", activeGoalId)
        .order("created_at", { ascending: true });

      if (tasksError) throw tasksError;

      const parsedTasks: Task[] = (tasksData ?? []).map(t => {
        const parsed = parseDesc(t.description);
        return {
          ...t,
          description: parsed.notes,
          is_goal: parsed.is_goal
        } as any;
      }).filter((t: any) => !t.is_goal);

      setTasks(parsedTasks);
    } catch (err: any) {
      toast.error(err.message || "Failed to load Kanban tasks.");
    } finally {
      setLoading(false);
    }
  }, [activeGoalId]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks, activeGoalId]);

  // Group tasks by their Kanban column mapping
  const tasksByColumn = useMemo(() => {
    const map: Record<ColumnId, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      completed: [],
    };

    tasks.forEach(t => {
      if (t.completed) {
        map.completed.push(t);
      } else if (t.completion_status === "in_progress") {
        map.in_progress.push(t);
      } else if (t.completion_status === "backlog") {
        map.backlog.push(t);
      } else {
        map.todo.push(t);
      }
    });

    return map;
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: ColumnId) => {
    e.preventDefault();
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: ColumnId) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;

    // Check if task is already in target column
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let currentColumn: ColumnId = "todo";
    if (task.completed) currentColumn = "completed";
    else if (task.completion_status === "in_progress") currentColumn = "in_progress";
    else if (task.completion_status === "backlog") currentColumn = "backlog";

    if (currentColumn === targetColumn) return;

    // Trigger local update immediately (optimistic UI)
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completed: targetColumn === "completed",
          completion_status: targetColumn === "in_progress" ? "in_progress" : targetColumn === "backlog" ? "backlog" : "pending"
        };
      }
      return t;
    }));

    setUpdatingTaskId(taskId);
    const toastId = toast.loading("AI recalculating calendar blocks...");

    try {
      const res = await fetch(getApiUrl("manual-override"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders()
        },
        body: JSON.stringify({
          task_id: taskId,
          new_column: targetColumn
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Manual override failed.");
      }

      toast.success("Schedule reoptimized for override!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to complete manual override.", { id: toastId });
      // Revert tasks state on failure
      loadTasks();
    } finally {
      setUpdatingTaskId(null);
      loadTasks();
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col bg-slate-950 text-foreground">
          <header className="h-14 flex items-center gap-3 border-b border-border px-4 glass">
            <SidebarTrigger />
            <div className="flex items-center gap-2 text-sm">
              <KanbanSquare className="h-4 w-4 text-primary-glow" />
              <span className="font-medium">Kanban Board</span>
            </div>
            <div className="flex-1" />
          </header>

          <main className="flex-1 p-6 lg:p-10 flex flex-col overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary-glow" /> Dynamic Flight Plan
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                Active Mission: <span className="gradient-text">{selectedGoal?.title || "No Active Mission"}</span>
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Drag and drop milestones to re-prioritize. Tasks in **In Progress** are marked critical and scheduled immediately in Google Calendar.
              </p>
            </motion.div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary-glow mr-2" /> Loading Kanban Board...
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
                <KanbanSquare className="h-10 w-10 text-primary-glow opacity-60 mb-3" />
                <p className="max-w-sm">No tasks found for this mission. Go to Dashboard to create a roadmap.</p>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start flex-1">
                {COLUMNS.map(col => {
                  const colTasks = tasksByColumn[col.id];
                  const isDraggedOver = draggedOverColumn === col.id;

                  return (
                    <div
                      key={col.id}
                      onDragOver={(e) => handleDragOver(e, col.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, col.id)}
                      className={`flex flex-col h-full rounded-2xl border p-4 transition-all duration-300 min-h-[450px] ${col.color} ${
                        isDraggedOver ? "border-primary scale-[1.01] shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-slate-900/60" : ""
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                          {col.title}
                          <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-muted-foreground">
                            {colTasks.length}
                          </span>
                        </h3>
                      </div>
                      <p className="text-[10px] text-muted-foreground mb-4 font-normal tracking-wide">
                        {col.description}
                      </p>

                      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                        <AnimatePresence>
                          {colTasks.map(t => {
                            const isUpdating = updatingTaskId === t.id;

                            // Priority styling
                            let prioClass = "text-slate-400 bg-slate-500/10 border-slate-500/20";
                            if (t.priority === "critical" || t.priority === "high") {
                              prioClass = "text-red-400 bg-red-500/10 border-red-500/20";
                            } else if (t.priority === "medium") {
                              prioClass = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
                            }

                            return (
                              <motion.div
                                key={t.id}
                                draggable={!isUpdating}
                                onDragStart={(e) => handleDragStart(e, t.id)}
                                layoutId={t.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className={`p-4 rounded-xl border border-border bg-slate-950/60 hover:bg-slate-900 hover:border-slate-800 transition cursor-grab active:cursor-grabbing relative ${
                                  isUpdating ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                              >
                                {isUpdating && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 rounded-xl">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                  </div>
                                )}
                                <h4 className={`text-xs font-semibold leading-relaxed ${t.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                  {t.title}
                                </h4>
                                {t.description && (
                                  <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                                    {t.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
                                  <span className={`text-[8px] uppercase tracking-wider font-bold border px-1.5 py-0.5 rounded ${prioClass}`}>
                                    {t.priority}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground font-medium bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                    {t.effort} hrs effort
                                  </span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                        {colTasks.length === 0 && (
                          <div className="h-full flex items-center justify-center border border-dashed border-white/5 rounded-xl py-12 text-[10px] text-muted-foreground/60 select-none">
                            Drop tasks here
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
