import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { imageForAttractionSlug } from "@/lib/images";

export const Route = createFileRoute("/attractions")({
  head: () => ({
    meta: [
      { title: "Attractions in Luxor — Luxor AI" },
      { name: "description", content: "Karnak, Luxor Temple, Valley of the Kings, Hatshepsut and more. Hours, tickets and tips for every Luxor landmark." },
      { property: "og:title", content: "Attractions in Luxor — Luxor AI" },
      { property: "og:description", content: "Every iconic temple, tomb and Nile experience in one curated guide." },
    ],
  }),
  component: AttractionsPage,
});

function AttractionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["attractions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("attractions").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-gold text-xs uppercase tracking-[0.3em] divider-gold text-center">Directory</p>
      <h1 className="mt-4 text-center font-display text-4xl md:text-5xl">Attractions of Luxor</h1>
      <p className="mt-4 text-center max-w-2xl mx-auto text-muted-foreground">
        The world's greatest open-air museum — landmark by landmark.
      </p>

      {isLoading && <p className="mt-10 text-center text-muted-foreground">Loading…</p>}

      <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((a) => (
          <Link
            key={a.slug}
            to="/attractions/$slug"
            params={{ slug: a.slug }}
            className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elegant hover:border-gold/50 transition"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={imageForAttractionSlug(a.slug)} alt={a.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute top-3 left-3 rounded-full bg-midnight/70 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-widest text-gold border border-gold/30">
                {a.bank}
              </div>
            </div>
            <div className="p-6">
              <h2 className="font-display text-2xl">{a.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.tagline}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-foreground/60">{a.era}</span>
                <span className="text-gold inline-flex items-center gap-1">Details <ArrowRight className="h-4 w-4" /></span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
