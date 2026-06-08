import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, Clock, Sparkles, ChevronRight, CheckCircle2, Circle, RefreshCw, Calendar } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Profile = {
  display_name: string | null;
  current_focus: string | null;
  daily_hours: number | null;
  big_goal: string | null;
  onboarding_completed: boolean;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "critical";
  effort: number;
  depends_on: string | null;
  completed: boolean;
  scheduled_start?: string;
  scheduled_end?: string;
};

function parseDesc(descStr: string | null) {
  try {
    const data = JSON.parse(descStr || "{}");
    return {
      notes: data.notes || descStr || "",
      is_goal: !!data.is_goal,
      scheduled_start: data.scheduled_start || null,
      scheduled_end: data.scheduled_end || null,
    };
  } catch (e) {
    return {
      notes: descStr || "",
      is_goal: false,
      scheduled_start: null,
      scheduled_end: null,
    };
  }
}

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [reoptimizing, setReoptimizing] = useState(false);

  const loadProfileAndTasks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Fetch Profile
      const { data: profData } = await supabase
        .from("profiles")
        .select("display_name,current_focus,daily_hours,big_goal,onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (!profData || !profData.onboarding_completed) {
        navigate({ to: "/onboarding" });
        return;
      }
      setProfile(profData as Profile);

      // Fetch Tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("id,title,description,priority,effort,depends_on,completed")
        .order("created_at", { ascending: true });

      if (tasksError) throw tasksError;

      const parsedTasks: Task[] = (tasksData ?? []).map(t => {
        const parsed = parseDesc(t.description);
        return {
          ...t,
          description: parsed.notes,
          scheduled_start: parsed.scheduled_start,
          scheduled_end: parsed.scheduled_end,
          is_goal: parsed.is_goal
        } as any;
      });

      // Filter out top-level goal from milestones list
      setTasks(parsedTasks);
    } catch (err: any) {
      toast.error(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfileAndTasks();
  }, [loadProfileAndTasks]);

  // Separate goals and tasks
  const milestones = useMemo(() => {
    return tasks.filter((t: any) => !t.is_goal);
  }, [tasks]);

  const completedCount = useMemo(() => {
    return milestones.filter(t => t.completed).length;
  }, [milestones]);

  const progressPercent = useMemo(() => {
    if (milestones.length === 0) return 0;
    return Math.round((completedCount / milestones.length) * 100);
  }, [milestones, completedCount]);

  const handleToggleTask = async (task: Task) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", task.id);

      if (error) throw error;
      toast.success(task.completed ? "Task set to pending." : "Task completed!");
      await loadProfileAndTasks();
    } catch (e: any) {
      toast.error(e.message || "Failed to update task.");
    }
  };

  const handleReschedule = async () => {
    setReoptimizing(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch("http://localhost:8000/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ calendar_events: [] })
      });

      if (!res.ok) throw new Error("Optimization failed.");
      toast.success("Schedule optimized successfully!");
      await loadProfileAndTasks();
    } catch (e: any) {
      toast.error(e.message || "Could not reschedule.");
    } finally {
      setReoptimizing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary-glow" /> Loading dashboard...
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-3 border-b border-border px-4 glass">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="text-sm text-muted-foreground">
              Pilot: <span className="text-foreground font-medium">{profile?.display_name ?? "Guest"}</span>
            </div>
          </header>
          <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary-glow" /> Mission control
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight leading-tight">
                Your target goal: <span className="gradient-text">{profile?.big_goal}</span>
              </h1>
              <p className="mt-2 text-muted-foreground">
                Current focus: <span className="text-foreground font-medium">{profile?.current_focus}</span> · Working {profile?.daily_hours}h/day
              </p>
            </motion.div>

            {/* Stats */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { label: "Daily limit", value: `${profile?.daily_hours ?? 0}h`, icon: Clock },
                { label: "Milestones", value: `${completedCount}/${milestones.length}`, icon: Target },
                { label: "Progress completion", value: `${progressPercent}%`, icon: TrendingUp },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                  className="glass rounded-2xl p-5 border border-border bg-background/25"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <s.icon className="h-4 w-4 text-primary-glow" />
                  </div>
                  <div className="mt-2 text-3xl font-semibold">{s.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Goal Breakdown Checklist */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 glass-strong border border-border rounded-2xl p-6 lg:p-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Active Roadmap</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Action items generated and sequenced by GoalPilot AI.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={reoptimizing}
                  onClick={handleReschedule}
                  className="border-border bg-white/5 hover:bg-white/10 gap-1.5"
                >
                  {reoptimizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Optimize Schedule
                </Button>
              </div>

              {milestones.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No active roadmap tasks. Please visit the Knowledge Graph to add tasks.
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {milestones.map((m, i) => {
                    const scheduledText = m.scheduled_start 
                      ? format(parseISO(m.scheduled_start), "MMM d, hh:mm a")
                      : "Unscheduled";

                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.06 }}
                        className="group flex items-center gap-4 rounded-xl border border-border bg-background/30 p-4 hover:bg-background/50 transition cursor-pointer"
                        onClick={() => handleToggleTask(m)}
                      >
                        {m.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary-glow" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>Step {i + 1}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5 text-primary-glow" /> {scheduledText}
                            </span>
                            <span>·</span>
                            <span className="uppercase text-[9px] font-semibold">{m.priority} priority</span>
                          </div>
                          <div className={`mt-1 font-medium truncate ${m.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {m.title}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition shrink-0" />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.section>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
