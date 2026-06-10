import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Sparkles, X, Plus, Zap, Flag, Loader2, CheckCircle2, Circle, Trash2, Edit2, Link as LinkIcon, Target } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/knowledge-graph")({
  component: KnowledgeGraphPage,
});

const ForceGraph2D = lazy(() => import("react-force-graph-2d"));

type Task = {
  id: string;
  title: string;
  description: string | null; // Stores JSON: { notes, is_goal, scheduled_start, scheduled_end }
  priority: "low" | "medium" | "high" | "critical";
  effort: number;
  depends_on: string | null;
  completed: boolean;
};

type GraphNode = Task & { val: number; isGoal: boolean; notes: string };
type GraphLink = { source: string; target: string };
type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

const PURPLE = "#a855f7";
const PURPLE_GLOW = "#c084fc";
const GOLD = "#eab308";
const GOLD_GLOW = "#fef08a";
const COMPLETED_COLOR = "#22c55e";

// Parses our JSON description format
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

function tasksToGraph(tasks: Task[]): GraphData {
  const ids = new Set(tasks.map((t) => t.id));
  const nodes: GraphNode[] = tasks.map((t) => {
    const parsed = parseDesc(t.description);
    return {
      ...t,
      isGoal: parsed.is_goal,
      notes: parsed.notes,
      val: parsed.is_goal ? 10 : 3 + t.effort, // Goals are visually larger
    };
  });
  const links: GraphLink[] = tasks
    .filter((t) => t.depends_on && ids.has(t.depends_on))
    .map((t) => ({ source: t.depends_on as string, target: t.id }));
  return { nodes, links };
}

function KnowledgeGraphPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [tasks, setTasks] = useState<Task[]>([]);
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

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("id,title,description,priority,effort,depends_on,completed")
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    setTasks((data ?? []) as Task[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const graphData = useMemo(() => tasksToGraph(tasks), [tasks]);

  // Sync edits when selected node changes
  useEffect(() => {
    if (selected) {
      setEditTitle(selected.title);
      setEditNotes(selected.notes);
      setEditPriority(selected.priority);
      setEditEffort(selected.effort);
      setEditDependsOn(selected.depends_on || "none");
    } else {
      setEditTitle("");
      setEditNotes("");
    }
  }, [selected]);

  // Save changes to selected task
  const handleSaveEdit = async () => {
    if (!selected) return;
    try {
      const parsed = parseDesc(selected.description);
      const descJson = JSON.stringify({
        ...parsed,
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
      
      // Update local state locally
      setSelected(null);
      await loadTasks();
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
      
      // Update selected node state as well
      if (selected && selected.id === node.id) {
        setSelected({ ...selected, completed: !node.completed });
      }
      await loadTasks();
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
      await loadTasks();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete task.");
    }
  };

  // Create new task or goal
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated.");
        return;
      }

      const descJson = JSON.stringify({
        notes: newNotes,
        is_goal: newIsGoal,
        scheduled_start: null,
        scheduled_end: null,
      });

      const dep = newDependsOn === "none" ? null : newDependsOn;

      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title: newTitle,
        description: descJson,
        priority: newPriority,
        effort: newEffort,
        depends_on: dep,
        completed: false,
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
      await loadTasks();
    } catch (e: any) {
      toast.error(e.message || "Failed to create node.");
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-3 border-b border-border px-4 glass">
            <SidebarTrigger />
            <div className="flex items-center gap-2 text-sm">
              <Network className="h-4 w-4 text-primary-glow" />
              <span className="font-medium">Knowledge Graph</span>
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
                    <Input id="title" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Build API endpoints" className="bg-background/40" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes / Details</Label>
                    <Textarea id="notes" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Describe details..." className="bg-background/40" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newPriority} onValueChange={(val: any) => setNewPriority(val)}>
                        <SelectTrigger className="bg-background/40 border-border">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent className="glass-strong border-border">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="effort">Effort (1-10)</Label>
                      <Input id="effort" type="number" min={1} max={10} value={newEffort} onChange={(e) => setNewEffort(Number(e.target.value))} className="bg-background/40" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depends_on">Depends On (Pre-requisite)</Label>
                    <Select value={newDependsOn || "none"} onValueChange={(val) => setNewDependsOn(val)}>
                      <SelectTrigger className="bg-background/40 border-border">
                        <SelectValue placeholder="No dependency" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-border">
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
                    <Button type="submit" className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">Create Node</Button>
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
                Your <span className="gradient-text">Knowledge Graph</span>
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Obsidian-style dependency map. Gold nodes are Goals, Purple are Tasks, and Green represents completion. Click nodes to inspect, edit, or delete them.
              </p>
            </motion.div>

            <div className="mt-6 grid flex-1 min-h-[520px] gap-6 lg:grid-cols-[1fr_360px]">
              <div
                ref={containerRef}
                className="glass-strong rounded-2xl overflow-hidden relative border border-border min-h-[400px]"
              >
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-background/50">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
                    <Network className="h-10 w-10 text-primary-glow opacity-60" />
                    <p className="text-muted-foreground max-w-sm">
                      No tasks or goals yet. Click "Add Goal or Task" to build your dependency graph.
                    </p>
                  </div>
                ) : (
                  <div className="absolute inset-0">
                    <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-muted-foreground">Rendering canvas…</div>}>
                      <ForceGraph2D
                        graphData={graphData}
                        width={size.w}
                        height={size.h}
                        nodeLabel={(node: any) => node.title}
                        backgroundColor="rgba(0,0,0,0)"
                        nodeRelSize={4}
                        linkColor={(link: any) => {
                          const targetNode = graphData.nodes.find(n => n.id === link.target.id || n.id === link.target);
                          return targetNode?.completed ? "rgba(34, 197, 94, 0.4)" : "rgba(255,255,255,0.25)";
                        }}
                        linkWidth={1.5}
                        linkDirectionalArrowLength={6}
                        linkDirectionalArrowRelPos={1}
                        linkDirectionalArrowColor={() => "rgba(255,255,255,0.4)"}
                        onNodeClick={(node: any) => setSelected(node as GraphNode)}
                        nodeCanvasObject={(node: any, ctx, scale) => {
                          const label = node.title;
                          const r = Math.sqrt(node.val ?? 4) * 2.8;
                          const x = node.x;
                          const y = node.y;
                          
                          // Safety check: skip drawing if node coordinates or radius are invalid
                          if (typeof x !== "number" || typeof y !== "number" || !isFinite(x) || !isFinite(y) || typeof r !== "number" || !isFinite(r)) {
                            return;
                          }

                          const isSelected = selected?.id === node.id;
                          
                          // Node color selection
                          let nodeColor = PURPLE;
                          let glowColor = PURPLE_GLOW;
                          if (node.completed) {
                            nodeColor = COMPLETED_COLOR;
                            glowColor = COMPLETED_COLOR;
                          } else if (node.isGoal) {
                            nodeColor = GOLD;
                            glowColor = GOLD_GLOW;
                          }

                          // Outer Glow Ring
                          const grad = ctx.createRadialGradient(x, y, r, x, y, r + 12);
                          grad.addColorStop(0, glowColor);
                          grad.addColorStop(1, "rgba(0,0,0,0)");
                          ctx.fillStyle = grad;
                          ctx.globalAlpha = isSelected ? 0.8 : 0.35;
                          ctx.beginPath();
                          ctx.arc(x, y, r + 8, 0, 2 * Math.PI);
                          ctx.fill();
                          ctx.globalAlpha = 1;

                          // Core Node
                          ctx.beginPath();
                          if (node.isGoal && !node.completed) {
                            // Draw a diamond shape for goal nodes
                            ctx.moveTo(x, y - r);
                            ctx.lineTo(x + r, y);
                            ctx.lineTo(x, y + r);
                            ctx.lineTo(x - r, y);
                            ctx.closePath();
                          } else {
                            ctx.arc(x, y, r, 0, 2 * Math.PI);
                          }
                          ctx.fillStyle = nodeColor;
                          ctx.fill();

                          if (isSelected) {
                            ctx.strokeStyle = "#ffffff";
                            ctx.lineWidth = 2.5 / scale;
                            ctx.stroke();
                          }

                          // Text Label (Inter font)
                          const fontSize = Math.max(9, 11 / scale);
                          ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
                          ctx.textAlign = "center";
                          ctx.textBaseline = "top";
                          ctx.fillStyle = "rgba(240, 230, 255, 0.95)";
                          
                          // Truncated labels if scale is zoomed out
                          let displayLabel = label;
                          if (scale < 0.8 && label.length > 15) {
                            displayLabel = label.slice(0, 12) + "...";
                          }
                          ctx.fillText(displayLabel, x, y + r + 4);
                        }}
                      />
                    </Suspense>
                  </div>
                )}
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
                            <span className="text-yellow-400 font-semibold flex items-center gap-1">
                              <Target className="h-3.5 w-3.5" /> Goal Node
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Network className="h-3.5 w-3.5" /> Task Node
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setSelected(null)}
                          className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-white/5"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Editing fields */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Title</Label>
                          <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="bg-background/40 h-9 font-medium" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Description / Notes</Label>
                          <Textarea rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="bg-background/40 text-xs leading-relaxed" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Priority</Label>
                            <Select value={editPriority} onValueChange={(val: any) => setEditPriority(val)}>
                              <SelectTrigger className="bg-background/40 h-9 border-border text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="glass-strong border-border text-xs">
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Effort (1-10)</Label>
                            <Input type="number" min={1} max={10} value={editEffort} onChange={(e) => setEditEffort(Number(e.target.value))} className="bg-background/40 h-9 text-xs" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" /> Depends on (Pre-requisite)
                          </Label>
                          <Select value={editDependsOn || "none"} onValueChange={(val) => setEditDependsOn(val)}>
                            <SelectTrigger className="bg-background/40 h-9 border-border text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-strong border-border text-xs">
                              <SelectItem value="none">No dependency</SelectItem>
                              {tasks.filter(t => t.id !== selected.id).map((t) => (
                                <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Status toggle & action buttons */}
                      <div className="pt-4 border-t border-border space-y-3">
                        <Button
                          onClick={() => handleToggleCompleted(selected)}
                          variant={selected.completed ? "outline" : "default"}
                          className={`w-full gap-2 text-xs ${
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

                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit} className="flex-1 text-xs gap-1.5 bg-white/5 border border-border hover:bg-white/10">
                            <Edit2 className="h-3.5 w-3.5" /> Save Changes
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteTask(selected.id)}
                            className="px-3 bg-red-950/40 border border-red-500/20 text-red-400 hover:bg-red-900/40"
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
                      <Network className="h-8 w-8 mb-2 text-primary-glow opacity-50" />
                      Select any node on the graph to inspect, update, or edit links and dependencies.
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
