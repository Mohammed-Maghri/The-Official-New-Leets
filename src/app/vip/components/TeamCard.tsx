"use client";
import React from "react";
import { motion } from "motion/react";
import { ResponseData } from "../vip.types";
import { AnimationConfig } from "../vip.constants";
import { UserBadges } from "@/component/badges/UserBadges";

interface TeamCardProps {
  team: ResponseData;
  index: number;
  getProjectName: (projectId: string) => string;
  getProjectDifficulty: (projectId: string) => number;
  getProjectDuration: (projectId: string) => string;
  handleTeamClick: (team: ResponseData) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  index,
  getProjectName,
  getProjectDifficulty,
  getProjectDuration,
  handleTeamClick,
}) => {
  // Calculate relative date
  const getRelativeDate = (dateString: string | null) => {
    if (!dateString) return "Not Closed";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays === 2) return "2 days ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * AnimationConfig.cardStagger, 
        duration: AnimationConfig.cardDuration 
      }}
      onClick={() => handleTeamClick(team)}
      className="bg-[#001226]/80 backdrop-blur-xl border border-[#0070ef]/30 rounded-lg p-4 md:p-6 hover:border-[#0070ef]/50 transition-all duration-300 shadow-xl hover:shadow-2xl cursor-pointer relative group"
    >
      <div className="absolute top-2 md:top-3 right-2 md:right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="bg-[#0070ef]/20 text-gray-300 px-2 md:px-3 py-1 rounded-md text-xs font-medium font-Tektur border border-[#0070ef]/40">
          View Profile
        </div>
      </div>

      <div className="flex items-start justify-between mb-3 md:mb-4 relative z-10">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-semibold text-white font-Tektur mb-2 truncate">
            {team.name}
          </h3>
          <div className="flex flex-col space-y-2 text-sm">
            <div className="text-gray-100 font-Tektur font-medium truncate">
              {getProjectName(team.project_id)}
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-400 font-Tektur text-xs">
                ID: {team.project_id}
              </span>
              {getProjectDifficulty(team.project_id) > 0 && (
                <span className="text-gray-300 font-Tektur text-xs bg-[#0070ef]/20 px-2 py-1 rounded-md border border-[#0070ef]/30 whitespace-nowrap">
                  {getProjectDifficulty(team.project_id)} pts
                </span>
              )}
              <div
                className={`px-2 md:px-3 py-1 rounded-md text-xs font-medium font-Tektur whitespace-nowrap ${
                  team.status === "finished"
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : team.status === "in_progress"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                }`}
              >
                {team.status.replace("_", " ").toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {team.locked && (
          <div className="bg-red-500/20 text-red-300 px-2 md:px-3 py-1 rounded-md text-xs font-medium font-Tektur border border-red-500/30 ml-2 whitespace-nowrap">
            LOCKED
          </div>
        )}
      </div>

      <div className="mb-3 md:mb-4 relative z-10">
        <h4 className="text-sm font-medium text-gray-200 font-Tektur mb-3">
          Team Members:
        </h4>
        <div className="flex flex-wrap gap-2">
          {team.users.map((user, userIndex) => (
            <div
              key={userIndex}
              className={`flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-md text-xs font-medium font-Tektur border truncate max-w-full ${
                user.leader
                  ? "bg-[#0070ef]/30 text-white border-[#0070ef]/50"
                  : "bg-gray-700/50 text-gray-300 border-gray-600/50"
              }`}
            >
              <span>
                {user.leader && "★ "}
                {user.login}
              </span>
              <UserBadges 
                vipStatus={user.vip_status} 
                badges={user.badges} 
                size="sm" 
                showTooltip={true} 
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:gap-3 text-sm relative z-10">
        <div className="bg-[#0070ef]/10 backdrop-blur-sm rounded-md p-2 md:p-3 border border-[#0070ef]/20">
          <div className="text-gray-300 font-Tektur text-xs mb-1">
            Project Info
          </div>
          <div className="text-gray-100 font-Tektur font-medium">
            {getProjectDuration(team.project_id) && (
              <div className="text-xs text-gray-400 mb-1">
                Duration: {getProjectDuration(team.project_id)}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#0070ef]/10 backdrop-blur-sm rounded-md p-2 md:p-3 border border-[#0070ef]/20">
          <div className="text-gray-300 font-Tektur text-xs mb-1">
            Final Mark
          </div>
          <div
            className={`font-bold font-Tektur ${
              team.final_mark === null
                ? "text-gray-400"
                : team.final_mark >= 80
                ? "text-green-300"
                : team.final_mark >= 60
                ? "text-yellow-300"
                : "text-red-300"
            }`}
          >
            {team.final_mark ?? "Not Graded"}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/20">
          <div className="text-gray-200 font-Tektur text-xs mb-1">
            Validation
          </div>
          <div
            className={`font-medium font-Tektur ${
              team.validated === "true"
                ? "text-green-300"
                : team.validated === "false"
                ? "text-red-300"
                : "text-gray-400"
            }`}
          >
            {team.validated === "true"
              ? "✅ Validated"
              : team.validated === "false"
              ? "❌ Not Validated"
              : "⏳ Pending"}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/20">
          <div className="text-gray-200 font-Tektur text-xs mb-1">
            Closed At
          </div>
          <div className="font-medium text-gray-100 font-Tektur text-xs md:text-sm">
            {getRelativeDate(team.closed_at)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
