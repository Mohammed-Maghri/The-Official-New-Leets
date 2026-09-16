"use client";

import { useTheme, themeConfig } from "@/component/context/ThemeContext";

// CSS-only on every screen size: decorative backgrounds need no render loop.
export default function AdaptiveBackground() {
  const { themeColor, backgroundVariant } = useTheme();
  const config = themeConfig[themeColor];

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: backgroundVariant === "pixelBlast"
            ? `radial-gradient(${config.gradient[0]} 1px, transparent 1px)`
            : `repeating-linear-gradient(145deg, transparent 0 38px, ${config.gradient[0]}55 39px, transparent 41px 80px)`,
          backgroundSize: backgroundVariant === "pixelBlast" ? "12px 12px" : undefined,
        }}
      />
    </div>
  );
}
