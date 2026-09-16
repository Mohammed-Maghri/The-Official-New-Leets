"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTheme, themeConfig } from "@/component/context/ThemeContext";

const FloatingLines = dynamic(() => import("./FloatingLines"), { ssr: false });
const PixelBlast = dynamic(() => import("./PixelBlast"), { ssr: false });
const WAVES: ("top" | "middle" | "bottom")[] = ["top", "middle", "bottom"];

export default function AdaptiveBackground({ preview = false }: { preview?: boolean }) {
  const { themeColor, backgroundVariant } = useTheme();
  const config = themeConfig[themeColor];
  // Start static, including during hydration. Phones never mount the GPU effects.
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (preview) return;
    const eligible = window.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const update = () => setAnimate(eligible.matches && !document.hidden);
    update();
    eligible.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      eligible.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [preview]);

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
      {animate && !preview && (backgroundVariant === "pixelBlast" ? (
        <PixelBlast
          antialias={false}
          variant="square"
          pixelSize={4}
          color={config.gradient[0]}
          patternScale={2}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid={false}
          speed={0.5}
          edgeFade={0.25}
          transparent
        />
      ) : (
        <FloatingLines
          enabledWaves={WAVES}
          lineCount={5}
          lineDistance={5}
          bendRadius={5}
          bendStrength={-0.5}
          interactive
          parallax
          linesGradient={config.gradient}
        />
      ))}
    </div>
  );
}
