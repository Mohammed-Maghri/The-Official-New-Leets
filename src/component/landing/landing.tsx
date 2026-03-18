"use client";
import React, { FC, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  useTheme,
  themeConfig,
  type ThemeColor,
} from "@/component/context/ThemeContext";
import FloatingLines from "./FloatingLines";
import PixelBlast from "./PixelBlast";

interface LandingComponentProps {
  onPlayMusic?: () => void;
}

const LandingComponent: FC<LandingComponentProps> = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { themeColor, setThemeColor, backgroundVariant, setBackgroundVariant } =
    useTheme();
  const colors = (Object.keys(themeConfig) as ThemeColor[]).filter(
    (c) => themeConfig[c],
  );

  const handleLogin = () => {
    setIsLoggingIn(true);
    setTimeout(() => {
      window.location.href = process.env.NEXT_PUBLIC_REDIRECT_URL as string;
    }, 1400);
  };

  return (
    <>
      {/* Main content - landing page only, no intro */}
      <motion.div
        className="flex min-h-screen min-h-[100dvh] flex-col items-center justify-center px-3 sm:px-6 py-6 sm:py-8 overflow-y-auto overflow-x-hidden"
        style={{ fontFamily: "var(--font-ui)", imageRendering: "pixelated" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="relative z-20 group w-full max-w-[360px] min-w-0 flex-shrink-0"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="relative border-4 theme-border-strong bg-gray-950/98 overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_50px_var(--theme-bg-card),0_0_0_2px_var(--theme-border)]"
            style={{
              boxShadow:
                "6px 6px 0 var(--theme-shadow-lg), 0 0 40px var(--theme-bg-card), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 theme-border z-10" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 theme-border z-10" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 theme-border z-10" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 theme-border z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-primary)]/5 to-transparent pointer-events-none" />
            <div className="relative border-2 theme-border bg-gradient-to-b from-gray-900/98 to-gray-950/98 p-4 sm:p-8 flex flex-col items-center gap-4 sm:gap-5 min-w-0 w-full">
              <div className="text-center space-y-3">
                <h1
                  className="text-2xl sm:text-3xl tracking-[0.2em] theme-text font-bold"
                  style={{
                    textShadow:
                      "2px 0 0 var(--theme-primary-dark), -2px 0 0 var(--theme-primary-dark), 0 2px 0 var(--theme-primary-dark), 0 -2px 0 var(--theme-primary-dark), 0 0 20px var(--theme-bg)",
                  }}
                >
                  1337LEETS
                </h1>
                <div className="flex justify-center gap-0.5">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 ${i % 2 === 0 ? "bg-[var(--theme-primary)]" : "bg-[var(--theme-primary-muted)]"}`}
                    />
                  ))}
                </div>
                <p className="theme-text-muted text-xs uppercase tracking-[0.25em]">
                  Elite School Ranking
                </p>
              </div>

              <div className="text-center space-y-1 px-2 py-2 border-2 theme-border bg-[var(--theme-bg-card)] w-full">
                <h3 className="theme-text text-sm font-bold uppercase tracking-wider">
                  Welcome Back
                </h3>
                <p className="theme-text-muted text-[10px] uppercase tracking-widest">
                  Access your academic dashboard
                </p>
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full relative border-2 theme-border-strong py-3 px-4
        text-white text-sm font-bold uppercase tracking-wider
        transition-all duration-200 active:translate-y-1
        hover:scale-[1.02] hover:border-[var(--theme-primary-muted)]
        hover:shadow-[0_0_35px_var(--theme-bg),0_0_15px_var(--theme-primary)]
        active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.5)]
        disabled:opacity-70 disabled:pointer-events-none disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 60%, transparent), color-mix(in srgb, var(--theme-primary-dark) 70%, transparent))",
                  boxShadow:
                    "4px 4px 0 var(--theme-shadow-lg), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <span className="drop-shadow-[1px_1px_0_rgba(0,0,0,0.6)]">
                  Login to Platform
                </span>
              </button>

              <div className="flex gap-2 w-full">
                <button
                  onClick={() =>
                    window.open("https://github.com/Mohammed-Maghri", "_blank")
                  }
                  className="flex-1 border-2 border-cyan-500/50 bg-cyan-500/10 py-2 px-3
          text-cyan-300 text-[9px] font-bold uppercase tracking-wider
          transition-all duration-150 active:translate-y-0.5
          hover:bg-cyan-500/20 hover:border-cyan-400/60"
                  style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
                >
                  Drop a Follow
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://github.com/Mohammed-Maghri/The-Official-New-Leets",
                      "_blank",
                    )
                  }
                  className="flex-1 border-2 border-amber-400/70 bg-amber-500/30 py-2 px-3
          text-amber-100 text-[9px] font-bold uppercase tracking-wider
          transition-all duration-150 active:translate-y-0.5
          hover:bg-amber-500/50 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                  style={{ boxShadow: "2px 2px 0 rgba(180,83,9,0.4)" }}
                >
                  ⭐ Drop a Star
                </button>
              </div>

              {/* Theme customization - under login */}
              <div className="w-full pt-4 mt-2 border-t-2 theme-border space-y-3">
                <p className="text-[9px] theme-text-muted uppercase tracking-wider font-bold">
                  Theme
                </p>
                {/* Accent color */}
                <div className="space-y-1.5">
                  <p className="text-[8px] theme-text-muted uppercase tracking-widest">
                    Color
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {colors.map((color) => {
                      const cfg = themeConfig[color];
                      const isActive = themeColor === color;
                      return (
                        <button
                          key={color}
                          onClick={() => setThemeColor(color)}
                          className={`w-7 h-7 border-2 flex items-center justify-center transition-all active:translate-y-0.5 ${
                            isActive
                              ? "theme-border-strong ring-2 ring-[var(--theme-primary)]/40"
                              : "border-white/20 hover:border-white/40"
                          }`}
                          style={{
                            backgroundColor:
                              cfg.gradient[0] + (isActive ? "cc" : "66"),
                            boxShadow: isActive
                              ? `0 0 8px ${cfg.gradient[0]}60`
                              : "2px 2px 0 rgba(0,0,0,0.2)",
                          }}
                          title={color}
                        >
                          {isActive && (
                            <span className="text-white text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Background */}
                <div className="space-y-1.5">
                  <p className="text-[8px] theme-text-muted uppercase tracking-widest">
                    Background
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBackgroundVariant("floatingLines")}
                      className={`flex-1 border-2 py-2 px-3 text-[9px] font-bold uppercase tracking-wider transition-all ${
                        backgroundVariant === "floatingLines"
                          ? "theme-border-strong"
                          : "border-white/20 hover:border-white/40"
                      }`}
                      style={{
                        color: "var(--theme-text)",
                        background:
                          backgroundVariant === "floatingLines"
                            ? "linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 20%, transparent), transparent)"
                            : "rgba(255,255,255,0.05)",
                      }}
                    >
                      Lines
                    </button>
                    <button
                      onClick={() => setBackgroundVariant("pixelBlast")}
                      className={`flex-1 border-2 py-2 px-3 text-[9px] font-bold uppercase tracking-wider transition-all ${
                        backgroundVariant === "pixelBlast"
                          ? "theme-border-strong"
                          : "border-white/20 hover:border-white/40"
                      }`}
                      style={{
                        color: "var(--theme-text)",
                        background:
                          backgroundVariant === "pixelBlast"
                            ? "linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 20%, transparent), transparent)"
                            : "rgba(255,255,255,0.05)",
                      }}
                    >
                      Pixels
                    </button>
                  </div>
                </div>
                {/* Preview box - shows selected theme */}
                <div className="space-y-1.5">
                  <p className="text-[8px] theme-text-muted uppercase tracking-widest">
                    Preview
                  </p>
                  <div
                    className="relative w-full h-16 rounded border-2 overflow-hidden"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--theme-primary) 50%, transparent)",
                      background: "rgba(0,0,0,0.6)",
                    }}
                  >
                    <div className="absolute inset-0">
                      {backgroundVariant === "pixelBlast" ? (
                        <PixelBlast
                          variant="square"
                          pixelSize={4}
                          color={themeConfig[themeColor].gradient[0]}
                          patternScale={2}
                          patternDensity={1}
                          pixelSizeJitter={0}
                          enableRipples
                          rippleSpeed={0.4}
                          rippleThickness={0.12}
                          rippleIntensityScale={1.5}
                          liquid={false}
                          liquidStrength={0.12}
                          liquidRadius={1.2}
                          liquidWobbleSpeed={5}
                          speed={0.5}
                          edgeFade={0.25}
                          transparent
                        />
                      ) : (
                        <FloatingLines
                          enabledWaves={["top", "middle", "bottom"]}
                          lineCount={5}
                          lineDistance={5}
                          bendRadius={5}
                          bendStrength={-0.5}
                          interactive={false}
                          parallax={false}
                          linesGradient={[...themeConfig[themeColor].gradient]}
                        />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-1 left-1 text-[8px] font-bold uppercase tracking-wider text-white/90 drop-shadow-md">
                      {backgroundVariant === "floatingLines"
                        ? "Floating lines"
                        : "Pixel blast"}{" "}
                      · {themeColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Login enter animation */}
      <AnimatePresence>
        {isLoggingIn && (
          <motion.div
            key="login-enter"
            className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Split panels sliding in from sides */}
            <motion.div
              className="absolute inset-y-0 left-0 w-1/2 bg-black origin-left"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
            <motion.div
              className="absolute inset-y-0 right-0 w-1/2 bg-black origin-right"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
            {/* Center content - Entering */}
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10"
              style={{ fontFamily: "var(--font-ui)" }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.4,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <p
                className="text-sm sm:text-base uppercase tracking-[0.3em] font-bold"
                style={{ color: "var(--theme-primary)" }}
              >
                Entering
              </p>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2"
                    style={{ backgroundColor: "var(--theme-primary)" }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export { LandingComponent };
