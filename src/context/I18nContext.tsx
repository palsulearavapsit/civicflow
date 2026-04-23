"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "es" | "hi" | "mr";

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  welcome: {
    en: "Vote with Confidence",
    es: "Vota con Confianza",
    hi: "विश्वास के साथ वोट करें",
    mr: "विश्वासाने मतदान करा"
  },
  tagline: {
    en: "Your Secure Election Companion",
    es: "Su Compañero Electoral Seguro",
    hi: "आपका सुरक्षित चुनाव साथी",
    mr: "तुमचा सुरक्षित निवडणूक सोबती"
  },
  getStarted: {
    en: "Get My Election Plan",
    es: "Obtener mi Plan Electoral",
    hi: "मेरी चुनाव योजना प्राप्त करें",
    mr: "माझी निवडणूक योजना मिळवा"
  },
  demoMode: {
    en: "Try Demo Mode",
    es: "Probar Modo Demo",
    hi: "डेमो मोड आज़माएं",
    mr: "डेमो मोड वापरून पहा"
  },
  copilot: {
    en: "Election Copilot",
    es: "Copiloto Electoral",
    hi: "चुनाव कोपायलट",
    mr: "निवडणूक कोपायलट"
  },
  pollingPlaces: {
    en: "Polling Places",
    es: "Lugares de Votación",
    hi: "मतदान केंद्र",
    mr: "मतदान केंद्रे"
  }
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
};
