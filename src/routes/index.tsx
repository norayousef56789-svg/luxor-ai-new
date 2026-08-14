import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  MapPin,
  Sparkles,
  Compass,
  BookOpen,
  Store,
  CalendarDays,
  Tag,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import karnakHero from "@/assets/karnak.jpg";
import { supabase } from "@/integrations/supabase/client";
import { imageForAttractionSlug } from "@/lib/images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Luxor AI — Smart tourism & AI marketing for Luxor, Egypt",
      },
      {
        name: "description",
        content:
          "Explore Karnak, the Valley of the Kings and the Nile with curated attractions, hotels, restaurants, bazaars, events and an AI guide.",
      },
      {
        property: "og:title",
        content: "Luxor AI — Discover Luxor",
      },
      {
        property: "og:description",
        content: "Smart tourism + AI marketing platform for Luxor, Egypt.",
      },
    ],
  }),

  component: Home,
});

function Home() {
  const { t } = useTranslation();

  const { data: featured } = useQuery({
    queryKey: ["featured-attractions"],

    queryFn: async () => {
      const { data } = await supabase
        .from("attractions")
        .select("slug,name,bank,tagline")
        .limit(3);

      return data ?? [];
    },
  });

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={karnakHero}
          alt="Karnak Temple columns at golden hour"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 hero-overlay" />

        <div className="relative mx-auto max-w-7xl px-6 py-32 md:py-44">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-midnight/40 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-gold">
            <Sparkles className="h-3.5 w-3.5" />
            {t("home.badge")}
          </span>

          {/* Main title */}
          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.05] md:text-7xl">
            {t("home.heroTitle1")}{" "}
            <span className="text-gradient-gold">
              {t("home.heroTitleHighlight")}
            </span>
            .
            <br />
            {t("home.heroTitle2")}
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-lg text-foreground/80">
            {t("home.heroText")}
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/attractions"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-medium text-primary-foreground shadow-gold"
            >
              {t("home.exploreCta")}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/ask-luxor"
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-midnight/40 px-6 py-3 text-sm font-medium text-gold backdrop-blur hover:bg-midnight/60"
            >
              <Sparkles className="h-4 w-4" />
              {t("nav.askAi")}
            </Link>

            <Link
              to="/business/register"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-midnight/40 px-6 py-3 text-sm font-medium text-foreground/80 backdrop-blur hover:text-gold"
            >
              <Store className="h-4 w-4" />
              {t("home.listBusiness")}
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK NAV */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            {
              to: "/attractions",
              icon: Compass,
              title: t("home.quick.attractions"),
              desc: t("home.quick.attractionsDesc"),
            },
            {
              to: "/events",
              icon: CalendarDays,
              title: t("home.quick.events"),
              desc: t("home.quick.eventsDesc"),
            },
            {
              to: "/bazaars",
              icon: Tag,
              title: t("home.quick.bazaars"),
              desc: t("home.quick.bazaarsDesc"),
            },
            {
              to: "/businesses",
              icon: Store,
              title: t("home.quick.directory"),
              desc: t("home.quick.directoryDesc"),
            },
          ].map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="rounded-2xl border border-border/60 bg-card/50 p-6 transition hover:border-gold/40"
            >
              <q.icon className="h-5 w-5 text-gold" />

              <h3 className="mt-3 font-display text-xl">
                {q.title}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {q.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED ATTRACTIONS */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              {t("home.featuredEyebrow")}
            </p>

            <h2 className="mt-2 font-display text-3xl md:text-4xl">
              {t("home.featuredTitle")}
            </h2>
          </div>

          <Link
            to="/attractions"
            className="inline-flex items-center gap-1 text-sm text-gold hover:underline"
          >
            {t("common.viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {(featured ?? []).map((a) => (
            <Link
              key={a.slug}
              to="/attractions/$slug"
              params={{ slug: a.slug }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elegant"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={imageForAttractionSlug(a.slug)}
                  alt={a.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/30 to-transparent" />

                <div className="absolute bottom-0 p-6">
                  <div className="text-xs uppercase tracking-widest text-gold">
                    {a.bank}
                  </div>

                  <h3 className="mt-1 font-display text-2xl">
                    {a.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-foreground/75">
                    {a.tagline}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FOR BUSINESSES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-3xl border border-gold/30 bg-midnight/60 p-10 md:p-14">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold">
                {t("home.bizEyebrow")}
              </p>

              <h2 className="mt-3 font-display text-3xl md:text-4xl">
                {t("home.bizTitle")}
              </h2>

              <p className="mt-4 text-muted-foreground">
                {t("home.bizText")}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/business/register"
                  className="rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-gold"
                >
                  {t("home.bizRegister")}
                </Link>

                <Link
                  to="/business/login"
                  className="rounded-full border border-gold/40 px-5 py-2.5 text-sm text-gold"
                >
                  {t("home.bizSignIn")}
                </Link>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-foreground/85">
              {[
                "home.bizFeature1",
                "home.bizFeature2",
                "home.bizFeature3",
                "home.bizFeature4",
                "home.bizFeature5",
                "home.bizFeature6",
              ].map((key) => (
                <li
                  key={key}
                  className="flex items-center gap-3"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: t("home.value1Title"),
              desc: t("home.value1Desc"),
            },
            {
              icon: Compass,
              title: t("home.value2Title"),
              desc: t("home.value2Desc"),
            },
            {
              icon: BookOpen,
              title: t("home.value3Title"),
              desc: t("home.value3Desc"),
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-border/60 bg-card/50 p-7"
            >
              <div className="grid h-11 w-11 place-items-center rounded-full bg-gold/15 text-gold">
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="mt-5 font-display text-xl">
                {title}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MAP CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              {t("home.mapEyebrow")}
            </p>

            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              {t("home.mapTitle")}
            </h2>

            <p className="mt-4 text-muted-foreground">
              {t("home.mapText")}
            </p>

            <Link
              to="/map"
              className="mt-6 inline-flex items-center gap-2 text-gold hover:underline"
            >
              <MapPin className="h-4 w-4" />
              {t("home.mapCta")}
            </Link>
          </div>

          <div className="aspect-video overflow-hidden rounded-2xl border border-border/60 shadow-elegant">
            <iframe
              title="Luxor map"
              className="h-full w-full"
              src="https://www.openstreetmap.org/export/embed.html?bbox=32.55%2C25.66%2C32.72%2C25.78&layer=mapnik"
            />
          </div>
        </div>
      </section>
    </div>
  );
}