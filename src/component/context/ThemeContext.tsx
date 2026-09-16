"use client";

import React from "react";

export type FontChoice = "pixel" | "readable" | "tektur";
const STORAGE_KEY = "1337leets-theme";
const ThemeContext = React.createContext<{
  fontChoice: FontChoice;
  setFontChoice: (font: FontChoice) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [fontChoice, setFont] = React.useState<FontChoice>("readable");
  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (["pixel", "readable", "tektur"].includes(saved.fontChoice)) setFont(saved.fontChoice);
    } catch { /* Storage can be unavailable. */ }
  }, []);
  React.useEffect(() => {
    document.documentElement.setAttribute("data-font", fontChoice);
  }, [fontChoice]);
  const setFontChoice = React.useCallback((font: FontChoice) => {
    setFont(font);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ fontChoice: font }));
    } catch { /* Keep the selection for this session. */ }
  }, []);
  return <ThemeContext.Provider value={{ fontChoice, setFontChoice }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme requires ThemeProvider");
  return context;
}
