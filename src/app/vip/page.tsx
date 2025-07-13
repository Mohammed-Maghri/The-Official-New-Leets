import React from "react";
import { RiVipCrown2Line } from "react-icons/ri";
import { AiOutlineLock } from "react-icons/ai";
import { BsShieldCheck } from "react-icons/bs";

const VipPage = () => {
  return (
    <div className="flex flex-1 items-center overflow-x-hidden flex-col justify-center bg-gradient-to-br from-gray-900/95 via-[#0070ef]/5 to-rose-500/10 relative p-4">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-24 h-24 md:w-48 md:h-48 bg-gradient-to-br from-rose-500/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-30 h-30 md:w-60 md:h-60 bg-gradient-to-tl from-[#0070ef]/15 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-24 md:h-24 bg-yellow-400/10 rounded-full blur-2xl"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-sm md:max-w-md lg:max-w-lg mx-auto px-3 text-center w-full">
        {/* VIP Crown Icon */}
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <div className="w-12 h-12 md:w-15 md:h-15 lg:w-18 lg:h-18 bg-gradient-to-br from-rose-500 to-pink-400 rounded-full flex items-center justify-center shadow-2xl shadow-rose-500/50 animate-pulse">
              <RiVipCrown2Line size={18} className="text-white md:hidden" />
              <RiVipCrown2Line size={24} className="text-white hidden md:block lg:hidden" />
              <RiVipCrown2Line size={30} className="text-white hidden lg:block" />
            </div>
            <div className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 w-4.5 h-4.5 md:w-6 md:h-6 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
              <BsShieldCheck size={9} className="text-white md:hidden" />
              <BsShieldCheck size={12} className="text-white hidden md:block" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-4xl font-bold bg-gradient-to-r from-rose-400 via-pink-300 to-rose-500 bg-clip-text text-transparent font-Tektur mb-2">
          VIP ACCESS
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-base lg:text-lg text-white/90 font-Tektur font-light mb-4">
          Exclusive Owner Zone
        </p>

        {/* Lock Icon and Message */}
        <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/30 border border-rose-400/30 rounded-lg md:rounded-xl p-3 md:p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex justify-center mb-3">
            <div className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#0070ef]/20 to-blue-500/10 border border-[#0070ef]/30 rounded-full flex items-center justify-center">
              <AiOutlineLock size={15} className="text-[#0070ef] md:hidden" />
              <AiOutlineLock size={18} className="text-[#0070ef] hidden md:block lg:hidden" />
              <AiOutlineLock size={21} className="text-[#0070ef] hidden lg:block" />
            </div>
          </div>

          <h2 className="text-lg md:text-xl font-semibold text-white font-Tektur mb-2">
            Restricted Area
          </h2>

          <p className="text-gray-300 font-Tektur leading-relaxed mb-3 md:mb-4 text-xs md:text-sm lg:text-base">
            This exclusive section is reserved for platform owners only. Access
            to VIP features requires special authorization and elevated
            privileges.
          </p>

          {/* Features List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/5 border border-rose-400/20 rounded-md p-2 md:p-3">
              <div className="w-4.5 h-4.5 md:w-6 md:h-6 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center mb-1.5 md:mb-2 mx-auto">
                <span className="text-white text-xs md:text-xs font-bold">★</span>
              </div>
              <p className="text-xs md:text-xs text-rose-300 font-Tektur">
                Premium Analytics
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#0070ef]/10 to-blue-500/5 border border-[#0070ef]/20 rounded-md p-2 md:p-3">
              <div className="w-4.5 h-4.5 md:w-6 md:h-6 bg-gradient-to-r from-[#0070ef] to-blue-400 rounded-full flex items-center justify-center mb-1.5 md:mb-2 mx-auto">
                <span className="text-white text-xs md:text-xs font-bold">⚙</span>
              </div>
              <p className="text-xs md:text-xs text-blue-300 font-Tektur">
                Admin Controls
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-400/20 rounded-md p-2 md:p-3">
              <div className="w-4.5 h-4.5 md:w-6 md:h-6 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mb-1.5 md:mb-2 mx-auto">
                <span className="text-white text-xs md:text-xs font-bold">💎</span>
              </div>
              <p className="text-xs md:text-xs text-yellow-300 font-Tektur">
                Exclusive Tools
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t border-gray-600/30 pt-3 md:pt-4">
            <p className="text-gray-400 font-Tektur text-xs md:text-xs">
              For access inquiries, please contact the platform administrators
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-6 md:mt-9 flex justify-center space-x-2 md:space-x-3">
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-rose-400 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-[#0070ef] rounded-full animate-bounce delay-100"></div>
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-yellow-400 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default VipPage;
