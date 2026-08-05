import { createFileRoute } from "@tanstack/react-router";
import { BusinessDirectory } from "@/components/site/BusinessDirectory";

export const Route = createFileRoute("/restaurants")({
  head: () => ({
    meta: [
      { title: "Restaurants in Luxor — Luxor AI" },
      { name: "description", content: "Curated dining in Luxor, Egypt — rooftop tagines, French fine dining, Nile-side tea lounges." },
      { property: "og:title", content: "Restaurants in Luxor — Luxor AI" },
      { property: "og:description", content: "Where to eat in Luxor, hand-picked by Luxor AI." },
    ],
  }),
  component: () => (
    <BusinessDirectory
      config={{
        type: "Restaurant",
        eyebrow: "Where to eat",
        title: "Restaurants of Luxor",
        subtitle: "Slow tagines, candlelit terraces, French fine dining and sweet karkadeh at sunset.",
      }}
    />
  ),
});
