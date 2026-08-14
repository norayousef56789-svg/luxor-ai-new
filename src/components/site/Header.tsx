import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  Shield,
  LogOut,
  User,
  Menu,
  Globe,
} from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { useAuth, signOut } from "@/lib/auth";
import { useTranslation } from "react-i18next";

export function Header() {
  const { user, roles } = useAuth();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAdmin = roles.includes("admin");
  const isBusiness = roles.includes("business");

  const { t, i18n } = useTranslation();

  // Load saved language after the browser is mounted
  useEffect(() => {
    setMounted(true);

    const savedLanguage = localStorage.getItem("luxor-language");

    if (savedLanguage && ["en", "ar", "zh"].includes(savedLanguage)) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const tourist = [
    {
      to: "/attractions",
      label: t("nav.attractions"),
    },
    {
      to: "/itineraries",
      label: t("nav.itineraries"),
    },
    {
      to: "/hotels",
      label: t("nav.hotels"),
    },
    {
      to: "/restaurants",
      label: t("nav.restaurants"),
    },
    {
      to: "/bazaars",
      label: t("nav.bazaars"),
    },
    {
      to: "/events",
      label: t("nav.events"),
    },
    {
      to: "/businesses",
      label: t("nav.businesses"),
    },
    {
      to: "/map",
      label: t("nav.map"),
    },
  ] as const;

  const handleLanguageChange = async (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const language = event.target.value;

    await i18n.changeLanguage(language);

    localStorage.setItem("luxor-language", language);

    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  };

  // Prevent SSR/client hydration mismatch
  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-midnight/70">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-gold text-primary-foreground font-display text-lg font-bold shadow-gold">
              L
            </span>

            <span className="font-display text-xl tracking-wider">
              <span className="text-gradient-gold">LUXOR</span>

              <span className="ml-1 text-foreground/80 text-sm align-middle">
                AI
              </span>
            </span>
          </Link>

          <div className="flex-1" />

          <Globe className="h-4 w-4 shrink-0 text-gold" />

          <div className="w-24 h-8 rounded-md border border-gold/40" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-midnight/70">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-gold text-primary-foreground font-display text-lg font-bold shadow-gold">
            L
          </span>

          <span className="font-display text-xl tracking-wider">
            <span className="text-gradient-gold">LUXOR</span>

            <span className="ml-1 text-foreground/80 text-sm align-middle">
              AI
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex flex-1 items-center justify-center gap-3 text-sm">
          {tourist.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-foreground/75 hover:text-gold transition-colors"
              activeProps={{
                className: "text-gold",
              }}
            >
              {item.label}
            </Link>
          ))}

          {/* Admin */}
          {isAdmin && (
            <Link
              to="/admin"
              className="text-foreground/75 hover:text-gold inline-flex items-center gap-1 transition-colors"
              activeProps={{
                className: "text-gold",
              }}
            >
              <Shield className="h-3.5 w-3.5" />
              {t("nav.admin")}
            </Link>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex shrink-0 items-center gap-2">

          {/* Language */}
          <Globe className="h-4 w-4 shrink-0 text-gold" />

          <select
            value={i18n.resolvedLanguage || i18n.language}
            onChange={handleLanguageChange}
            aria-label={t("lang.label")}
            className="w-24 rounded-md border border-gold/40 bg-midnight/80 px-2 py-1 text-sm text-foreground outline-none"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="zh">中文</option>
          </select>

          {/* Authentication */}
          {user ? (
            <div className="hidden md:flex items-center gap-2">

              {/* Business Dashboard */}
              {isBusiness && (
                <Link
                  to="/business/dashboard"
                  className="rounded-full border border-gold/40 px-3 py-1.5 text-xs text-gold hover:bg-gold/10 transition-colors"
                >
                  {t("nav.businessDashboard")}
                </Link>
              )}

              {/* Sign Out */}
              <button
                type="button"
                onClick={() => signOut()}
                className="inline-flex items-center gap-1.5 text-xs text-foreground/70 hover:text-gold transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t("nav.signOut")}
              </button>
            </div>
          ) : (
            /* Sign In */
            <Link
              to="/auth"
              search={{
                redirect: undefined,
              }}
              className="hidden md:inline-flex items-center gap-2 text-foreground/80 hover:text-gold transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              {t("nav.signIn")}
            </Link>
          )}

          {/* Ask Luxor AI */}
          <Link
            to="/ask-luxor"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-2 text-sm font-medium text-primary-foreground shadow-gold"
          >
            <Sparkles className="h-4 w-4" />
            {t("nav.askAi")}
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Open menu"
            className="xl:hidden p-2 text-foreground/70 hover:text-gold transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="xl:hidden border-t border-border/60 bg-midnight/95 px-6 py-4">
          <div className="grid grid-cols-2 gap-2 text-sm">

            {/* Tourist Links */}
            {tourist.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="text-foreground/75 hover:text-gold py-1.5 transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {/* Ask AI */}
            <Link
              to="/ask-luxor"
              onClick={() => setOpen(false)}
              className="text-gold py-1.5"
            >
              {t("nav.askAi")}
            </Link>

            {/* Admin */}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="text-gold py-1.5"
              >
                {t("nav.admin")}
              </Link>
            )}

            {/* Business Dashboard */}
            {isBusiness && (
              <Link
                to="/business/dashboard"
                onClick={() => setOpen(false)}
                className="text-gold py-1.5"
              >
                {t("nav.businessDashboard")}
              </Link>
            )}

            {/* Sign In */}
            {!user && (
              <Link
                to="/auth"
                search={{
                  redirect: undefined,
                }}
                onClick={() => setOpen(false)}
                className="text-gold py-1.5"
              >
                {t("nav.signIn")}
              </Link>
            )}

            {/* Sign Out */}
            {user && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="text-left text-foreground/70 py-1.5"
              >
                {t("nav.signOut")}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}