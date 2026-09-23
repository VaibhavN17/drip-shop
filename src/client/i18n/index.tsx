import React, { createContext, useContext, useState, useCallback } from "react";
import { en, type TranslationKeys } from "./en";
import { mr } from "./mr";

type Lang = "en" | "mr";
const dictionaries: Record<Lang, Record<TranslationKeys, string>> = { en, mr };

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKeys) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>((localStorage.getItem("lang") as Lang) || "en");

  const changeLang = useCallback((l: Lang) => {
    setLang(l);
    localStorage.setItem("lang", l);
  }, []);

  const t = useCallback((key: TranslationKeys) => dictionaries[lang][key] ?? dictionaries.en[key], [lang]);

  return <I18nContext.Provider value={{ lang, setLang: changeLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
