import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Ticket, Sun, MapPin, Check, Compass, Info as InfoIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { imageForAttractionSlug } from "@/lib/images";

const SLUG_ALIASES: Record<string, string> = {
  karnak: "karnak-temple",
  hatshepsut: "hatshepsut-temple",
  "valley-kings": "valley-of-the-kings",
  "valley-of-kings": "valley-of-the-kings",
  balloons: "hot-air-balloon",
  "hot-air-balloons": "hot-air-balloon",
  felucca: "nile-felucca",
  museum: "luxor-museum",
};

export const Route = createFileRoute("/attractions/$slug")({
  beforeLoad: ({ params }) => {
    const canonical = SLUG_ALIASES[params.slug];
    if (canonical) {
      throw redirect({ to: "/attractions/$slug", params: { slug: canonical }, replace: true });
    }
  },
  head: () => ({
    meta: [
      { title: "Attraction Guide — Luxor AI" },
      { name: "description", content: "Hours, tickets, highlights and visitor tips for Luxor's temples, tombs and Nile experiences." },
      { property: "og:title", content: "Attraction Guide — Luxor AI" },
      { property: "og:description", content: "Everything you need before you visit this Luxor landmark." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AttractionDetail,
  errorComponent: () => (
    <Fallback title="Something went wrong" body="We couldn't load this attraction. Please try again." />
  ),
  notFoundComponent: () => <Fallback title="Attraction not found" body="This landmark isn't in our guide yet." />,
});

const VISITOR_TIPS = [
  "Carry your passport or ID — some ticket offices ask for it.",
  "Bring water, a hat and sunscreen; shade is limited on most sites.",
  "Cash (EGP) is safest for tickets, guides and tips.",
  "Photography permits may cost extra inside tombs and chambers.",
  "Dress modestly and wear comfortable shoes for uneven ground.",
];

function Fallback({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-display text-3xl text-gold">{title}</h1>
      <p className="mt-3 text-muted-foreground">{body}</p>
      <Link to="/attractions" className="mt-6 inline-block text-gold hover:underline">
        ← Back to all attractions
      </Link>
    </div>
  );
}

function AttractionDetail() {
  const { slug } = Route.useParams();
  const { data: a, isLoading } = useQuery({
    queryKey: ["attraction", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("attractions").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-center py-32 text-muted-foreground">Loading…</p>;
  if (!a) return <Fallback title="Attraction not found" body="This landmark isn't in our guide yet." />;

  const img = imageForAttractionSlug(a.slug);
  const hours = a.hours?.trim() ? a.hours : "Please check current opening hours.";
  const ticket = a.ticket?.trim() ? a.ticket : "Please check the latest ticket price locally.";
  const hasCoords = a.lat != null && a.lng != null;

  return (
    <article>
      <div className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src={img} alt={a.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative mx-auto max-w-5xl h-full px-6 flex flex-col justify-end pb-12">
          <Link to="/attractions" className="inline-flex items-center gap-2 text-sm text-gold hover:underline w-fit">
            <ArrowLeft className="h-4 w-4" /> All attractions
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold">
            <span>{a.bank}</span>
            {a.era && (
              <>
                <span className="opacity-50">•</span>
                <span>{a.era}</span>
              </>
            )}
          </div>
          <h1 className="mt-3 font-display text-4xl md:text-6xl max-w-3xl">{a.name}</h1>
          {a.tagline && <p className="mt-3 text-lg text-foreground/85 max-w-2xl">{a.tagline}</p>}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-14 grid lg:grid-cols-[2fr_1fr] gap-10">
        <div>
          <h2 className="font-display text-2xl text-gold">History &amp; overview</h2>
          <p className="mt-4 text-foreground/85 leading-relaxed whitespace-pre-line">{a.description}</p>

          {a.highlights?.length > 0 && (
            <>
              <h2 className="mt-10 font-display text-2xl text-gold">Main highlights</h2>
              <ul className="mt-4 space-y-3">
                {a.highlights.map((h: string) => (
                  <li key={h} className="flex items-start gap-3 text-foreground/85">
                    <Check className="h-5 w-5 text-gold mt-0.5 shrink-0" /> {h}
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2 className="mt-10 font-display text-2xl text-gold">Important visitor information</h2>
          <ul className="mt-4 space-y-3">
            {VISITOR_TIPS.map((t) => (
              <li key={t} className="flex items-start gap-3 text-foreground/85">
                <InfoIcon className="h-5 w-5 text-gold mt-0.5 shrink-0" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <aside className="rounded-2xl border border-border/60 bg-card p-6 h-fit space-y-5 lg:sticky lg:top-24">
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

          <div className="pt-2 space-y-3">
            <Link
              to="/ask-luxor"
              className="block text-center rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-gold"
            >
              Ask Luxor about this site
            </Link>
            <Link
              to="/attractions"
              className="block text-center rounded-full border border-gold/40 px-5 py-2.5 text-sm text-gold hover:bg-gold/10 transition"
            >
              Back to all attractions
            </Link>
          </div>
        </aside>
      </div>
    </article>
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
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-gold mt-0.5 shrink-0" />
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}