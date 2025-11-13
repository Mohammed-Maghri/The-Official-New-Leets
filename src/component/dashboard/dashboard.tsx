import React from "react";
import { RiUserStarLine } from "react-icons/ri";
import { UserData } from "../navbar/navbar.types";
import { Skeleton } from "@mui/material";
import { BsEmojiKiss, BsStars, BsDiamond, BsLightbulb } from "react-icons/bs";
import { GiQueenCrown } from "react-icons/gi";
import { FaCrown, FaHandsHelping, FaBrain } from "react-icons/fa";
import { MdOutlineEmojiEvents } from "react-icons/md";

const ImageSideComp: React.FC<{ image: string }> = ({ image }) => {
  return (
    <div className="relative duration-200 transition-all rounded-l-sm w-[110px] h-full lg:w-[130px] flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-br rounded-l-md rounded-r-full ">
        <div className="w-full h-full bg-gray-900 rounded-l-md rounded-r-full overflow-hidden">
          <img
            src={image != null ? image : "nopic.jpg"}
            alt="User Avatar"
            width={200}
            height={200}
            className="w-full h-full object-cover rounded-l-sm"
          />
        </div>
      </div>
    </div>
  );
};

const LocationUserDetails: React.FC<{
  location: string | null;
  username: string;
}> = ({ location, username }) => {
  
  return (
    <div className=" p-2 h-full flex items-center justify-center flex-row gap-1">
      <div
        className={`gap-2 p-3 w-[75px] ${
          location
            ? "bg-green-500/5 border-green-400/15"
            : "bg-red-500/5 border-red-400/15"
        } border-solid border-[1px] rounded-md h-[40%] flex items-center justify-center`}
      >
        <div className="w-[20px] h-[20px] flex items-center justify-center">
          <div
            className={`w-[8px] h-[8px] ${
              location ? "bg-green-400" : "bg-red-400"
            }  rounded-full`}
          ></div>
        </div>
        <div className="flex-1 ">
          <p
            className={`font-light text-[12px] font-Tektur ${
              location ? "text-green-500" : "text-red-400"
            }`}
          >
            {location ? location : "offline"}
          </p>
        </div>
      </div>

      <div
        className=" h-[40%] gap-1 border-solid  border-yellow-400/15 border-[1px] bg-gradient-to-r
       from-yellow-400/5 to-amber-500/5 sm:w-[120px] p-3 rounded-md  flex items-center justify-center relative"
      >
        <div className="w-[20px] h-[20px] flex items-center justify-center">
          <RiUserStarLine color="#d6c800" size={15} />
        </div>
        <div className="flex-1">
          <p className="font-extralight font-Tektur text-[12px]  text-white">
            {username}
          </p>
        </div>
      </div>
    </div>
  );
};

const WalletCoins: React.FC<{ wallet: number; correctionPoints: number }> = ({
  wallet,
  correctionPoints,
}) => {
  return (
    <div className="absolute right-4  hidden sm:flex gap-2">
      <div className="w-full bg-yellow-500/5 border border-yellow-400/15 rounded-md p-1 flex flex-col items-center justify-center">
        <div className="w-[50px] bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mb-0.5"></div>
        <div className="text-center">
          <p className="font-bold text-[10px] font-Tektur text-yellow-400 leading-none">
            {wallet}
          </p>
          <p className="font-light text-[7px] font-Tektur text-yellow-500/70 leading-none">
            Wallet
          </p>
        </div>
      </div>

      <div className="w-full bg-[#0070ef]/5 border border-[#0070ef]/15 rounded-md p-1 flex flex-col items-center justify-center">
        <div className="w-[50px] bg-gradient-to-r from-[#0070ef] to-blue-400 rounded-full mb-0.5"></div>
        <div className="text-center">
          <p className="font-bold text-[10px] font-Tektur text-[#0070ef] leading-none">
            {correctionPoints}
          </p>
          <p className="font-light text-[7px] font-Tektur text-[#0070ef]/70 leading-none">
            Points
          </p>
        </div>
      </div>
    </div>
  );
};

const LevelProgress: React.FC<{
  username: string;
  level: number;
  rank: number;
  badge?: { type: 'creator' | 'vip' | 'feedback'; name: string } | null;
}> = ({ level, rank, badge }) => {
  const getBadgeConfig = (badge: { type: 'creator' | 'vip' | 'feedback'; name: string }) => {
    // Check for VIP by name first (handles both type='vip' and type='feedback' with name='VIP')
    if (badge.name === 'VIP' || badge.name === 'vip' || badge.type === 'vip') {
      return {
        icon: BsDiamond,
        bg: 'bg-gradient-to-r from-purple-500/50 to-violet-500/50',
        border: 'border-purple-300/60',
        shadow: 'shadow-purple-400/40',
        text: 'text-purple-100',
        label: 'VIP'
      };
    }
    
    if (badge.type === 'creator') {
      return {
        icon: FaCrown,
        bg: 'bg-gradient-to-r from-yellow-400/50 to-orange-500/50',
        border: 'border-yellow-300/60',
        shadow: 'shadow-yellow-400/40',
        text: 'text-yellow-100',
        label: 'CREATOR'
      };
    }
    
    // Feedback badges
    switch (badge.name) {
      case 'Top Feedback':
        return {
          icon: MdOutlineEmojiEvents,
          bg: 'bg-gradient-to-r from-purple-500/50 to-pink-500/50',
          border: 'border-purple-300/60',
          shadow: 'shadow-purple-400/40',
          text: 'text-purple-100',
          label: 'TOP FEEDBACK'
        };
      case 'Helpful':
        return {
          icon: FaHandsHelping,
          bg: 'bg-gradient-to-r from-blue-500/50 to-cyan-500/50',
          border: 'border-blue-300/60',
          shadow: 'shadow-blue-400/40',
          text: 'text-blue-100',
          label: 'HELPFUL'
        };
      case 'Innovative':
        return {
          icon: BsLightbulb,
          bg: 'bg-gradient-to-r from-green-500/50 to-emerald-500/50',
          border: 'border-green-300/60',
          shadow: 'shadow-green-400/40',
          text: 'text-green-100',
          label: 'INNOVATIVE'
        };
      case 'Critical Thinker':
        return {
          icon: FaBrain,
          bg: 'bg-gradient-to-r from-indigo-500/50 to-violet-500/50',
          border: 'border-indigo-300/60',
          shadow: 'shadow-indigo-400/40',
          text: 'text-indigo-100',
          label: 'THINKER'
        };
      case 'Contributor':
        return {
          icon: BsStars,
          bg: 'bg-gradient-to-r from-rose-500/50 to-red-500/50',
          border: 'border-rose-300/60',
          shadow: 'shadow-rose-400/40',
          text: 'text-rose-100',
          label: 'CONTRIBUTOR'
        };
      default:
        return {
          icon: BsStars,
          bg: 'bg-gray-500/40',
          border: 'border-gray-300/60',
          shadow: 'shadow-gray-400/40',
          text: 'text-gray-100',
          label: badge.name.toUpperCase()
        };
    }
  };

  const badgeConfig = badge ? getBadgeConfig(badge) : null;
  const BadgeIcon = badgeConfig?.icon;

  return (
    <div className="flex relative items-center  justify-start  flex-col w-full h-[50%] bg-amber-50/0 pr-4 pl-4">
      <div className="w-full p-0.5 mb-3 h-[20px] flex items-center justify-between">
        <div className="flex items-center w-[100px]  flex-row">
          <span className="text-[11px] font-medium text-white/90 font-Tektur">
            Rank{" "}
          </span>
          {rank !== -1 && (
            <>
              <p
                className="ml-1 font-Tektur border-solid border-[2px] border-white/30
              text-red-100  min-w-[30px] min-h-[30px] w-[30px] text-[11px] rounded-full flex items-center justify-center"
              >
                {rank}
              </p>
              {badgeConfig && BadgeIcon && (
                <div className={`ml-1 px-3 py-1.5 border-2 rounded-full flex flex-row items-center gap-1 ${badgeConfig.bg} ${badgeConfig.border}`}>
                  <BadgeIcon className={`${badgeConfig.text} text-[12px]`} />
                  <span className={`${badgeConfig.text} font-Tektur text-[8px] font-bold tracking-widest`}>
                    {badgeConfig.label}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-center">
          <span className="text-lg font-bold bg-white bg-clip-text text-transparent font-Tektur">
            {level.toFixed(2)}{" "}
          </span>
        </div>
      </div>
      <div className="ml-0.5 w-full h-[15%] rounded-r-lg bg-blue-500/20 relative overflow-hidden">
        <div
          style={{
            width: (() => {
              const levelStr = level.toString();
              const parts = levelStr.split(".");

              if (parts.length === 1) {
                return "0%";
              }
              const decimal = parts[1];

              if (decimal === "00") {
                return "0%";
              }

              const percentage = decimal.length === 1 ? decimal + "0" : decimal;
              return percentage + "%";
            })(),
          }}
          className=" h-full bg-gradient-to-r from-pink-400 to-yellow-400 rounded-r-lg relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/30 via-transparent to-yellow-400/30"></div>
        </div>
      </div>
    </div>
  );
};

const StatusGrid: React.FC<{
  wallet: number;
  kind: string;
  staff: boolean;
  correction_point: number;
}> = ({ wallet, kind, staff, correction_point }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Account Type */}
      <div className="bg-blue-950/20 border border-blue-800/40 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-300 font-Tektur mb-2">
          Account Type
        </p>
        <p className="text-xl font-bold text-white font-Tektur capitalize">
          {kind}
        </p>
        <p className="text-xs text-gray-400 font-light font-Tektur mt-1">
          {staff ? "Staff Member" : "Student Account"}
        </p>
      </div>

      {/* Evaluation Points */}
      <div className="bg-blue-950/20 border border-blue-800/40 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-300 font-Tektur mb-2">
          Evaluation Points
        </p>
        <p className="text-xl font-bold text-white font-Tektur">
          {correction_point}
        </p>
        <p className="text-xs text-gray-400 font-light font-Tektur mt-1">
          Available for Corrections
        </p>
      </div>

      {/* Wallet Balance */}
      <div className="bg-blue-950/20 border border-blue-800/40 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-300 font-Tektur mb-2">
          Wallet Balance
        </p>
        <p className="text-xl font-bold text-white font-Tektur">
          {wallet}
        </p>
        <p className="text-xs text-gray-400 font-light font-Tektur mt-1">
          Digital Credits
        </p>
      </div>
    </div>
  );
};

const PoolInformation: React.FC<{
  pool_month: string;
  pool_year: string;
  location: string | null;
}> = ({ pool_month, pool_year, location }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white font-Tektur mb-3">
        Pool Information
      </h3>
      <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400 font-Tektur mb-1">
              Pool Period
            </p>
            <p className="text-base font-medium text-white font-Tektur capitalize">
              {pool_month} {pool_year}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 font-Tektur mb-1">
              Current Location
            </p>
            <p className="text-base font-medium text-green-400 font-Tektur">
              {location || "Not Available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CampusInformation: React.FC<{
  campus_name: string;
  campus_id: number;
}> = ({ campus_name, campus_id }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white font-Tektur mb-3">
        Campus Details
      </h3>
      <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-medium text-white font-Tektur">
              {campus_name}
            </p>
            <p className="text-sm text-gray-400 font-Tektur">
              Campus ID: {campus_id}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 font-Tektur">Status</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-green-400 font-Tektur">
                Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactInformation: React.FC<{ email: string }> = ({ email }) => {
  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-white font-Tektur mb-3">
        Contact Information
      </h3>
      <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">@</span>
          </div>
          <div>
            <p className="text-base font-medium text-white font-Tektur">
              {email}
            </p>
            <p className="text-sm text-gray-400 font-Tektur">
              Primary Email Address
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RankComponent: React.FC<{ userData: UserData | null; rank: number; isGridView?: boolean; podiumPosition?: "gold" | "silver" | "bronze"; enable3D?: boolean }> = ({
  userData,
  rank,
  isGridView = false,
  podiumPosition,
  enable3D = true,
}) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [cardTransform, setCardTransform] = React.useState('');

  // Enhanced 3D tilt effect with stronger rotation and elevation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enable3D || !isGridView || !cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Increased rotation intensity from 10 to 20 degrees
    const rotateX = ((y - centerY) / centerY) * -20;
    const rotateY = ((x - centerX) / centerX) * 20;
    
    // Add Z-axis translation for depth effect
    const translateZ = 20;
    
    setCardTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale3d(1.05, 1.05, 1.05)`);
  };

  const handleMouseLeave = () => {
    if (!enable3D || !isGridView) return;
    setCardTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)');
  };

  // Determine background based on badge type or podium position (for both grid and list views)
  const getBackgroundClass = () => {
    // Check for special badges (both grid and list view)
    if (userData?.badge) {
      // Check for VIP by name (handles both type='vip' and type='feedback' with name='VIP')
      if (userData?.badge?.name === "VIP" || userData?.badge?.name === "vip" || userData?.badge?.type === "vip") {
        return "bg-gradient-to-br from-purple-500/25 to-violet-500/25 border-2 border-purple-400/70";
      } else if (userData?.badge?.type === "creator") {
        return "bg-gradient-to-br from-yellow-400/25 to-amber-600/25 border-2 border-yellow-400/70";
      } else if (userData?.badge?.name === "Top Feedback") {
        return "bg-gradient-to-br from-purple-500/25 to-pink-500/25 border-2 border-purple-400/70";
      } else if (userData?.badge?.name === "Helpful") {
        return "bg-gradient-to-br from-blue-500/25 to-cyan-500/25 border-2 border-blue-400/70";
      } else if (userData?.badge?.name === "Innovative") {
        return "bg-gradient-to-br from-green-500/25 to-emerald-500/25 border-2 border-green-400/70";
      } else if (userData?.badge?.name === "Critical Thinker") {
        return "bg-gradient-to-br from-indigo-500/25 to-violet-500/25 border-2 border-indigo-400/70";
      } else if (userData?.badge?.name === "Contributor") {
        return "bg-gradient-to-br from-rose-500/25 to-red-500/25 border-2 border-rose-400/70";
      }
    }
    
    // Podium positions (top 3 ranks)
    if (podiumPosition === "gold") {
      return "bg-gradient-to-br from-yellow-400/10 to-amber-600/10 border-2 border-yellow-400/80";
    } else if (podiumPosition === "silver") {
      return "bg-gradient-to-br from-gray-400/10 to-gray-600/10 border-2 border-gray-400/70";
    } else if (podiumPosition === "bronze") {
      return "bg-gradient-to-br from-amber-600/10 to-orange-700/10 border-2 border-amber-600/70";
    }
    
    // Check for top 3 ranks even without podiumPosition (for list view)
    if (!isGridView && rank >= 1 && rank <= 3) {
      if (rank === 1) {
        return "bg-gradient-to-br from-yellow-400/10 to-amber-600/10 border-2 border-yellow-400/80";
      } else if (rank === 2) {
        return "bg-gradient-to-br from-gray-400/10 to-gray-600/10 border-2 border-gray-400/70";
      } else if (rank === 3) {
        return "bg-gradient-to-br from-amber-600/10 to-orange-700/10 border-2 border-amber-600/70";
      }
    }
    
    // Regular cards - solid dark blue with low opacity and sharp border
    return "bg-blue-950/30 border border-blue-700/70";
  };

  return (
    <div
      ref={cardRef}
      onClick={() =>
        window.open(`https://profile.intra.42.fr/users/${userData?.login}`)
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`flex cursor-pointer relative ${
        isGridView ? "flex-col w-full h-auto" : "flex-row w-full h-full min-h-[130px]"
      } gap-1 ${getBackgroundClass()} rounded-2xl justify-between ${isGridView ? "py-6 px-3" : "p-4"} ${
        isGridView ? "hover:shadow-2xl hover:shadow-blue-500/30" : "hover:scale-[1.01] transition-all duration-300"
      }`}
      style={{
        transform: enable3D && isGridView && cardTransform ? cardTransform : isGridView && enable3D ? 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)' : undefined,
        transition: isGridView ? 'transform 0.15s ease-out, box-shadow 0.3s ease, filter 0.3s ease' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transformStyle: enable3D ? 'preserve-3d' : undefined,
        willChange: enable3D ? 'transform' : undefined,
        filter: enable3D && isGridView && cardTransform ? 'brightness(1.1) drop-shadow(0 20px 40px rgba(59, 130, 246, 0.3))' : undefined,
      }}
    >
      {/* 3D Background Layer - Creates depth */}
      {enable3D && isGridView && (
        <div 
          className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
            transform: 'translateZ(-20px)',
            filter: 'blur(20px)',
          }}
        />
      )}
      
      {/* Shine overlay for enhanced 3D */}
      {enable3D && isGridView && (
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden"
          style={{
            background: 'linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
            transform: 'translateZ(30px)',
          }}
        />
      )}

      {userData != null ? (
        <>
          {rank !== -1 && rank >= 1 && rank < 4 && (
            <div 
              className={`z-20 absolute ${isGridView ? "top-[-15px] left-1/2 -translate-x-1/2" : "top-[-25px] left-[-45px]"} rotate-[-40deg] flex items-center justify-center`}
              style={enable3D && isGridView ? { transform: 'translateZ(40px) rotate(-40deg)' } : undefined}
            >
              <GiQueenCrown
                size={isGridView ? 45 : 50}
                className={`${
                  rank == 1
                    ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                    : rank == 2
                    ? "text-gray-400 drop-shadow-[0_0_10px_rgba(156,163,175,0.5)]"
                    : rank == 3
                    ? "text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]"
                    : ""
                }`}
              />
            </div>
          )}
          {isGridView ? (
            // Grid Layout - Enhanced Box - Professional Layout
            <div className="flex flex-col w-full h-full items-center justify-start gap-6">
              {/* Top Section - Avatar with Circular Level Progress Ring */}
              <div className="w-full flex justify-center pt-4 pb-2 relative">
                <div className="relative flex items-center justify-center">
                  {/* Circular Progress Ring Background with 3D effect */}
                  <svg 
                    className="absolute w-[160px] h-[160px] -rotate-90 transition-all duration-300"
                    viewBox="0 0 130 130"
                    style={enable3D ? { transform: 'translateZ(20px)' } : undefined}
                    onMouseEnter={(e) => {
                      if (enable3D && isGridView) {
                        e.currentTarget.style.transform = 'translateZ(50px) scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (enable3D && isGridView) {
                        e.currentTarget.style.transform = 'translateZ(20px) scale(1)';
                      }
                    }}
                  >
                    <defs>
                      <linearGradient id={`progressGradient-${rank}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#facc15" />
                      </linearGradient>
                      <filter id={`glow-${rank}`}>
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <circle cx="65" cy="65" r="60" fill="none" stroke="rgb(59, 130, 246, 0.2)" strokeWidth="6" />
                    <circle 
                      cx="65" 
                      cy="65" 
                      r="60" 
                      fill="none" 
                      stroke={`url(#progressGradient-${rank})`}
                      strokeWidth="6"
                      strokeDasharray={`${(() => {
                        const circumference = 2 * Math.PI * 60;
                        const levelStr = userData.level.toString();
                        const parts = levelStr.split(".");
                        if (parts.length === 1) return 0;
                        const decimal = parts[1];
                        if (decimal === "00") return 0;
                        const percentage = parseInt(decimal.length === 1 ? decimal + "0" : decimal);
                        const progress = (percentage / 100) * circumference;
                        return progress;
                      })()} ${2 * Math.PI * 60}`}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                      filter={`url(#glow-${rank})`}
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.6))',
                      }}
                    />
                  </svg>

                  {/* Avatar - Centered in Ring with 3D depth */}
                  <div 
                    className="relative w-[120px] h-[120px] rounded-full overflow-visible border-4 border-[#0070ef]/40 flex-shrink-0 z-10 transition-all duration-300 group"
                    style={enable3D ? { transform: 'translateZ(30px)' } : undefined}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0070ef]/20 to-transparent pointer-events-none rounded-full"></div>
                    <img
                      src={userData.image != null ? userData.image : "nopic.jpg"}
                      alt="User Avatar"
                      className="w-full h-full object-cover rounded-full transition-all duration-300 group-hover:scale-110"
                      style={{ 
                        transition: 'transform 0.3s ease-out',
                      }}
                      onMouseEnter={(e) => {
                        if (enable3D && isGridView) {
                          e.currentTarget.style.transform = 'translateZ(60px) scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (enable3D && isGridView) {
                          e.currentTarget.style.transform = 'translateZ(0px) scale(1)';
                        }
                      }}
                    />
                    
                    {/* Rank Badge - On Top Right of Avatar with enhanced 3D */}
                    <div 
                      className="absolute -top-3 -right-3 z-20 transition-all duration-300"
                      style={enable3D ? { transform: 'translateZ(50px)' } : undefined}
                    >
                      <p className="font-Tektur border-solid border-[2px] border-[#0070ef]/60 text-white font-black w-[48px] h-[48px] text-[18px] rounded-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 backdrop-blur-sm shadow-lg shadow-blue-500/50">
                        {rank}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Section - User Info */}
              <div className="w-full flex flex-col items-center gap-3">
                {/* Username Box with 3D pop-out on hover */}
                <div 
                  className="px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border border-yellow-400/50 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/30"
                  style={enable3D ? { transform: 'translateZ(10px)' } : undefined}
                  onMouseEnter={(e) => {
                    if (enable3D && isGridView) {
                      e.currentTarget.style.transform = 'translateZ(70px) scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (enable3D && isGridView) {
                      e.currentTarget.style.transform = 'translateZ(10px) scale(1)';
                    }
                  }}
                >
                  <p className="font-Tektur text-[12px] text-yellow-200 font-bold text-center line-clamp-1">
                    @{userData.login}
                  </p>
                </div>

                {/* Level Display */}
                <span 
                  className="text-[18px] font-black text-white font-Tektur transition-all duration-300"
                  style={enable3D ? { transform: 'translateZ(15px)' } : undefined}
                >
                  {userData.level.toFixed(2)}
                </span>

                {/* Name with 3D pop-out on hover */}
                <p 
                  className="font-Tektur text-[15px] text-white/95 text-center line-clamp-2 font-semibold leading-tight px-2 min-h-[36px] flex items-center justify-center transition-all duration-300 hover:text-white"
                  style={enable3D ? { transform: 'translateZ(20px)' } : undefined}
                  onMouseEnter={(e) => {
                    if (enable3D && isGridView) {
                      e.currentTarget.style.transform = 'translateZ(80px) scale(1.08)';
                      e.currentTarget.style.textShadow = '0 0 20px rgba(59, 130, 246, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (enable3D && isGridView) {
                      e.currentTarget.style.transform = 'translateZ(20px) scale(1)';
                      e.currentTarget.style.textShadow = 'none';
                    }
                  }}
                >
                  {userData.fullname}
                </p>

                {/* Online/Offline Status */}
                <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 min-w-[100px] justify-center ${
                  userData.location 
                    ? "bg-green-500/10 border-green-400/30" 
                    : "bg-red-500/10 border-red-400/30"
                }`}>
                  <div className={`w-[8px] h-[8px] ${
                    userData.location ? "bg-green-400" : "bg-red-400"
                  } rounded-full flex-shrink-0`}></div>
                  <p className={`font-Tektur text-[10px] font-semibold truncate ${
                    userData.location ? "text-green-400" : "text-red-400"
                  }`}>
                    {userData.location ? userData.location : "Offline"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Original Horizontal Layout
            <>
              <ImageSideComp image={userData.image as string} />
              <div className="flex-1 h-full flex items-center justify-center flex-col">
                <div className="w-full h-[40px] mt-1 relative flex items-center justify-start">
                  <LocationUserDetails
                    location={userData.location}
                    username={userData.login}
                  />
                  <WalletCoins
                    wallet={userData.wallet}
                    correctionPoints={userData.correction_point}
                  />
                </div>
                <div className="w-full h-[20px] mb-3 pl-4 flex items-center justify-start">
                  <p className="font-Tektur text-[12px] text-white/90">
                    {userData.fullname}
                  </p>
                </div>
                <LevelProgress
                  level={userData.level}
                  rank={rank}
                  username={userData.login}
                  badge={userData.badge}
                />
              </div>
            </>
          )}
        </>
      ) : (
        <div className="relative flex flex-1 items-center gap-2 justify-center">
          <p className="font-Tektur font-light text-white">
            {" "}
            Loading Data ...{" "}
          </p>
          <div className="flex items-center justify-center animate-bounce">
            <BsEmojiKiss color="white" />
          </div>
          <Skeleton
            variant="rectangular"
            animation={false}
            sx={{ bg: "white", position: "absolute" }}
            width="100%"
            height="100%"
          />
        </div>
      )}
    </div>
  );
};
export {
  RankComponent,
  ImageSideComp,
  LocationUserDetails,
  WalletCoins,
  LevelProgress,
  StatusGrid,
  PoolInformation,
  CampusInformation,
  ContactInformation,
};
