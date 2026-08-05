import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Phone, Mail, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { imageForBusinessType } from "@/lib/images";

export const Route = createFileRoute("/businesses/$id")({
  head: () => ({ meta: [{ title: "Business — Luxor AI" }] }),
  component: BusinessDetail,
});

function BusinessDetail() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["business", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*, offers(id,title,description,discount,active,valid_until)")
        .eq("id", id)
        .eq("status", "approved")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-center py-32 text-muted-foreground">Loading…</p>;
  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl text-gold">Listing not available</h1>
        <Link to="/businesses" className="mt-6 inline-block text-gold hover:underline">← Back to directory</Link>
      </div>
    );
  }

  const img = data.image_url || imageForBusinessType(data.type);
  const offers = (data.offers ?? []).filter((o) => o.active);

  return (
    <article>
      <div className="relative h-[55vh] min-h-[380px] overflow-hidden">
        <img src={img} alt={data.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative mx-auto max-w-5xl h-full px-6 flex flex-col justify-end pb-12">
          <Link to="/businesses" className="inline-flex items-center gap-2 text-sm text-gold hover:underline w-fit">
            <ArrowLeft className="h-4 w-4" /> Business directory
          </Link>
          <div className="mt-4 text-xs uppercase tracking-[0.3em] text-gold">{data.type}</div>
          <h1 className="mt-3 font-display text-5xl md:text-6xl max-w-3xl">{data.name}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-14 grid lg:grid-cols-[2fr_1fr] gap-10">
        <div>
          <h2 className="font-display text-2xl text-gold">About</h2>
          <p className="mt-4 text-foreground/85 leading-relaxed whitespace-pre-line">
            {data.description || "This business hasn't added a description yet."}
          </p>

          {offers.length > 0 && (
            <>
              <h2 className="mt-10 font-display text-2xl text-gold">Current offers</h2>
              <div className="mt-4 space-y-3">
                {offers.map((o) => (
                  <div key={o.id} className="rounded-xl border border-gold/30 bg-gold/5 p-5">
                    <div className="flex items-center gap-2 text-gold font-semibold"><Tag className="h-4 w-4" /> {o.title} · {o.discount}</div>
                    {o.description && <p className="mt-2 text-sm text-foreground/80">{o.description}</p>}
                    {o.valid_until && <p className="mt-1 text-xs text-muted-foreground">Valid until {o.valid_until}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="rounded-2xl border border-border/60 bg-card p-6 h-fit space-y-4">
          <Info icon={MapPin} label="Address" value={data.address} />
          <Info icon={Phone} label="Phone" value={data.phone} />
          <Info icon={Mail} label="Email" value={data.email} />
        </aside>
      </div>
    </article>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-gold mt-0.5" />
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-sm text-foreground break-words">{value}</div>
      </div>
    </div>
  );
}
