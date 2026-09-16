"use client";
import React from "react";
import Image from "next/image";
import AdaptiveBackground from "@/component/landing/AdaptiveBackground";
import { Navbar } from "@/component/navbar/navbar";
import { usePathname } from "next/navigation";
import { useTheme, themeConfig } from "@/component/context/ThemeContext";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { themeColor, themeMode } = useTheme();
  const config = themeConfig[themeColor];
  const isLight = themeMode === "light";
  const bgFrom = isLight ? "from-gray-100" : "from-black";
  const bgVia = isLight ? "via-gray-50" : "via-gray-950";
  const bgTo = isLight ? config.bgClassLight : config.bgClass;
  const overlayTo = isLight ? config.overlayClassLight : config.overlayClass;

  return (
    <div
      className={`relative h-full flex-1 flex flex-col w-full min-h-0 overflow-y-auto overflow-x-hidden bg-gradient-to-br ${bgFrom} ${bgVia} ${bgTo} ${
        pathname !== "/" ? "lg:overflow-hidden" : ""
      }`}
    >
      {pathname !== "/" && <Navbar />}
      {children}

      {/* Decorative pixel grid - fills empty space (hidden on database to avoid obscuring tables) */}
      {pathname !== "/database" && (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
        <div
          className={`absolute inset-0 ${isLight ? "opacity-[0.04]" : "opacity-[0.02]"}`}
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 14px, rgba(${config.gridColor},0.4) 14px, rgba(${config.gridColor},0.4) 15px),
            repeating-linear-gradient(90deg, transparent, transparent 14px, rgba(${config.gridColor},0.4) 14px, rgba(${config.gridColor},0.4) 15px)`,
          }}
        />
      </div>
      )}

      {pathname !== "/database" && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute inset-0 bg-gradient-to-t ${isLight ? "from-white/30" : "from-black/60"} via-transparent ${overlayTo}`} />
        </div>
      )}

      {/* Rank page: dim overlay to soften background colors */}
      {pathname === "/progress" && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[2]">
          <div className="absolute inset-0 bg-black/45" />
        </div>
      )}

      {pathname !== "/database" && (
      <div
        className={`h-full bg-transparent w-full absolute z-0 inset-0 ${!isLight ? "opacity-50" : ""}`}
        style={{ width: "100%", height: "100%" }}
      >
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <AdaptiveBackground />
        </div>
      </div>
      )}

      {pathname === "/" && (
        <div
          className="fixed bottom-4 left-4 z-50 group"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <div className="flex items-center gap-2 border-2 theme-border-strong bg-gray-950/95 p-1 transition-all duration-200 hover:border-[var(--theme-primary)] hover:shadow-[0_0_25px_var(--theme-bg-card)]" style={{ boxShadow: "0 0 20px var(--theme-bg-card)" }}>
            <div className="w-8 h-8 border-2 theme-border flex items-center justify-center overflow-hidden bg-[var(--theme-bg-card)]">
              <Image
                src="/muh.png"
                alt="Creator"
                className="w-full h-full object-cover"
                width={32}
                height={32}
                priority
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <div className="flex items-center gap-1 pr-2">
              <span className="text-[9px] theme-text-muted uppercase tracking-wider">
                Made with
              </span>
              <span className="text-[var(--theme-primary)]">♥</span>
              <span className="text-[9px] theme-text-muted uppercase tracking-wider">
                by
              </span>
              <span
                onClick={() =>
                  window.open("https://profile.intra.42.fr/users/mmaghri")
                }
                className="cursor-pointer text-[9px] theme-text font-bold uppercase tracking-wider underline decoration-[var(--theme-primary)] hover:opacity-90"
              >
                mmaghri
              </span>
            </div>
          </div>

          {/* Pixel tooltip */}
          <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="border-2 theme-border bg-gray-950/98 px-3 py-2 theme-shadow-sm" style={{ boxShadow: "0 0 15px var(--theme-bg-card)" }}>
              <div className="text-[9px] theme-text font-bold uppercase tracking-wider">
                Mohammed Maghri
              </div>
              <div className="text-[8px] theme-text-muted uppercase tracking-widest">
                Full Stack Developer
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { Layout };
