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
    if (percent >= 90) return "from-red-500 to-red-600";
    if (percent >= 70) return "from-orange-500 to-orange-600";
    if (percent >= 50) return "from-yellow-500 to-yellow-600";
    return "from-green-500 to-green-600";
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-blue-950/95 backdrop-blur-xl border-2 border-blue-700/50 rounded-2xl p-6 max-w-6xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-Tektur">
                  Rate Limit Monitor
                </h2>
                <p className="text-gray-400 text-sm font-Tektur">
                  {users.length} active user{users.length !== 1 ? "s" : ""} tracked
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-blue-800/50 hover:bg-blue-700/50 border border-blue-600/30 rounded-lg flex items-center justify-center text-white transition-colors"
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
                  ? "bg-blue-600 text-white"
                  : "bg-blue-900/30 text-gray-400 hover:bg-blue-900/50"
              }`}
            >
              Sort by Count
            </button>
            <button
              onClick={() => setSortBy("identifier")}
              className={`px-4 py-2 rounded-lg font-Tektur text-sm transition-colors ${
                sortBy === "identifier"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-900/30 text-gray-400 hover:bg-blue-900/50"
              }`}
            >
              Sort by Name
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {loading && users.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                <p className="text-red-400 font-Tektur">{error}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="text-6xl">📭</div>
                <p className="text-gray-400 font-Tektur text-lg">No active users</p>
                <p className="text-gray-500 font-Tektur text-sm">Rate limit data will appear here</p>
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
                      className="bg-blue-900/30 border border-blue-700/30 rounded-xl p-4 hover:border-blue-600/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-Tektur font-semibold truncate">
                              {user.identifier.startsWith("ip:") 
                                ? user.identifier 
                                : `@${user.identifier}`}
                            </span>
                            {user.blockCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-Tektur bg-red-500/20 text-red-400 border border-red-500/30">
                                {user.blockCount} strike{user.blockCount > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs font-Tektur">
                            Last activity: {new Date(user.updatedAt).toLocaleString()}
                          </p>
                        </div>

                        {/* Request Count */}
                        <div className="text-right">
                          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1.5">
                            <p className="text-blue-400 font-Tektur font-bold text-xl">
                              {user.count}
                            </p>
                            <p className="text-blue-400/70 font-Tektur text-xs">
                              requests
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-Tektur text-gray-400">
                          <span>Usage</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full bg-gradient-to-r ${progressColor} rounded-full`}
                          />
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-800/30 rounded px-2 py-1">
                          <span className="text-gray-500 font-Tektur">Reset: </span>
                          <span className="text-gray-300 font-Tektur">
                            {formatTime(user.resetTime)}
                          </span>
                        </div>
                        {user.lastBlockTime > 0 && (
                          <div className="bg-gray-800/30 rounded px-2 py-1">
                            <span className="text-gray-500 font-Tektur">Last Block: </span>
                            <span className="text-gray-300 font-Tektur">
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
          <div className="mt-6 pt-4 border-t border-blue-700/30">
            <div className="flex items-center justify-between text-sm text-gray-400 font-Tektur">
              <div className="flex gap-4">
                <span>Auto-refreshes every 10s</span>
                <span className="text-gray-600">•</span>
                <span className="text-green-400">0-50%: Safe</span>
                <span className="text-yellow-400">50-70%: Warning</span>
                <span className="text-orange-400">70-90%: High</span>
                <span className="text-red-400">90%+: Critical</span>
              </div>
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 rounded-lg transition-colors disabled:opacity-50"
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
