
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { BusinessDirectory } from "@/components/site/BusinessDirectory";

export const Route = createFileRoute("/hotels")({
  head: () => ({
    meta: [
      {
        title: "Hotels in Luxor — Luxor AI",
      },
      {
        name: "description",
        content:
          "Belle Époque palaces along the Corniche, boutique retreats on the West Bank, and resort comfort with a temple view.",
      },
    ],
  }),

  component: HotelsPage,
});

function HotelsPage() {
  const { t } = useTranslation();

  return (
    <BusinessDirectory
      config={{
        type: "Hotel",
        eyebrow: t("hotels.eyebrow"),
        title: t("hotels.title"),
        subtitle: t("hotels.subtitle"),
      }}
    />
  );
}

