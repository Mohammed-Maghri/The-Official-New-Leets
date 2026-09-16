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
        return "bg-[#d9e5f5] border-[#a0a6b0]";
      case "Top Feedback":
        return "bg-[#d9e5f5] border-[#a0a6b0]";
      case "Helpful":
        return "bg-[#d9e5f5] border-[#a0a6b0]";
      case "Innovative":
        return "bg-[#d9e5f5] border-[#a0a6b0]";
      case "Critical Thinker":
        return "bg-[#d9e5f5] border-[#a0a6b0]";
      default:
        return "bg-[#d9e5f5] border-[#a0a6b0]";
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
          <div className={`${sizeClasses[size]} rounded-full bg-[#f5f3e9]   border-2 border-[#a0a6b0] flex items-center justify-center  animate-pulse`}>
            <FaCrown className={`${iconSizeClasses[size]} text-[#151515]`} />
          </div>
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#f5f3e9] text-[#151515] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-Tektur z-50 border border-[#a0a6b0]">
              Creator
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900"></div>
            </div>
          )}
        </div>
      )}

      {/* VIP Badge - Diamond */}
      {badgeData.vipStatus === "vip" && (
        <div className="relative group">
          <div className={`${sizeClasses[size]} rounded-full bg-[#f5f3e9]   border-2 border-[#a0a6b0] flex items-center justify-center `}>
            <BsDiamond className={`${iconSizeClasses[size]} text-[#151515]`} />
          </div>
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#f5f3e9] text-[#151515] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-Tektur z-50 border border-[#a0a6b0]">
              VIP Member
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900"></div>
            </div>
          )}
        </div>
      )}

      {/* Feedback Badges */}
      {badgeData.badges.map((badge, index) => (
        <div key={index} className="relative group">
          <div className={`${sizeClasses[size]} rounded-full ${getBadgeColor(badge)} border-2 flex items-center justify-center `}>
            <BsStars className={`${iconSizeClasses[size]} text-[#151515]`} />
          </div>
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#f5f3e9] text-[#151515] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-Tektur z-50 border border-[#a0a6b0]">
              {badge}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
