"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

interface ReadingTextProps {
  text: string;
  onComplete?: () => void;
  delay?: number;
  charSpeed?: number;
  className?: string;
}

/** Animates text as if being read - characters reveal one by one, read part in color, unread muted */
const ReadingText: React.FC<ReadingTextProps> = ({
  text,
  onComplete,
  delay = 0,
  charSpeed = 35,
  className = "",
}) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    if (visibleCount >= text.length) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setVisibleCount((c) => Math.min(c + 1, text.length));
    }, charSpeed);

    return () => clearTimeout(timer);
  }, [hasStarted, visibleCount, text.length, charSpeed, onComplete]);

  return (
    <p className={`leading-relaxed ${className}`} style={{ fontFamily: "var(--font-ui)" }}>
      <span className="text-[var(--theme-primary)]">
        {text.slice(0, visibleCount)}
      </span>
      {visibleCount < text.length && (
        <>
          <motion.span
            className="inline-block w-0.5 h-4 bg-[var(--theme-primary)] ml-0.5 align-middle"
            animate={{ opacity: [1, 0.3] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          <span className="text-[var(--theme-text-muted)] opacity-50">
            {text.slice(visibleCount)}
          </span>
        </>
      )}
    </p>
  );
};

export { ReadingText };
