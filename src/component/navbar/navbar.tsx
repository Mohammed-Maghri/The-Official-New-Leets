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

const DropDownMenu = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <motion.div
      className="w-8 cursor-pointer items-center relative justify-center flex lg:hidden h-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      exit={{ opacity: 0 }}
    >
      <CiMenuFries
        onClick={() => setIsOpen(!isOpen)}
        className="text-[#0070ef] text-2xl"
      />
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="absolute right-2 bg-[#001226] gap-2 flex items-center  justify-start 
          p-2 flex-col border-solid border-[1px] border-[#0070ef]/50 rounded-md top-10"
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
    const response = await fetch("/api/who", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.log("here !");
      Logout();
      throw new Error("Failed to fetch user data");
    }
    const data = await response.json();
    setUserData(data);
    console.log("User Data: ", data);
  };


  React.useEffect(() => {
    try {
      DataToFetch();
    } catch {
      console.log("Logouting");
    }
  }, []);
  return (
    <nav className="w-full h-16 bg-amber-100/2 border-b border-gray-800 backdrop-blur-xs z-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-1">
        <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center shadow-lg rotate-3">
          <span className="text-[#0070ef] font-Tektur  text-sm font-bold">
            13
          </span>
        </div>
        <h1 className="text:[15px] sm:text-2xl m-2 sm:m-0 text-white font-Tektur tracking-tight">
          1337leets
        </h1>
      </div>
      <div className="flex items-center  h-full space-x-6">
        <Paths />
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <div
            onClick={Logout}
            className="transition-all duration-200 flex cursor-pointer hover:scale-110 ml-1 items-center 
          justify-center w-[25px] h-[25px] mr-1 rounded-full bg-amber-100/5"
          >
            <CiLogout color="white" className="text-white" />
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-Tektur ">Online</span>
          </div>
        </div>

        <div
          onClick={() => router.push("/dashboard")}
          className="w-10 h-10 bg-gradient-to-br from-[#0070ef]/20 to-[#0070ef]/10 
        rounded-full flex cursor-pointer items-center justify-center border border-[#0070ef]/30"
        >
          {userData == null ? (
            <Skeleton
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
              className="rounded-full w-full h-full object-cover border-solid border-[2px] border-[#0070ef]/30"
            />
          )}
        </div>
        <DropDownMenu />
      </div>
    </nav>
  );
};

export { Navbar };
