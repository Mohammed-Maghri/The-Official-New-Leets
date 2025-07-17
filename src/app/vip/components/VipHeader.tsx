"use client";
import React from "react";
import { motion } from "motion/react";
import { FaCaretDown } from "react-icons/fa";
import { CampusType, ProjectFilterType, SpecificProjectFilterType } from "../vip.types";
import { CampusList, ProjectFilterOptions, AnimationConfig } from "../vip.constants";

interface VipHeaderProps {
  selectedCampus: CampusType;
  teamCount: number;
  onCampusChange: (campus: CampusType) => void;
  projectFilter: ProjectFilterType;
  specificProjectFilter: SpecificProjectFilterType;
  uniqueProjects: string[];
  allProjects: string[];
  onFiltersChange: (
    projectFilter: ProjectFilterType,
    specificProjectFilter: SpecificProjectFilterType
  ) => void;
}

export const VipHeader: React.FC<VipHeaderProps> = ({
  selectedCampus,
  teamCount,
  onCampusChange,
  projectFilter,
  specificProjectFilter,
  uniqueProjects,
  allProjects,
  onFiltersChange,
}) => {
  const [campusDropdownOpen, setCampusDropdownOpen] = React.useState<boolean>(false);
  const [projectFilterDropdownOpen, setProjectFilterDropdownOpen] = React.useState<boolean>(false);
  const [specificProjectDropdownOpen, setSpecificProjectDropdownOpen] = React.useState<boolean>(false);
  
  const campusRef = React.useRef<HTMLDivElement>(null);
  const campusTriggerRef = React.useRef<HTMLDivElement>(null);
  const projectFilterRef = React.useRef<HTMLDivElement>(null);
  const projectFilterTriggerRef = React.useRef<HTMLDivElement>(null);
  const specificProjectRef = React.useRef<HTMLDivElement>(null);
  const specificProjectTriggerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        campusRef.current &&
        !campusRef.current.contains(event.target as Node) &&
        campusTriggerRef.current &&
        !campusTriggerRef.current.contains(event.target as Node)
      ) {
        setCampusDropdownOpen(false);
      }
      
      if (
        projectFilterRef.current &&
        !projectFilterRef.current.contains(event.target as Node) &&
        projectFilterTriggerRef.current &&
        !projectFilterTriggerRef.current.contains(event.target as Node)
      ) {
        setProjectFilterDropdownOpen(false);
      }
      
      if (
        specificProjectRef.current &&
        !specificProjectRef.current.contains(event.target as Node) &&
        specificProjectTriggerRef.current &&
        !specificProjectTriggerRef.current.contains(event.target as Node)
      ) {
        setSpecificProjectDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProjectFilterChange = (newProjectFilter: ProjectFilterType) => {
    onFiltersChange(newProjectFilter, specificProjectFilter);
    setProjectFilterDropdownOpen(false);
  };

  const handleSpecificProjectFilterChange = (newSpecificProjectFilter: SpecificProjectFilterType) => {
    onFiltersChange(projectFilter, newSpecificProjectFilter);
    setSpecificProjectDropdownOpen(false);
  };

  const clearFilters = () => {
    onFiltersChange("all", "all");
  };

  return (
    <div className="flex flex-col space-y-4 md:space-y-6 mb-8 md:mb-10">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between space-y-4 xl:space-y-0">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-Tektur bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Teams & Projects
          </h1>
          <p className="text-base md:text-lg text-gray-300 font-Tektur opacity-80">
            The Ui is Shit Because It's Coocked By Ai Not me hhh No time For it
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row lg:flex-wrap xl:flex-nowrap items-start sm:items-center gap-2 md:gap-3">
          <div className="relative w-full sm:w-auto">
            <div
              ref={campusTriggerRef}
              onClick={() => setCampusDropdownOpen(!campusDropdownOpen)}
              className="flex items-center justify-between sm:justify-start space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-white/30 cursor-pointer hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
            >
              <div className="flex items-center space-x-2">
                <span className="text-base md:text-lg">📍</span>
                <span className="text-sm md:text-base font-semibold text-white font-Tektur">
                  {selectedCampus.name}
                </span>
              </div>
              <FaCaretDown 
                className={`text-white/80 transition-transform duration-300 text-xs ${
                  campusDropdownOpen ? "rotate-180" : ""
                }`} 
              />
            </div>
            
            {campusDropdownOpen && (
              <motion.div
                ref={campusRef}
                initial={AnimationConfig.dropdownInitial}
                animate={AnimationConfig.dropdownAnimate}
                exit={AnimationConfig.dropdownExit}
                className="absolute top-full left-0 mt-2 w-full sm:w-64 md:w-72 bg-gray-900/95 backdrop-blur-xl border border-white/30 rounded-lg shadow-2xl z-50 max-h-80 overflow-auto"
              >
                {CampusList.map((campus) => (
                  <div
                    key={campus.id}
                    onClick={() => {
                      onCampusChange(campus);
                      setCampusDropdownOpen(false);
                    }}
                    className={`px-4 py-3 text-sm font-Tektur cursor-pointer transition-all duration-300 border-l-4 ${
                      selectedCampus.id === campus.id
                        ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white border-l-blue-400"
                        : "text-gray-300 hover:bg-white/10 border-l-transparent hover:border-l-white/50"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base">📍</span>
                      <span className="font-semibold">{campus.name}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          <div className="relative w-full sm:w-auto">
            <div
              ref={projectFilterTriggerRef}
              onClick={() => setProjectFilterDropdownOpen(!projectFilterDropdownOpen)}
              className="flex items-center justify-between sm:justify-start space-x-2 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-white/30 cursor-pointer hover:from-indigo-500/30 hover:to-cyan-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
            >
              <div className="flex items-center space-x-2">
                <span className="text-base">🔍</span>
                <span className="text-sm md:text-sm font-semibold text-white font-Tektur">
                  {projectFilter === "all" ? "All Projects" : projectFilter === "known" ? "Known Projects" : "Unknown Projects"}
                </span>
              </div>
              <FaCaretDown 
                className={`text-white/80 transition-transform duration-300 text-xs ${
                  projectFilterDropdownOpen ? "rotate-180" : ""
                }`} 
              />
            </div>
            
            {projectFilterDropdownOpen && (
              <motion.div
                ref={projectFilterRef}
                initial={AnimationConfig.dropdownInitial}
                animate={AnimationConfig.dropdownAnimate}
                exit={AnimationConfig.dropdownExit}
                className="absolute top-full left-0 mt-2 w-full sm:w-48 md:w-56 bg-gray-900/95 backdrop-blur-xl border border-white/30 rounded-lg shadow-2xl z-50"
              >
                {ProjectFilterOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleProjectFilterChange(option.value as ProjectFilterType)}
                    className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-Tektur cursor-pointer transition-all duration-300 first:rounded-t-xl last:rounded-b-xl border-l-4 ${
                      projectFilter === option.value
                        ? option.activeClasses
                        : `text-gray-300 hover:bg-white/10 border-l-transparent ${option.hoverClasses}`
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{option.icon}</span>
                      <span className="font-semibold">{option.label}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          <div className="relative w-full sm:w-auto">
            <div
              ref={specificProjectTriggerRef}
              onClick={() => setSpecificProjectDropdownOpen(!specificProjectDropdownOpen)}
              className="flex items-center justify-between sm:justify-start space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-white/30 cursor-pointer hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <span className="text-base">📋</span>
                <span className="text-sm md:text-sm font-semibold text-white font-Tektur truncate">
                  {specificProjectFilter === "all" ? "All Project Names" : specificProjectFilter}
                </span>
              </div>
              <FaCaretDown 
                className={`text-white/80 transition-transform duration-300 text-xs flex-shrink-0 ${
                  specificProjectDropdownOpen ? "rotate-180" : ""
                }`} 
              />
            </div>
            
            {specificProjectDropdownOpen && (
              <motion.div
                ref={specificProjectRef}
                initial={AnimationConfig.dropdownInitial}
                animate={AnimationConfig.dropdownAnimate}
                exit={AnimationConfig.dropdownExit}
                className="absolute top-full left-0 mt-2 w-full sm:w-72 md:w-80 bg-gray-900/95 backdrop-blur-xl border border-white/30 rounded-lg shadow-2xl z-50 max-h-80 overflow-auto"
              >
                <div
                  onClick={() => handleSpecificProjectFilterChange("all")}
                  className={`px-4 py-3 text-sm font-Tektur cursor-pointer transition-all duration-300 border-l-4 rounded-t-xl ${
                    specificProjectFilter === "all"
                      ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border-l-purple-400"
                      : "text-gray-300 hover:bg-white/10 border-l-transparent hover:border-l-white/50"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-base">�</span>
                    <span className="font-semibold">All Projects</span>
                  </div>
                </div>
                
                <div className="border-t border-white/20 mx-3"></div>
                
                <div className="px-4 py-2 bg-blue-500/10">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400 text-sm">🔄</span>
                    <span className="text-xs font-bold text-blue-300 font-Tektur uppercase tracking-wider">
                      Current Teams ({uniqueProjects.length})
                    </span>
                  </div>
                </div>
                {uniqueProjects.map((projectName) => (
                  <div
                    key={`current-${projectName}`}
                    onClick={() => handleSpecificProjectFilterChange(projectName)}
                    className={`px-4 py-2 text-sm font-Tektur cursor-pointer transition-all duration-300 border-l-4 ${
                      specificProjectFilter === projectName
                        ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-white border-l-blue-400"
                        : "text-gray-300 hover:bg-white/5 border-l-transparent hover:border-l-blue-400/50"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">📋</span>
                      <span className="font-medium truncate">{projectName}</span>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-white/20 mx-3 my-1"></div>
                
                <div className="px-4 py-2 bg-emerald-500/10">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-400 text-sm">🗃️</span>
                    <span className="text-xs font-bold text-emerald-300 font-Tektur uppercase tracking-wider">
                      All Available ({allProjects.length})
                    </span>
                  </div>
                </div>
                {allProjects.slice(0, 20).map((projectName) => (
                  <div
                    key={`all-${projectName}`}
                    onClick={() => handleSpecificProjectFilterChange(projectName)}
                    className={`px-4 py-2 text-sm font-Tektur cursor-pointer transition-all duration-300 border-l-4 last:rounded-b-xl ${
                      specificProjectFilter === projectName
                        ? "bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-white border-l-emerald-400"
                        : "text-gray-300 hover:bg-white/5 border-l-transparent hover:border-l-emerald-400/50"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">📋</span>
                      <span className="font-medium truncate">{projectName}</span>
                    </div>
                  </div>
                ))}
                {allProjects.length > 20 && (
                  <div className="px-4 py-2 text-xs text-gray-400 font-Tektur text-center border-t border-white/10">
                    ... and {allProjects.length - 20} more projects
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {(projectFilter !== "all" || specificProjectFilter !== "all") && (
            <motion.button
              initial={AnimationConfig.buttonInitial}
              animate={AnimationConfig.buttonAnimate}
              exit={AnimationConfig.buttonExit}
              onClick={clearFilters}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-red-400/30 hover:from-red-500/30 hover:to-orange-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
            >
              <span className="text-sm md:text-base">🗑️</span>
              <span className="text-sm font-semibold text-red-300 font-Tektur">Clear</span>
            </motion.button>
          )}

          <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-white/30 shadow-lg w-full sm:w-auto">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className="text-base md:text-lg">📊</span>
              <span className="text-sm md:text-base font-bold text-white font-Tektur">
                {teamCount}
              </span>
              <span className="text-sm text-gray-300 font-Tektur">
                team{teamCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
