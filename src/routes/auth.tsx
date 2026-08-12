import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),

  head: () => ({
    meta: [{ title: "Sign in — Luxor AI" }],
  }),

  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: redirect ?? "/" });
    }
  }, [loading, user, redirect, navigate]);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    setBusy(true);
    setErr(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setBusy(false);

    if (error) {
      setErr(error.message);
    }
  };

  const onGoogleSignIn = async () => {
    setBusy(true);
    setErr(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      setBusy(false);
      setErr(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-20">

      <p className="text-gold text-xs uppercase tracking-[0.3em] divider-gold text-center">
        Luxor AI
      </p>

      <h1 className="mt-3 text-center font-display text-4xl">
        Welcome back
      </h1>

      <p className="mt-3 text-center text-sm text-muted-foreground">
        Sign in to your Luxor AI account
      </p>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card/60 p-7">

        {/* Google Sign In */}
        <button
          type="button"
          onClick={onGoogleSignIn}
          disabled={busy}
          className="w-full rounded-full border border-border py-3 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
        >
          {busy ? "Please wait…" : "Continue with Google"}
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">
            OR
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Email Sign In */}
        <form onSubmit={onSignIn} className="space-y-5">

          <div className="space-y-2">
            <Label>Email</Label>

            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          {err && (
            <p className="text-sm text-destructive">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-gradient-gold px-5 py-3 text-sm font-medium text-primary-foreground shadow-gold disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>

        </form>

      </div>
    </div>
  );
}