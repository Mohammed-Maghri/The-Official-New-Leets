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
      <div className="bg-gradient-to-br from-red-900/20 via-red-800/10 to-red-900/20 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 md:p-12 max-w-md md:max-w-lg text-center shadow-2xl">
        <motion.div
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-6xl md:text-8xl mb-6 opacity-80"
        >
          🚫
        </motion.div>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-red-300 font-Tektur mb-4"
        >
          {title}
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-gray-300 font-Tektur text-sm md:text-base leading-relaxed mb-8"
        >
          {message}
        </motion.p>
        
        {showRetry && onRetry && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            onClick={onRetry}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold font-Tektur rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl border border-red-500/50 transition-all duration-300 group text-sm md:text-base"
          >
            <div className="flex items-center justify-center gap-2">
              <span>Try Again</span>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                🔄
              </motion.div>
            </div>
          </motion.button>
        )}
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 md:mt-8"
        >
          <div className="bg-gradient-to-r from-gray-700/30 to-gray-600/30 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-500/30">
            <div className="text-gray-400 font-Tektur text-xs md:text-sm">
              💡 Need help? Contact your administrator
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
