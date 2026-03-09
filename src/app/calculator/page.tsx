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
      <div className="flex flex-1 items-center justify-center">
        <div className="theme-text text-xl animate-pulse" style={{ fontFamily: "var(--font-pixel)" }}>
          Loading Calculator...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-start overflow-x-hidden flex-col z-10 relative w-full">
      <div
        className="relative w-full border-4 theme-border-strong bg-gray-950/98 flex flex-1 flex-col p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6"
        style={{
          fontFamily: "var(--font-pixel)",
          boxShadow: "6px 6px 0 var(--theme-shadow-lg), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Pixel corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 theme-border z-10" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 theme-border" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 theme-border" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 theme-border" />

        {/* Header Section */}
        <div className="flex flex-col space-y-3">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold theme-text uppercase tracking-[0.15em]">
            XP Calculator
          </h1>
          <p className="text-sm md:text-base theme-text-muted uppercase tracking-wider">
            Calculate your level progression based on project XP
          </p>
          <div className="border-2 theme-border bg-[var(--theme-bg-card)] p-3" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
            <p className="text-xs theme-text-muted uppercase tracking-wider">
              <span className="font-bold theme-text">Note:</span> The calculator may not be 100% exact, but it works fine for estimating your progression.
            </p>
          </div>
        </div>

        {/* Calculator Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Current Level Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold theme-text-muted uppercase tracking-wider">
              Current Level
            </label>
            <input
              type="number"
              step="0.01"
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value)}
              placeholder="e.g. 4.20"
              className="w-full px-4 py-3 border-2 theme-border bg-[var(--theme-bg-card)] theme-text placeholder-[var(--theme-text-muted)] outline-none focus:border-[var(--theme-primary)] transition-all relative z-20"
              style={{ fontFamily: "var(--font-pixel)", boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
            />
          </div>

          {/* Score Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold theme-text-muted uppercase tracking-wider">
              {isInternship ? "Duration Progress (%)" : "Score (100-125)"}
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder={isInternship ? "e.g. 100 (completed)" : "e.g. 125"}
              className="w-full px-4 py-3 border-2 theme-border bg-[var(--theme-bg-card)] theme-text placeholder-[var(--theme-text-muted)] outline-none focus:border-[var(--theme-primary)] transition-all relative z-20"
              style={{ fontFamily: "var(--font-pixel)", boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
            />
            {isInternship && (
              <p className="text-[9px] theme-text-muted uppercase tracking-wider">
                For internships: 100% = full duration completed
              </p>
            )}
          </div>
        </div>

        {/* Project Selector */}
        <div className="space-y-2 relative z-[100]">
          <label className="text-[10px] font-bold theme-text-muted uppercase tracking-wider">
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
                setTimeout(() => setDropdownOpen(false), 200);
              }}
              placeholder="Search for a project..."
              className="w-full px-4 py-3 border-2 theme-border bg-[var(--theme-bg-card)] theme-text placeholder-[var(--theme-text-muted)] outline-none focus:border-[var(--theme-primary)] transition-all relative z-30"
              style={{ fontFamily: "var(--font-pixel)", boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
            />
            {dropdownOpen && filteredProjects.length > 0 && (
              <div
                className="absolute top-full left-0 mt-2 w-full max-h-64 overflow-auto border-2 theme-border bg-gray-950/98 z-[9999]"
                style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.3)" }}
              >
                {filteredProjects.map((project, index) => (
                  <div
                    key={index}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleProjectSelect(project.name, project.difficulty);
                    }}
                    className="px-4 py-3 text-xs cursor-pointer transition-all theme-text-muted hover:bg-[var(--theme-bg-card)] hover:theme-text border-b theme-border last:border-b-0"
                    style={{ fontFamily: "var(--font-pixel)" }}
                  >
                    <div className="font-bold uppercase">{project.name}</div>
                    <div className="text-[9px] theme-text-muted mt-1 uppercase tracking-wider">
                      XP: {project.difficulty} • {project.duration}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedProject !== "Select Project" && (
            <div className="text-[10px] theme-text-muted uppercase tracking-wider mt-1">
              XP: {projectDifficulty}
              {isInternship && (
                <span className="ml-2 text-[9px] bg-[var(--theme-primary)]/20 theme-text px-2 py-0.5 border theme-border">
                  Internship
                </span>
              )}
            </div>
          )}
        </div>

        {/* Coalition Toggle */}
        <div
          className="flex items-center justify-between p-4 border-2 theme-border bg-[var(--theme-bg-card)] relative z-20"
          style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
        >
          <div className="flex items-center space-x-3">
            <span className="theme-text font-bold uppercase tracking-wider text-sm">
              Coalition Bonus
            </span>
            <span className="text-[10px] theme-text-muted uppercase tracking-wider">
              (+4.2% XP)
            </span>
          </div>
          <button
            onClick={() => setCoalitionEnabled(!coalitionEnabled)}
            className={`relative w-12 h-6 border-2 transition-all duration-200 active:translate-y-0.5 ${
              coalitionEnabled ? "theme-border-strong bg-[var(--theme-primary)]/30" : "theme-border bg-gray-900/80"
            }`}
            style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white border-2 border-gray-900 transition-transform duration-200 ${
                coalitionEnabled ? "translate-x-6" : "translate-x-0"
              }`}
              style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.3)" }}
            />
          </button>
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          className="w-full py-4 border-2 theme-border-strong font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] active:translate-y-0.5 relative z-20"
          style={{
            fontFamily: "var(--font-pixel)",
            color: "var(--theme-text)",
            background: "linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 30%, transparent), color-mix(in srgb, var(--theme-primary-dark) 40%, transparent))",
            boxShadow: "4px 4px 0 var(--theme-shadow-lg), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          Calculate Level
        </button>

        {/* Result Display */}
        <div
          className="border-2 theme-border bg-[var(--theme-bg-card)] p-6 relative z-20"
          style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
        >
          <div className="text-center">
            <p className="text-[10px] theme-text-muted uppercase tracking-wider mb-2">
              New Level
            </p>
            {calculatedLevel === "NaN" || calculatedLevel === "fill the form" ? (
              <p className="text-lg theme-text-muted uppercase tracking-wider">
                {calculatedLevel === "fill the form" 
                  ? "Fill in all fields to calculate" 
                  : "Invalid input"}
              </p>
            ) : calculatedLevel === "" ? (
              <p className="text-4xl font-bold theme-text">--</p>
            ) : (
              <div className="flex items-center justify-center space-x-4">
                <p className="text-4xl md:text-5xl font-bold theme-text" style={{ color: "var(--theme-primary)" }}>
                  {calculatedLevel}
                </p>
                {currentLevel && calculatedLevel && (
                  <button
                    onClick={handleAddLevel}
                    className="hover:scale-110 transition-all duration-200 active:translate-y-0.5"
                    style={{ color: "var(--theme-primary)" }}
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
          <div className="space-y-3 pt-4 border-t-2 theme-border">
            <h3 className="text-sm md:text-base font-bold theme-text uppercase tracking-wider">
              Validated Projects
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {validatedProjects.map((project) => (
                <div
                  key={project.id}
                  className="border-2 theme-border bg-[var(--theme-bg-card)] p-4 flex items-center justify-between hover:border-[var(--theme-border-strong)] transition-all"
                  style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="theme-text font-bold text-xs md:text-sm uppercase tracking-wider">
                        {project.projectName}
                      </h4>
                      {project.coalitionBonus && (
                        <span className="text-[9px] bg-[var(--theme-primary)]/20 theme-text px-2 py-0.5 border theme-border uppercase">
                          +4.2%
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[10px] theme-text-muted uppercase tracking-wider">
                      <span>
                        Level: <span className="theme-text">{project.previousLevel}</span> → <span className="font-bold" style={{ color: "var(--theme-primary)" }}>{project.newLevel}</span>
                      </span>
                      <span>•</span>
                      <span>Score: <span className="theme-text">{project.score}%</span></span>
                      <span>•</span>
                      <span>XP: <span className="theme-text">{project.xpGained}</span></span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveProject(project.id)}
                    className="ml-4 p-2 border-2 border-red-500/50 text-red-400 hover:border-red-400/70 hover:bg-red-500/20 transition-all active:translate-y-0.5"
                    style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
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
