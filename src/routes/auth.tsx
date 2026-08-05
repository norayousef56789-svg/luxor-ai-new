import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { registerTouristAccount } from "@/lib/business.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
    mode: s.mode === "signup" ? "signup" : "signin",
  }),
  head: () => ({ meta: [{ title: "Sign in — Luxor AI" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect, mode } = useSearch({ from: "/auth" });
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">(
  mode === "signup" ? "signup" : "signin"
);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const registerTourist = useServerFn(registerTouristAccount);

  useEffect(() => {
    if (!loading && user) navigate({ to: redirect ?? "/" });
  }, [loading, user, redirect, navigate]);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setErr(error.message);
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await registerTourist({ data: { fullName, email, password } });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-up failed");
    } finally {
      setBusy(false);
    }
  };
  const onGoogleSignIn = async () => {
  setErr(null);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}`,
    },
  });

  if (error) {
    setErr(error.message);
  }
};

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <p className="text-gold text-xs uppercase tracking-[0.3em] divider-gold text-center">Luxor account</p>
      <h1 className="mt-3 text-center font-display text-4xl">{tab === "signin" ? "Welcome back" : "Join Luxor"}</h1>

      <div className="mt-8 flex gap-2 rounded-full border border-border/60 p-1 bg-card/50">
        <button onClick={() => setTab("signin")} className={`flex-1 rounded-full py-2 text-sm transition ${tab === "signin" ? "bg-gold/15 text-gold" : "text-foreground/70"}`}>Sign in</button>
        <button onClick={() => setTab("signup")} className={`flex-1 rounded-full py-2 text-sm transition ${tab === "signup" ? "bg-gold/15 text-gold" : "text-foreground/70"}`}>Create account</button>
      </div>

      <form onSubmit={tab === "signin" ? onSignIn : onSignUp} className="mt-6 space-y-5 rounded-2xl border border-border/60 bg-card/60 p-7">
        {tab === "signup" && (
          <div className="space-y-2"><Label>Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
        )}
        <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} /></div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button disabled={busy} className="w-full rounded-full bg-gradient-gold px-5 py-3 text-sm font-medium text-primary-foreground shadow-gold disabled:opacity-60">
          {busy ? "Please wait…" : tab === "signin" ? "Sign in" : "Create account"}
        </button>
        <div className="my-4 text-center text-sm text-muted-foreground">
  or
</div>

<button
  type="button"
  onClick={async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      setErr(error.message);
    }
  }}
  className="w-full rounded-full border border-border py-3"
>
  Continue with Google
</button>
        <p className="text-center text-xs text-muted-foreground">
          Are you a business owner? <Link to="/business/register" className="text-gold hover:underline">Register your business</Link>
        </p>
      </form>
    </div>
  );
}
