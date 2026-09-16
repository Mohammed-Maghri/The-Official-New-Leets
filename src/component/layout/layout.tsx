"use client";
import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { XPDesktop, XPExplorerTabs } from "@/component/xp/XPDesktop";

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <XPDesktop>
      {pathname !== "/" && <XPExplorerTabs />}
      <div className={`xp-page ${pathname === "/" ? "xp-page--landing" : ""}`}>{children}</div>
      {pathname === "/" && <a className="xp-credit" href="https://profile.intra.42.fr/users/mmaghri" target="_blank" rel="noopener noreferrer">
        <Image src="/muh.png" alt="" width={28} height={28} />
        <span>MADE WITH ♥ BY <strong>MMAGHRI</strong></span>
      </a>}
    </XPDesktop>
  );
}
