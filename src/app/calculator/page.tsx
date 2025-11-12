"use client";

import React, { useState, useEffect, useContext } from "react";
import { IoMdAddCircle } from "react-icons/io";
import { ImCross } from "react-icons/im";
import { ContextCreator } from "@/component/context/context";

interface Project {
  state: string;
  final_mark: number | null;
  id: number;
  kind: string;
  name: string;
  x: number;
  y: number;
  by: unknown[];
  project_id: number;
  difficulty: number;
  duration: string;
  rules: string;
  description: string;
  slug: string;
}

interface ValidatedProject {
  id: string;
  projectName: string;
  previousLevel: string;
  newLevel: string;
  xpGained: number;
  score: string;
  coalitionBonus: boolean;
  timestamp: number;
}

const CalculatorPage = () => {
  const context = useContext(ContextCreator);
  const { userData } = context || {};
  
  const [currentLevel, setCurrentLevel] = useState("");
  const [score, setScore] = useState("");
  const [selectedProject, setSelectedProject] = useState("Select Project");
  const [searchValue, setSearchValue] = useState("");
  const [coalitionEnabled, setCoalitionEnabled] = useState(false);
  const [calculatedLevel, setCalculatedLevel] = useState("");
  const [, setDisplayLevel] = useState("Current Level");
  const [projectDifficulty, setProjectDifficulty] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [validatedProjects, setValidatedProjects] = useState<ValidatedProject[]>([]);
  const [isInternship, setIsInternship] = useState(false);

  useEffect(() => {
    fetch("/Project_lvl.json")
      .then((response) => response.json())
      .then((data: Project[]) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading projects:", err);
        setLoading(false);
      });
  }, []);

  // Set user's current level from context when available
  useEffect(() => {
    if (userData?.level && !currentLevel) {
      setCurrentLevel(userData.level.toFixed(2));
      setDisplayLevel(`Level ${userData.level.toFixed(2)}`);
    }
  }, [userData, currentLevel]);

  const levelCalculator = (
    startLevel: number,
    plannedXp: number,
    score: number,
    coalitionOn: boolean
  ): number => {
    const levelsXp = [
      0, 462, 2688, 5885, 11777, 29217, 46255, 63559, 74340, 85483, 95000,
      105630, 124446, 145782, 169932, 197316, 228354, 263508, 303366, 348516,
      399672, 457632, 523320, 597786, 682164, 777756, 886074, 1008798,
      1147902, 1305486, 1484070,
    ];

    // For internships, the XP is calculated based on duration (months worked)
    // and the score represents the percentage of the internship completed
    let xp;
    if (isInternship) {
      // Internships: XP is proportional to the score (which represents % of internship duration)
      xp = plannedXp * (score / 100);
      // Coalition bonus applies only to the base XP
      if (coalitionOn) {
        xp += xp * 0.042;
      }
    } else {
      // Regular projects: XP based on score
      xp = plannedXp * (score / 100);
      if (coalitionOn) {
        xp += xp * 0.042;
      }
    }

    const levelDown = Math.floor(startLevel);
    const levelUp = levelDown + 1;

    const levelXpTotal = levelsXp[levelUp] - levelsXp[levelDown];
    const currentXp =
      levelsXp[levelDown] + levelXpTotal * (startLevel - levelDown);

    let finalXp = currentXp + xp;

    let i;
    for (i = 0; i < levelsXp.length; i++) {
      if (levelsXp[i] > finalXp) {
        break;
      }
    }

    const maxXp = levelsXp[i] - levelsXp[i - 1];
    finalXp -= levelsXp[i - 1];

    return i - 1 + finalXp / maxXp;
  };

  const handleProjectSelect = (projectName: string, difficulty: number) => {
    setSelectedProject(projectName);
    setProjectDifficulty(difficulty);
    setSearchValue("");
    setDropdownOpen(false);
    
    // Check if it's an internship project
    const isInternshipProject = projectName.toLowerCase().includes("internship") || 
                                projectName.toLowerCase().includes("part time") ||
                                projectName.toLowerCase().includes("part_time");
    setIsInternship(isInternshipProject);
  };

  const handleCalculate = () => {
    if (
      !currentLevel ||
      !score ||
      selectedProject === "Select Project" ||
      projectDifficulty === 0
    ) {
      setCalculatedLevel("fill the form");
      return;
    }

    const result = levelCalculator(
      parseFloat(currentLevel),
      projectDifficulty,
      parseFloat(score),
      coalitionEnabled
    );

    if (isNaN(result)) {
      setCalculatedLevel("NaN");
    } else {
      setCalculatedLevel(result.toFixed(2));
    }
  };

  const handleAddLevel = () => {
    if (
      calculatedLevel &&
      calculatedLevel !== "fill the form" &&
      calculatedLevel !== "NaN" &&
      calculatedLevel !== "" &&
      selectedProject !== "Select Project"
    ) {
      // Create a validated project entry
      const newValidatedProject: ValidatedProject = {
        id: Date.now().toString(),
        projectName: selectedProject,
        previousLevel: currentLevel,
        newLevel: calculatedLevel,
        xpGained: projectDifficulty,
        score: score,
        coalitionBonus: coalitionEnabled,
        timestamp: Date.now(),
      };

      // Add to validated projects list
      setValidatedProjects([newValidatedProject, ...validatedProjects]);

      // Update current level
      setDisplayLevel(`Level ${calculatedLevel}`);
      setCurrentLevel(calculatedLevel);

      // Reset form for next calculation
      setSelectedProject("Select Project");
      setSearchValue("");
      setScore("");
      setProjectDifficulty(0);
      setCalculatedLevel("");
      setCoalitionEnabled(false);
    }
  };

  const handleRemoveProject = (id: string) => {
    // Find the project to remove
    const projectToRemove = validatedProjects.find(project => project.id === id);
    
    if (projectToRemove) {
      // Calculate the XP that was gained from this project
      let xpGained = projectToRemove.xpGained * (parseFloat(projectToRemove.score) / 100);
      if (projectToRemove.coalitionBonus) {
        xpGained += xpGained * 0.042;
      }

      // Calculate the new current level by reversing the XP calculation
      const newLevel = reverseCalculateLevel(parseFloat(currentLevel), xpGained);
      
      // Update current level
      setCurrentLevel(newLevel.toFixed(2));
      setDisplayLevel(`Level ${newLevel.toFixed(2)}`);
    }

    // Remove project from list
    setValidatedProjects(validatedProjects.filter(project => project.id !== id));
  };

  const reverseCalculateLevel = (currentLevel: number, xpToRemove: number): number => {
    const levelsXp = [
      0, 462, 2688, 5885, 11777, 29217, 46255, 63559, 74340, 85483, 95000,
      105630, 124446, 145782, 169932, 197316, 228354, 263508, 303366, 348516,
      399672, 457632, 523320, 597786, 682164, 777756, 886074, 1008798,
      1147902, 1305486, 1484070,
    ];

    // Calculate current XP
    const levelDown = Math.floor(currentLevel);
    const levelUp = levelDown + 1;
    const levelXpTotal = levelsXp[levelUp] - levelsXp[levelDown];
    const currentXp = levelsXp[levelDown] + levelXpTotal * (currentLevel - levelDown);

    // Remove XP
    let newXp = currentXp - xpToRemove;

    // Find the new level
    let i;
    for (i = 0; i < levelsXp.length; i++) {
      if (levelsXp[i] > newXp) {
        break;
      }
    }

    const maxXp = levelsXp[i] - levelsXp[i - 1];
    newXp -= levelsXp[i - 1];

    return i - 1 + newXp / maxXp;
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50">
        <div className="text-white text-xl font-Tektur animate-pulse">Loading Calculator...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-start overflow-x-hidden flex-col bg-gradient-to-br z-10 from-gray-900/50 via-gray-800/30 to-gray-900/50 relative p-6">
      <div className="w-full bg-blue-950/30 backdrop-blur-xl rounded-2xl border border-blue-800/50 flex flex-1 flex-col p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-3">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-Tektur text-white">
            XP Calculator
          </h1>
          <p className="text-base md:text-lg text-gray-400 font-Tektur">
            Calculate your level progression based on project XP
          </p>
          <div className="bg-blue-950/20 border border-blue-800/40 rounded-xl p-3">
            <p className="text-sm text-gray-300 font-Tektur">
              <span className="font-semibold">Note:</span> The calculator may not be 100% exact, but it works fine for estimating your progression.
            </p>
          </div>
        </div>

        {/* Calculator Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Current Level Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 font-Tektur">
              Current Level
            </label>
            <input
              type="number"
              step="0.01"
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value)}
              placeholder="e.g. 4.20"
              className="w-full px-4 py-3 rounded-xl bg-blue-950/20 backdrop-blur-sm border border-blue-800/40 text-white placeholder-gray-500 font-Tektur outline-none focus:border-blue-700/60 hover:bg-blue-950/30 transition-all duration-300 relative z-20"
            />
          </div>

          {/* Score Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 font-Tektur">
              {isInternship ? "Duration Progress (%)" : "Score (100-125)"}
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder={isInternship ? "e.g. 100 (completed)" : "e.g. 125"}
              className="w-full px-4 py-3 rounded-xl bg-blue-950/20 backdrop-blur-sm border border-blue-800/40 text-white placeholder-gray-500 font-Tektur outline-none focus:border-blue-700/60 hover:bg-blue-950/30 transition-all duration-300 relative z-20"
            />
            {isInternship && (
              <p className="text-xs text-gray-400 font-Tektur">
                For internships: 100% = full duration completed
              </p>
            )}
          </div>
        </div>

        {/* Project Selector */}
        <div className="space-y-2 relative z-[100]">
          <label className="text-sm font-semibold text-gray-300 font-Tektur">
            Select Project
          </label>
          <div className="relative">
            <input
              type="text"
              value={dropdownOpen ? searchValue : selectedProject}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => {
                // Delay closing to allow click on dropdown item
                setTimeout(() => setDropdownOpen(false), 200);
              }}
              placeholder="Search for a project..."
              className="w-full px-4 py-3 rounded-xl bg-blue-950/20 backdrop-blur-sm border border-blue-800/40 text-white placeholder-gray-500 font-Tektur outline-none focus:border-blue-700/60 hover:bg-blue-950/30 transition-all duration-300 relative z-30"
            />
            {dropdownOpen && filteredProjects.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-full max-h-64 overflow-auto bg-blue-950/95 border border-blue-800/50 rounded-xl z-[9999]">
                {filteredProjects.map((project, index) => (
                  <div
                    key={index}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleProjectSelect(project.name, project.difficulty);
                    }}
                    className="px-4 py-3 text-sm font-Tektur cursor-pointer transition-all duration-200 text-gray-300 hover:bg-blue-900/40 hover:text-white border-b border-blue-800/30 last:border-b-0"
                  >
                    <div className="font-semibold">{project.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      XP: {project.difficulty} • {project.duration}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedProject !== "Select Project" && (
            <div className="text-sm text-gray-400 font-Tektur mt-1">
              XP: {projectDifficulty}
              {isInternship && (
                <span className="ml-2 text-xs bg-rose-500/30 text-rose-300 px-2 py-1 rounded">
                  Internship
                </span>
              )}
            </div>
          )}
        </div>

        {/* Coalition Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-blue-950/20 backdrop-blur-sm border border-blue-800/40 relative z-20">
          <div className="flex items-center space-x-3">
            <span className="text-white font-Tektur font-semibold">
              Coalition Bonus
            </span>
            <span className="text-xs text-gray-400 font-Tektur">
              (+4.2% XP)
            </span>
          </div>
          <button
            onClick={() => setCoalitionEnabled(!coalitionEnabled)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
              coalitionEnabled ? "bg-blue-600" : "bg-gray-600"
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                coalitionEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            ></div>
          </button>
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-Tektur font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] relative z-20"
        >
          Calculate Level
        </button>

        {/* Result Display */}
        <div className="bg-blue-950/20 backdrop-blur-sm border border-blue-800/40 rounded-xl p-6 relative z-20">
          <div className="text-center">
            <p className="text-sm text-gray-400 font-Tektur mb-2">
              New Level
            </p>
            {calculatedLevel === "NaN" || calculatedLevel === "fill the form" ? (
              <p className="text-xl text-gray-500 font-Tektur">
                {calculatedLevel === "fill the form" 
                  ? "Fill in all fields to calculate" 
                  : "Invalid input"}
              </p>
            ) : calculatedLevel === "" ? (
              <p className="text-5xl font-bold text-white font-Tektur">--</p>
            ) : (
              <div className="flex items-center justify-center space-x-4">
                <p className="text-5xl font-bold text-blue-400 font-Tektur">
                  {calculatedLevel}
                </p>
                {currentLevel && calculatedLevel && (
                  <button
                    onClick={handleAddLevel}
                    className="text-blue-400 hover:text-blue-300 hover:scale-110 transition-all duration-300"
                    title="Use this level as current"
                  >
                    <IoMdAddCircle className="w-10 h-10" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Validated Projects List */}
        {validatedProjects.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-lg md:text-xl font-semibold text-white font-Tektur">
              Validated Projects
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {validatedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-blue-950/20 backdrop-blur-sm border border-blue-800/40 rounded-xl p-4 flex items-center justify-between hover:bg-blue-950/30 transition-all duration-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-white font-Tektur font-semibold text-sm md:text-base">
                        {project.projectName}
                      </h4>
                      {project.coalitionBonus && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-Tektur">
                          +4.2%
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400 font-Tektur">
                      <span>
                        Level: <span className="text-gray-300">{project.previousLevel}</span> → <span className="text-blue-400 font-semibold">{project.newLevel}</span>
                      </span>
                      <span>•</span>
                      <span>Score: <span className="text-gray-300">{project.score}%</span></span>
                      <span>•</span>
                      <span>XP: <span className="text-gray-300">{project.xpGained}</span></span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveProject(project.id)}
                    className="ml-4 text-red-400 hover:text-red-300 hover:scale-110 transition-all duration-300 p-2"
                    title="Remove project"
                  >
                    <ImCross className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculatorPage;
