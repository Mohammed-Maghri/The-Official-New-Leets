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

function readRankingFilters(defaults: SearchDeliverData): SearchDeliverData {
  const params = new URLSearchParams(window.location.search);
  const number = (key: string) => {
    const value = params.get(key);
    return value && /^\d+$/.test(value) ? Number(value) : NaN;
  };
  const year = number("year");
  const month = number("month");
  return {
    ...defaults,
    year: YearList.includes(year) ? year : defaults.year,
    month: MonthList.includes(month) ? month : defaults.month,
    cursus: CursusList.find(item => item.id === number("cursus")) ?? defaults.cursus,
    campus: CampusList.find(item => item.id === number("campus")) ?? defaults.campus,
    page: 1,
  };
}

function writeRankingFilters(filters: SearchDeliverData, replace = false) {
  const url = new URL(window.location.href);
  url.searchParams.set("year", String(filters.year));
  url.searchParams.set("month", String(Number(filters.month)));
  url.searchParams.set("cursus", String(filters.cursus.id));
  url.searchParams.set("campus", String(filters.campus.id));
  const target = url.pathname + url.search + url.hash;
  if (target !== window.location.pathname + window.location.search + window.location.hash) {
    if (replace) window.history.replaceState(null, "", target);
    else window.history.pushState(null, "", target);
  }
}

const ProgressBar: React.FC<{
  setUserData: React.Dispatch<React.SetStateAction<UserData[] | null[]>>;
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  setIsFetchingData: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoadingMore: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setUserData, pageNumber, setPageNumber, setIsFetchingData, setIsLoadingMore }) => {
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

  const requestVersion = React.useRef(0);
  const FetchData = async (object: SearchDeliverData, more: boolean) => {
    const version = ++requestVersion.current;
    if (more) {
      setIsLoadingMore(true);
    } else {
      setIsFetchingData(true);
      setPageNumber(1);
    }
    const response = await fetch("/api/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(object),
    });

    if (version !== requestVersion.current) return;

    // Check for rate limiting
    const isRateLimited = await handleRateLimitResponse(response);
    if (isRateLimited) {
      setIsFetchingData(false);
      setIsLoadingMore(false);
      return;
    }

    if (!response.ok) {
      console.error("Failed to fetch progress data");
      setIsFetchingData(false);
      setIsLoadingMore(false);
      fetchLogout();
      return;
    }
    const data = await response.json();
    if (version !== requestVersion.current) return;
    if (more) {
      setUserData((prevData) => [...prevData, ...data]);
    } else {
      setUserData(data);
    }
    setIsFetchingData(false);
    setIsLoadingMore(false);
  };

  React.useEffect(() => {
    if (pageNumber > 1) {
      FetchData({ ...lastSearchedParams, page: pageNumber }, true);
    }
  }, [pageNumber]);

  React.useEffect(() => {
    if (userData !== null) {
      setPageNumber(1);
      const initialMonth = monthsIndex
        .findIndex((find) => find == (userData.pool_month as string))
        .toString();
      const defaults = {
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
      const initialSearchParams = readRankingFilters(defaults);
      writeRankingFilters(initialSearchParams, true);
      setDataSearch(initialSearchParams);
      setLastSearchedParams(initialSearchParams);
      FetchData(initialSearchParams, false);
      const restore = () => {
        const restored = readRankingFilters(defaults);
        setDataSearch(restored);
        setLastSearchedParams(restored);
        setUserData(cloneData as null[]);
        FetchData(restored, false);
      };
      window.addEventListener("popstate", restore);
      document.addEventListener("click", CloseEvent);
      return () => {
        ++requestVersion.current;
        window.removeEventListener("popstate", restore);
        document.removeEventListener("click", CloseEvent);
      };

    }

    document.addEventListener("click", CloseEvent);

    return () => {
      document.removeEventListener("click", CloseEvent);
    };
  }, [userData]);

  const dropdownTriggerClass = "transition-all duration-200 min-w-0 flex-1 sm:flex-none sm:w-[90px] cursor-pointer relative h-8 rounded-md border border-[#a0a6b0] bg-[#dce8f8] gap-0.5 flex items-center justify-center hover:bg-[#dce8f8] hover:border-[#a0a6b0]";
  const dropdownPanelClass = "absolute overflow-y-auto top-10 left-0 right-0 w-full min-w-[60px] sm:min-w-[90px] bg-[#f5f3e9]  border border-[#a0a6b0] rounded-md p-1.5 flex flex-col gap-0.5 min-h-[70px] max-h-[90px] z-50 ";
  const dropdownItemClass = "text-[#3e3d35] flex-1 flex items-center justify-center text-[9px] sm:text-[10px] cursor-pointer hover:bg-[#dce8f8] rounded px-2 py-1.5 font-medium transition-colors";

  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto] sm:flex sm:flex-wrap items-center gap-2 w-full" style={{ fontFamily: "var(--font-ui)" }}>
      <div
        ref={monthTriggerRef}
        onClick={() => setMonthOn(!monthOn)}
        className={`${DataSearch.cursus.name == "Piscine" ? "flex" : "hidden"} ${dropdownTriggerClass}`}
      >
        <p className="text-[#3e3d35] text-[9px] sm:text-[10px] font-medium truncate">
          {DataSearch.month}
        </p>
        <FaCaretDown className="text-[#3e3d35] flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3" />
        <motion.div
          ref={monthRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: monthOn ? "flex" : "none" }}
          className={dropdownPanelClass}
        >
          {MonthList.map((month) => (
            <div
              key={month}
              className={dropdownItemClass}
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

      <div ref={yearTriggerRef} onClick={() => setYearOn(!yearOn)} className={dropdownTriggerClass}>
        <p className="text-[#3e3d35] text-[9px] sm:text-[10px] font-medium truncate">
          {DataSearch.year}
        </p>
        <FaCaretDown className="text-[#3e3d35] flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3" />
        {yearOn && (
          <motion.div
            ref={yearRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: yearOn ? "flex" : "none" }}
            className={dropdownPanelClass}
          >
            {YearList.map((year) => (
              <div
                key={year}
                className={dropdownItemClass}
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

      <div ref={cursusTriggerRef} onClick={() => setCursuson(!cursuson)} className={dropdownTriggerClass}>
        <p className="text-[#3e3d35] text-[9px] sm:text-[10px] font-medium truncate">
          {DataSearch.cursus.name}
        </p>
        <FaCaretDown className="text-[#3e3d35] flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3" />
        {cursuson && (
          <motion.div
            ref={cursusRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={dropdownPanelClass}
          >
            {CursusList.map((cursus) => (
              <div
                key={cursus.id}
                className={dropdownItemClass}
                onClick={() => {
                  setCursuson(false);
                  setDataSearch({ ...DataSearch, cursus: { name: cursus.name, id: cursus.id } });
                }}
              >
                {cursus.name}
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <div ref={campusTriggerRef} onClick={() => setCampusOn(!campusOn)} className={dropdownTriggerClass}>
        <p className="text-[#3e3d35] text-[9px] sm:text-[10px] font-medium truncate">
          {DataSearch.campus.name}
        </p>
        <FaCaretDown className="text-[#3e3d35] flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3" />
        {campusOn && (
          <motion.div
            ref={campusRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={dropdownPanelClass}
          >
            {CampusList.map((campus) => (
              <div
                key={campus.id}
                className={dropdownItemClass}
                onClick={() => {
                  setCampusOn(false);
                  setDataSearch({ ...DataSearch, campus: { name: campus.name, id: campus.id } });
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
          setPageNumber(1);
          const globalData = { ...DataSearch, campus: { name: "All", id: 0 }, cursus: { name: "Cursus", id: 21 }, page: 1 };
          setDataSearch(globalData);
          writeRankingFilters(globalData);
          setLastSearchedParams(globalData);
          FetchData(globalData, false);
        }}
        className="w-8 h-8 flex-shrink-0 cursor-pointer rounded-md border border-[#a0a6b0] bg-[#dce8f8] flex items-center justify-center transition-all duration-200 hover:bg-[#dce8f8] hover:border-[#a0a6b0]"
        title="Global Rank"
      >
        <span className="text-sm">🌍</span>
      </div>

      <div
        title="Apply filters"
        onClick={() => {
          setUserData(cloneData as null[]);
          setPageNumber(1);
          writeRankingFilters(DataSearch);
          setLastSearchedParams(DataSearch);
          FetchData(DataSearch, false);
        }}
        className="w-8 h-8 flex-shrink-0 cursor-pointer rounded-md border border-[#a0a6b0] bg-[#dce8f8] flex items-center justify-center transition-all duration-200 hover:bg-[#dce8f8] hover:border-[#a0a6b0]"
      >
        <CiSearch className="text-[#3e3d35] w-4 h-4" />
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
