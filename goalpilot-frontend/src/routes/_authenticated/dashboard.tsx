import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, Clock, Sparkles, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("display_name,current_focus,daily_hours,big_goal,onboarding_completed").eq("id", user.id).maybeSingle();
      if (!data || !data.onboarding_completed) {
        navigate({ to: "/onboarding" });
        return;
      }
      setProfile(data as Profile);
      setLoading(false);
    })();
  }, [navigate]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading workspace…</div>;
  }

  const milestones = buildBreakdown(profile?.big_goal ?? "your goal");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-3 border-b border-border px-4 glass">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="text-sm text-muted-foreground">
              Hey, <span className="text-foreground">{profile?.display_name ?? "Pilot"}</span>
            </div>
          </header>
          <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary-glow" /> Mission control
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                Your big goal: <span className="gradient-text">{profile?.big_goal}</span>
              </h1>
              <p className="mt-2 text-muted-foreground">
                Focused on <span className="text-foreground">{profile?.current_focus}</span> · {profile?.daily_hours}h/day
              </p>
            </motion.div>

            {/* Stats */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { label: "Daily focus", value: `${profile?.daily_hours ?? 0}h`, icon: Clock },
                { label: "Milestones", value: `${milestones.length}`, icon: Target },
                { label: "Momentum", value: "+24%", icon: TrendingUp },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <s.icon className="h-4 w-4 text-primary-glow" />
                  </div>
                  <div className="mt-2 text-3xl font-semibold">{s.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Goal Breakdown */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 glass-strong rounded-2xl p-6 lg:p-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Goal Breakdown</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    AI-decomposed milestones for your big goal.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-border bg-white/5 hover:bg-white/10">
                  Regenerate
                </Button>
              </div>
              <div className="mt-6 space-y-3">
                {milestones.map((m, i) => (
                  <motion.div
                    key={m.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="group flex items-center gap-4 rounded-xl border border-border bg-background/30 p-4 hover:bg-background/50 transition"
                  >
                    {m.done
                      ? <CheckCircle2 className="h-5 w-5 text-primary-glow shrink-0" />
                      : <Circle className="h-5 w-5 text-muted-foreground shrink-0" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Phase {i + 1}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{m.duration}</span>
                      </div>
                      <div className="mt-0.5 font-medium">{m.title}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function buildBreakdown(goal: string) {
  return [
    { title: `Define the success metric for "${truncate(goal, 40)}"`, duration: "Today", done: true },
    { title: "Audit existing skills and gaps", duration: "Week 1", done: true },
    { title: "Build the foundational learning roadmap", duration: "Week 2", done: false },
    { title: "Ship a small public milestone", duration: "Week 4", done: false },
    { title: "Iterate based on feedback loops", duration: "Week 6", done: false },
    { title: "Scale and compound results", duration: "Week 10+", done: false },
  ];
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}
