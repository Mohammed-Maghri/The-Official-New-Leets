"use client";
import React from "react";
import { LaoderComp } from "@/app/teams/teams.component";
import { ContextCreator } from "@/component/context/context";

import {
  ResponseData,
  CampusType,
  ProjectInfo,
  ProjectFilterType,
  SpecificProjectFilterType,
} from "./teams.types";

import { TeamsHeader, TeamGrid, LoadMore } from "./components";

const TeamsPage = () => {
  const context = React.useContext(ContextCreator);
  const userData = context?.userData;
  
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
    name: userData?.campus_name || "Khouribga",
    id: userData?.campus_id || 16,
  });
  const [projectsMap, setProjectsMap] = React.useState<Map<number, ProjectInfo>>(
    new Map()
  );
  const [projectFilter, setProjectFilter] = React.useState<ProjectFilterType>("all");
  const [specificProjectFilter, setSpecificProjectFilter] = React.useState<SpecificProjectFilterType>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [dateFilter, setDateFilter] = React.useState<"all" | "today" | "yesterday" | "2days">("all");

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

  const loadProjectsData = React.useCallback(async () => {
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
  }, []);

  const handleTeamClick = (team: ResponseData) => {
    const firstUser = team.users[0];
    if (firstUser) {
      const intraUrl = `https://profile.intra.42.fr/users/${firstUser.login}`;
      window.open(intraUrl, '_blank');
    }
  };

    const functionfetchdata = React.useCallback(async (campusId?: number, page?: number, loadMore?: boolean, date?: string) => {
    try {
      if (!loadMore) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const campusParam = campusId || selectedCampus.id;
      const pageParam = page || 1;
      const dateParam = date || dateFilter;
      
      const data = await fetch(`/api/slots?campus=${campusParam}&page=${pageParam}&date=${dateParam}`, {
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
  }, [selectedCampus.id, dateFilter]);

  // Update campus when user data loads
  React.useEffect(() => {
    if (userData?.campus_id && userData?.campus_name) {
      setSelectedCampus({
        name: userData.campus_name,
        id: userData.campus_id,
      });
    }
  }, [userData]);

  React.useEffect(() => {
    loadProjectsData();
  }, [loadProjectsData]);

  React.useEffect(() => {
    functionfetchdata();
  }, [functionfetchdata]);

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

  //   "Render state - isLoading:",
  //   isLoading,
  //   "dataReturned:",
  //   dataReturned
  // );

  return (
    <div className="flex flex-1 items-center justify-start overflow-x-hidden flex-col z-10 relative p-6">

      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <LaoderComp />
        </div>
      ) : dataReturned && Array.isArray(dataReturned) ? (
        <div className="w-full cursor-pointer bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex flex-1 flex-col p-8 space-y-6">
          <TeamsHeader
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
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
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
      ) : (
        <div className="w-full cursor-pointer bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex flex-1 flex-col p-8 space-y-6">
          <div className="flex items-center justify-center h-full">
            <p className="text-white/50 font-Tektur">No data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
