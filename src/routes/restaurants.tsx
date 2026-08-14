import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { BusinessDirectory } from "@/components/site/BusinessDirectory";

export const Route = createFileRoute("/restaurants")({
  head: () => ({
    meta: [
      {
        title: "Restaurants in Luxor — Luxor AI",
      },
      {
        name: "description",
        content:
          "Curated dining in Luxor, Egypt — rooftop tagines, French fine dining, Nile-side tea lounges.",
      },
      {
        property: "og:title",
        content: "Restaurants in Luxor — Luxor AI",
      },
      {
        property: "og:description",
        content:
          "Where to eat in Luxor, hand-picked by Luxor AI.",
      },
    ],
  }),

  component: RestaurantsPage,
});

function RestaurantsPage() {
  const { t } = useTranslation();

  return (
    <BusinessDirectory
      config={{
        type: "Restaurant",
        eyebrow: t("restaurants.eyebrow"),
        title: t("restaurants.title"),
        subtitle: t("restaurants.subtitle"),
      }}
    />
  );
}