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

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

const steps = [
  { key: "full_name", question: "What is your full name?", helper: "How should GoalPilot address you?", placeholder: "e.g. John Doe" },
  { key: "current_focus", question: "What is your current focus?", helper: "One area pulling most of your attention right now.", placeholder: "e.g. Launching my SaaS side project" },
  { key: "daily_hours", question: "How many hours a day can you dedicate?", helper: "Be realistic — we'll plan around it.", placeholder: "2" },
  { key: "big_goal", question: "What is one big vague goal you want to achieve?", helper: "Fuzzy is fine. GoalPilot will sharpen it.", placeholder: "e.g. Become financially independent through software" },
] as const;

type Strategy = {
  id: string;
  name: string;
  description: string;
  duration: string;
  pros: string[];
  cons: string[];
  recommended: boolean;
};

type AdviceData = {
  strategies?: Strategy[];
  reasoning?: string;
  error?: string;
};

function Onboarding() {
  const navigate = useNavigate();
  
  // Onboarding stage state:
  // 0: Basic info questionnaire
  // 1: Strategy choice
  // 2: Clarifying questions
  // 3: Generating/saving tasks
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ full_name: "", current_focus: "", daily_hours: "", big_goal: "" });
  const [saving, setSaving] = useState(false);

  // Strategy stage state
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [advice, setAdvice] = useState<AdviceData | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  // Clarifying stage state
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("display_name,onboarding_completed").eq("id", user.id).maybeSingle();
      if (data) {
        if (data.display_name) {
          setValues(prev => ({
            ...prev,
            full_name: data.display_name
          }));
        }
        const searchParams = new URLSearchParams(window.location.search);
        const isNew = searchParams.get("new") === "true";
        if (!isNew && data.onboarding_completed) {
          navigate({ to: "/dashboard" });
        }
      }
    })();
  }, [navigate]);

  const current = steps[step];
  const value = values[current.key];
  const isLastQuestion = step === steps.length - 1;

  // Handles moving to next question in Stage 0
  const nextQuestion = async () => {
    if (!value.trim()) return;
    if (current.key === "daily_hours" && (isNaN(Number(value)) || Number(value) <= 0)) {
      toast.error("Please enter a positive number of hours.");
      return;
    }
    if (!isLastQuestion) {
      setStep(step + 1);
      return;
    }

    // Finished basic questions, fetch strategies from backend
    setStage(1);
    fetchStrategies();
  };

  const fetchStrategies = async () => {
    setLoadingAdvice(true);
    try {
      const res = await fetch("http://localhost:8000/onboarding-advice", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...userState.getAuthHeaders()
        },
        body: JSON.stringify({
          goal: values.big_goal,
          hours: values.daily_hours,
          focus: values.current_focus,
        }),
      });
      const data = await res.json();
      const adviceObj = data.advice || data;
      if (adviceObj?.error) {
        toast.error(adviceObj.error);
      } else {
        setAdvice(adviceObj);
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not reach backend consultant. Make sure python server is running.");
    } finally {
      setLoadingAdvice(false);
    }
  };

  const handleSelectStrategy = async (strategyId: string) => {
    setSelectedStrategy(strategyId);
    setStage(2);
    fetchClarifyingQuestions(strategyId);
  };

  const fetchClarifyingQuestions = async (strategyId: string) => {
    setLoadingQuestions(true);
    try {
      const res = await fetch("http://localhost:8000/clarifying-questions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...userState.getAuthHeaders()
        },
        body: JSON.stringify({
          goal: values.big_goal,
          strategy_id: strategyId,
        }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setAnswers((data.questions || []).map(() => ""));
    } catch (e) {
      toast.error("Could not fetch clarifying questions.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const submitClarifications = async () => {
    setSaving(true);
    setStage(3);
    try {
      const token = userState.token;
      const userId = userState.userId;
      if (!token || !userId) {
        toast.error("Authentication session lost.");
        setStage(2);
        setSaving(false);
        return;
      }

      const qna = questions.map((q, idx) => ({ q, a: answers[idx] }));

      // 1. Call Backend Goal Decomposer / Creator
      const breakdownRes = await fetch("http://localhost:8000/create-goal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders(),
        },
        body: JSON.stringify({
          goal: values.big_goal,
          context: {
            daily_hours: Number(values.daily_hours),
            current_focus: values.current_focus,
            strategy: selectedStrategy,
            clarifications: qna,
          },
        }),
      });

      if (!breakdownRes.ok) {
        const err = await breakdownRes.json();
        throw new Error(err.detail || "Failed to breakdown goal.");
      }

      const breakdownData = await breakdownRes.json();
      if (breakdownData.goal_id) {
        userState.setActiveGoalId(breakdownData.goal_id);
      }

      // 2. Call Scheduling Engine (Initial Calendar Placement)
      const scheduleRes = await fetch("http://localhost:8000/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders(),
        },
        body: JSON.stringify({ calendar_events: [] }),
      });

      if (!scheduleRes.ok) {
        const err = await scheduleRes.json();
        throw new Error(err.detail || "Failed to initialize schedule.");
      }

      // 3. Complete Profile Onboarding via Backend API
      const onboardingRes = await fetch("http://localhost:8000/complete-onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders(),
        },
        body: JSON.stringify({
          user_id: userId,
          full_name: values.full_name,
          preferences: {
            current_focus: values.current_focus,
            daily_hours: Number(values.daily_hours),
            big_goal: values.big_goal,
          },
        }),
      });

      if (!onboardingRes.ok) {
        const err = await onboardingRes.json();
        throw new Error(err.detail || "Failed to complete onboarding.");
      }

      toast.success("Flight plan locked. Let's take off!");
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to complete onboarding.");
      setStage(2);
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
          {stage === 0 && `Onboarding · Form Step ${step + 1} of ${steps.length}`}
          {stage === 1 && "Onboarding · AI Consultation"}
          {stage === 2 && "Onboarding · Clarify Flight Path"}
          {stage === 3 && "Onboarding · Preparing Flight Cabin"}
        </div>
        
        {/* Progress bar */}
        <div className="mb-8 flex gap-2">
          {[0, 1, 2, 3].map((s) => (
            <div key={s} className="h-1 flex-1 rounded-full overflow-hidden bg-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary-glow"
                initial={{ width: 0 }}
                animate={{ width: stage >= s ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STAGE 0: BASIC INFORMATION */}
          {stage === 0 && (
            <motion.div
              key="stage0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-strong rounded-2xl p-8 lg:p-10 max-w-xl mx-auto"
            >
              <h1 className="text-3xl font-bold tracking-tight">{current.question}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{current.helper}</p>

              <div className="mt-8">
                {current.key === "big_goal" ? (
                  <div className="space-y-4">
                    <Textarea
                      autoFocus
                      rows={4}
                      placeholder={current.placeholder}
                      value={value}
                      onChange={(e) => setValues({ ...values, big_goal: e.target.value })}
                      className="bg-background/40 text-base"
                    />
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-muted-foreground font-medium px-1">Suggestions:</span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Build a SaaS",
                          "Learn Python",
                          "Lose 10kg",
                          "Write a Book",
                          "Launch a Newsletter",
                        ].map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => {
                              setValues({ ...values, big_goal: sug });
                            }}
                            className="text-xs bg-white/5 hover:bg-white/10 text-foreground border border-border px-3 py-1.5 rounded-full transition-all duration-200"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : current.key === "daily_hours" ? (
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
                ) : current.key === "current_focus" ? (
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
                              setValues({ ...values, current_focus: card.value });
                            }}
                            className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 ${
                              values.current_focus === card.value
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
                        value={values.current_focus}
                        onChange={(e) => setValues({ ...values, current_focus: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Enter") nextQuestion(); }}
                        className="bg-background/40 text-base h-12"
                      />
                    </div>
                  </div>
                ) : (
                  <Input
                    autoFocus
                    type="text"
                    placeholder={current.placeholder}
                    value={value}
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
                  disabled={!value.trim()}
                  className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow"
                >
                  {isLastQuestion ? "Consult AI" : "Next"} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STAGE 1: STRATEGY OPTIONS CONSULTATION */}
          {stage === 1 && (
            <motion.div
              key="stage1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              {loadingAdvice ? (
                <div className="glass-strong rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
                  <Loader2 className="h-8 w-8 text-primary-glow animate-spin" />
                  <div>
                    <h2 className="font-semibold text-lg">Consulting AI Executive Coach...</h2>
                    <p className="text-sm text-muted-foreground mt-1">Analyzing hours, skills, and strategic feasibility.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center max-w-xl mx-auto">
                    <h1 className="text-3xl font-bold tracking-tight">Select your Strategy Option</h1>
                    <p className="mt-2 text-muted-foreground">{advice?.reasoning}</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    {advice?.strategies?.map((strat) => (
                      <motion.div
                        key={strat.id}
                        whileHover={{ scale: 1.02 }}
                        className={`relative glass-strong rounded-2xl p-6 border flex flex-col justify-between ${
                          strat.recommended ? "border-primary/50 bg-primary/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "border-border"
                        }`}
                      >
                        {strat.recommended && (
                          <div className="absolute -top-3 right-4 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Recommended
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold">{strat.name}</h3>
                          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 rounded-md px-2 py-1">
                            <Clock className="h-3 w-3 text-primary-glow" /> {strat.duration}
                          </div>
                          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{strat.description}</p>
                          
                          <div className="mt-4 space-y-2">
                            <div className="text-xs font-semibold text-green-400">Pros</div>
                            <ul className="space-y-1">
                              {strat.pros.map((p, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                  <span className="text-green-400 mt-0.5">✓</span> {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            <div className="text-xs font-semibold text-red-400/80">Cons</div>
                            <ul className="space-y-1">
                              {strat.cons.map((c, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                  <span className="text-red-400/60 mt-0.5">✗</span> {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleSelectStrategy(strat.id)}
                          className="mt-6 w-full gap-2 bg-white/5 border border-border hover:bg-white/10"
                        >
                          Select this plan <ArrowRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex justify-center mt-6">
                    <Button variant="ghost" onClick={() => setStage(0)} className="gap-2">
                      <ArrowLeft className="h-4 w-4" /> Back to questions
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STAGE 2: CLARIFYING QUESTIONS */}
          {stage === 2 && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-strong rounded-2xl p-8 lg:p-10 max-w-2xl mx-auto"
            >
              {loadingQuestions ? (
                <div className="text-center py-10 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 text-primary-glow animate-spin" />
                  <p className="text-sm text-muted-foreground">Drafting target questions for your goal and strategy...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Fine-tune your flight path</h1>
                    <p className="text-sm text-muted-foreground mt-1">Answer these AI Coach questions to personalize the generated task roadmap.</p>
                  </div>

                  <div className="space-y-5">
                    {questions.map((q, idx) => (
                      <div key={idx} className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-primary-glow shrink-0" /> {q}
                        </label>
                        <Textarea
                          rows={2}
                          placeholder="Type your response..."
                          value={answers[idx]}
                          onChange={(e) => {
                            const newAnswers = [...answers];
                            newAnswers[idx] = e.target.value;
                            setAnswers(newAnswers);
                          }}
                          className="bg-background/40 text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                    <Button variant="ghost" onClick={() => setStage(1)} className="gap-2">
                      <ArrowLeft className="h-4 w-4" /> Back to strategies
                    </Button>
                    <Button
                      onClick={submitClarifications}
                      disabled={saving || answers.some(a => !a.trim())}
                      className="gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow"
                    >
                      {saving ? "Generating plan..." : "Generate Flight Plan"} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STAGE 3: GENERATING AND SAVING TASKS (LOBBY SCREEN) */}
          {stage === 3 && (
            <motion.div
              key="stage3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-strong rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-6 max-w-md mx-auto"
            >
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                <Target className="absolute inset-0 m-auto h-6 w-6 text-primary-glow animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Creating flight dashboard</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  The AI Agent is decomposing your goal into structured tasks, resolving dependency relationships, and compiling your local calendar. Hang tight.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
