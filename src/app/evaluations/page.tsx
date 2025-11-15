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
        setEvaluations([]);
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }
      
      const data = await response.json();
      
      if (loadMore) {
        setEvaluations(prev => prev ? [...prev, ...data] : data);
      } else {
        setEvaluations(data);
      }
      
      setIsLoading(false);
      setIsLoadingMore(false);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
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
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#0070ef]"></div>
        </div>
      ) : (
        <div className="w-full cursor-pointer bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex flex-1 flex-col p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-Tektur text-white">
                Evaluations
              </h1>
              
              {/* Search Input */}
              <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:mx-6">
                <input
                  type="text"
                  placeholder="Search by username or project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0070ef]/10 backdrop-blur-sm border border-[#0070ef]/30 text-white placeholder-gray-400 font-Tektur focus:outline-none focus:border-[#0070ef] transition-all duration-300"
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Filter Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg border font-Tektur text-sm font-semibold backdrop-blur-sm transition-all duration-300 ${
                      statusFilter === "all"
                        ? "bg-[#0070ef]/20 border-[#0070ef] text-white"
                        : "bg-[#0070ef]/10 border-[#0070ef]/30 text-white/80 hover:bg-[#0070ef]/20"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter("passed")}
                    className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg border font-Tektur text-sm font-semibold backdrop-blur-sm transition-all duration-300 ${
                      statusFilter === "passed"
                        ? "bg-green-500/20 border-green-500 text-green-300"
                        : "bg-green-500/10 border-green-500/30 text-green-400/80 hover:bg-green-500/20"
                    }`}
                  >
                    Passed
                  </button>
                  <button
                    onClick={() => setStatusFilter("failed")}
                    className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg border font-Tektur text-sm font-semibold backdrop-blur-sm transition-all duration-300 ${
                      statusFilter === "failed"
                        ? "bg-red-500/20 border-red-500 text-red-300"
                        : "bg-red-500/10 border-red-500/30 text-red-400/80 hover:bg-red-500/20"
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
                    className="flex items-center space-x-2 bg-[#0070ef]/10 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-[#0070ef]/30 cursor-pointer hover:bg-[#0070ef]/20 transition-all duration-300"
                  >
                    <span className="text-sm md:text-base font-semibold text-white font-Tektur">
                      {selectedCampus.name}
                    </span>
                    <FaCaretDown 
                      className={`text-white/80 transition-transform duration-300 text-xs ${
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
                      className="absolute top-full left-0 mt-2 w-64 md:w-72 bg-[#001226] border border-[#0070ef]/50 rounded-lg shadow-2xl z-[9999] max-h-80 overflow-auto"
                    >
                      {CampusList.map((campus) => (
                        <div
                          key={campus.id}
                          onClick={() => handleCampusChange(campus)}
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

                {/* Date Picker */}
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="px-4 py-2.5 rounded-lg bg-[#0070ef]/10 backdrop-blur-sm border border-[#0070ef]/30 text-white font-Tektur text-sm md:text-base focus:outline-none focus:border-[#0070ef] transition-all duration-300"
                />

                {/* Count Badge */}
                <div className="bg-[#0070ef]/20 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-[#0070ef]/30">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm md:text-base font-bold text-white font-Tektur">
                      {filteredEvaluations?.length || 0}
                    </span>
                    <span className="text-sm text-gray-300 font-Tektur">
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
                    className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 p-4 md:p-5 hover:border-[#0070ef]/50 hover:shadow-lg hover:shadow-[#0070ef]/10 transition-all duration-300"
                  >
                    {/* Project Name */}
                    <div className="mb-3 pb-3 border-b border-white/10">
                      <h3 className="text-white font-Tektur font-bold text-base md:text-lg line-clamp-1">
                        {evaluation.project.name}
                      </h3>
                    </div>

                    {/* Corrector */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 font-Tektur mb-2">Corrector</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <img
                            src={evaluation.corrector.profile_picture || `https://ui-avatars.com/api/?name=${evaluation.corrector.login}&background=0070ef&color=fff&size=128`}
                            alt={evaluation.corrector.login}
                            className="w-8 h-8 rounded-full border-2 border-green-500/50 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${evaluation.corrector.login}&background=0070ef&color=fff&size=128`;
                            }}
                          />
                          <p className="text-white font-Tektur text-sm font-medium truncate">
                            {evaluation.corrector.login}
                          </p>
                        </div>
                        <a
                          href={`https://profile.intra.42.fr/users/${evaluation.corrector.login}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 px-2 py-1 bg-[#0070ef]/20 hover:bg-[#0070ef]/30 border border-[#0070ef]/50 rounded text-xs font-Tektur text-white transition-all duration-200 flex-shrink-0"
                        >
                          View
                        </a>
                      </div>
                    </div>

                    {/* Correcteds */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 font-Tektur mb-2">Corrected</p>
                      <div className="space-y-1.5">
                        {evaluation.correcteds.map((corrected) => (
                          <div key={corrected.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <img
                                src={corrected.profile_picture || `https://ui-avatars.com/api/?name=${corrected.login}&background=random&color=fff&size=128`}
                                alt={corrected.login}
                                className="w-7 h-7 rounded-full border-2 border-blue-500/50 flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${corrected.login}&background=random&color=fff&size=128`;
                                }}
                              />
                              <p className="text-gray-300 font-Tektur text-xs truncate">
                                {corrected.login}
                              </p>
                            </div>
                            <a
                              href={`https://profile.intra.42.fr/users/${corrected.login}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded text-xs font-Tektur text-white transition-all duration-200 flex-shrink-0"
                            >
                              View
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Score and Status */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                      <div className="px-3 py-1.5 rounded-lg font-Tektur font-bold text-sm bg-[#0070ef]/20 text-white border border-[#0070ef]/50">
                        {evaluation.final_mark !== null ? `${evaluation.final_mark}/100` : "N/A"}
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg font-Tektur font-semibold text-sm border ${
                        evaluation.passed 
                          ? "bg-green-500/20 text-green-400 border-green-500/50"
                          : "bg-red-500/20 text-red-400 border-red-500/50"
                      }`}>
                        {evaluation.passed ? "✓ Pass" : "✗ Fail"}
                      </div>
                    </div>

                    {/* Date */}
                    {evaluation.filled_at && (
                      <div className="mt-2 text-xs text-gray-500 font-Tektur text-center">
                        {formatDate(evaluation.filled_at)}
                      </div>
                    )}

                    {/* Comment Preview */}
                    {evaluation.comment && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-white font-Tektur text-sm leading-relaxed">
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
                    className="px-6 py-3 bg-[#0070ef]/20 hover:bg-[#0070ef]/30 border border-[#0070ef]/50 rounded-lg text-white font-Tektur font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-white/50 font-Tektur text-lg">No evaluations found for this date</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EvaluationsPage;
