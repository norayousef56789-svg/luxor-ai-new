import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { en } from "../lib/locales/en";
import { ar } from "../lib/locales/ar";
import { zh } from "../lib/locales/zh";

const savedLanguage =
  typeof window !== "undefined"
    ? localStorage.getItem("luxor-language")
    : null;

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      ar: {
        translation: ar,
      },
      zh: {
        translation: zh,
      },
    },

    lng:
      savedLanguage === "ar" ||
      savedLanguage === "zh" ||
      savedLanguage === "en"
        ? savedLanguage
        : "en",

    fallbackLng: "en",

    supportedLngs: ["en", "ar", "zh"],

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;