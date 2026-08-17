"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, type Language } from "../content/translations";

const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void; t: (typeof translations)[Language] }>({ language: "de", setLanguage: () => {}, t: translations.de });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("de");
  useEffect(() => { const saved = window.localStorage.getItem("cgm-language"); if (saved === "de" || saved === "es") setLanguageState(saved); }, []);
  const setLanguage = (value: Language) => { setLanguageState(value); window.localStorage.setItem("cgm-language", value); document.documentElement.lang = value; };
  return <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() { return useContext(LanguageContext); }
