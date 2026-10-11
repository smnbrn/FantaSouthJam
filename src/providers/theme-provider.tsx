"use client";

import * as React from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "fanta3v3-theme";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  /** true solo dopo l'idratazione: usarlo per non mostrare icone dipendenti dal
   *  tema finché non siamo certi al 100% che rispecchino lo stato reale. */
  mounted: boolean;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function getSystemPreference(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeClass(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Il valore iniziale è sempre "light" (identico su server e client): evita
  // qualunque mismatch di idratazione. Il vero tema viene letto e applicato
  // subito dopo il mount, in un effetto che gira prima che l'utente possa
  // notare qualcosa (il colore di sfondo è già corretto grazie allo script
  // anti-flash nel layout: qui sincronizziamo solo lo STATO React e l'icona).
  const [theme, setThemeState] = React.useState<Theme>("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage non disponibile (es. modalità privata restrittiva): ignora.
    }
    const initial: Theme = stored === "dark" || stored === "light" ? stored : getSystemPreference();
    setThemeState(initial);
    applyThemeClass(initial);
    setMounted(true);
  }, []);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    applyThemeClass(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignora se localStorage non è scrivibile
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve essere usato dentro <ThemeProvider>");
  return ctx;
}
