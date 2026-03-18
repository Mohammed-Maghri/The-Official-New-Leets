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
import { useTheme, themeConfig, type ThemeColor, type FontChoice } from "@/component/context/ThemeContext";

const Dashboard = () => {
  const router = useRouter();
  const { userData } = React.useContext(ContextCreator) as ContextProps;
  const { themeColor, setThemeColor, backgroundVariant, setBackgroundVariant, fontChoice, setFontChoice } = useTheme();
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

  const colors: ThemeColor[] = ["violet", "blue", "cyan", "emerald", "amber", "rose", "indigo", "purple", "teal", "lime", "orange", "pink", "sky", "fuchsia"];
  const sideCardClass = "relative border-4 border-slate-600/60 bg-gray-950/98 p-3";

  return (
    <div
      className="flex flex-1 overflow-auto overflow-x-hidden p-2 sm:p-4 lg:p-6 gap-1 z-10 w-full flex-col lg:flex-row lg:items-stretch min-w-0"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      {/* Left Sidebar - Profile */}
      <aside className="hidden lg:flex flex-col w-52 xl:w-64 flex-shrink-0 min-h-0">
        <div className={`${sideCardClass} flex-1 min-h-0 flex flex-col`} style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(71,85,105,0.3)" }}>
          {/* Pixel corner accents - muted */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-slate-600/60" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-slate-600/60" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-slate-600/60" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-slate-600/60" />
          <h3 className="text-[10px] font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-3 flex-shrink-0">
            Profile
          </h3>
          {userData ? (
            <div className="flex flex-col items-center gap-3 flex-1 justify-center min-h-0">
              <div
                className="w-20 h-20 border-2 border-slate-600/60 overflow-hidden cursor-pointer hover:border-slate-500/70 transition-colors bg-gray-950/98"
                style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
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
                  <div className="w-2 h-2 bg-slate-400" />
                  <span className="text-[9px] theme-text-muted uppercase">
                    {userData.location || "Offline"}
                  </span>
                </div>
              </div>
              <a
                href={`https://profile.intra.42.fr/users/${userData.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full border-2 border-slate-600/60 bg-gray-950/98 py-2 text-center text-[9px] font-bold theme-text uppercase tracking-wider hover:border-slate-500/70 transition-all active:translate-y-0.5"
                style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
              >
                42 Profile
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 flex-1 justify-center py-6">
              <div className="w-20 h-20 border-2 border-slate-600/60 skeleton-shimmer rounded-sm" style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }} />
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
              className="flex items-center gap-2 px-4 py-2 border-2 border-slate-600/60 bg-gray-950/98 text-center text-[9px] font-bold theme-text uppercase tracking-wider hover:border-slate-500/70 transition-all active:translate-y-0.5"
              style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
            >
              <BsStars className="w-4 h-4" />
              <span className="hidden sm:inline">Feedback Reviews</span>
              <span className="sm:hidden">Reviews</span>
            </button>
          </div>
        )}

        <div className="w-full min-h-[140px] sm:min-h-[180px] min-w-0">
          <RankComponent userData={userData as UserData} rank={-1} />
        </div>

        <div
          className="relative flex-1 border-4 border-slate-600/60 bg-gray-950/98 p-3 sm:p-4 lg:p-6 flex flex-col gap-4 sm:gap-6 min-w-0 overflow-hidden"
          style={{
            boxShadow: "4px 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(71,85,105,0.3)",
          }}
        >
          {/* Pixel corner accents - muted */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-slate-600/60" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-slate-600/60" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-slate-600/60" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-slate-600/60" />
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
                  <div key={i} className="border-2 border-slate-600/50 bg-gray-950/98 p-3 sm:p-4" style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.2)" }}>
                    <div className="h-3 w-20 mb-2 skeleton-shimmer rounded-sm" />
                    <div className="h-5 w-12 skeleton-shimmer rounded-sm" />
                    <div className="h-2.5 w-28 mt-2 skeleton-shimmer rounded-sm" />
                  </div>
                ))}
              </div>
              {/* PoolInformation skeleton */}
              <div>
                <div className="h-3 w-24 mb-2 skeleton-shimmer rounded-sm" />
                <div className="border-2 border-slate-600/50 bg-gray-950/98 p-3 sm:p-4" style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.2)" }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div><div className="h-2.5 w-16 mb-1.5 skeleton-shimmer rounded-sm" /><div className="h-4 w-24 skeleton-shimmer rounded-sm" /></div>
                    <div><div className="h-2.5 w-20 mb-1.5 skeleton-shimmer rounded-sm" /><div className="h-4 w-28 skeleton-shimmer rounded-sm" /></div>
                  </div>
                </div>
              </div>
              {/* CampusInformation skeleton */}
              <div>
                <div className="h-3 w-28 mb-2 skeleton-shimmer rounded-sm" />
                <div className="border-2 border-slate-600/50 bg-gray-950/98 p-3 sm:p-4 flex justify-between items-center" style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.2)" }}>
                  <div><div className="h-4 w-32 skeleton-shimmer rounded-sm mb-1" /><div className="h-2.5 w-20 skeleton-shimmer rounded-sm" /></div>
                  <div><div className="h-2.5 w-12 mb-1 skeleton-shimmer rounded-sm ml-auto" /><div className="h-3 w-14 skeleton-shimmer rounded-sm" /></div>
                </div>
              </div>
              {/* ContactInformation skeleton */}
              <div>
                <div className="h-3 w-36 mb-2 skeleton-shimmer rounded-sm" />
                <div className="border-2 border-slate-600/50 bg-gray-950/98 p-3 sm:p-4 flex items-center gap-2 sm:gap-3" style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.2)" }}>
                  <div className="w-8 h-8 border-2 border-slate-600/50 skeleton-shimmer rounded-sm flex-shrink-0" />
                  <div className="flex-1 min-w-0"><div className="h-4 w-40 skeleton-shimmer rounded-sm" /><div className="h-2.5 w-28 mt-1 skeleton-shimmer rounded-sm" /></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar - Settings (Theme) */}
      <aside className="hidden lg:flex flex-col w-52 xl:w-64 flex-shrink-0 min-h-0">
        <div
          className={`${sideCardClass} flex-1 min-h-0 flex flex-col border-[var(--theme-border)]`}
          style={{
            boxShadow: `4px 4px 0 var(--theme-shadow-md), inset 0 1px 0 var(--theme-border)`,
            background: `linear-gradient(135deg, rgb(3 7 18 / 0.98) 0%, rgb(3 7 18 / 0.98) 50%, ${themeConfig[themeColor].gradient[0]}18 100%)`,
          }}
        >
          {/* Pixel corner accents - theme tint */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 theme-border" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 theme-border" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 theme-border" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 theme-border" />
          <h3 className="text-[10px] font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-3 flex-shrink-0">
            Theme
          </h3>
          <div className="space-y-4 flex-1 min-h-0 flex flex-col justify-center">
            <div>
              <p className="text-[9px] font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-2">
                Accent Color
              </p>
              <div className="flex flex-wrap gap-1.5">
                {colors.map((color) => {
                  const cfg = themeConfig[color];
                  const isActive = themeColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setThemeColor(color)}
                      className={`w-9 h-9 border-2 flex items-center justify-center transition-all active:translate-y-0.5 ${
                        isActive ? "theme-border-strong ring-2 ring-[var(--theme-primary)]/40" : "border-white/20 hover:border-white/40"
                      }`}
                      style={{
                        backgroundColor: cfg.gradient[0] + (isActive ? "cc" : "66"),
                        boxShadow: isActive ? `0 0 12px ${cfg.gradient[0]}60` : "2px 2px 0 rgba(0,0,0,0.2)",
                      }}
                      title={color}
                    >
                      {isActive && <span className="text-white text-sm font-bold drop-shadow-md">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-2">
                Font
              </p>
              <div className="flex flex-col gap-1.5 mb-4">
                {(["readable", "pixel", "tektur"] as FontChoice[]).map((font) => (
                  <button
                    key={font}
                    onClick={() => setFontChoice(font)}
                    className={`w-full border-2 py-2 px-3 text-left text-[9px] font-bold uppercase tracking-wider transition-all text-white ${
                      fontChoice === font ? "theme-border-strong" : "border-white/20 hover:border-white/40"
                    }`}
                    style={{
                      fontFamily: font === "pixel" ? "var(--font-pixel)" : font === "tektur" ? "var(--font-Tektur)" : "var(--font-readable)",
                      backgroundColor: fontChoice === font ? "var(--theme-bg-card)" : "rgba(255,255,255,0.03)",
                    }}
                  >
                    {font === "readable" ? "Readable (Inter)" : font === "pixel" ? "Pixel (Silkscreen)" : "Tektur"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-2">
                Background
              </p>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setBackgroundVariant("floatingLines")}
                  className={`w-full border-2 py-2 px-3 text-left text-[9px] font-bold uppercase tracking-wider transition-all text-white ${
                    backgroundVariant === "floatingLines" ? "theme-border-strong" : "border-white/20 hover:border-white/40"
                  }`}
                  style={{
                    backgroundColor: backgroundVariant === "floatingLines" ? "var(--theme-bg-card)" : "rgba(255,255,255,0.03)",
                  }}
                >
                  Floating lines
                </button>
                <button
                  onClick={() => setBackgroundVariant("pixelBlast")}
                  className={`w-full border-2 py-2 px-3 text-left text-[9px] font-bold uppercase tracking-wider transition-all text-white ${
                    backgroundVariant === "pixelBlast" ? "theme-border-strong" : "border-white/20 hover:border-white/40"
                  }`}
                  style={{
                    backgroundColor: backgroundVariant === "pixelBlast" ? "var(--theme-bg-card)" : "rgba(255,255,255,0.03)",
                  }}
                >
                  Pixel blast
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile: Theme settings below main content */}
      <div className="lg:hidden w-full order-last min-w-0 pb-16 sm:pb-6">
        <div
          className={`${sideCardClass} border-[var(--theme-border)]`}
          style={{
            boxShadow: `4px 4px 0 var(--theme-shadow-md), inset 0 1px 0 var(--theme-border)`,
            background: `linear-gradient(135deg, rgb(3 7 18 / 0.98) 0%, rgb(3 7 18 / 0.98) 50%, ${themeConfig[themeColor].gradient[0]}18 100%)`,
          }}
        >
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 theme-border" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 theme-border" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 theme-border" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 theme-border" />
          <h3 className="text-[10px] font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-3">
            Theme
          </h3>
          <div className="space-y-3 mb-2">
            <div>
              <p className="text-[9px] font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-2">
                Accent Color
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const cfg = themeConfig[color];
                  const isActive = themeColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setThemeColor(color)}
                      className={`w-10 h-10 border-2 flex items-center justify-center transition-all ${
                        isActive ? "theme-border-strong ring-2 ring-[var(--theme-primary)]/40" : "border-white/20"
                      }`}
                      style={{
                        backgroundColor: cfg.gradient[0] + (isActive ? "cc" : "66"),
                        boxShadow: isActive ? `0 0 12px ${cfg.gradient[0]}60` : "2px 2px 0 rgba(0,0,0,0.2)",
                      }}
                      title={color}
                    >
                      {isActive && <span className="text-white text-sm font-bold drop-shadow-md">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-2">
                Font
              </p>
              <div className="flex flex-col gap-1.5 mb-3">
                {(["readable", "pixel", "tektur"] as FontChoice[]).map((font) => (
                  <button
                    key={font}
                    onClick={() => setFontChoice(font)}
                    className={`w-full border-2 py-2 px-2 text-center text-[9px] font-bold uppercase tracking-wider transition-all text-white ${
                      fontChoice === font ? "theme-border-strong" : "border-white/20"
                    }`}
                    style={{
                      fontFamily: font === "pixel" ? "var(--font-pixel)" : font === "tektur" ? "var(--font-Tektur)" : "var(--font-readable)",
                      backgroundColor: fontChoice === font ? "var(--theme-bg-card)" : "rgba(255,255,255,0.03)",
                    }}
                  >
                    {font === "readable" ? "Readable" : font === "pixel" ? "Pixel" : "Tektur"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-2">
                Background
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setBackgroundVariant("floatingLines")}
                  className={`flex-1 border-2 py-2 px-2 text-center text-[9px] font-bold uppercase tracking-wider transition-all text-white ${
                    backgroundVariant === "floatingLines" ? "theme-border-strong" : "border-white/20"
                  }`}
                  style={{
                    backgroundColor: backgroundVariant === "floatingLines" ? "var(--theme-bg-card)" : "rgba(255,255,255,0.03)",
                  }}
                >
                  Lines
                </button>
                <button
                  onClick={() => setBackgroundVariant("pixelBlast")}
                  className={`flex-1 border-2 py-2 px-2 text-center text-[9px] font-bold uppercase tracking-wider transition-all text-white ${
                    backgroundVariant === "pixelBlast" ? "theme-border-strong" : "border-white/20"
                  }`}
                  style={{
                    backgroundColor: backgroundVariant === "pixelBlast" ? "var(--theme-bg-card)" : "rgba(255,255,255,0.03)",
                  }}
                >
                  Pixels
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
