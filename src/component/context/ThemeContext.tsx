"use client";

import React from "react";

export type ThemeColor = "violet" | "blue" | "cyan" | "emerald" | "amber" | "rose" | "indigo" | "purple" | "teal" | "lime" | "orange" | "pink" | "sky" | "fuchsia";
export type ThemeMode = "dark" | "light";
export type BackgroundVariant = "floatingLines" | "pixelBlast";

interface ThemeContextType {
  themeColor: ThemeColor;
  themeMode: ThemeMode;
  backgroundVariant: BackgroundVariant;
  setThemeColor: (color: ThemeColor) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setBackgroundVariant: (variant: BackgroundVariant) => void;
}

const ThemeContext = React.createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "1337leets-theme";

const defaultTheme = {
  themeColor: "rose" as ThemeColor,
  themeMode: "dark" as ThemeMode,
  backgroundVariant: "floatingLines" as BackgroundVariant,
};

function loadTheme(): { themeColor: ThemeColor; themeMode: ThemeMode; backgroundVariant: BackgroundVariant } {
  if (typeof window === "undefined") return defaultTheme;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        themeColor: parsed.themeColor ?? defaultTheme.themeColor,
        themeMode: parsed.themeMode ?? defaultTheme.themeMode,
        backgroundVariant: parsed.backgroundVariant ?? defaultTheme.backgroundVariant,
      };
    }
  } catch {
    /* ignore */
  }
  return defaultTheme;
}

function saveTheme(themeColor: ThemeColor, themeMode: ThemeMode, backgroundVariant: BackgroundVariant) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ themeColor, themeMode, backgroundVariant }));
  } catch {
    /* ignore */
  }
}

export const themeConfig = {
  violet: {
    gradient: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#7c3aed"],
    bgClass: "to-violet-950/10",
    bgClassLight: "to-violet-200/60",
    overlayClass: "to-violet-950/35",
    overlayClassLight: "to-violet-300/20",
    gridColor: "139,92,246",
    borderClass: "border-violet-500",
    textClass: "text-violet-200",
  },
  blue: {
    gradient: ["#3b82f6", "#60a5fa", "#93c5fd", "#2563eb"],
    bgClass: "to-blue-950/10",
    bgClassLight: "to-blue-200/60",
    overlayClass: "to-blue-950/35",
    overlayClassLight: "to-blue-300/20",
    gridColor: "59,130,246",
    borderClass: "border-blue-500",
    textClass: "text-blue-200",
  },
  cyan: {
    gradient: ["#06b6d4", "#22d3ee", "#67e8f9", "#0891b2"],
    bgClass: "to-cyan-950/10",
    bgClassLight: "to-cyan-200/60",
    overlayClass: "to-cyan-950/35",
    overlayClassLight: "to-cyan-300/20",
    gridColor: "6,182,212",
    borderClass: "border-cyan-500",
    textClass: "text-cyan-200",
  },
  emerald: {
    gradient: ["#10b981", "#34d399", "#6ee7b7", "#059669"],
    bgClass: "to-emerald-950/10",
    bgClassLight: "to-emerald-200/60",
    overlayClass: "to-emerald-950/35",
    overlayClassLight: "to-emerald-300/20",
    gridColor: "16,185,129",
    borderClass: "border-emerald-500",
    textClass: "text-emerald-200",
  },
  amber: {
    gradient: ["#f59e0b", "#fbbf24", "#fcd34d", "#d97706"],
    bgClass: "to-amber-950/10",
    bgClassLight: "to-amber-200/60",
    overlayClass: "to-amber-950/35",
    overlayClassLight: "to-amber-300/20",
    gridColor: "245,158,11",
    borderClass: "border-amber-500",
    textClass: "text-amber-200",
  },
  rose: {
    gradient: ["#f43f5e", "#fb7185", "#fda4af", "#e11d48"],
    bgClass: "to-rose-950/10",
    bgClassLight: "to-rose-200/60",
    overlayClass: "to-rose-950/35",
    overlayClassLight: "to-rose-300/20",
    gridColor: "244,63,94",
    borderClass: "border-rose-500",
    textClass: "text-rose-200",
  },
  indigo: {
    gradient: ["#6366f1", "#818cf8", "#a5b4fc", "#4f46e5"],
    bgClass: "to-indigo-950/10",
    bgClassLight: "to-indigo-200/60",
    overlayClass: "to-indigo-950/35",
    overlayClassLight: "to-indigo-300/20",
    gridColor: "99,102,241",
    borderClass: "border-indigo-500",
    textClass: "text-indigo-200",
  },
  purple: {
    gradient: ["#a855f7", "#c084fc", "#d8b4fe", "#9333ea"],
    bgClass: "to-purple-950/10",
    bgClassLight: "to-purple-200/60",
    overlayClass: "to-purple-950/35",
    overlayClassLight: "to-purple-300/20",
    gridColor: "168,85,247",
    borderClass: "border-purple-500",
    textClass: "text-purple-200",
  },
  teal: {
    gradient: ["#14b8a6", "#2dd4bf", "#5eead4", "#0d9488"],
    bgClass: "to-teal-950/10",
    bgClassLight: "to-teal-200/60",
    overlayClass: "to-teal-950/35",
    overlayClassLight: "to-teal-300/20",
    gridColor: "20,184,166",
    borderClass: "border-teal-500",
    textClass: "text-teal-200",
  },
  lime: {
    gradient: ["#84cc16", "#a3e635", "#bef264", "#65a30d"],
    bgClass: "to-lime-950/10",
    bgClassLight: "to-lime-200/60",
    overlayClass: "to-lime-950/35",
    overlayClassLight: "to-lime-300/20",
    gridColor: "132,204,22",
    borderClass: "border-lime-500",
    textClass: "text-lime-200",
  },
  orange: {
    gradient: ["#f97316", "#fb923c", "#fdba74", "#ea580c"],
    bgClass: "to-orange-950/10",
    bgClassLight: "to-orange-200/60",
    overlayClass: "to-orange-950/35",
    overlayClassLight: "to-orange-300/20",
    gridColor: "249,115,22",
    borderClass: "border-orange-500",
    textClass: "text-orange-200",
  },
  pink: {
    gradient: ["#ec4899", "#f472b6", "#f9a8d4", "#db2777"],
    bgClass: "to-pink-950/10",
    bgClassLight: "to-pink-200/60",
    overlayClass: "to-pink-950/35",
    overlayClassLight: "to-pink-300/20",
    gridColor: "236,72,153",
    borderClass: "border-pink-500",
    textClass: "text-pink-200",
  },
  sky: {
    gradient: ["#0ea5e9", "#38bdf8", "#7dd3fc", "#0284c7"],
    bgClass: "to-sky-950/10",
    bgClassLight: "to-sky-200/60",
    overlayClass: "to-sky-950/35",
    overlayClassLight: "to-sky-300/20",
    gridColor: "14,165,233",
    borderClass: "border-sky-500",
    textClass: "text-sky-200",
  },
  fuchsia: {
    gradient: ["#d946ef", "#e879f9", "#f0abfc", "#c026d3"],
    bgClass: "to-fuchsia-950/10",
    bgClassLight: "to-fuchsia-200/60",
    overlayClass: "to-fuchsia-950/35",
    overlayClassLight: "to-fuchsia-300/20",
    gridColor: "217,70,239",
    borderClass: "border-fuchsia-500",
    textClass: "text-fuchsia-200",
  },
} as const;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState(defaultTheme);

  React.useEffect(() => {
    setThemeState(loadTheme());
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme-color", theme.themeColor);
    document.documentElement.setAttribute("data-theme-mode", theme.themeMode);
  }, [theme.themeColor, theme.themeMode]);

  const setThemeColor = React.useCallback((themeColor: ThemeColor) => {
    setThemeState((prev) => {
      const next = { ...prev, themeColor };
      saveTheme(next.themeColor, next.themeMode, next.backgroundVariant);
      return next;
    });
  }, []);

  const setThemeMode = React.useCallback((themeMode: ThemeMode) => {
    setThemeState((prev) => {
      const next = { ...prev, themeMode };
      saveTheme(next.themeColor, next.themeMode, next.backgroundVariant);
      return next;
    });
  }, []);

  const setBackgroundVariant = React.useCallback((backgroundVariant: BackgroundVariant) => {
    setThemeState((prev) => {
      const next = { ...prev, backgroundVariant };
      saveTheme(next.themeColor, next.themeMode, next.backgroundVariant);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        themeColor: theme.themeColor,
        themeMode: theme.themeMode,
        backgroundVariant: theme.backgroundVariant,
        setThemeColor,
        setThemeMode,
        setBackgroundVariant,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  return ctx ?? { ...defaultTheme, setThemeColor: () => {}, setThemeMode: () => {}, setBackgroundVariant: () => {} };
}
