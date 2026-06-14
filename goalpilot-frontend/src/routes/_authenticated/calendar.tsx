import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Sparkles, RefreshCw, AlertCircle, Clock, Link2, ShieldAlert, Check, Loader2 } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format, addDays, startOfWeek, parseISO } from "date-fns";
import { userState, useUserState } from "@/lib/userState";
import { getApiUrl } from "@/lib/api-config";

export const Route = createFileRoute("/_authenticated/calendar")({
  component: CalendarPage,
});

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

// Mock Google Calendar events
const mockGoogleEvents = [
  { title: "Project Sync meeting", start: "10:00", end: "11:00", dayOffset: 0 },
  { title: "Dental checkup", start: "14:00", end: "15:00", dayOffset: 2 },
  { title: "Weekly review with manager", start: "09:30", end: "10:30", dayOffset: 4 },
];

function CalendarPage() {
  const { activeGoalId } = useUserState();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [syncGoogle, setSyncGoogle] = useState(false);

  const loadTasksAndSchedules = useCallback(async () => {
    if (!activeGoalId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("id,title,description,priority,effort,depends_on,completed,goal_id")
        .eq("goal_id", activeGoalId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      
      const parsedTasks: Task[] = (data ?? []).map((t) => {
        let descNotes = "";
        let scheduled_start;
        let scheduled_end;
        try {
          const parsed = JSON.parse(t.description || "{}");
          descNotes = parsed.notes || "";
          scheduled_start = parsed.scheduled_start;
          scheduled_end = parsed.scheduled_end;
        } catch (e) {
          descNotes = t.description || "";
        }
        return {
          ...t,
          description: descNotes,
          scheduled_start,
          scheduled_end,
        };
      });
      setTasks(parsedTasks);
    } catch (e: any) {
      toast.error(e.message || "Failed to load schedule.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasksAndSchedules();
  }, [loadTasksAndSchedules]);

  // Generates current week days starting from Monday
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, idx) => addDays(weekStart, idx));

  // Compute Google Calendar Events for the current week based on date
  const googleCalendarEvents = useMemo(() => {
    if (!syncGoogle) return [];
    return mockGoogleEvents.map(event => {
      const targetDate = addDays(weekStart, event.dayOffset);
      const startStr = `${format(targetDate, "yyyy-MM-dd")}T${event.start}:00`;
      const endStr = `${format(targetDate, "yyyy-MM-dd")}T${event.end}:00`;
      return {
        title: event.title,
        start: startStr,
        end: endStr,
        isGoogle: true
      };
    });
  }, [syncGoogle, weekStart]);

  // Combine tasks and Google events
  const allScheduledItems = useMemo(() => {
    const items = [];
    
    // Add Google events if synced
    googleCalendarEvents.forEach(e => {
      items.push({
        id: e.title,
        title: e.title,
        start: e.start,
        end: e.end,
        isGoogle: true
      });
    });

    // Add scheduled tasks
    tasks.forEach(t => {
      if (t.scheduled_start && t.scheduled_end && !t.completed) {
        items.push({
          id: t.id,
          title: t.title,
          start: t.scheduled_start,
          end: t.scheduled_end,
          priority: t.priority,
          isGoogle: false
        });
      }
    });

    return items;
  }, [tasks, googleCalendarEvents]);

  // Call the backend rescheduling / scheduling endpoint
  const handleSmartReschedule = async () => {
    setRescheduling(true);
    try {
      const token = userState.token;
      if (!token) {
        toast.error("Session token expired.");
        setRescheduling(false);
        return;
      }

      // Map google calendar events format for the backend if synced
      const calendarEventsToSend = googleCalendarEvents.map(e => ({
        title: e.title,
        start: e.start,
        end: e.end
      }));

      const res = await fetch(getApiUrl("schedule"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders()
        },
        body: JSON.stringify({
          calendar_events: calendarEventsToSend,
          start_date: new Date().toISOString()
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to reschedule schedule.");
      }

      toast.success("Schedule re-optimized around availability and deadlines!");
      await loadTasksAndSchedules();
    } catch (e: any) {
      toast.error(e.message || "Failed to optimize schedule.");
    } finally {
      setRescheduling(false);
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
              <CalendarIcon className="h-4 w-4 text-primary-glow" />
              <span className="font-medium">Calendar Planner</span>
            </div>
            <div className="flex-1" />
            
            <div className="flex items-center gap-2 mr-2 bg-white/5 border border-border rounded-lg px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">Google Calendar Sync</span>
              <Switch checked={syncGoogle} onCheckedChange={(val) => {
                setSyncGoogle(val);
                toast.success(val ? "Synced Google Calendar meetings." : "Disabled calendar sync.");
              }} />
            </div>

            <Button
              size="sm"
              disabled={rescheduling}
              onClick={handleSmartReschedule}
              className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow"
            >
              {rescheduling ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Smart Reschedule
            </Button>
          </header>

          <main className="flex-1 p-6 lg:p-10 flex flex-col overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary-glow" /> Daily Flight agenda
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                Your <span className="gradient-text">Weekly Plan</span>
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Availability-based agenda. If you miss a task, or when calendar sync changes your free blocks, click "Smart Reschedule" to re-arrange.
              </p>
            </motion.div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground mt-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
              </div>
            ) : (
              <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
                {/* 7-Day Calendar Grid */}
                <div className="glass-strong border border-border rounded-2xl p-6 overflow-x-auto min-w-[700px]">
                  <div className="grid grid-cols-7 gap-4 border-b border-border pb-4">
                    {weekDays.map((day, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-xs text-muted-foreground uppercase">{format(day, "eee")}</div>
                        <div className="text-xl font-bold mt-1">{format(day, "d")}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-4 pt-4 min-h-[350px]">
                    {weekDays.map((day, dayIdx) => {
                      const dayStr = format(day, "yyyy-MM-dd");
                      const dayItems = allScheduledItems.filter((item) => item.start.startsWith(dayStr));

                      return (
                        <div key={dayIdx} className="border-r border-dashed border-border last:border-0 pr-2 min-h-[300px] flex flex-col gap-2">
                          {dayItems.length === 0 ? (
                            <div className="text-[10px] text-muted-foreground/50 text-center mt-4">Free Block</div>
                          ) : (
                            dayItems.map((item) => {
                              const stTime = format(parseISO(item.start), "hh:mm a");
                              const isGoogle = item.isGoogle;

                              return (
                                <div
                                  key={item.id}
                                  className={`rounded-xl p-2.5 text-left flex flex-col justify-between text-xs border ${
                                    isGoogle
                                      ? "bg-red-500/5 border-red-500/20 text-red-300"
                                      : "bg-primary/5 border-primary/20 text-foreground shadow-[0_2px_10px_rgba(168,85,247,0.05)]"
                                  }`}
                                >
                                  <div>
                                    <div className="font-semibold leading-tight truncate">{item.title}</div>
                                    <div className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1">
                                      <Clock className="h-2.5 w-2.5" /> {stTime}
                                    </div>
                                  </div>
                                  
                                  {!isGoogle && (
                                    <span className={`inline-block mt-2 text-[8px] font-semibold w-fit uppercase px-1.5 py-0.5 rounded ${
                                      item.priority === "critical" ? "bg-red-950/60 text-red-400" :
                                      item.priority === "high" ? "bg-orange-950/60 text-orange-400" :
                                      "bg-white/5 text-muted-foreground"
                                    }`}>
                                      {item.priority}
                                    </span>
                                  )}

                                  {isGoogle && (
                                    <span className="inline-block mt-2 text-[8px] font-semibold w-fit uppercase px-1.5 py-0.5 rounded bg-white/5 text-red-400/80">
                                      Meeting
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Calendar Info Panel */}
                <div className="space-y-6">
                  <div className="glass-strong border border-border rounded-2xl p-5">
                    <h3 className="font-bold text-sm flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-primary-glow" /> Conflict Resolver
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      GoalPilot schedules tasks only during your set focus hours. If you import calendar events, uncompleted tasks are shifted automatically to prevent clashing.
                    </p>
                    
                    {syncGoogle ? (
                      <div className="mt-4 border border-green-500/20 bg-green-500/5 text-green-400 text-xs p-3 rounded-xl flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0" />
                        <span>Google Calendar connection simulated. Clashing slots detected & resolved.</span>
                      </div>
                    ) : (
                      <div className="mt-4 border border-border bg-white/5 text-muted-foreground text-xs p-3 rounded-xl flex items-center gap-2">
                        <Link2 className="h-4 w-4 shrink-0 text-primary-glow" />
                        <span>Sync with Google Calendar to audit focus hours.</span>
                      </div>
                    )}
                  </div>

                  <div className="glass-strong border border-border rounded-2xl p-5">
                    <h3 className="font-bold text-sm">Rescheduling Rules</h3>
                    <ul className="mt-3 space-y-2 text-xs text-muted-foreground list-disc pl-4">
                      <li>Pending tasks are processed in order of pre-requisites.</li>
                      <li>High priority tasks claim earliest available slots.</li>
                      <li>Tasks are limited to your configured daily hours limit.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
