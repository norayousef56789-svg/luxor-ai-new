import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registerBusinessAccount } from "@/lib/business.functions";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BusinessType = Database["public"]["Enums"]["business_type"];
const TYPES: BusinessType[] = ["Hotel", "Restaurant", "Bazaar", "Tour Company"];

export const Route = createFileRoute("/business/register")({
  head: () => ({ meta: [{ title: "Register your business — Luxor AI" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const register = useServerFn(registerBusinessAccount);
  const [form, setForm] = useState({
    fullName: "",
    businessName: "",
    type: "Hotel" as BusinessType,
    phone: "",
    email: "",
    password: "",
    address: "",
    description: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      await register({ data: form });
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) throw error;
      navigate({ to: "/business/dashboard" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <p className="text-gold text-xs uppercase tracking-[0.3em] divider-gold text-center">For business owners</p>
      <h1 className="mt-3 text-center font-display text-4xl">Register your business</h1>
      <p className="mt-3 text-center text-muted-foreground">
        Join Luxor's smart tourism platform. Listings are reviewed by Luxor admins before going live.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-5 rounded-2xl border border-border/60 bg-card/60 p-8">
        <div className="space-y-2"><Label>Your full name</Label><Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required /></div>
        <div className="space-y-2"><Label>Business name</Label><Input value={form.businessName} onChange={(e) => set("businessName", e.target.value)} required placeholder="Nile Sunset Bazaar" /></div>
        <div className="space-y-2">
          <Label>Business type</Label>
          <select value={form.type} onChange={(e) => set("type", e.target.value as BusinessType)} className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} required placeholder="+20 …" /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></div>
        </div>
        <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={8} /></div>
        <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => set("address", e.target.value)} required placeholder="Street, district, Luxor" /></div>
        <div className="space-y-2"><Label>Description (optional)</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="A short pitch for your business…" /></div>

        {err && <p className="text-sm text-destructive">{err}</p>}

        <button disabled={busy} className="w-full rounded-full bg-gradient-gold px-5 py-3 text-sm font-medium text-primary-foreground shadow-gold disabled:opacity-60">
          {busy ? "Creating account…" : "Create account & submit for approval"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Already registered? <Link to="/business/login" className="text-gold hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
