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

  React.useEffect(() => {
    console.log("User Data:  -------- ", userData);
  }, [userData]);

  return (
    <div className=" flex flex-1 z-10 items-center overflow-auto justify-start flex-col ">
        <ProgressBar setUserData={setUserData} pageNumber={pageNumber} />
      <div className="items-center justify-start flex-col p-5 w-full gap-2 flex overflow-auto  flex-1">
        {userData.map((fakedata: UserData | null, index: number) => (
          <div
            key={index}
            className="w-[100%] tillme:w-[850px] h-[120px] rounded-md"
          >
            <RankComponent userData={fakedata} rank={index + 1} />
          </div>
        ))}
        {userData.length === 0 ||
          (userData[0] != null && (
            <div className="w-[100%] h-[60px] flex items-center justify-center mt-4">
              <button
                className={`px-8 py-3 backdrop-blur-2xl bg-amber-100/2 
            text-white font-Tektur font-medium text-sm rounded-lg border border-[#0070ef]/3
             shadow-lg transition-all duration-200
                       hover:scale-105 hover:shadow-xl cursor-pointer
                       ${isLoadingMore ? "opacity-70 cursor-not-allowed" : ""}`}
                onClick={() => {
                  if (!isLoadingMore) {
                    console.log("Loading more data...");
                    setIsLoadingMore(true);
                    setPageNumber((prev) => prev + 1);

                    // Reset loading state after 2 seconds
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
          ))}
      </div>
    </div>
  );
};

export default Progress;
