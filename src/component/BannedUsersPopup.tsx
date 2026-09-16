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
        className="fixed inset-0 bg-black/60  z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#ece9d8]  border-2 border-[#a0a6b0] rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#f5f3e9]   rounded-full flex items-center justify-center">
                <span className="text-2xl">🚫</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#151515] font-Tektur">
                  Rate Limited Users
                </h2>
                <p className="text-[#3e3d35] text-sm font-Tektur">
                  {bannedUsers.length} user{bannedUsers.length !== 1 ? "s" : ""} currently banned
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

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {loading && bannedUsers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-[#a0a6b0] border-t-neutral-500 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="bg-[#d9e5f5] border border-[#a0a6b0] rounded-lg p-4 text-center">
                <p className="text-[#3e3d35] font-Tektur">{error}</p>
              </div>
            ) : bannedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="text-6xl">🎉</div>
                <p className="text-[#3e3d35] font-Tektur text-lg">No users are currently banned</p>
                <p className="text-[#3e3d35] font-Tektur text-sm">All users are behaving well!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bannedUsers.map((user, index) => (
                  <motion.div
                    key={user.identifier}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#f5f3e9] border border-[#a0a6b0] rounded-xl p-4 hover:border-[#a0a6b0] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[#151515] font-Tektur font-semibold truncate">
                            {user.identifier.startsWith("ip:")
                              ? user.identifier
                              : user.identifier}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-Tektur ${
                            user.blockCount === 1
                              ? "bg-[#d9e5f5] text-[#3e3d35] border border-[#a0a6b0]"
                              : user.blockCount === 2
                              ? "bg-[#d9e5f5] text-[#3e3d35] border border-[#a0a6b0]"
                              : "bg-[#d9e5f5] text-[#3e3d35] border border-[#a0a6b0]"
                          }`}>
                            Strike {user.blockCount}/3
                          </span>
                        </div>
                        <p className="text-[#3e3d35] text-sm font-Tektur">
                          Banned {new Date(user.lastBlockTime).toLocaleString()}
                        </p>
                      </div>

                      {/* Ban Duration */}
                      <div className="text-right">
                        <div className="bg-[#d9e5f5] border border-[#a0a6b0] rounded-lg px-3 py-2 mb-1">
                          <p className="text-[#3e3d35] font-Tektur font-bold text-lg">
                            {formatTime(user.remainingSeconds)}
                          </p>
                          <p className="text-[#3e3d35] font-Tektur text-xs">
                            remaining
                          </p>
                        </div>
                        <p className="text-[#3e3d35] text-xs font-Tektur">
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
          <div className="mt-6 pt-4 border-t border-[#a0a6b0]">
            <div className="flex items-center justify-between text-sm text-[#3e3d35] font-Tektur">
              <span>Auto-refreshes every 10 seconds</span>
              <button
                onClick={fetchBannedUsers}
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
