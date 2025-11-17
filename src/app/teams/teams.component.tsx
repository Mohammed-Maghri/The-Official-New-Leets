"use client";
import React from "react";
import { FaArrowsSpin } from "react-icons/fa6";

const LaoderComp: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="w-[50px] h-[50px] animate-spin flex items-center justify-center">
          <FaArrowsSpin size={45} color="white" />
        </div>
        <div className="absolute inset-0 w-[50px] h-[50px] rounded-full border-2 border-blue-400/30 animate-ping"></div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-white font-Tektur text-lg">Loading teams...</p>
        <p className="text-gray-400 font-Tektur text-sm">This may take a few seconds due to 42 API response time</p>
      </div>
    </div>
  );
};

export { LaoderComp };
