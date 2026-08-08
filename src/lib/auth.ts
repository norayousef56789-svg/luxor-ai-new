import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "business" | "tourist";

export type AuthState = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
};

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    roles: [],
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    const loadRoles = async (userId: string): Promise<AppRole[]> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to load roles:", error);
        return [];
      }

      return (data ?? []).map((r) => r.role as AppRole);
    };

    const setAuthState = async (session: Session | null) => {
      if (!mounted) return;

      if (!session?.user) {
        setState({
          session: null,
          user: null,
          roles: [],
          loading: false,
        });
        return;
      }

      const roles = await loadRoles(session.user.id);

      if (!mounted) return;

      setState({
        session,
        user: session.user,
        roles,
        loading: false,
      });
    };

    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await setAuthState(session);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        setAuthState(session);
      }, 0);
    });

    initialize();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

export const signOut = () => supabase.auth.signOut();