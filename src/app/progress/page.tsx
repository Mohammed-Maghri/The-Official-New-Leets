"use client";
import React from "react";
import { ProgressBar } from "./progress.component";
import { RankComponent } from "@/component/dashboard/dashboard";
import { UserData } from "@/component/navbar/navbar.types";
import { cloneData } from "./progress.types";
import { BsLayoutSidebar, BsGridFill } from "react-icons/bs";

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
    <div className="flex flex-1 z-10 items-center overflow-auto justify-start flex-col ">
      <ProgressBar setUserData={setUserData} pageNumber={pageNumber} setIsFetchingData={setIsFetchingData} />
      
      {/* Search Bar */}
      <div className="w-full px-4 py-3 bg-gray-800/50 border-b border-gray-700/50">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-900/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#0070ef]/50 font-Tektur text-sm"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Toggle Buttons */}
          <div className="flex gap-1 bg-gray-900/50 border border-gray-600/30 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 rounded transition-all duration-200 flex items-center gap-2 ${
                viewMode === "list"
                  ? "bg-[#0070ef]/30 border border-[#0070ef]/50 text-[#0070ef]"
                  : "text-gray-400 hover:text-white"
              }`}
              title="List View"
            >
              <BsLayoutSidebar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 rounded transition-all duration-200 flex items-center gap-2 ${
                viewMode === "grid"
                  ? "bg-[#0070ef]/30 border border-[#0070ef]/50 text-[#0070ef]"
                  : "text-gray-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <BsGridFill className="w-4 h-4" />
            </button>
          </div>

          {/* 3D Effect Toggle Button */}
          <button
            onClick={() => setEnable3D(!enable3D)}
            className={`px-3 py-2 rounded transition-all duration-200 flex items-center gap-2 ${
              enable3D
                ? "bg-[#0070ef]/30 border border-[#0070ef]/50 text-[#0070ef]"
                : "text-gray-400 hover:text-white bg-gray-900/50 border border-gray-600/30"
            }`}
            title={enable3D ? "Disable 3D Effect" : "Enable 3D Effect"}
          >
            <span className="text-base">3D</span>
          </button>
        </div>
      </div>

      <div className={`items-center justify-start flex-col p-2 sm:p-5 w-full gap-2 flex overflow-auto flex-1 ${
        viewMode === "grid" ? "px-4 sm:px-6" : "justify-center"
      }`}>
        {isSearching || isFetchingData ? (
          // Global Loading State - Hide Everything
          <div className="w-full flex-1 flex items-center justify-center min-h-[600px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-white font-Tektur text-lg">{isSearching ? "Searching..." : "Loading..."}</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 w-full h-full min-h-[400px]">
            <div className="relative mb-6">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-800/90 border border-gray-500/30 rounded-full flex items-center justify-center">
                <div className="text-4xl md:text-5xl">🔍</div>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-white font-Tektur mb-3">
              {searchQuery ? "User Not Found" : "Nothing Found"}
            </h3>

            <p className="text-gray-400 font-Tektur text-center text-sm md:text-base max-w-md mb-6">
              {searchQuery 
                ? `No user found matching "${searchQuery}" in the first page. The user might be in the next pages.`
                : "No users match your current search criteria. Try adjusting your filters or search terms."
              }
            </p>

            {searchQuery && userData[0] != null && (
              <button
                className={`px-8 py-3 bg-gradient-to-r from-[#0070ef] to-[#00a8ff] 
                  text-white font-Tektur font-medium text-sm rounded-lg 
                  transition-all duration-200
                  hover:scale-105 cursor-pointer
                  ${isLoadingMore ? "opacity-70 cursor-not-allowed" : ""}`}
                onClick={() => {
                  if (!isLoadingMore) {
                    setIsLoadingMore(true);
                    setPageNumber((prev) => prev + 1);

                    const timeOut = setTimeout(() => {
                      setIsLoadingMore(false);
                      clearTimeout(timeOut);
                    }, 6000);
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
                    <RankComponent userData={fakedata} rank={index + 1} isGridView={false} enable3D={enable3D} />
                  </div>
                ))}
              </div>
            )}
            {userData[0] != null && (
              <div className="w-[100%] h-[60px] flex items-center justify-center mt-4">
                <button
                  className={`px-8 py-3 bg-gray-800/90 
              text-white font-Tektur font-medium text-sm rounded-lg border border-[#0070ef]/3
               transition-all duration-200
                         hover:scale-105 cursor-pointer
                         ${
                           isLoadingMore ? "opacity-70 cursor-not-allowed" : ""
                         }`}
                  onClick={() => {
                    if (!isLoadingMore) {
                      setIsLoadingMore(true);
                      setPageNumber((prev) => prev + 1);

                      const timeOut = setTimeout(() => {
                        setIsLoadingMore(false);
                        clearTimeout(timeOut);
                      }, 6000);
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
