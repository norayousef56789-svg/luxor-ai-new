import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Clock, Compass, Info as InfoIcon, MapPin, Sun, Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { imageForAttractionSlug } from "@/lib/images";
import { useState } from "react";

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

const VISITOR_TIPS = [
  "Carry your passport or ID — some ticket offices ask for it.",
  "Bring water, a hat and sunscreen; shade is limited on most sites.",
  "Cash (EGP) is safest for tickets, guides and tips.",
  "Photography permits may cost extra inside tombs and chambers.",
  "Dress modestly and wear comfortable shoes for uneven ground.",
];

function AttractionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["attractions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("attractions").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

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
          <AttractionCard
            key={a.slug}
            a={a}
            expanded={expandedSlug === a.slug}
            onToggle={() => setExpandedSlug((prev) => (prev === a.slug ? null : a.slug))}
          />
        ))}
      </div>
    </div>
  );
}

function AttractionCard({
  a,
  expanded,
  onToggle,
}: {
  a: Record<string, any>;
  expanded: boolean;
  onToggle: () => void;
}) {
  const img = imageForAttractionSlug(a.slug);
  const hours = a.hours?.trim() ? a.hours : "Please check current opening hours.";
  const ticket = a.ticket?.trim() ? a.ticket : "Please check the latest ticket price locally.";
  const hasCoords = a.lat != null && a.lng != null;

  return (
    <div
      className={`group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elegant transition ${
        expanded ? "border-gold/50 ring-1 ring-gold/50" : "hover:border-gold/50"
      }`}
    >
      <button onClick={onToggle} className="w-full text-left">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={img}
            alt={a.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 rounded-full bg-midnight/70 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-widest text-gold border border-gold/30">
            {a.bank}
          </div>
        </div>
        <div className="p-6">
          <h2 className="font-display text-2xl">{a.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.tagline}</p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-foreground/60">{a.era}</span>
            <span className="text-gold inline-flex items-center gap-1">
              {expanded ? "Close" : "Details"}
              <ArrowRight className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/60 px-6 pb-6 pt-4">
          <h3 className="font-display text-xl text-gold">History &amp; overview</h3>
          <p className="mt-3 text-sm text-foreground/85 leading-relaxed whitespace-pre-line">{a.description}</p>

          {a.highlights?.length > 0 && (
            <>
              <h3 className="mt-5 font-display text-lg text-gold">Main highlights</h3>
              <ul className="mt-2 space-y-2">
                {a.highlights.map((h: string) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-foreground/85">
                    <Check className="h-4 w-4 text-gold mt-0.5 shrink-0" /> {h}
                  </li>
                ))}
              </ul>
            </>
          )}

          <h3 className="mt-5 font-display text-lg text-gold">Visitor tips</h3>
          <ul className="mt-2 space-y-2">
            {VISITOR_TIPS.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-foreground/85">
                <InfoIcon className="h-4 w-4 text-gold mt-0.5 shrink-0" /> {t}
              </li>
            ))}
          </ul>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Info icon={Clock} label="Opening hours" value={hours} />
            <Info icon={Ticket} label="Ticket price" value={ticket} />
            {a.best_time && <Info icon={Sun} label="Best time to visit" value={a.best_time} />}
            <Info icon={Compass} label="Location" value={`${a.bank}, Luxor, Egypt`} />
            {hasCoords && (
              <Info
                icon={MapPin}
                label="Coordinates"
                value={`${Number(a.lat).toFixed(4)}, ${Number(a.lng).toFixed(4)}`}
              />
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/ask-luxor"
              className="flex-1 text-center rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-gold"
            >
              Ask Luxor about this site
            </Link>
            <Link
              to="/attractions/$slug"
              params={{ slug: a.slug }}
              className="flex-1 text-center rounded-full border border-gold/40 px-5 py-2.5 text-sm text-gold hover:bg-gold/10 transition"
            >
              Open full page
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-gold mt-0.5 shrink-0" />
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}