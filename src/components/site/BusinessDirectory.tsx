import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

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

export function BusinessDirectory({
  config,
}: {
  config: DirectoryConfig;
}) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["businesses", config.type],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select(
          "*, offers(id,title,description,discount,active,valid_until)"
        )
        .eq("type", config.type)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const logVisit = async (id: string) => {
    try {
      await supabase
        .from("business_visits")
        .insert({ business_id: id });
    } catch (error) {
      console.error("Failed to record business visit:", error);
    }
  };

  // Business type translated according to selected language
  const businessTypeLabel = (() => {
    switch (config.type) {
      case "Hotel":
        return t("nav.hotels");

      case "Restaurant":
        return t("nav.restaurants");

      case "Bazaar":
        return t("nav.bazaars");

      case "Tour Company":
        return t("nav.itineraries");

      default:
        return config.type;
    }
  })();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">

      {/* Page heading */}
      <p className="text-center text-xs uppercase tracking-[0.3em] text-gold">
        {config.eyebrow}
      </p>

      <h1 className="mt-4 text-center font-display text-4xl md:text-5xl">
        {config.title}
      </h1>

      <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
        {config.subtitle}
      </p>

      {/* Loading */}
      {isLoading && (
        <p className="mt-10 text-center text-muted-foreground">
          {t("common.loading")}
        </p>
      )}

      {/* Businesses */}
      <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">

        {(data ?? []).map((business, index) => {
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
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-midnight">
                <img
                  src={
                    business.image_url ||
                    imageForBusinessType(config.type, index)
                  }
                  alt={business.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />

                {/* Business type */}
                <span className="absolute left-3 top-3 rounded-full border border-gold/40 bg-midnight/70 px-3 py-1 text-xs text-gold">
                  {businessTypeLabel}
                </span>
              </div>

              {/* Information */}
              <div className="p-6">
                <h2 className="font-display text-xl">
                  {business.name}
                </h2>

                {business.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-foreground/80">
                    {business.description}
                  </p>
                )}

                {/* Address + Phone */}
                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  {business.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{business.address}</span>
                    </div>
                  )}

                  {business.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{business.phone}</span>
                    </div>
                  )}
                </div>

                {/* Offer */}
                {offers.length > 0 && (
                  <div className="mt-4 rounded-lg border border-gold/30 bg-gold/5 p-3 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-gold">
                      <Tag className="h-3.5 w-3.5" />

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

        {/* No businesses */}
        {!isLoading && (data ?? []).length === 0 && (
          <p className="col-span-full py-20 text-center text-muted-foreground">
            {t("common.empty")}{" "}
            <Link
              to="/business/register"
              className="text-gold hover:underline"
            >
              {t("home.listBusiness")}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}