import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { BusinessDirectory } from "@/components/site/BusinessDirectory";

export const Route = createFileRoute("/bazaars")({
  head: () => ({
    meta: [
      { title: "Bazaars in Luxor — Luxor AI" },
      {
        name: "description",
        content:
          "Alabaster, papyrus, spices and silver — the artisan markets of Luxor.",
      },
      {
        property: "og:title",
        content: "Bazaars in Luxor — Luxor AI",
      },
      {
        property: "og:description",
        content: "Souqs and artisan bazaars in Luxor, Egypt.",
      },
    ],
  }),

  component: BazaarsPage,
});

function BazaarsPage() {
  const { t } = useTranslation();

  return (
    <BusinessDirectory
      config={{
        type: "Bazaar",
        eyebrow: t("bazaars.eyebrow"),
        title: t("bazaars.title"),
        subtitle: t("bazaars.subtitle"),
      }}
    />
  );
}