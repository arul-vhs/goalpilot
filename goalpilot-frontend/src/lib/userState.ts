import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserState {
  userId: string | null;
  token: string | null;
  loading: boolean;
}

let state: UserState = {
  userId: null,
  token: null,
  loading: true,
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
  supabase.auth.getSession().then(({ data: { session } }) => {
    updateState({
      userId: session?.user?.id ?? null,
      token: session?.access_token ?? null,
      loading: false,
    });
  }).catch(() => {
    updateState({ loading: false });
  });

  // Listen for changes
  supabase.auth.onAuthStateChange((event, session) => {
    updateState({
      userId: session?.user?.id ?? null,
      token: session?.access_token ?? null,
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
  });

  useEffect(() => {
    return subscribeToUserState((s) => {
      setCurrentState(s);
    });
  }, []);

  return currentState;
}
