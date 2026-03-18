"use client";
import React from "react";
import { ProgressBar } from "./progress.component";
import { RankComponent } from "@/component/dashboard/dashboard";
import { UserData } from "@/component/navbar/navbar.types";
import { cloneData } from "./progress.types";
import { BsLayoutSidebar, BsGridFill } from "react-icons/bs";

const SkeletonCard: React.FC = () => (
  <div className="flex flex-col w-full h-auto border-4 theme-border-strong bg-gray-950/98 py-6 px-3 gap-6 relative" style={{ fontFamily: "var(--font-ui)", boxShadow: "4px 4px 0 var(--theme-shadow-sm)" }}>
    <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 theme-border" />
    <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 theme-border" />
    <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 theme-border" />
    <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 theme-border" />
    {/* Avatar - same size as RankComponent (160px ring, 120px avatar) */}
    <div className="w-full flex justify-center items-center pt-4 pb-2 min-h-[160px]">
      <div className="w-[120px] h-[120px] rounded-full border-4 theme-border overflow-hidden skeleton-shimmer flex-shrink-0" style={{ boxShadow: "4px 4px 0 var(--theme-shadow-sm)" }} />
    </div>
    {/* Middle section - matches RankComponent gap-3 */}
    <div className="w-full flex flex-col items-center gap-3">
      {/* Username - px-4 py-2 */}
      <div className="w-full px-4">
        <div className="h-8 border-2 theme-border overflow-hidden skeleton-shimmer" style={{ boxShadow: "2px 2px 0 var(--theme-shadow-sm)" }} />
      </div>
      {/* Level - text-[18px] */}
      <div className="w-14 h-6 border-2 theme-border overflow-hidden skeleton-shimmer" style={{ boxShadow: "2px 2px 0 var(--theme-shadow-sm)" }} />
      {/* Name - min-h-[36px] */}
      <div className="w-full px-2">
        <div className="h-9 min-h-[36px] border-2 theme-border overflow-hidden skeleton-shimmer mx-auto" style={{ boxShadow: "2px 2px 0 var(--theme-shadow-sm)", maxWidth: "140px" }} />
      </div>
      {/* Status - px-3 py-1.5 min-w-[100px] */}
      <div className="w-24 h-7 border-2 theme-border overflow-hidden skeleton-shimmer" style={{ boxShadow: "2px 2px 0 var(--theme-shadow-sm)" }} />
    </div>
  </div>
);

const SkeletonListCard: React.FC = () => (
  <div className="flex flex-row w-full min-h-[110px] border-4 theme-border-strong bg-gray-950/98 p-2 sm:p-4 gap-2 relative" style={{ fontFamily: "var(--font-ui)", boxShadow: "4px 4px 0 var(--theme-shadow-sm)" }}>
    <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 theme-border" />
    <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 theme-border" />
    <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 theme-border" />
    <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 theme-border" />
    {/* Image block */}
    <div className="w-[80px] sm:w-[110px] h-full flex-shrink-0 border-2 theme-border overflow-hidden skeleton-shimmer" style={{ boxShadow: "3px 3px 0 var(--theme-shadow-sm)", minHeight: "90px" }} />
    <div className="flex-1 flex flex-col gap-2 min-w-0">
      {/* Top row */}
      <div className="flex gap-2">
        <div className="h-8 flex-1 border-2 theme-border overflow-hidden skeleton-shimmer" style={{ boxShadow: "2px 2px 0 var(--theme-shadow-sm)" }} />
      </div>
      {/* Name */}
      <div className="h-4 w-[75%] border-2 theme-border overflow-hidden skeleton-shimmer" style={{ boxShadow: "2px 2px 0 var(--theme-shadow-sm)" }} />
      {/* Level bar */}
      <div className="h-3 w-full border-2 theme-border overflow-hidden skeleton-shimmer" style={{ boxShadow: "inset 2px 2px 0 rgba(0,0,0,0.15)" }} />
    </div>
  </div>
);

const Progress = () => {
  const [pageNumber, setPageNumber] = React.useState(1);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [userData, setUserData] = React.useState<UserData[] | null[]>(
    cloneData
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("grid");
  const [filteredUsers, setFilteredUsers] = React.useState<UserData[] | null[]>(userData);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isFetchingData, setIsFetchingData] = React.useState(true); // Start with true for initial load
  const [enable3D, setEnable3D] = React.useState(false); // 3D effect toggle

  // Filter users based on search query
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(userData);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    const filtered = userData.filter((user): user is UserData => {
      if (!user) return false;
      const fullName = user.fullname?.toLowerCase() || "";
      const login = user.login?.toLowerCase() || "";
      return fullName.includes(query) || login.includes(query);
    });

    // Simulate a slight delay to show loading state
    const timer = setTimeout(() => {
      setFilteredUsers(filtered);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, userData]);


  return (
    <div className="flex flex-1 z-10 items-center overflow-auto justify-start flex-col">
      {/* Rank Controls - softer, unified design */}
      <div
        className="relative w-full mx-4 sm:mx-6 md:mx-8 mt-2 sm:mt-4 mb-2 p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 bg-gray-950/90 backdrop-blur-sm border border-white/10"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        {/* Row 1: Filters (Year, Month, Cursus, Campus) + Apply + Global */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <ProgressBar setUserData={setUserData} pageNumber={pageNumber} setPageNumber={setPageNumber} setIsFetchingData={setIsFetchingData} setIsLoadingMore={setIsLoadingMore} />
        </div>

        {/* Row 2: Search + View options */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-3 border-t border-white/10">
          <div className="flex-1 relative min-w-0 order-2 sm:order-1">
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 bg-white/5 border border-white/10 rounded-md theme-text focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 text-[10px] sm:text-[11px] font-medium placeholder:text-slate-500 transition-colors"
            />
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex rounded-lg overflow-hidden border border-white/10 sm:shrink-0 order-1 sm:order-2">
            <button onClick={() => setViewMode("list")} className={`px-3 sm:px-4 py-2 text-[10px] font-medium transition-colors ${viewMode === "list" ? "bg-white/15 text-white border-r border-white/10" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border-r border-white/10"}`} title="List View">
              <BsLayoutSidebar className="w-4 h-4 sm:mr-1 inline" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button onClick={() => setViewMode("grid")} className={`px-3 sm:px-4 py-2 text-[10px] font-medium transition-colors ${viewMode === "grid" ? "bg-white/15 text-white border-r border-white/10" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border-r border-white/10"}`} title="Grid View">
              <BsGridFill className="w-4 h-4 sm:mr-1 inline" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button onClick={() => setEnable3D(!enable3D)} className={`px-3 sm:px-4 py-2 text-[10px] font-medium transition-colors ${enable3D ? "bg-white/15 text-white" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"}`} title={enable3D ? "Disable 3D" : "Enable 3D"}>
              <span>3D</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`items-center justify-start flex-col p-4 sm:p-6 md:p-8 w-full gap-2 flex overflow-y-auto overflow-x-hidden flex-1 min-h-0 pb-20 sm:pb-8 ${
        viewMode === "grid" ? "" : "justify-center"
      }`}>
        {isSearching || isFetchingData ? (
          // Pixelated skeleton - same layout as actual data (top 3 podium + grid)
          <div className="w-full flex flex-col gap-6">
            <p className="text-[10px] font-bold theme-text-muted uppercase tracking-wider text-center" style={{ fontFamily: "var(--font-ui)" }}>
              {isSearching ? "Searching..." : "Loading..."}
            </p>
            {viewMode === "grid" ? (
              <div className="w-full flex flex-col gap-6">
                {/* Top 3 podium skeleton - matches actual layout */}
                <div className="w-full mb-8 md:mb-12 px-2 md:px-4">
                  {/* Mobile: Vertical Stack */}
                  <div className="flex md:hidden flex-col items-center gap-4 max-w-[320px] mx-auto">
                    <div className="w-full"><SkeletonCard /></div>
                    <div className="w-full"><SkeletonCard /></div>
                    <div className="w-full"><SkeletonCard /></div>
                  </div>
                  {/* Desktop: Horizontal Podium (2nd left, 1st center, 3rd right) */}
                  <div className="hidden md:flex relative justify-center items-start gap-6 max-w-[900px] mx-auto min-h-[500px]">
                    <div className="flex flex-col items-center flex-1 max-w-[240px]" style={{ paddingTop: "60px" }}>
                      <div className="w-full"><SkeletonCard /></div>
                    </div>
                    <div className="flex flex-col items-center flex-1 max-w-[260px]" style={{ paddingTop: "0px" }}>
                      <div className="w-full"><SkeletonCard /></div>
                    </div>
                    <div className="flex flex-col items-center flex-1 max-w-[240px]" style={{ paddingTop: "120px" }}>
                      <div className="w-full"><SkeletonCard /></div>
                    </div>
                  </div>
                </div>
                {/* Regular grid skeleton - same as rank 4+ */}
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-2 items-center">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-[100%] tillme:w-[850px]">
                    <SkeletonListCard />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 w-full h-full min-h-[400px]">
            <div className="relative mb-6">
              <div className="w-20 h-20 md:w-24 md:h-24 border-2 theme-border bg-gray-950/98 flex items-center justify-center" style={{ boxShadow: "3px 3px 0 var(--theme-shadow-sm)" }}>
                <div className="text-4xl md:text-5xl">🔍</div>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-bold theme-text font-Tektur mb-3">
              {searchQuery ? "User Not Found" : "Nothing Found"}
            </h3>

            <p className="theme-text-muted font-Tektur text-center text-sm md:text-base max-w-md mb-6">
              {searchQuery 
                ? `No user found matching "${searchQuery}" in the first page. The user might be in the next pages.`
                : "No users match your current search criteria. Try adjusting your filters or search terms."
              }
            </p>

            {searchQuery && userData[0] != null && (
              <button
                className={`px-8 py-3 border-2 theme-border-strong bg-[var(--theme-bg)] theme-text font-bold text-sm uppercase tracking-wider
                  transition-all duration-200 active:translate-y-0.5
                  hover:border-[var(--theme-primary-muted)] cursor-pointer
                  ${isLoadingMore ? "opacity-70 cursor-not-allowed" : ""}`}
                style={{ boxShadow: "3px 3px 0 var(--theme-shadow-sm)" }}
                onClick={() => {
                  if (!isLoadingMore) {
                    setPageNumber((prev) => prev + 1);
                  }
                }}
              >
                {isLoadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Load More to Check Next Page"
                )}
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              // Grid View with Olympic Podium for Top 3
              <div className="w-full flex flex-col gap-6">
                {/* Olympic Podium - Top 3 */}
                {filteredUsers.length > 0 && (
                  <div className="w-full mb-8 md:mb-12 px-2 md:px-4">
                        {/* Mobile: Vertical Stack */}
                        <div className="flex md:hidden flex-col items-center gap-4 max-w-[320px] mx-auto">
                          {filteredUsers[0] && (
                            <div className="w-full">
                              <RankComponent userData={filteredUsers[0]} rank={1} isGridView={true} podiumPosition="gold" enable3D={enable3D} />
                            </div>
                          )}
                          {filteredUsers[1] && (
                            <div className="w-full">
                              <RankComponent userData={filteredUsers[1]} rank={2} isGridView={true} podiumPosition="silver" enable3D={enable3D} />
                            </div>
                          )}
                          {filteredUsers[2] && (
                            <div className="w-full">
                              <RankComponent userData={filteredUsers[2]} rank={3} isGridView={true} podiumPosition="bronze" enable3D={enable3D} />
                            </div>
                          )}
                        </div>

                        {/* Desktop: Horizontal Podium */}
                        <div className="hidden md:flex relative justify-center items-start gap-6 max-w-[900px] mx-auto min-h-[500px]">
                          {/* 2nd Place - Silver (Left, Medium Height) */}
                          {filteredUsers[1] && (
                            <div className="flex flex-col items-center flex-1 max-w-[240px]" style={{ paddingTop: '60px' }}>
                              <div className="w-full">
                                <RankComponent userData={filteredUsers[1]} rank={2} isGridView={true} podiumPosition="silver" enable3D={enable3D} />
                              </div>
                            </div>
                          )}

                          {/* 1st Place - Gold (Middle, Highest) */}
                          {filteredUsers[0] && (
                            <div className="flex flex-col items-center flex-1 max-w-[260px]" style={{ paddingTop: '0px' }}>
                              <div className="w-full">
                                <RankComponent userData={filteredUsers[0]} rank={1} isGridView={true} podiumPosition="gold" enable3D={enable3D} />
                              </div>
                            </div>
                          )}

                          {/* 3rd Place - Bronze (Right, Lowest) */}
                          {filteredUsers[2] && (
                            <div className="flex flex-col items-center flex-1 max-w-[240px]" style={{ paddingTop: '120px' }}>
                              <div className="w-full">
                                <RankComponent userData={filteredUsers[2]} rank={3} isGridView={true} podiumPosition="bronze" enable3D={enable3D} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                )}

                {/* Regular Grid - Remaining Users (from rank 4 onwards) */}
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                  {filteredUsers.map((fakedata: UserData | null, index: number) => {
                    if (index < 3) return null; // Skip top 3, already displayed in podium
                    return (
                      <div key={index} className="w-full">
                        <RankComponent userData={fakedata} rank={index + 1} isGridView={true} enable3D={enable3D} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // List View
              <div className="w-full flex flex-col gap-2 items-center">
                {filteredUsers.map((fakedata: UserData | null, index: number) => (
                  <div
                    key={index}
                    className="w-[100%] tillme:w-[850px] rounded-md"
                  >
                    <RankComponent
                      userData={fakedata}
                      rank={index + 1}
                      isGridView={false}
                      podiumPosition={index < 3 ? (index === 0 ? "gold" : index === 1 ? "silver" : "bronze") : undefined}
                      enable3D={enable3D}
                    />
                  </div>
                ))}
              </div>
            )}
            {userData[0] != null && (
              <div className="w-[100%] min-h-[80px] flex items-center justify-center mt-4 pb-8 sm:pb-12">
                <button
                  className={`px-8 py-3 border-2 theme-border bg-gray-950/98 theme-text font-bold text-sm uppercase tracking-wider
                  transition-all duration-200 active:translate-y-0.5
                  hover:border-[var(--theme-border-strong)] cursor-pointer
                  ${isLoadingMore ? "opacity-70 cursor-not-allowed" : ""}`}
                  style={{ boxShadow: "3px 3px 0 var(--theme-shadow-sm)" }}
                  onClick={() => {
                    if (!isLoadingMore) {
                      setPageNumber((prev) => prev + 1);
                    }
                  }}
                >
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Progress;
