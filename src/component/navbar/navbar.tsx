"use client";
import React from "react";
import { Buttons } from "./navbar.buttons";
import { PathsObject } from "./navbar.types";
import { motion } from "motion/react";
import { CiMenuFries } from "./navbar.imports";
import Skeleton from "@mui/material/Skeleton";
import { useRouter } from "next/navigation";
import { ContextCreator } from "../context/context";
import { ContextProps } from "../context/context.types";
import { CiLogout } from "react-icons/ci";
import { IoMdNotificationsOutline } from "react-icons/io";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  created_at: string;
  link: string | null;
  is_seen: boolean;
  sender_username: string;
  sender_image: string;
}

const DropDownMenu = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <motion.div
      ref={buttonRef}
      className="w-8 cursor-pointer items-center relative justify-center flex lg:hidden h-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      exit={{ opacity: 0 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 flex items-center justify-center border-2 theme-border bg-[var(--theme-bg-card)]
          hover:bg-[var(--theme-bg)] hover:border-[var(--theme-border-strong)] transition-all duration-150 active:translate-y-0.5 theme-shadow-sm"
        style={{ fontFamily: "var(--font-pixel)" }}
      >
        <CiMenuFries className="theme-text text-xl" />
      </button>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-12 z-[110] border-2 theme-border bg-gray-950/98 p-2 flex flex-col gap-1 theme-shadow-md"
          style={{
            fontFamily: "var(--font-pixel)",
            boxShadow: "4px 4px 0 var(--theme-shadow-md), 0 0 30px var(--theme-bg-card)",
          }}
        >
          {PathsObject.map((path, index) => (
            <Buttons
              key={index}
              icon={path.icon}
              title={path.title}
              route={path.route}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

const Paths = () => {
  return (
    <div className="flex-1 hidden lg:flex h-full gap-2 items-center justify-center">
      {PathsObject.map((path, index) => (
        <Buttons
          key={index}
          icon={path.icon}
          title={path.title}
          route={path.route}
        />
      ))}
    </div>
  );
};

const Navbar = () => {
  const router = useRouter();
  const { setUserData, userData }: ContextProps = React.useContext(
    ContextCreator
  ) as ContextProps;
  const [notificationCount, setNotificationCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) return;
      const data = await response.json();
      setNotifications(data.notifications);
      setNotificationCount(data.unread_count);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsSeen = async (notificationId: number) => {
    try {
      const response = await fetch("/api/notifications/mark-seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notification_id: notificationId }),
      });
      if (response.ok) fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as seen", err);
    }
  };

  const markAllAsSeen = async () => {
    try {
      const response = await fetch("/api/notifications/mark-seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mark_all: true }),
      });
      if (response.ok) fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as seen", err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_seen) markAsSeen(notification.id);
    if (notification.link) router.push(notification.link);
    setShowNotifications(false);
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-4 border-l-green-500";
      case "warning":
        return "border-l-4 border-l-yellow-500";
      case "error":
        return "border-l-4 border-l-red-500";
      default:
        return "border-l-4 border-l-[var(--theme-primary)]";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const Logout = async () => {
    const response = await fetch("/api/logout", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) return;
    setUserData(null);
    router.push("/");
  };

  const DataToFetch = async () => {
    try {
      const response = await fetch("/api/who", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 401) Logout();
        return;
      }
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  };

  React.useEffect(() => {
    DataToFetch();
    fetchNotifications();
  }, []);

  return (
    <nav
      className="relative w-full h-16 z-[100] flex items-center justify-between px-4 sm:px-6 border-b-4 theme-border-strong bg-gray-950/98 backdrop-blur-xl"
      style={{
        fontFamily: "var(--font-pixel)",
        boxShadow: "0 4px 0 var(--theme-shadow-md), 0 0 50px var(--theme-bg-card), inset 0 1px 0 var(--theme-border)",
      }}
    >
      {/* Pixel corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 theme-border" />
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 theme-border" />
      {/* Logo */}
      <div
        onClick={() => router.push("/progress")}
        className="flex items-center cursor-pointer group"
      >
        <h1
          className="text-base sm:text-xl theme-text font-bold tracking-[0.15em]"
          style={{
            textShadow: "1px 0 0 var(--theme-primary-dark), -1px 0 0 var(--theme-primary-dark), 0 1px 0 var(--theme-primary-dark), 0 -1px 0 var(--theme-primary-dark)",
          }}
        >
          1337LEETS
        </h1>
      </div>

      {/* Nav links */}
      <div className="flex items-center h-full gap-2 sm:gap-3 md:gap-4">
        <Paths />

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border-2 theme-border
              bg-[var(--theme-bg-card)] hover:bg-[var(--theme-bg)] hover:border-[var(--theme-border-strong)]
              transition-all duration-150 active:translate-y-0.5 theme-shadow-sm"
          >
            <IoMdNotificationsOutline className="theme-text text-lg" />
            {notificationCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center
                  bg-[var(--theme-primary)] text-white text-[9px] font-bold border-2 border-gray-950"
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-[100] sm:hidden"
                onClick={() => setShowNotifications(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed sm:absolute top-0 left-0 right-0 bottom-0 sm:inset-auto sm:right-0 sm:top-12
                  w-full h-screen sm:w-80 sm:h-auto sm:max-h-96 overflow-y-auto flex flex-col
                  border-2 theme-border bg-gray-950/98 z-[101]"
                style={{
                  boxShadow: "6px 6px 0 var(--theme-shadow-md), 0 0 40px var(--theme-bg)",
                }}
              >
                <div className="p-3 sm:p-4 border-b-2 theme-border flex items-center justify-between sticky top-0 bg-gray-950/98 z-10">
                  <h3 className="theme-text font-bold text-xs uppercase tracking-wider">
                    Notifications {notificationCount > 0 && `(${notificationCount})`}
                  </h3>
                  <div className="flex items-center gap-2">
                    {notificationCount > 0 && (
                      <button
                        onClick={markAllAsSeen}
                        className="theme-text-muted hover:text-[var(--theme-text)] text-[9px] font-bold uppercase"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="sm:hidden theme-text-muted hover:text-white text-2xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="p-6 flex-1 flex items-center justify-center">
                    <p className="theme-text-muted text-[10px] uppercase tracking-wider">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y flex-1 overflow-y-auto" style={{ borderColor: "var(--theme-border)" }}>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-3 sm:p-4 hover:bg-[var(--theme-bg-card)] cursor-pointer transition-colors ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <img
                              src={notification.sender_image}
                              alt={notification.sender_username}
                              className="w-10 h-10 border-2 theme-border object-cover"
                              style={{ imageRendering: "pixelated" }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="theme-text font-bold text-[10px] uppercase">
                              {notification.title}
                            </p>
                            <p className="theme-text-muted text-[9px] uppercase">
                              by {notification.sender_username}
                            </p>
                            <p className="theme-text-muted text-[9px] mt-1">
                              {notification.message}
                            </p>
                            <p className="theme-text-muted text-[8px] mt-1 uppercase opacity-80">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                          {!notification.is_seen && (
                            <div className="w-2 h-2 bg-[var(--theme-primary)] flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={Logout}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border-2 theme-border
            bg-[var(--theme-bg-card)] hover:bg-[var(--theme-bg)] hover:border-[var(--theme-border-strong)]
            transition-all duration-150 active:translate-y-0.5 theme-shadow-sm"
        >
          <CiLogout className="theme-text text-base" />
        </button>

        {/* Online indicator */}
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-400 animate-pulse" />
          <span className="text-[9px] theme-text-muted uppercase tracking-wider">
            Online
          </span>
        </div>

        {/* User Avatar */}
        <div
          onClick={() => router.push("/dashboard")}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border-2 theme-border
            bg-[var(--theme-bg-card)] cursor-pointer hover:border-[var(--theme-border-strong)] hover:shadow-[0_0_15px_var(--theme-bg-card)]
            transition-all duration-150 active:translate-y-0.5 theme-shadow-sm"
        >
          {userData == null ? (
            <Skeleton
              animation={false}
              sx={{ bgcolor: "var(--theme-primary-dark)", m: 0, p: 0 }}
              variant="rectangular"
              width="100%"
              height="100%"
            />
          ) : (
            <img
              src={userData.image}
              alt="User Avatar"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              style={{ imageRendering: "pixelated" }}
            />
          )}
        </div>

        <DropDownMenu />
      </div>

    </nav>
  );
};

export { Navbar };
