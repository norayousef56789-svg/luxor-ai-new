import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === "string"
        ? search.redirect
        : undefined,
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
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      void navigate({
        to: redirect ?? "/",
      });
    }
  }, [loading, user, redirect, navigate]);

  const sendAdminNotification = async (
    loginEmail: string,
    name?: string,
  ) => {
    try {
      await supabase.functions.invoke("notify-admin-signup", {
        body: {
          type: "login",
          email: loginEmail,
          name: name || "غير متوفر",
        },
      });
    } catch (notificationError) {
      console.error(
        "Admin notification failed:",
        notificationError,
      );
    }
  };

  const onSignIn = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setBusy(true);
    setErr(null);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setBusy(false);

    if (error) {
      setErr(error.message);
      return;
    }

    if (data.user?.email) {
      void sendAdminNotification(
        data.user.email,
        data.user.user_metadata?.full_name,
      );
    }
  };

  const onGoogleSignIn = async () => {
    setBusy(true);
    setErr(null);

    const { error } =
      await supabase.auth.signInWithOAuth({
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
      <p className="text-center text-gold text-xs uppercase tracking-[0.3em] divider-gold">
        {t("auth.tagline")}
      </p>

      <h1 className="mt-3 text-center font-display text-4xl">
        {t("auth.welcomeBack")}
      </h1>

      <p className="mt-3 text-center text-sm text-muted-foreground">
        {t("auth.signIn")}
      </p>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card/60 p-7">
        <button
          type="button"
          onClick={onGoogleSignIn}
          disabled={busy}
          className="w-full rounded-full border border-border py-3 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
        >
          {busy
            ? t("auth.pleaseWait")
            : t("auth.continueWithGoogle")}
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />

          <span className="text-xs text-muted-foreground">
            OR
          </span>

          <div className="h-px flex-1 bg-border" />
        </div>

        <form
          onSubmit={onSignIn}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label>{t("auth.email")}</Label>

            <Input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("auth.password")}</Label>

            <Input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
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
            {busy
              ? t("auth.pleaseWait")
              : t("auth.signIn")}
          </button>
        </form>
      </div>
    </div>
  );
}