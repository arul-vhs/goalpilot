import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { S as SidebarProvider, A as AppSidebar, a as SidebarTrigger, D as Dialog, b as DialogTrigger, c as DialogContent, d as DialogHeader, e as DialogTitle, f as Select, g as SelectTrigger, h as SelectValue, i as SelectContent, j as SelectItem } from "./app-sidebar-JfnbziOs.mjs";
import { s as supabase } from "./client-hQzx3ycp.mjs";
import { B as Button, I as Input, c as cn } from "./input-BiB-PFhx.mjs";
import { L as Label } from "./label-D4W0VQAM.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as useUserState, g as getApiUrl, u as userState } from "./api-config-6k5iAoHf.mjs";
import { N as Network, d as Plus, T as Target, S as Sparkles, e as LoaderCircle, U as User, f as Circle, g as Activity, h as CircleCheck, X, i as Link, j as Pen, k as Trash2 } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const ForceGraph2D = reactExports.lazy(() => import("../_libs/react-force-graph-2d.mjs"));
const commonWords = /* @__PURE__ */ new Set(["the", "and", "for", "with", "your", "that", "this", "have", "from", "build", "learn", "setup", "create", "make", "design", "implem", "implement", "developing", "developer", "development", "integration", "integrate", "using", "write", "code"]);
function getSignificantWords(title) {
  return title.toLowerCase().split(/\s+/).map((w) => w.replace(/[^a-z0-9]/g, "")).filter((w) => w.length > 3 && !commonWords.has(w));
}
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
function buildGraphData(goals, tasks, positions, profileName) {
  const nodes = [];
  const links = [];
  const posMap = new Map(positions?.map((p) => [p.task_id, p]) || []);
  nodes.push({
    id: "user-profile",
    title: profileName || "You",
    isCenter: true,
    val: 16,
    fx: posMap.has("user-profile") ? posMap.get("user-profile").x : void 0,
    fy: posMap.has("user-profile") ? posMap.get("user-profile").y : void 0
  });
  goals.forEach((g) => {
    nodes.push({
      id: g.id,
      title: g.title,
      isGoal: true,
      val: 9,
      completed: g.completed,
      fx: posMap.has(g.id) ? posMap.get(g.id).x : void 0,
      fy: posMap.has(g.id) ? posMap.get(g.id).y : void 0
    });
    links.push({
      source: "user-profile",
      target: g.id,
      isCenterLink: true
    });
  });
  const taskIds = new Set(tasks.map((t) => t.id));
  tasks.forEach((t) => {
    const parsed = parseDesc(t.description);
    nodes.push({
      id: t.id,
      title: t.title,
      isGoal: false,
      notes: parsed.notes,
      val: 3 + Math.min(t.effort, 6),
      completed: t.completed,
      completion_status: t.completion_status,
      priority: t.priority,
      effort: t.effort,
      depends_on: t.depends_on,
      goal_id: t.goal_id,
      fx: posMap.has(t.id) ? posMap.get(t.id).x : void 0,
      fy: posMap.has(t.id) ? posMap.get(t.id).y : void 0
    });
    if (t.goal_id) {
      links.push({
        source: t.goal_id,
        target: t.id,
        isGoalLink: true
      });
    }
    if (t.depends_on && taskIds.has(t.depends_on)) {
      links.push({
        source: t.depends_on,
        target: t.id,
        isDependencyLink: true
      });
    }
  });
  const taskKeywords = tasks.map((t) => ({
    id: t.id,
    goalId: t.goal_id,
    keywords: getSignificantWords(t.title)
  }));
  for (let i = 0; i < taskKeywords.length; i++) {
    for (let j = i + 1; j < taskKeywords.length; j++) {
      const t1 = taskKeywords[i];
      const t2 = taskKeywords[j];
      if (t1.goalId !== t2.goalId && t1.keywords.some((k) => t2.keywords.includes(k))) {
        links.push({
          source: t1.id,
          target: t2.id,
          isSemanticLink: true
        });
      }
    }
  }
  return {
    nodes,
    links
  };
}
function KnowledgeGraphPage() {
  const containerRef = reactExports.useRef(null);
  const graphRef = reactExports.useRef(null);
  const [size, setSize] = reactExports.useState({
    w: 800,
    h: 600
  });
  const [goals, setGoals] = reactExports.useState([]);
  const [tasks, setTasks] = reactExports.useState([]);
  const [positions, setPositions] = reactExports.useState([]);
  const [profileName, setProfileName] = reactExports.useState("Me");
  const [loading, setLoading] = reactExports.useState(true);
  const [selected, setSelected] = reactExports.useState(null);
  const [openCreate, setOpenCreate] = reactExports.useState(false);
  const [newTitle, setNewTitle] = reactExports.useState("");
  const [newNotes, setNewNotes] = reactExports.useState("");
  const [newPriority, setNewPriority] = reactExports.useState("medium");
  const [newEffort, setNewEffort] = reactExports.useState(3);
  const [newDependsOn, setNewDependsOn] = reactExports.useState("none");
  const [newIsGoal, setNewIsGoal] = reactExports.useState(false);
  const [editTitle, setEditTitle] = reactExports.useState("");
  const [editNotes, setEditNotes] = reactExports.useState("");
  const [editPriority, setEditPriority] = reactExports.useState("medium");
  const [editEffort, setEditEffort] = reactExports.useState(3);
  const [editDependsOn, setEditDependsOn] = reactExports.useState("none");
  const {
    activeGoalId,
    userId
  } = useUserState();
  reactExports.useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setSize({
        w: rect.width,
        h: rect.height
      });
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);
  const loadData = reactExports.useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const {
        data: profData
      } = await supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle();
      if (profData?.display_name) {
        setProfileName(profData.display_name);
      }
      const goalsRes = await fetch(getApiUrl("user-goals"), {
        headers: userState.getAuthHeaders()
      });
      let fetchedGoals = [];
      if (goalsRes.ok) {
        fetchedGoals = await goalsRes.json();
        setGoals(fetchedGoals);
      }
      const {
        data: tasksData,
        error: tasksError
      } = await supabase.from("tasks").select("id,title,description,priority,effort,depends_on,completed,goal_id,completion_status").eq("user_id", userId).order("created_at", {
        ascending: true
      });
      if (tasksError) throw tasksError;
      setTasks(tasksData ?? []);
      const {
        data: posData,
        error: posError
      } = await supabase.from("task_positions").select("*").eq("user_id", userId);
      if (!posError && posData) {
        setPositions(posData);
      }
    } catch (err) {
      console.error("Failed to load global graph:", err);
      toast.error(err.message || "Failed to load global neural graph.");
    } finally {
      setLoading(false);
    }
  }, [userId]);
  reactExports.useEffect(() => {
    loadData();
  }, [loadData]);
  const graphData = reactExports.useMemo(() => {
    return buildGraphData(goals, tasks, positions, profileName);
  }, [goals, tasks, positions, profileName]);
  reactExports.useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force("charge").strength(-120);
      graphRef.current.d3Force("link").distance(60);
    }
  }, [graphData]);
  reactExports.useEffect(() => {
    if (selected) {
      setEditTitle(selected.title);
      setEditNotes(selected.notes || "");
      setEditPriority(selected.priority || "medium");
      setEditEffort(selected.effort || 3);
      setEditDependsOn(selected.depends_on || "none");
    } else {
      setEditTitle("");
      setEditNotes("");
    }
  }, [selected]);
  const saveNodePosition = async (nodeId, x, y) => {
    if (!userId) return;
    try {
      const {
        error
      } = await supabase.from("task_positions").upsert({
        user_id: userId,
        task_id: nodeId,
        x,
        y,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }, {
        onConflict: "user_id,task_id"
      });
      if (error) console.warn("Task positions persistence not active or failed:", error.message);
    } catch (err) {
      console.warn("Exception during position save:", err);
    }
  };
  const handleSaveEdit = async () => {
    if (!selected) return;
    try {
      const descJson = JSON.stringify({
        notes: editNotes
      });
      const dep = editDependsOn === "none" ? null : editDependsOn;
      const {
        error
      } = await supabase.from("tasks").update({
        title: editTitle,
        description: descJson,
        priority: editPriority,
        effort: editEffort,
        depends_on: dep
      }).eq("id", selected.id);
      if (error) throw error;
      toast.success("Task updated.");
      setSelected(null);
      await loadData();
    } catch (e) {
      toast.error(e.message || "Failed to update task.");
    }
  };
  const handleToggleCompleted = async (node) => {
    try {
      const {
        error
      } = await supabase.from("tasks").update({
        completed: !node.completed
      }).eq("id", node.id);
      if (error) throw error;
      toast.success(node.completed ? "Task set to pending." : "Task completed!");
      if (selected && selected.id === node.id) {
        setSelected({
          ...selected,
          completed: !node.completed
        });
      }
      await loadData();
    } catch (e) {
      toast.error(e.message || "Failed to update task status.");
    }
  };
  const handleDeleteTask = async (taskId) => {
    try {
      const {
        error
      } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
      toast.success("Task deleted.");
      setSelected(null);
      await loadData();
    } catch (e) {
      toast.error(e.message || "Failed to delete task.");
    }
  };
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const descJson = JSON.stringify({
        notes: newNotes,
        is_goal: newIsGoal,
        scheduled_start: null,
        scheduled_end: null
      });
      const dep = newDependsOn === "none" ? null : newDependsOn;
      const newUUID = window.crypto.randomUUID();
      if (newIsGoal) {
        const {
          error: goalsErr
        } = await supabase.from("goals").insert({
          id: newUUID,
          user_id: userId,
          title: newTitle,
          status: "pending"
        });
        if (goalsErr) throw goalsErr;
        await supabase.from("profiles").update({
          last_active_goal_id: newUUID
        }).eq("id", userId);
        userState.setActiveGoalId(newUUID);
      }
      const {
        error
      } = await supabase.from("tasks").insert({
        id: newIsGoal ? newUUID : void 0,
        user_id: userId,
        title: newTitle,
        description: descJson,
        priority: newPriority,
        effort: newEffort,
        depends_on: dep,
        completed: false,
        goal_id: newIsGoal ? null : activeGoalId
      });
      if (error) throw error;
      toast.success("New node added to graph.");
      setNewTitle("");
      setNewNotes("");
      setNewPriority("medium");
      setNewEffort(3);
      setNewDependsOn("none");
      setNewIsGoal(false);
      setOpenCreate(false);
      await loadData();
    } catch (e2) {
      toast.error(e2.message || "Failed to create node.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AppSidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col bg-slate-950 text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "h-14 flex items-center gap-3 border-b border-border px-4 glass", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarTrigger, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Network, { className: "h-4 w-4 text-primary-glow" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Global Neural View" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: openCreate, onOpenChange: setOpenCreate, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
            " Add Goal or Task"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "glass-strong border-border text-foreground max-w-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "text-xl font-bold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-5 w-5 text-primary-glow" }),
              " Create New Node"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateTask, className: "space-y-4 mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "title", children: "Title" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "title", required: true, value: newTitle, onChange: (e) => setNewTitle(e.target.value), placeholder: "e.g. Build API endpoints", className: "bg-background/40 border-border" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notes", children: "Notes / Details" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "notes", value: newNotes, onChange: (e) => setNewNotes(e.target.value), placeholder: "Describe details...", className: "bg-background/40 border-border" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "priority", children: "Priority" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: newPriority, onValueChange: (val) => setNewPriority(val), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-background/40 border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Priority" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "glass-strong border-border text-foreground", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "low", children: "Low" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "medium", children: "Medium" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "high", children: "High" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "critical", children: "Critical" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "effort", children: "Effort (1-10)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "effort", type: "number", min: 1, max: 10, value: newEffort, onChange: (e) => setNewEffort(Number(e.target.value)), className: "bg-background/40 border-border" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "depends_on", children: "Depends On (Pre-requisite)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: newDependsOn || "none", onValueChange: (val) => setNewDependsOn(val), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-background/40 border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "No dependency" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "glass-strong border-border text-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "No dependency" }),
                    tasks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.id, children: t.title }, t.id))
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "is_goal", checked: newIsGoal, onChange: (e) => setNewIsGoal(e.target.checked), className: "rounded border-border accent-primary h-4 w-4 bg-background/40" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "is_goal", className: "text-sm font-medium cursor-pointer", children: "Mark as Primary Goal" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-4 border-t border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setOpenCreate(false), children: "Cancel" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground border-0", children: "Create Node" })
              ] })
            ] })
          ] })
        ] })
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
            " Connected workspace"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-2 text-4xl font-bold tracking-tight", children: [
            "Global ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text", children: "Neural View" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-muted-foreground", children: "A constellation mapping of your lifepath. Node orbits reflect task dependencies, center connections, and title keyword associations. Click to edit." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid flex-1 min-h-[520px] gap-6 lg:grid-cols-[1fr_360px] items-stretch", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: "glass-strong rounded-2xl overflow-hidden relative border border-border min-h-[500px] bg-[#03000a] flex flex-col justify-between", children: [
            loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center text-muted-foreground bg-slate-950/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary-glow" }) }) : tasks.length === 0 && goals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Network, { className: "h-10 w-10 text-primary-glow opacity-60" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground max-w-sm text-xs", children: 'No tasks or goals yet. Click "Add Goal or Task" to build your neural constellation.' })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center text-muted-foreground", children: "Rendering canvas…" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForceGraph2D, { ref: graphRef, graphData, width: size.w, height: size.h, backgroundColor: "#03000a", nodeLabel: (node) => node.title, linkColor: (link) => {
              if (link.isSemanticLink) return "rgba(255, 255, 255, 0.03)";
              if (link.isCenterLink) return "rgba(255, 255, 255, 0.08)";
              return "rgba(255, 255, 255, 0.06)";
            }, linkWidth: (link) => link.isSemanticLink ? 0.8 : 1, linkCanvasObjectMode: () => "after", linkCanvasObject: (link, ctx, scale) => {
              if (link.isSemanticLink) {
                ctx.beginPath();
                ctx.moveTo(link.source.x, link.source.y);
                ctx.lineTo(link.target.x, link.target.y);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
                ctx.lineWidth = 0.5 / scale;
                ctx.setLineDash([2, 4]);
                ctx.stroke();
                ctx.setLineDash([]);
              }
            }, onNodeDragEnd: (node) => {
              node.fx = node.x;
              node.fy = node.y;
              saveNodePosition(node.id, node.x, node.y);
            }, onNodeClick: (node) => {
              if (node.isCenter) {
                setSelected(null);
                return;
              }
              setSelected(node);
            }, nodeCanvasObject: (node, ctx, scale) => {
              const label = node.title;
              const r = node.isCenter ? 6 : node.isGoal ? 4.5 : 3;
              const x = node.x;
              const y = node.y;
              if (typeof x !== "number" || typeof y !== "number" || !isFinite(x) || !isFinite(y)) return;
              const isSelected = selected?.id === node.id;
              let nodeColor = "#475569";
              let glowColor = "rgba(148, 163, 184, 0.15)";
              if (node.isCenter) {
                nodeColor = "#f8fafc";
                glowColor = "rgba(255, 255, 255, 0.4)";
              } else if (node.isGoal) {
                nodeColor = "#94a3b8";
                glowColor = "rgba(148, 163, 184, 0.25)";
              } else if (node.completed) {
                nodeColor = "#22c55e";
                glowColor = "rgba(34, 197, 94, 0.25)";
              } else if (node.completion_status === "in_progress") {
                nodeColor = "#eab308";
                glowColor = "rgba(234, 179, 8, 0.25)";
              }
              ctx.beginPath();
              ctx.arc(x, y, r + 4, 0, 2 * Math.PI);
              ctx.fillStyle = glowColor;
              ctx.fill();
              ctx.beginPath();
              ctx.arc(x, y, r, 0, 2 * Math.PI);
              ctx.fillStyle = nodeColor;
              ctx.fill();
              if (isSelected) {
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.5 / scale;
                ctx.stroke();
              }
              if (scale > 1.2 || node.isGoal || node.isCenter) {
                const fontSize = Math.max(8, 10 / scale);
                ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillStyle = node.isCenter ? "rgba(255, 255, 255, 0.9)" : "rgba(148, 163, 184, 0.8)";
                let displayLabel = label;
                if (scale < 0.8 && label.length > 15) {
                  displayLabel = label.slice(0, 12) + "...";
                }
                ctx.fillText(displayLabel, x, y + r + 3);
              }
            } }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-4 left-4 p-3 rounded-xl border border-white/5 bg-slate-950/80 backdrop-blur-md text-[10px] text-muted-foreground space-y-1.5 z-10 select-none", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-foreground uppercase tracking-wider text-[8px] mb-1", children: "Neural Graph Legend" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3 text-slate-50" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Center Orbit (Me)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-3 w-3 text-slate-400" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Primary Goals" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-3 w-3 text-slate-500 fill-slate-500/20" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pending Milestones" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-3 w-3 text-yellow-400" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "In Progress Tasks" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 text-green-400" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Completed Goals/Tasks" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1 border-t border-white/5 pt-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-4 border-t border-slate-700" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Hierarchy Flow" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-4 border-t border-dashed border-slate-800" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Keyword Connection" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "glass-strong rounded-2xl p-5 border border-border min-h-[300px] relative flex flex-col justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: selected ? /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
            opacity: 0,
            x: 15
          }, animate: {
            opacity: 1,
            x: 0
          }, exit: {
            opacity: 0,
            x: 15
          }, transition: {
            duration: 0.2
          }, className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground", children: selected.isGoal ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-300 font-semibold flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-3.5 w-3.5 text-slate-400" }),
                " Goal Node"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Network, { className: "h-3.5 w-3.5" }),
                " Task Node"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelected(null), className: "rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-white/5 border-0 bg-transparent cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Title" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editTitle, onChange: (e) => setEditTitle(e.target.value), className: "bg-background/40 h-9 font-medium border-border" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Description / Notes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: editNotes, onChange: (e) => setEditNotes(e.target.value), className: "bg-background/40 text-xs leading-relaxed border-border" })
              ] }),
              !selected.isGoal && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Priority" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editPriority, onValueChange: (val) => setEditPriority(val), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-background/40 h-9 border-border text-xs text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "glass-strong border-border text-xs text-foreground bg-slate-950", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "low", children: "Low" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "medium", children: "Medium" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "high", children: "High" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "critical", children: "Critical" })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Effort (1-10)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 10, value: editEffort, onChange: (e) => setEditEffort(Number(e.target.value)), className: "bg-background/40 h-9 text-xs border-border" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-3 w-3" }),
                    " Depends on (Pre-requisite)"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editDependsOn || "none", onValueChange: (val) => setEditDependsOn(val), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-background/40 h-9 border-border text-xs text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "glass-strong border-border text-xs text-foreground bg-slate-950", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "No dependency" }),
                      tasks.filter((t) => t.id !== selected.id).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.id, children: t.title }, t.id))
                    ] })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border space-y-3", children: [
              !selected.isGoal && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => handleToggleCompleted(selected), variant: selected.completed ? "outline" : "default", className: `w-full gap-2 text-xs cursor-pointer border-0 ${selected.completed ? "border-green-500/30 text-green-400 bg-green-500/5 hover:bg-green-500/10" : "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground"}`, children: selected.completed ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
                " Completed"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-4 w-4" }),
                " Mark Completed"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleSaveEdit, className: "flex-1 text-xs gap-1.5 bg-white/5 border border-border hover:bg-white/10 cursor-pointer", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-3.5 w-3.5" }),
                  " Save Changes"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "destructive", onClick: () => handleDeleteTask(selected.id), className: "px-3 bg-red-950/40 border border-red-500/20 text-red-400 hover:bg-red-900/40 cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
              ] })
            ] })
          ] }, selected.id) : /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
            opacity: 0
          }, animate: {
            opacity: 1
          }, exit: {
            opacity: 0
          }, className: "flex h-full min-h-[200px] flex-col items-center justify-center text-center text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Network, { className: "h-8 w-8 mb-2 text-primary-glow opacity-50 animate-pulse" }),
            "Select any node on the graph constellation to inspect, update, or edit links and dependencies."
          ] }, "empty") }) })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  KnowledgeGraphPage as component
};
