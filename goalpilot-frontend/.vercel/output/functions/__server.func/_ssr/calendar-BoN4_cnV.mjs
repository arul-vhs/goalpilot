import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { S as SidebarProvider, A as AppSidebar, a as SidebarTrigger } from "./app-sidebar-BZTQpdKh.mjs";
import { s as supabase } from "./client-hQzx3ycp.mjs";
import { B as Button, c as cn } from "./input-BiB-PFhx.mjs";
import { S as Switch$1, a as SwitchThumb } from "../_libs/radix-ui__react-switch.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as useUserState, u as userState, g as getApiUrl } from "./api-config-CUXI1WgJ.mjs";
import { s as startOfWeek, a as addDays, f as format, p as parseISO } from "../_libs/date-fns.mjs";
import { o as Calendar, R as RefreshCw, S as Sparkles, e as LoaderCircle, C as Clock, q as CircleAlert, r as Check, s as Link2 } from "../_libs/lucide-react.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/radix-ui__react-separator.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/radix-ui__react-scroll-area.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__number.mjs";
import "./label-D4W0VQAM.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const Switch = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Switch$1,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      SwitchThumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = Switch$1.displayName;
const mockGoogleEvents = [{
  title: "Project Sync meeting",
  start: "10:00",
  end: "11:00",
  dayOffset: 0
}, {
  title: "Dental checkup",
  start: "14:00",
  end: "15:00",
  dayOffset: 2
}, {
  title: "Weekly review with manager",
  start: "09:30",
  end: "10:30",
  dayOffset: 4
}];
function CalendarPage() {
  const {
    activeGoalId
  } = useUserState();
  const [tasks, setTasks] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [rescheduling, setRescheduling] = reactExports.useState(false);
  const [syncGoogle, setSyncGoogle] = reactExports.useState(false);
  const loadTasksAndSchedules = reactExports.useCallback(async () => {
    if (!activeGoalId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from("tasks").select("id,title,description,priority,effort,depends_on,completed,goal_id").eq("goal_id", activeGoalId).order("created_at", {
        ascending: true
      });
      if (error) throw error;
      const parsedTasks = (data ?? []).map((t) => {
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
          scheduled_end
        };
      });
      setTasks(parsedTasks);
    } catch (e) {
      toast.error(e.message || "Failed to load schedule.");
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    loadTasksAndSchedules();
  }, [loadTasksAndSchedules]);
  const weekStart = startOfWeek(/* @__PURE__ */ new Date(), {
    weekStartsOn: 1
  });
  const weekDays = Array.from({
    length: 7
  }).map((_, idx) => addDays(weekStart, idx));
  const googleCalendarEvents = reactExports.useMemo(() => {
    if (!syncGoogle) return [];
    return mockGoogleEvents.map((event) => {
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
  const allScheduledItems = reactExports.useMemo(() => {
    const items = [];
    googleCalendarEvents.forEach((e) => {
      items.push({
        id: e.title,
        title: e.title,
        start: e.start,
        end: e.end,
        isGoogle: true
      });
    });
    tasks.forEach((t) => {
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
  const handleSmartReschedule = async () => {
    setRescheduling(true);
    try {
      const token = userState.token;
      if (!token) {
        toast.error("Session token expired.");
        setRescheduling(false);
        return;
      }
      const calendarEventsToSend = googleCalendarEvents.map((e) => ({
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
          start_date: (/* @__PURE__ */ new Date()).toISOString()
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to reschedule schedule.");
      }
      toast.success("Schedule re-optimized around availability and deadlines!");
      await loadTasksAndSchedules();
    } catch (e) {
      toast.error(e.message || "Failed to optimize schedule.");
    } finally {
      setRescheduling(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AppSidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "h-14 flex items-center gap-3 border-b border-border px-4 glass", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarTrigger, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-primary-glow" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Calendar Planner" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mr-2 bg-white/5 border border-border rounded-lg px-3 py-1.5 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Google Calendar Sync" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: syncGoogle, onCheckedChange: (val) => {
            setSyncGoogle(val);
            toast.success(val ? "Synced Google Calendar meetings." : "Disabled calendar sync.");
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: rescheduling, onClick: handleSmartReschedule, className: "gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow", children: [
          rescheduling ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
          "Smart Reschedule"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 p-6 lg:p-10 flex flex-col overflow-y-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
          opacity: 0,
          y: 10
        }, animate: {
          opacity: 1,
          y: 0
        }, transition: {
          duration: 0.5
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary-glow" }),
            " Daily Flight agenda"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-2 text-4xl font-bold tracking-tight", children: [
            "Your ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text", children: "Weekly Plan" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-muted-foreground", children: 'Availability-based agenda. If you miss a task, or when calendar sync changes your free blocks, click "Smart Reschedule" to re-arrange.' })
        ] }),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center text-muted-foreground mt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary-glow" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid gap-6 lg:grid-cols-[1fr_300px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong border border-border rounded-2xl p-6 overflow-x-auto min-w-[700px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-4 border-b border-border pb-4", children: weekDays.map((day, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase", children: format(day, "eee") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold mt-1", children: format(day, "d") })
            ] }, idx)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-4 pt-4 min-h-[350px]", children: weekDays.map((day, dayIdx) => {
              const dayStr = format(day, "yyyy-MM-dd");
              const dayItems = allScheduledItems.filter((item) => item.start.startsWith(dayStr));
              return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-r border-dashed border-border last:border-0 pr-2 min-h-[300px] flex flex-col gap-2", children: dayItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground/50 text-center mt-4", children: "Free Block" }) : dayItems.map((item) => {
                const stTime = format(parseISO(item.start), "hh:mm a");
                const isGoogle = item.isGoogle;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl p-2.5 text-left flex flex-col justify-between text-xs border ${isGoogle ? "bg-red-500/5 border-red-500/20 text-red-300" : "bg-primary/5 border-primary/20 text-foreground shadow-[0_2px_10px_rgba(168,85,247,0.05)]"}`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold leading-tight truncate", children: item.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-muted-foreground mt-1 flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-2.5 w-2.5" }),
                      " ",
                      stTime
                    ] })
                  ] }),
                  !isGoogle && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block mt-2 text-[8px] font-semibold w-fit uppercase px-1.5 py-0.5 rounded ${item.priority === "critical" ? "bg-red-950/60 text-red-400" : item.priority === "high" ? "bg-orange-950/60 text-orange-400" : "bg-white/5 text-muted-foreground"}`, children: item.priority }),
                  isGoogle && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block mt-2 text-[8px] font-semibold w-fit uppercase px-1.5 py-0.5 rounded bg-white/5 text-red-400/80", children: "Meeting" })
                ] }, item.id);
              }) }, dayIdx);
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong border border-border rounded-2xl p-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-sm flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-primary-glow" }),
                " Conflict Resolver"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2 leading-relaxed", children: "GoalPilot schedules tasks only during your set focus hours. If you import calendar events, uncompleted tasks are shifted automatically to prevent clashing." }),
              syncGoogle ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 border border-green-500/20 bg-green-500/5 text-green-400 text-xs p-3 rounded-xl flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Google Calendar connection simulated. Clashing slots detected & resolved." })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 border border-border bg-white/5 text-muted-foreground text-xs p-3 rounded-xl flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-4 w-4 shrink-0 text-primary-glow" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sync with Google Calendar to audit focus hours." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong border border-border rounded-2xl p-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm", children: "Rescheduling Rules" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-3 space-y-2 text-xs text-muted-foreground list-disc pl-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Pending tasks are processed in order of pre-requisites." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "High priority tasks claim earliest available slots." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Tasks are limited to your configured daily hours limit." })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  CalendarPage as component
};
