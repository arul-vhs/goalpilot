import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { S as SidebarProvider, A as AppSidebar, a as SidebarTrigger, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, k as DialogDescription, l as DialogFooter } from "./app-sidebar-JfnbziOs.mjs";
import { s as supabase } from "./client-hQzx3ycp.mjs";
import { B as Button, I as Input } from "./input-BiB-PFhx.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as useUserState, g as getApiUrl, u as userState } from "./api-config-6k5iAoHf.mjs";
import { f as format, p as parseISO } from "../_libs/date-fns.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { m as TriangleAlert, R as RefreshCw, S as Sparkles, T as Target, d as Plus, C as Clock, n as TrendingUp, h as CircleCheck, f as Circle, o as Calendar, p as ChevronRight, A as ArrowRight } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/radix-ui__react-separator.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/radix-ui__react-scroll-area.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__number.mjs";
import "./label-D4W0VQAM.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function parseDesc(descStr) {
  try {
    const data = JSON.parse(descStr || "{}");
    return {
      notes: data.notes || descStr || "",
      is_goal: !!data.is_goal,
      scheduled_start: data.scheduled_start || null,
      scheduled_end: data.scheduled_end || null
    };
  } catch (e) {
    return {
      notes: descStr || "",
      is_goal: false,
      scheduled_start: null,
      scheduled_end: null
    };
  }
}
function Dashboard() {
  const navigate = useNavigate();
  const {
    activeGoalId,
    userId
  } = useUserState();
  const [profile, setProfile] = reactExports.useState(null);
  const [tasks, setTasks] = reactExports.useState([]);
  const [goals, setGoals] = reactExports.useState([]);
  const [allMissions, setAllMissions] = reactExports.useState([]);
  const [selectedGoal, setSelectedGoal] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [reoptimizing, setReoptimizing] = reactExports.useState(false);
  const [syncing, setSyncing] = reactExports.useState(false);
  const [timeLeftStr, setTimeLeftStr] = reactExports.useState("00h 00m 00s");
  const [needsRescheduling, setNeedsRescheduling] = reactExports.useState(false);
  const [missedTasksCount, setMissedTasksCount] = reactExports.useState(0);
  const [isOpenOptimizeDialog, setIsOpenOptimizeDialog] = reactExports.useState(false);
  const [selectedEnergyLevel, setSelectedEnergyLevel] = reactExports.useState("medium");
  const [timeline, setTimeline] = reactExports.useState([]);
  const [timelineTimezone, setTimelineTimezone] = reactExports.useState("UTC");
  const [loadingTimeline, setLoadingTimeline] = reactExports.useState(false);
  const [reschedulingTaskIds, setReschedulingTaskIds] = reactExports.useState({});
  const [isOpenNewMission, setIsOpenNewMission] = reactExports.useState(false);
  const [newMissionStep, setNewMissionStep] = reactExports.useState(1);
  const [newMissionTitle, setNewMissionTitle] = reactExports.useState("");
  const [analyzingMission, setAnalyzingMission] = reactExports.useState(false);
  const [creatingMission, setCreatingMission] = reactExports.useState(false);
  const [missionAdvice, setMissionAdvice] = reactExports.useState(null);
  const [selectedStrategy, setSelectedStrategy] = reactExports.useState(null);
  const loadGoals = reactExports.useCallback(async () => {
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
  reactExports.useEffect(() => {
    if (!userId) return;
    const fetchMissionsHistory = async () => {
      try {
        const res = await fetch(getApiUrl(`user-goals/${userId}`), {
          headers: userState.getAuthHeaders()
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
  reactExports.useEffect(() => {
    if (allMissions.length > 0) {
      const target = allMissions.find((g) => g.id === activeGoalId) || allMissions[0];
      setSelectedGoal(target);
    } else {
      setSelectedGoal(null);
    }
  }, [activeGoalId, allMissions]);
  const checkMissedTasks = reactExports.useCallback(async () => {
    try {
      const res = await fetch(getApiUrl("check-missed-tasks"), {
        method: "POST",
        headers: userState.getAuthHeaders()
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
  const loadTimeline = reactExports.useCallback(async () => {
    setLoadingTimeline(true);
    try {
      const res = await fetch(getApiUrl("calendar-timeline"), {
        headers: userState.getAuthHeaders()
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
  const loadProfileAndTasks = reactExports.useCallback(async () => {
    try {
      const userId2 = userState.userId;
      if (!userId2) return;
      const {
        data: profData
      } = await supabase.from("profiles").select("display_name,current_focus,daily_hours,big_goal,persona_completed,current_energy_level,last_sync_at").eq("id", userId2).maybeSingle();
      if (!profData || !profData.persona_completed) {
        navigate({
          to: "/onboarding"
        });
        return;
      }
      setProfile(profData);
      await loadGoals();
      const {
        data: tasksData,
        error: tasksError
      } = await supabase.from("tasks").select("id,title,description,priority,effort,depends_on,completed,goal_id,scheduled_at,original_scheduled_at,rescheduled_count,priority_score,completion_status").order("created_at", {
        ascending: true
      });
      if (tasksError) throw tasksError;
      const parsedTasks = (tasksData ?? []).map((t) => {
        const parsed = parseDesc(t.description);
        return {
          ...t,
          description: parsed.notes,
          scheduled_start: t.scheduled_at || parsed.scheduled_start,
          scheduled_end: parsed.scheduled_end,
          is_goal: parsed.is_goal,
          goal_id: t.goal_id
        };
      });
      setTasks(parsedTasks);
      checkMissedTasks();
      loadTimeline();
    } catch (err) {
      toast.error(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [navigate, loadGoals, checkMissedTasks, loadTimeline]);
  reactExports.useEffect(() => {
    if (!profile?.daily_hours) {
      setTimeLeftStr("00h 00m 00s");
      return;
    }
    const updateCountdown = () => {
      const now = /* @__PURE__ */ new Date();
      const localH = now.getHours();
      const localM = now.getMinutes();
      const localS = now.getSeconds();
      const dailyHours = profile.daily_hours || 2;
      const startHour = 9;
      const endHour = startHour + dailyHours;
      const currentTimeInHours = localH + localM / 60 + localS / 3600;
      const pad = (num) => String(num).padStart(2, "0");
      if (currentTimeInHours < startHour) {
        const diffHrs = startHour - currentTimeInHours;
        const h = Math.floor(diffHrs);
        const m = Math.floor((diffHrs - h) * 60);
        const s = Math.floor(((diffHrs - h) * 60 - m) * 60);
        setTimeLeftStr(`${pad(h)}h ${pad(m)}m ${pad(s)}s (Starts 9 AM)`);
      } else if (currentTimeInHours >= startHour && currentTimeInHours < endHour) {
        const diffHrs = endHour - currentTimeInHours;
        const h = Math.floor(diffHrs);
        const m = Math.floor((diffHrs - h) * 60);
        const s = Math.floor(((diffHrs - h) * 60 - m) * 60);
        setTimeLeftStr(`${pad(h)}h ${pad(m)}m ${pad(s)}s left`);
      } else {
        setTimeLeftStr("00h 00m 00s (Done)");
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1e3);
    return () => clearInterval(interval);
  }, [profile?.daily_hours]);
  reactExports.useEffect(() => {
    loadProfileAndTasks();
  }, [loadProfileAndTasks]);
  const milestones = reactExports.useMemo(() => {
    if (!selectedGoal) return [];
    return tasks.filter((t) => !t.is_goal && t.goal_id === selectedGoal.id);
  }, [tasks, selectedGoal]);
  const completedCount = reactExports.useMemo(() => {
    return milestones.filter((t) => t.completed).length;
  }, [milestones]);
  const progressPercent = reactExports.useMemo(() => {
    if (milestones.length === 0) return 0;
    return Math.round(completedCount / milestones.length * 100);
  }, [milestones, completedCount]);
  const handleToggleTask = async (task) => {
    try {
      const {
        error
      } = await supabase.from("tasks").update({
        completed: !task.completed
      }).eq("id", task.id);
      if (error) throw error;
      toast.success(task.completed ? "Task set to pending." : "Task completed!");
      await loadProfileAndTasks();
    } catch (e) {
      toast.error(e.message || "Failed to update task.");
    }
  };
  const handleOptimizeSchedule = async (energy) => {
    setReoptimizing(true);
    setIsOpenOptimizeDialog(false);
    try {
      const res = await fetch(getApiUrl("request-reschedule"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders()
        },
        body: JSON.stringify({
          energy_level: energy
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Optimization failed.");
      }
      const data = await res.json();
      toast.success(data.message || "Schedule optimized successfully!");
      await loadProfileAndTasks();
    } catch (e) {
      toast.error(e.message || "Could not reschedule.");
    } finally {
      setReoptimizing(false);
    }
  };
  const handleRescheduleSingle = async (e, taskId) => {
    e.stopPropagation();
    setReschedulingTaskIds((prev) => ({
      ...prev,
      [taskId]: true
    }));
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
    } catch (e2) {
      toast.error(e2.message || "Could not reschedule task.");
    } finally {
      setReschedulingTaskIds((prev) => ({
        ...prev,
        [taskId]: false
      }));
    }
  };
  const timelineGroupedByDate = reactExports.useMemo(() => {
    const groups = {};
    timeline.forEach((item) => {
      try {
        const dateStr = format(parseISO(item.start), "yyyy-MM-dd");
        if (!groups[dateStr]) {
          groups[dateStr] = [];
        }
        groups[dateStr].push(item);
      } catch (e) {
      }
    });
    return Object.keys(groups).sort().map((dateKey) => ({
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
    } catch (e) {
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
          ...userState.getAuthHeaders()
        },
        body: JSON.stringify({
          goal: newMissionTitle
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to analyze mission.");
      }
      const data = await res.json();
      setMissionAdvice(data);
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Failed to analyze mission.");
      setNewMissionStep(1);
    } finally {
      setAnalyzingMission(false);
    }
  };
  const handleSelectStrategyAndLaunch = async (strategyId) => {
    setSelectedStrategy(strategyId);
    setNewMissionStep(3);
    setCreatingMission(true);
    try {
      const res = await fetch(getApiUrl("create-goal"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders()
        },
        body: JSON.stringify({
          goal: newMissionTitle,
          context: {
            strategy: strategyId
          }
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create mission.");
      }
      const data = await res.json();
      if (data.goal_id) {
        userState.setActiveGoalId(data.goal_id);
        const userId2 = userState.userId;
        if (userId2) {
          await supabase.from("profiles").update({
            last_active_goal_id: data.goal_id
          }).eq("id", userId2);
        }
      }
      const scheduleRes = await fetch(getApiUrl("schedule"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders()
        },
        body: JSON.stringify({
          calendar_events: []
        })
      });
      if (!scheduleRes.ok) {
        console.warn("Scheduling failed during new mission initialization.");
      }
      await loadGoals();
      toast.success("Mission generated successfully!");
      setIsOpenNewMission(false);
      setNewMissionTitle("");
      setNewMissionStep(1);
      setMissionAdvice(null);
      setSelectedStrategy(null);
      await loadProfileAndTasks();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Failed to create new mission.");
      setNewMissionStep(2);
    } finally {
      setCreatingMission(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen items-center justify-center text-muted-foreground gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "h-5 w-5 animate-spin text-primary-glow" }),
      " Loading dashboard..."
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SidebarProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AppSidebar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "h-14 flex items-center gap-3 border-b border-border px-4 glass", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarTrigger, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
            "Pilot: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: profile?.display_name ?? "Guest" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto overflow-y-auto", children: [
          needsRescheduling && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
            opacity: 0,
            y: -10
          }, animate: {
            opacity: 1,
            y: 0
          }, className: "mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-950/20 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_15px_rgba(239,68,68,0.05)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-red-500/10 text-red-400 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 animate-pulse" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-red-200 text-sm", children: "Schedule Out of Sync" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-300/80 mt-0.5", children: [
                  "You have ",
                  missedTasksCount,
                  " task(s) scheduled in the past that are incomplete. Let's fix this."
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: reoptimizing, onClick: () => setIsOpenOptimizeDialog(true), className: "bg-red-500 hover:bg-red-600 text-white border-0 font-semibold gap-1.5 rounded-xl text-xs py-2 px-3 h-auto shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.3)] cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
              "Optimize My Schedule"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
            opacity: 0,
            y: 12
          }, animate: {
            opacity: 1,
            y: 0
          }, transition: {
            duration: 0.5
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary-glow" }),
              " Mission control"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-start justify-between gap-4 mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 w-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl font-bold tracking-tight leading-tight", children: [
                  "Active Mission: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text", children: selectedGoal?.title || "No Active Mission" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-muted-foreground", children: [
                  "Current focus: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: profile?.current_focus || "General" }),
                  " · Working ",
                  profile?.daily_hours,
                  "h/day"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-sm backdrop-blur-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-xs text-muted-foreground mb-1.5 font-medium", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-3.5 w-3.5 text-primary-glow" }),
                      " Roadmap Completion Progress"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary-glow font-bold text-sm", children: [
                      progressPercent,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-slate-950/60 rounded-full h-3 overflow-hidden border border-white/5 p-[1px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "h-full bg-gradient-to-r from-primary to-primary-glow rounded-full shadow-[0_0_12px_rgba(168,85,247,0.6)]", initial: {
                    width: 0
                  }, animate: {
                    width: `${progressPercent}%`
                  }, transition: {
                    duration: 0.6,
                    ease: "easeOut"
                  } }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 self-start md:self-center shrink-0", children: [
                allMissions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-white/5 border border-border rounded-xl px-3 py-1.5 text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground uppercase tracking-wider font-semibold", children: "Change Target:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: selectedGoal?.id || "", onChange: async (e) => {
                    const target = allMissions.find((g) => g.id === e.target.value);
                    if (target) {
                      setSelectedGoal(target);
                      userState.setActiveGoalId(target.id);
                      const userId2 = userState.userId;
                      if (userId2) {
                        await supabase.from("profiles").update({
                          last_active_goal_id: target.id
                        }).eq("id", userId2);
                      }
                    }
                  }, className: "text-xs font-semibold text-foreground bg-transparent border-0 outline-none cursor-pointer focus:ring-0", children: allMissions.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: g.id, className: "bg-slate-950 text-foreground", children: g.title }, g.id)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setIsOpenNewMission(true), className: "bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary-glow font-semibold gap-1.5 rounded-xl text-xs py-2 px-3 h-auto", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
                  " + New Mission"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid gap-4 grid-cols-2 md:grid-cols-4", children: [{
            label: "Daily quota",
            value: `${profile?.daily_hours ?? 0}h`,
            icon: Clock
          }, {
            label: "Time Left Today",
            value: timeLeftStr,
            icon: Clock,
            highlight: true
          }, {
            label: "Milestones",
            value: `${completedCount}/${milestones.length}`,
            icon: Target
          }, {
            label: "Progress completion",
            value: `${progressPercent}%`,
            icon: TrendingUp
          }].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
            opacity: 0,
            y: 12
          }, animate: {
            opacity: 1,
            y: 0
          }, transition: {
            duration: 0.4,
            delay: 0.1 + i * 0.05
          }, className: `glass rounded-2xl p-5 border border-border bg-background/25 ${s.highlight ? "border-primary/20 shadow-[0_0_15px_rgba(168,85,247,0.05)]" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: s.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: `h-4 w-4 ${s.highlight ? "text-primary animate-pulse" : "text-primary-glow"}` })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-2 font-semibold ${s.highlight ? "text-base md:text-lg text-primary-glow font-mono" : "text-3xl"}`, children: s.value })
          ] }, s.label)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.section, { initial: {
              opacity: 0,
              y: 16
            }, animate: {
              opacity: 1,
              y: 0
            }, transition: {
              duration: 0.5,
              delay: 0.2
            }, className: "glass-strong border border-border rounded-2xl p-6 lg:p-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: "Active Roadmap" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Action items generated and sequenced by GoalPilot AI." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
                  selectedGoal && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: syncing, onClick: handleSyncToCalendar, className: "gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow border-0", children: [
                    syncing ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : null,
                    "✨ Smart Sync to Calendar"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", disabled: reoptimizing, onClick: () => setIsOpenOptimizeDialog(true), className: "border-border bg-white/5 hover:bg-white/10 gap-1.5 cursor-pointer", children: [
                    reoptimizing ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
                    "Optimize Schedule"
                  ] })
                ] })
              ] }),
              milestones.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground text-sm flex flex-col items-center justify-center gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: 'No active roadmap tasks. Click "+ New Mission" to begin your journey.' }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setIsOpenNewMission(true), className: "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow border-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
                  " + New Mission"
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-3", children: milestones.map((m, i) => {
                const scheduledText = m.scheduled_start ? format(parseISO(m.scheduled_start), "MMM d, hh:mm a") : "Unscheduled";
                const isOverdue = !m.completed && m.scheduled_start && new Date(m.scheduled_start) < /* @__PURE__ */ new Date();
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
                  opacity: 0,
                  x: -10
                }, animate: {
                  opacity: 1,
                  x: 0
                }, transition: {
                  delay: 0.3 + i * 0.06
                }, className: `group flex items-center gap-4 rounded-xl border p-4 transition cursor-pointer ${m.completed ? "border-border bg-background/30 hover:bg-background/50" : isOverdue ? "border-red-500/30 bg-red-950/5 hover:bg-red-955/10 shadow-[0_0_10px_rgba(239,68,68,0.02)]" : "border-border bg-background/30 hover:bg-background/50"}`, onClick: () => handleToggleTask(m), children: [
                  m.completed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5 text-green-500 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary-glow" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] text-muted-foreground", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "Step ",
                        i + 1
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: `h-2.5 w-2.5 ${isOverdue ? "text-red-400 animate-pulse" : "text-primary-glow"}` }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: isOverdue ? "text-red-400 font-semibold" : "", children: scheduledText }),
                        isOverdue && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400 text-[9px] font-bold uppercase tracking-wider ml-1 bg-red-500/10 px-1 rounded", children: "Overdue" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "uppercase text-[9px] font-semibold", children: [
                        m.priority,
                        " priority"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-1 font-medium truncate ${m.completed ? "line-through text-muted-foreground" : "text-foreground"}`, children: m.title })
                  ] }),
                  isOverdue && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: reschedulingTaskIds[m.id], onClick: (e) => handleRescheduleSingle(e, m.id), className: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold gap-1 rounded-lg text-[10px] py-1 px-2 h-auto shrink-0 transition cursor-pointer", children: [
                    reschedulingTaskIds[m.id] ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3 w-3" }),
                    "Replan"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition shrink-0" })
                ] }, m.id);
              }) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.section, { initial: {
              opacity: 0,
              y: 16
            }, animate: {
              opacity: 1,
              y: 0
            }, transition: {
              duration: 0.5,
              delay: 0.25
            }, className: "glass-strong border border-border rounded-2xl p-6 flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold tracking-tight", children: "Focus Timeline" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Your slots aligned with calendar events." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", disabled: loadingTimeline, onClick: loadTimeline, className: "h-8 w-8 hover:bg-white/10 rounded-xl cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ${loadingTimeline ? "animate-spin" : ""}` }) })
              ] }),
              loadingTimeline ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-center py-12 text-xs text-muted-foreground gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "h-4 w-4 animate-spin text-primary-glow" }),
                " Loading timeline..."
              ] }) : timelineGroupedByDate.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-border rounded-xl bg-background/10 text-muted-foreground text-xs gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-8 w-8 text-muted-foreground/50" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "No scheduled blocks. Click 'Smart Sync' on your roadmap to populate." })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 space-y-6 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin", children: timelineGroupedByDate.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-[10px] font-semibold text-primary-glow uppercase tracking-wider border-b border-white/5 pb-1", children: group.dateLabel }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: group.items.map((item, idx) => {
                  const startStr = format(parseISO(item.start), "hh:mm a");
                  const endStr = format(parseISO(item.end), "hh:mm a");
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start gap-3 rounded-xl p-3 border text-xs leading-normal ${item.is_busy ? "bg-slate-900/40 border-slate-800 text-slate-400" : "bg-primary/5 border-primary/20 text-foreground"}`, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono text-muted-foreground shrink-0 mt-0.5 w-16", children: [
                      startStr,
                      " - ",
                      endStr
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: item.title }),
                      !item.is_busy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "uppercase text-[8px] bg-primary/10 border border-primary/20 px-1 rounded font-semibold text-primary-glow", children: item.priority }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                          item.duration,
                          "m block"
                        ] })
                      ] })
                    ] })
                  ] }, item.id || idx);
                }) })
              ] }, group.dateLabel)) })
            ] }) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isOpenNewMission, onOpenChange: (open) => {
      setIsOpenNewMission(open);
      if (!open) {
        setNewMissionTitle("");
        setNewMissionStep(1);
        setMissionAdvice(null);
        setSelectedStrategy(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "glass-strong border border-border text-foreground max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto pr-6", children: [
      newMissionStep === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "text-2xl font-bold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-6 w-6 text-primary-glow" }),
            " Launch New Mission"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-muted-foreground text-sm", children: "What is your new execution target? GoalPilot will analyze it based on your saved persona." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { autoFocus: true, placeholder: "e.g. Build a SaaS landing page", value: newMissionTitle, onChange: (e) => setNewMissionTitle(e.target.value), onKeyDown: (e) => {
          if (e.key === "Enter" && newMissionTitle.trim()) {
            handleAnalyzeMission();
          }
        }, className: "bg-background/40 h-12 text-base border-border focus:border-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setIsOpenNewMission(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleAnalyzeMission, disabled: !newMissionTitle.trim(), className: "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow", children: [
            "Analyze Goal ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 ml-1.5" })
          ] })
        ] })
      ] }),
      newMissionStep === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "text-2xl font-bold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-6 w-6 text-primary-glow" }),
            " AI Coach Advice"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "text-muted-foreground text-sm", children: [
            "Strategic paths tailored to your profile (",
            profile?.daily_hours,
            "h/day, ",
            profile?.current_focus || "General",
            " focus)."
          ] })
        ] }),
        analyzingMission ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-12 flex flex-col items-center justify-center gap-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "h-8 w-8 text-primary-glow animate-spin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg", children: "Consulting AI Consultant..." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Evaluating available hours, work style, and complexity." })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 space-y-4", children: [
          missionAdvice?.reasoning && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm leading-relaxed text-muted-foreground max-h-[160px] overflow-y-auto scrollbar-thin", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "AI Coach Assessment:" }),
            " ",
            missionAdvice.reasoning
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 grid-cols-1 md:grid-cols-3", children: missionAdvice?.strategies?.map((strat) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleSelectStrategyAndLaunch(strat.id), className: `flex flex-col text-left p-4 rounded-xl border transition-all duration-300 relative ${strat.recommended ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(168,85,247,0.15)] text-foreground scale-[1.01]" : "bg-background/40 border-border hover:bg-background/60 text-muted-foreground"}`, children: [
            strat.recommended && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-2.5 right-3 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-[8px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full", children: "Best Fit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-foreground mb-1", children: [
              strat.name,
              " Path"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-white/5 rounded px-1.5 py-0.5 self-start mb-2 text-muted-foreground", children: strat.duration }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground leading-normal mb-2 flex-grow", children: strat.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] space-y-0.5 mt-auto pt-2 border-t border-white/5 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-green-400 font-semibold", children: [
              "Pros: ",
              strat.pros?.[0]
            ] }) })
          ] }, strat.id)) })
        ] }),
        !analyzingMission && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { className: "border-t border-border pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setNewMissionStep(1), children: "Back" }) })
      ] }),
      newMissionStep === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-12 flex flex-col items-center justify-center gap-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-16 w-16", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full border-4 border-primary/20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full border-4 border-t-primary animate-spin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "absolute inset-0 m-auto h-6 w-6 text-primary-glow animate-pulse" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold tracking-tight", children: "Generating Flight Plan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-2 leading-relaxed max-w-sm", children: [
            'Decomposing "',
            newMissionTitle,
            '" into structured milestones based on the selected path and your personal availability quota.'
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isOpenOptimizeDialog, onOpenChange: setIsOpenOptimizeDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "glass-strong border border-border text-foreground max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "text-xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-5 w-5 text-primary-glow animate-spin", style: {
            animationDuration: "6s"
          } }),
          "Optimize Your Schedule"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-muted-foreground text-sm", children: "GoalPilot AI will reorganize your pending and missed tasks around your calendar events." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider block", children: "Select Current Energy Level" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: [{
          level: "low",
          label: "📉 Low",
          desc: "Short bursts"
        }, {
          level: "medium",
          label: "⚡ Medium",
          desc: "Standard flow"
        }, {
          level: "high",
          label: "🚀 High",
          desc: "Deep sprint"
        }].map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSelectedEnergyLevel(opt.level), className: `flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${selectedEnergyLevel === opt.level ? "bg-primary/10 border-primary shadow-[0_0_12px_rgba(168,85,247,0.1)] text-foreground" : "bg-background/40 border-border hover:bg-background/60 text-muted-foreground"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: opt.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground mt-0.5", children: opt.desc })
        ] }, opt.level)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setIsOpenOptimizeDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => handleOptimizeSchedule(selectedEnergyLevel), className: "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow border-0 cursor-pointer", children: "Optimize Schedule" })
      ] })
    ] }) }),
    reoptimizing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-20 w-20 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full border-4 border-primary/20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full border-4 border-t-primary animate-spin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "absolute inset-0 m-auto h-8 w-8 text-primary-glow animate-spin" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold tracking-tight text-foreground", children: "AI Rescheduling in Progress" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2 text-center max-w-xs px-4", children: "Evaluating calendar conflicts, priorities, and your energy level to construct a fresh execution plan..." })
    ] })
  ] });
}
const Loader2 = ({
  className
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: `animate-spin ${className}`, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
] });
export {
  Dashboard as component
};
