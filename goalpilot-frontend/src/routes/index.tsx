import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Target, Brain, ArrowRight, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GoalPilot — Pilot every goal with AI" },
      { name: "description", content: "GoalPilot breaks your vague ambitions into a daily flight plan. Sign in to start piloting your goals." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Sign-in failed");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm, or sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/40 blur-[120px]" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow btn-glow" />
          <span className="text-lg font-semibold tracking-tight">GoalPilot</span>
        </Link>
        <a href="#auth" className="text-sm text-muted-foreground hover:text-foreground">Sign in</a>
      </nav>

      <main className="relative z-10 mx-auto grid max-w-7xl gap-16 px-6 py-12 lg:grid-cols-2 lg:gap-12 lg:py-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
            AI Productivity, reimagined
          </div>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight lg:text-6xl">
            Pilot every <span className="gradient-text">vague goal</span> into focused daily action.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            GoalPilot turns your fuzzy ambitions into a structured breakdown, a daily flight plan, and a living knowledge graph of everything you learn.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Target, label: "Goal Breakdown" },
              { icon: Brain, label: "Knowledge Graph" },
              { icon: Sparkles, label: "AI Focus Coach" },
            ].map((f) => (
              <div key={f.label} className="glass rounded-xl p-4">
                <f.icon className="h-5 w-5 text-primary-glow" />
                <div className="mt-2 text-sm font-medium">{f.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Auth card */}
        <motion.div
          id="auth"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex items-center"
        >
          <div className="glass-strong w-full rounded-2xl p-8">
            <h2 className="text-2xl font-semibold">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin" ? "Sign in to continue your mission." : "Start piloting your goals today."}
            </p>

            <Button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              variant="outline"
              className="mt-6 w-full justify-center gap-3 border-border bg-white/5 hover:bg-white/10"
            >
              <GoogleIcon /> Continue with Google
            </Button>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> or email <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" className="pl-9 bg-background/40" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" required minLength={6} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" className="pl-9 bg-background/40" />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90 btn-glow"
              >
                {mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "No account yet?" : "Already have one?"}{" "}
              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="text-primary-glow hover:underline"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.5-1.7 4.4-5.5 4.4-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.7 14.6 2.8 12 2.8 6.9 2.8 2.8 6.9 2.8 12s4.1 9.2 9.2 9.2c5.3 0 8.8-3.7 8.8-9 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}
