import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/business/login")({
  head: () => ({ meta: [{ title: "Business sign in — Luxor AI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, roles, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && roles.includes("business")) {
      navigate({ to: "/business/dashboard" });
    }
  }, [loading, user, roles, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setErr(error.message);
  };

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <p className="text-gold text-xs uppercase tracking-[0.3em] divider-gold text-center">Business portal</p>
      <h1 className="mt-3 text-center font-display text-4xl">Welcome back</h1>

      <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border border-border/60 bg-card/60 p-8">
        <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button disabled={busy} className="w-full rounded-full bg-gradient-gold px-5 py-3 text-sm font-medium text-primary-foreground shadow-gold disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          New here? <Link to="/business/register" className="text-gold hover:underline">Register your business</Link>
        </p>
      </form>
    </div>
  );
}
