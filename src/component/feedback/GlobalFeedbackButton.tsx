"use client";
import React, { useState, useEffect, useContext } from "react";
import { usePathname } from "next/navigation";
import { IoRocketOutline } from "react-icons/io5";
import FeedbackPopup from "@/component/dashboard/FeedbackPopup";
import { ContextCreator } from "@/component/context/context";

const GlobalFeedbackButton: React.FC = () => {
  const pathname = usePathname();
  const context = useContext(ContextCreator);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Don't show on landing page
    if (pathname === "/") {
      setShowButton(false);
      return;
    }

    // Show button after a short delay to avoid flash on page load
    const timer = setTimeout(() => {
      const hasSeenFeedback = localStorage.getItem("hasSeenFeedbackPopup");
      setShowButton(true);
      
      // Auto-show popup on first visit
      if (!hasSeenFeedback) {
        setShowFeedbackPopup(true);
      }
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

  if (!showButton) return null;

  return (
    <>
      {/* Floating Feedback Button */}
      {!showFeedbackPopup && (
        <button
          onClick={handleOpenFeedbackPopup}
          className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 group"
          aria-label="Share feedback and ideas"
        >
          <div className="relative">
            {/* Pulsing rings */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg sm:blur-xl opacity-50 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-20"></div>
            
            {/* Main button */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 p-3 sm:p-4 rounded-full shadow-2xl transition-all duration-300 group-hover:scale-110">
              <IoRocketOutline className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          
          {/* Tooltip - Hidden on mobile */}
          <div className="hidden sm:block absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-xl">
            <p className="text-white font-Tektur text-sm font-medium">Share Your Ideas 💡</p>
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900"></div>
          </div>
        </button>
      )}

      {/* Feedback Popup */}
      {showFeedbackPopup && (
        <FeedbackPopup 
          onClose={handleCloseFeedbackPopup} 
          username={context?.userData?.fullname || context?.userData?.login}
        />
      )}
    </>
  );
};

export default GlobalFeedbackButton;
