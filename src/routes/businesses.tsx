import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MapPin, Phone, Tag, Store } from "lucide-react";
import { useTranslation } from "react-i18next";

import { supabase } from "@/integrations/supabase/client";
import { imageForBusinessType } from "@/lib/images";
import karnak from "@/assets/karnak.jpg";
import type { Database } from "@/integrations/supabase/types";

type BusinessType = Database["public"]["Enums"]["business_type"];

const TYPES: BusinessType[] = [
  "Hotel",
  "Restaurant",
  "Bazaar",
  "Tour Company",
];

export const Route = createFileRoute("/businesses")({
  head: () => ({
    meta: [
      {
        title: "Business Directory — Luxor AI",
      },
      {
        name: "description",
        content:
          "Discover Luxor's verified hotels, restaurants, bazaars and tour companies.",
      },
      {
        property: "og:title",
        content: "Business Directory — Luxor AI",
      },
    ],
  }),
  component: BusinessesPage,
});

function BusinessesPage() {
  const { t } = useTranslation();

  const [filter, setFilter] = useState<BusinessType | "All">("All");

  const { data, isLoading } = useQuery({
    queryKey: ["businesses", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*, offers(id,title,description,discount,active)")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const list = useMemo(() => {
    return (data ?? []).filter(
      (business) =>
        filter === "All" || business.type === filter
    );
  }, [data, filter]);

  const logVisit = async (id: string) => {
    try {
      await supabase
        .from("business_visits")
        .insert({ business_id: id });
    } catch (error) {
      console.error("Failed to record business visit:", error);
    }
  };

  const getBusinessTypeLabel = (
    type: BusinessType | "All"
  ): string => {
    switch (type) {
      case "Hotel":
        return t("businessType.Hotel");

      case "Restaurant":
        return t("businessType.Restaurant");

      case "Bazaar":
        return t("businessType.Bazaar");

      case "Tour Company":
        return t("businessType.Tour Company");

      case "All":
        return t("businessType.All");

      default:
        return type;
    }
  };

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src={karnak}
          alt="Luxor"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />

        <div className="absolute inset-0 hero-overlay" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="text-gold text-xs uppercase tracking-[0.3em] divider-gold">
            {t("businesses.eyebrow")}
          </p>

          <h1 className="mt-4 font-display text-5xl">
            {t("businesses.title")}
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            {t("businesses.subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/business/register"
              className="rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-gold"
            >
              {t("businesses.listYours")}
            </Link>

            <Link
              to="/business/login"
              className="rounded-full border border-gold/40 bg-midnight/50 px-5 py-2.5 text-sm text-gold"
            >
              {t("businesses.signIn")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap justify-center gap-2">
          {(["All", ...TYPES] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                filter === type
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-border/60 text-foreground/70 hover:border-gold/40"
              }`}
            >
              {getBusinessTypeLabel(type)}
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="mt-10 text-center text-muted-foreground">
            {t("businesses.loading")}
          </p>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((business, index) => {
            const offers = (business.offers ?? []).filter(
              (offer) => offer.active
            );

            return (
              <Link
                key={business.id}
                to="/businesses/$id"
                params={{ id: business.id }}
                onClick={() => {
                  void logVisit(business.id);
                }}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elegant transition hover:border-gold/50"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-midnight">
                  <img
                    src={
                      business.image_url ||
                      imageForBusinessType(
                        business.type,
                        index
                      )
                    }
                    alt={business.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />

                  <span className="absolute left-3 top-3 rounded-full border border-gold/40 bg-midnight/70 px-3 py-1 text-xs text-gold">
                    {getBusinessTypeLabel(business.type)}
                  </span>
                </div>

                <div className="p-6">
                  <h2 className="font-display text-xl">
                    {business.name}
                  </h2>

                  {business.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-foreground/80">
                      {business.description}
                    </p>
                  )}

                  <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                    {business.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{business.address}</span>
                      </div>
                    )}

                    {business.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{business.phone}</span>
                      </div>
                    )}
                  </div>

                  {offers.length > 0 && (
                    <div className="mt-3 rounded-lg border border-gold/30 bg-gold/5 p-3 text-xs">
                      <div className="flex items-center gap-2 font-semibold text-gold">
                        <Tag className="h-3.5 w-3.5 shrink-0" />

                        <span>
                          {offers[0].title}
                          {offers[0].discount
                            ? ` · ${offers[0].discount}`
                            : ""}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          {!isLoading && list.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground">
              <Store className="mx-auto mb-4 h-10 w-10 text-gold/40" />

              <p>{t("businesses.noneInCategory")}</p>

              <Link
                to="/business/register"
                className="text-sm text-gold hover:underline"
              >
                {t("businesses.beFirst")}
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
