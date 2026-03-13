"use client";
import React, { useState, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { BsStars } from "react-icons/bs";
import FeedbackPopup from "@/component/dashboard/FeedbackPopup";
import { ContextCreator } from "@/component/context/context";

const GlobalFeedbackButton: React.FC = () => {
  const pathname = usePathname();
  const context = useContext(ContextCreator);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Don't show on landing page, canvas (tldrw), or database (tables)
    if (pathname === "/" || pathname === "/dashboard/canvas" || pathname === "/database") {
      setShowButton(false);
      return;
    }

    // Show button after a short delay to avoid flash on page load
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleCloseFeedbackPopup = () => {
    setShowFeedbackPopup(false);
    localStorage.setItem("hasSeenFeedbackPopup", "true");
  };

  const handleOpenFeedbackPopup = () => {
    setShowFeedbackPopup(true);
  };

  if (!showButton || !mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-40" aria-hidden="true">
      {/* Same code as Feedback Reviews button - left position (other side) */}
      {!showFeedbackPopup && (
        <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50" style={{ pointerEvents: "auto" }}>
          <button
            onClick={handleOpenFeedbackPopup}
            className="flex items-center gap-2 px-4 py-2 border-2 border-slate-600/60 bg-gray-950/98 text-center text-[9px] font-bold theme-text uppercase tracking-wider hover:border-slate-500/70 transition-all active:translate-y-0.5"
            style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
          >
            <BsStars className="w-4 h-4" />
            <span className="hidden sm:inline">Share Your Ideas</span>
            <span className="sm:hidden">Feedback</span>
          </button>
        </div>
      )}

      {/* Feedback Popup */}
      {showFeedbackPopup && (
        <div style={{ pointerEvents: "auto" }}>
          <FeedbackPopup 
            onClose={handleCloseFeedbackPopup} 
            username={context?.userData?.fullname || context?.userData?.login}
          />
        </div>
      )}
    </div>,
    document.body
  );
};

export default GlobalFeedbackButton;
