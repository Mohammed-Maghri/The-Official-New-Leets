"use client";
import React from "react";
import { ProgressBar } from "./progress.component";
import { RankComponent } from "@/component/dashboard/dashboard";
import { UserData } from "@/component/navbar/navbar.types";
import { cloneData } from "./progress.types";

const Progress = () => {
  const [pageNumber, setPageNumber] = React.useState(1);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [userData, setUserData] = React.useState<UserData[] | null[]>(
    cloneData
  );

  // React.useEffect(() => {
  //   console.log("User Data:  -------- ", userData);
  // }, [userData]);

  return (
    <div className="flex flex-1 z-10 items-center overflow-auto justify-start flex-col ">
      <ProgressBar setUserData={setUserData} pageNumber={pageNumber} />
      <div className="items-center justify-start flex-col p-2 sm:p-5 w-full gap-2 flex overflow-auto flex-1">
        {userData.length === 0 ? (
          // Nothing Found Component
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
              Nothing Found
            </h3>

            <p className="text-gray-400 font-Tektur text-center text-sm md:text-base max-w-md mb-6">
              No users match your current search criteria. Try adjusting your
              filters or search terms.
            </p>
          </div>
        ) : (
          <>
            {userData.map((fakedata: UserData | null, index: number) => (
              <div
                key={index}
                className="w-[100%]  tillme:w-[850px]  rounded-md"
              >
                <RankComponent userData={fakedata} rank={index + 1} />
              </div>
            ))}
            {userData[0] != null && (
              <div className="w-[100%] h-[60px] flex items-center justify-center mt-4">
                <button
                  className={`px-8 py-3 bg-gray-800/90 
              text-white font-Tektur font-medium text-sm rounded-lg border border-[#0070ef]/3
               shadow-lg transition-all duration-200
                         hover:scale-105 hover:shadow-xl cursor-pointer
                         ${
                           isLoadingMore ? "opacity-70 cursor-not-allowed" : ""
                         }`}
                  onClick={() => {
                    if (!isLoadingMore) {
                      console.log("Loading more data...");
                      setIsLoadingMore(true);
                      setPageNumber((prev) => prev + 1);

                      const timeOut = setTimeout(() => {
                        setIsLoadingMore(false);
                        clearTimeout(timeOut);
                      }, 4000);
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
