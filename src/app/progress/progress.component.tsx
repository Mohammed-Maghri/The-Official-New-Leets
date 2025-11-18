import React from "react";
import { CiSearch } from "react-icons/ci";
import { FaCaretDown } from "react-icons/fa";
import { motion } from "motion/react";
import { cloneData, CloseIfNotClicked } from "./progress.types";
import { ContextCreator } from "@/component/context/context";
import { ContextProps, UserData } from "@/component/context/context.types";
import { useRateLimitHandler } from "@/component/hooks/useRateLimitHandler";
import RateLimitPopup from "@/component/RateLimitPopup";

import {
  MonthList,
  CampusList,
  YearList,
  CursusList,
  SearchDeliverData,
  monthsIndex,
} from "./progress.types";
import { useRouter } from "next/navigation";

const ProgressBar: React.FC<{
  setUserData: React.Dispatch<React.SetStateAction<UserData[] | null[]>>;
  pageNumber: number;
  setIsFetchingData: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setUserData, pageNumber, setIsFetchingData }) => {
  const { rateLimitState, handleRateLimitResponse, closeRateLimitPopup } = useRateLimitHandler();
  const [cursuson, setCursuson] = React.useState<boolean>(false);
  const [campusOn, setCampusOn] = React.useState<boolean>(false);
  const [monthOn, setMonthOn] = React.useState<boolean>(false);
  const [yearOn, setYearOn] = React.useState<boolean>(false);
  const { userData } = React.useContext(ContextCreator) as ContextProps;
  const router = useRouter();

  const [DataSearch, setDataSearch] = React.useState<SearchDeliverData>({
    month: "Month",
    year: "Year",
    cursus: { name: "Cursus", id: 21 },
    campus: { name: "Campus", id: 0 },
    set: true,
    page: 1,
  });

  // Store the last searched parameters for Load More
  const [lastSearchedParams, setLastSearchedParams] = React.useState<SearchDeliverData>({
    month: "Month",
    year: "Year",
    cursus: { name: "Cursus", id: 21 },
    campus: { name: "Campus", id: 0 },
    set: true,
    page: 1,
  });

  const monthRef = React.useRef<HTMLDivElement>(null);
  const yearRef = React.useRef<HTMLDivElement>(null);
  const campusRef = React.useRef<HTMLDivElement>(null);
  const cursusRef = React.useRef<HTMLDivElement>(null);

  const monthTriggerRef = React.useRef<HTMLDivElement>(null);
  const yearTriggerRef = React.useRef<HTMLDivElement>(null);
  const cursusTriggerRef = React.useRef<HTMLDivElement>(null);
  const campusTriggerRef = React.useRef<HTMLDivElement>(null);

  const CloseEvent = (event: MouseEvent) => {
    const Allrefs: React.RefObject<HTMLElement>[] = [
      monthRef as React.RefObject<HTMLElement>,
      yearRef as React.RefObject<HTMLElement>,
      cursusRef as React.RefObject<HTMLElement>,
      campusRef as React.RefObject<HTMLElement>,
    ];

    const AllTriggerRefs: React.RefObject<HTMLElement>[] = [
      monthTriggerRef as React.RefObject<HTMLElement>,
      yearTriggerRef as React.RefObject<HTMLElement>,
      cursusTriggerRef as React.RefObject<HTMLElement>,
      campusTriggerRef as React.RefObject<HTMLElement>,
    ];

    Allrefs.forEach((ref, index) => {
      CloseIfNotClicked(
        ref,
        event.target as HTMLElement,
        AllTriggerRefs[index]
      );
    });
  };

  const fetchLogout = async () => {
    const response = await fetch("/api/logout", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.error("Failed to logout");
      return;
    }
    setUserData(cloneData as null[]);
    router.push("/");
  };

  const FetchData = async (object: SearchDeliverData, more: boolean) => {
    if (!more) {
      setIsFetchingData(true);
    }
    const response = await fetch("/api/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(object),
    });
    
    // Check for rate limiting
    const isRateLimited = await handleRateLimitResponse(response);
    if (isRateLimited) {
      setIsFetchingData(false);
      return;
    }
    
    if (!response.ok) {
      console.error("Failed to fetch progress data");
      setIsFetchingData(false);
      fetchLogout();
      return;
    }
    const data = await response.json();
    if (more) {
      setUserData((prevData) => [...prevData, ...data]);
    } else {
      setUserData(data);
    }
    setIsFetchingData(false);
  };

  React.useEffect(() => {
    if (pageNumber > 1) {
      FetchData({ ...lastSearchedParams, page: pageNumber }, true);
    }
  }, [pageNumber]);

  React.useEffect(() => {
    if (userData !== null) {
      const initialMonth = monthsIndex
        .findIndex((find) => find == (userData.pool_month as string))
        .toString();
      const initialSearchParams = {
        ...DataSearch,
        set: true,
        month: initialMonth.length == 1 ? `0${initialMonth}` : initialMonth,
        year: userData.pool_year,
        cursus: {
          name: userData.kind,
          id: userData.kind === "student" ? 21 : 9,
        },
        campus: { name: userData.campus_name, id: userData.campus_id },
        page: 1,
      };
      setDataSearch(initialSearchParams);
      setLastSearchedParams(initialSearchParams);
      FetchData(initialSearchParams, false);
    }
    
    document.addEventListener("click", CloseEvent);
    
    return () => {
      document.removeEventListener("click", CloseEvent);
    };
  }, [userData]);

  return (
    <div className="w-full z-20 gap-2 h-[60px] bg-gray-800/90 flex items-center justify-center">
      <div
        ref={monthTriggerRef}
        onClick={() => {
          setMonthOn(!monthOn);
        }}
        className={`${
          DataSearch.cursus.name == "Piscine" ? "flex" : "hidden"
        } transition-all duration-200 w-[70px] sm:w-[110px] cursor-pointer
           relative rounded-md border-solid border-[1px] border-white/5 h-[30px]
                 bg-[#0070ef]/5 gap-1 items-center justify-center`}
      >
        <p className="font-Tektur font-extralight text-white text-[10px] sm:text-[12px]">
          {DataSearch.month}
        </p>
        <FaCaretDown color="white" />
        <motion.div
          ref={monthRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: monthOn ? "flex" : "none" }}
          className={`absolute overflow-scroll top-8 bg-[#001226] w-[70px] overflow-x-hidden sm:w-[110px] h-[100px] rounded-md p-2 flex-col gap-1`}
        >
          {MonthList.map((month) => (
            <div
              key={month}
              className="text-white flex-1 flex items-center justify-center text-[12px] cursor-pointer hover:bg-[#0070ef]/10 p-1 rounded-md"
              onClick={() => {
                setMonthOn(false);
                setDataSearch({ ...DataSearch, month: month });
              }}
            >
              {month}
            </div>
          ))}
        </motion.div>
      </div>

      <div
        ref={yearTriggerRef}
        onClick={() => setYearOn(!yearOn)}
        className="transition-all duration-200 w-[70px] sm:w-[110px] cursor-pointer relative rounded-md border-solid border-[1px] border-white/5 h-[30px]
                 bg-[#0070ef]/5 gap-1 flex items-center justify-center"
      >
        <p className="font-Tektur font-extralight text-white text-[10px] sm:text-[12px]">
          {DataSearch.year}
        </p>
        <FaCaretDown color="white" />
        {yearOn && (
          <motion.div
            ref={yearRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: yearOn ? "flex" : "none" }}
            className={`absolute overflow-scroll top-8 bg-[#001226] w-[70px] overflow-x-hidden sm:w-[110px] h-[100px] rounded-md p-2 flex-col gap-1`}
          >
            {YearList.map((year) => (
              <div
                key={year}
                className="text-white flex-1 flex items-center justify-center text-[12px] cursor-pointer hover:bg-[#0070ef]/10 p-1 rounded-md"
                onClick={() => {
                  setYearOn(false);
                  setDataSearch({ ...DataSearch, year: year });
                }}
              >
                {year}
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <div
        ref={cursusTriggerRef}
        onClick={() => setCursuson(!cursuson)}
        className="transition-all duration-200 w-[70px] sm:w-[110px] cursor-pointer relative rounded-md border-solid border-[1px] border-white/5 h-[30px]
                 bg-[#0070ef]/5 gap-1 flex items-center justify-center"
      >
        <p className="font-Tektur font-extralight text-white text-[10px] sm:text-[12px]">
          {DataSearch.cursus.name}
        </p>
        <FaCaretDown color="white" />
        {cursuson && (
          <motion.div
            ref={cursusRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute top-8 bg-[#001226] w-[70px] overflow-x-hidden sm:w-[110px] h-[70px] rounded-md p-2 flex-col gap-1`}
          >
            {CursusList.map((cursus) => (
              <div
                key={cursus.id}
                className="text-white flex-1 flex items-center justify-center text-[12px] cursor-pointer hover:bg-[#0070ef]/10 p-1 rounded-md"
                onClick={() => {
                  setCursuson(false);
                  setDataSearch({
                    ...DataSearch,
                    cursus: { name: cursus.name, id: cursus.id },
                  });
                }}
              >
                {cursus.name}
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <div
        ref={campusTriggerRef}
        onClick={() => setCampusOn(!campusOn)}
        className="transition-all duration-200 w-[70px] sm:w-[110px] cursor-pointer relative rounded-md border-solid border-[1px] border-white/5 h-[30px]
                 bg-[#0070ef]/5 gap-1 flex items-center justify-center"
      >
        <p className="font-Tektur font-extralight text-white text-[10px] sm:text-[12px]">
          {DataSearch.campus.name}
        </p>
        <FaCaretDown color="white" />
        {campusOn && (
          <motion.div
            ref={campusRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute overflow-scroll top-8 bg-[#001226] w-[70px] overflow-x-hidden sm:w-[110px] h-[100px] rounded-md p-2 flex-col gap-1"
          >
            {CampusList.map((campus) => (
              <div
                key={campus.id}
                className="text-white flex-1 flex items-center justify-center text-[12px] cursor-pointer hover:bg-[#0070ef]/10 p-1 rounded-md"
                onClick={() => {
                  setCampusOn(false);
                  setDataSearch({
                    ...DataSearch,
                    campus: { name: campus.name, id: campus.id },
                  });
                }}
              >
                {campus.name}
              </div>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Global Rank Button */}
      <div
        onClick={() => {
          setUserData(cloneData as null[]);
          const globalData = {
            ...DataSearch,
            campus: { name: "All", id: 0 },
            cursus: { name: "Cursus", id: 21 },
            page: 1,
          };
          setDataSearch(globalData);
          setLastSearchedParams(globalData);
          FetchData(globalData, false);
        }}
        className="w-[30px] cursor-pointer rounded-md border-solid border-[1px] border-white/4 h-[30px] bg-yellow-500/20 hover:bg-yellow-500/30 flex items-center justify-center transition-all duration-200"
        title="Global Rank"
      >
        <span className="text-[16px]">🌍</span>
      </div>
      
      <div
        onClick={() => {
          setUserData(cloneData as null[]);
          setLastSearchedParams(DataSearch);
          FetchData(DataSearch, false);
        }}
        className="w-[30px] cursor-pointer rounded-md border-solid border-[1px] border-white/4 h-[30px] bg-[#0070ef]/20 flex items-center justify-center"
      >
        <CiSearch color="white" />
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

export { ProgressBar };
