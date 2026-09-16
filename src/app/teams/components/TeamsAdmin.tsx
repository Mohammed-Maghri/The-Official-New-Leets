import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRateLimitHandler } from "@/component/hooks/useRateLimitHandler";
import RateLimitPopup from "@/component/RateLimitPopup";

interface VipUser {
  id: number;
  category: string;
  login: string;
  created_at: string;
  updated_at: string;
}

interface VipAdminProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function VipAdmin({ isVisible, onClose }: VipAdminProps) {
  const [vipUsers, setVipUsers] = useState<VipUser[]>([]);
  const [newUserLogin, setNewUserLogin] = useState("");
  const [newUserCategory, setNewUserCategory] = useState("student");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const { rateLimitState, handleRateLimitResponse, closeRateLimitPopup } = useRateLimitHandler();

  useEffect(() => {
    if (isVisible) {
      fetchVipUsers();
    }
  }, [isVisible]);

  const fetchVipUsers = async () => {
    try {
      const response = await fetch("/api/teams");

      // Check for rate limiting
      const isRateLimited = await handleRateLimitResponse(response);
      if (isRateLimited) return;

      const data = await response.json();

      if (response.ok) {
        setVipUsers(data.users);
      } else {
        setMessage({ text: data.error, type: "error" });
      }
    } catch {
      setMessage({ text: "Failed to fetch VIP users", type: "error" });
    }
  };

  const addUser = async () => {
    if (!newUserLogin.trim()) {
      setMessage({ text: "Login is required", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: newUserLogin.trim(),
          category: newUserCategory,
        }),
      });

      // Check for rate limiting
      const isRateLimited = await handleRateLimitResponse(response);
      if (isRateLimited) {
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: "User added successfully!", type: "success" });
        setNewUserLogin("");
        setNewUserCategory("student");
        fetchVipUsers();
      } else {
        setMessage({ text: data.error, type: "error" });
      }
    } catch {
      setMessage({ text: "Failed to add user", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (login: string) => {
    if (!window.confirm(`Are you sure you want to remove ${login} from VIP?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/teams?login=${login}`, {
        method: "DELETE",
      });

      // Check for rate limiting
      const isRateLimited = await handleRateLimitResponse(response);
      if (isRateLimited) return;

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: "User removed successfully!", type: "success" });
        fetchVipUsers();
      } else {
        setMessage({ text: data.error, type: "error" });
      }
    } catch {
      setMessage({ text: "Failed to remove user", type: "error" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#ece9d8] border border-[#616161]/30 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#151515] flex items-center gap-3">
            VIP Admin Panel
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[#d6d2c2] hover:bg-[#d9e5f5] rounded-lg flex items-center justify-center text-[#3e3d35] hover:text-[#151515] transition-colors"
          >
            ✕
          </button>
        </div>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              message.type === "success"
                ? "bg-[#d9e5f5] border border-[#a0a6b0] text-[#3e3d35]"
                : "bg-[#d9e5f5] border border-[#a0a6b0] text-[#3e3d35]"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-6 p-4 bg-[#e2dfd0] rounded-xl border border-[#a0a6b0]">
          <h3 className="text-lg font-semibold text-[#151515] mb-4">
            Add New VIP User
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="User login (e.g., jdoe)"
              value={newUserLogin}
              onChange={(e) => setNewUserLogin(e.target.value)}
              className="flex-1 bg-[#d6d2c2] border border-[#a0a6b0] rounded-lg px-4 py-2 text-[#151515] placeholder-neutral-400 focus:outline-none focus:border-[#616161]"
            />
            <select
              value={newUserCategory}
              onChange={(e) => setNewUserCategory(e.target.value)}
              className="bg-[#d6d2c2] border border-[#a0a6b0] rounded-lg px-4 py-2 text-[#151515] focus:outline-none focus:border-[#616161]"
            >
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={addUser}
              disabled={loading}
              className="bg-[#ece9d8] hover:bg-[#ece9d8] disabled:opacity-50 px-6 py-2 rounded-lg text-[#151515] font-medium transition-all duration-200"
            >
              {loading ? "Adding..." : "Add User"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <h3 className="text-lg font-semibold text-[#151515] mb-4">
            Current VIP Users ({vipUsers.length})
          </h3>
          <div className="space-y-2">
            {vipUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#e2dfd0] border border-[#a0a6b0] rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      user.category === "admin"
                        ? "bg-[#d9e5f5]"
                        : user.category === "staff"
                        ? "bg-[#d9e5f5]"
                        : "bg-[#d9e5f5]"
                    }`}
                  ></div>
                  <div>
                    <div className="text-[#151515] font-medium">{user.login}</div>
                    <div className="text-[#3e3d35] text-sm">
                      {user.category} • Added {formatDate(user.created_at)}
                    </div>
                  </div>
                </div>
                {user.login !== "mmaghri" && (
                  <button
                    onClick={() => removeUser(user.login)}
                    className="bg-[#d9e5f5] hover:bg-[#d9e5f5] border border-[#a0a6b0] text-[#3e3d35] px-3 py-1 rounded-lg text-sm transition-colors"
                  >
                    Remove
                  </button>
                )}
              </motion.div>
            ))}
            {vipUsers.length === 0 && (
              <div className="text-center py-8 text-[#3e3d35]">
                No VIP users found
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Rate Limit Popup */}
      <RateLimitPopup
        show={rateLimitState.isRateLimited}
        onClose={closeRateLimitPopup}
        retryAfter={rateLimitState.retryAfter}
      />
    </motion.div>
  );
}
