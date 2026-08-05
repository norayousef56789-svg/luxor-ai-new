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

    const loadRoles = async (userId: string) => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      return (data ?? []).map((r) => r.role as AppRole);
    };

    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      if (!mounted) return;
      if (!session?.user) {
        setState({ session: null, user: null, roles: [], loading: false });
        return;
      }
      setState((s) => ({ ...s, session, user: session.user, loading: true }));
      setTimeout(async () => {
        const roles = await loadRoles(session.user.id);
        if (!mounted) return;
        setState({ session, user: session.user, roles, loading: false });
      }, 0);
    });

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session?.user) {
        setState({ session: null, user: null, roles: [], loading: false });
        return;
      }
      const roles = await loadRoles(data.session.user.id);
      if (!mounted) return;
      setState({ session: data.session, user: data.session.user, roles, loading: false });
    })();

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export const signOut = () => supabase.auth.signOut();
