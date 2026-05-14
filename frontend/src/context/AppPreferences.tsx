import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "uz" | "ru";
export type Theme = "light" | "dark";

type AppPreferencesContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const LANGUAGE_KEY = "barberbook.language";
const THEME_KEY = "barberbook.theme";

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

function getInitialLanguage(): Language {
  const value = localStorage.getItem(LANGUAGE_KEY);
  if (value === "en" || value === "uz" || value === "ru") {
    return value;
  }
  return "en";
}

function getInitialTheme(): Theme {
  const value = localStorage.getItem(THEME_KEY);
  return value === "dark" ? "dark" : "light";
}

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.body.dataset.theme = theme;
  }, [theme]);

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      theme,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [language, theme]
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);
  if (!context) {
    throw new Error("useAppPreferences must be used within AppPreferencesProvider");
  }
  return context;
}
