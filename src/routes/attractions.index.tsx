import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  Clock,
  Compass,
  Info as InfoIcon,
  MapPin,
  Sun,
  Ticket,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { supabase } from "@/integrations/supabase/client";
import { imageForAttractionSlug } from "@/lib/images";

export const Route = createFileRoute("/attractions/")({
  head: () => ({
    meta: [
      {
        title: "Attractions in Luxor — Luxor AI",
      },
      {
        name: "description",
        content:
          "Karnak, Luxor Temple, Valley of the Kings, Hatshepsut and more. Hours, tickets and tips for every Luxor landmark.",
      },
      {
        property: "og:title",
        content: "Attractions in Luxor — Luxor AI",
      },
      {
        property: "og:description",
        content:
          "Every iconic temple, tomb and Nile experience in one curated guide.",
      },
    ],
  }),

  component: AttractionsPage,
});

function AttractionsPage() {
  const { t } = useTranslation();

  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["attractions"],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("attractions")
        .select("*")
        .order("name");

      if (error) {
        throw error;
      }

      return data;
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      {/* PAGE HEADER */}
      <p className="text-center text-xs uppercase tracking-[0.3em] text-gold divider-gold">
        {t("attractions.eyebrow")}
      </p>

      <h1 className="mt-4 text-center font-display text-4xl md:text-5xl">
        {t("attractions.title")}
      </h1>

      <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
        {t("attractions.subtitle")}
      </p>

      {/* LOADING */}
      {isLoading && (
        <p className="mt-10 text-center text-muted-foreground">
          {t("attractions.loading")}
        </p>
      )}

      {/* ATTRACTIONS */}
      <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((attraction) => (
          <AttractionCard
            key={attraction.slug}
            attraction={attraction}
            expanded={expandedSlug === attraction.slug}
            onToggle={() =>
              setExpandedSlug((previous) =>
                previous === attraction.slug
                  ? null
                  : attraction.slug,
              )
            }
          />
        ))}
      </div>

      {/* EMPTY STATE */}
      {!isLoading && (data ?? []).length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          {t("common.empty")}
        </div>
      )}
    </div>
  );
}

function AttractionCard({
  attraction,
  expanded,
  onToggle,
}: {
  attraction: Record<string, any>;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();

  const image = imageForAttractionSlug(attraction.slug);

  const hours =
    typeof attraction.hours === "string" && attraction.hours.trim()
      ? attraction.hours
      : t("common.pleaseWait");

  const ticket =
    typeof attraction.ticket === "string" && attraction.ticket.trim()
      ? attraction.ticket
      : t("common.pleaseWait");

  const hasCoordinates =
    attraction.lat != null && attraction.lng != null;

  const highlights = Array.isArray(attraction.highlights)
    ? attraction.highlights
    : [];

  return (
    <div
      className={`group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elegant transition ${
        expanded
          ? "border-gold/50 ring-1 ring-gold/50"
          : "hover:border-gold/50"
      }`}
    >
      {/* CARD HEADER */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left"
      >
        {/* IMAGE */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={attraction.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />

          {/* BANK */}
          <div className="absolute left-3 top-3 rounded-full border border-gold/30 bg-midnight/70 px-3 py-1 text-[10px] uppercase tracking-widest text-gold backdrop-blur">
            {attraction.bank}
          </div>
        </div>

        {/* CARD INFORMATION */}
        <div className="p-6">
          <h2 className="font-display text-2xl">
            {attraction.name}
          </h2>

          {attraction.tagline && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {attraction.tagline}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-foreground/60">
              {attraction.era}
            </span>

            <span className="inline-flex items-center gap-1 text-gold">
              {expanded
                ? t("common.back")
                : t("attractions.details")}

              <ArrowRight
                className={`h-4 w-4 transition-transform ${
                  expanded ? "rotate-90" : ""
                }`}
              />
            </span>
          </div>
        </div>
      </button>

      {/* EXPANDED DETAILS */}
      {expanded && (
        <div className="border-t border-border/60 px-6 pb-6 pt-5">

          {/* ABOUT */}
          <h3 className="font-display text-xl text-gold">
            {t("attractions.about")}
          </h3>

          {attraction.description ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
              {attraction.description}
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {t("common.empty")}
            </p>
          )}

          {/* HIGHLIGHTS */}
          {highlights.length > 0 && (
            <>
              <h3 className="mt-6 font-display text-lg text-gold">
                {t("attractions.highlights")}
              </h3>

              <ul className="mt-3 space-y-2">
                {highlights.map(
                  (highlight: string, index: number) => (
                    <li
                      key={`${highlight}-${index}`}
                      className="flex items-start gap-2 text-sm text-foreground/85"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />

                      <span>{highlight}</span>
                    </li>
                  ),
                )}
              </ul>
            </>
          )}

          {/* INFORMATION */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <Info
              icon={Clock}
              label={t("attractions.info.hours")}
              value={hours}
            />

            <Info
              icon={Ticket}
              label={t("attractions.info.ticket")}
              value={ticket}
            />

            {attraction.best_time && (
              <Info
                icon={Sun}
                label={t("attractions.info.bestTime")}
                value={attraction.best_time}
              />
            )}

            <Info
              icon={Compass}
              label={t("attractions.info.location")}
              value={`${attraction.bank}, Luxor, Egypt`}
            />

            {hasCoordinates && (
              <Info
                icon={MapPin}
                label="Coordinates"
                value={`${Number(attraction.lat).toFixed(
                  4,
                )}, ${Number(attraction.lng).toFixed(4)}`}
              />
            )}
          </div>

          {/* ACTIONS */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">

            {/* ASK AI */}
            <Link
              to="/ask-luxor"
              className="flex-1 rounded-full bg-gradient-gold px-5 py-2.5 text-center text-sm font-medium text-primary-foreground shadow-gold"
            >
              {t("attractions.askLuxor")}
            </Link>

            {/* FULL PAGE */}
            <Link
              to="/attractions/$slug"
              params={{
                slug: attraction.slug,
              }}
              className="flex-1 rounded-full border border-gold/40 px-5 py-2.5 text-center text-sm text-gold transition hover:bg-gold/10"
            >
              {t("common.details")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />

      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </div>

        <div className="text-sm text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}