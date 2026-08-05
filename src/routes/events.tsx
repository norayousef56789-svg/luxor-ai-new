import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { imageForEvent } from "@/lib/images";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Activities in Luxor — Luxor AI" },
      { name: "description", content: "Festivals, concerts, opera, balloon ascensions and pilgrimages — the cultural calendar of Luxor." },
      { property: "og:title", content: "Events & Activities in Luxor — Luxor AI" },
      { property: "og:description", content: "What's on in Luxor, Egypt." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("starts_at");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-gold text-xs uppercase tracking-[0.3em] divider-gold text-center">What's on</p>
      <h1 className="mt-4 text-center font-display text-4xl md:text-5xl">Events & activities</h1>
      <p className="mt-4 text-center max-w-2xl mx-auto text-muted-foreground">
        Festivals, opera under temple cliffs, sunrise balloons and pilgrimage processions — Luxor's living culture.
      </p>

      {isLoading && <p className="mt-10 text-center text-muted-foreground">Loading…</p>}

      <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((e) => {
          const date = new Date(e.starts_at);
          return (
            <article key={e.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elegant">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={imageForEvent(e.category)} alt={e.title} loading="lazy" className="h-full w-full object-cover" />
                {e.category && (
                  <span className="absolute top-3 left-3 rounded-full bg-midnight/70 border border-gold/40 px-3 py-1 text-xs text-gold">{e.category}</span>
                )}
              </div>
              <div className="p-6">
                <h2 className="font-display text-xl">{e.title}</h2>
                {e.description && <p className="mt-2 text-sm text-foreground/80 line-clamp-3">{e.description}</p>}
                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" /> {date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div>
                  {e.location && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {e.location}</div>}
                  {e.ticket_price && <div className="flex items-center gap-2 text-gold"><Tag className="h-3.5 w-3.5" /> {e.ticket_price}</div>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
