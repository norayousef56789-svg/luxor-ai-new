import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-midnight/60 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-5">

        {/* Brand */}
        <div>
          <div className="font-display text-2xl text-gradient-gold">
            LUXOR AI
          </div>

          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            {t("brand.tagline")}
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 className="text-sm font-semibold text-gold mb-3">
            {t("footer.explore")}
          </h4>

          <ul className="space-y-2 text-sm text-foreground/75">
            <li>
              <Link to="/attractions" className="hover:text-gold">
                {t("nav.attractions")}
              </Link>
            </li>

            <li>
              <Link to="/hotels" className="hover:text-gold">
                {t("nav.hotels")}
              </Link>
            </li>

            <li>
              <Link to="/restaurants" className="hover:text-gold">
                {t("nav.restaurants")}
              </Link>
            </li>

            <li>
              <Link to="/bazaars" className="hover:text-gold">
                {t("nav.bazaars")}
              </Link>
            </li>

            <li>
              <Link to="/events" className="hover:text-gold">
                {t("nav.events")}
              </Link>
            </li>

            <li>
              <Link to="/itineraries" className="hover:text-gold">
                {t("nav.itineraries")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Plan */}
        <div>
          <h4 className="text-sm font-semibold text-gold mb-3">
            {t("footer.plan")}
          </h4>

          <ul className="space-y-2 text-sm text-foreground/75">
            <li>
              <Link to="/map" className="hover:text-gold">
                {t("footer.interactiveMap")}
              </Link>
            </li>

            <li>
              <Link to="/ask-luxor" className="hover:text-gold">
                {t("nav.askAi")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Business */}
        <div>
          <h4 className="text-sm font-semibold text-gold mb-3">
            {t("footer.business")}
          </h4>

          <ul className="space-y-2 text-sm text-foreground/75">
            <li>
              <Link to="/businesses" className="hover:text-gold">
                {t("footer.directory")}
              </Link>
            </li>

            <li>
              <Link to="/business/register" className="hover:text-gold">
                {t("footer.listBusiness")}
              </Link>
            </li>

            <li>
              <Link to="/business/login" className="hover:text-gold">
                {t("footer.businessSignIn")}
              </Link>
            </li>

            <li>
              <Link to="/admin" className="hover:text-gold">
                {t("nav.admin")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Location */}
        <div>
          <h4 className="text-sm font-semibold text-gold mb-3">
            {t("footer.locationTitle")}
          </h4>

          <p className="text-sm text-muted-foreground">
            {t("footer.locationText")}
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border/40 py-5 text-center text-xs text-muted-foreground">
        {t("footer.copyright", { year })}
      </div>
    </footer>
  );
}