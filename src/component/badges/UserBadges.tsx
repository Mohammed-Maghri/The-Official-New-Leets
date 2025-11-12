"use client";
import React, { useState, useEffect } from "react";
import { BsStars, BsDiamond } from "react-icons/bs";
import { FaCrown } from "react-icons/fa";

interface UserBadgesProps {
  login?: string;
  vipStatus?: string | null;
  badges?: string[];
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

interface BadgeData {
  vipStatus: string | null;
  badges: string[];
}

export const UserBadges: React.FC<UserBadgesProps> = ({ 
  login,
  vipStatus: propVipStatus,
  badges: propBadges,
  size = "md",
  showTooltip = true 
}) => {
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [isLoading, setIsLoading] = useState(!propVipStatus && !propBadges);

  useEffect(() => {
    // If badges are provided as props, use them directly
    if (propVipStatus !== undefined || propBadges !== undefined) {
      setBadgeData({
        vipStatus: propVipStatus || null,
        badges: propBadges || []
      });
      setIsLoading(false);
    } else if (login) {
      // Otherwise fetch from API
      fetchBadges();
    }
  }, [login, propVipStatus, propBadges]);

  const fetchBadges = async () => {
    if (!login) return;
    
    try {
      const response = await fetch(`/api/user-badges?login=${login}`);
      if (response.ok) {
        const data = await response.json();
        setBadgeData(data);
      }
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case "Contributor":
        return "bg-emerald-500 border-emerald-400";
      case "Top Feedback":
        return "bg-yellow-500 border-yellow-400";
      case "Helpful":
        return "bg-blue-500 border-blue-400";
      case "Innovative":
        return "bg-purple-500 border-purple-400";
      case "Critical Thinker":
        return "bg-orange-500 border-orange-400";
      default:
        return "bg-gray-500 border-gray-400";
    }
  };

  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const iconSizeClasses = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  if (isLoading || !badgeData) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Creator Badge - Special Crown */}
      {badgeData.vipStatus === "creator" && (
        <div className="relative group">
          <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-yellow-300 flex items-center justify-center shadow-lg animate-pulse`}>
            <FaCrown className={`${iconSizeClasses[size]} text-white`} />
          </div>
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-Tektur z-50 border border-gray-700">
              Creator
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      )}

      {/* VIP Badge - Diamond */}
      {badgeData.vipStatus === "vip" && (
        <div className="relative group">
          <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-purple-400 flex items-center justify-center shadow-lg`}>
            <BsDiamond className={`${iconSizeClasses[size]} text-white`} />
          </div>
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-Tektur z-50 border border-gray-700">
              VIP Member
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      )}

      {/* Feedback Badges */}
      {badgeData.badges.map((badge, index) => (
        <div key={index} className="relative group">
          <div className={`${sizeClasses[size]} rounded-full ${getBadgeColor(badge)} border-2 flex items-center justify-center shadow-lg`}>
            <BsStars className={`${iconSizeClasses[size]} text-white`} />
          </div>
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-Tektur z-50 border border-gray-700">
              {badge}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
