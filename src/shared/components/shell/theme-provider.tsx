"use client";

import * as React from "react";

export type ThemeMode = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "rp-theme";

function getAutoTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  const hour = new Date().getHours();
  // Jam 18:00 (malam) sampai 05:59 (pagi) dianggap malam (dark mode)
  // Jam 06:00 sampai 17:59 dianggap siang (light mode)
  return hour >= 18 || hour < 6 ? "dark" : "light";
}

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "auto";
  try {
    const val = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return val === "light" || val === "dark" || val === "auto" ? val : "auto";
  } catch {
    return "auto";
  }
}

function subscribeStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Menggunakan useSyncExternalStore agar sesuai standar React 19 tanpa cascading setState dalam effect
  const theme = React.useSyncExternalStore(
    subscribeStorage,
    getStoredTheme,
    () => "auto" as ThemeMode
  );

  const resolvedTheme: ResolvedTheme = React.useMemo(() => {
    if (theme === "light") return "light";
    if (theme === "dark") return "dark";
    return getAutoTheme();
  }, [theme]);

  // Sinkronisasi kelas dark pada dokumen HTML
  React.useEffect(() => {
    if (resolvedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [resolvedTheme]);

  // Interval pembaruan otomatis per menit saat mode auto aktif
  React.useEffect(() => {
    if (theme !== "auto") return;
    const interval = setInterval(() => {
      const computed = getAutoTheme();
      if (computed === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [theme]);

  const setTheme = React.useCallback((newMode: ThemeMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Ignore localStorage restrictions
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

const defaultThemeContext: ThemeContextType = {
  theme: "auto",
  resolvedTheme: "light",
  setTheme: () => {},
};

export function useTheme() {
  const context = React.useContext(ThemeContext);
  return context || defaultThemeContext;
}
