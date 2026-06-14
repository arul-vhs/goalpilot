import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { I as Input, B as Button } from "./input-BiB-PFhx.mjs";
import { s as supabase } from "./client-hQzx3ycp.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as userState, g as getApiUrl } from "./api-config-6k5iAoHf.mjs";
import { S as Sparkles, T as Target, a as Laptop, b as Briefcase, H as Heart, P as Palette, Z as Zap, C as Clock, c as ArrowLeft, A as ArrowRight } from "../_libs/lucide-react.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
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
import "../_libs/tailwind-merge.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const steps = [{
  key: "full_name",
  question: "What is your full name?",
  helper: "How should GoalPilot address you?",
  placeholder: "e.g. John Doe"
}, {
  key: "focus_area",
  question: "What is your focus area?",
  helper: "One area pulling most of your attention right now.",
  placeholder: "e.g. Technology, Fitness, Design"
}, {
  key: "daily_hours",
  question: "How many hours a day can you dedicate?",
  helper: "Be realistic — we'll plan around it.",
  placeholder: "2"
}, {
  key: "work_style",
  question: "What is your preferred work style?",
  helper: "Choose how you focus and tackle your goals.",
  placeholder: ""
}, {
  key: "user_level",
  question: "What is your experience level?",
  helper: "We will tailor the roadmap task complexity to you.",
  placeholder: ""
}];
function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = reactExports.useState(0);
  const [values, setValues] = reactExports.useState({
    full_name: "",
    focus_area: "",
    daily_hours: "2",
    work_style: "Deep Work",
    user_level: "Beginner"
  });
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
    (async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const {
        data
      } = await supabase.from("profiles").select("display_name,persona_completed").eq("id", user.id).maybeSingle();
      if (data) {
        if (data.display_name) {
          setValues((prev) => ({
            ...prev,
            full_name: data.display_name
          }));
        }
        const searchParams = new URLSearchParams(window.location.search);
        const isNew = searchParams.get("new") === "true";
        if (!isNew && data.persona_completed) {
          navigate({
            to: "/dashboard"
          });
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
          ...userState.getAuthHeaders()
        },
        body: JSON.stringify({
          user_id: userId,
          full_name: values.full_name,
          preferences: {
            focus_area: values.focus_area,
            daily_hours: Number(values.daily_hours),
            work_style: values.work_style,
            user_level: values.user_level
          }
        })
      });
      if (!onboardingRes.ok) {
        const err = await onboardingRes.json();
        throw new Error(err.detail || "Failed to complete onboarding.");
      }
      userState.setPersonaCompleted(true);
      toast.success("Persona established successfully!");
      navigate({
        to: "/dashboard"
      });
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Failed to complete onboarding.");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen relative flex items-center justify-center px-4 py-10 overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/30 blur-[120px]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full max-w-4xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary-glow" }),
        saving ? "Onboarding · Establishing Persona..." : `Onboarding · Form Step ${step + 1} of ${steps.length}`
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 flex gap-2", children: steps.map((_, s) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 flex-1 rounded-full overflow-hidden bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "h-full bg-gradient-to-r from-primary to-primary-glow", initial: {
        width: 0
      }, animate: {
        width: step >= s ? "100%" : "0%"
      }, transition: {
        duration: 0.4
      } }) }, s)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0
      }, animate: {
        opacity: 1
      }, exit: {
        opacity: 0
      }, className: "glass-strong rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-6 max-w-md mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-16 w-16", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full border-4 border-primary/20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full border-4 border-t-primary animate-spin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "absolute inset-0 m-auto h-6 w-6 text-primary-glow animate-pulse" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold tracking-tight", children: "Creating flight cabin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2 leading-relaxed", children: "Saving your personal execution settings. Preparing your mission dashboard. Hang tight." })
        ] })
      ] }, "loading") : /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        x: 20
      }, animate: {
        opacity: 1,
        x: 0
      }, exit: {
        opacity: 0,
        x: -20
      }, className: "glass-strong rounded-2xl p-8 lg:p-10 max-w-xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: current.question }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: current.helper }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8", children: current.key === "daily_hours" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [{
          label: "🌙 Side Hustle (1-2h)",
          hours: "2",
          desc: "For part-time passion projects"
        }, {
          label: "⚖️ Balanced (3-5h)",
          hours: "4",
          desc: "For regular study & focus"
        }, {
          label: "🔥 All In (8h+)",
          hours: "8",
          desc: "For full-time execution mode"
        }].map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
          setValues({
            ...values,
            daily_hours: card.hours
          });
        }, className: `flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 ${values.daily_hours === card.hours ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(168,85,247,0.25)] text-foreground scale-[1.02]" : "bg-background/40 border-border hover:bg-background/60 text-muted-foreground"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-bold text-foreground mb-1", children: card.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground leading-normal", children: card.desc })
        ] }, card.hours)) }) : current.key === "focus_area" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [{
            label: "Tech",
            value: "Tech",
            icon: Laptop,
            color: "text-blue-400"
          }, {
            label: "Business",
            value: "Business",
            icon: Briefcase,
            color: "text-emerald-400"
          }, {
            label: "Health",
            value: "Health",
            icon: Heart,
            color: "text-rose-400"
          }, {
            label: "Creative",
            value: "Creative",
            icon: Palette,
            color: "text-amber-400"
          }].map((card) => {
            const IconComponent = card.icon;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
              setValues({
                ...values,
                focus_area: card.value
              });
            }, className: `flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 ${values.focus_area === card.value ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(168,85,247,0.25)] text-foreground scale-[1.02]" : "bg-background/40 border-border hover:bg-background/60 text-muted-foreground"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { className: `h-8 w-8 mb-3 ${card.color}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: card.label })
            ] }, card.value);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground px-1", children: "Or type a custom focus area:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", placeholder: "e.g. Learning Japanese, Marathon Prep", value: values.focus_area, onChange: (e) => setValues({
              ...values,
              focus_area: e.target.value
            }), onKeyDown: (e) => {
              if (e.key === "Enter") nextQuestion();
            }, className: "bg-background/40 text-base h-12" })
          ] })
        ] }) : current.key === "work_style" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [{
          label: "Deep Work",
          value: "Deep Work",
          desc: "Uninterrupted focus blocks (1-2 hours) with no distractions.",
          icon: Zap
        }, {
          label: "Pomodoro",
          value: "Pomodoro",
          desc: "25 minutes of work followed by 5 minutes of rest, repeating.",
          icon: Clock
        }, {
          label: "Time Boxing",
          value: "Time Boxing",
          desc: "Strictly scheduling specific time blocks for each task.",
          icon: Target
        }].map((card) => {
          const IconComponent = card.icon;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
            setValues({
              ...values,
              work_style: card.value
            });
          }, className: `flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 ${values.work_style === card.value ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(168,85,247,0.25)] text-foreground scale-[1.02]" : "bg-background/40 border-border hover:bg-background/60 text-muted-foreground"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { className: "h-6 w-6 text-primary-glow mb-3 animate-pulse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-bold text-foreground mb-1", children: card.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground leading-normal", children: card.desc })
          ] }, card.value);
        }) }) : current.key === "user_level" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [{
          label: "Beginner",
          value: "Beginner",
          desc: "New to this domain, need step-by-step simple instructions.",
          icon: Sparkles
        }, {
          label: "Intermediate",
          value: "Intermediate",
          desc: "Have some experience, need standard tasks with moderate detail.",
          icon: Target
        }, {
          label: "Expert",
          value: "Expert",
          desc: "Deeply experienced, need high-level milestones to execute quickly.",
          icon: Zap
        }].map((card) => {
          const IconComponent = card.icon;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
            setValues({
              ...values,
              user_level: card.value
            });
          }, className: `flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 ${values.user_level === card.value ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(168,85,247,0.25)] text-foreground scale-[1.02]" : "bg-background/40 border-border hover:bg-background/60 text-muted-foreground"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { className: "h-6 w-6 text-primary-glow mb-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-bold text-foreground mb-1", children: card.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground leading-normal", children: card.desc })
          ] }, card.value);
        }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { autoFocus: true, type: "text", placeholder: current.placeholder, value: values[current.key], onChange: (e) => setValues({
          ...values,
          [current.key]: e.target.value
        }), onKeyDown: (e) => {
          if (e.key === "Enter") nextQuestion();
        }, className: "bg-background/40 text-base h-12" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", onClick: () => setStep(Math.max(0, step - 1)), disabled: step === 0, className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
            " Back"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: nextQuestion, disabled: !values[current.key]?.trim(), className: "gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow", children: [
            isLastQuestion ? "Complete Setup" : "Next",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
          ] })
        ] })
      ] }, "questionnaire") })
    ] })
  ] });
}
export {
  Onboarding as component
};
