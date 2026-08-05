import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { imageForBusinessType } from "@/lib/images";
import type { Database } from "@/integrations/supabase/types";

type BusinessType = Database["public"]["Enums"]["business_type"];

export type DirectoryConfig = {
  type: BusinessType;
  eyebrow: string;
  title: string;
  subtitle: string;
};

export function BusinessDirectory({ config }: { config: DirectoryConfig }) {
  const { data, isLoading } = useQuery({
    queryKey: ["businesses", config.type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*, offers(id,title,description,discount,active,valid_until)")
        .eq("type", config.type)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const logVisit = async (id: string) => {
    await supabase.from("business_visits").insert({ business_id: id });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-gold text-xs uppercase tracking-[0.3em] divider-gold text-center">{config.eyebrow}</p>
      <h1 className="mt-4 text-center font-display text-4xl md:text-5xl">{config.title}</h1>
      <p className="mt-4 text-center max-w-2xl mx-auto text-muted-foreground">{config.subtitle}</p>

      {isLoading && <p className="mt-10 text-center text-muted-foreground">Loading…</p>}

      <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((b, i) => {
          const offers = (b.offers ?? []).filter((o) => o.active);
          return (
            <Link
              to="/businesses/$id"
              params={{ id: b.id }}
              key={b.id}
              onClick={() => { void logVisit(b.id); }}
              className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elegant hover:border-gold/50 transition"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-midnight">
                <img src={b.image_url || imageForBusinessType(config.type, i)} alt={b.name} loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute top-3 left-3 rounded-full bg-midnight/70 border border-gold/40 px-3 py-1 text-xs text-gold">{config.type}</span>
              </div>
              <div className="p-6">
                <h2 className="font-display text-xl">{b.name}</h2>
                {b.description && <p className="mt-2 text-sm text-foreground/80 line-clamp-3">{b.description}</p>}
                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {b.address}</div>
                  <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {b.phone}</div>
                </div>
                {offers.length > 0 && (
                  <div className="mt-4 rounded-lg border border-gold/30 bg-gold/5 p-3 text-xs">
                    <div className="flex items-center gap-2 text-gold font-semibold"><Tag className="h-3.5 w-3.5" /> {offers[0].title} · {offers[0].discount}</div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
        {!isLoading && (data ?? []).length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-20">No listings yet — be the first to <Link to="/business/register" className="text-gold hover:underline">list your {config.type.toLowerCase()}</Link>.</p>
        )}
      </div>
    </div>
  );
}
