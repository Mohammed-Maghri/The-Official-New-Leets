"use client";

import React from "react";

export type FontChoice = "pixel" | "readable" | "tektur";
const STORAGE_KEY = "1337leets-theme";
const ThemeContext = React.createContext<{
  darkMode: boolean;
  toggleDarkMode: () => void;
  fontChoice: FontChoice;
  setFontChoice: (font: FontChoice) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = React.useState(false);
  const [fontChoice, setFont] = React.useState<FontChoice>("readable");
  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setDarkMode(saved.darkMode === true);
      if (["pixel", "readable", "tektur"].includes(saved.fontChoice)) setFont(saved.fontChoice);
    } catch { /* Storage can be unavailable. */ }
  }, []);
  React.useEffect(() => {
    document.documentElement.setAttribute("data-font", fontChoice);
  }, [fontChoice]);
  React.useEffect(() => { document.documentElement.dataset.mode = darkMode ? "dark" : "light"; }, [darkMode]);
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ fontChoice, darkMode: next })); } catch { /* Session-only preference. */ }
  };
  const setFontChoice = React.useCallback((font: FontChoice) => {
    setFont(font);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ fontChoice: font, darkMode }));
    } catch { /* Keep the selection for this session. */ }
  }, [darkMode]);
  return <ThemeContext.Provider value={{ fontChoice, setFontChoice, darkMode, toggleDarkMode }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme requires ThemeProvider");
  return context;
}
