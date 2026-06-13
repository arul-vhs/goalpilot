import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserState {
  userId: string | null;
  token: string | null;
  loading: boolean;
  activeGoalId: string | null;
  personaCompleted: boolean;
}

let state: UserState = {
  userId: null,
  token: null,
  loading: true,
  activeGoalId: null,
  personaCompleted: false,
};

const listeners = new Set<(state: UserState) => void>();

function updateState(newState: Partial<UserState>) {
  state = { ...state, ...newState };
  listeners.forEach((l) => l(state));
}

export function subscribeToUserState(listener: (state: UserState) => void) {
  listeners.add(listener);
  listener(state);
  return () => {
    listeners.delete(listener);
  };
}

// Initialize and listen to auth changes
if (typeof window !== "undefined") {
  // Get initial session
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    let activeGoalId = null;
    let personaCompleted = false;
    if (session?.user?.id) {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("last_active_goal_id, persona_completed")
          .eq("id", session.user.id)
          .maybeSingle();
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
      loading: false,
    });
  }).catch(() => {
    updateState({ loading: false });
  });

  // Listen for changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    let activeGoalId = null;
    let personaCompleted = false;
    if (session?.user?.id) {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("last_active_goal_id, persona_completed")
          .eq("id", session.user.id)
          .maybeSingle();
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
      loading: false,
    });
  });
}

export const userState = {
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
  setActiveGoalId(id: string | null) {
    updateState({ activeGoalId: id });
  },
  setPersonaCompleted(completed: boolean) {
    updateState({ personaCompleted: completed });
  },
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (state.token) {
      headers["Authorization"] = `Bearer ${state.token}`;
    }
    if (state.userId) {
      headers["X-User-Id"] = state.userId;
    }
    return headers;
  }
};

export function useUserState() {
  const [currentState, setCurrentState] = useState<UserState>({
    userId: state.userId,
    token: state.token,
    loading: state.loading,
    activeGoalId: state.activeGoalId,
    personaCompleted: state.personaCompleted,
  });

  useEffect(() => {
    return subscribeToUserState((s) => {
      setCurrentState(s);
    });
  }, []);

  return currentState;
}
