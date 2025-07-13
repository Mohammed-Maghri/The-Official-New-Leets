import React from "react";
import { FaUsersViewfinder } from "react-icons/fa6";
import { AiOutlineClockCircle } from "react-icons/ai";
import { BsSearch } from "react-icons/bs";

const PeerFinderPage = () => {
  return (
    <div className="flex flex-1 items-center overflow-x-hidden flex-col justify-center pt-20
     bg-gradient-to-br from-gray-900/95 via-green-400/5 to-emerald-500/10 relative ">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-24 h-24 md:w-48 md:h-48 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-30 h-30 md:w-60 md:h-60 bg-gradient-to-tl from-emerald-500/15 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-24 md:h-24 bg-teal-400/10 rounded-full blur-2xl"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-sm md:max-w-md lg:max-w-lg mx-auto px-3 text-center w-full">
        {/* Peer Finder Icon */}
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <div className="w-12 h-12 md:w-15 md:h-15 lg:w-18 lg:h-18 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-2xl shadow-green-400/50 animate-pulse">
              <FaUsersViewfinder size={18} className="text-white md:hidden" />
              <FaUsersViewfinder size={24} className="text-white hidden md:block lg:hidden" />
              <FaUsersViewfinder size={30} className="text-white hidden lg:block" />
            </div>
            <div className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 w-4.5 h-4.5 md:w-6 md:h-6 bg-gradient-to-r from-[#0070ef] to-blue-400 rounded-full flex items-center justify-center">
              <BsSearch size={9} className="text-white md:hidden animate-pulse" />
              <BsSearch size={12} className="text-white hidden md:block animate-pulse" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent font-Tektur mb-2">
          PEER FINDER
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-base lg:text-lg text-white/90 font-Tektur font-light mb-4">
          Connect & Collaborate
        </p>

        {/* Coming Soon Card */}
        <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/30 border border-green-400/30 rounded-lg md:rounded-xl p-3 md:p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex justify-center mb-3">
            <div className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-400/20 to-emerald-500/10 border border-green-400/30 rounded-full flex items-center justify-center">
              <AiOutlineClockCircle size={15} className="text-green-400 md:hidden animate-pulse" />
              <AiOutlineClockCircle size={18} className="text-green-400 hidden md:block lg:hidden animate-pulse" />
              <AiOutlineClockCircle size={21} className="text-green-400 hidden lg:block animate-pulse" />
            </div>
          </div>

          <h2 className="text-lg md:text-xl font-semibold text-white font-Tektur mb-2">
            Coming Soon
          </h2>

          <p className="text-gray-300 font-Tektur leading-relaxed mb-3 md:mb-4 text-xs md:text-sm lg:text-base">
            We&apos;re developing smart peer matching algorithms to help you find study partners, 
            project collaborators, and coding buddies based on skills and interests.
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="bg-gradient-to-br from-green-400/10 to-emerald-500/5 border border-green-400/20 rounded-md p-2 md:p-3">
              <div className="w-4.5 h-4.5 md:w-6 md:h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-1.5 md:mb-2 mx-auto">
                <span className="text-white text-xs md:text-xs font-bold">🤝</span>
              </div>
              <p className="text-xs md:text-xs text-green-300 font-Tektur">
                Study Partners
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#0070ef]/10 to-blue-500/5 border border-[#0070ef]/20 rounded-md p-2 md:p-3">
              <div className="w-4.5 h-4.5 md:w-6 md:h-6 bg-gradient-to-r from-[#0070ef] to-blue-400 rounded-full flex items-center justify-center mb-1.5 md:mb-2 mx-auto">
                <span className="text-white text-xs md:text-xs font-bold">💻</span>
              </div>
              <p className="text-xs md:text-xs text-blue-300 font-Tektur">
                Code Reviews
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-400/20 rounded-md p-2 md:p-3">
              <div className="w-4.5 h-4.5 md:w-6 md:h-6 bg-gradient-to-r from-purple-400 to-violet-500 rounded-full flex items-center justify-center mb-1.5 md:mb-2 mx-auto">
                <span className="text-white text-xs md:text-xs font-bold">🎯</span>
              </div>
              <p className="text-xs md:text-xs text-purple-300 font-Tektur">
                Skill Matching
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3 md:mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400 font-Tektur">Development Progress</span>
              <span className="text-xs text-green-400 font-Tektur font-bold">60%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
              <div className="w-3/5 h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Notify Section */}
        </div>

        {/* Decorative Elements */}
        <div className="mt-6 md:mt-9 flex justify-center space-x-2 md:space-x-3">
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-green-400 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-teal-400 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default PeerFinderPage;
