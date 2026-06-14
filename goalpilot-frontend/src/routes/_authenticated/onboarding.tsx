import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, Loader2, Check, HelpCircle, Target, Clock, Zap, Laptop, Briefcase, Heart, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { userState } from "@/lib/userState";
import { getApiUrl } from "@/lib/api-config";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

const steps = [
  { key: "full_name", question: "What is your full name?", helper: "How should GoalPilot address you?", placeholder: "e.g. John Doe" },
  { key: "focus_area", question: "What is your focus area?", helper: "One area pulling most of your attention right now.", placeholder: "e.g. Technology, Fitness, Design" },
  { key: "daily_hours", question: "How many hours a day can you dedicate?", helper: "Be realistic — we'll plan around it.", placeholder: "2" },
  { key: "work_style", question: "What is your preferred work style?", helper: "Choose how you focus and tackle your goals.", placeholder: "" },
  { key: "user_level", question: "What is your experience level?", helper: "We will tailor the roadmap task complexity to you.", placeholder: "" },
] as const;

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({
    full_name: "",
    focus_area: "",
    daily_hours: "2",
    work_style: "Deep Work",
    user_level: "Beginner",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("display_name,persona_completed").eq("id", user.id).maybeSingle();
      if (data) {
        if (data.display_name) {
          setValues(prev => ({
            ...prev,
            full_name: data.display_name
          }));
        }
        const searchParams = new URLSearchParams(window.location.search);
        const isNew = searchParams.get("new") === "true";
        if (!isNew && data.persona_completed) {
          navigate({ to: "/dashboard" });
        }
      }
    })();
  }, [navigate]);

  const current = steps[step];
  const isLastQuestion = step === steps.length - 1;

  const nextQuestion = async () => {
    const value = values[current.key];
    if (!value.trim()) return;
    if (current.key === "daily_hours" && (isNaN(Number(value)) || Number(value) <= 0)) {
      toast.error("Please enter a positive number of hours.");
      return;
    }
    if (!isLastQuestion) {
      setStep(step + 1);
      return;
    }

    submitOnboarding();
  };

  const submitOnboarding = async () => {
    setSaving(true);
    try {
      const token = userState.token;
      const userId = userState.userId;
      if (!token || !userId) {
        toast.error("Authentication session lost.");
        setSaving(false);
        return;
      }

      const onboardingRes = await fetch(getApiUrl("complete-onboarding"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders(),
        },
        body: JSON.stringify({
          user_id: userId,
          full_name: values.full_name,
          preferences: {
            focus_area: values.focus_area,
            daily_hours: Number(values.daily_hours),
            work_style: values.work_style,
            user_level: values.user_level,
          },
        }),
      });

      if (!onboardingRes.ok) {
        const err = await onboardingRes.json();
        throw new Error(err.detail || "Failed to complete onboarding.");
      }

      userState.setPersonaCompleted(true);
      toast.success("Persona established successfully!");
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to complete onboarding.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 overflow-x-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/30 blur-[120px]" />
      <div className="relative w-full max-w-4xl">
        
        {/* Progress header */}
        <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary-glow" /> 
          {saving ? "Onboarding · Establishing Persona..." : `Onboarding · Form Step ${step + 1} of ${steps.length}`}
        </div>
        
        {/* Progress bar */}
        <div className="mb-8 flex gap-2">
          {steps.map((_, s) => (
            <div key={s} className="h-1 flex-1 rounded-full overflow-hidden bg-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary-glow"
                initial={{ width: 0 }}
                animate={{ width: step >= s ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {saving ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-strong rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-6 max-w-md mx-auto"
            >
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                <Target className="absolute inset-0 m-auto h-6 w-6 text-primary-glow animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Creating flight cabin</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Saving your personal execution settings. Preparing your mission dashboard. Hang tight.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="questionnaire"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-strong rounded-2xl p-8 lg:p-10 max-w-xl mx-auto"
            >
              <h1 className="text-3xl font-bold tracking-tight">{current.question}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{current.helper}</p>

              <div className="mt-8">
                {current.key === "daily_hours" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "🌙 Side Hustle (1-2h)", hours: "2", desc: "For part-time passion projects" },
                      { label: "⚖️ Balanced (3-5h)", hours: "4", desc: "For regular study & focus" },
                      { label: "🔥 All In (8h+)", hours: "8", desc: "For full-time execution mode" },
                    ].map((card) => (
                      <button
                        key={card.hours}
                        type="button"
                        onClick={() => {
                          setValues({ ...values, daily_hours: card.hours });
                        }}
                        className={`flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 ${
                          values.daily_hours === card.hours
                            ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(168,85,247,0.25)] text-foreground scale-[1.02]"
                            : "bg-background/40 border-border hover:bg-background/60 text-muted-foreground"
                        }`}
                      >
                        <span className="text-base font-bold text-foreground mb-1">{card.label}</span>
                        <span className="text-xs text-muted-foreground leading-normal">{card.desc}</span>
                      </button>
                    ))}
                  </div>
                ) : current.key === "focus_area" ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Tech", value: "Tech", icon: Laptop, color: "text-blue-400" },
                        { label: "Business", value: "Business", icon: Briefcase, color: "text-emerald-400" },
                        { label: "Health", value: "Health", icon: Heart, color: "text-rose-400" },
                        { label: "Creative", value: "Creative", icon: Palette, color: "text-amber-400" },
                      ].map((card) => {
                        const IconComponent = card.icon;
                        return (
                          <button
                            key={card.value}
                            type="button"
                            onClick={() => {
                              setValues({ ...values, focus_area: card.value });
                            }}
                            className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 ${
                              values.focus_area === card.value
                                ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(168,85,247,0.25)] text-foreground scale-[1.02]"
                                : "bg-background/40 border-border hover:bg-background/60 text-muted-foreground"
                            }`}
                          >
                            <IconComponent className={`h-8 w-8 mb-3 ${card.color}`} />
                            <span className="text-sm font-semibold text-foreground">{card.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-muted-foreground px-1">Or type a custom focus area:</span>
                      <Input
                        type="text"
                        placeholder="e.g. Learning Japanese, Marathon Prep"
                        value={values.focus_area}
                        onChange={(e) => setValues({ ...values, focus_area: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Enter") nextQuestion(); }}
                        className="bg-background/40 text-base h-12"
                      />
                    </div>
                  </div>
                ) : current.key === "work_style" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Deep Work", value: "Deep Work", desc: "Uninterrupted focus blocks (1-2 hours) with no distractions.", icon: Zap },
                      { label: "Pomodoro", value: "Pomodoro", desc: "25 minutes of work followed by 5 minutes of rest, repeating.", icon: Clock },
                      { label: "Time Boxing", value: "Time Boxing", desc: "Strictly scheduling specific time blocks for each task.", icon: Target },
                    ].map((card) => {
                      const IconComponent = card.icon;
                      return (
                        <button
                          key={card.value}
                          type="button"
                          onClick={() => {
                            setValues({ ...values, work_style: card.value });
                          }}
                          className={`flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 ${
                            values.work_style === card.value
                              ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(168,85,247,0.25)] text-foreground scale-[1.02]"
                              : "bg-background/40 border-border hover:bg-background/60 text-muted-foreground"
                          }`}
                        >
                          <IconComponent className="h-6 w-6 text-primary-glow mb-3 animate-pulse" />
                          <span className="text-base font-bold text-foreground mb-1">{card.label}</span>
                          <span className="text-xs text-muted-foreground leading-normal">{card.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : current.key === "user_level" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Beginner", value: "Beginner", desc: "New to this domain, need step-by-step simple instructions.", icon: Sparkles },
                      { label: "Intermediate", value: "Intermediate", desc: "Have some experience, need standard tasks with moderate detail.", icon: Target },
                      { label: "Expert", value: "Expert", desc: "Deeply experienced, need high-level milestones to execute quickly.", icon: Zap },
                    ].map((card) => {
                      const IconComponent = card.icon;
                      return (
                        <button
                          key={card.value}
                          type="button"
                          onClick={() => {
                            setValues({ ...values, user_level: card.value });
                          }}
                          className={`flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 ${
                            values.user_level === card.value
                              ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(168,85,247,0.25)] text-foreground scale-[1.02]"
                              : "bg-background/40 border-border hover:bg-background/60 text-muted-foreground"
                          }`}
                        >
                          <IconComponent className="h-6 w-6 text-primary-glow mb-3" />
                          <span className="text-base font-bold text-foreground mb-1">{card.label}</span>
                          <span className="text-xs text-muted-foreground leading-normal">{card.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <Input
                    autoFocus
                    type="text"
                    placeholder={current.placeholder}
                    value={values[current.key]}
                    onChange={(e) => setValues({ ...values, [current.key]: e.target.value })}
                    onKeyDown={(e) => { if (e.key === "Enter") nextQuestion(); }}
                    className="bg-background/40 text-base h-12"
                  />
                )}
              </div>

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
                  onClick={nextQuestion}
                  disabled={!values[current.key]?.trim()}
                  className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow"
                >
                  {isLastQuestion ? "Complete Setup" : "Next"} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
