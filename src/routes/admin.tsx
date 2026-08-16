import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Shield, Check, X, Trash2, MapPin, Tag, Store, LogOut, Crown, Plus, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, signOut } from "@/lib/auth";
import { claimFirstAdmin } from "@/lib/business.functions";
import { imageForAttractionSlug } from "@/lib/images";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Luxor AI" }] }),
  component: AdminGate,
});

function AdminGate() {
  const { user, loading, roles } = useAuth();
  const navigate = useNavigate();
  const claim = useServerFn(claimFirstAdmin);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const { data: adminCount } = useQuery({
    queryKey: ["admin-count"],
    queryFn: async () => {
      const { count } = await supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin");
      return count ?? 0;
    },
  });

  useEffect(() => {
    navigate({
  to: "/auth",
  search: {
    redirect: "/admin",
  },
});
  }, [loading, user, navigate]);

  if (!user) return null;
  if (roles.includes("admin")) return <AdminConsole />;

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <div className="text-center">
        <div className="inline-grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold"><Shield className="h-6 w-6" /></div>
        <h1 className="mt-4 font-display text-3xl">Admin access required</h1>
        <p className="mt-3 text-sm text-muted-foreground">You are signed in as <span className="text-gold">{user.email}</span> but do not have admin privileges.</p>
      </div>

      {adminCount === 0 ? (
        <div className="mt-8 rounded-2xl border border-gold/40 bg-gold/5 p-6 text-center">
          <Crown className="h-6 w-6 text-gold mx-auto" />
          <h2 className="mt-3 font-display text-lg">Claim platform ownership</h2>
          <p className="mt-2 text-xs text-muted-foreground">No admin exists yet. The first signed-in user can claim admin access.</p>
          <button
            onClick={async () => {
              setBusy(true); setErr(null);
              try { await claim({}); window.location.reload(); }
              catch (e) { setErr(e instanceof Error ? e.message : "Failed"); }
              finally { setBusy(false); }
            }}
            disabled={busy}
            className="mt-4 rounded-full bg-gradient-gold px-5 py-2.5 text-sm text-primary-foreground shadow-gold disabled:opacity-60"
          >
            {busy ? "Claiming…" : "Become the first admin"}
          </button>
          {err && <p className="mt-3 text-xs text-destructive">{err}</p>}
        </div>
      ) : (
        <p className="mt-8 text-center text-sm text-muted-foreground">Ask an existing administrator to grant you the admin role.</p>
      )}

      <div className="mt-6 text-center">
        <button onClick={() => signOut()} className="text-xs text-muted-foreground hover:text-gold">Sign out</button>
      </div>
    </div>
  );
}

type AdminTab = "approvals" | "businesses" | "users" | "offers" | "attractions" | "events";

function AdminConsole() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<AdminTab>("approvals");

  const { data: businesses } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("businesses").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const { data: offers } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("offers").select("*, businesses(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const { data: profiles } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, created_at");
      const map = new Map<string, string[]>();
      (roles ?? []).forEach((r) => {
        const arr = map.get(r.user_id) ?? [];
        arr.push(r.role); map.set(r.user_id, arr);
      });
      return (profiles ?? []).map((p) => ({ ...p, roles: map.get(p.id) ?? [] }));
    },
  });
  const { data: attractions } = useQuery({
    queryKey: ["admin-attractions"],
    queryFn: async () => (await supabase.from("attractions").select("*").order("name")).data ?? [],
  });
  const { data: events } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => (await supabase.from("events").select("*").order("starts_at")).data ?? [],
  });

  const pending = (businesses ?? []).filter((b) => b.status === "pending");

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ["admin-businesses"] });
    qc.invalidateQueries({ queryKey: ["admin-offers"] });
    qc.invalidateQueries({ queryKey: ["admin-attractions"] });
    qc.invalidateQueries({ queryKey: ["admin-events"] });
  };

  const setStatus = async (id: string, status: "approved" | "rejected") => {
    await supabase.from("businesses").update({ status }).eq("id", id);
    refreshAll();
  };
  const removeBusiness = async (id: string) => {
    if (!confirm("Delete this business?")) return;
    await supabase.from("businesses").delete().eq("id", id);
    refreshAll();
  };
  const removeOffer = async (id: string) => {
    await supabase.from("offers").delete().eq("id", id);
    refreshAll();
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-gold text-xs uppercase tracking-[0.3em]">Administration</p>
          <h1 className="font-display text-3xl mt-1">Luxor AI control center</h1>
        </div>
        <button onClick={() => signOut().then(() => navigate({ to: "/" }))} className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm hover:border-gold/40">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-5">
        <StatTile label="Users" value={profiles?.length ?? 0} />
        <StatTile label="Businesses" value={businesses?.length ?? 0} />
        <StatTile label="Pending approvals" value={pending.length} highlight />
        <StatTile label="Active offers" value={(offers ?? []).filter((o) => o.active).length} />
        <StatTile label="Attractions / Events" value={(attractions?.length ?? 0) + (events?.length ?? 0)} />
      </div>

      <nav className="mt-8 flex flex-wrap gap-2 border-b border-border/60 pb-3">
        {([
          ["approvals", `Approvals (${pending.length})`],
          ["businesses", "Businesses"],
          ["users", "Users"],
          ["offers", "Offers"],
          ["attractions", "Attractions"],
          ["events", "Events"],
        ] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-2 text-sm transition ${tab === k ? "bg-gold/15 text-gold border border-gold/40" : "text-foreground/70 hover:text-gold"}`}>
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "approvals" && (
          <div className="space-y-4">
            {pending.length === 0 && <p className="text-muted-foreground">No pending businesses 🎉</p>}
            {pending.map((b) => (
              <div key={b.id} className="rounded-xl border border-border/60 bg-card/50 p-5 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-display text-xl">{b.name}</div>
                  <div className="text-xs text-gold uppercase tracking-widest mt-0.5">{b.type}</div>
                  <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {b.address}</div>
                  <div className="text-sm text-muted-foreground">{b.email} · {b.phone}</div>
                  {b.description && <p className="mt-2 text-sm text-foreground/80 max-w-xl">{b.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStatus(b.id, "approved")} className="inline-flex items-center gap-1 rounded-full bg-gradient-gold px-4 py-2 text-sm text-primary-foreground"><Check className="h-4 w-4" /> Approve</button>
                  <button onClick={() => setStatus(b.id, "rejected")} className="inline-flex items-center gap-1 rounded-full border border-destructive/50 text-destructive px-4 py-2 text-sm"><X className="h-4 w-4" /> Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "businesses" && (
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-midnight/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
                <tr><th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {(businesses ?? []).map((b) => (
                  <tr key={b.id} className="border-t border-border/40">
                    <td className="p-3 font-medium">{b.name}</td>
                    <td className="p-3 text-muted-foreground">{b.type}</td>
                    <td className="p-3 text-muted-foreground">{b.email}</td>
                    <td className="p-3"><StatusPill status={b.status} /></td>
                    <td className="p-3 text-right space-x-3">
                      {b.status !== "approved" && <button onClick={() => setStatus(b.id, "approved")} className="text-xs text-gold hover:underline">Approve</button>}
                      <button onClick={() => removeBusiness(b.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "users" && (
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-midnight/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
                <tr><th className="p-3">User</th><th className="p-3">Roles</th><th className="p-3">Joined</th></tr>
              </thead>
              <tbody>
                {(profiles ?? []).map((p) => (
                  <tr key={p.id} className="border-t border-border/40">
                    <td className="p-3 font-medium">{p.full_name ?? "—"}</td>
                    <td className="p-3 text-muted-foreground">{p.roles.join(", ") || "tourist"}</td>
                    <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "offers" && (
          <div className="space-y-3">
            {(offers ?? []).map((o) => (
              <div key={o.id} className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold"><Tag className="h-4 w-4" /></div>
                  <div>
                    <div className="text-sm"><span className="font-semibold text-gold">{o.discount}</span> · {o.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2"><Store className="h-3 w-3" /> {(o as { businesses?: { name: string } }).businesses?.name ?? "—"} {o.valid_until && `· until ${o.valid_until}`}</div>
                    {o.description && <p className="text-xs text-foreground/70 mt-1 max-w-xl">{o.description}</p>}
                  </div>
                </div>
                <button onClick={() => removeOffer(o.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}

        {tab === "attractions" && <AttractionsAdmin />}
        {tab === "events" && <EventsAdmin />}
      </div>
    </div>
  );
}

function StatTile({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border bg-card/50 p-5 ${highlight ? "border-gold/50" : "border-border/60"}`}>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl text-gradient-gold">{value}</div>
    </div>
  );
}
function StatusPill({ status }: { status: string }) {
  const cls = status === "approved" ? "border-gold/40 text-gold" : status === "pending" ? "border-yellow-400/40 text-yellow-300" : "border-destructive/40 text-destructive";
  return <span className={`text-xs rounded-full px-2 py-0.5 border ${cls}`}>{status}</span>;
}

function AttractionsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-attractions"], queryFn: async () => (await supabase.from("attractions").select("*").order("name")).data ?? [] });

  const remove = async (id: string) => {
    if (!confirm("Delete this attraction?")) return;
    await supabase.from("attractions").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-attractions"] });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(data ?? []).map((a) => (
        <div key={a.id} className="flex gap-4 rounded-xl border border-border/60 bg-card/50 p-4">
          <img src={imageForAttractionSlug(a.slug)} alt="" className="h-20 w-28 rounded-lg object-cover" />
          <div className="flex-1 min-w-0">
            <div className="font-display text-lg truncate">{a.name}</div>
            <div className="text-xs text-gold uppercase tracking-widest">{a.bank}</div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.tagline}</p>
            <div className="mt-2 flex gap-3 items-center">
              <Link to="/attractions/$slug" params={{ slug: a.slug }} className="text-xs text-gold hover:underline">View →</Link>
              <button onClick={() => remove(a.id)} className="ml-auto text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EventsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-events"], queryFn: async () => (await supabase.from("events").select("*").order("starts_at")).data ?? [] });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", location: "", starts_at: "", category: "", ticket_price: "" });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.starts_at) return;
    await supabase.from("events").insert({
      title: form.title, description: form.description || null, location: form.location || null,
      starts_at: new Date(form.starts_at).toISOString(),
      category: form.category || null, ticket_price: form.ticket_price || null,
    });
    setForm({ title: "", description: "", location: "", starts_at: "", category: "", ticket_price: "" });
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-events"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Delete event?")) return;
    await supabase.from("events").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-events"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-2 text-sm text-primary-foreground shadow-gold"><Plus className="h-4 w-4" /> {open ? "Cancel" : "New event"}</button>
      </div>
      {open && (
        <form onSubmit={add} className="rounded-2xl border border-border/60 bg-card/60 p-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div className="space-y-2"><Label>Starts at</Label><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Music, Festival, Adventure…" /></div>
          <div className="space-y-2"><Label>Ticket price</Label><Input value={form.ticket_price} onChange={(e) => setForm({ ...form, ticket_price: e.target.value })} /></div>
          <button className="md:col-span-2 rounded-full bg-gradient-gold px-4 py-2 text-sm text-primary-foreground shadow-gold">Publish event</button>
        </form>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {(data ?? []).map((e) => (
          <div key={e.id} className="rounded-xl border border-border/60 bg-card/50 p-4 flex items-start justify-between gap-3">
            <div>
              <div className="font-display text-lg">{e.title}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1"><CalendarDays className="h-3 w-3" /> {new Date(e.starts_at).toLocaleString()}</div>
              {e.location && <div className="text-xs text-muted-foreground">{e.location}</div>}
            </div>
            <button onClick={() => remove(e.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
