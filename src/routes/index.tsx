import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, MapPin, Sparkles, Compass, BookOpen, Store, CalendarDays, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import karnakHero from "@/assets/karnak.jpg";
import { supabase } from "@/integrations/supabase/client";
import { imageForAttractionSlug } from "@/lib/images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Luxor AI — Smart tourism & AI marketing for Luxor, Egypt" },
      { name: "description", content: "Explore Karnak, the Valley of the Kings and the Nile with curated attractions, hotels, restaurants, bazaars, events and an AI guide. Plus a full business portal & AI marketing studio." },
      { property: "og:title", content: "Luxor AI — Discover Luxor" },
      { property: "og:description", content: "Smart tourism + AI marketing platform for Luxor, Egypt." },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useTranslation();
  const { data: featured } = useQuery({
    queryKey: ["featured-attractions"],
    queryFn: async () => {
      const { data } = await supabase.from("attractions").select("slug,name,bank,tagline").limit(3);
      return data ?? [];
    },
  });

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img src={karnakHero} alt="Karnak Temple columns at golden hour" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative mx-auto max-w-7xl px-6 py-32 md:py-44">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-midnight/40 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-gold">
            <Sparkles className="h-3.5 w-3.5" /> Smart tourism + AI marketing · Luxor, Egypt
          </span>
          <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.05] max-w-3xl">
            Walk among <span className="text-gradient-gold">pharaohs</span>.<br /> Plan it like a local.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-foreground/80">
            Luxor AI curates the world's greatest open-air museum — temples, tombs, river sunsets and the perfect tagine — and gives local businesses an AI marketing studio of their own.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/attractions" className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-medium text-primary-foreground shadow-gold">
              {t("exploreAttractions")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/ask-luxor" className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-midnight/40 backdrop-blur px-6 py-3 text-sm font-medium text-gold hover:bg-midnight/60">
              <Sparkles className="h-4 w-4" /> {t("askLuxorAI")}
            </Link>
            <Link to="/business/register" className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-midnight/40 backdrop-blur px-6 py-3 text-sm font-medium text-foreground/80 hover:text-gold">
              <Store className="h-4 w-4" /> List your business
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK NAV */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { to: "/attractions", icon: Compass, title: "Attractions", desc: "Temples, tombs & timeless rituals." },
            { to: "/events", icon: CalendarDays, title: "Events", desc: "Opera at Hatshepsut, balloon festivals." },
            { to: "/bazaars", icon: Tag, title: "Bazaars", desc: "Alabaster, papyrus, fair-trade crafts." },
            { to: "/businesses", icon: Store, title: "Directory", desc: "Verified hotels, restaurants & tours." },
          ].map((q) => (
            <Link key={q.to} to={q.to} className="rounded-2xl border border-border/60 bg-card/50 p-6 hover:border-gold/40 transition">
              <q.icon className="h-5 w-5 text-gold" />
              <h3 className="mt-3 font-display text-xl">{q.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{q.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.3em]">Must visit</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Iconic Luxor</h2>
          </div>
          <Link to="/attractions" className="text-sm text-gold hover:underline inline-flex items-center gap-1">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {(featured ?? []).map((a) => (
            <Link key={a.slug} to="/attractions/$slug" params={{ slug: a.slug }} className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elegant">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={imageForAttractionSlug(a.slug)} alt={a.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/30 to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <div className="text-xs text-gold uppercase tracking-widest">{a.bank}</div>
                  <h3 className="mt-1 font-display text-2xl">{a.name}</h3>
                  <p className="mt-2 text-sm text-foreground/75 line-clamp-2">{a.tagline}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FOR BUSINESSES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-3xl border border-gold/30 bg-midnight/60 p-10 md:p-14">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-gold text-xs uppercase tracking-[0.3em]">For businesses</p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">AI marketing for Luxor's hosts, chefs & guides</h2>
              <p className="mt-4 text-muted-foreground">
                Register your hotel, restaurant, bazaar or tour company and unlock a full AI marketing studio — Facebook posts, Instagram captions, hashtag sets, campaign ideas and promo video scripts, on-brand and in seconds.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/business/register" className="rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-gold">Register your business</Link>
                <Link to="/business/login" className="rounded-full border border-gold/40 px-5 py-2.5 text-sm text-gold">Business sign in</Link>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-foreground/85">
              {["Profile management & verification","Live visitor analytics dashboard","Unlimited offers & promotions","Facebook & Instagram content","Hashtag and campaign generators","Promotional video scripts"].map((f) => (
                <li key={f} className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-gold" /> {f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "Ask Luxor AI", desc: "An AI Egyptologist in your pocket — opening hours, tomb tips, hidden cafés." },
            { icon: Compass, title: "Curated itineraries", desc: "From 2-day blitzes to slow week-long stays, planned hour by hour." },
            { icon: BookOpen, title: "Real depth", desc: "Every site backed by history, context, and travel-tested advice." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border/60 bg-card/50 p-7">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-gold/15 text-gold"><Icon className="h-5 w-5" /></div>
              <h3 className="mt-5 font-display text-xl">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MAP CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.3em]">Orient yourself</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">East Bank, West Bank, and the river between</h2>
            <p className="mt-4 text-muted-foreground">
              Luxor lives on two sides of the Nile — the living temples on the east, the eternal tombs on the west. Our interactive map plots every site.
            </p>
            <Link to="/map" className="mt-6 inline-flex items-center gap-2 text-gold hover:underline"><MapPin className="h-4 w-4" /> Open interactive map</Link>
          </div>
          <div className="aspect-video rounded-2xl overflow-hidden border border-border/60 shadow-elegant">
            <iframe title="Luxor map" className="h-full w-full" src="https://www.openstreetmap.org/export/embed.html?bbox=32.55%2C25.66%2C32.72%2C25.78&layer=mapnik" />
          </div>
        </div>
      </section>
    </div>
  );
}
