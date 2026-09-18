"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  RankComponent,
  StatusGrid,
  PoolInformation,
  CampusInformation,
  ContactInformation,
} from "@/component/dashboard/dashboard";
import { ContextCreator } from "@/component/context/context";
import { ContextProps, UserData } from "@/component/context/context.types";
import { fetchVIPUsers } from "@/component/dashboard/dashboard.types";
import { BsStars } from "react-icons/bs";
import { useTheme, type FontChoice } from "@/component/context/ThemeContext";

const Dashboard = () => {
  const router = useRouter();
  const { userData } = React.useContext(ContextCreator) as ContextProps;
  const { fontChoice, setFontChoice } = useTheme();
  const [isCreator, setIsCreator] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetchVIPUsers();
  }, []);

  React.useEffect(() => {
    const checkCreatorStatus = async () => {
      try {
        const response = await fetch("/api/check-creator", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setIsCreator(data.isCreator || false);
        }
      } catch {
        /* ignore */
      }
    };
    if (userData) checkCreatorStatus();
  }, [userData]);

  const sideCardClass = "relative border-4 border-[#a0a6b0] bg-[#ece9d8] p-3";

  return (
    <div
      className="flex flex-1 overflow-auto overflow-x-hidden p-2 sm:p-4 lg:p-6 gap-1 z-10 w-full flex-col lg:flex-row lg:items-stretch min-w-0"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      {/* Left Sidebar - Profile */}
      <aside className="hidden lg:flex flex-col w-52 xl:w-64 flex-shrink-0 min-h-0">
        <div className={`${sideCardClass} flex-1 min-h-0 flex flex-col`} style={{ boxShadow: "none" }}>
          {/* Pixel corner accents - muted */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#a0a6b0]" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#a0a6b0]" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#a0a6b0]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#a0a6b0]" />
          <h3 className="text-[10px] font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-3 flex-shrink-0">
            Profile
          </h3>
          {userData ? (
            <div className="flex flex-col items-center gap-3 flex-1 justify-center min-h-0">
              <div
                className="w-20 h-20 border-2 border-[#a0a6b0] overflow-hidden cursor-pointer hover:border-[#a0a6b0] transition-colors bg-[#ece9d8]"
                style={{ boxShadow: "none" }}
                onClick={() =>
                  window.open(`https://profile.intra.42.fr/users/${userData.login}`, "_blank")
                }
              >
                <img
                  src={userData.image || "nopic.jpg"}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
              <div className="text-center w-full">
                <p className="text-[11px] font-bold theme-text uppercase truncate">
                  {userData.login}
                </p>
                <p className="text-[10px] font-bold theme-text-muted mt-0.5">
                  {userData.level.toFixed(2)}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <div className="w-2 h-2 bg-[#d9e5f5]" />
                  <span className="text-[9px] theme-text-muted uppercase">
                    {userData.location || "Offline"}
                  </span>
                </div>
              </div>
              <a
                href={`https://profile.intra.42.fr/users/${userData.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full border-2 border-[#a0a6b0] bg-[#ece9d8] py-2 text-center text-[9px] font-bold theme-text uppercase tracking-wider hover:border-[#a0a6b0] transition-all active:translate-y-0.5"
                style={{ boxShadow: "none" }}
              >
                42 Profile
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 flex-1 justify-center py-6">
              <div className="w-20 h-20 border-2 border-[#a0a6b0] skeleton-shimmer rounded-sm" style={{ boxShadow: "none" }} />
              <div className="h-3 w-16 skeleton-shimmer rounded-sm" />
              <div className="h-2.5 w-12 skeleton-shimmer rounded-sm" />
              <div className="h-2.5 w-14 skeleton-shimmer rounded-sm" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 min-h-0 flex flex-col gap-1 w-full">
        {isCreator && (
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
            <button
              onClick={() => router.push("/dashboard/feedback-reviews")}
              className="flex items-center gap-2 px-4 py-2 border-2 border-[#a0a6b0] bg-[#ece9d8] text-center text-[9px] font-bold theme-text uppercase tracking-wider hover:border-[#a0a6b0] transition-all active:translate-y-0.5"
              style={{ boxShadow: "none" }}
            >
              <BsStars className="w-4 h-4" />
              <span className="hidden sm:inline">Badges & Reviews</span>
              <span className="sm:hidden">Admin</span>
            </button>
          </div>
        )}

        <div className="w-full min-h-[140px] sm:min-h-[180px] min-w-0">
          <RankComponent userData={userData as UserData} rank={-1} />
        </div>

        <div
          className="relative flex-1 border-4 border-[#a0a6b0] bg-[#ece9d8] p-3 sm:p-4 lg:p-6 flex flex-col gap-4 sm:gap-6 min-w-0 overflow-hidden"
          style={{
            boxShadow: "none",
          }}
        >
          {/* Pixel corner accents - muted */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#a0a6b0]" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#a0a6b0]" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#a0a6b0]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#a0a6b0]" />
          {userData != null ? (
            <>
              <StatusGrid
                wallet={userData.wallet}
                kind={userData.kind}
                staff={userData.staff}
                correction_point={userData.correction_point}
                badge={userData.badge}
                muted
              />
              <PoolInformation
                pool_month={userData.pool_month}
                pool_year={userData.pool_year}
                location={userData.location}
                muted
              />
              <CampusInformation
                campus_name={userData.campus_name}
                campus_id={userData.campus_id}
                muted
              />
              <ContactInformation email={userData.email} muted />
            </>
          ) : (
            <div className="flex-1 flex flex-col gap-4 sm:gap-6">
              {/* StatusGrid skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-2 border-[#a0a6b0] bg-[#ece9d8] p-3 sm:p-4" style={{ boxShadow: "none" }}>
                    <div className="h-3 w-20 mb-2 skeleton-shimmer rounded-sm" />
                    <div className="h-5 w-12 skeleton-shimmer rounded-sm" />
                    <div className="h-2.5 w-28 mt-2 skeleton-shimmer rounded-sm" />
                  </div>
                ))}
              </div>
              {/* PoolInformation skeleton */}
              <div>
                <div className="h-3 w-24 mb-2 skeleton-shimmer rounded-sm" />
                <div className="border-2 border-[#a0a6b0] bg-[#ece9d8] p-3 sm:p-4" style={{ boxShadow: "none" }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div><div className="h-2.5 w-16 mb-1.5 skeleton-shimmer rounded-sm" /><div className="h-4 w-24 skeleton-shimmer rounded-sm" /></div>
                    <div><div className="h-2.5 w-20 mb-1.5 skeleton-shimmer rounded-sm" /><div className="h-4 w-28 skeleton-shimmer rounded-sm" /></div>
                  </div>
                </div>
              </div>
              {/* CampusInformation skeleton */}
              <div>
                <div className="h-3 w-28 mb-2 skeleton-shimmer rounded-sm" />
                <div className="border-2 border-[#a0a6b0] bg-[#ece9d8] p-3 sm:p-4 flex justify-between items-center" style={{ boxShadow: "none" }}>
                  <div><div className="h-4 w-32 skeleton-shimmer rounded-sm mb-1" /><div className="h-2.5 w-20 skeleton-shimmer rounded-sm" /></div>
                  <div><div className="h-2.5 w-12 mb-1 skeleton-shimmer rounded-sm ml-auto" /><div className="h-3 w-14 skeleton-shimmer rounded-sm" /></div>
                </div>
              </div>
              {/* ContactInformation skeleton */}
              <div>
                <div className="h-3 w-36 mb-2 skeleton-shimmer rounded-sm" />
                <div className="border-2 border-[#a0a6b0] bg-[#ece9d8] p-3 sm:p-4 flex items-center gap-2 sm:gap-3" style={{ boxShadow: "none" }}>
                  <div className="w-8 h-8 border-2 border-[#a0a6b0] skeleton-shimmer rounded-sm flex-shrink-0" />
                  <div className="flex-1 min-w-0"><div className="h-4 w-40 skeleton-shimmer rounded-sm" /><div className="h-2.5 w-28 mt-1 skeleton-shimmer rounded-sm" /></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <aside className="w-full lg:w-52 xl:w-64 shrink-0 border-2 theme-border bg-[#ece9d8] p-4 pb-16 lg:pb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#151515] mb-4">Typography</h3>
        <div className="flex flex-col gap-2">
          {(["readable", "pixel", "tektur"] as FontChoice[]).map((font) => (
            <button
              key={font}
              onClick={() => setFontChoice(font)}
              aria-pressed={fontChoice === font}
              className={`border px-3 py-2 text-left text-xs transition-colors ${fontChoice === font ? "border-[#a0a6b0] bg-white text-black" : "border-[#a0a6b0] text-[#3e3d35] hover:border-[#a0a6b0]"}`}
              style={{ fontFamily: font === "pixel" ? "var(--font-pixel)" : font === "tektur" ? "var(--font-Tektur)" : "var(--font-readable)" }}
            >
              {font === "readable" ? "Classic (Tahoma)" : font === "pixel" ? "Pixel (Silkscreen)" : "Tektur"}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default Dashboard;
