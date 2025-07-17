import React from "react";
import { CiCalculator1 } from "react-icons/ci";
import { AiOutlineClockCircle } from "react-icons/ai";
import { BsGear } from "react-icons/bs";

const CalculatorPage = () => {
  return (
    <div className="flex flex-1 pt-20 items-center overflow-x-hidden
     flex-col justify-center bg-gradient-to-br from-gray-900/95
      via-orange-400/5 to-amber-500/10 relative p-4">
      <div className="absolute top-0 left-0 w-24 h-24 md:w-48 md:h-48 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-30 h-30 md:w-60 md:h-60 bg-gradient-to-tl from-amber-500/15 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-24 md:h-24 bg-yellow-400/10 rounded-full blur-2xl"></div>

      <div className="relative z-10 max-w-sm md:max-w-md lg:max-w-lg mx-auto px-3 text-center w-full">
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <div className="w-12 h-12 md:w-15 md:h-15 lg:w-18 lg:h-18 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-2xl shadow-orange-400/50 animate-pulse">
              <CiCalculator1 size={18} className="text-white md:hidden" />
              <CiCalculator1 size={24} className="text-white hidden md:block lg:hidden" />
              <CiCalculator1 size={30} className="text-white hidden lg:block" />
            </div>
            <div className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 w-4.5 h-4.5 md:w-6 md:h-6 bg-gradient-to-r from-[#0070ef] to-blue-400 rounded-full flex items-center justify-center">
              <BsGear size={9} className="text-white md:hidden animate-spin" />
              <BsGear size={12} className="text-white hidden md:block animate-spin" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent font-[\'Tektur\']">
          GPA Calculator
        </h1>

        <p className="text-sm md:text-base lg:text-lg text-white/90 font-Tektur font-light mb-4">
          Advanced Computing Tools
        </p>

        <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/30 border border-orange-400/30 rounded-lg md:rounded-xl p-3 md:p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex justify-center mb-3">
            <div className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-400/20 to-amber-500/10 border border-orange-400/30 rounded-full flex items-center justify-center">
              <AiOutlineClockCircle size={15} className="text-orange-400 md:hidden animate-pulse" />
              <AiOutlineClockCircle size={18} className="text-orange-400 hidden md:block lg:hidden animate-pulse" />
              <AiOutlineClockCircle size={21} className="text-orange-400 hidden lg:block animate-pulse" />
            </div>
          </div>

          <h2 className="text-lg md:text-xl font-semibold text-white font-Tektur mb-2">
            Coming Soon
          </h2>

          <p className="text-gray-300 font-Tektur leading-relaxed mb-3 md:mb-4 text-xs md:text-sm lg:text-base">
            We&apos;re building powerful calculation tools including project estimators, 
            grade calculators, and productivity metrics. Stay tuned for launch!
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="bg-gradient-to-br from-orange-400/10 to-amber-500/5 border border-orange-400/20 rounded-md p-2 md:p-3">
              <div className="w-4.5 h-4.5 md:w-6 md:h-6 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center mb-1.5 md:mb-2 mx-auto">
                <span className="text-white text-xs md:text-xs font-bold">📊</span>
              </div>
              <p className="text-xs md:text-xs text-orange-300 font-Tektur">
                Grade Calculator
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#0070ef]/10 to-blue-500/5 border border-[#0070ef]/20 rounded-md p-2 md:p-3">
              <div className="w-4.5 h-4.5 md:w-6 md:h-6 bg-gradient-to-r from-[#0070ef] to-blue-400 rounded-full flex items-center justify-center mb-1.5 md:mb-2 mx-auto">
                <span className="text-white text-xs md:text-xs font-bold">📈</span>
              </div>
              <p className="text-xs md:text-xs text-blue-300 font-Tektur">
                Project Estimator
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-400/10 to-amber-500/5 border border-yellow-400/20 rounded-md p-2 md:p-3">
              <div className="w-4.5 h-4.5 md:w-6 md:h-6 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mb-1.5 md:mb-2 mx-auto">
                <span className="text-white text-xs md:text-xs font-bold">⚡</span>
              </div>
              <p className="text-xs md:text-xs text-yellow-300 font-Tektur">
                Time Tracker
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3 md:mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400 font-Tektur">Development Progress</span>
              <span className="text-xs text-orange-400 font-Tektur font-bold">75%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Notify Section */}
          <div className="border-t border-gray-600/30 pt-3 md:pt-4">
            <p className="text-gray-400 font-Tektur text-xs md:text-xs mb-2">
              Be the first to know when it&apos;s ready!
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-6 md:mt-9 flex justify-center space-x-2 md:space-x-3">
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-orange-400 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-amber-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-yellow-400 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
