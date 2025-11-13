"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface BannedUser {
  identifier: string;
  blockCount: number;
  banDuration: string;
  remainingSeconds: number;
  lastBlockTime: string;
  updatedAt: string;
}

interface BannedUsersPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function BannedUsersPopup({ isVisible, onClose }: BannedUsersPopupProps) {
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible) {
      fetchBannedUsers();
      // Auto-refresh every 10 seconds
      const interval = setInterval(fetchBannedUsers, 10000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const fetchBannedUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/rate-limit-bans");
      const data = await response.json();

      if (response.ok) {
        setBannedUsers(data.bannedUsers);
      } else {
        setError(data.error || "Failed to fetch banned users");
      }
    } catch {
      setError("Failed to fetch banned users");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
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
          className="bg-blue-950/95 backdrop-blur-xl border-2 border-blue-700/50 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚫</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-Tektur">
                  Rate Limited Users
                </h2>
                <p className="text-gray-400 text-sm font-Tektur">
                  {bannedUsers.length} user{bannedUsers.length !== 1 ? "s" : ""} currently banned
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

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {loading && bannedUsers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                <p className="text-red-400 font-Tektur">{error}</p>
              </div>
            ) : bannedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="text-6xl">🎉</div>
                <p className="text-gray-400 font-Tektur text-lg">No users are currently banned</p>
                <p className="text-gray-500 font-Tektur text-sm">All users are behaving well!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bannedUsers.map((user, index) => (
                  <motion.div
                    key={user.identifier}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-blue-900/30 border border-blue-700/30 rounded-xl p-4 hover:border-blue-600/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-Tektur font-semibold truncate">
                            {user.identifier.startsWith("ip:") 
                              ? user.identifier 
                              : `@${user.identifier}`}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-Tektur ${
                            user.blockCount === 1 
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : user.blockCount === 2
                              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}>
                            Strike {user.blockCount}/3
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm font-Tektur">
                          Banned {new Date(user.lastBlockTime).toLocaleString()}
                        </p>
                      </div>

                      {/* Ban Duration */}
                      <div className="text-right">
                        <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2 mb-1">
                          <p className="text-red-400 font-Tektur font-bold text-lg">
                            {formatTime(user.remainingSeconds)}
                          </p>
                          <p className="text-red-400/70 font-Tektur text-xs">
                            remaining
                          </p>
                        </div>
                        <p className="text-gray-500 text-xs font-Tektur">
                          {user.banDuration} ban
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-blue-700/30">
            <div className="flex items-center justify-between text-sm text-gray-400 font-Tektur">
              <span>Auto-refreshes every 10 seconds</span>
              <button
                onClick={fetchBannedUsers}
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
