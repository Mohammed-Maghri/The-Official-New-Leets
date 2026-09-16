"use client";
import React from "react";
import { ContextCreator } from "@/component/context/context";
import { EvaluationData, CampusType, CampusList } from "./evaluations.types";
import { motion } from "motion/react";
import { FaCaretDown } from "react-icons/fa";

const EvaluationsPage = () => {
  const context = React.useContext(ContextCreator);
  const userData = context?.userData;

  const [evaluations, setEvaluations] = React.useState<EvaluationData[] | null>(null);
  const [filteredEvaluations, setFilteredEvaluations] = React.useState<EvaluationData[] | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [selectedCampus, setSelectedCampus] = React.useState<CampusType>({
    name: userData?.campus_name || "Khouribga",
    id: userData?.campus_id || 16,
  });
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [statusFilter, setStatusFilter] = React.useState<"all" | "passed" | "failed">("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [campusDropdownOpen, setCampusDropdownOpen] = React.useState<boolean>(false);
  const [pageNumber, setPageNumber] = React.useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = React.useState<boolean>(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const campusRef = React.useRef<HTMLDivElement>(null);
  const campusTriggerRef = React.useRef<HTMLDivElement>(null);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        campusRef.current &&
        !campusRef.current.contains(event.target as Node) &&
        campusTriggerRef.current &&
        !campusTriggerRef.current.contains(event.target as Node)
      ) {
        setCampusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchEvaluations = React.useCallback(async (campusId?: number, date?: string, page?: number, loadMore?: boolean) => {
    try {
      if (!loadMore) {
        setIsLoading(true);
        setApiError(null);
      } else {
        setIsLoadingMore(true);
      }

      const campusParam = campusId || selectedCampus.id;
      const dateParam = date || selectedDate;
      const pageParam = page || 1;

      const response = await fetch(
        `/api/evaluations?campus=${campusParam}&date=${dateParam}&page=${pageParam}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status >= 502 && response.status <= 504) {
          setApiError("42 API is temporarily unavailable. Please try again in a few minutes.");
        } else {
          setApiError("Failed to fetch evaluations. Please try again.");
        }
        setEvaluations([]);
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      const data = await response.json();

      // Check if API was unavailable
      const apiStatus = response.headers.get('X-API-Status');
      if (apiStatus === 'unavailable') {
        setApiError("42 API is temporarily down. Showing cached data if available.");
      } else {
        setApiError(null);
      }

      if (loadMore) {
        setEvaluations(prev => prev ? [...prev, ...data] : data);
      } else {
        setEvaluations(data);
      }

      setIsLoading(false);
      setIsLoadingMore(false);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      setApiError("Network error. Please check your connection and try again.");
      setEvaluations([]);
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedCampus.id, selectedDate]);

  React.useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  // Apply status filter and search
  React.useEffect(() => {
    if (!evaluations) {
      setFilteredEvaluations(null);
      return;
    }

    let filtered = evaluations;

    // Apply status filter
    if (statusFilter === "passed") {
      filtered = filtered.filter(e => e.passed);
    } else if (statusFilter === "failed") {
      filtered = filtered.filter(e => !e.passed);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => {
        const correctorMatch = e.corrector.login.toLowerCase().includes(query);
        const correctedMatch = e.correcteds.some(c =>
          c.login.toLowerCase().includes(query)
        );
        const projectMatch = e.project.name.toLowerCase().includes(query);
        return correctorMatch || correctedMatch || projectMatch;
      });
    }

    setFilteredEvaluations(filtered);
  }, [evaluations, statusFilter, searchQuery]);

  const handleCampusChange = (campus: CampusType) => {
    setSelectedCampus(campus);
    setPageNumber(1);
    setCampusDropdownOpen(false);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setPageNumber(1);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore) {
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      fetchEvaluations(selectedCampus.id, selectedDate, nextPage, true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-1 items-center justify-start overflow-x-hidden flex-col z-10 relative p-6">
      {isLoading ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#616161]"></div>
          <div className="text-center space-y-2">
            <p className="text-[#151515] font-Tektur text-lg">Loading evaluations...</p>
            <p className="text-[#3e3d35] font-Tektur text-sm">This may take a few seconds due to 42 API response time</p>
          </div>
        </div>
      ) : (
        <div className="w-full cursor-pointer bg-[#dce8f8]  rounded-xl border border-[#a0a6b0] flex flex-1 flex-col p-8 space-y-6">
          {/* API Error Banner */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-[#d9e5f5] border border-[#a0a6b0] rounded-lg p-4 flex items-center gap-3"
            >
              <span className="text-[#3e3d35] text-xl">⚠️</span>
              <p className="text-[#3e3d35] font-Tektur">{apiError}</p>
            </motion.div>
          )}

          {/* Header */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-Tektur text-[#151515]">
                Evaluations
              </h1>

              {/* Search Input */}
              <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:mx-6">
                <input
                  type="text"
                  placeholder="Search by username or project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#ece9d8]  border border-[#616161]/30 text-[#151515] placeholder-neutral-400 font-Tektur focus:outline-none focus:border-[#616161] transition-all duration-300"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Status Filter Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg border font-Tektur text-sm font-semibold transition-all duration-300 ${
                      statusFilter === "all"
                        ? "bg-[#ece9d8] border-[#616161] text-[#151515]"
                        : "bg-[#ece9d8] border-[#a0a6b0] text-[#151515] hover:border-[#616161]/50"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter("passed")}
                    className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg border font-Tektur text-sm font-semibold transition-all duration-300 ${
                      statusFilter === "passed"
                        ? "bg-[#ece9d8] border-[#a0a6b0] text-[#3e3d35]"
                        : "bg-[#ece9d8] border-[#a0a6b0] text-[#3e3d35] hover:border-[#a0a6b0]"
                    }`}
                  >
                    Passed
                  </button>
                  <button
                    onClick={() => setStatusFilter("failed")}
                    className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg border font-Tektur text-sm font-semibold transition-all duration-300 ${
                      statusFilter === "failed"
                        ? "bg-[#ece9d8] border-[#a0a6b0] text-[#3e3d35]"
                        : "bg-[#ece9d8] border-[#a0a6b0] text-[#3e3d35] hover:border-[#a0a6b0]"
                    }`}
                  >
                    Failed
                  </button>
                </div>

                {/* Campus Dropdown */}
                <div className="relative">
                  <div
                    ref={campusTriggerRef}
                    onClick={() => setCampusDropdownOpen(!campusDropdownOpen)}
                    className="transition-all duration-200 cursor-pointer rounded-md border-solid border-[1px] border-[#a0a6b0] bg-[#ece9d8] px-4 py-2.5 flex items-center space-x-2 hover:bg-[#ece9d8]"
                  >
                    <span className="text-sm md:text-base font-semibold text-[#151515] font-Tektur">
                      {selectedCampus.name}
                    </span>
                    <FaCaretDown
                      className={`text-[#151515] transition-transform duration-300 text-xs ${
                        campusDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {campusDropdownOpen && (
                    <motion.div
                      ref={campusRef}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-64 md:w-72 bg-[#ece9d8] border border-[#616161]/50 rounded-lg  z-[9999] max-h-80 overflow-auto"
                    >
                      {CampusList.map((campus) => (
                        <div
                          key={campus.id}
                          onClick={() => handleCampusChange(campus)}
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

                {/* Date Picker */}
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="transition-all duration-200 cursor-pointer rounded-md border-solid border-[1px] border-[#a0a6b0] bg-[#ece9d8] px-4 py-2.5 text-[#151515] font-Tektur text-sm md:text-base focus:outline-none focus:border-[#616161]/50"
                />

                {/* Count Badge */}
                <div className="bg-[#ece9d8] px-4 py-2.5 rounded-lg border border-[#a0a6b0]">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm md:text-base font-bold text-[#151515] font-Tektur">
                      {filteredEvaluations?.length || 0}
                    </span>
                    <span className="text-sm text-[#3e3d35] font-Tektur">
                      evaluation{filteredEvaluations?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Evaluations Grid */}
          {filteredEvaluations && filteredEvaluations.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredEvaluations.map((evaluation) => (
                  <motion.div
                    key={evaluation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#ece9d8] rounded-xl border border-[#a0a6b0] p-4 md:p-5 hover:border-[#616161]/50 transition-all duration-300"
                  >
                    {/* Project Name */}
                    <div className="mb-3 pb-3 border-b border-[#a0a6b0]">
                      <h3 className="text-[#151515] font-Tektur font-bold text-base md:text-lg line-clamp-1">
                        {evaluation.project.name}
                      </h3>
                    </div>

                    {/* Corrector */}
                    <div className="mb-3">
                      <p className="text-xs text-[#3e3d35] font-Tektur mb-2">Corrector</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <img
                            src={evaluation.corrector.profile_picture || `https://ui-avatars.com/api/?name=${evaluation.corrector.login}&background=0070ef&color=fff&size=128`}
                            alt={evaluation.corrector.login}
                            className="w-8 h-8 rounded-full border-2 border-[#a0a6b0] flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${evaluation.corrector.login}&background=0070ef&color=fff&size=128`;
                            }}
                          />
                          <p className="text-[#151515] font-Tektur text-sm font-medium truncate">
                            {evaluation.corrector.login}
                          </p>
                        </div>
                        <a
                          href={`https://profile.intra.42.fr/users/${evaluation.corrector.login}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 px-2 py-1 bg-[#ece9d8] hover:bg-[#ece9d8] border border-[#a0a6b0] hover:border-[#616161] rounded text-xs font-Tektur text-[#151515] transition-all duration-200 flex-shrink-0"
                        >
                          View
                        </a>
                      </div>
                    </div>

                    {/* Correcteds */}
                    <div className="mb-3">
                      <p className="text-xs text-[#3e3d35] font-Tektur mb-2">Corrected</p>
                      <div className="space-y-1.5">
                        {evaluation.correcteds.map((corrected) => (
                          <div key={corrected.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <img
                                src={corrected.profile_picture || `https://ui-avatars.com/api/?name=${corrected.login}&background=random&color=fff&size=128`}
                                alt={corrected.login}
                                className="w-7 h-7 rounded-full border-2 border-[#a0a6b0] flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${corrected.login}&background=random&color=fff&size=128`;
                                }}
                              />
                              <p className="text-[#3e3d35] font-Tektur text-xs truncate">
                                {corrected.login}
                              </p>
                            </div>
                            <a
                              href={`https://profile.intra.42.fr/users/${corrected.login}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 px-2 py-1 bg-[#ece9d8] hover:bg-[#ece9d8] border border-[#a0a6b0] hover:border-[#616161] rounded text-xs font-Tektur text-[#151515] transition-all duration-200 flex-shrink-0"
                            >
                              View
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Score and Status */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#a0a6b0]">
                      <div className="px-3 py-1.5 rounded-lg font-Tektur font-bold text-sm bg-[#ece9d8] text-[#151515] border border-[#a0a6b0]">
                        {evaluation.final_mark !== null ? `${evaluation.final_mark}/100` : "N/A"}
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg font-Tektur font-semibold text-sm border ${
                        evaluation.passed
                          ? "bg-[#ece9d8] text-[#3e3d35] border-[#a0a6b0]"
                          : "bg-[#ece9d8] text-[#3e3d35] border-[#a0a6b0]"
                      }`}>
                        {evaluation.passed ? "✓ Pass" : "✗ Fail"}
                      </div>
                    </div>

                    {/* Date */}
                    {evaluation.filled_at && (
                      <div className="mt-2 text-xs text-[#3e3d35] font-Tektur text-center">
                        {formatDate(evaluation.filled_at)}
                      </div>
                    )}

                    {/* Comment Preview */}
                    {evaluation.comment && (
                      <div className="mt-4 pt-4 border-t border-[#a0a6b0]">
                        <p className="text-[#151515] font-Tektur text-sm leading-relaxed">
                          {evaluation.comment}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              {evaluations && evaluations.length >= 100 && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-6 py-3 bg-[#ece9d8] hover:bg-[#ece9d8] border border-[#a0a6b0] hover:border-[#616161] rounded-lg text-[#151515] font-Tektur font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-[#151515] font-Tektur text-lg">No evaluations found for this date</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EvaluationsPage;
