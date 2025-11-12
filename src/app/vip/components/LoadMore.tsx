"use client";
import React from "react";
import { motion } from "motion/react";

interface LoadMoreProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export const LoadMore: React.FC<LoadMoreProps> = ({
  hasMore,
  isLoading,
  onLoadMore,
}) => {
  if (!hasMore) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 md:py-12"
      >
        <div className="bg-[#001226] backdrop-blur-xl border border-[#0070ef]/30 rounded-2xl p-6 md:p-8 max-w-md mx-auto">
          <div className="text-4xl md:text-6xl mb-4 opacity-60 text-[#0070ef]">✓</div>
          <h3 className="text-lg md:text-xl font-bold text-white font-Tektur mb-2">
            That&apos;s All!
          </h3>
          <p className="text-gray-300 font-Tektur text-sm md:text-base">
            You&apos;ve reached the end of the team list.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-8 md:py-12"
    >
      <motion.button
        onClick={onLoadMore}
        disabled={isLoading}
        whileHover={!isLoading ? { scale: 1.05, y: -2 } : {}}
        whileTap={!isLoading ? { scale: 0.95 } : {}}
        className={`
          relative overflow-hidden px-8 md:px-12 py-3 md:py-4 
          bg-[#0070ef]
          text-white font-bold font-Tektur rounded-xl md:rounded-2xl 
          shadow-lg hover:shadow-2xl border border-[#0070ef]/50 
          transition-all duration-300 group text-base md:text-lg
          ${isLoading ? 'cursor-not-allowed opacity-70' : 'hover:bg-[#0070ef]/80'}
        `}
      >
        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        
        <div className="relative flex items-center justify-center gap-2 md:gap-3">
          {isLoading ? (
            <>
              <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Loading Teams...</span>
            </>
          ) : (
            <>
              <span>Load More Teams</span>
            </>
          )}
        </div>
      </motion.button>
    </motion.div>
  );
};
