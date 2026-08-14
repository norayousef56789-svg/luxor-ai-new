import { createFileRoute, Link } from "@tanstack/react-router";
import { itineraries } from "@/lib/data";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/itineraries")({
  head: () => ({
    meta: [
      {
        title: "Luxor Itineraries — Luxor AI",
      },
      {
        name: "description",
        content:
          "Suggested itineraries for Luxor, Egypt — from a 2-day blitz to a slow week-long immersion.",
      },
      {
        property: "og:title",
        content: "Luxor Itineraries — Luxor AI",
      },
      {
        property: "og:description",
        content:
          "Plan your perfect Luxor trip with curated itineraries.",
      },
    ],
  }),

  component: ItinerariesPage,
});

function ItinerariesPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">

      {/* PAGE HEADER */}
      <p className="text-center text-xs uppercase tracking-[0.3em] text-gold divider-gold">
        {t("itineraries.eyebrow")}
      </p>

      <h1 className="mt-4 text-center font-display text-4xl md:text-5xl">
        {t("itineraries.title")}
      </h1>

      <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
        {t("itineraries.subtitle")}
      </p>

      {/* ITINERARIES */}
      <div className="mt-14 space-y-8">
        {itineraries.map((itinerary) => (
          <article
            key={itinerary.slug}
            className="rounded-2xl border border-border/60 bg-card p-8 shadow-elegant md:p-10"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>

                {/* DURATION */}
                <div className="text-xs uppercase tracking-widest text-gold">
                  {itinerary.duration}
                </div>

                {/* TITLE */}
                <h2 className="mt-2 font-display text-3xl">
                  {itinerary.title}
                </h2>

                {/* VIBE */}
                <p className="mt-1 text-sm text-muted-foreground">
                  {itinerary.vibe}
                </p>

              </div>
            </div>

            {/* DAYS */}
            <ol className="mt-7 space-y-5">
              {itinerary.days.map((day) => (
                <li
                  key={day.day}
                  className="grid gap-3 md:grid-cols-[180px_1fr]"
                >
                  <div className="font-display text-sm uppercase tracking-wider text-gold">
                    {day.day}
                  </div>

                  <div className="leading-relaxed text-foreground/85">
                    {day.plan}
                  </div>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>

      {/* CUSTOM ITINERARY */}
      <div className="mt-14 rounded-3xl border border-gold/30 bg-midnight/60 p-10 text-center">

        <Sparkles className="mx-auto h-6 w-6 text-gold" />

        <h3 className="mt-3 font-display text-2xl">
          {t("itineraries.customTitle")}
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          {t("itineraries.customSubtitle")}
        </p>

        <Link
          to="/ask-luxor"
          className="mt-5 inline-flex rounded-full bg-gradient-gold px-6 py-3 text-sm font-medium text-primary-foreground shadow-gold"
        >
          {t("itineraries.buildMine")}
        </Link>

      </div>
    </div>
  );
}