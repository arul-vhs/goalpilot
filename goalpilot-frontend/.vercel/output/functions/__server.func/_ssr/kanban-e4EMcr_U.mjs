import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { S as SidebarProvider, A as AppSidebar, a as SidebarTrigger } from "./app-sidebar-BZTQpdKh.mjs";
import { s as supabase } from "./client-hQzx3ycp.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as useUserState, g as getApiUrl, u as userState } from "./api-config-CUXI1WgJ.mjs";
import { l as SquareKanban, S as Sparkles, e as LoaderCircle } from "../_libs/lucide-react.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "./input-BiB-PFhx.mjs";
import "../_libs/tailwind-merge.mjs";
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
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const COLUMNS = [{
  id: "backlog",
  title: "Backlog",
  description: "Milestones to tackle later",
  color: "border-slate-800 bg-slate-900/10 text-slate-400"
}, {
  id: "todo",
  title: "To Do",
  description: "Ready for scheduling",
  color: "border-primary/20 bg-primary/5 text-primary-glow"
}, {
  id: "in_progress",
  title: "In Progress",
  description: "Currently running slots",
  color: "border-yellow-500/20 bg-yellow-500/5 text-yellow-400"
}, {
  id: "completed",
  title: "Completed",
  description: "Mission milestones met",
  color: "border-green-500/20 bg-green-500/5 text-green-400"
}];
function parseDesc(descStr) {
  try {
    const data = JSON.parse(descStr || "{}");
    return {
      notes: data.notes || descStr || "",
      is_goal: !!data.is_goal
    };
  } catch (e) {
    return {
      notes: descStr || "",
      is_goal: false
    };
  }
}
function KanbanBoardPage() {
  const {
    activeGoalId
  } = useUserState();
  const [tasks, setTasks] = reactExports.useState([]);
  const [goals, setGoals] = reactExports.useState([]);
  const [selectedGoal, setSelectedGoal] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [updatingTaskId, setUpdatingTaskId] = reactExports.useState(null);
  const [draggedOverColumn, setDraggedOverColumn] = reactExports.useState(null);
  const loadGoals = reactExports.useCallback(async () => {
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
  const loadTasks = reactExports.useCallback(async () => {
    if (!activeGoalId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const {
        data: goalData
      } = await supabase.from("goals").select("*").eq("id", activeGoalId).maybeSingle();
      setSelectedGoal(goalData);
      const {
        data: tasksData,
        error: tasksError
      } = await supabase.from("tasks").select("id,title,description,priority,effort,completed,goal_id,completion_status").eq("goal_id", activeGoalId).order("created_at", {
        ascending: true
      });
      if (tasksError) throw tasksError;
      const parsedTasks = (tasksData ?? []).map((t) => {
        const parsed = parseDesc(t.description);
        return {
          ...t,
          description: parsed.notes,
          is_goal: parsed.is_goal
        };
      }).filter((t) => !t.is_goal);
      setTasks(parsedTasks);
    } catch (err) {
      toast.error(err.message || "Failed to load Kanban tasks.");
    } finally {
      setLoading(false);
    }
  }, [activeGoalId]);
  reactExports.useEffect(() => {
    loadGoals();
  }, [loadGoals]);
  reactExports.useEffect(() => {
    loadTasks();
  }, [loadTasks, activeGoalId]);
  const tasksByColumn = reactExports.useMemo(() => {
    const map = {
      backlog: [],
      todo: [],
      in_progress: [],
      completed: []
    };
    tasks.forEach((t) => {
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
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setDraggedOverColumn(columnId);
  };
  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };
  const handleDrop = async (e, targetColumn) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    let currentColumn = "todo";
    if (task.completed) currentColumn = "completed";
    else if (task.completion_status === "in_progress") currentColumn = "in_progress";
    else if (task.completion_status === "backlog") currentColumn = "backlog";
    if (currentColumn === targetColumn) return;
    setTasks((prev) => prev.map((t) => {
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
      toast.success("Schedule reoptimized for override!", {
        id: toastId
      });
    } catch (err) {
      toast.error(err.message || "Failed to complete manual override.", {
        id: toastId
      });
      loadTasks();
    } finally {
      setUpdatingTaskId(null);
      loadTasks();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AppSidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col bg-slate-950 text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "h-14 flex items-center gap-3 border-b border-border px-4 glass", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarTrigger, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SquareKanban, { className: "h-4 w-4 text-primary-glow" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Kanban Board" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 p-6 lg:p-10 flex flex-col overflow-y-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
          opacity: 0,
          y: 10
        }, animate: {
          opacity: 1,
          y: 0
        }, transition: {
          duration: 0.5
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary-glow" }),
            " Dynamic Flight Plan"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-2 text-4xl font-bold tracking-tight", children: [
            "Active Mission: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text", children: selectedGoal?.title || "No Active Mission" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-muted-foreground", children: "Drag and drop milestones to re-prioritize. Tasks in **In Progress** are marked critical and scheduled immediately in Google Calendar." })
        ] }),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center justify-center py-24 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary-glow mr-2" }),
          " Loading Kanban Board..."
        ] }) : tasks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-center py-24 text-center text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SquareKanban, { className: "h-10 w-10 text-primary-glow opacity-60 mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-sm", children: "No tasks found for this mission. Go to Dashboard to create a roadmap." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start flex-1", children: COLUMNS.map((col) => {
          const colTasks = tasksByColumn[col.id];
          const isDraggedOver = draggedOverColumn === col.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onDragOver: (e) => handleDragOver(e, col.id), onDragLeave: handleDragLeave, onDrop: (e) => handleDrop(e, col.id), className: `flex flex-col h-full rounded-2xl border p-4 transition-all duration-300 min-h-[450px] ${col.color} ${isDraggedOver ? "border-primary scale-[1.01] shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-slate-900/60" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between items-center mb-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-foreground text-sm flex items-center gap-2", children: [
              col.title,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-muted-foreground", children: colTasks.length })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mb-4 font-normal tracking-wide", children: col.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-3 overflow-y-auto pr-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: colTasks.map((t) => {
                const isUpdating = updatingTaskId === t.id;
                let prioClass = "text-slate-400 bg-slate-500/10 border-slate-500/20";
                if (t.priority === "critical" || t.priority === "high") {
                  prioClass = "text-red-400 bg-red-500/10 border-red-500/20";
                } else if (t.priority === "medium") {
                  prioClass = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
                }
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { draggable: !isUpdating, onDragStart: (e) => handleDragStart(e, t.id), layoutId: t.id, initial: {
                  opacity: 0,
                  y: 5
                }, animate: {
                  opacity: 1,
                  y: 0
                }, exit: {
                  opacity: 0,
                  y: -5
                }, transition: {
                  type: "spring",
                  stiffness: 350,
                  damping: 25
                }, className: `p-4 rounded-xl border border-border bg-slate-950/60 hover:bg-slate-900 hover:border-slate-800 transition cursor-grab active:cursor-grabbing relative ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`, children: [
                  isUpdating && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-slate-950/40 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-primary" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: `text-xs font-semibold leading-relaxed ${t.completed ? "line-through text-muted-foreground" : "text-foreground"}`, children: t.title }),
                  t.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed", children: t.description }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-3 pt-2.5 border-t border-white/5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[8px] uppercase tracking-wider font-bold border px-1.5 py-0.5 rounded ${prioClass}`, children: t.priority }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] text-muted-foreground font-medium bg-white/5 px-2 py-0.5 rounded-full border border-white/5", children: [
                      t.effort,
                      " hrs effort"
                    ] })
                  ] })
                ] }, t.id);
              }) }),
              colTasks.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center border border-dashed border-white/5 rounded-xl py-12 text-[10px] text-muted-foreground/60 select-none", children: "Drop tasks here" })
            ] })
          ] }, col.id);
        }) })
      ] })
    ] })
  ] }) });
}
export {
  KanbanBoardPage as component
};
