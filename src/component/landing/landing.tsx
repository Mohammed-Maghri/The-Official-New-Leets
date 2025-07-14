"use client";
import { redirect } from "next/navigation";
import React, { FC } from "react";

const LandingComponent: FC = () => {
  return (
    <>
      <div
        className="w-[300px] h-[440px] bg-gray-900/30 border-solid border-[1px] rounded-md
       border-gray-600/40 backdrop-blur-lg z-20 flex flex-col items-center justify-center p-8 space-y-6 shadow-xl"
      >
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

        <div className="">
          <button
            onClick={() =>
              window.open("https://github.com/Mohammed-Maghri", "_blank")
            }
            className="cursor-pointer w-full bg-gradient-to-r border-solid border-[1px] border-gray-500/40 from-gray-900/20
            to-gray-800/20 text-gray-200 py-2 px-4 rounded-md font-light text-xs shadow-md transition-all 
            duration-300 hover:scale-105 hover:from-gray-800/30 mb-2 hover:to-gray-700/30 hover:shadow-gray-500/20"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="font-Tektur">Drop a Follow</span>
            </div>
          </button>
          <button
            onClick={() =>
              window.open(
                "https://github.com/Mohammed-Maghri/The-Official-New-Leets",
                "_blank"
              )
            }
            className="cursor-pointer w-full bg-gradient-to-r border-solid border-[1px] border-yellow-500/40 from-yellow-900/20
            to-yellow-800/20 text-yellow-200 py-2 px-4 rounded-md font-light text-xs shadow-md transition-all 
            duration-300 hover:scale-105 hover:from-yellow-800/30 hover:to-yellow-700/30 hover:shadow-yellow-500/20"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="font-Tektur">Drop a Star ⭐</span>
            </div>
          </button>
        </div>
      </div>

      <div className="w-[200px] z-20 text-center space-y-3 pt-2 border-t border-blue-600/30 mt-2">
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
