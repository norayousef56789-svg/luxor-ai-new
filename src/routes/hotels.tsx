import { createFileRoute } from "@tanstack/react-router";
import { BusinessDirectory } from "@/components/site/BusinessDirectory";

export const Route = createFileRoute("/hotels")({
  head: () => ({
    meta: [
      { title: "Hotels in Luxor — Luxor AI" },
      { name: "description", content: "Hand-picked Nile-side palaces, boutique stays and resorts in Luxor, Egypt." },
      { property: "og:title", content: "Hotels in Luxor — Luxor AI" },
      { property: "og:description", content: "Where to stay in Luxor — from grand Belle Époque suites to boutique desert palaces." },
    ],
  }),
  component: () => (
    <BusinessDirectory
      config={{
        type: "Hotel",
        eyebrow: "Where to stay",
        title: "Hotels of Luxor",
        subtitle: "Belle Époque palaces along the Corniche, boutique retreats on the West Bank, and resort comfort with a temple view.",
      }}
    />
  ),
});
