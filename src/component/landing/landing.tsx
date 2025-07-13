"use client";
import { redirect } from "next/navigation";
import React, { FC } from "react";

const LandingComponent: FC = () => {
  return (
    <>
      <div className="w-[300px] h-[400px] bg-amber-100/2 border-solid border-[1px] rounded-md border-gray-800 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className=" text-4xl text-white font-Tektur tracking-tight">
            1337leets
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gray-800 to-transparent mx-auto"></div>
          <p className="text-gray-400 font-Tektur text-sm font-light">
            Elite School Ranking
          </p>
        </div>

        <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center shadow-lg rotate-3">
          <p className="text-[#0070ef] font-Tektur font-semibold">13</p>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-white text-lg font-medium">Welcome Back</h3>
          <p className="text-gray-500 text-xs">
            Access your academic dashboard
          </p>
        </div>
        <button
          onClick={() =>
            redirect(process.env.NEXT_PUBLIC_REDIRECT_URL as string)
          }
          className="cursor-pointer w-full bg-gradient-to-r border-solid border-[1px] border-[#888C94]/30 from-[#888C94]/5 to-[#888C94]/5 text-white py-3 px-6 rounded-md font-semibold text-sm shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="font-Tektur font-light text-[#0070ef]">
              Login to Platform
            </span>
          </div>
        </button>

        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span>Online</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
            <span>Secure</span>
          </div>
        </div>

        {/* Old Version Access */}
      </div>
      <div className="w-[200px] z-20 text-center space-y-3 pt-4 border-t border-gray-700/50">
        <p className="text-gray-500 text-xs font-Tektur">
          Not feeling good with the update?
        </p>
        <button
          onClick={() => window.open("https://oldleets.vercel.app", "_blank")}
          className="cursor-pointer w-full bg-gradient-to-r border-solid border-[1px] border-amber-600/30 from-amber-900/10 to-amber-800/10 text-amber-300 py-2 px-4 rounded-md font-light text-xs shadow-md transition-all duration-300 hover:scale-105 hover:from-amber-800/20 hover:to-amber-700/20"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11H16a1 1 0 110 2H2.586l3.707 3.707a1 1 0 01-1.414 1.414l-5.414-5.414a1 1 0 010-1.414L5.293 6.879a1 1 0 011.414 1.414L3.414 11H16a1 1 0 110 2H3.414l3.293 3.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-Tektur">Access Old Version</span>
          </div>
        </button>
        <p className="text-amber-400/60 text-xs font-Tektur">
          Classic interface available
        </p>
      </div>
    </>
  );
};

export { LandingComponent };
