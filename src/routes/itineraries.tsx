import { createFileRoute, Link } from "@tanstack/react-router";
import { itineraries } from "@/lib/data";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/itineraries")({
  head: () => ({
    meta: [
      { title: "Luxor Itineraries — Luxor AI" },
      { name: "description", content: "Suggested itineraries for Luxor, Egypt — from a 2-day blitz to a slow week-long immersion." },
      { property: "og:title", content: "Luxor Itineraries — Luxor AI" },
      { property: "og:description", content: "Plan your perfect Luxor trip with curated itineraries." },
    ],
  }),
  component: ItinerariesPage,
});

function ItinerariesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-gold text-xs uppercase tracking-[0.3em] divider-gold text-center">Plan your trip</p>
      <h1 className="mt-4 text-center font-display text-4xl md:text-5xl">Suggested itineraries</h1>
      <p className="mt-4 text-center max-w-2xl mx-auto text-muted-foreground">
        Crafted by local guides, refined by AI. Pick the pace that fits you.
      </p>

      <div className="mt-14 space-y-8">
        {itineraries.map((it) => (
          <article key={it.slug} className="rounded-2xl border border-border/60 bg-card p-8 md:p-10 shadow-elegant">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-gold">{it.duration}</div>
                <h2 className="mt-2 font-display text-3xl">{it.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{it.vibe}</p>
              </div>
            </div>
            <ol className="mt-7 space-y-5">
              {it.days.map((d) => (
                <li key={d.day} className="grid md:grid-cols-[180px_1fr] gap-3">
                  <div className="text-gold font-display text-sm tracking-wider uppercase">{d.day}</div>
                  <div className="text-foreground/85 leading-relaxed">{d.plan}</div>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>

      <div className="mt-14 rounded-3xl border border-gold/30 bg-midnight/60 p-10 text-center">
        <Sparkles className="h-6 w-6 text-gold mx-auto" />
        <h3 className="mt-3 font-display text-2xl">Need a custom plan?</h3>
        <p className="mt-2 text-sm text-muted-foreground">Tell Luxor AI your dates, pace and interests — it will draft an itinerary in seconds.</p>
        <Link to="/ask-luxor" className="mt-5 inline-flex rounded-full bg-gradient-gold px-6 py-3 text-sm font-medium text-primary-foreground shadow-gold">
          Build my itinerary
        </Link>
      </div>
    </div>
  );
}
