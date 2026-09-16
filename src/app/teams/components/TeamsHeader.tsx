"use client";
import React from "react";
import { motion } from "motion/react";
import { FaCaretDown } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { CampusType, ProjectFilterType, SpecificProjectFilterType } from "../teams.types";
import { CampusList, ProjectFilterOptions, AnimationConfig } from "../teams.constants";

interface TeamsHeaderProps {
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
  onSearch: () => void;
}

export const TeamsHeader: React.FC<TeamsHeaderProps> = ({
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
  onSearch,
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
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-Tektur text-[#151515]">
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
              className="w-full px-4 py-2.5 rounded-lg bg-[#ece9d8]  border border-[#616161]/30 text-[#151515] placeholder-neutral-400 font-Tektur focus:outline-none focus:border-[#616161] transition-all duration-300"
            />
          </div>

          {/* Date Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onDateFilterChange("today")}
              className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg border font-Tektur text-sm font-semibold transition-all duration-300 ${
                dateFilter === "today"
                  ? "bg-[#ece9d8] border-[#616161] text-[#151515]"
                  : "bg-[#ece9d8] border-[#a0a6b0] text-[#151515] hover:border-[#616161]/50"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => onDateFilterChange("yesterday")}
              className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg border font-Tektur text-sm font-semibold transition-all duration-300 ${
                dateFilter === "yesterday"
                  ? "bg-[#ece9d8] border-[#616161] text-[#151515]"
                  : "bg-[#ece9d8] border-[#a0a6b0] text-[#151515] hover:border-[#616161]/50"
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => onDateFilterChange("2days")}
              className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg border font-Tektur text-sm font-semibold transition-all duration-300 ${
                dateFilter === "2days"
                  ? "bg-[#ece9d8] border-[#616161] text-[#151515]"
                  : "bg-[#ece9d8] border-[#a0a6b0] text-[#151515] hover:border-[#616161]/50"
              }`}
            >
              2 Days Ago
            </button>
            {dateFilter !== "all" && (
              <button
                onClick={() => onDateFilterChange("all")}
                className="px-3 py-2 md:px-4 md:py-2.5 rounded-lg bg-[#ece9d8] border border-[#a0a6b0] text-[#3e3d35] font-Tektur text-sm font-semibold hover:bg-[#d9e5f5] hover:border-[#a0a6b0] transition-all duration-300"
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
              className="transition-all duration-200 cursor-pointer rounded-md border-solid border-[1px] border-[#a0a6b0] bg-[#ece9d8] flex items-center justify-between sm:justify-start space-x-2 px-3 py-2 md:px-4 md:py-2.5 hover:bg-[#ece9d8] w-full sm:w-auto"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm md:text-base font-semibold text-[#151515] font-Tektur">
                  {selectedCampus.name}
                </span>
              </div>
              <FaCaretDown
                className={`text-[#151515] transition-transform duration-300 text-xs ${
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
                className="absolute top-full left-0 mt-2 w-full sm:w-64 md:w-72 bg-[#ece9d8] border border-[#616161]/50 rounded-lg  z-[9999] max-h-80 overflow-auto"
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
                        ? "bg-[#ece9d8] text-[#151515]"
                        : "text-[#3e3d35] hover:bg-[#ece9d8]"
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
              className="transition-all duration-200 cursor-pointer rounded-md border-solid border-[1px] border-[#a0a6b0] bg-[#ece9d8] flex items-center justify-between sm:justify-start space-x-2 px-3 py-2 md:px-4 md:py-2.5 hover:bg-[#ece9d8] w-full sm:w-auto"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm md:text-sm font-semibold text-[#151515] font-Tektur">
                  {projectFilter === "all" ? "All Projects" : projectFilter === "known" ? "Known Projects" : "Unknown Projects"}
                </span>
              </div>
              <FaCaretDown
                className={`text-[#151515] transition-transform duration-300 text-xs ${
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
                className="absolute top-full left-0 mt-2 w-full sm:w-48 md:w-56 bg-[#ece9d8] border border-[#616161]/50 rounded-lg  z-[9999]"
              >
                {ProjectFilterOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleProjectFilterChange(option.value as ProjectFilterType)}
                    className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-Tektur cursor-pointer transition-all duration-200 first:rounded-t-lg last:rounded-b-lg ${
                      projectFilter === option.value
                        ? "bg-[#ece9d8] text-[#151515]"
                        : "text-[#3e3d35] hover:bg-[#ece9d8]"
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
              className="transition-all duration-200 cursor-pointer rounded-md border-solid border-[1px] border-[#a0a6b0] bg-[#ece9d8] flex items-center justify-between sm:justify-start space-x-2 px-3 py-2 md:px-4 md:py-2.5 hover:bg-[#ece9d8] w-full sm:w-auto"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <span className="text-sm md:text-sm font-semibold text-[#151515] font-Tektur truncate">
                  {specificProjectFilter === "all" ? "All Project Names" : specificProjectFilter}
                </span>
              </div>
              <FaCaretDown
                className={`text-[#151515] transition-transform duration-300 text-xs flex-shrink-0 ${
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
                className="absolute top-full left-0 mt-2 w-full sm:w-72 md:w-80 bg-[#ece9d8] border border-[#616161]/50 rounded-lg  z-[9999] max-h-80 overflow-auto"
              >
                <div
                  onClick={() => handleSpecificProjectFilterChange("all")}
                  className={`px-4 py-3 text-sm font-Tektur cursor-pointer transition-all duration-200 rounded-t-lg ${
                    specificProjectFilter === "all"
                      ? "bg-[#ece9d8] text-[#151515]"
                      : "text-[#3e3d35] hover:bg-[#ece9d8]"
                  }`}
                >
                  <span className="font-semibold">All Projects</span>
                </div>

                <div className="border-t border-[#616161]/30 mx-3"></div>

                <div className="px-4 py-2 bg-[#ece9d8]">
                  <span className="text-xs font-bold text-[#3e3d35] font-Tektur uppercase tracking-wider">
                    Current Teams ({uniqueProjects.length})
                  </span>
                </div>
                {uniqueProjects.map((projectName) => (
                  <div
                    key={`current-${projectName}`}
                    onClick={() => handleSpecificProjectFilterChange(projectName)}
                    className={`px-4 py-2 text-sm font-Tektur cursor-pointer transition-all duration-200 ${
                      specificProjectFilter === projectName
                        ? "bg-[#ece9d8] text-[#151515]"
                        : "text-[#3e3d35] hover:bg-[#ece9d8]"
                    }`}
                  >
                    <span className="font-medium truncate">{projectName}</span>
                  </div>
                ))}

                <div className="border-t border-[#616161]/30 mx-3 my-1"></div>

                <div className="px-4 py-2 bg-[#ece9d8]">
                  <span className="text-xs font-bold text-[#3e3d35] font-Tektur uppercase tracking-wider">
                    All Available ({allProjects.length})
                  </span>
                </div>
                {allProjects.slice(0, 20).map((projectName) => (
                  <div
                    key={`all-${projectName}`}
                    onClick={() => handleSpecificProjectFilterChange(projectName)}
                    className={`px-4 py-2 text-sm font-Tektur cursor-pointer transition-all duration-200 last:rounded-b-lg ${
                      specificProjectFilter === projectName
                        ? "bg-[#ece9d8] text-[#151515]"
                        : "text-[#3e3d35] hover:bg-[#ece9d8]"
                    }`}
                  >
                    <span className="font-medium truncate">{projectName}</span>
                  </div>
                ))}
                {allProjects.length > 20 && (
                  <div className="px-4 py-2 text-xs text-[#3e3d35] font-Tektur text-center border-t border-[#a0a6b0]">
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
              className="flex items-center justify-center space-x-2 bg-[#d9e5f5]  px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-[#a0a6b0] hover:bg-[#d9e5f5] transition-all duration-300 w-full sm:w-auto"
            >
              <span className="text-sm font-semibold text-[#3e3d35] font-Tektur">Clear Filters</span>
            </motion.button>
          )}

          {/* Search Button */}
          <div
            onClick={onSearch}
            className="w-[30px] h-[30px] md:w-[35px] md:h-[35px] cursor-pointer rounded-md border-solid border-[1px] border-[#a0a6b0] bg-[#ece9d8] hover:bg-[#ece9d8] flex items-center justify-center transition-all duration-200"
            title="Apply filters and search"
          >
            <CiSearch className="text-[#151515] text-lg md:text-xl" />
          </div>

          <div className="bg-[#ece9d8] px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-[#a0a6b0] w-full sm:w-auto">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className="text-sm md:text-base font-bold text-[#151515] font-Tektur">
                {teamCount}
              </span>
              <span className="text-sm text-[#3e3d35] font-Tektur">
                team{teamCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
