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
import { userState } from "@/lib/userState";

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
  const [goals, setGoals] = useState<any[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [reoptimizing, setReoptimizing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState("00h 00m 00s");

  const loadGoals = useCallback(async () => {
    try {
      const userId = userState.userId;
      if (!userId) return;
      const res = await fetch(`http://localhost:8000/user-goals/${userId}`, {
        headers: userState.getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to fetch goals");
      const data = await res.json();
      setGoals(data);
      
      if (data.length > 0) {
        setSelectedGoal((prev: any) => {
          if (prev && data.some((g: any) => g.id === prev.id)) {
            return data.find((g: any) => g.id === prev.id);
          }
          return data[0];
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not fetch goals list.");
    }
  }, []);

  const loadProfileAndTasks = useCallback(async () => {
    try {
      const userId = userState.userId;
      if (!userId) return;

      // Fetch Profile
      const { data: profData } = await supabase
        .from("profiles")
        .select("display_name,current_focus,daily_hours,big_goal,onboarding_completed")
        .eq("id", userId)
        .maybeSingle();

      if (!profData || !profData.onboarding_completed) {
        navigate({ to: "/onboarding" });
        return;
      }
      setProfile(profData as Profile);

      // Load goals from API
      await loadGoals();

      // Fetch Tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("id,title,description,priority,effort,depends_on,completed,goal_id")
        .order("created_at", { ascending: true });

      if (tasksError) throw tasksError;

      const parsedTasks: Task[] = (tasksData ?? []).map(t => {
        const parsed = parseDesc(t.description);
        return {
          ...t,
          description: parsed.notes,
          scheduled_start: parsed.scheduled_start,
          scheduled_end: parsed.scheduled_end,
          is_goal: parsed.is_goal,
          goal_id: t.goal_id
        } as any;
      });

      setTasks(parsedTasks);
    } catch (err: any) {
      toast.error(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [navigate, loadGoals]);

  useEffect(() => {
    if (!profile?.daily_hours) {
      setTimeLeftStr("00h 00m 00s");
      return;
    }
    const updateCountdown = () => {
      const now = new Date();
      const localH = now.getHours();
      const localM = now.getMinutes();
      const localS = now.getSeconds();
      
      const dailyHours = profile.daily_hours || 2;
      
      // Focus window starts at 09:00 AM local time
      const startHour = 9;
      const endHour = startHour + dailyHours;
      
      const currentTimeInHours = localH + localM / 60 + localS / 3600;
      
      const pad = (num: number) => String(num).padStart(2, "0");

      if (currentTimeInHours < startHour) {
        // Before focus window starts
        const diffHrs = startHour - currentTimeInHours;
        const h = Math.floor(diffHrs);
        const m = Math.floor((diffHrs - h) * 60);
        const s = Math.floor(((diffHrs - h) * 60 - m) * 60);
        setTimeLeftStr(`${pad(h)}h ${pad(m)}m ${pad(s)}s (Starts 9 AM)`);
      } else if (currentTimeInHours >= startHour && currentTimeInHours < endHour) {
        // Inside focus window
        const diffHrs = endHour - currentTimeInHours;
        const h = Math.floor(diffHrs);
        const m = Math.floor((diffHrs - h) * 60);
        const s = Math.floor(((diffHrs - h) * 60 - m) * 60);
        setTimeLeftStr(`${pad(h)}h ${pad(m)}m ${pad(s)}s left`);
      } else {
        // After focus window
        setTimeLeftStr("00h 00m 00s (Done)");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [profile?.daily_hours]);

  useEffect(() => {
    loadProfileAndTasks();
  }, [loadProfileAndTasks]);

  // Filter milestones based on selected goal
  const milestones = useMemo(() => {
    if (!selectedGoal) return [];
    return tasks.filter((t: any) => !t.is_goal && t.goal_id === selectedGoal.id);
  }, [tasks, selectedGoal]);

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
      const token = userState.token;
      if (!token) return;

      const res = await fetch("http://localhost:8000/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders()
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

  const handleSyncToCalendar = async () => {
    if (!selectedGoal) return;
    setSyncing(true);
    try {
      const token = userState.token;
      if (!token) {
        toast.error("Session token expired.");
        return;
      }

      const res = await fetch(`http://localhost:8000/sync-goal-to-calendar/${selectedGoal.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders()
        }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Sync failed.");
      }
      
      toast.success("Tasks scheduled around your busy hours!");
      await loadProfileAndTasks();
    } catch (e: any) {
      toast.error(e.message || "Failed to sync to calendar.");
    } finally {
      setSyncing(false);
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
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-2">
                <div className="flex-1 w-full">
                  <h1 className="text-4xl font-bold tracking-tight leading-tight">
                    Active Mission: <span className="gradient-text">{selectedGoal?.title || profile?.big_goal}</span>
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Current focus: <span className="text-foreground font-medium">{profile?.current_focus}</span> · Working {profile?.daily_hours}h/day
                  </p>
                  
                  {/* Glowing progress bar for Active Mission */}
                  <div className="mt-4 max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-1.5 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-primary-glow" /> Roadmap Completion Progress
                      </span>
                      <span className="text-primary-glow font-bold text-sm">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-950/60 rounded-full h-3 overflow-hidden border border-white/5 p-[1px]">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Goal Selector Dropdown */}
                {goals.length > 1 && (
                  <div className="flex items-center gap-2 shrink-0 bg-white/5 border border-border rounded-xl px-3 py-1.5 text-xs self-start md:self-center">
                    <span className="text-muted-foreground uppercase tracking-wider font-semibold">Change Target:</span>
                    <select
                      value={selectedGoal?.id || ""}
                      onChange={(e) => {
                        const target = goals.find(g => g.id === e.target.value);
                        if (target) setSelectedGoal(target);
                      }}
                      className="text-xs font-semibold text-foreground bg-transparent border-0 outline-none cursor-pointer focus:ring-0"
                    >
                      {goals.map((g: any) => (
                        <option key={g.id} value={g.id} className="bg-slate-950 text-foreground">
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Stats */}
            <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-4">
              {[
                { label: "Daily quota", value: `${profile?.daily_hours ?? 0}h`, icon: Clock },
                { label: "Time Left Today", value: timeLeftStr, icon: Clock, highlight: true },
                { label: "Milestones", value: `${completedCount}/${milestones.length}`, icon: Target },
                { label: "Progress completion", value: `${progressPercent}%`, icon: TrendingUp },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                  className={`glass rounded-2xl p-5 border border-border bg-background/25 ${
                    s.highlight ? "border-primary/20 shadow-[0_0_15px_rgba(168,85,247,0.05)]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <s.icon className={`h-4 w-4 ${s.highlight ? "text-primary animate-pulse" : "text-primary-glow"}`} />
                  </div>
                  <div className={`mt-2 font-semibold ${s.highlight ? "text-base md:text-lg text-primary-glow font-mono" : "text-3xl"}`}>
                    {s.value}
                  </div>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Active Roadmap</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Action items generated and sequenced by GoalPilot AI.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedGoal && (
                    <Button
                      disabled={syncing}
                      onClick={handleSyncToCalendar}
                      className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow border-0"
                    >
                      {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      ✨ Smart Sync to Calendar
                    </Button>
                  )}
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
