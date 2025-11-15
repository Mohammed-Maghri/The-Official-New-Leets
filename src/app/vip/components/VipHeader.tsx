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
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateFilter: "all" | "today" | "yesterday" | "2days";
  onDateFilterChange: (filter: "all" | "today" | "yesterday" | "2days") => void;
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
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
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
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-Tektur text-white">
              Teams & Projects
            </h1>
          </div>
          
          {/* Search Input */}
          <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:mx-6">
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#0070ef]/10 backdrop-blur-sm border border-[#0070ef]/30 text-white placeholder-gray-400 font-Tektur focus:outline-none focus:border-[#0070ef] transition-all duration-300"
            />
          </div>

          {/* Date Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => onDateFilterChange("today")}
              className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg border font-Tektur text-sm font-semibold backdrop-blur-sm transition-all duration-300 ${
                dateFilter === "today"
                  ? "bg-[#0070ef]/20 border-[#0070ef] text-white"
                  : "bg-[#0070ef]/10 border-[#0070ef]/30 text-white/80 hover:bg-[#0070ef]/20"
              }`}
            >
              Today
            </button>
            <button 
              onClick={() => onDateFilterChange("yesterday")}
              className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg border font-Tektur text-sm font-semibold backdrop-blur-sm transition-all duration-300 ${
                dateFilter === "yesterday"
                  ? "bg-[#0070ef]/20 border-[#0070ef] text-white"
                  : "bg-[#0070ef]/10 border-[#0070ef]/30 text-white/80 hover:bg-[#0070ef]/20"
              }`}
            >
              Yesterday
            </button>
            <button 
              onClick={() => onDateFilterChange("2days")}
              className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg border font-Tektur text-sm font-semibold backdrop-blur-sm transition-all duration-300 ${
                dateFilter === "2days"
                  ? "bg-[#0070ef]/20 border-[#0070ef] text-white"
                  : "bg-[#0070ef]/10 border-[#0070ef]/30 text-white/80 hover:bg-[#0070ef]/20"
              }`}
            >
              2 Days Ago
            </button>
            {dateFilter !== "all" && (
              <button 
                onClick={() => onDateFilterChange("all")}
                className="px-3 py-2 md:px-4 md:py-2.5 rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-300 font-Tektur text-sm font-semibold hover:bg-red-500/30 transition-all duration-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row lg:flex-wrap xl:flex-nowrap items-start sm:items-center gap-2 md:gap-3">
          <div className="relative w-full sm:w-auto">
            <div
              ref={campusTriggerRef}
              onClick={() => setCampusDropdownOpen(!campusDropdownOpen)}
              className="flex items-center justify-between sm:justify-start space-x-2 bg-[#0070ef]/10 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-[#0070ef]/30 cursor-pointer hover:bg-[#0070ef]/20 transition-all duration-300 w-full sm:w-auto"
            >
              <div className="flex items-center space-x-2">
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
                className="absolute top-full left-0 mt-2 w-full sm:w-64 md:w-72 bg-[#001226] border border-[#0070ef]/50 rounded-lg shadow-2xl z-[9999] max-h-80 overflow-auto"
              >
                {CampusList.map((campus) => (
                  <div
                    key={campus.id}
                    onClick={() => {
                      onCampusChange(campus);
                      setCampusDropdownOpen(false);
                    }}
                    className={`px-4 py-3 text-sm font-Tektur cursor-pointer transition-all duration-200 ${
                      selectedCampus.id === campus.id
                        ? "bg-[#0070ef]/20 text-white"
                        : "text-gray-300 hover:bg-[#0070ef]/10"
                    }`}
                  >
                    <span className="font-semibold">{campus.name}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          <div className="relative w-full sm:w-auto">
            <div
              ref={projectFilterTriggerRef}
              onClick={() => setProjectFilterDropdownOpen(!projectFilterDropdownOpen)}
              className="flex items-center justify-between sm:justify-start space-x-2 bg-[#0070ef]/10 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-[#0070ef]/30 cursor-pointer hover:bg-[#0070ef]/20 transition-all duration-300 w-full sm:w-auto"
            >
              <div className="flex items-center space-x-2">
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
                className="absolute top-full left-0 mt-2 w-full sm:w-48 md:w-56 bg-[#001226] border border-[#0070ef]/50 rounded-lg shadow-2xl z-[9999]"
              >
                {ProjectFilterOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleProjectFilterChange(option.value as ProjectFilterType)}
                    className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-Tektur cursor-pointer transition-all duration-200 first:rounded-t-lg last:rounded-b-lg ${
                      projectFilter === option.value
                        ? "bg-[#0070ef]/20 text-white"
                        : "text-gray-300 hover:bg-[#0070ef]/10"
                    }`}
                  >
                    <span className="font-semibold">{option.label}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          <div className="relative w-full sm:w-auto">
            <div
              ref={specificProjectTriggerRef}
              onClick={() => setSpecificProjectDropdownOpen(!specificProjectDropdownOpen)}
              className="flex items-center justify-between sm:justify-start space-x-2 bg-[#0070ef]/10 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-[#0070ef]/30 cursor-pointer hover:bg-[#0070ef]/20 transition-all duration-300 w-full sm:w-auto"
            >
              <div className="flex items-center space-x-2 min-w-0">
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
                className="absolute top-full left-0 mt-2 w-full sm:w-72 md:w-80 bg-[#001226] border border-[#0070ef]/50 rounded-lg shadow-2xl z-[9999] max-h-80 overflow-auto"
              >
                <div
                  onClick={() => handleSpecificProjectFilterChange("all")}
                  className={`px-4 py-3 text-sm font-Tektur cursor-pointer transition-all duration-200 rounded-t-lg ${
                    specificProjectFilter === "all"
                      ? "bg-[#0070ef]/20 text-white"
                      : "text-gray-300 hover:bg-[#0070ef]/10"
                  }`}
                >
                  <span className="font-semibold">All Projects</span>
                </div>
                
                <div className="border-t border-[#0070ef]/30 mx-3"></div>
                
                <div className="px-4 py-2 bg-[#0070ef]/10">
                  <span className="text-xs font-bold text-gray-400 font-Tektur uppercase tracking-wider">
                    Current Teams ({uniqueProjects.length})
                  </span>
                </div>
                {uniqueProjects.map((projectName) => (
                  <div
                    key={`current-${projectName}`}
                    onClick={() => handleSpecificProjectFilterChange(projectName)}
                    className={`px-4 py-2 text-sm font-Tektur cursor-pointer transition-all duration-200 ${
                      specificProjectFilter === projectName
                        ? "bg-[#0070ef]/20 text-white"
                        : "text-gray-300 hover:bg-[#0070ef]/10"
                    }`}
                  >
                    <span className="font-medium truncate">{projectName}</span>
                  </div>
                ))}
                
                <div className="border-t border-[#0070ef]/30 mx-3 my-1"></div>
                
                <div className="px-4 py-2 bg-[#0070ef]/10">
                  <span className="text-xs font-bold text-gray-400 font-Tektur uppercase tracking-wider">
                    All Available ({allProjects.length})
                  </span>
                </div>
                {allProjects.slice(0, 20).map((projectName) => (
                  <div
                    key={`all-${projectName}`}
                    onClick={() => handleSpecificProjectFilterChange(projectName)}
                    className={`px-4 py-2 text-sm font-Tektur cursor-pointer transition-all duration-200 last:rounded-b-lg ${
                      specificProjectFilter === projectName
                        ? "bg-[#0070ef]/20 text-white"
                        : "text-gray-300 hover:bg-[#0070ef]/10"
                    }`}
                  >
                    <span className="font-medium truncate">{projectName}</span>
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
              className="flex items-center justify-center space-x-2 bg-red-500/20 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-all duration-300 w-full sm:w-auto"
            >
              <span className="text-sm font-semibold text-red-300 font-Tektur">Clear Filters</span>
            </motion.button>
          )}

          <div className="bg-[#0070ef]/20 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-[#0070ef]/30 w-full sm:w-auto">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
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
