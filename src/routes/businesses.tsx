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
      { title: "Business Directory — Luxor AI" },
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

      if (error) throw error;

      return data;
    },
  });

  const list = useMemo(
    () =>
      (data ?? []).filter(
        (b) => filter === "All" || b.type === filter
      ),
    [data, filter]
  );

  const logVisit = async (id: string) => {
    await supabase
      .from("business_visits")
      .insert({ business_id: id });
  };

  const getBusinessTypeLabel = (
    type: BusinessType | "All"
  ) => {
    switch (type) {
      case "Hotel":
        return t("hotels");

      case "Restaurant":
        return t("restaurants");

      case "Bazaar":
        return t("bazaars");

      case "Tour Company":
        return t("itineraries");

      case "All":
        return t("all");

      default:
        return type;
    }
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={karnak}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />

        <div className="absolute inset-0 hero-overlay" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="text-gold text-xs uppercase tracking-[0.3em] divider-gold">
            {t("businessDirectoryEyebrow")}
          </p>

          <h1 className="mt-4 font-display text-5xl">
            {t("businessDirectoryTitle")}
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            {t("businessDirectoryDescription")}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/business/register"
              className="rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-gold"
            >
              {t("listYourBusiness")}
            </Link>

            <Link
              to="/business/login"
              className="rounded-full border border-gold/40 bg-midnight/50 px-5 py-2.5 text-sm text-gold"
            >
              {t("businessSignIn")}
            </Link>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap gap-2 justify-center">
          {(["All", ...TYPES] as const).map((type) => (
            <button
              key={type}
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

        {/* LOADING */}
        {isLoading && (
          <p className="mt-10 text-center text-muted-foreground">
            {t("loading")}
          </p>
        )}

        {/* BUSINESS LIST */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((b, i) => {
            const offers = (b.offers ?? []).filter(
              (o) => o.active
            );

            return (
              <Link
                key={b.id}
                to="/businesses/$id"
                params={{ id: b.id }}
                onClick={() => {
                  void logVisit(b.id);
                }}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elegant hover:border-gold/50 transition"
              >
                {/* IMAGE */}
                <div className="relative aspect-[4/3] overflow-hidden bg-midnight">
                  {b.image_url ? (
                    <img
                      src={b.image_url}
                      alt={b.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={imageForBusinessType(b.type, i)}
                      alt={b.name}
                      className="h-full w-full object-cover"
                    />
                  )}

                  <span className="absolute top-3 left-3 rounded-full bg-midnight/70 border border-gold/40 px-3 py-1 text-xs text-gold">
                    {getBusinessTypeLabel(b.type)}
                  </span>
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  <h2 className="font-display text-xl">
                    {b.name}
                  </h2>

                  {b.description && (
                    <p className="mt-2 text-sm text-foreground/80 line-clamp-3">
                      {b.description}
                    </p>
                  )}

                  <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                    {b.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {b.address}
                      </div>
                    )}

                    {b.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        {b.phone}
                      </div>
                    )}
                  </div>

                  {/* OFFER */}
                  {offers.length > 0 && (
                    <div className="mt-3 rounded-lg border border-gold/30 bg-gold/5 p-3 text-xs">
                      <div className="flex items-center gap-2 text-gold font-semibold">
                        <Tag className="h-3.5 w-3.5" />
                        {offers[0].title} · {offers[0].discount}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          {/* NO BUSINESSES */}
          {!isLoading && list.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <Store className="h-10 w-10 mx-auto text-gold/40 mb-4" />

              <p>{t("noVerifiedBusinesses")}</p>

              <Link
                to="/business/register"
                className="text-gold hover:underline text-sm"
              >
                {t("beFirstToList")}
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}