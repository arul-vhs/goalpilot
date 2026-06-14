import { r as reactExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-hQzx3ycp.mjs";
let state = {
  userId: null,
  token: null,
  loading: true,
  activeGoalId: null,
  personaCompleted: false,
  allMissions: []
};
const listeners = /* @__PURE__ */ new Set();
function updateState(newState) {
  state = { ...state, ...newState };
  listeners.forEach((l) => l(state));
}
function subscribeToUserState(listener) {
  listeners.add(listener);
  listener(state);
  return () => {
    listeners.delete(listener);
  };
}
if (typeof window !== "undefined") {
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    let activeGoalId = null;
    let personaCompleted = false;
    if (session?.user?.id) {
      try {
        const { data } = await supabase.from("profiles").select("last_active_goal_id, persona_completed").eq("id", session.user.id).maybeSingle();
        activeGoalId = data?.last_active_goal_id ?? null;
        personaCompleted = !!data?.persona_completed;
      } catch (e) {
        console.error("Failed to load user profile", e);
      }
    }
    updateState({
      userId: session?.user?.id ?? null,
      token: session?.access_token ?? null,
      activeGoalId,
      personaCompleted,
      loading: false
    });
  }).catch(() => {
    updateState({ loading: false });
  });
  supabase.auth.onAuthStateChange(async (event, session) => {
    let activeGoalId = null;
    let personaCompleted = false;
    if (session?.user?.id) {
      try {
        const { data } = await supabase.from("profiles").select("last_active_goal_id, persona_completed").eq("id", session.user.id).maybeSingle();
        activeGoalId = data?.last_active_goal_id ?? null;
        personaCompleted = !!data?.persona_completed;
      } catch (e) {
        console.error("Failed to load user profile on auth change", e);
      }
    }
    updateState({
      userId: session?.user?.id ?? null,
      token: session?.access_token ?? null,
      activeGoalId,
      personaCompleted,
      loading: false
    });
  });
}
const userState = {
  get userId() {
    return state.userId;
  },
  get token() {
    return state.token;
  },
  get loading() {
    return state.loading;
  },
  get activeGoalId() {
    return state.activeGoalId;
  },
  get personaCompleted() {
    return state.personaCompleted;
  },
  get allMissions() {
    return state.allMissions;
  },
  setActiveGoalId(id) {
    updateState({ activeGoalId: id });
  },
  setPersonaCompleted(completed) {
    updateState({ personaCompleted: completed });
  },
  setAllMissions(missions) {
    updateState({ allMissions: missions });
  },
  getAuthHeaders() {
    const headers = {};
    if (state.token) {
      headers["Authorization"] = `Bearer ${state.token}`;
    }
    if (state.userId) {
      headers["X-User-Id"] = state.userId;
    }
    return headers;
  }
};
function useUserState() {
  const [currentState, setCurrentState] = reactExports.useState({
    userId: state.userId,
    token: state.token,
    loading: state.loading,
    activeGoalId: state.activeGoalId,
    personaCompleted: state.personaCompleted,
    allMissions: state.allMissions
  });
  reactExports.useEffect(() => {
    return subscribeToUserState((s) => {
      setCurrentState(s);
    });
  }, []);
  return currentState;
}
function getApiUrl(path) {
  const baseUrl = "https://goalpilot-1.onrender.com";
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  const url = `${cleanBase}/${cleanPath}`;
  return url;
}
export {
  useUserState as a,
  getApiUrl as g,
  userState as u
};
