"use client";
import React from "react";
import { FaArrowsSpin } from "react-icons/fa6";

const LaoderComp: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Spinner */}
      <div className="relative">
        <div className="w-[50px] h-[50px] animate-spin flex items-center justify-center">
          <FaArrowsSpin size={45} color="white" />
        </div>
        {/* Pulse ring effect */}
        <div className="absolute inset-0 w-[50px] h-[50px] rounded-full border-2 border-blue-400/30 animate-ping"></div>
      </div>

      {/* Loading text */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-medium text-white font-Tektur">
          Checking User State
        </h3>
        <p className="text-gray-400 font-Tektur text-sm">
          Verifying your access privileges...
        </p>

        {/* Animated dots */}
        <div className="flex justify-center space-x-1 mt-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: "1s",
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { LaoderComp };
