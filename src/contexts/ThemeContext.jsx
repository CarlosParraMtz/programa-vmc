import { createContext, useContext, useEffect, useMemo, useState } from "react";

const THEME_STORAGE_KEY = "programa-vmc-theme";
const ThemeContext = createContext(null);

function getStoredTheme() {
  try {
    const theme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return ["system", "light", "dark"].includes(theme) ? theme : "system";
  } catch {
    return "system";
  }
}

function applyTheme(theme, systemPrefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
  const resolvedTheme = theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
}

export function initializeTheme() {
  applyTheme(getStoredTheme());
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const updateTheme = () => applyTheme(theme, media?.matches ?? false);
    updateTheme();

    if (theme !== "system" || !media) return undefined;
    media.addEventListener?.("change", updateTheme);
    return () => media.removeEventListener?.("change", updateTheme);
  }, [theme]);

  useEffect(() => {
    const syncThemeFromStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY) setThemeState(getStoredTheme());
    };
    window.addEventListener("storage", syncThemeFromStorage);
    return () => window.removeEventListener("storage", syncThemeFromStorage);
  }, []);

  const setTheme = (nextTheme) => {
    if (!["system", "light", "dark"].includes(nextTheme)) return;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Keep the selection active for this session when storage is unavailable.
    }
    setThemeState(nextTheme);
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return context;
}
