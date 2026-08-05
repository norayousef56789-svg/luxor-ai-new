import { createFileRoute } from "@tanstack/react-router";
import { BusinessDirectory } from "@/components/site/BusinessDirectory";

export const Route = createFileRoute("/bazaars")({
  head: () => ({
    meta: [
      { title: "Bazaars in Luxor — Luxor AI" },
      { name: "description", content: "Alabaster, papyrus, spices and silver — the artisan markets of Luxor." },
      { property: "og:title", content: "Bazaars in Luxor — Luxor AI" },
      { property: "og:description", content: "Souqs and artisan bazaars in Luxor, Egypt." },
    ],
  }),
  component: () => (
    <BusinessDirectory
      config={{
        type: "Bazaar",
        eyebrow: "Souqs & artisans",
        title: "Bazaars of Luxor",
        subtitle: "Hand-loomed scarves, alabaster, fair-trade ceramics, spices and silver, from Souq al-Luxor to West Bank workshops.",
      }}
    />
  ),
});
