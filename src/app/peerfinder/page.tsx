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
      
      // Check if user has no projects
      if (data.noProjects) {
        setError(data.message || "You are not subscribed to any projects. Please search for a project to find peers!");
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
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50">
        <div className="text-white text-xl font-Tektur animate-pulse">
          Loading Peer Finder...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-start overflow-x-hidden flex-col bg-gradient-to-br z-10 from-gray-900/50 via-gray-800/30 to-gray-900/50 relative p-6">
      <div className="w-full bg-blue-950/30 backdrop-blur-xl rounded-2xl border border-blue-800/50 flex flex-1 flex-col p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-Tektur text-white">
            Peer Finder
          </h1>
          <p className="text-base md:text-lg text-gray-400 font-Tektur">
            {isPromoPeers 
              ? "Your promo peers in the common core"
              : "Find students working on the same project in your campus"}
          </p>
        </div>

        {/* Search Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Campus Selector */}
          <div className="space-y-2 relative z-[100]">
            <label className="text-sm font-semibold text-gray-300 font-Tektur">
              Select Campus
            </label>
            <div className="relative">
              <div
                onClick={() => setCampusDropdownOpen(!campusDropdownOpen)}
                className="w-full px-4 py-3 rounded-xl bg-blue-950/20 backdrop-blur-sm border border-blue-800/40 text-white font-Tektur cursor-pointer hover:bg-blue-950/30 transition-all duration-300 flex items-center justify-between"
              >
                <span>{selectedCampus.name}</span>
                <FaCaretDown
                  className={`transition-transform duration-300 ${
                    campusDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {campusDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-blue-950/95 border border-blue-800/50 rounded-xl z-[9999] max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-700/50 scrollbar-track-blue-950">
                  {CampusList.map((campus) => (
                    <div
                      key={campus.id}
                      onClick={() => {
                        setSelectedCampus(campus);
                        setCampusDropdownOpen(false);
                        setPeers([]);
                        fetchPromoPeers();
                      }}
                      className={`px-4 py-3 text-sm font-Tektur cursor-pointer transition-all duration-200 border-b border-blue-800/30 last:border-b-0 ${
                        selectedCampus.id === campus.id
                          ? "bg-blue-900/40 text-white"
                          : "text-gray-300 hover:bg-blue-900/20"
                      }`}
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
                  setTimeout(() => setDropdownOpen(false), 200);
                }}
                placeholder="Search for a project..."
                className="w-full px-4 py-3 rounded-xl bg-blue-950/20 backdrop-blur-sm border border-blue-800/40 text-white placeholder-gray-500 font-Tektur outline-none focus:border-blue-700/60 hover:bg-blue-950/30 transition-all duration-300"
              />
              {dropdownOpen && filteredProjects.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-full max-h-64 overflow-auto bg-blue-950/95 border border-blue-800/50 rounded-xl z-[9999]">
                  {filteredProjects.map((project, index) => (
                    <div
                      key={index}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleProjectSelect(project.name, project.project_id);
                      }}
                      className="px-4 py-3 text-sm font-Tektur cursor-pointer transition-all duration-200 text-gray-300 hover:bg-blue-900/40 hover:text-white border-b border-blue-800/30 last:border-b-0"
                    >
                      <div className="font-semibold">{project.name}</div>
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
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-Tektur font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative z-20"
        >
          {loadingPeers ? "Searching..." : "Find Peers"}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 font-Tektur text-sm">
            {error}
          </div>
        )}

        {/* Peers List */}
        {loadingPeers ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white text-xl font-Tektur animate-pulse">
              Loading peers...
            </div>
          </div>
        ) : peers.length > 0 ? (
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-lg md:text-xl font-semibold text-white font-Tektur">
              {isPromoPeers ? `Your Promo (${peers.length} peers)` : `Available Peers (${peers.length})`}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {peers.map((peer) => (
                <div
                  key={isPromoPeers ? peer.id : peer.id}
                  onClick={() => handleUserClick(getDisplayLogin(peer))}
                  className="bg-blue-950/30 backdrop-blur-sm border border-blue-700/70 rounded-xl hover:bg-blue-950/40 transition-all duration-300 cursor-pointer hover:scale-105 flex flex-col items-center py-6 px-3 gap-3"
                >
                  {/* Avatar with border */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <img
                        src={getDisplayImage(peer)}
                        alt={getDisplayLogin(peer)}
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-700/50"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div className="text-center w-full">
                    <p className="text-white font-Tektur font-semibold text-sm truncate px-2">
                      {getDisplayLogin(peer)}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="w-full flex justify-center">
                    <div className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-lg">
                      <p className="text-xs text-green-300 font-Tektur font-semibold">
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
            <div className="text-gray-400 text-lg font-Tektur">
              No peers found for this project
            </div>
            <p className="text-gray-500 text-sm font-Tektur text-center max-w-md">
              Try searching for a different project or check another campus
            </p>
          </div>
        ) : !loadingPeers && !isPromoPeers ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="text-gray-400 text-lg font-Tektur">
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
