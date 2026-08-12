import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/business/login")({
  head: () => ({
    meta: [{ title: "Business sign in — Luxor AI" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // لو المستخدم مسجل دخول بالفعل، ندخله على لوحة الأعمال
  useEffect(() => {
    if (!loading && user) {
      navigate({
        to: "/business/dashboard",
      });
    }
  }, [loading, user, navigate]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErr(null);
    setBusy(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // تسجيل الدخول باستخدام Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        console.error("Business login error:", error);

        setErr(error.message);
        setBusy(false);
        return;
      }

      // نتأكد أن Supabase أنشأ Session بالفعل
      if (!data.session || !data.user) {
        setErr("Login succeeded, but no session was created. Please try again.");
        setBusy(false);
        return;
      }

      console.log("Business login successful:", data.user.email);

      // ندخل مباشرة إلى لوحة الأعمال
      await navigate({
        to: "/business/dashboard",
      });
    } catch (error) {
      console.error("Unexpected business login error:", error);

      setErr(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <p className="text-center text-xs uppercase tracking-[0.3em] text-gold divider-gold">
        Business portal
      </p>

      <h1 className="mt-3 text-center font-display text-4xl">
        Welcome back
      </h1>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-5 rounded-2xl border border-border/60 bg-card/60 p-8"
      >
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="business-email">Email</Label>

          <Input
            id="business-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="business@example.com"
            autoComplete="email"
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="business-password">Password</Label>

          <Input
            id="business-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        {/* Error */}
        {err && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              {err}
            </p>
          </div>
        )}

        {/* Login button */}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-gradient-gold px-5 py-3 text-sm font-medium text-primary-foreground shadow-gold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        {/* Register */}
        <p className="text-center text-xs text-muted-foreground">
          New here?{" "}
          <Link
            to="/business/register"
            className="text-gold hover:underline"
          >
            Register your business
          </Link>
        </p>
      </form>
    </div>
  );
}