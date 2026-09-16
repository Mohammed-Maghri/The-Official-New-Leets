"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ContextCreator } from "../context/context";
import type { ContextProps } from "../context/context.types";
import { Navbar } from "../navbar/navbar";
import { usePathname, useRouter } from "next/navigation";
import { XPIcon, type XPIconName } from "./XPIcon";

const shortcuts: { label: string; href: string; icon: XPIconName }[] = [
  { label: "My dashboard", href: "/dashboard", icon: "computer" },
  { label: "Calculator", href: "/calculator", icon: "calculator" },
  { label: "Database", href: "/database", icon: "database" },
  { label: "TLD/RW", href: "/dashboard/canvas", icon: "folder" },
  { label: "Peer-Finder", href: "/peerfinder", icon: "users" },
  { label: "Rank", href: "/progress", icon: "trophy" },
];

function initialTabs(path: string): string[] {
  if (path === "/") return [];
  return Array.from(new Set([...shortcuts.map(item => item.href), path]));
}

function pageDetails(path: string): { label: string; icon: XPIconName } {
  return shortcuts.find(item => item.href === path) ?? ({
    "/evaluations": { label: "Evaluations", icon: "users" },
    "/cv-maker": { label: "CV Maker", icon: "folder" },
    "/chat": { label: "Chat", icon: "users" },
    "/teams": { label: "Teams", icon: "users" },
    "/dashboard/feedback-reviews": { label: "Feedback reviews", icon: "folder" },
  } as Record<string, { label: string; icon: XPIconName }>)[path] ?? { label: "1337LEETS", icon: "computer" };
}

const WindowContext = createContext<{
  minimize: () => void; maximize: () => void; maximized: boolean;
  tabs: string[]; closeTab: (path: string) => void;
} | null>(null);

export function XPExplorerTabs() {
  const window = useContext(WindowContext);
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname() ?? "/";
  const activeRef = useRef<HTMLAnchorElement>(null);
  const tabCount = window?.tabs.length;
  useEffect(() => { mobileMenuRef.current?.removeAttribute("open"); }, [pathname]);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!mobileMenuRef.current?.contains(event.target as Node)) mobileMenuRef.current?.removeAttribute("open");
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileMenuRef.current?.open) {
        mobileMenuRef.current.removeAttribute("open");
        mobileMenuRef.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  useEffect(() => { activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" }); }, [pathname, tabCount]);
  if (!window || pathname === "/") return null;
  const mobilePages = Array.from(new Set([...shortcuts.map(item => item.href), ...window.tabs, pathname]));
  return <div className="xp-explorer-toolbar">
    <details className="xp-mobile-pages" ref={mobileMenuRef}>
      <summary aria-label={`Choose page, current page: ${pageDetails(pathname).label}`}>
        <XPIcon name={pageDetails(pathname).icon} size={20} />
        <span>{pageDetails(pathname).label}</span><span aria-hidden="true">▾</span>
      </summary>
      <nav className="xp-mobile-page-menu" aria-label="Choose page">
        {mobilePages.map(path => <Link key={path} href={path} prefetch={false} aria-current={path === pathname ? "page" : undefined} onClick={() => mobileMenuRef.current?.removeAttribute("open")}>
          <XPIcon name={pageDetails(path).icon} size={20} /><span>{pageDetails(path).label}</span>
        </Link>)}
      </nav>
    </details>
    <nav className="xp-explorer-tabs" aria-label="Open pages">
    {window.tabs.map(path => {
      const page = pageDetails(path);
      const active = path === pathname;
      return <div key={path} className={`xp-explorer-tab ${active ? "xp-explorer-tab--active" : ""}`}>
        <Link ref={active ? activeRef : undefined} href={path} prefetch={false} aria-current={active ? "page" : undefined}><XPIcon name={page.icon} size={16} /><span>{page.label}</span></Link>
        <button type="button" aria-label={`Close ${page.label} tab`} onClick={() => window.closeTab(path)}>×</button>
      </div>;
    })}
  </nav><XPAccountControls /></div>;
}
function XPAccountControls() {
  const { userData, setUserData } = useContext(ContextCreator) as ContextProps;
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const logout = async () => {
    setLoggingOut(true);
    setError("");
    try {
      const response = await fetch("/api/logout", { credentials: "include" });
      if (!response.ok) throw new Error("Logout failed");
      setUserData(null);
      router.push("/");
    } catch {
      setError("Could not log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };
  return <div className="xp-account-controls">
    <Link href="/dashboard" aria-label="My profile" title={userData?.login || "My profile"}>
      <Image src={userData?.image || "/nopic.jpg"} alt="Your profile" width={28} height={28} unoptimized />
    </Link>
    <button type="button" aria-label="Log out" title="Log out" disabled={loggingOut} onClick={logout}><XPIcon name="logout" size={22} /></button>
    {error && <span className="xp-account-error" role="alert">{error}</span>}
  </div>;
}

export function XPWindowControls() {
  const window = useContext(WindowContext);
  if (!window) return null;
  return <div className="xp-window-controls">
    <button onClick={window.minimize} aria-label="Minimize window">−</button>
    <button onClick={window.maximize} aria-label={window.maximized ? "Restore window" : "Maximize window"}>□</button>
    <button className="xp-close" onClick={window.minimize} aria-label="Close window">×</button>
  </div>;
}

export function XPDesktop({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const landing = pathname === "/";
  const router = useRouter();
  const [tabs, setTabs] = useState<string[]>(() => initialTabs(pathname));
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(!landing);
  const [startOpen, setStartOpen] = useState(false);
  const [time, setTime] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    tick();
    const timer = setInterval(tick, 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    // Returning from an application page must restore the compact login window.
    setMinimized(false);
    setMaximized(!landing);
    setStartOpen(false);
    setTabs(previous => landing ? [] : previous.length === 0 ? initialTabs(pathname) : previous.includes(pathname) ? previous : [...previous, pathname]);
  }, [pathname, landing]);
  useEffect(() => {
    if (!startOpen) return;
    const close = (e: PointerEvent) => { if (!menuRef.current?.contains(e.target as Node)) setStartOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") setStartOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, [startOpen]);
  const closeTab = (path: string) => {
    const remaining = tabs.filter(tab => tab !== path);
    if (remaining.length === 0) {
      // Closing the final tab hides the window; the taskbar can restore it.
      setMinimized(true);
      return;
    }
    setTabs(remaining);
    if (pathname === path) {
      const index = tabs.indexOf(path);
      router.push(remaining[Math.min(index, remaining.length - 1)]);
    }
  };
  return (
    <WindowContext.Provider value={{ minimize: () => setMinimized(true), maximize: () => setMaximized(v => !v), maximized, tabs, closeTab }}>
    <div className={`xp-desktop ${landing ? "xp-desktop--landing" : ""}`}>
      <div className={`xp-workspace ${maximized ? "" : "xp-workspace--restored"}`} hidden={minimized}>
        {!landing && <>
          <div className="xp-titlebar">
            <span className="xp-window-caption"><XPIcon name="computer" size={20} />{pageDetails(pathname).label} - 1337LEETS - Student Explorer</span>
            <XPWindowControls />
          </div>

        </>}
        {children}
      </div>
      {landing && <a className="xp-credit" href="https://profile.intra.42.fr/users/mmaghri" target="_blank" rel="noopener noreferrer">
        <Image src="/muh.png" alt="" width={28} height={28} />
        <span>MADE WITH ♥ BY <strong>MMAGHRI</strong></span>
      </a>}
      {minimized && <button className="xp-desktop-shortcut" onClick={() => setMinimized(false)}><XPIcon name="computer" size={48} /><span>Open 1337LEETS</span></button>}
      <footer className="xp-taskbar">
        <div ref={menuRef}>
          <button className="xp-start" aria-expanded={startOpen} aria-controls="xp-start-menu" onClick={() => setStartOpen(v => !v)}><span className="xp-start-mark" aria-hidden="true"><i /><i /><i /><i /></span>start</button>
          {startOpen && <nav id="xp-start-menu" className="xp-start-menu" aria-label="Start menu">
            <div className="xp-start-heading"><XPIcon name="computer" size={32} />1337LEETS</div>
            {(landing ? [{label:"Welcome",href:"/",icon:"computer" as const}] : shortcuts).map(item => <Link key={item.href} href={item.href} onClick={() => {setMinimized(false);setStartOpen(false);}}><XPIcon name={item.icon} />{item.label}</Link>)}
            <div className="xp-start-footer">Your progress, peers, and tools.</div>
          </nav>}
        </div>
        <button className="xp-task" onClick={() => setMinimized(v => !v)} aria-label={minimized ? "Restore 1337LEETS" : "Minimize 1337LEETS"}><XPIcon name="computer" size={20} /><span>1337LEETS</span></button>
        <div className="xp-tray">{!landing && <Navbar compact />}<XPIcon name="volume" size={18} /><time suppressHydrationWarning>{time}</time></div>
      </footer>
    </div>
    </WindowContext.Provider>
  );
}
