import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Sparkles, X, Plus, Zap, Flag, Loader2, CheckCircle2, Circle, Trash2, Edit2, Link as LinkIcon, Target, User, HelpCircle, Activity } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { userState, useUserState } from "@/lib/userState";
import { getApiUrl } from "@/lib/api-config";

export const Route = createFileRoute("/_authenticated/knowledge-graph")({
  component: KnowledgeGraphPage,
});

const ForceGraph2D = lazy(() => import("react-force-graph-2d"));

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "critical";
  effort: number;
  depends_on: string | null;
  completed: boolean;
  goal_id: string | null;
  completion_status: string | null;
};

type GraphNode = {
  id: string;
  title: string;
  isCenter?: boolean;
  isGoal?: boolean;
  completed?: boolean;
  completion_status?: string | null;
  val: number;
  notes?: string;
  priority?: "low" | "medium" | "high" | "critical";
  effort?: number;
  depends_on?: string | null;
  goal_id?: string | null;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
};

type GraphLink = {
  source: string;
  target: string;
  isCenterLink?: boolean;
  isGoalLink?: boolean;
  isDependencyLink?: boolean;
  isSemanticLink?: boolean;
};

type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

const commonWords = new Set([
  "the", "and", "for", "with", "your", "that", "this", "have", "from", "build", 
  "learn", "setup", "create", "make", "design", "implem", "implement", "developing",
  "developer", "development", "integration", "integrate", "using", "write", "code"
]);

function getSignificantWords(title: string): string[] {
  return title
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.replace(/[^a-z0-9]/g, ""))
    .filter(w => w.length > 3 && !commonWords.has(w));
}

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

function buildGraphData(goals: any[], tasks: Task[], positions: any[], profileName: string): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // Map coordinates
  const posMap = new Map(positions?.map(p => [p.task_id, p]) || []);

  // 1. Add center node for User Profile
  nodes.push({
    id: "user-profile",
    title: profileName || "You",
    isCenter: true,
    val: 16,
    fx: posMap.has("user-profile") ? posMap.get("user-profile")!.x : undefined,
    fy: posMap.has("user-profile") ? posMap.get("user-profile")!.y : undefined,
  });

  // 2. Add goal nodes and link them to user profile
  goals.forEach(g => {
    nodes.push({
      id: g.id,
      title: g.title,
      isGoal: true,
      val: 9,
      completed: g.completed,
      fx: posMap.has(g.id) ? posMap.get(g.id)!.x : undefined,
      fy: posMap.has(g.id) ? posMap.get(g.id)!.y : undefined,
    });

    links.push({
      source: "user-profile",
      target: g.id,
      isCenterLink: true
    });
  });

  // 3. Add task nodes and link them to goals, dependencies
  const taskIds = new Set(tasks.map(t => t.id));
  tasks.forEach(t => {
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
      fx: posMap.has(t.id) ? posMap.get(t.id)!.x : undefined,
      fy: posMap.has(t.id) ? posMap.get(t.id)!.y : undefined,
    });

    // Link task to goal
    if (t.goal_id) {
      links.push({
        source: t.goal_id,
        target: t.id,
        isGoalLink: true
      });
    }

    // Link dependency
    if (t.depends_on && taskIds.has(t.depends_on)) {
      links.push({
        source: t.depends_on,
        target: t.id,
        isDependencyLink: true
      });
    }
  });

  // 4. Link related tasks of different goals (semantic interlinking)
  const taskKeywords = tasks.map(t => ({
    id: t.id,
    goalId: t.goal_id,
    keywords: getSignificantWords(t.title)
  }));

  for (let i = 0; i < taskKeywords.length; i++) {
    for (let j = i + 1; j < taskKeywords.length; j++) {
      const t1 = taskKeywords[i];
      const t2 = taskKeywords[j];
      
      if (t1.goalId !== t2.goalId && t1.keywords.some(k => t2.keywords.includes(k))) {
        links.push({
          source: t1.id,
          target: t2.id,
          isSemanticLink: true
        });
      }
    }
  }

  return { nodes, links };
}

function KnowledgeGraphPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [goals, setGoals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [profileName, setProfileName] = useState("Me");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  
  // Create task dialog state
  const [openCreate, setOpenCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [newEffort, setNewEffort] = useState(3);
  const [newDependsOn, setNewDependsOn] = useState<string | null>("none");
  const [newIsGoal, setNewIsGoal] = useState(false);

  // Edit fields for selected task
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [editEffort, setEditEffort] = useState(3);
  const [editDependsOn, setEditDependsOn] = useState<string | null>("none");

  const { activeGoalId, userId } = useUserState();

  // Track container size for the canvas
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // 1. Fetch profile name
      const { data: profData } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .maybeSingle();
      if (profData?.display_name) {
        setProfileName(profData.display_name);
      }

      // 2. Fetch goals
      const goalsRes = await fetch(getApiUrl("user-goals"), {
        headers: userState.getAuthHeaders()
      });
      let fetchedGoals = [];
      if (goalsRes.ok) {
        fetchedGoals = await goalsRes.json();
        setGoals(fetchedGoals);
      }

      // 3. Fetch all tasks for user
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("id,title,description,priority,effort,depends_on,completed,goal_id,completion_status")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
        
      if (tasksError) throw tasksError;
      setTasks((tasksData ?? []) as Task[]);

      // 4. Fetch node positions
      const { data: posData, error: posError } = await supabase
        .from("task_positions")
        .select("*")
        .eq("user_id", userId);
        
      if (!posError && posData) {
        setPositions(posData);
      }
    } catch (err: any) {
      console.error("Failed to load global graph:", err);
      toast.error(err.message || "Failed to load global neural graph.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const graphData = useMemo(() => {
    return buildGraphData(goals, tasks, positions, profileName);
  }, [goals, tasks, positions, profileName]);

  // Obsidian Constellation Node Layout Configs
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force("charge").strength(-120);
      graphRef.current.d3Force("link").distance(60);
    }
  }, [graphData]);

  // Sync edits when selected node changes
  useEffect(() => {
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

  // Save coordinates on drag end
  const saveNodePosition = async (nodeId: string, x: number, y: number) => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from("task_positions")
        .upsert({
          user_id: userId,
          task_id: nodeId,
          x,
          y,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id,task_id" });
      if (error) console.warn("Task positions persistence not active or failed:", error.message);
    } catch (err) {
      console.warn("Exception during position save:", err);
    }
  };

  // Save changes to selected task
  const handleSaveEdit = async () => {
    if (!selected) return;
    try {
      const descJson = JSON.stringify({
        notes: editNotes,
      });

      const dep = editDependsOn === "none" ? null : editDependsOn;

      const { error } = await supabase
        .from("tasks")
        .update({
          title: editTitle,
          description: descJson,
          priority: editPriority,
          effort: editEffort,
          depends_on: dep,
        })
        .eq("id", selected.id);

      if (error) throw error;
      toast.success("Task updated.");
      
      setSelected(null);
      await loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to update task.");
    }
  };

  // Toggle completed status
  const handleToggleCompleted = async (node: GraphNode) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !node.completed })
        .eq("id", node.id);

      if (error) throw error;
      toast.success(node.completed ? "Task set to pending." : "Task completed!");
      
      if (selected && selected.id === node.id) {
        setSelected({ ...selected, completed: !node.completed });
      }
      await loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to update task status.");
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
      toast.success("Task deleted.");
      setSelected(null);
      await loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete task.");
    }
  };

  // Create new task or goal
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const descJson = JSON.stringify({
        notes: newNotes,
        is_goal: newIsGoal,
        scheduled_start: null,
        scheduled_end: null,
      });

      const dep = newDependsOn === "none" ? null : newDependsOn;
      const newUUID = window.crypto.randomUUID();

      if (newIsGoal) {
        // Create in goals table
        const { error: goalsErr } = await supabase.from("goals").insert({
          id: newUUID,
          user_id: userId,
          title: newTitle,
          status: "pending"
        });
        if (goalsErr) throw goalsErr;
        
        // Update profile
        await supabase
          .from("profiles")
          .update({ last_active_goal_id: newUUID })
          .eq("id", userId);
          
        userState.setActiveGoalId(newUUID);
      }

      const { error } = await supabase.from("tasks").insert({
        id: newIsGoal ? newUUID : undefined,
        user_id: userId,
        title: newTitle,
        description: descJson,
        priority: newPriority,
        effort: newEffort,
        depends_on: dep,
        completed: false,
        goal_id: newIsGoal ? null : activeGoalId,
      });

      if (error) throw error;
      toast.success("New node added to graph.");
      
      // Reset form
      setNewTitle("");
      setNewNotes("");
      setNewPriority("medium");
      setNewEffort(3);
      setNewDependsOn("none");
      setNewIsGoal(false);
      setOpenCreate(false);
      await loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to create node.");
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
              <Network className="h-4 w-4 text-primary-glow" />
              <span className="font-medium">Global Neural View</span>
            </div>
            <div className="flex-1" />
            
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
                  <Plus className="h-3.5 w-3.5" /> Add Goal or Task
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-strong border-border text-foreground max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary-glow" /> Create New Node
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Build API endpoints" className="bg-background/40 border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes / Details</Label>
                    <Textarea id="notes" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Describe details..." className="bg-background/40 border-border" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newPriority} onValueChange={(val: any) => setNewPriority(val)}>
                        <SelectTrigger className="bg-background/40 border-border">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent className="glass-strong border-border text-foreground">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="effort">Effort (1-10)</Label>
                      <Input id="effort" type="number" min={1} max={10} value={newEffort} onChange={(e) => setNewEffort(Number(e.target.value))} className="bg-background/40 border-border" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depends_on">Depends On (Pre-requisite)</Label>
                    <Select value={newDependsOn || "none"} onValueChange={(val) => setNewDependsOn(val)}>
                      <SelectTrigger className="bg-background/40 border-border">
                        <SelectValue placeholder="No dependency" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-border text-foreground">
                        <SelectItem value="none">No dependency</SelectItem>
                        {tasks.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="is_goal" checked={newIsGoal} onChange={(e) => setNewIsGoal(e.target.checked)} className="rounded border-border accent-primary h-4 w-4 bg-background/40" />
                    <Label htmlFor="is_goal" className="text-sm font-medium cursor-pointer">Mark as Primary Goal</Label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button type="button" variant="ghost" onClick={() => setOpenCreate(false)}>Cancel</Button>
                    <Button type="submit" className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground border-0">Create Node</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </header>

          <main className="flex-1 p-6 lg:p-10 flex flex-col overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary-glow" /> Connected workspace
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                Global <span className="gradient-text">Neural View</span>
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                A constellation mapping of your lifepath. Node orbits reflect task dependencies, center connections, and title keyword associations. Click to edit.
              </p>
            </motion.div>

            <div className="mt-6 grid flex-1 min-h-[520px] gap-6 lg:grid-cols-[1fr_360px] items-stretch">
              <div
                ref={containerRef}
                className="glass-strong rounded-2xl overflow-hidden relative border border-border min-h-[500px] bg-[#03000a] flex flex-col justify-between"
              >
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-slate-950/50">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
                  </div>
                ) : tasks.length === 0 && goals.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
                    <Network className="h-10 w-10 text-primary-glow opacity-60" />
                    <p className="text-muted-foreground max-w-sm text-xs">
                      No tasks or goals yet. Click "Add Goal or Task" to build your neural constellation.
                    </p>
                  </div>
                ) : (
                  <div className="absolute inset-0">
                    <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-muted-foreground">Rendering canvas…</div>}>
                      <ForceGraph2D
                        ref={graphRef}
                        graphData={graphData}
                        width={size.w}
                        height={size.h}
                        backgroundColor="#03000a"
                        nodeLabel={(node: any) => node.title}
                        linkColor={(link: any) => {
                          if (link.isSemanticLink) return "rgba(255, 255, 255, 0.03)";
                          if (link.isCenterLink) return "rgba(255, 255, 255, 0.08)";
                          return "rgba(255, 255, 255, 0.06)";
                        }}
                        linkWidth={(link: any) => (link.isSemanticLink ? 0.8 : 1)}
                        linkCanvasObjectMode={() => "after"}
                        linkCanvasObject={(link: any, ctx, scale) => {
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
                        }}
                        onNodeDragEnd={(node: any) => {
                          node.fx = node.x;
                          node.fy = node.y;
                          saveNodePosition(node.id, node.x, node.y);
                        }}
                        onNodeClick={(node: any) => {
                          if (node.isCenter) {
                            setSelected(null);
                            return;
                          }
                          setSelected(node);
                        }}
                        nodeCanvasObject={(node: any, ctx, scale) => {
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

                          // Glow Ring
                          ctx.beginPath();
                          ctx.arc(x, y, r + 4, 0, 2 * Math.PI);
                          ctx.fillStyle = glowColor;
                          ctx.fill();

                          // Core Node
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
                        }}
                      />
                    </Suspense>
                  </div>
                )}
                
                {/* Neural Legend panel */}
                <div className="absolute bottom-4 left-4 p-3 rounded-xl border border-white/5 bg-slate-950/80 backdrop-blur-md text-[10px] text-muted-foreground space-y-1.5 z-10 select-none">
                  <div className="font-semibold text-foreground uppercase tracking-wider text-[8px] mb-1">Neural Graph Legend</div>
                  <div className="flex items-center gap-1.5"><User className="h-3 w-3 text-slate-50" /> <span>Center Orbit (Me)</span></div>
                  <div className="flex items-center gap-1.5"><Target className="h-3 w-3 text-slate-400" /> <span>Primary Goals</span></div>
                  <div className="flex items-center gap-1.5"><Circle className="h-3 w-3 text-slate-500 fill-slate-500/20" /> <span>Pending Milestones</span></div>
                  <div className="flex items-center gap-1.5"><Activity className="h-3 w-3 text-yellow-400" /> <span>In Progress Tasks</span></div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-400" /> <span>Completed Goals/Tasks</span></div>
                  <div className="flex items-center gap-2 mt-1 border-t border-white/5 pt-1.5">
                    <span className="inline-block w-4 border-t border-slate-700"></span> <span>Hierarchy Flow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-4 border-t border-dashed border-slate-800"></span> <span>Keyword Connection</span>
                  </div>
                </div>
              </div>

              {/* Detail side panel with complete editing capabilities */}
              <aside className="glass-strong rounded-2xl p-5 border border-border min-h-[300px] relative flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {selected ? (
                    <motion.div
                      key={selected.id}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {selected.isGoal ? (
                            <span className="text-slate-300 font-semibold flex items-center gap-1">
                              <Target className="h-3.5 w-3.5 text-slate-400" /> Goal Node
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Network className="h-3.5 w-3.5" /> Task Node
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setSelected(null)}
                          className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-white/5 border-0 bg-transparent cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Editing fields */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Title</Label>
                          <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="bg-background/40 h-9 font-medium border-border" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Description / Notes</Label>
                          <Textarea rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="bg-background/40 text-xs leading-relaxed border-border" />
                        </div>
                        
                        {!selected.isGoal && (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Priority</Label>
                                <Select value={editPriority} onValueChange={(val: any) => setEditPriority(val)}>
                                  <SelectTrigger className="bg-background/40 h-9 border-border text-xs text-foreground">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="glass-strong border-border text-xs text-foreground bg-slate-950">
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Effort (1-10)</Label>
                                <Input type="number" min={1} max={10} value={editEffort} onChange={(e) => setEditEffort(Number(e.target.value))} className="bg-background/40 h-9 text-xs border-border" />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                <LinkIcon className="h-3 w-3" /> Depends on (Pre-requisite)
                              </Label>
                              <Select value={editDependsOn || "none"} onValueChange={(val) => setEditDependsOn(val)}>
                                <SelectTrigger className="bg-background/40 h-9 border-border text-xs text-foreground">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass-strong border-border text-xs text-foreground bg-slate-950">
                                  <SelectItem value="none">No dependency</SelectItem>
                                  {tasks.filter(t => t.id !== selected.id).map((t) => (
                                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Status toggle & action buttons */}
                      <div className="pt-4 border-t border-border space-y-3">
                        {!selected.isGoal && (
                          <Button
                            onClick={() => handleToggleCompleted(selected)}
                            variant={selected.completed ? "outline" : "default"}
                            className={`w-full gap-2 text-xs cursor-pointer border-0 ${
                              selected.completed ? "border-green-500/30 text-green-400 bg-green-500/5 hover:bg-green-500/10" : "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground"
                            }`}
                          >
                            {selected.completed ? (
                              <>
                                <CheckCircle2 className="h-4 w-4" /> Completed
                              </>
                            ) : (
                              <>
                                <Circle className="h-4 w-4" /> Mark Completed
                              </>
                            )}
                          </Button>
                        )}

                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit} className="flex-1 text-xs gap-1.5 bg-white/5 border border-border hover:bg-white/10 cursor-pointer">
                            <Edit2 className="h-3.5 w-3.5" /> Save Changes
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteTask(selected.id)}
                            className="px-3 bg-red-950/40 border border-red-500/20 text-red-400 hover:bg-red-900/40 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex h-full min-h-[200px] flex-col items-center justify-center text-center text-sm text-muted-foreground"
                    >
                      <Network className="h-8 w-8 mb-2 text-primary-glow opacity-50 animate-pulse" />
                      Select any node on the graph constellation to inspect, update, or edit links and dependencies.
                    </motion.div>
                  )}
                </AnimatePresence>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
