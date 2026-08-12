import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { attractions } from "@/lib/data";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Interactive Map of Luxor — Luxor AI" },
      {
        name: "description",
        content:
          "Explore Luxor's East and West Banks on an interactive map with every major attraction plotted.",
      },
      {
        property: "og:title",
        content: "Interactive Map of Luxor",
      },
      {
        property: "og:description",
        content: "Plan your route across the Nile.",
      },
    ],
  }),

  component: MapPage,
});

function MapPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">

      {/* PAGE HEADING */}
      <p className="text-gold text-xs uppercase tracking-[0.3em] divider-gold text-center">
        {t("orientYourself")}
      </p>

      <h1 className="mt-4 text-center font-display text-4xl md:text-5xl">
        {t("mapTitle")}
      </h1>

      <p className="mt-4 text-center max-w-2xl mx-auto text-muted-foreground">
        {t("mapDescription")}
      </p>

      {/* MAP */}
      <div className="mt-12 grid lg:grid-cols-[1fr_320px] gap-6">

        <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-border/60 shadow-elegant">
          <iframe
            title={t("mapTitle")}
            className="h-full w-full"
            src="https://www.openstreetmap.org/export/embed.html?bbox=32.55%2C25.66%2C32.72%2C25.78&layer=mapnik&marker=25.7188%2C32.6573"
          />
        </div>

        {/* LANDMARKS */}
        <aside className="rounded-2xl border border-border/60 bg-card p-5 h-fit">

          <h2 className="font-display text-lg text-gold mb-3">
            {t("landmarks")}
          </h2>

          <ul className="space-y-3">

            {attractions.map((a) => (
              <li
                key={a.slug}
                className="flex items-start gap-3 text-sm"
              >
                <MapPin className="h-4 w-4 text-gold mt-0.5 shrink-0" />

                <div>
                  <div className="text-foreground">
                    {a.shortName}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {a.bank}
                  </div>
                </div>
              </li>
            ))}

          </ul>
        </aside>

      </div>
    </div>
  );
}