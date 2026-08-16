import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LogOut,
  BarChart3,
  User,
  Tag,
  Sparkles,
  Trash2,
  Plus,
  TrendingUp,
  Eye,
  Users,
  Store,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, signOut } from "@/lib/auth";
import { MarketingStudio } from "@/components/business/MarketingStudio";
import type { Database } from "@/integrations/supabase/types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type Offer = Database["public"]["Tables"]["offers"]["Row"];
type BusinessType = Database["public"]["Enums"]["business_type"];

const TYPES: BusinessType[] = [
  "Hotel",
  "Restaurant",
  "Bazaar",
  "Tour Company",
];

export const Route = createFileRoute("/business/dashboard")({
  head: () => ({
    meta: [{ title: "Business Dashboard — Luxor AI" }],
  }),
  component: Dashboard,
});

type Tab =
  | "businesses"
  | "profile"
  | "offers"
  | "stats"
  | "marketing";

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading, roles } = useAuth();

  const [tab, setTab] = useState<Tab>("businesses");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // =========================================================
  // BUSINESS DASHBOARD ACCESS PROTECTION
  // =========================================================
  useEffect(() => {
    if (loading) return;

    // 1. المستخدم غير مسجل دخول
    if (!user) {
      console.log("NO USER -> BUSINESS LOGIN");

      void navigate({
        to: "/business/login",
      });

      return;
    }

    // 2. المستخدم مسجل دخول ولكن ليس Business
    if (!roles.includes("business")) {
      console.log(
        "UNAUTHORIZED BUSINESS DASHBOARD ACCESS:",
        {
          email: user.email,
          roles,
        },
      );

      void navigate({
        to: "/",
      });
    }
  }, [loading, user, roles, navigate]);

  // =========================================================
  // LOAD ONLY THE CURRENT BUSINESS OWNER'S BUSINESSES
  // =========================================================
  const {
    data: businesses,
    error: businessesError,
  } = useQuery({
    queryKey: ["my-businesses", user?.id],

    enabled: !!user && roles.includes("business"),

    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "BUSINESSES ERROR:",
          error,
        );

        throw error;
      }

      console.log(
        "MY BUSINESSES:",
        data,
      );

      return data;
    },
  });

  // =========================================================
  // SELECT FIRST BUSINESS AUTOMATICALLY
  // =========================================================
  useEffect(() => {
    if (
      businesses &&
      businesses.length > 0 &&
      !selectedId
    ) {
      const approved = businesses.find(
        (b) => b.status === "approved",
      );

      setSelectedId(
        (approved ?? businesses[0]).id,
      );
    }
  }, [businesses, selectedId]);

  // =========================================================
  // WAIT UNTIL AUTH CHECK IS COMPLETE
  // =========================================================
  if (loading) {
    return null;
  }

  // No user
  if (!user) {
    return null;
  }

  // User is logged in but is NOT a business owner
  if (!roles.includes("business")) {
    return null;
  }

  const selected =
    businesses?.find(
      (b) => b.id === selectedId,
    ) ?? null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-gold text-xs uppercase tracking-[0.3em]">
            Business portal
          </p>

          <h1 className="font-display text-3xl mt-1">
            Welcome,{" "}
            {user.user_metadata?.full_name ??
              user.email}
          </h1>

          <p className="text-sm text-muted-foreground">
            Business owner · {user.email}
          </p>
        </div>

        <button
          onClick={() =>
            signOut().then(() =>
              navigate({
                to: "/",
              }),
            )
          }
          className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm hover:border-gold/40"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      {/* =====================================================
          BUSINESS SWITCHER
      ====================================================== */}
      {(businesses ?? []).length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {businesses!.map((b) => (
            <button
              key={b.id}
              onClick={() =>
                setSelectedId(b.id)
              }
              className={`rounded-full border px-3 py-1.5 text-xs ${
                selectedId === b.id
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-border/60 text-foreground/70"
              }`}
            >
              {b.name}{" "}
              <span className="opacity-50">
                · {b.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* =====================================================
          NAVIGATION TABS
      ====================================================== */}
      <nav className="mt-8 flex flex-wrap gap-2 border-b border-border/60 pb-3">
        {(
          [
            [
              "businesses",
              Store,
              "My listings",
            ],
            [
              "profile",
              User,
              "Profile",
            ],
            [
              "offers",
              Tag,
              "Offers",
            ],
            [
              "stats",
              BarChart3,
              "Analytics",
            ],
            [
              "marketing",
              Sparkles,
              "AI Marketing Studio",
            ],
          ] as const
        ).map(
          ([k, Icon, label]) => (
            <button
              key={k}
              onClick={() =>
                setTab(k)
              }
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                tab === k
                  ? "bg-gold/15 text-gold border border-gold/40"
                  : "text-foreground/70 hover:text-gold"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ),
        )}
      </nav>

      {/* =====================================================
          TAB CONTENT
      ====================================================== */}
      <div className="mt-8">
        {tab === "businesses" && (
          <BusinessesTab
            businesses={businesses ?? []}
            ownerId={user.id}
          />
        )}

        {tab === "profile" &&
          (selected ? (
            <ProfileTab
              business={selected}
            />
          ) : (
            <EmptyState />
          ))}

        {tab === "offers" &&
          (selected ? (
            <OffersTab
              business={selected}
            />
          ) : (
            <EmptyState />
          ))}

        {tab === "stats" &&
          (selected ? (
            <StatsTab
              business={selected}
            />
          ) : (
            <EmptyState />
          ))}

        {tab === "marketing" &&
          (selected ? (
            <MarketingStudio
              business={{
                name: selected.name,
                type: selected.type,
              }}
            />
          ) : (
            <EmptyState />
          ))}
      </div>
    </div>
  );
}

// =============================================================
// EMPTY STATE
// =============================================================

function EmptyState() {
  return (
    <div className="text-center py-16">
      <Store className="h-10 w-10 mx-auto text-gold/40 mb-4" />

      <p className="text-muted-foreground">
        Add a business listing to unlock this tab.
      </p>
    </div>
  );
}

// =============================================================
// BUSINESSES TAB
// =============================================================

function BusinessesTab({
  businesses,
  ownerId,
}: {
  businesses: Business[];
  ownerId: string;
}) {
  const qc = useQueryClient();

  const [open, setOpen] =
    useState(businesses.length === 0);

  const [form, setForm] =
    useState({
      name: "",
      type: "Hotel" as BusinessType,
      phone: "",
      email: "",
      address: "",
      description: "",
    });

  const [err, setErr] =
    useState<string | null>(null);

  const [busy, setBusy] =
    useState(false);

  const submit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setErr(null);
    setBusy(true);

    const { error } =
      await supabase
        .from("businesses")
        .insert({
          owner_id: ownerId,
          name: form.name,
          type: form.type,
          phone: form.phone,
          email: form.email,
          address: form.address,
          description:
            form.description || null,
          status: "pending",
        });

    setBusy(false);

    if (error) {
      setErr(error.message);
      return;
    }

    setForm({
      name: "",
      type: "Hotel",
      phone: "",
      email: "",
      address: "",
      description: "",
    });

    setOpen(false);

    qc.invalidateQueries({
      queryKey: ["my-businesses"],
    });
  };

  const remove = async (
    id: string,
  ) => {
    if (
      !confirm(
        "Delete this listing?",
      )
    ) {
      return;
    }

    await supabase
      .from("businesses")
      .delete()
      .eq("id", id);

    qc.invalidateQueries({
      queryKey: ["my-businesses"],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">
          My listings
        </h2>

        <button
          onClick={() =>
            setOpen((v) => !v)
          }
          className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-2 text-sm text-primary-foreground shadow-gold"
        >
          <Plus className="h-4 w-4" />

          {open
            ? "Cancel"
            : "Add listing"}
        </button>
      </div>

      {open && (
        <form
          onSubmit={submit}
          className="rounded-2xl border border-border/60 bg-card/60 p-6 grid gap-4 md:grid-cols-2"
        >
          <div className="space-y-2 md:col-span-2">
            <Label>Name</Label>

            <Input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>

            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target
                    .value as BusinessType,
                })
              }
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              {TYPES.map(
                (t) => (
                  <option
                    key={t}
                  >
                    {t}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>

            <Input
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>

            <Input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Address</Label>

            <Input
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>

            <Textarea
              value={
                form.description
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
            />
          </div>

          {err && (
            <p className="text-sm text-destructive md:col-span-2">
              {err}
            </p>
          )}

          <button
            disabled={busy}
            className="md:col-span-2 rounded-full bg-gradient-gold px-4 py-2 text-sm text-primary-foreground shadow-gold disabled:opacity-60"
          >
            {busy
              ? "Submitting…"
              : "Submit for approval"}
          </button>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {businesses.map(
          (b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-border/60 bg-card/50 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-xl">
                    {b.name}
                  </h3>

                  <div className="text-xs text-gold uppercase tracking-widest mt-0.5">
                    {b.type}
                  </div>
                </div>

                <StatusBadge
                  status={b.status}
                />
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {b.address}
              </p>

              <div className="mt-3 flex gap-2">
                {b.status ===
                  "approved" && (
                  <Link
                    to="/businesses/$id"
                    params={{
                      id: b.id,
                    }}
                    className="text-xs text-gold hover:underline"
                  >
                    View public page →
                  </Link>
                )}

                <button
                  onClick={() =>
                    remove(b.id)
                  }
                  className="ml-auto text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ),
        )}

        {businesses.length ===
          0 &&
          !open && (
            <p className="md:col-span-2 text-center text-muted-foreground py-12">
              No listings yet —
              click "Add listing"
              to get started.
            </p>
          )}
      </div>
    </div>
  );
}

// =============================================================
// STATUS BADGE
// =============================================================

function StatusBadge({
  status,
}: {
  status: Business["status"];
}) {
  const cls =
    status === "approved"
      ? "border-gold/40 text-gold"
      : status === "pending"
        ? "border-yellow-400/40 text-yellow-300"
        : "border-destructive/40 text-destructive";

  return (
    <span
      className={`text-[10px] uppercase tracking-widest rounded-full px-2 py-0.5 border ${cls}`}
    >
      {status}
    </span>
  );
}

// =============================================================
// PROFILE TAB
// =============================================================

function ProfileTab({
  business,
}: {
  business: Business;
}) {
  const qc = useQueryClient();

  const [form, setForm] =
    useState({
      name: business.name,
      phone: business.phone,
      email: business.email,
      address: business.address,
      description:
        business.description ?? "",
      image_url:
        business.image_url ?? "",
      video_url:
        business.video_url ?? "",
    });

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    setForm({
      name: business.name,
      phone: business.phone,
      email: business.email,
      address: business.address,
      description:
        business.description ?? "",
      image_url:
        business.image_url ?? "",
      video_url:
        business.video_url ?? "",
    });
  }, [business]);

  const save = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    const { error } =
      await supabase
        .from("businesses")
        .update(form)
        .eq("id", business.id);

    if (!error) {
      setSaved(true);

      setTimeout(
        () => setSaved(false),
        1500,
      );

      qc.invalidateQueries({
        queryKey: [
          "my-businesses",
        ],
      });
    }
  };

  return (
    <form
      onSubmit={save}
      className="grid gap-5 max-w-2xl"
    >
      <h2 className="font-display text-2xl">
        Profile — {business.name}
      </h2>

      <div className="space-y-2">
        <Label>
          Business name
        </Label>

        <Input
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Phone</Label>

          <Input
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>

          <Input
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Address</Label>

        <Input
          value={form.address}
          onChange={(e) =>
            setForm({
              ...form,
              address: e.target.value,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>
          Cover image URL
        </Label>

        <Input
          value={form.image_url}
          onChange={(e) =>
            setForm({
              ...form,
              image_url:
                e.target.value,
            })
          }
          placeholder="https://…"
        />
      </div>

      <div className="space-y-2">
        <Label>
          Description
        </Label>

        <Textarea
          value={
            form.description
          }
          onChange={(e) =>
            setForm({
              ...form,
              description:
                e.target.value,
            })
          }
          className="min-h-[140px]"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-gold">
          Save changes
        </button>

        {saved && (
          <span className="text-sm text-gold inline-flex items-center gap-1">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>
    </form>
  );
}

// =============================================================
// OFFERS TAB
// =============================================================

function OffersTab({
  business,
}: {
  business: Business;
}) {
  const qc = useQueryClient();

  const { data: offers } =
    useQuery({
      queryKey: [
        "offers",
        business.id,
      ],

      queryFn: async () => {
        const {
          data,
          error,
        } = await supabase
          .from("offers")
          .select("*")
          .eq(
            "business_id",
            business.id,
          )
          .order(
            "created_at",
            {
              ascending: false,
            },
          );

        if (error)
          throw error;

        return data;
      },
    });

  const [form, setForm] =
    useState({
      title: "",
      description: "",
      discount: "",
      valid_until: "",
    });

  const submit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (
      !form.title ||
      !form.discount
    ) {
      return;
    }

    await supabase
      .from("offers")
      .insert({
        business_id:
          business.id,
        title: form.title,
        description:
          form.description ||
          null,
        discount:
          form.discount,
        valid_until:
          form.valid_until ||
          null,
        active: true,
      });

    setForm({
      title: "",
      description: "",
      discount: "",
      valid_until: "",
    });

    qc.invalidateQueries({
      queryKey: [
        "offers",
        business.id,
      ],
    });
  };

  const toggle = async (
    o: Offer,
  ) => {
    await supabase
      .from("offers")
      .update({
        active: !o.active,
      })
      .eq("id", o.id);

    qc.invalidateQueries({
      queryKey: [
        "offers",
        business.id,
      ],
    });
  };

  const remove = async (
    id: string,
  ) => {
    await supabase
      .from("offers")
      .delete()
      .eq("id", id);

    qc.invalidateQueries({
      queryKey: [
        "offers",
        business.id,
      ],
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,1.2fr]">
      <form
        onSubmit={submit}
        className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-6 h-fit"
      >
        <h2 className="font-display text-xl flex items-center gap-2">
          <Plus className="h-4 w-4 text-gold" />
          New offer
        </h2>

        <div className="space-y-2">
          <Label>Title</Label>

          <Input
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            placeholder="Sunset tasting menu"
          />
        </div>

        <div className="space-y-2">
          <Label>
            Description
          </Label>

          <Textarea
            value={
              form.description
            }
            onChange={(e) =>
              setForm({
                ...form,
                description:
                  e.target.value,
              })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>
              Discount
            </Label>

            <Input
              value={
                form.discount
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  discount:
                    e.target.value,
                })
              }
              placeholder="15%"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Valid until
            </Label>

            <Input
              type="date"
              value={
                form.valid_until
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  valid_until:
                    e.target.value,
                })
              }
            />
          </div>
        </div>

        <button className="w-full rounded-full bg-gradient-gold px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-gold">
          Publish offer
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="font-display text-xl">
          Active & past offers (
          {offers?.length ?? 0}
          )
        </h2>

        {(offers ?? [])
          .length === 0 && (
          <p className="text-sm text-muted-foreground">
            No offers yet.
          </p>
        )}

        {(offers ?? []).map(
          (o) => (
            <div
              key={o.id}
              className="rounded-xl border border-border/60 bg-card/50 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-gold font-semibold">
                    {o.discount} ·{" "}
                    {o.title}
                  </div>

                  <p className="text-sm text-foreground/80 mt-1">
                    {o.description}
                  </p>

                  {o.valid_until && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Valid until{" "}
                      {
                        o.valid_until
                      }
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      toggle(o)
                    }
                    className={`text-xs rounded-full px-3 py-1 border ${
                      o.active
                        ? "border-gold/40 text-gold"
                        : "border-border/60 text-muted-foreground"
                    }`}
                  >
                    {o.active
                      ? "Active"
                      : "Paused"}
                  </button>

                  <button
                    onClick={() =>
                      remove(o.id)
                    }
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

// =============================================================
// STATS TAB
// =============================================================

function StatsTab({
  business,
}: {
  business: Business;
}) {
  const { data: visits } =
    useQuery({
      queryKey: [
        "visits",
        business.id,
      ],

      queryFn: async () => {
        const {
          data,
          error,
        } = await supabase
          .from("business_visits")
          .select("created_at")
          .eq(
            "business_id",
            business.id,
          )
          .gte(
            "created_at",
            new Date(
              Date.now() -
                14 *
                  86400000,
            ).toISOString(),
          )
          .order(
            "created_at",
          );

        if (error)
          throw error;

        return data;
      },
    });

  const buckets =
    useMemo(() => {
      const days: {
        day: string;
        visits: number;
      }[] = [];

      for (
        let i = 13;
        i >= 0;
        i--
      ) {
        const d =
          new Date();

        d.setDate(
          d.getDate() - i,
        );

        days.push({
          day: d
            .toISOString()
            .slice(5, 10),
          visits: 0,
        });
      }

      (visits ?? []).forEach(
        (v) => {
          const key =
            v.created_at.slice(
              5,
              10,
            );

          const slot =
            days.find(
              (d) =>
                d.day ===
                key,
            );

          if (slot)
            slot.visits++;
        },
      );

      return days;
    }, [visits]);

  const max = Math.max(
    1,
    ...buckets.map(
      (b) => b.visits,
    ),
  );

  const total =
    buckets.reduce(
      (s, b) =>
        s + b.visits,
      0,
    );

  const last7 =
    buckets
      .slice(-7)
      .reduce(
        (s, b) =>
          s + b.visits,
        0,
      );

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl">
        Analytics —{" "}
        {business.name}
      </h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Eye}
          label="Profile views (14d)"
          value={total}
        />

        <StatCard
          icon={TrendingUp}
          label="Last 7 days"
          value={last7}
        />

        <StatCard
          icon={Users}
          label="Avg per day"
          value={Math.round(
            total / 14,
          )}
        />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/50 p-6">
        <h3 className="font-display text-lg">
          Daily visits — last
          14 days
        </h3>

        <div className="mt-5 flex items-end gap-2 h-44">
          {buckets.map(
            (d) => (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full bg-gradient-gold rounded-t-md"
                  style={{
                    height: `${
                      (d.visits /
                        max) *
                      100
                    }%`,
                    minHeight: 2,
                  }}
                  title={`${d.visits} visits`}
                />

                <div className="text-[10px] text-muted-foreground">
                  {d.day}
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// STAT CARD
// =============================================================

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
      <div className="flex items-center gap-2 text-gold">
        <Icon className="h-4 w-4" />

        <span className="text-xs uppercase tracking-widest">
          {label}
        </span>
      </div>

      <div className="mt-3 font-display text-3xl text-gradient-gold">
        {value}
      </div>
    </div>
  );
}