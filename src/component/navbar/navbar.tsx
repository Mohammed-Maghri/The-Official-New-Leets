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
import { useRateLimitHandler } from "@/component/hooks/useRateLimitHandler";
import RateLimitPopup from "@/component/RateLimitPopup";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
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
      transition={{ duration: 1 }}
      exit={{ opacity: 0 }}
    >
      <CiMenuFries
        onClick={() => setIsOpen(!isOpen)}
        className="text-blue-400 text-2xl"
      />
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="absolute right-2 bg-blue-950/95 gap-2 flex items-center justify-start 
          p-2 flex-col border-solid border-[1px] border-blue-800/50 rounded-xl top-10"
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
  const { rateLimitState, handleRateLimitResponse, closeRateLimitPopup } = useRateLimitHandler();
  
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      // Check for rate limiting
      const isRateLimited = await handleRateLimitResponse(response);
      if (isRateLimited) return;

      if (!response.ok) {
        console.error("Failed to fetch notifications");
        return;
      }

      const data = await response.json();
      setNotifications(data.notifications);
      setNotificationCount(data.unread_count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsSeen = async (notificationId: number) => {
    try {
      const response = await fetch("/api/notifications/mark-seen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ notification_id: notificationId }),
      });

      if (response.ok) {
        // Refresh notifications
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as seen:", error);
    }
  };

  const markAllAsSeen = async () => {
    try {
      const response = await fetch("/api/notifications/mark-seen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ mark_all: true }),
      });

      if (response.ok) {
        // Refresh notifications
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking all notifications as seen:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_seen) {
      markAsSeen(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    setShowNotifications(false);
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-l-green-500';
      case 'warning':
        return 'border-l-4 border-l-yellow-500';
      case 'error':
        return 'border-l-4 border-l-red-500';
      default:
        return 'border-l-4 border-l-[#0070ef]';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };
  
  const Logout = async () => {
    const response = await fetch("/api/logout", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.error("Failed to log out");
      return;
    }
    setUserData(null);
    router.push("/");
  };

  const DataToFetch = async () => {
    try {
      const response = await fetch("/api/who", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      // Check for rate limiting
      const isRateLimited = await handleRateLimitResponse(response);
      if (isRateLimited) return;
      
      if (!response.ok) {
        // Only logout on 401 (unauthorized), not other errors
        if (response.status === 401) {
          Logout();
        } else {
          console.error("Failed to fetch user data:", response.status);
        }
        return;
      }
      
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };


  React.useEffect(() => {
    DataToFetch();
    fetchNotifications();
  }, []);
  return (
    <nav className="w-full h-16 bg-blue-950/30 border-b border-blue-800/50 backdrop-blur-xl z-20 flex items-center justify-between px-6">
      <div 
        onClick={() => router.push('/progress')}
        className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity duration-200"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center rotate-3">
          <span className="text-white font-Tektur text-sm font-bold">
            13
          </span>
        </div>
        <h1 className="text:[15px] sm:text-2xl m-2 sm:m-0 text-white font-Tektur tracking-tight">
          1337leets
        </h1>
      </div>
      <div className="flex items-center  h-full space-x-2 sm:space-x-4 md:space-x-6">
        <Paths />
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 text-xs text-gray-600">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="transition-all duration-200 flex cursor-pointer hover:scale-110 items-center 
                justify-center w-[30px] h-[30px] sm:w-[35px] sm:h-[35px] rounded-full bg-blue-950/20 hover:bg-blue-900/30 
                border border-blue-800/40 hover:border-blue-700/60 relative"
            >
              <IoMdNotificationsOutline className="text-white text-lg sm:text-xl" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full 
                  flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold font-Tektur 
                  border-2 border-gray-900 animate-pulse">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                {/* Mobile Overlay */}
                <div 
                  className="fixed inset-0 bg-black/50 z-[100] sm:hidden"
                  onClick={() => setShowNotifications(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed sm:absolute top-0 left-0 right-0 bottom-0 sm:inset-auto sm:right-0 sm:top-12 
                    w-full h-screen sm:w-80 sm:h-auto bg-blue-950/95 border-0 sm:border border-blue-800/50 
                    sm:rounded-xl z-[101] sm:max-h-96 overflow-y-auto flex flex-col backdrop-blur-xl"
                >
                  <div className="p-3 sm:p-4 border-b border-blue-800/50 flex items-center justify-between sticky top-0 bg-blue-950/95 backdrop-blur-xl z-10">
                    <h3 className="text-white font-Tektur font-semibold text-base sm:text-base">
                      Notifications {notificationCount > 0 && `(${notificationCount})`}
                    </h3>
                    <div className="flex items-center gap-2">
                      {notificationCount > 0 && (
                        <button
                          onClick={markAllAsSeen}
                          className="text-blue-400 hover:text-blue-300 font-Tektur text-xs"
                        >
                          Mark all read
                        </button>
                      )}
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="sm:hidden text-gray-400 hover:text-white text-3xl leading-none"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="p-6 sm:p-8 text-center flex-1 flex items-center justify-center">
                      <p className="text-gray-400 font-Tektur text-sm">
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-blue-800/30 flex-1 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-3 sm:p-4 hover:bg-blue-900/30 transition-colors cursor-pointer ${
                            !notification.is_seen ? 'bg-blue-900/20' : ''
                          } ${getNotificationColor(notification.type)}`}
                        >
                          <div className="flex gap-3">
                            {/* Sender Profile Picture */}
                            <div className="flex-shrink-0">
                              <img
                                src={notification.sender_image}
                                alt={notification.sender_username}
                                className="w-10 h-10 rounded-full border-2 border-blue-700/40"
                              />
                            </div>
                            
                            {/* Notification Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-Tektur text-sm font-semibold">
                                    {notification.title}
                                  </p>
                                  <p className="text-gray-400 font-Tektur text-xs">
                                    by @{notification.sender_username}
                                  </p>
                                </div>
                                {!notification.is_seen && (
                                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-1"></div>
                                )}
                              </div>
                              <p className="text-gray-300 font-Tektur text-xs mt-2">
                                {notification.message}
                              </p>
                              <p className="text-gray-500 font-Tektur text-xs mt-2">
                                {formatTimeAgo(notification.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>

          <div
            onClick={Logout}
            className="transition-all duration-200 flex cursor-pointer hover:scale-110 ml-1 items-center 
          justify-center w-[25px] h-[25px] mr-1 rounded-full bg-blue-950/20 hover:bg-blue-900/30 border border-blue-800/40"
          >
            <CiLogout color="white" className="text-white" />
          </div>
          <div className="hidden sm:flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-Tektur ">Online</span>
          </div>
        </div>

        <div
          onClick={() => router.push("/dashboard")}
          className="w-10 h-10 bg-gradient-to-br from-blue-600/20 to-blue-700/10 
        rounded-full flex cursor-pointer items-center justify-center border border-blue-700/40"
        >
          {userData == null ? (
            <Skeleton
              animation={false}
              sx={{ bgcolor: "#0070ef", m: 0, p: 0 }}
              variant="circular"
              width={29}
              height={30}
            />
          ) : (
            <img
              src={userData.image}
              alt="User Avatar"
              width={40}
              height={40}
              className="rounded-full w-full h-full object-cover border-solid border-[2px] border-blue-700/40"
            />
          )}
        </div>
        <DropDownMenu />
      </div>
      
      {/* Rate Limit Popup */}
      <RateLimitPopup
        show={rateLimitState.isRateLimited}
        onClose={closeRateLimitPopup}
        retryAfter={rateLimitState.retryAfter}
      />
    </nav>
  );
};

export { Navbar };
