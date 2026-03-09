"use client";
import React, { FC, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IoHeadsetSharp } from "react-icons/io5";
import { ReadingText } from "./ReadingText";
import SplitText from "./SplitText";
import Noise from "./Noise";
import { useTheme, themeConfig, type ThemeColor } from "@/component/context/ThemeContext";
import FloatingLines from "./FloatingLines";
import PixelBlast from "./PixelBlast";
interface LandingComponentProps {
  onPlayMusic?: () => void;
}

const CHAPTER_NAMES = ["Chapter 1 — The Problem", "Chapter 2 — The Rebuild", "Chapter 3 — The New World"] as const;
const PROLOGUE_SEEN_KEY = "1337leets-prologue-seen";

const LandingComponent: FC<LandingComponentProps> = ({ onPlayMusic }) => {
  const [phase, setPhase] = useState<
    "welcome" | "headset" | "story" | "opening" | "preferences" | "content"
  >("welcome");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const hasSeenPrologue = localStorage.getItem(PROLOGUE_SEEN_KEY) === "true";
    if (isMobile || hasSeenPrologue) {
      setPhase("content");
    }
  }, []);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [storyLineIndex, setStoryLineIndex] = useState(0);
  const [introImageError, setIntroImageError] = useState(false);
  const [chapter2ImageError, setChapter2ImageError] = useState(false);
  const [chapter3ImageError, setChapter3ImageError] = useState(false);
  const [welcomeExiting, setWelcomeExiting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handlePlayMusic = () => {
    onPlayMusic?.();
    setWelcomeExiting(true);
    setTimeout(() => {
      setPhase("headset");
      setWelcomeExiting(false);
    }, 600);
  };

  const handleHeadsetReady = () => {
    setChapterIndex(0);
    setStoryLineIndex(0);
    setStoryLineReady(false);
    setIntroImageError(false);
    setChapter2ImageError(false);
    setChapter3ImageError(false);
    setPhase("story");
  };

  const [storyLineReady, setStoryLineReady] = useState(false);

  const handleStoryLineComplete = () => {
    setStoryLineReady(true);
  };

  const chapterLines: string[][] = [
    [
      "Each day I entered this website, something felt off. The rankings, profiles, and communities were there—but the vibe wasn't.",
      "Feedback came: outdated, old-school, doesn't feel alive. The first version had been vibe coded. Fast decisions, no structure. That limit was showing.",
      "So I opened the code. That's where the real story begins.",
    ],
    [
      "The platform needed identity, not just fixes. I rebuilt it piece by piece—leaderboard, profiles, communities.",
      "Sharp pixels. Retro UI. Game-like elements. The platform stopped feeling like a website. It started feeling like a game.",
    ],
    [
      "The new platform appears, pixel by pixel.",
      "Welcome to the new rankings.",
    ],
  ];

  const storyLines = chapterLines[chapterIndex] ?? [];
  const isLastLine = storyLineIndex >= storyLines.length - 1;
  const isLastChapter = chapterIndex >= chapterLines.length - 1;

  const handleStoryPageClick = () => {
    if (storyLineIndex < storyLines.length - 1) {
      setStoryLineReady(false);
      setStoryLineIndex((i) => i + 1);
    } else if (isLastChapter) {
      handleStoryComplete();
    } else {
      setChapterIndex((c) => c + 1);
      setStoryLineIndex(0);
      setStoryLineReady(false);
    }
  };

  const handleSkipToNextChapter = () => {
    if (isLastChapter) {
      handleStoryComplete();
    } else {
      setChapterIndex((c) => c + 1);
      setStoryLineIndex(0);
      setStoryLineReady(false);
    }
  };

  const handleStoryComplete = () => {
    setPhase("opening");
    setTimeout(() => setPhase("preferences"), 800);
  };

  const handleSkipPrologue = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(PROLOGUE_SEEN_KEY, "true");
    }
    setPhase("content");
  };

  const showSkipPrologue = phase === "welcome" || phase === "headset" || phase === "story";

  const handlePreferencesComplete = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(PROLOGUE_SEEN_KEY, "true");
    }
    setPhase("content");
  };

  const { themeColor, setThemeColor, backgroundVariant, setBackgroundVariant } = useTheme();
  const colors = (Object.keys(themeConfig) as ThemeColor[]).filter((c) => themeConfig[c]);

  const handleLogin = () => {
    setIsLoggingIn(true);
    setTimeout(() => {
      window.location.href = process.env.NEXT_PUBLIC_REDIRECT_URL as string;
    }, 1400);
  };

  const showContinueButton = storyLineReady && storyLines.length > 0;

  const chapterImages = ["/chapter_1.png", "/chapt_2.png", "/chapt_3.png"] as const;
  const currentChapterImage = chapterImages[chapterIndex];
  const currentImageError = chapterIndex === 0 ? introImageError : chapterIndex === 1 ? chapter2ImageError : chapter3ImageError;

  const showOverlay = phase === "welcome" || phase === "headset" || phase === "story" || phase === "preferences";

  return (
    <>
      {/* Solid black overlay - blocks site background until story is done */}
      {showOverlay && (
        <div className="fixed inset-0 z-[100] bg-black" aria-hidden="true" />
      )}

      {/* Skip Prologue - top left */}
      {showSkipPrologue && (
        <button
          onClick={handleSkipPrologue}
          className="fixed top-4 sm:top-6 left-4 sm:left-6 z-[102] px-3 py-2 text-[9px] font-bold uppercase tracking-wider border border-white/30 hover:border-white/50 transition-all"
          style={{ color: "var(--theme-text-muted)" }}
        >
          Skip Prologue
        </button>
      )}

      <AnimatePresence mode="wait">
        {/* Phase 1: Welcome + Play music button */}
        {phase === "welcome" && (
          <motion.div
            key="welcome"
            className="fixed inset-0 z-[101] flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 min-h-screen safe-area-insets"
            initial={{ opacity: 1 }}
            animate={{ opacity: welcomeExiting ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: welcomeExiting ? 0.5 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            {/* Background - dark gradient + film grain */}
            <div
              className="absolute inset-0 -z-10 overflow-hidden"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-950" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 12%, transparent) 0%, transparent 50%)`,
                }}
              />
              <div className="absolute inset-0 z-[1] pointer-events-none">
                <Noise
                  patternSize={250}
                  patternScaleX={2}
                  patternScaleY={2}
                  patternRefreshInterval={2}
                  patternAlpha={20}
                />
              </div>
            </div>

            {/* Decorative frame corners */}
            <div className="absolute top-4 sm:top-8 left-4 sm:left-8 w-10 h-10 sm:w-16 sm:h-16 border-l-2 border-t-2 opacity-30" style={{ borderColor: "var(--theme-primary)" }} />
            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 w-10 h-10 sm:w-16 sm:h-16 border-r-2 border-t-2 opacity-30" style={{ borderColor: "var(--theme-primary)" }} />
            <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 w-10 h-10 sm:w-16 sm:h-16 border-l-2 border-b-2 opacity-30" style={{ borderColor: "var(--theme-primary)" }} />
            <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 w-10 h-10 sm:w-16 sm:h-16 border-r-2 border-b-2 opacity-30" style={{ borderColor: "var(--theme-primary)" }} />

            {/* Chapter label */}
            <motion.span
              className="absolute top-6 sm:top-12 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-50"
              style={{ color: "var(--theme-text-muted)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Prologue
            </motion.span>

            {/* Main content block */}
            <div className="flex flex-col items-center gap-6 sm:gap-10 max-w-2xl w-full px-2">
              <SplitText
                text="Welcome to 1337 leets"
                tag="h1"
                className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-medium uppercase tracking-[0.1em] sm:tracking-[0.15em] text-center break-words"
                delay={50}
                duration={1.25}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                textAlign="center"
                onLetterAnimationComplete={() => {}}
                style={{
                  color: "color-mix(in srgb, var(--theme-text-muted) 90%, var(--theme-primary))",
                  textShadow: "0 0 40px color-mix(in srgb, var(--theme-primary) 20%, transparent)",
                }}
              />

              {/* Pixel divider */}
              <motion.div
                className="flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.4 }}
              >
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5"
                    style={{
                      background: i % 2 === 0 ? "var(--theme-primary)" : "var(--theme-primary-muted)",
                      opacity: 0.6,
                    }}
                  />
                ))}
              </motion.div>

              {/* Tagline */}
              <motion.p
                className="text-center text-xs sm:text-sm md:text-base tracking-[0.15em] sm:tracking-[0.2em] uppercase max-w-md px-2"
                style={{ color: "var(--theme-text-muted)", opacity: 0.8 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.8, y: 0 }}
                transition={{ delay: 2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                Elite school ranking, reimagined
              </motion.p>

              {/* Subtitle */}
              <motion.p
                className="text-center text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.3em] uppercase px-4"
                style={{ color: "var(--theme-text-muted)", opacity: 0.5 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 2.4, duration: 0.5 }}
              >
                A story about craft and identity
              </motion.p>
            </div>

            {/* Bottom CTA */}
            <div className="absolute bottom-8 sm:bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 sm:gap-4 w-full px-4">
              {/* Animation / background choice */}
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2, duration: 0.4 }}
              >
                <span className="text-[9px] theme-text-muted uppercase tracking-wider">Background:</span>
                <div className="flex gap-1 border border-white/20 p-0.5">
                  <button
                    onClick={() => setBackgroundVariant("floatingLines")}
                    className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all ${
                      backgroundVariant === "floatingLines"
                        ? "theme-bg-card theme-text"
                        : "text-white/50 hover:text-white/70"
                    }`}
                    style={{
                      boxShadow: backgroundVariant === "floatingLines" ? "2px 2px 0 rgba(0,0,0,0.3)" : "none",
                    }}
                  >
                    Lines
                  </button>
                  <button
                    onClick={() => setBackgroundVariant("pixelBlast")}
                    className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all ${
                      backgroundVariant === "pixelBlast"
                        ? "theme-bg-card theme-text"
                        : "text-white/50 hover:text-white/70"
                    }`}
                    style={{
                      boxShadow: backgroundVariant === "pixelBlast" ? "2px 2px 0 rgba(0,0,0,0.3)" : "none",
                    }}
                  >
                    Pixels
                  </button>
                </div>
              </motion.div>
              <motion.div
                className="h-px w-24 opacity-30"
                style={{ background: "linear-gradient(90deg, transparent, var(--theme-primary), transparent)" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 2.6, duration: 0.5 }}
              />
              <motion.button
                onClick={handlePlayMusic}
                disabled={welcomeExiting}
                className="border-2 py-3 px-6 sm:px-8 min-h-[44px]
                  text-xs sm:text-sm font-bold uppercase tracking-wider
                  transition-all duration-300
                  hover:scale-[1.02]
                  active:scale-[0.98]
                  disabled:opacity-50 disabled:pointer-events-none"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.8, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  color: "var(--theme-text)",
                  borderColor: "color-mix(in srgb, var(--theme-primary) 50%, transparent)",
                  background: "linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 20%, transparent), color-mix(in srgb, var(--theme-primary-dark) 25%, transparent))",
                  boxShadow: "0 0 20px color-mix(in srgb, var(--theme-primary) 15%, transparent), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                <span className="drop-shadow-[0_0_8px_var(--theme-primary)]">
                  ▶ Play music to continue
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Phase 2: Put on your headset */}
        {phase === "headset" && (
          <motion.div
            key="headset"
            className="fixed inset-0 z-[101] flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 min-h-screen safe-area-insets"
            style={{ fontFamily: "var(--font-pixel)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Background - dark gradient + film grain, gradient from bottom */}
            <div
              className="absolute inset-0 -z-10 overflow-hidden"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-950" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to top, color-mix(in srgb, var(--theme-primary) 12%, transparent) 0%, transparent 50%)`,
                }}
              />
              <div className="absolute inset-0 z-[1] pointer-events-none">
                <Noise
                  patternSize={250}
                  patternScaleX={2}
                  patternScaleY={2}
                  patternRefreshInterval={2}
                  patternAlpha={20}
                />
              </div>
            </div>

            {/* Decorative frame corners */}
            <div className="absolute top-4 sm:top-8 left-4 sm:left-8 w-10 h-10 sm:w-16 sm:h-16 border-l-2 border-t-2 opacity-30" style={{ borderColor: "var(--theme-primary)" }} />
            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 w-10 h-10 sm:w-16 sm:h-16 border-r-2 border-t-2 opacity-30" style={{ borderColor: "var(--theme-primary)" }} />
            <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 w-10 h-10 sm:w-16 sm:h-16 border-l-2 border-b-2 opacity-30" style={{ borderColor: "var(--theme-primary)" }} />
            <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 w-10 h-10 sm:w-16 sm:h-16 border-r-2 border-b-2 opacity-30" style={{ borderColor: "var(--theme-primary)" }} />

            {/* Chapter label */}
            <motion.span
              className="absolute top-6 sm:top-12 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-50"
              style={{ color: "var(--theme-text-muted)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Prologue
            </motion.span>

            {/* Main content block */}
            <div className="flex flex-col items-center gap-6 sm:gap-10 max-w-2xl w-full px-2">
              {/* Headset icon with animation */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  y: [0, -6, 0],
                  scale: 1,
                }}
                transition={{
                  opacity: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                  y: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  scale: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                }}
              >
                {/* Soft glow behind icon */}
                <motion.div
                  className="absolute inset-0 -m-8 rounded-full blur-2xl"
                  style={{
                    background: "color-mix(in srgb, var(--theme-primary) 25%, transparent)",
                  }}
                  animate={{
                    opacity: [0.4, 0.7, 0.4],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="relative"
                  style={{ color: "var(--theme-primary)" }}
                  animate={{
                    filter: [
                      "drop-shadow(0 0 12px color-mix(in srgb, var(--theme-primary) 40%, transparent))",
                      "drop-shadow(0 0 24px color-mix(in srgb, var(--theme-primary) 60%, transparent))",
                      "drop-shadow(0 0 12px color-mix(in srgb, var(--theme-primary) 40%, transparent))",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <IoHeadsetSharp className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
                </motion.div>
              </motion.div>

              <div className="max-w-lg text-center px-4">
                <ReadingText
                  text="Put on your headset for the best experience."
                  delay={0.4}
                  charSpeed={60}
                  className="text-lg sm:text-xl md:text-2xl uppercase tracking-wider"
                />
              </div>

              {/* Pixel divider */}
              <motion.div
                className="flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.4 }}
              >
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5"
                    style={{
                      background: i % 2 === 0 ? "var(--theme-primary)" : "var(--theme-primary-muted)",
                      opacity: 0.6,
                    }}
                  />
                ))}
              </motion.div>

              <motion.p
                className="text-center text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.3em] uppercase px-4"
                style={{ color: "var(--theme-text-muted)", opacity: 0.5 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 2, duration: 0.5 }}
              >
                Immersive audio experience
              </motion.p>
              <motion.p
                className="text-center text-[9px] sm:text-[10px] tracking-[0.25em] uppercase px-6 max-w-md"
                style={{ color: "var(--theme-primary)", opacity: 0.7 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 2.2, duration: 0.5 }}
              >
                Your choices will shape the story ahead.
              </motion.p>
            </div>

            {/* Bottom CTA */}
            <div className="absolute bottom-8 sm:bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 sm:gap-4 w-full px-4">
              <motion.div
                className="h-px w-24 opacity-30"
                style={{ background: "linear-gradient(90deg, transparent, var(--theme-primary), transparent)" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 2.2, duration: 0.5 }}
              />
              <motion.button
                onClick={handleHeadsetReady}
                className="border-2 py-3 px-6 sm:px-8 min-h-[44px]
                  text-xs sm:text-sm font-bold uppercase tracking-wider
                  transition-all duration-300
                  hover:scale-[1.02]
                  active:scale-[0.98]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  color: "var(--theme-text)",
                  borderColor: "color-mix(in srgb, var(--theme-primary) 50%, transparent)",
                  background: "linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 20%, transparent), color-mix(in srgb, var(--theme-primary-dark) 25%, transparent))",
                  boxShadow: "0 0 20px color-mix(in srgb, var(--theme-primary) 15%, transparent), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                <span className="drop-shadow-[0_0_8px_var(--theme-primary)]">
                  I&apos;m ready
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Phase 3: Story - storytelling with reading animation + image placeholders */}
        {phase === "story" && (
          <motion.div
            key="story"
            className="fixed inset-0 z-[101] overflow-hidden"
            style={{ fontFamily: "var(--font-pixel)" }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Rich background - same treatment as welcome/headset, slides in from top */}
            <motion.div
              className="absolute inset-0 overflow-hidden"
              aria-hidden="true"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-950" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 10%, transparent) 0%, transparent 40%, transparent 60%, color-mix(in srgb, var(--theme-primary) 8%, transparent) 100%)`,
                }}
              />
              <div className="absolute inset-0 z-[1] pointer-events-none">
                <Noise
                  patternSize={250}
                  patternScaleX={2}
                  patternScaleY={2}
                  patternRefreshInterval={2}
                  patternAlpha={25}
                />
              </div>
            </motion.div>

            {/* Decorative frame corners */}
            <div className="absolute top-4 sm:top-8 left-4 sm:left-8 w-10 h-10 sm:w-16 sm:h-16 border-l-2 border-t-2 opacity-30 z-20 pointer-events-none" style={{ borderColor: "var(--theme-primary)" }} />
            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 w-10 h-10 sm:w-16 sm:h-16 border-r-2 border-t-2 opacity-30 z-20 pointer-events-none" style={{ borderColor: "var(--theme-primary)" }} />
            <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 w-10 h-10 sm:w-16 sm:h-16 border-l-2 border-b-2 opacity-30 z-20 pointer-events-none" style={{ borderColor: "var(--theme-primary)" }} />
            <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 w-10 h-10 sm:w-16 sm:h-16 border-r-2 border-b-2 opacity-30 z-20 pointer-events-none" style={{ borderColor: "var(--theme-primary)" }} />

            {/* Skip to next chapter - right bottom */}
            <motion.button
              onClick={handleSkipToNextChapter}
              className="absolute bottom-4 sm:bottom-6 right-14 sm:right-20 z-50 px-3 py-2 text-[9px] font-bold uppercase tracking-wider border border-white/30 hover:border-white/50 transition-all"
              style={{ color: "var(--theme-text-muted)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Skip
            </motion.button>

            {/* Chapter label */}
            <motion.span
              key={`chapter-${chapterIndex}-${storyLineIndex}`}
              className="absolute top-6 sm:top-12 left-4 sm:left-8 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-50 z-20"
              style={{ color: "var(--theme-text-muted)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              {CHAPTER_NAMES[chapterIndex]}
            </motion.span>

            {/* Line progress indicator */}
            <div className="absolute top-6 sm:top-12 right-4 sm:right-8 flex gap-0.5 z-20" style={{ color: "var(--theme-text-muted)" }}>
              {Array.from({ length: storyLines.length }, (_, i) => i).map((i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 transition-opacity duration-300 ${i === storyLineIndex ? "opacity-100" : "opacity-30"}`}
                  style={{
                    background: i <= storyLineIndex ? "var(--theme-primary)" : "var(--theme-primary-muted)",
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 flex min-h-full flex-col items-center justify-center px-4 sm:px-8 md:px-12 py-8 sm:py-12 overflow-y-auto min-h-screen safe-area-insets">
              {/* Pixel divider - top */}
              <motion.div
                className="flex gap-1 mb-6 sm:mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5"
                    style={{
                      background: i % 2 === 0 ? "var(--theme-primary)" : "var(--theme-primary-muted)",
                      opacity: 0.5,
                    }}
                  />
                ))}
              </motion.div>

              {/* Image stays visible in all chapters */}
              <div className="flex flex-col gap-6 sm:gap-8 md:gap-12 items-center w-full max-w-4xl sm:flex-row">
                <div
                  className="flex-shrink-0 w-full max-w-[420px] h-48 sm:h-64 md:h-80 border-2 flex items-center justify-center overflow-hidden bg-black/50 sm:order-2"
                    style={{ borderColor: "color-mix(in srgb, var(--theme-primary) 40%, transparent)" }}
                  >
                    {currentChapterImage && !currentImageError ? (
                      <img
                        src={currentChapterImage}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={() => {
                          if (chapterIndex === 0) setIntroImageError(true);
                          else if (chapterIndex === 1) setChapter2ImageError(true);
                          else setChapter3ImageError(true);
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 opacity-60">
                        <div className="flex gap-1">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-2 h-2" style={{ background: "var(--theme-primary-muted)" }} />
                          ))}
                        </div>
                        <span className="text-[10px] theme-text-muted uppercase tracking-widest">
                          Add image
                        </span>
                      </div>
                    )}
                  </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${chapterIndex}-${storyLineIndex}`}
                    className="flex-1 min-w-0 flex flex-col gap-4 sm:order-1 text-left items-start"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ReadingText
                      text={storyLines[storyLineIndex] ?? ""}
                      onComplete={handleStoryLineComplete}
                      delay={0.3}
                      charSpeed={45}
                      className="theme-text text-sm sm:text-base md:text-lg leading-relaxed"
                    />
                    <motion.div
                      className="h-px w-16 opacity-40"
                      style={{
                        background: "linear-gradient(90deg, var(--theme-primary), transparent)",
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.8, duration: 0.4 }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Pixel divider - bottom */}
              <motion.div
                className="flex gap-1 mt-6 sm:mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5"
                    style={{
                      background: i % 2 === 0 ? "var(--theme-primary)" : "var(--theme-primary-muted)",
                      opacity: 0.5,
                    }}
                  />
                ))}
              </motion.div>

              {/* Continue / Response area */}
              <div className="mt-10 sm:mt-16 min-h-[180px] sm:min-h-[200px] w-full flex flex-col items-center justify-center">
              <AnimatePresence>
                {showContinueButton && (
                  <motion.div
                    key={`continue-${storyLineIndex}`}
                    className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-md px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.button
                      onClick={handleStoryPageClick}
                      className="border-2 py-3 px-8 min-h-[44px]
                        text-sm font-bold uppercase tracking-wider
                        transition-all duration-300
                        hover:scale-[1.02]
                        active:scale-[0.98]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      style={{
                        color: "var(--theme-text)",
                        borderColor: "color-mix(in srgb, var(--theme-primary) 50%, transparent)",
                        background: "linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 20%, transparent), color-mix(in srgb, var(--theme-primary-dark) 25%, transparent))",
                        boxShadow: "0 0 20px color-mix(in srgb, var(--theme-primary) 15%, transparent)",
                      }}
                    >
                      {isLastLine
                        ? isLastChapter
                          ? "Enter"
                          : `Continue to Chapter ${chapterIndex + 2}`
                        : "Continue"}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>

            </div>
          </motion.div>
        )}

        {/* Phase 4: Opening panels */}
        {phase === "opening" && (
          <motion.div
            key="opening"
            className="fixed inset-0 z-[101] flex overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 w-1/2 bg-black origin-left"
              initial={{ x: 0 }}
              animate={{ x: "-100%" }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
            <motion.div
              className="absolute inset-y-0 right-0 w-1/2 bg-black origin-right"
              initial={{ x: 0 }}
              animate={{ x: "100%" }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </motion.div>
        )}

        {/* Phase 5: Preferences - color & background */}
        {phase === "preferences" && (
          <motion.div
            key="preferences"
            className="fixed inset-0 z-[101] flex flex-col items-center justify-center px-4 sm:px-6 py-8 min-h-screen safe-area-insets"
            style={{ fontFamily: "var(--font-pixel)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-950" />
            <div className="absolute inset-0 z-[1] pointer-events-none">
              <Noise patternSize={250} patternScaleX={2} patternScaleY={2} patternRefreshInterval={2} patternAlpha={20} />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8 sm:gap-10 max-w-2xl w-full">
              <motion.h2
                className="text-lg sm:text-xl uppercase tracking-[0.2em] theme-text font-bold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Customize your experience
              </motion.h2>

              {/* Accent color */}
              <motion.div
                className="w-full max-w-md space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-[10px] theme-text-muted uppercase tracking-wider">Accent color</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {colors.map((color) => {
                    const cfg = themeConfig[color];
                    const isActive = themeColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setThemeColor(color)}
                        className={`w-9 h-9 border-2 flex items-center justify-center transition-all active:translate-y-0.5 ${
                          isActive ? "theme-border-strong ring-2 ring-[var(--theme-primary)]/40" : "border-white/20 hover:border-white/40"
                        }`}
                        style={{
                          backgroundColor: cfg.gradient[0] + (isActive ? "cc" : "66"),
                          boxShadow: isActive ? `0 0 12px ${cfg.gradient[0]}60` : "2px 2px 0 rgba(0,0,0,0.2)",
                        }}
                        title={color}
                      >
                        {isActive && <span className="text-white text-sm font-bold drop-shadow-md">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Background option with live preview */}
              <motion.div
                className="w-full max-w-md space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-[10px] theme-text-muted uppercase tracking-wider">Background</p>
                {/* Live preview - shows selected background with current accent color */}
                <div
                  className="relative w-full h-24 sm:h-28 rounded border-2 overflow-hidden"
                  style={{
                    borderColor: "color-mix(in srgb, var(--theme-primary) 50%, transparent)",
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-wider text-white/90 drop-shadow-md">
                    {backgroundVariant === "floatingLines" ? "Floating lines" : "Pixel blast"}
                  </span>
                </div>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button
                    onClick={() => setBackgroundVariant("floatingLines")}
                    className={`border-2 py-3 px-5 sm:px-6 min-h-[44px] text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex-1 min-w-[140px] ${
                      backgroundVariant === "floatingLines" ? "theme-border-strong" : "border-white/20 hover:border-white/40"
                    }`}
                    style={{
                      color: "var(--theme-text)",
                      background:
                        backgroundVariant === "floatingLines"
                          ? "linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 20%, transparent), color-mix(in srgb, var(--theme-primary-dark) 25%, transparent))"
                          : "rgba(255,255,255,0.05)",
                      boxShadow: backgroundVariant === "floatingLines" ? "0 0 0 2px var(--theme-primary)" : "2px 2px 0 rgba(0,0,0,0.2)",
                    }}
                  >
                    <span className="block text-xs font-bold uppercase tracking-wider">Floating lines</span>
                    <span className="block text-[10px] theme-text-muted mt-0.5">Smooth gradients</span>
                  </button>
                  <button
                    onClick={() => setBackgroundVariant("pixelBlast")}
                    className={`border-2 py-3 px-5 sm:px-6 min-h-[44px] text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex-1 min-w-[140px] ${
                      backgroundVariant === "pixelBlast" ? "theme-border-strong" : "border-white/20 hover:border-white/40"
                    }`}
                    style={{
                      color: "var(--theme-text)",
                      background:
                        backgroundVariant === "pixelBlast"
                          ? "linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 20%, transparent), color-mix(in srgb, var(--theme-primary-dark) 25%, transparent))"
                          : "rgba(255,255,255,0.05)",
                      boxShadow: backgroundVariant === "pixelBlast" ? "0 0 0 2px var(--theme-primary)" : "2px 2px 0 rgba(0,0,0,0.2)",
                    }}
                  >
                    <span className="block text-xs font-bold uppercase tracking-wider">Pixel blast</span>
                    <span className="block text-[10px] theme-text-muted mt-0.5">Retro dithering</span>
                  </button>
                </div>
              </motion.div>

              <motion.button
                onClick={handlePreferencesComplete}
                className="border-2 py-3 px-8 min-h-[44px] text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  color: "var(--theme-text)",
                  borderColor: "color-mix(in srgb, var(--theme-primary) 50%, transparent)",
                  background:
                    "linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 20%, transparent), color-mix(in srgb, var(--theme-primary-dark) 25%, transparent))",
                  boxShadow: "0 0 20px color-mix(in srgb, var(--theme-primary) 15%, transparent)",
                }}
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        className="flex min-h-[80vh] sm:min-h-[85vh] flex-col items-center justify-center px-4 sm:px-6 py-8"
        style={{ fontFamily: "var(--font-pixel)", imageRendering: "pixelated" }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === "content" ? 1 : 0,
        }}
        transition={{
          duration: 0.6,
          delay: phase === "content" ? 0.2 : 0,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <motion.div
          className="relative z-20 group w-full max-w-[360px] min-w-0"
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{
            opacity: phase === "content" ? 1 : 0,
            scale: phase === "content" ? 1 : 0.9,
            y: phase === "content" ? 0 : 24,
          }}
          transition={{
            duration: 0.6,
            delay: phase === "content" ? 0.3 : 0,
            ease: [0.16, 1, 0.3, 1],
          }}
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
            <div className="relative border-2 theme-border bg-gradient-to-b from-gray-900/98 to-gray-950/98 p-6 sm:p-8 flex flex-col items-center gap-5 min-w-[320px] sm:min-w-[360px]">
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
                  ▶ Login to Platform
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
                      "_blank"
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
                <p className="text-[9px] theme-text-muted uppercase tracking-wider font-bold">Theme</p>
                {/* Accent color */}
                <div className="space-y-1.5">
                  <p className="text-[8px] theme-text-muted uppercase tracking-widest">Color</p>
                  <div className="flex flex-wrap gap-1.5">
                    {colors.map((color) => {
                      const cfg = themeConfig[color];
                      const isActive = themeColor === color;
                      return (
                        <button
                          key={color}
                          onClick={() => setThemeColor(color)}
                          className={`w-7 h-7 border-2 flex items-center justify-center transition-all active:translate-y-0.5 ${
                            isActive ? "theme-border-strong ring-2 ring-[var(--theme-primary)]/40" : "border-white/20 hover:border-white/40"
                          }`}
                          style={{
                            backgroundColor: cfg.gradient[0] + (isActive ? "cc" : "66"),
                            boxShadow: isActive ? `0 0 8px ${cfg.gradient[0]}60` : "2px 2px 0 rgba(0,0,0,0.2)",
                          }}
                          title={color}
                        >
                          {isActive && <span className="text-white text-xs font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Background */}
                <div className="space-y-1.5">
                  <p className="text-[8px] theme-text-muted uppercase tracking-widest">Background</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBackgroundVariant("floatingLines")}
                      className={`flex-1 border-2 py-2 px-3 text-[9px] font-bold uppercase tracking-wider transition-all ${
                        backgroundVariant === "floatingLines" ? "theme-border-strong" : "border-white/20 hover:border-white/40"
                      }`}
                      style={{
                        color: "var(--theme-text)",
                        background: backgroundVariant === "floatingLines"
                          ? "linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 20%, transparent), transparent)"
                          : "rgba(255,255,255,0.05)",
                      }}
                    >
                      Lines
                    </button>
                    <button
                      onClick={() => setBackgroundVariant("pixelBlast")}
                      className={`flex-1 border-2 py-2 px-3 text-[9px] font-bold uppercase tracking-wider transition-all ${
                        backgroundVariant === "pixelBlast" ? "theme-border-strong" : "border-white/20 hover:border-white/40"
                      }`}
                      style={{
                        color: "var(--theme-text)",
                        background: backgroundVariant === "pixelBlast"
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
                  <p className="text-[8px] theme-text-muted uppercase tracking-widest">Preview</p>
                  <div
                    className="relative w-full h-16 rounded border-2 overflow-hidden"
                    style={{
                      borderColor: "color-mix(in srgb, var(--theme-primary) 50%, transparent)",
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
                      {backgroundVariant === "floatingLines" ? "Floating lines" : "Pixel blast"} · {themeColor}
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
              style={{ fontFamily: "var(--font-pixel)" }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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
