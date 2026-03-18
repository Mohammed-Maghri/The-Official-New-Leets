"use client";
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

export interface SplitTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: "chars" | "words";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  textAlign?: React.CSSProperties["textAlign"];
  onLetterAnimationComplete?: () => void;
}

/** Character/word split text animation - runs on mount (no ScrollTrigger) */
const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = "",
  style,
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  tag = "p",
  textAlign = "center",
  onLetterAnimationComplete,
}) => {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const [chars, setChars] = useState<string[]>([]);
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    if (splitType === "chars") {
      setChars(Array.from(text));
    } else {
      setWords(text.split(" "));
    }
  }, [text, splitType]);

  useEffect(() => {
    const container = containerRef.current;
    const hasContent = splitType === "chars" ? chars.length > 0 : words.length > 0;
    if (!container || !hasContent) return;

    const selector = splitType === "chars" ? ".split-char" : ".split-word";
    const elements = container.querySelectorAll(selector);
    if (!elements.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        { ...from },
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          onComplete: onLetterAnimationComplete,
          overwrite: "auto",
        }
      );
    }, container);

    return () => ctx.revert();
  }, [chars, words, splitType, delay, duration, ease, JSON.stringify(from), JSON.stringify(to), onLetterAnimationComplete]);

  const Tag = tag as React.ElementType;

  return (
    <Tag
      ref={containerRef}
      className={className}
      style={{
        textAlign,
        overflow: "hidden",
        display: "inline-block",
        fontFamily: "var(--font-ui)",
        ...style,
      }}
    >
      {splitType === "chars" &&
        chars.map((char, i) => (
          <span
            key={i}
            className="split-char inline-block"
            style={{ whiteSpace: char === " " ? "pre" : "normal" }}
          >
            {char}
          </span>
        ))}
      {splitType === "words" &&
        words.map((word, wi) => (
          <span key={wi} className="split-word inline-block mr-[0.25em]">
            {word}
          </span>
        ))}
    </Tag>
  );
};

export default SplitText;
