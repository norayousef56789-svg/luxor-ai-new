import "@fontsource/cinzel/400.css";
import "@fontsource/cinzel/600.css";
import "@fontsource/cinzel/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import { useEffect, type ReactNode } from "react";

import { useTranslation } from "react-i18next";
import { I18nextProvider } from "react-i18next";

import appCss from "../styles.css?url";

import { reportLovableError } from "../lib/lovable-error-reporting";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

import i18n from "@/i18n/i18n";

import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">

        <h1 className="font-display text-7xl text-gradient-gold">
          404
        </h1>

        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {t("lostTitle")}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {t("lostDescription")}
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-gold px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            {t("returnHome")}
          </Link>
        </div>

      </div>
    </div>
  );
}

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    reportLovableError(error, {
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">

        <h1 className="font-display text-2xl text-gold">
          {t("errorTitle")}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {t("errorDescription")}
        </p>

        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-gold px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          {t("tryAgain")}
        </button>

      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },

      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },

      {
        title: "Luxor AI — Discover Luxor with intelligent travel",
      },

      {
        name: "description",
        content:
          "Luxor AI is the smart companion for Luxor, Egypt — attractions, hotels, restaurants, itineraries and an AI guide that knows the ancient city.",
      },

      {
        property: "og:title",
        content: "Luxor AI — Discover Luxor",
      },

      {
        property: "og:description",
        content:
          "Smart tourism + AI marketing platform for Luxor, Egypt.",
      },

      {
        property: "og:type",
        content: "website",
      },
    ],

    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootShell,

  component: RootComponent,

  notFoundComponent: NotFoundComponent,

  errorComponent: ErrorComponent,
});

function RootShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <HeadContent />
      </head>

      <body>
        {children}

        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  const { i18n: translationI18n } = useTranslation();

  /*
   * تغيير لغة واتجاه الموقع بالكامل
   */
  useEffect(() => {
    const language = translationI18n.language;

    document.documentElement.lang = language;

    document.documentElement.dir =
      language === "ar" ? "rtl" : "ltr";

    document.body.dir =
      language === "ar" ? "rtl" : "ltr";
  }, [translationI18n.language]);

  /*
   * تسجيل زيارة المستخدم
   */
  useEffect(() => {
    const recordVisit = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !user.email) {
          return;
        }

        const visitsTable = (supabase as any).from("visits");

        await visitsTable.insert({
          user_id: user.id,
          email: user.email,
        });
      } catch (error) {
        console.error(
          "Failed to record visit:",
          error
        );
      }
    };

    recordVisit();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>

        <div className="min-h-screen flex flex-col bg-gradient-night">

          <Header />

          <main className="flex-1">
            <Outlet />
          </main>

          <Footer />

        </div>

      </QueryClientProvider>
    </I18nextProvider>
  );
}