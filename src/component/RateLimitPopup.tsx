"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface RateLimitPopupProps {
  show: boolean;
  onClose: () => void;
  retryAfter?: number;
}

const RateLimitPopup: React.FC<RateLimitPopupProps> = ({ show, onClose, retryAfter }) => {
  const [countdown, setCountdown] = useState(retryAfter || 60);

  useEffect(() => {
    if (show && retryAfter) {
      setCountdown(retryAfter);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [show, retryAfter, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60  z-[100]"
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-md"
          >
            <div className="bg-[#ece9d8]  border-2 border-[#a0a6b0] rounded-2xl p-8 ">
              {/* Icon */}
              <motion.div
                initial={{ rotate: -10, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto mb-6 bg-[#f5f3e9]   rounded-full flex items-center justify-center"
              >
                <span className="text-4xl">😎</span>
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-[#151515] font-Tektur text-center mb-3">
                Take it easy bro!
              </h2>

              {/* Message */}
              <p className="text-[#3e3d35] font-Tektur text-center mb-6 leading-relaxed">
                You&apos;re making too many requests. Please slow down and try again in a moment.
              </p>

              {/* Countdown */}
              <div className="bg-[#f5f3e9] rounded-xl p-4 mb-6 border border-[#a0a6b0]">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-[#d9e5f5] rounded-full flex items-center justify-center">
                    <span className="text-2xl font-black text-[#151515] font-Tektur">
                      {countdown}
                    </span>
                  </div>
                  <span className="text-[#3e3d35] font-Tektur">seconds remaining</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#f5f3e9]     text-[#151515] font-Tektur font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RateLimitPopup;
