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
        <div className="bg-[#ece9d8]  border border-[#616161]/30 rounded-2xl p-6 md:p-8 max-w-md mx-auto">
          <div className="text-4xl md:text-6xl mb-4 opacity-60 text-[#616161]">✓</div>
          <h3 className="text-lg md:text-xl font-bold text-[#151515] font-Tektur mb-2">
            That&apos;s All!
          </h3>
          <p className="text-[#3e3d35] font-Tektur text-sm md:text-base">
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
          bg-[#ece9d8]
          text-[#151515] font-bold font-Tektur rounded-xl md:rounded-2xl
            border border-[#a0a6b0] hover:border-[#616161]
          transition-all duration-300 group text-base md:text-lg
          ${isLoading ? 'cursor-not-allowed opacity-70' : 'hover:bg-[#ece9d8]'}
        `}
      >
        <div className="absolute inset-0 bg-[#dce8f8] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

        <div className="relative flex items-center justify-center gap-2 md:gap-3">
          {isLoading ? (
            <>
              <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-[#a0a6b0] border-t-white rounded-full animate-spin"></div>
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
