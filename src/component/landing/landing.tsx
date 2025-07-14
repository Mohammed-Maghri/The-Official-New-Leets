"use client";
import { redirect } from "next/navigation";
import React, { FC } from "react";

const LandingComponent: FC = () => {
  return (
    <>
      <div className="w-[300px] h-[440px] bg-gray-900/30 border-solid border-[1px] rounded-md border-gray-600/40 backdrop-blur-lg z-20 flex flex-col items-center justify-center p-8 space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <h1 className="text-4xl bg-gradient-to-r from-blue-400 via-white to-blue-300 bg-clip-text text-transparent font-Tektur tracking-tight">
            1337leets
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto"></div>
          <p className="text-blue-200/80 font-Tektur text-sm font-light">
            Elite School Ranking
          </p>
        </div>

        

        <div className="text-center space-y-1">
          <h3 className="text-blue-100 text-lg font-medium">Welcome Back</h3>
          <p className="text-blue-300/70 text-xs">
            Access your academic dashboard
          </p>
        </div>
        <button
          onClick={() =>
            redirect(process.env.NEXT_PUBLIC_REDIRECT_URL as string)
          }
          className="cursor-pointer w-full bg-gradient-to-r border-solid border-[1px] border-blue-500/40
           from-blue-900/30 to-blue-800/30 text-white py-3 px-6 rounded-md 
          font-semibold text-sm shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-blue-500/30"
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="font-Tektur font-light text-blue-300">
              Login to Platform
            </span>
          </div>
        </button>
        <button
          onClick={() => window.open("https://oldleets.vercel.app", "_blank")}
          className="cursor-pointer w-full bg-gradient-to-r border-solid border-[1px] border-amber-500/40 from-amber-900/20
             to-amber-800/20 text-amber-200 py-2 px-4 rounded-md font-light text-xs shadow-md transition-all 
             duration-300 hover:scale-105 hover:from-amber-800/30 hover:to-amber-700/30 hover:shadow-amber-500/20"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-3 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11H16a1 1 0 110 2H2.586l3.707 3.707a1 1 0 01-1.414 1.414l-5.414-5.414a1 1 0 010-1.414L5.293 6.879a1 1 0 011.414 1.414L3.414 11H16a1 1 0 110 2H3.414l3.293 3.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-Tektur">Access Old Version</span>
          </div>
        </button>
      </div>
      <div className="w-[200px] z-20 text-center space-y-3 pt-4 border-t border-blue-600/30">
        <p className="text-blue-300/70 text-xs font-Tektur">
          Not feeling good with the update?
        </p>
        <p className="text-amber-300/80 text-xs font-Tektur">
          Classic interface available
        </p>
      </div>
    </>
  );
};

export { LandingComponent };
