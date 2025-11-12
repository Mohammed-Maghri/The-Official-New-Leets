"use client";
import React from "react";
import { motion } from "motion/react";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  title = "Access Denied",
  message = "You don't have permission to view VIP teams. Please contact an administrator for access.",
  showRetry = true,
  onRetry,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center p-4 md:p-8"
    >
      <div className="bg-blue-950/30 backdrop-blur-xl border border-blue-800/50 rounded-2xl p-8 md:p-12 max-w-md md:max-w-lg text-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xl md:text-2xl text-blue-300 font-Tektur mb-4"
        >
          {title}
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-gray-300 font-Tektur text-sm md:text-base leading-relaxed mb-8"
        >
          {message}
        </motion.p>
        
        {showRetry && onRetry && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            onClick={onRetry}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 md:px-8 py-3 md:py-4 bg-blue-950/20 hover:bg-blue-950/30 text-blue-300 font-Tektur rounded-xl border border-blue-800/40 hover:border-blue-700/60 transition-all duration-300 text-sm md:text-base"
          >
            Try Again
          </motion.button>
        )}
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 md:mt-8"
        >
          <div className="bg-blue-950/20 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-blue-800/40">
            <div className="text-gray-400 font-Tektur text-xs md:text-sm">
              Need help? Contact your administrator
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
