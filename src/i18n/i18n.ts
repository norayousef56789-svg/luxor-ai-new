import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import ar from "./ar.json";
import zh from "./zh.json";

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

    fallbackLng: "en",
supportedLngs: ["en", "ar", "zh"],
interpolation: {
  escapeValue: false,
    },
  });

export default i18n;