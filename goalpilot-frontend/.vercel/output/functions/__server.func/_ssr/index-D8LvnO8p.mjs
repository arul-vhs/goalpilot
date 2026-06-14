import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button, I as Input } from "./input-BiB-PFhx.mjs";
import { L as Label } from "./label-D4W0VQAM.mjs";
import { s as supabase } from "./client-hQzx3ycp.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { S as Sparkles, T as Target, B as Brain, M as Mail, L as Lock, A as ArrowRight } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
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
function Landing() {
  const navigate = useNavigate();
  const [mode, setMode] = reactExports.useState("signin");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    supabase.auth.getSession().then(({
      data
    }) => {
      if (data.session) navigate({
        to: "/dashboard"
      });
    });
  }, [navigate]);
  const handleGoogle = async () => {
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        toast.error(error.message ?? "Sign-in failed");
        setLoading(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unexpected sign-in error");
      setLoading(false);
    }
  };
  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm, or sign in.");
        setMode("signin");
      } else {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        navigate({
          to: "/dashboard"
        });
      }
    } catch (err) {
      toast.error(err.message ?? "Auth failed");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/30 blur-[120px]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/40 blur-[120px]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow btn-glow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-semibold tracking-tight", children: "GoalPilot" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#auth", className: "text-sm text-muted-foreground hover:text-foreground", children: "Sign in" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative z-10 mx-auto grid max-w-7xl gap-16 px-6 py-12 lg:grid-cols-2 lg:gap-12 lg:py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 20
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        duration: 0.6
      }, className: "flex flex-col justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex w-fit items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary-glow" }),
          "AI Productivity, reimagined"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-6 text-5xl font-bold leading-[1.05] tracking-tight lg:text-6xl", children: [
          "Pilot every ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text", children: "vague goal" }),
          " into focused daily action."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 max-w-lg text-lg text-muted-foreground", children: "GoalPilot turns your fuzzy ambitions into a structured breakdown, a daily flight plan, and a living knowledge graph of everything you learn." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 grid gap-4 sm:grid-cols-3", children: [{
          icon: Target,
          label: "Goal Breakdown"
        }, {
          icon: Brain,
          label: "Knowledge Graph"
        }, {
          icon: Sparkles,
          label: "AI Focus Coach"
        }].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(f.icon, { className: "h-5 w-5 text-primary-glow" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-sm font-medium", children: f.label })
        ] }, f.label)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { id: "auth", initial: {
        opacity: 0,
        y: 20
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        duration: 0.6,
        delay: 0.15
      }, className: "flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong w-full rounded-2xl p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold", children: mode === "signin" ? "Welcome back" : "Create your account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: mode === "signin" ? "Sign in to continue your mission." : "Start piloting your goals today." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: handleGoogle, disabled: loading, variant: "outline", className: "mt-6 w-full justify-center gap-3 border-border bg-white/5 hover:bg-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleIcon, {}),
          " Continue with Google"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-6 flex items-center gap-3 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-border" }),
          " or email ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-border" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleEmail, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", className: "pl-9 bg-background/40" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value), placeholder: "••••••••", className: "pl-9 bg-background/40" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: loading, className: "w-full gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90 btn-glow", children: [
            mode === "signin" ? "Sign in" : "Create account",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
          mode === "signin" ? "No account yet?" : "Already have one?",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMode(mode === "signin" ? "signup" : "signin"), className: "text-primary-glow hover:underline", children: mode === "signin" ? "Sign up" : "Sign in" })
        ] })
      ] }) })
    ] })
  ] });
}
function GoogleIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#EA4335", d: "M12 10.2v3.9h5.5c-.2 1.5-1.7 4.4-5.5 4.4-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.7 14.6 2.8 12 2.8 6.9 2.8 2.8 6.9 2.8 12s4.1 9.2 9.2 9.2c5.3 0 8.8-3.7 8.8-9 0-.6-.1-1.1-.2-1.6H12z" }) });
}
export {
  Landing as component
};
