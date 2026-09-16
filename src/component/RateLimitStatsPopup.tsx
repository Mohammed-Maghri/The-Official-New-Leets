"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface RateLimitUser {
  identifier: string;
  count: number;
  blockCount: number;
  resetTime: number;
  lastBlockTime: number;
  updatedAt: string;
}

interface RateLimitStatsPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function RateLimitStatsPopup({ isVisible, onClose }: RateLimitStatsPopupProps) {
  const [users, setUsers] = useState<RateLimitUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"count" | "identifier">("count");

  useEffect(() => {
    if (isVisible) {
      fetchUsers();
      // Auto-refresh every 10 seconds
      const interval = setInterval(fetchUsers, 10000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/rate-limit-stats");
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      } else {
        setError(data.error || "Failed to fetch rate limit stats");
      }
    } catch {
      setError("Failed to fetch rate limit stats");
    } finally {
      setLoading(false);
    }
  };

  const sortedUsers = React.useMemo(() => {
    if (!users) return [];
    const sorted = [...users];
    if (sortBy === "count") {
      sorted.sort((a, b) => b.count - a.count);
    } else {
      sorted.sort((a, b) => a.identifier.localeCompare(b.identifier));
    }
    return sorted;
  }, [users, sortBy]);

  const formatTime = (timestamp: number) => {
    if (!timestamp || timestamp === 0) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getProgressPercent = (count: number) => {
    // Based on STRICT preset (30 req/min)
    const maxRequests = 30;
    return Math.min((count / maxRequests) * 100, 100);
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return " ";
    if (percent >= 70) return " ";
    if (percent >= 50) return " ";
    return " ";
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60  z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#ece9d8]  border-2 border-[#a0a6b0] rounded-2xl p-6 max-w-6xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#f5f3e9]   rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#151515] font-Tektur">
                  Rate Limit Monitor
                </h2>
                <p className="text-[#3e3d35] text-sm font-Tektur">
                  {users.length} active user{users.length !== 1 ? "s" : ""} tracked
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-[#e2dfd0] hover:bg-[#d6d2c2] border border-[#a0a6b0] rounded-lg flex items-center justify-center text-[#151515] transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSortBy("count")}
              className={`px-4 py-2 rounded-lg font-Tektur text-sm transition-colors ${
                sortBy === "count"
                  ? "bg-[#d9e5f5] text-[#151515]"
                  : "bg-[#f5f3e9] text-[#3e3d35] hover:bg-[#f5f3e9]"
              }`}
            >
              Sort by Count
            </button>
            <button
              onClick={() => setSortBy("identifier")}
              className={`px-4 py-2 rounded-lg font-Tektur text-sm transition-colors ${
                sortBy === "identifier"
                  ? "bg-[#d9e5f5] text-[#151515]"
                  : "bg-[#f5f3e9] text-[#3e3d35] hover:bg-[#f5f3e9]"
              }`}
            >
              Sort by Name
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {loading && users.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-[#a0a6b0] border-t-neutral-500 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="bg-[#d9e5f5] border border-[#a0a6b0] rounded-lg p-4 text-center">
                <p className="text-[#3e3d35] font-Tektur">{error}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="text-6xl">📭</div>
                <p className="text-[#3e3d35] font-Tektur text-lg">No active users</p>
                <p className="text-[#3e3d35] font-Tektur text-sm">Rate limit data will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedUsers.map((user, index) => {
                  const progress = getProgressPercent(user.count);
                  const progressColor = getProgressColor(progress);

                  return (
                    <motion.div
                      key={user.identifier}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="bg-[#f5f3e9] border border-[#a0a6b0] rounded-xl p-4 hover:border-[#a0a6b0] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#151515] font-Tektur font-semibold truncate">
                              {user.identifier.startsWith("ip:")
                                ? user.identifier
                                : user.identifier}
                            </span>
                            {user.blockCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-Tektur bg-[#d9e5f5] text-[#3e3d35] border border-[#a0a6b0]">
                                {user.blockCount} strike{user.blockCount > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <p className="text-[#3e3d35] text-xs font-Tektur">
                            Last activity: {new Date(user.updatedAt).toLocaleString()}
                          </p>
                        </div>

                        {/* Request Count */}
                        <div className="text-right">
                          <div className="bg-[#d9e5f5] border border-[#a0a6b0] rounded-lg px-3 py-1.5">
                            <p className="text-[#3e3d35] font-Tektur font-bold text-xl">
                              {user.count}
                            </p>
                            <p className="text-[#3e3d35] font-Tektur text-xs">
                              requests
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-Tektur text-[#3e3d35]">
                          <span>Usage</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-[#d6d2c2] rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full bg-[#f5f3e9] ${progressColor} rounded-full`}
                          />
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-[#e2dfd0] rounded px-2 py-1">
                          <span className="text-[#3e3d35] font-Tektur">Reset: </span>
                          <span className="text-[#3e3d35] font-Tektur">
                            {formatTime(user.resetTime)}
                          </span>
                        </div>
                        {user.lastBlockTime > 0 && (
                          <div className="bg-[#e2dfd0] rounded px-2 py-1">
                            <span className="text-[#3e3d35] font-Tektur">Last Block: </span>
                            <span className="text-[#3e3d35] font-Tektur">
                              {formatTime(user.lastBlockTime)}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-[#a0a6b0]">
            <div className="flex items-center justify-between text-sm text-[#3e3d35] font-Tektur">
              <div className="flex gap-4">
                <span>Auto-refreshes every 10s</span>
                <span className="text-[#3e3d35]">•</span>
                <span className="text-[#3e3d35]">0-50%: Safe</span>
                <span className="text-[#3e3d35]">50-70%: Warning</span>
                <span className="text-[#3e3d35]">70-90%: High</span>
                <span className="text-[#3e3d35]">90%+: Critical</span>
              </div>
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="px-4 py-2 bg-[#d9e5f5] hover:bg-[#d9e5f5] border border-[#a0a6b0] rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "Refresh Now"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
