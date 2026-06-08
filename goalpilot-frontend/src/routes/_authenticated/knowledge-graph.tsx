import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Sparkles, X, Plus, Zap, Flag, Loader2 } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
};

type GraphNode = Task & { val: number };
type GraphLink = { source: string; target: string };
type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

const PURPLE = "#a855f7";
const PURPLE_GLOW = "#c084fc";

/**
 * Convert a flat list of tasks (from the API) into a force-graph
 * structure: every task becomes a node, every depends_on becomes a link.
 */
function tasksToGraph(tasks: Task[]): GraphData {
  const ids = new Set(tasks.map((t) => t.id));
  const nodes: GraphNode[] = tasks.map((t) => ({
    ...t,
    val: 2 + t.effort, // node size scales with effort
  }));
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
  const [selected, setSelected] = useState<Task | null>(null);
  const [seeding, setSeeding] = useState(false);

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

  const seedDemoTasks = async () => {
    setSeeding(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSeeding(false); return; }

    // Insert in dependency order so we can chain depends_on by returned id
    const insert = async (row: Partial<Task> & { title: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...row, user_id: user.id })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    };

    try {
      const research = await insert({ title: "Research the market", priority: "high", effort: 5 });
      const define = await insert({ title: "Define MVP scope", priority: "critical", effort: 4, depends_on: research });
      const design = await insert({ title: "Design core flows", priority: "high", effort: 6, depends_on: define });
      const build = await insert({ title: "Build MVP", priority: "critical", effort: 9, depends_on: design });
      await insert({ title: "Set up analytics", priority: "medium", effort: 3, depends_on: build });
      await insert({ title: "Beta launch", priority: "high", effort: 4, depends_on: build });
      await insert({ title: "Collect feedback", priority: "medium", effort: 2, depends_on: build });
      await insert({ title: "Write landing copy", priority: "low", effort: 3, depends_on: define });
      toast.success("Seeded demo tasks");
      await loadTasks();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to seed");
    } finally {
      setSeeding(false);
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
            {tasks.length === 0 && !loading && (
              <Button
                size="sm"
                onClick={seedDemoTasks}
                disabled={seeding}
                className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground"
              >
                {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Seed demo tasks
              </Button>
            )}
          </header>

          <main className="flex-1 p-6 lg:p-10 flex flex-col">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary-glow" /> Task dependency map
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                Your <span className="gradient-text">Knowledge Graph</span>
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Each task is a node; arrows show what depends on what. Click a node to view details.
              </p>
            </motion.div>

            <div className="mt-6 grid flex-1 min-h-[520px] gap-4 lg:grid-cols-[1fr_320px]">
              <div
                ref={containerRef}
                className="glass-strong rounded-2xl overflow-hidden relative"
              >
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
                    <Network className="h-10 w-10 text-primary-glow opacity-60" />
                    <p className="text-muted-foreground max-w-sm">
                      No tasks yet. Seed a demo set to see your dependency graph come alive.
                    </p>
                  </div>
                ) : (
                  <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-muted-foreground">Loading graph…</div>}>
                    <ForceGraph2D
                      graphData={graphData}
                      width={size.w}
                      height={size.h}
                      backgroundColor="rgba(0,0,0,0)"
                      nodeRelSize={5}
                      linkColor={() => "rgba(255,255,255,0.6)"}
                      linkWidth={1.2}
                      linkDirectionalArrowLength={5}
                      linkDirectionalArrowRelPos={1}
                      linkDirectionalArrowColor={() => "rgba(255,255,255,0.7)"}
                      onNodeClick={(node: any) => setSelected(node as Task)}
                      nodeCanvasObject={(node: any, ctx, scale) => {
                        const label = (node as Task).title;
                        const r = Math.sqrt(node.val ?? 4) * 2.6;
                        const isSelected = selected?.id === node.id;

                        // outer glow
                        const grad = ctx.createRadialGradient(node.x, node.y, r, node.x, node.y, r + 10);
                        grad.addColorStop(0, PURPLE_GLOW);
                        grad.addColorStop(1, "rgba(0,0,0,0)");
                        ctx.fillStyle = grad;
                        ctx.globalAlpha = isSelected ? 0.7 : 0.4;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, r + 6, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.globalAlpha = 1;

                        // core
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
                        ctx.fillStyle = PURPLE;
                        ctx.fill();

                        if (isSelected) {
                          ctx.strokeStyle = "#ffffff";
                          ctx.lineWidth = 2 / scale;
                          ctx.stroke();
                        }

                        // label
                        const fontSize = Math.max(10, 12 / scale);
                        ctx.font = `${fontSize}px Inter, sans-serif`;
                        ctx.textAlign = "center";
                        ctx.textBaseline = "top";
                        ctx.fillStyle = "rgba(240,230,255,0.92)";
                        ctx.fillText(label, node.x, node.y + r + 4);
                      }}
                    />
                  </Suspense>
                )}
              </div>

              {/* Side panel */}
              <aside className="glass-strong rounded-2xl p-5 min-h-[200px] relative">
                <AnimatePresence mode="wait">
                  {selected ? (
                    <motion.div
                      key={selected.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Task details</div>
                        <button
                          onClick={() => setSelected(null)}
                          className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-white/5"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <h3 className="mt-2 text-xl font-semibold leading-snug">{selected.title}</h3>
                      {selected.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{selected.description}</p>
                      )}

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-border bg-background/30 p-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Flag className="h-3.5 w-3.5" /> Priority
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${priorityDot(selected.priority)}`} />
                            <span className="font-medium capitalize">{selected.priority}</span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-border bg-background/30 p-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Zap className="h-3.5 w-3.5" /> Effort
                          </div>
                          <div className="mt-1 font-medium">{selected.effort} / 10</div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-border bg-background/30 p-3">
                        <div className="text-xs text-muted-foreground">Status</div>
                        <div className="mt-1 font-medium">
                          {selected.completed ? "Completed" : "In progress"}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex h-full min-h-[160px] flex-col items-center justify-center text-center text-sm text-muted-foreground"
                    >
                      <Network className="h-6 w-6 mb-2 opacity-60" />
                      Click any node to see its priority and effort.
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

function priorityDot(p: Task["priority"]) {
  switch (p) {
    case "critical": return "bg-red-400";
    case "high":     return "bg-orange-400";
    case "medium":   return "bg-primary-glow";
    default:         return "bg-muted-foreground";
  }
}
