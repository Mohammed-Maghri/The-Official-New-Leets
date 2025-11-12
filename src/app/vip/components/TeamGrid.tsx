"use client";
import React from "react";
import { motion } from "motion/react";
import { ResponseData } from "../vip.types";
import { GridConfig } from "../vip.constants";
import { TeamCard } from "./TeamCard";

interface TeamGridProps {
  filteredTeams: ResponseData[];
  getProjectName: (projectId: string) => string;
  getProjectDifficulty: (projectId: string) => number;
  getProjectDuration: (projectId: string) => string;
  handleTeamClick: (team: ResponseData) => void;
}

export const TeamGrid: React.FC<TeamGridProps> = ({
  filteredTeams,
  getProjectName,
  getProjectDifficulty,
  getProjectDuration,
  handleTeamClick,
}) => {
  if (filteredTeams.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="col-span-full text-center py-12 md:py-16"
      >
        <div className="bg-[#001226] backdrop-blur-xl border border-[#0070ef]/30 rounded-2xl p-8 md:p-12 max-w-lg mx-auto">
          <div className="text-6xl md:text-8xl mb-4 opacity-60 text-[#0070ef]">✕</div>
          <h3 className="text-xl md:text-2xl font-bold text-white font-Tektur mb-4">
            No Teams Found
          </h3>
          <p className="text-gray-300 font-Tektur text-sm md:text-base">
            Try adjusting your filters or search in a different campus.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={GridConfig.teams}>
      {filteredTeams.map((team, index) => (
        <TeamCard
          key={`${team.name}-${team.project_id}-${index}`}
          team={team}
          index={index}
          getProjectName={getProjectName}
          getProjectDifficulty={getProjectDifficulty}
          getProjectDuration={getProjectDuration}
          handleTeamClick={handleTeamClick}
        />
      ))}
    </div>
  );
};
