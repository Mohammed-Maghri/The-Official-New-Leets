"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { XPDesktop, XPExplorerTabs } from "@/component/xp/XPDesktop";

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <XPDesktop>
      {pathname !== "/" && <XPExplorerTabs />}
      <div className={`xp-page ${pathname === "/" ? "xp-page--landing" : ""}`}>{children}</div>

    </XPDesktop>
  );
}
