"use client";
import React from "react";

const ChromeDinosaur: React.FC = () => {
  return (
    <div
      className="relative flex items-end justify-center h-20"
      style={{ fontFamily: "var(--font-ui)", imageRendering: "pixelated" }}
    >
      <div className="relative animate-dino-bounce">
        {/* Chrome T-Rex - pixel art style */}
        <div className="relative w-12 h-14">
          {/* Tail */}
          <div className="absolute top-6 -left-2 w-4 h-2 bg-stone-500 border-2 border-stone-600" />
          {/* Back leg */}
          <div
            className="absolute bottom-0 left-2 w-2 h-5 bg-stone-500 border-2 border-stone-600 animate-dino-leg-back origin-top"
            style={{ boxShadow: "1px 1px 0 rgba(0,0,0,0.3)" }}
          />
          {/* Body */}
          <div className="absolute top-4 left-3 w-5 h-5 bg-stone-400 border-2 border-stone-500" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.3)" }} />
          {/* Belly */}
          <div className="absolute top-6 left-4 w-3 h-2 bg-stone-300 border border-stone-400" />
          {/* Front leg */}
          <div
            className="absolute bottom-0 left-6 w-2 h-4 bg-stone-500 border-2 border-stone-600 animate-dino-leg-front origin-top"
            style={{ boxShadow: "1px 1px 0 rgba(0,0,0,0.3)" }}
          />
          {/* Neck */}
          <div className="absolute top-2 left-5 w-2 h-3 bg-stone-400 border-2 border-stone-500" />
          {/* Head */}
          <div className="absolute -top-1 left-5 w-5 h-5 bg-stone-400 border-2 border-stone-500" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.3)" }} />
          {/* Eye white */}
          <div className="absolute top-1 left-7 w-2 h-2 bg-white border border-stone-500" />
          {/* Eye pupil */}
          <div className="absolute top-1.5 left-[30px] w-1 h-1 bg-black" />
          {/* Mouth */}
          <div className="absolute top-3 left-6 w-2 h-1 bg-stone-600" />
        </div>
      </div>
    </div>
  );
};

export { ChromeDinosaur };
