import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Ticket, Sun, MapPin, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { imageForAttractionSlug } from "@/lib/images";

export const Route = createFileRoute("/attractions/$slug")({
  head: () => ({
    meta: [{ title: "Attraction — Luxor AI" }],
  }),
  component: AttractionDetail,
});

function AttractionDetail() {
  const { slug } = Route.useParams();
  const { data: a, isLoading } = useQuery({
    queryKey: ["attraction", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("attractions").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-center py-32 text-muted-foreground">Loading…</p>;
  if (!a) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl text-gold">Attraction not found</h1>
        <Link to="/attractions" className="mt-6 inline-block text-gold hover:underline">← Back to all attractions</Link>
      </div>
    );
  }

  const img = imageForAttractionSlug(a.slug);
  return (
    <article>
      <div className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src={img} alt={a.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative mx-auto max-w-5xl h-full px-6 flex flex-col justify-end pb-12">
          <Link to="/attractions" className="inline-flex items-center gap-2 text-sm text-gold hover:underline w-fit">
            <ArrowLeft className="h-4 w-4" /> All attractions
          </Link>
          <div className="mt-4 inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold">
            <span>{a.bank}</span>
            {a.era && <><span className="opacity-50">•</span><span>{a.era}</span></>}
          </div>
          <h1 className="mt-3 font-display text-5xl md:text-6xl max-w-3xl">{a.name}</h1>
          {a.tagline && <p className="mt-3 text-lg text-foreground/85 max-w-2xl">{a.tagline}</p>}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-14 grid lg:grid-cols-[2fr_1fr] gap-10">
        <div>
          <h2 className="font-display text-2xl text-gold">About</h2>
          <p className="mt-4 text-foreground/85 leading-relaxed">{a.description}</p>

          {a.highlights?.length > 0 && (
            <>
              <h2 className="mt-10 font-display text-2xl text-gold">Highlights</h2>
              <ul className="mt-4 space-y-3">
                {a.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-foreground/85">
                    <Check className="h-5 w-5 text-gold mt-0.5 shrink-0" /> {h}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="rounded-2xl border border-border/60 bg-card p-6 h-fit space-y-5">
          {a.hours && <Info icon={Clock} label="Hours" value={a.hours} />}
          {a.ticket && <Info icon={Ticket} label="Ticket" value={a.ticket} />}
          {a.best_time && <Info icon={Sun} label="Best time" value={a.best_time} />}
          {a.lat != null && a.lng != null && (
            <Info icon={MapPin} label="Location" value={`${Number(a.lat).toFixed(3)}, ${Number(a.lng).toFixed(3)}`} />
          )}
          <Link to="/ask-luxor" className="mt-2 block text-center rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-gold">
            Ask Luxor about this site
          </Link>
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
        <div className="text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}
