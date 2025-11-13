"use client";
import React from "react";
import { LaoderComp } from "@/app/vip/vip.component";

import {
  ResponseData,
  CampusType,
  ProjectInfo,
  ProjectFilterType,
  SpecificProjectFilterType,
} from "./vip.types";
import { UserData } from "@/component/navbar/navbar.types";

import { VipHeader, TeamGrid, LoadMore, AccessDenied, VipAdmin } from "./components";
import BannedUsersPopup from "@/component/BannedUsersPopup";
import RateLimitStatsPopup from "@/component/RateLimitStatsPopup";

const VipPage = () => {
  const [dataReturned, setDataReturned] = React.useState<
    ResponseData[] | null | undefined
  >(null);
  const [filteredData, setFilteredData] = React.useState<
    ResponseData[] | null | undefined
  >(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState<boolean>(false);
  const [pageNumber, setPageNumber] = React.useState<number>(1);
  const [selectedCampus, setSelectedCampus] = React.useState<CampusType>({
    name: "Khouribga",
    id: 16,
  });
  const [projectsMap, setProjectsMap] = React.useState<Map<number, ProjectInfo>>(
    new Map()
  );
  const [projectFilter, setProjectFilter] = React.useState<ProjectFilterType>("all");
  const [specificProjectFilter, setSpecificProjectFilter] = React.useState<SpecificProjectFilterType>("all");
  const [showAdminPanel, setShowAdminPanel] = React.useState<boolean>(false);
  const [showBannedUsers, setShowBannedUsers] = React.useState<boolean>(false);
  const [showRateLimitStats, setShowRateLimitStats] = React.useState<boolean>(false);
  const [currentUser, setCurrentUser] = React.useState<UserData | null>(null);
  const [isAdminUser, setIsAdminUser] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const getProjectName = React.useCallback((projectId: string): string => {
    const id = parseInt(projectId);
    const project = projectsMap.get(id);
    return project ? project.name : "Unknown Project";
  }, [projectsMap]);

  const getProjectDifficulty = React.useCallback((projectId: string): number => {
    const id = parseInt(projectId);
    const project = projectsMap.get(id);
    return project ? project.difficulty : 0;
  }, [projectsMap]);

  const getProjectDuration = React.useCallback((projectId: string): string => {
    const id = parseInt(projectId);
    const project = projectsMap.get(id);
    return project ? project.duration : "";
  }, [projectsMap]);

  const getUniqueProjects = (): string[] => {
    if (!dataReturned) return [];
    const projects = new Set<string>();
    dataReturned.forEach(team => {
      const projectName = getProjectName(team.project_id);
      projects.add(projectName);
    });
    return Array.from(projects).sort();
  };

  const getAllProjectsFromJson = (): string[] => {
    if (projectsMap.size === 0) return [];
    const projects = new Set<string>();
    projectsMap.forEach(project => {
      projects.add(project.name);
    });
    return Array.from(projects).sort();
  };

  const applyFilters = React.useCallback(() => {
    if (!dataReturned) return;

    let filtered = [...dataReturned];

    if (projectFilter === "known") {
      filtered = filtered.filter(team => {
        const id = parseInt(team.project_id);
        return projectsMap.has(id);
      });
    } else if (projectFilter === "unknown") {
      filtered = filtered.filter(team => {
        const id = parseInt(team.project_id);
        return !projectsMap.has(id);
      });
    }

    if (specificProjectFilter !== "all") {
      filtered = filtered.filter(team => {
        const projectName = getProjectName(team.project_id);
        return projectName === specificProjectFilter;
      });
    }

    setFilteredData(filtered);
  }, [dataReturned, projectFilter, specificProjectFilter, projectsMap, getProjectName]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadProjectsData = async () => {
    try {
      const response = await fetch("/projects.json");
      if (!response.ok) {
        throw new Error("Failed to fetch projects data");
      }
      const projects: ProjectInfo[] = await response.json();
      
      const map = new Map<number, ProjectInfo>();
      projects.forEach(project => {
        map.set(project.project_id, project);
      });
      setProjectsMap(map);
    } catch (error) {
      console.error("Error loading projects data:", error);
    }
  };

  const handleTeamClick = (team: ResponseData) => {
    const firstUser = team.users[0];
    if (firstUser) {
      const intraUrl = `https://profile.intra.42.fr/users/${firstUser.login}`;
      window.open(intraUrl, '_blank');
    }
  };

    const functionfetchdata = React.useCallback(async (campusId?: number, page?: number, loadMore?: boolean) => {
    try {
      if (!loadMore) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const campusParam = campusId || selectedCampus.id;
      const pageParam = page || 1;
      
      const data = await fetch(`/api/slots?campus=${campusParam}&page=${pageParam}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!data.ok) {
        setDataReturned(undefined);
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }
      
      const response = await data.json();
      
      if (loadMore) {
        setDataReturned(prev => prev ? [...prev, ...response] : response);
      } else {
        setDataReturned(response);
      }
      
      setIsLoading(false);
      setIsLoadingMore(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setDataReturned(undefined);
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedCampus.id]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/who", {
        method: "GET",
        credentials: "include",
      });
      
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        
        // Check if user is an admin using the dedicated endpoint
        try {
          const adminCheckResponse = await fetch("/api/check-admin", {
            method: "GET",
            credentials: "include",
          });
          
          if (adminCheckResponse.ok) {
            const adminData = await adminCheckResponse.json();
            setIsAdminUser(adminData.isAdmin || false);
          } else {
            setIsAdminUser(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdminUser(false);
        }
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  React.useEffect(() => {
    loadProjectsData();
    functionfetchdata();
    fetchCurrentUser();
  }, [selectedCampus, functionfetchdata]);

  const handleLoadMore = () => {
    if (!isLoadingMore) {
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      functionfetchdata(selectedCampus.id, nextPage, true);
    }
  };

  const handleCampusChange = (campus: CampusType) => {
    setSelectedCampus(campus);
    setPageNumber(1);
  };

  const handleFiltersChange = (
    newProjectFilter: ProjectFilterType,
    newSpecificProjectFilter: SpecificProjectFilterType
  ) => {
    setProjectFilter(newProjectFilter);
    setSpecificProjectFilter(newSpecificProjectFilter);
  };

  const handleRetryAccess = () => {
    functionfetchdata();
  };

  React.useEffect(() => {
    loadProjectsData();
    functionfetchdata();
  }, [selectedCampus]);

  //   "Render state - isLoading:",
  //   isLoading,
  //   "dataReturned:",
  //   dataReturned
  // );

  return (
    <div className="flex flex-1 items-center justify-start overflow-x-hidden flex-col z-10 relative p-6">
      {currentUser && isAdminUser && (
        <div className="fixed top-6 left-6 z-40 flex flex-col gap-3">
          <button
            onClick={() => setShowAdminPanel(true)}
            className="w-14 h-14 bg-[#0070ef]/20 hover:bg-[#0070ef]/30 border-2 border-[#0070ef]/40 hover:border-[#0070ef]/60 text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-105"
            title="Admin Panel"
          >
            <span className="text-xl font-bold font-Tektur">★</span>
          </button>
          <button
            onClick={() => setShowBannedUsers(true)}
            className="w-14 h-14 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/40 hover:border-red-500/60 text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-105"
            title="Banned Users"
          >
            <span className="text-xl font-bold font-Tektur">🚫</span>
          </button>
          <button
            onClick={() => setShowRateLimitStats(true)}
            className="w-14 h-14 bg-cyan-500/20 hover:bg-cyan-500/30 border-2 border-cyan-500/40 hover:border-cyan-500/60 text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-105"
            title="Rate Limit Monitor"
          >
            <span className="text-xl font-bold font-Tektur">📊</span>
          </button>
        </div>
      )}

      <VipAdmin
        isVisible={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />
      
      <BannedUsersPopup
        isVisible={showBannedUsers}
        onClose={() => setShowBannedUsers(false)}
      />

      <RateLimitStatsPopup
        isVisible={showRateLimitStats}
        onClose={() => setShowRateLimitStats(false)}
      />

      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <LaoderComp />
        </div>
      ) : dataReturned && Array.isArray(dataReturned) ? (
        <div className="w-full cursor-pointer bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex flex-1 flex-col p-8 space-y-6">
          <VipHeader
            selectedCampus={selectedCampus}
            teamCount={filteredData?.length || 0}
            onCampusChange={handleCampusChange}
            projectFilter={projectFilter}
            specificProjectFilter={specificProjectFilter}
            uniqueProjects={getUniqueProjects()}
            allProjects={getAllProjectsFromJson()}
            onFiltersChange={handleFiltersChange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <TeamGrid
            filteredTeams={filteredData || []}
            getProjectName={getProjectName}
            getProjectDifficulty={getProjectDifficulty}
            getProjectDuration={getProjectDuration}
            handleTeamClick={handleTeamClick}
          />

          {filteredData && filteredData.length > 0 && (
            <LoadMore
              hasMore={true}
              isLoading={isLoadingMore}
              onLoadMore={handleLoadMore}
            />
          )}
        </div>
      ) : dataReturned === undefined ? (
        <AccessDenied
          title="VIP Access Required"
          message="This exclusive area is reserved for VIP members only. You need special authorization to access teams and projects data."
          showRetry={true}
          onRetry={handleRetryAccess}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default VipPage;
