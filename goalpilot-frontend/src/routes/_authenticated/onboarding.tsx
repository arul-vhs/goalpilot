import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

const steps = [
  { key: "current_focus", question: "What is your current focus?", helper: "One area pulling most of your attention right now.", placeholder: "e.g. Launching my SaaS side project" },
  { key: "daily_hours", question: "How many hours a day can you dedicate?", helper: "Be realistic — we'll plan around it.", placeholder: "2" },
  { key: "big_goal", question: "What is one big vague goal you want to achieve?", helper: "Fuzzy is fine. GoalPilot will sharpen it.", placeholder: "e.g. Become financially independent through software" },
] as const;

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ current_focus: "", daily_hours: "", big_goal: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).maybeSingle();
      if (data?.onboarding_completed) navigate({ to: "/dashboard" });
    })();
  }, [navigate]);

  const current = steps[step];
  const value = values[current.key];
  const isLast = step === steps.length - 1;

  const next = async () => {
    if (!value.trim()) return;
    if (current.key === "daily_hours" && (isNaN(Number(value)) || Number(value) <= 0)) {
      toast.error("Please enter a positive number of hours.");
      return;
    }
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      current_focus: values.current_focus,
      daily_hours: Number(values.daily_hours),
      big_goal: values.big_goal,
      onboarding_completed: true,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("You're all set. Let's pilot this.");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/30 blur-[120px]" />
      <div className="relative w-full max-w-xl">
        <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary-glow" /> Onboarding · Step {step + 1} of {steps.length}
        </div>
        {/* Progress */}
        <div className="mb-8 flex gap-2">
          {steps.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary-glow"
                initial={{ width: 0 }}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>

        <div className="glass-strong rounded-2xl p-8 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold tracking-tight">{current.question}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{current.helper}</p>

              <div className="mt-8">
                {current.key === "big_goal" ? (
                  <Textarea
                    autoFocus
                    rows={4}
                    placeholder={current.placeholder}
                    value={value}
                    onChange={(e) => setValues({ ...values, [current.key]: e.target.value })}
                    className="bg-background/40 text-base"
                  />
                ) : (
                  <Input
                    autoFocus
                    type={current.key === "daily_hours" ? "number" : "text"}
                    placeholder={current.placeholder}
                    value={value}
                    onChange={(e) => setValues({ ...values, [current.key]: e.target.value })}
                    onKeyDown={(e) => { if (e.key === "Enter") next(); }}
                    className="bg-background/40 text-base h-12"
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={next}
              disabled={saving || !value.trim()}
              className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow"
            >
              {isLast ? (saving ? "Saving…" : "Launch") : "Next"} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
