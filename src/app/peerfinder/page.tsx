"use client";

import React, { useState, useEffect, useContext } from "react";
import { FaCaretDown } from "react-icons/fa";
import { ContextCreator } from "@/component/context/context";
import { useRateLimitHandler } from "@/component/hooks/useRateLimitHandler";
import RateLimitPopup from "@/component/RateLimitPopup";

interface Project {
  state: string;
  final_mark: number | null;
  id: number;
  kind: string;
  name: string;
  project_id: number;
  difficulty: number;
  duration: string;
  slug: string;
}

interface User {
  id: number;
  login: string;
  url: string;
  image: {
    link: string;
    versions: {
      large: string;
      medium: string;
      small: string;
      micro: string;
    };
  };
}

interface ProjectUser {
  id: number;
  occurrence: number;
  final_mark: number | null;
  status: string;
  validated?: boolean;
  current_team_id: number;
  project: {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
  };
  cursus_ids: number[];
  marked_at: string | null;
  marked: boolean;
  retriable_at: string | null;
  created_at: string;
  updated_at: string;
  user: User;
}

interface CampusType {
  name: string;
  id: number;
}

const CampusList: CampusType[] = [
  { name: "Khouribga", id: 16 },
  { name: "Bengrir", id: 21 },
  { name: "Tetouan", id: 55 },
  { name: "Rabat", id: 75 },
  { name: "Paris", id: 1 },
  { name: "Lyon", id: 9 },
  { name: "Barcelona", id: 46 },
  { name: "Mulhouse", id: 48 },
  { name: "Lausanne", id: 47 },
  { name: "Istanbul", id: 49 },
  { name: "Berlin", id: 51 },
  { name: "Florence", id: 52 },
  { name: "Vienna", id: 53 },
  { name: "Prague", id: 56 },
  { name: "London", id: 57 },
  { name: "Porto", id: 58 },
  { name: "Luxembourg", id: 59 },
  { name: "Perpignan", id: 60 },
  { name: "Tokyo", id: 26 },
  { name: "Moscow", id: 17 },
  { name: "Madrid", id: 22 },
  { name: "Seoul", id: 29 },
  { name: "Rome", id: 30 },
  { name: "Yerevan", id: 32 },
  { name: "Amesterdam", id: 14 },
  { name: "Bangkok", id: 33 },
  { name: "Amman", id: 35 },
  { name: "Malaga", id: 37 },
  { name: "Nice", id: 41 },
  { name: "Abu Dhabi", id: 43 },
  { name: "Wolfsburg", id: 44 },
];

const PeerFinderPage = () => {
  const context = useContext(ContextCreator);
  const userData = context?.userData;
  const { rateLimitState, handleRateLimitResponse, closeRateLimitPopup } = useRateLimitHandler();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("Select Project");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingPeers, setLoadingPeers] = useState(false);
  const [peers, setPeers] = useState<ProjectUser[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<CampusType>(CampusList[0]);
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPromoPeers, setIsPromoPeers] = useState(true);

  // Set campus from context on mount
  useEffect(() => {
    if (userData?.campus_id && userData?.campus_name) {
      const userCampus = CampusList.find(c => c.id === userData.campus_id);
      if (userCampus) {
        setSelectedCampus(userCampus);
      }
    }
  }, [userData]);

  useEffect(() => {
    // Load projects
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

    // Auto-detect user's campus and first project on load
    fetchAutoProject();
  }, []);

  const fetchAutoProject = async () => {
    setLoadingPeers(true);
    setError(null);
    setPeers([]);
    setIsPromoPeers(false);

    try {
      const response = await fetch(`/api/peerfinder?auto=true`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      // Check for rate limiting
      const isRateLimited = await handleRateLimitResponse(response);
      if (isRateLimited) {
        setLoadingPeers(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Auto-detect failed:", errorData);
        throw new Error(errorData.error || "Failed to auto-detect project");
      }

      const data = await response.json();
      
      // Check if user has no projects - default to Inception (project_id 1983)
      if (data.noProjects) {
        setSelectedProject("Inception");
        setSelectedProjectId(1983);
        setError(null);
        setLoadingPeers(false);
        return;
      }
      
      if (data.campus) {
        const detectedCampus = CampusList.find(c => c.id === data.campus.id) || CampusList[0];
        setSelectedCampus(detectedCampus);
      }
      
      if (data.project) {
        setSelectedProject(data.project.name);
        setSelectedProjectId(data.project.id);
      }
      
      setPeers(data.peers || []);
      setLoadingPeers(false);
    } catch (err) {
      console.error("Error in auto-detect:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to auto-detect project";
      setError(errorMessage);
      setLoadingPeers(false);
      // Don't fallback to promo peers, just show the error
    }
  };

  const fetchPromoPeers = async () => {
    setLoadingPeers(true);
    setError(null);
    setPeers([]);
    setIsPromoPeers(true);

    try {
      const url = `/api/peerfinder?fetchPromo=true&campusId=${selectedCampus.id}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      // Check for rate limiting
      const isRateLimited = await handleRateLimitResponse(response);
      if (isRateLimited) {
        setLoadingPeers(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to fetch promo peers");
      }

      const data = await response.json();
      
      setPeers(data);
      setLoadingPeers(false);
    } catch (err) {
      console.error("=== ERROR FETCHING PROMO PEERS ===");
      console.error("Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Please choose a project you want to list, or you might not be registered in any project.";
      setError(errorMessage);
      setLoadingPeers(false);
    }
  };

  const fetchPeers = async () => {
    if (!selectedProjectId) return;

    setLoadingPeers(true);
    setError(null);
    setPeers([]);
    setIsPromoPeers(false);

    try {
      const response = await fetch(
        `/api/peerfinder?campusId=${selectedCampus.id}&projectId=${selectedProjectId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      // Check for rate limiting
      const isRateLimited = await handleRateLimitResponse(response);
      if (isRateLimited) {
        setLoadingPeers(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch peers");
      }

      const data: ProjectUser[] = await response.json();
      
      // Show ALL users from API response without filtering
      setPeers(data);
      setLoadingPeers(false);
    } catch (err) {
      console.error("Error fetching peers:", err);
      setError("Please choose a project you want to list, or you might not be registered in any project.");
      setLoadingPeers(false);
    }
  };

  const handleProjectSelect = (projectName: string, projectId: number) => {
    setSelectedProject(projectName);
    setSelectedProjectId(projectId);
    setSearchValue("");
    setDropdownOpen(false);
    setPeers([]);
  };

  const handleSearch = () => {
    if (selectedProjectId) {
      fetchPeers();
    }
  };

  const handleUserClick = (login: string) => {
    window.open(`https://profile.intra.42.fr/users/${login}`, "_blank");
  };

  const getDisplayImage = (peer: ProjectUser | Record<string, unknown>) => {
    // For promo peers (direct user objects)
    if (isPromoPeers) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userPeer = peer as any;
      return userPeer.image?.versions?.medium || userPeer.image?.link;
    }
    // For project users (nested user object)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectPeer = peer as any;
    return projectPeer.user?.image?.versions?.medium || projectPeer.user?.image?.link;
  };

  const getDisplayLogin = (peer: ProjectUser | Record<string, unknown>) => {
    if (isPromoPeers) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userPeer = peer as any;
      return userPeer.login as string;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectPeer = peer as any;
    return projectPeer.user?.login as string;
  };

  const getDisplayStatus = (peer: ProjectUser | Record<string, unknown>) => {
    if (isPromoPeers) {
      return "Available";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectPeer = peer as any;
    return projectPeer.status;
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="theme-text text-xl animate-pulse" style={{ fontFamily: "var(--font-ui)" }}>
          Loading Peer Finder...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-start overflow-x-hidden flex-col z-10 relative w-full">
      <div
        className="relative w-full border-4 theme-border-strong bg-gray-950/98 flex flex-1 flex-col p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6"
        style={{
          fontFamily: "var(--font-ui)",
          boxShadow: "6px 6px 0 var(--theme-shadow-lg), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Pixel corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 theme-border z-10" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 theme-border z-10" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 theme-border z-10" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 theme-border z-10" />

        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold theme-text uppercase tracking-[0.15em]">
            Peer Finder
          </h1>
          <p className="text-sm md:text-base theme-text-muted uppercase tracking-wider">
            {isPromoPeers 
              ? "Your promo peers in the common core"
              : "Find students working on the same project in your campus"}
          </p>
        </div>

        {/* Search Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Campus Selector */}
          <div className="space-y-2 relative z-[100]">
            <label className="text-[10px] font-bold theme-text-muted uppercase tracking-wider">
              Select Campus
            </label>
            <div className="relative">
              <div
                onClick={() => setCampusDropdownOpen(!campusDropdownOpen)}
                className="w-full px-4 py-3 border-2 theme-border bg-[var(--theme-bg-card)] theme-text cursor-pointer hover:border-[var(--theme-primary)] transition-all flex items-center justify-between"
                style={{ fontFamily: "var(--font-ui)", boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
              >
                <span>{selectedCampus.name}</span>
                <FaCaretDown
                  className={`transition-transform duration-200 ${
                    campusDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {campusDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-full border-2 theme-border bg-gray-950/98 z-[9999] max-h-[300px] overflow-y-auto"
                  style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.3)" }}
                >
                  {CampusList.map((campus) => (
                    <div
                      key={campus.id}
                      onClick={() => {
                        setSelectedCampus(campus);
                        setCampusDropdownOpen(false);
                        setPeers([]);
                        fetchPromoPeers();
                      }}
                      className={`px-4 py-3 text-xs cursor-pointer transition-all border-b theme-border last:border-b-0 ${
                        selectedCampus.id === campus.id
                          ? "bg-[var(--theme-bg-card)] theme-text"
                          : "theme-text-muted hover:bg-[var(--theme-bg-card)] hover:theme-text"
                      }`}
                      style={{ fontFamily: "var(--font-ui)" }}
                    >
                      {campus.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Project Selector */}
          <div className="space-y-2 relative z-[90]">
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
                className="w-full px-4 py-3 border-2 theme-border bg-[var(--theme-bg-card)] theme-text placeholder-[var(--theme-text-muted)] outline-none focus:border-[var(--theme-primary)] transition-all"
                style={{ fontFamily: "var(--font-ui)", boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
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
                        handleProjectSelect(project.name, project.project_id);
                      }}
                      className="px-4 py-3 text-xs cursor-pointer transition-all theme-text-muted hover:bg-[var(--theme-bg-card)] hover:theme-text border-b theme-border last:border-b-0"
                      style={{ fontFamily: "var(--font-ui)" }}
                    >
                      <div className="font-bold uppercase">{project.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!selectedProjectId || loadingPeers}
          className="w-full py-4 border-2 theme-border-strong font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative z-20"
          style={{
            fontFamily: "var(--font-ui)",
            color: "var(--theme-text)",
            background: "linear-gradient(to bottom, color-mix(in srgb, var(--theme-primary) 30%, transparent), color-mix(in srgb, var(--theme-primary-dark) 40%, transparent))",
            boxShadow: "4px 4px 0 var(--theme-shadow-lg), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {loadingPeers ? "Searching..." : "Find Peers"}
        </button>

        {/* Error Message */}
        {error && (
          <div className="border-2 border-red-500/50 bg-red-500/10 p-4 theme-text" style={{ fontFamily: "var(--font-ui)" }}>
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Peers List */}
        {loadingPeers ? (
          <div className="flex items-center justify-center py-20">
            <div className="theme-text text-xl animate-pulse" style={{ fontFamily: "var(--font-ui)" }}>
              Loading peers...
            </div>
          </div>
        ) : peers.length > 0 ? (
          <div className="space-y-3 pt-4 border-t-2 theme-border">
            <h3 className="text-sm md:text-base font-bold theme-text uppercase tracking-wider">
              {isPromoPeers ? `Your Promo (${peers.length} peers)` : `Available Peers (${peers.length})`}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {peers.map((peer) => (
                <div
                  key={isPromoPeers ? `promo-${getDisplayLogin(peer)}` : peer.id}
                  onClick={() => handleUserClick(getDisplayLogin(peer))}
                  className="border-2 theme-border bg-[var(--theme-bg-card)] hover:border-[var(--theme-border-strong)] transition-all cursor-pointer hover:scale-[1.02] active:translate-y-0.5 flex flex-col items-center py-6 px-3 gap-3"
                  style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <img
                        src={getDisplayImage(peer)}
                        alt={getDisplayLogin(peer)}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover border-2 theme-border"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>
                  </div>
                  <div className="text-center w-full">
                    <p className="theme-text font-bold text-xs truncate px-2 uppercase tracking-wider">
                      {getDisplayLogin(peer)}
                    </p>
                  </div>
                  <div className="w-full flex justify-center">
                    <div className="px-3 py-1 border-2 border-green-500/50 bg-green-500/20">
                      <p className="text-[10px] text-green-300 font-bold uppercase tracking-wider">
                        {getDisplayStatus(peer)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : selectedProjectId && !loadingPeers ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="theme-text-muted text-sm uppercase tracking-wider" style={{ fontFamily: "var(--font-ui)" }}>
              No peers found for this project
            </div>
            <p className="theme-text-muted text-[10px] text-center max-w-md uppercase tracking-wider">
              Try searching for a different project or check another campus
            </p>
          </div>
        ) : !loadingPeers && !isPromoPeers ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="theme-text-muted text-sm uppercase tracking-wider" style={{ fontFamily: "var(--font-ui)" }}>
              Select a project to find peers
            </div>
          </div>
        ) : null}
      </div>
      
      {/* Rate Limit Popup */}
      <RateLimitPopup
        show={rateLimitState.isRateLimited}
        onClose={closeRateLimitPopup}
        retryAfter={rateLimitState.retryAfter}
      />
    </div>
  );
};

export default PeerFinderPage;
