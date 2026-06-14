import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, Clock, Sparkles, ChevronRight, CheckCircle2, Circle, RefreshCw, Calendar, Plus, ArrowRight, AlertTriangle } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { userState, useUserState } from "@/lib/userState";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getApiUrl } from "@/lib/api-config";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Profile = {
  display_name: string | null;
  current_focus: string | null;
  daily_hours: number | null;
  big_goal: string | null;
  persona_completed: boolean;
  current_energy_level?: string | null;
  last_sync_at?: string | null;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "critical";
  effort: number;
  depends_on: string | null;
  completed: boolean;
  scheduled_at?: string | null;
  original_scheduled_at?: string | null;
  rescheduled_count?: number;
  priority_score?: number;
  completion_status?: string | null;
  scheduled_start?: string;
  scheduled_end?: string;
  goal_id?: string;
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
  const { activeGoalId, userId } = useUserState();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [allMissions, setAllMissions] = useState<any[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [reoptimizing, setReoptimizing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState("00h 00m 00s");

  // Smart Rescheduling & Timeline states
  const [needsRescheduling, setNeedsRescheduling] = useState(false);
  const [missedTasksCount, setMissedTasksCount] = useState(0);
  const [isOpenOptimizeDialog, setIsOpenOptimizeDialog] = useState(false);
  const [selectedEnergyLevel, setSelectedEnergyLevel] = useState<"low" | "medium" | "high">("medium");
  const [timeline, setTimeline] = useState<any[]>([]);
  const [timelineTimezone, setTimelineTimezone] = useState("UTC");
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [reschedulingTaskIds, setReschedulingTaskIds] = useState<Record<string, boolean>>({});

  // Fast mission creator wizard states
  const [isOpenNewMission, setIsOpenNewMission] = useState(false);
  const [newMissionStep, setNewMissionStep] = useState<1 | 2 | 3>(1);
  const [newMissionTitle, setNewMissionTitle] = useState("");
  const [analyzingMission, setAnalyzingMission] = useState(false);
  const [creatingMission, setCreatingMission] = useState(false);
  const [missionAdvice, setMissionAdvice] = useState<any>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl("user-goals"), {
        headers: userState.getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to fetch goals");
      const data = await res.json();
      setGoals(data);
      setAllMissions(data);
      userState.setAllMissions(data);
    } catch (e) {
      console.error(e);
      toast.error("Could not fetch goals list.");
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchMissionsHistory = async () => {
      try {
        const res = await fetch(getApiUrl(`user-goals/${userId}`), {
          headers: userState.getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setAllMissions(data);
          userState.setAllMissions(data);
        }
      } catch (err) {
        console.error("Failed to load missions history:", err);
      }
    };
    fetchMissionsHistory();
  }, [userId]);

  useEffect(() => {
    if (allMissions.length > 0) {
      const target = allMissions.find((g: any) => g.id === activeGoalId) || allMissions[0];
      setSelectedGoal(target);
    } else {
      setSelectedGoal(null);
    }
  }, [activeGoalId, allMissions]);

  const checkMissedTasks = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl("check-missed-tasks"), {
        method: "POST",
        headers: userState.getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setNeedsRescheduling(data.needs_rescheduling);
        setMissedTasksCount(data.missed_tasks_count);
      }
    } catch (err) {
      console.error("Failed to check missed tasks:", err);
    }
  }, []);

  const loadTimeline = useCallback(async () => {
    setLoadingTimeline(true);
    try {
      const res = await fetch(getApiUrl("calendar-timeline"), {
        headers: userState.getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setTimeline(data.timeline || []);
        setTimelineTimezone(data.timezone || "UTC");
      }
    } catch (err) {
      console.error("Failed to load calendar timeline:", err);
    } finally {
      setLoadingTimeline(false);
    }
  }, []);

  const loadProfileAndTasks = useCallback(async () => {
    try {
      const userId = userState.userId;
      if (!userId) return;

      // Fetch Profile
      const { data: profData } = await supabase
        .from("profiles")
        .select("display_name,current_focus,daily_hours,big_goal,persona_completed,current_energy_level,last_sync_at")
        .eq("id", userId)
        .maybeSingle();

      if (!profData || !profData.persona_completed) {
        navigate({ to: "/onboarding" });
        return;
      }
      setProfile(profData as Profile);

      // Load goals from API
      await loadGoals();

      // Fetch Tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("id,title,description,priority,effort,depends_on,completed,goal_id,scheduled_at,original_scheduled_at,rescheduled_count,priority_score,completion_status")
        .order("created_at", { ascending: true });

      if (tasksError) throw tasksError;

      const parsedTasks: Task[] = (tasksData ?? []).map(t => {
        const parsed = parseDesc(t.description);
        return {
          ...t,
          description: parsed.notes,
          scheduled_start: t.scheduled_at || parsed.scheduled_start,
          scheduled_end: parsed.scheduled_end,
          is_goal: parsed.is_goal,
          goal_id: t.goal_id
        } as any;
      });

      setTasks(parsedTasks);
      
      // Async secondary checks
      checkMissedTasks();
      loadTimeline();
    } catch (err: any) {
      toast.error(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [navigate, loadGoals, checkMissedTasks, loadTimeline]);

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

      const res = await fetch(getApiUrl("schedule"), {
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

  const handleOptimizeSchedule = async (energy: "low" | "medium" | "high") => {
    setReoptimizing(true);
    setIsOpenOptimizeDialog(false);
    try {
      const res = await fetch(getApiUrl("request-reschedule"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders()
        },
        body: JSON.stringify({ energy_level: energy })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Optimization failed.");
      }
      const data = await res.json();
      toast.success(data.message || "Schedule optimized successfully!");
      await loadProfileAndTasks();
    } catch (e: any) {
      toast.error(e.message || "Could not reschedule.");
    } finally {
      setReoptimizing(false);
    }
  };

  const handleRescheduleSingle = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setReschedulingTaskIds(prev => ({ ...prev, [taskId]: true }));
    try {
      const res = await fetch(getApiUrl(`reschedule-task/${taskId}`), {
        method: "POST",
        headers: userState.getAuthHeaders()
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Single task rescheduling failed.");
      }
      toast.success("Task rescheduled successfully!");
      await loadProfileAndTasks();
    } catch (e: any) {
      toast.error(e.message || "Could not reschedule task.");
    } finally {
      setReschedulingTaskIds(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const timelineGroupedByDate = useMemo(() => {
    const groups: Record<string, any[]> = {};
    timeline.forEach(item => {
      try {
        const dateStr = format(parseISO(item.start), "yyyy-MM-dd");
        if (!groups[dateStr]) {
          groups[dateStr] = [];
        }
        groups[dateStr].push(item);
      } catch (e) {
        // ignore
      }
    });
    return Object.keys(groups)
      .sort()
      .map(dateKey => ({
        dateLabel: format(parseISO(dateKey + "T00:00:00"), "EEEE, MMM d"),
        items: groups[dateKey]
      }));
  }, [timeline]);

  const handleSyncToCalendar = async () => {
    if (!selectedGoal) return;
    setSyncing(true);
    try {
      const token = userState.token;
      if (!token) {
        toast.error("Session token expired.");
        return;
      }

      const res = await fetch(getApiUrl(`sync-goal-to-calendar/${selectedGoal.id}`), {
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

  const handleAnalyzeMission = async () => {
    if (!newMissionTitle.trim()) return;
    setNewMissionStep(2);
    setAnalyzingMission(true);
    try {
      const res = await fetch(getApiUrl("onboarding-advice"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders(),
        },
        body: JSON.stringify({
          goal: newMissionTitle,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to analyze mission.");
      }

      const data = await res.json();
      setMissionAdvice(data);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to analyze mission.");
      setNewMissionStep(1);
    } finally {
      setAnalyzingMission(false);
    }
  };

  const handleSelectStrategyAndLaunch = async (strategyId: string) => {
    setSelectedStrategy(strategyId);
    setNewMissionStep(3);
    setCreatingMission(true);
    try {
      const res = await fetch(getApiUrl("create-goal"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders(),
        },
        body: JSON.stringify({
          goal: newMissionTitle,
          context: {
            strategy: strategyId,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create mission.");
      }

      const data = await res.json();
      if (data.goal_id) {
        userState.setActiveGoalId(data.goal_id);
        const userId = userState.userId;
        if (userId) {
          await supabase
            .from("profiles")
            .update({ last_active_goal_id: data.goal_id })
            .eq("id", userId);
        }
      }

      const scheduleRes = await fetch(getApiUrl("schedule"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders(),
        },
        body: JSON.stringify({ calendar_events: [] }),
      });

      if (!scheduleRes.ok) {
        console.warn("Scheduling failed during new mission initialization.");
      }

      // Reload goals history
      await loadGoals();

      toast.success("Mission generated successfully!");
      setIsOpenNewMission(false);
      setNewMissionTitle("");
      setNewMissionStep(1);
      setMissionAdvice(null);
      setSelectedStrategy(null);
      await loadProfileAndTasks();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to create new mission.");
      setNewMissionStep(2);
    } finally {
      setCreatingMission(false);
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
            {needsRescheduling && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-950/20 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-400 shrink-0">
                    <AlertTriangle className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-200 text-sm">Schedule Out of Sync</h4>
                    <p className="text-xs text-red-300/80 mt-0.5">
                      You have {missedTasksCount} task(s) scheduled in the past that are incomplete. Let's fix this.
                    </p>
                  </div>
                </div>
                <Button
                  disabled={reoptimizing}
                  onClick={() => setIsOpenOptimizeDialog(true)}
                  className="bg-red-500 hover:bg-red-600 text-white border-0 font-semibold gap-1.5 rounded-xl text-xs py-2 px-3 h-auto shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.3)] cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Optimize My Schedule
                </Button>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary-glow" /> Mission control
              </div>
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-2">
                <div className="flex-1 w-full">
                  <h1 className="text-4xl font-bold tracking-tight leading-tight">
                    Active Mission: <span className="gradient-text">{selectedGoal?.title || "No Active Mission"}</span>
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Current focus: <span className="text-foreground font-medium">{profile?.current_focus || "General"}</span> · Working {profile?.daily_hours}h/day
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
                
                {/* Goal Selector Dropdown & New Mission Button */}
                <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                  {allMissions.length > 0 && (
                    <div className="flex items-center gap-2 bg-white/5 border border-border rounded-xl px-3 py-1.5 text-xs">
                      <span className="text-muted-foreground uppercase tracking-wider font-semibold">Change Target:</span>
                      <select
                        value={selectedGoal?.id || ""}
                        onChange={async (e) => {
                          const target = allMissions.find(g => g.id === e.target.value);
                          if (target) {
                            setSelectedGoal(target);
                            userState.setActiveGoalId(target.id);
                            const userId = userState.userId;
                            if (userId) {
                              await supabase
                                .from("profiles")
                                .update({ last_active_goal_id: target.id })
                                .eq("id", userId);
                            }
                          }
                        }}
                        className="text-xs font-semibold text-foreground bg-transparent border-0 outline-none cursor-pointer focus:ring-0"
                      >
                        {allMissions.map((g: any) => (
                          <option key={g.id} value={g.id} className="bg-slate-950 text-foreground">
                            {g.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => setIsOpenNewMission(true)}
                    className="bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary-glow font-semibold gap-1.5 rounded-xl text-xs py-2 px-3 h-auto"
                  >
                    <Plus className="h-3.5 w-3.5" /> + New Mission
                  </Button>
                </div>
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

            {/* Two Column Grid for Roadmap and Timeline */}
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left 2 Columns: Goal Breakdown Checklist */}
              <div className="lg:col-span-2">
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="glass-strong border border-border rounded-2xl p-6 lg:p-8"
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
                        onClick={() => setIsOpenOptimizeDialog(true)}
                        className="border-border bg-white/5 hover:bg-white/10 gap-1.5 cursor-pointer"
                      >
                        {reoptimizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        Optimize Schedule
                      </Button>
                    </div>
                  </div>

                  {milestones.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center justify-center gap-4">
                      <span>No active roadmap tasks. Click "+ New Mission" to begin your journey.</span>
                      <Button 
                        onClick={() => setIsOpenNewMission(true)}
                        className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow border-0"
                      >
                        <Plus className="h-4 w-4 mr-2" /> + New Mission
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-3">
                      {milestones.map((m, i) => {
                        const scheduledText = m.scheduled_start 
                          ? format(parseISO(m.scheduled_start), "MMM d, hh:mm a")
                          : "Unscheduled";

                        const isOverdue = !m.completed && m.scheduled_start && new Date(m.scheduled_start) < new Date();

                        return (
                          <motion.div
                            key={m.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.06 }}
                            className={`group flex items-center gap-4 rounded-xl border p-4 transition cursor-pointer ${
                              m.completed 
                                ? "border-border bg-background/30 hover:bg-background/50" 
                                : isOverdue 
                                  ? "border-red-500/30 bg-red-950/5 hover:bg-red-955/10 shadow-[0_0_10px_rgba(239,68,68,0.02)]" 
                                  : "border-border bg-background/30 hover:bg-background/50"
                            }`}
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
                                  <Calendar className={`h-2.5 w-2.5 ${isOverdue ? "text-red-400 animate-pulse" : "text-primary-glow"}`} /> 
                                  <span className={isOverdue ? "text-red-400 font-semibold" : ""}>{scheduledText}</span>
                                  {isOverdue && <span className="text-red-400 text-[9px] font-bold uppercase tracking-wider ml-1 bg-red-500/10 px-1 rounded">Overdue</span>}
                                </span>
                                <span>·</span>
                                <span className="uppercase text-[9px] font-semibold">{m.priority} priority</span>
                              </div>
                              <div className={`mt-1 font-medium truncate ${m.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                {m.title}
                              </div>
                            </div>
                            {isOverdue && (
                              <Button
                                disabled={reschedulingTaskIds[m.id]}
                                onClick={(e) => handleRescheduleSingle(e, m.id)}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold gap-1 rounded-lg text-[10px] py-1 px-2 h-auto shrink-0 transition cursor-pointer"
                              >
                                {reschedulingTaskIds[m.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                                Replan
                              </Button>
                            )}
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition shrink-0" />
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.section>
              </div>

              {/* Right Column: Calendar Focus Timeline Preview */}
              <div className="lg:col-span-1">
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="glass-strong border border-border rounded-2xl p-6 flex flex-col"
                >
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">Focus Timeline</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Your slots aligned with calendar events.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={loadingTimeline}
                      onClick={loadTimeline}
                      className="h-8 w-8 hover:bg-white/10 rounded-xl cursor-pointer"
                    >
                      <RefreshCw className={`h-4 w-4 ${loadingTimeline ? "animate-spin" : ""}`} />
                    </Button>
                  </div>

                  {loadingTimeline ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-xs text-muted-foreground gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary-glow" /> Loading timeline...
                    </div>
                  ) : timelineGroupedByDate.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-border rounded-xl bg-background/10 text-muted-foreground text-xs gap-3">
                      <Calendar className="h-8 w-8 text-muted-foreground/50" />
                      <span>No scheduled blocks. Click 'Smart Sync' on your roadmap to populate.</span>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-6 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                      {timelineGroupedByDate.map((group) => (
                        <div key={group.dateLabel} className="space-y-2.5">
                          <h4 className="text-[10px] font-semibold text-primary-glow uppercase tracking-wider border-b border-white/5 pb-1">
                            {group.dateLabel}
                          </h4>
                          <div className="space-y-2">
                            {group.items.map((item, idx) => {
                              const startStr = format(parseISO(item.start), "hh:mm a");
                              const endStr = format(parseISO(item.end), "hh:mm a");
                              return (
                                <div
                                  key={item.id || idx}
                                  className={`flex items-start gap-3 rounded-xl p-3 border text-xs leading-normal ${
                                    item.is_busy
                                      ? "bg-slate-900/40 border-slate-800 text-slate-400"
                                      : "bg-primary/5 border-primary/20 text-foreground"
                                  }`}
                                >
                                  <div className="text-[10px] font-mono text-muted-foreground shrink-0 mt-0.5 w-16">
                                    {startStr} - {endStr}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{item.title}</div>
                                    {!item.is_busy && (
                                      <div className="flex items-center gap-1.5 mt-1">
                                        <span className="uppercase text-[8px] bg-primary/10 border border-primary/20 px-1 rounded font-semibold text-primary-glow">
                                          {item.priority}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                          {item.duration}m block
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.section>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={isOpenNewMission} onOpenChange={(open) => {
        setIsOpenNewMission(open);
        if (!open) {
          setNewMissionTitle("");
          setNewMissionStep(1);
          setMissionAdvice(null);
          setSelectedStrategy(null);
        }
      }}>
        <DialogContent className="glass-strong border border-border text-foreground max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto pr-6">
          {newMissionStep === 1 && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary-glow" /> Launch New Mission
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  What is your new execution target? GoalPilot will analyze it based on your saved persona.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <Input
                  autoFocus
                  placeholder="e.g. Build a SaaS landing page"
                  value={newMissionTitle}
                  onChange={(e) => setNewMissionTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newMissionTitle.trim()) {
                      handleAnalyzeMission();
                    }
                  }}
                  className="bg-background/40 h-12 text-base border-border focus:border-primary"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpenNewMission(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAnalyzeMission}
                  disabled={!newMissionTitle.trim()}
                  className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow"
                >
                  Analyze Goal <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </DialogFooter>
            </div>
          )}

          {newMissionStep === 2 && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary-glow" /> AI Coach Advice
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  Strategic paths tailored to your profile ({profile?.daily_hours}h/day, {profile?.current_focus || "General"} focus).
                </DialogDescription>
              </DialogHeader>

              {analyzingMission ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                  <Loader2 className="h-8 w-8 text-primary-glow animate-spin" />
                  <div>
                    <h3 className="font-semibold text-lg">Consulting AI Consultant...</h3>
                    <p className="text-xs text-muted-foreground mt-1">Evaluating available hours, work style, and complexity.</p>
                  </div>
                </div>
              ) : (
                <div className="py-4 space-y-4">
                  {missionAdvice?.reasoning && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm leading-relaxed text-muted-foreground max-h-[160px] overflow-y-auto scrollbar-thin">
                      <strong className="text-foreground">AI Coach Assessment:</strong> {missionAdvice.reasoning}
                    </div>
                  )}

                  <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
                    {missionAdvice?.strategies?.map((strat: any) => (
                      <button
                        key={strat.id}
                        type="button"
                        onClick={() => handleSelectStrategyAndLaunch(strat.id)}
                        className={`flex flex-col text-left p-4 rounded-xl border transition-all duration-300 relative ${
                          strat.recommended
                            ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(168,85,247,0.15)] text-foreground scale-[1.01]"
                            : "bg-background/40 border-border hover:bg-background/60 text-muted-foreground"
                        }`}
                      >
                        {strat.recommended && (
                          <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-[8px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full">
                            Best Fit
                          </span>
                        )}
                        <span className="text-sm font-bold text-foreground mb-1">{strat.name} Path</span>
                        <span className="text-[10px] bg-white/5 rounded px-1.5 py-0.5 self-start mb-2 text-muted-foreground">
                          {strat.duration}
                        </span>
                        <p className="text-[11px] text-muted-foreground leading-normal mb-2 flex-grow">
                          {strat.description}
                        </p>
                        <div className="text-[10px] space-y-0.5 mt-auto pt-2 border-t border-white/5 w-full">
                          <div className="text-green-400 font-semibold">Pros: {strat.pros?.[0]}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!analyzingMission && (
                <DialogFooter className="border-t border-border pt-4">
                  <Button variant="ghost" onClick={() => setNewMissionStep(1)}>
                    Back
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}

          {newMissionStep === 3 && (
            <div className="py-12 flex flex-col items-center justify-center gap-6 text-center">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                <Target className="absolute inset-0 m-auto h-6 w-6 text-primary-glow animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Generating Flight Plan</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-sm">
                  Decomposing "{newMissionTitle}" into structured milestones based on the selected path and your personal availability quota.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isOpenOptimizeDialog} onOpenChange={setIsOpenOptimizeDialog}>
        <DialogContent className="glass-strong border border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary-glow animate-spin" style={{ animationDuration: '6s' }} /> 
              Optimize Your Schedule
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              GoalPilot AI will reorganize your pending and missed tasks around your calendar events.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Select Current Energy Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { level: "low" as const, label: "📉 Low", desc: "Short bursts" },
                { level: "medium" as const, label: "⚡ Medium", desc: "Standard flow" },
                { level: "high" as const, label: "🚀 High", desc: "Deep sprint" },
              ].map((opt) => (
                <button
                  key={opt.level}
                  type="button"
                  onClick={() => setSelectedEnergyLevel(opt.level)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                    selectedEnergyLevel === opt.level
                      ? "bg-primary/10 border-primary shadow-[0_0_12px_rgba(168,85,247,0.1)] text-foreground"
                      : "bg-background/40 border-border hover:bg-background/60 text-muted-foreground"
                  }`}
                >
                  <span className="text-sm font-semibold">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
          
          <DialogFooter className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpenOptimizeDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleOptimizeSchedule(selectedEnergyLevel)}
              className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow border-0 cursor-pointer"
            >
              Optimize Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {reoptimizing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="relative h-20 w-20 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
            <RefreshCw className="absolute inset-0 m-auto h-8 w-8 text-primary-glow animate-spin" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">AI Rescheduling in Progress</h3>
          <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs px-4">
            Evaluating calendar conflicts, priorities, and your energy level to construct a fresh execution plan...
          </p>
        </div>
      )}
    </SidebarProvider>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
