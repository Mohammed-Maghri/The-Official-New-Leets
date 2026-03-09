import React from "react";
import { RiUserStarLine } from "react-icons/ri";
import { UserData } from "../navbar/navbar.types";
import { BsStars, BsDiamond, BsLightbulb } from "react-icons/bs";
import { GiQueenCrown } from "react-icons/gi";
import { FaCrown, FaHandsHelping, FaBrain, FaUserShield } from "react-icons/fa";
import { MdOutlineEmojiEvents } from "react-icons/md";

const ImageSideComp: React.FC<{ image: string; podiumPosition?: "gold" | "silver" | "bronze" | "staff"; muted?: boolean }> = ({ image, podiumPosition, muted }) => {
  const borderClass = muted ? "border-slate-600/60" : podiumPosition === "gold" ? "border-yellow-400/60" : podiumPosition === "silver" ? "border-slate-400/50" : podiumPosition === "bronze" ? "border-amber-600/50" : podiumPosition === "staff" ? "border-sky-400/60" : "theme-border";
  return (
    <div className={`relative w-[80px] sm:w-[110px] lg:w-[130px] h-full flex-shrink-0 border-2 ${borderClass} overflow-hidden`} style={{ boxShadow: muted ? "3px 3px 0 rgba(0,0,0,0.2)" : "3px 3px 0 var(--theme-shadow-sm)" }}>
      <div className="w-full h-full bg-gray-950/98 overflow-hidden">
        <img
          src={image != null ? image : "nopic.jpg"}
          alt="User Avatar"
          width={200}
          height={200}
          className="w-full h-full object-cover"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </div>
  );
};

const LocationUserDetails: React.FC<{
  location: string | null;
  username: string;
  podiumPosition?: "gold" | "silver" | "bronze" | "staff";
  muted?: boolean;
}> = ({ location, username, podiumPosition, muted }) => {
  const usernameBoxClass = muted ? "border-slate-600/60" : podiumPosition === "gold" ? "border-yellow-400/60" : podiumPosition === "silver" ? "border-slate-400/50" : podiumPosition === "bronze" ? "border-amber-600/50" : podiumPosition === "staff" ? "border-sky-400/60" : "theme-border";
  const usernameTextClass = podiumPosition === "gold" ? "text-yellow-200" : podiumPosition === "silver" ? "text-slate-200" : podiumPosition === "bronze" ? "text-amber-200" : podiumPosition === "staff" ? "text-sky-200" : "text-white";
  const iconClass = podiumPosition === "gold" ? "text-yellow-400/80" : podiumPosition === "silver" ? "text-slate-400/80" : podiumPosition === "bronze" ? "text-amber-500/80" : podiumPosition === "staff" ? "text-sky-400/80" : "text-slate-400";
  const statusClass = muted
    ? "bg-slate-500/10 border-slate-500/30"
    : location ? "bg-emerald-500/10 border-emerald-500/50" : "bg-red-500/10 border-red-500/50";
  const dotClass = muted ? "bg-slate-400" : location ? "bg-emerald-400" : "bg-red-400";
  const statusTextClass = muted ? "text-slate-400" : location ? "text-emerald-300" : "text-red-300";
  return (
    <div className="p-1 sm:p-2 h-full flex items-center justify-center flex-row gap-1 sm:gap-2 min-w-0 flex-1" style={{ fontFamily: "var(--font-pixel)" }}>
      <div
        className={`gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 sm:py-1.5 w-[60px] sm:w-[75px] border-2 flex items-center justify-center flex-shrink-0 ${statusClass}`}
        style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
      >
        <div className={`w-2 h-2 flex-shrink-0 ${dotClass}`} />
        <p className={`font-bold text-[8px] sm:text-[9px] uppercase tracking-wider truncate ${statusTextClass}`}>
          {location ? location : "offline"}
        </p>
      </div>
      <div
        className={`gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 sm:py-1.5 border-2 ${usernameBoxClass} bg-gray-950/98 min-w-0 flex-1 flex items-center justify-center`}
        style={{ boxShadow: muted ? "2px 2px 0 rgba(0,0,0,0.2)" : "2px 2px 0 var(--theme-shadow-sm)" }}
      >
        <RiUserStarLine className={`flex-shrink-0 ${iconClass}`} size={14} />
        <p className={`font-bold text-[9px] sm:text-[10px] ${usernameTextClass} uppercase tracking-wider truncate flex-1 min-w-0`}>
          {username}
        </p>
      </div>
    </div>
  );
};

const WalletCoins: React.FC<{ wallet: number; correctionPoints: number; muted?: boolean }> = ({
  wallet,
  correctionPoints,
  muted,
}) => {
  const borderClass = muted ? "border-slate-600/60" : "theme-border";
  const shadowStyle = muted ? { boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" } : { boxShadow: "2px 2px 0 var(--theme-shadow-sm)" };
  const valueClass = "font-bold text-[10px] text-white leading-tight";
  const labelClass = muted ? "font-bold text-[8px] text-[var(--theme-primary-muted)] uppercase tracking-wider leading-tight" : "font-bold text-[8px] text-slate-400 uppercase tracking-wider leading-tight";
  return (
    <div className="absolute right-4 hidden sm:flex gap-2" style={{ fontFamily: "var(--font-pixel)" }}>
      <div className={`border-2 ${borderClass} bg-gray-950/98 px-2 py-1.5 flex flex-col items-center justify-center`} style={shadowStyle}>
        <p className={valueClass}>{wallet}</p>
        <p className={labelClass}>Wallet</p>
      </div>
      <div className={`border-2 ${borderClass} bg-gray-950/98 px-2 py-1.5 flex flex-col items-center justify-center`} style={shadowStyle}>
        <p className={valueClass}>{correctionPoints}</p>
        <p className={labelClass}>Points</p>
      </div>
    </div>
  );
};

const LevelProgress: React.FC<{
  username: string;
  level: number;
  rank: number;
  badge?: { type: 'creator' | 'vip' | 'owner' | 'staff' | 'feedback'; name: string } | null;
  podiumPosition?: "gold" | "silver" | "bronze" | "staff";
  muted?: boolean;
}> = ({ level, rank, badge, podiumPosition, muted }) => {
  const getBadgeConfig = (badge: { type: 'creator' | 'vip' | 'owner' | 'staff' | 'feedback'; name: string }) => {
    // Owner - golden badge (highest tier)
    if (badge.name === 'owner' || badge.name === 'Owner' || badge.type === 'owner') {
      return {
        icon: FaCrown,
        bg: 'bg-gradient-to-r from-amber-400/60 via-yellow-400/60 to-amber-500/60',
        border: 'border-amber-300/80',
        shadow: 'shadow-amber-400/50',
        text: 'text-amber-100',
        label: 'OWNER'
      };
    }
    // Creator - golden badge (same tier as owner)
    if (badge.name === 'Creator' || badge.name === 'creator' || badge.type === 'creator') {
      return {
        icon: FaCrown,
        bg: 'bg-gradient-to-r from-amber-400/60 via-yellow-400/60 to-amber-500/60',
        border: 'border-amber-300/80',
        shadow: 'shadow-amber-400/50',
        text: 'text-amber-100',
        label: 'CREATOR'
      };
    }
    // Staff - sky/blue badge
    if (badge.name === 'staff' || badge.name === 'Staff' || badge.type === 'staff') {
      return {
        icon: FaUserShield,
        bg: 'bg-gradient-to-r from-sky-500/60 via-blue-500/60 to-sky-600/60',
        border: 'border-sky-300/80',
        shadow: 'shadow-sky-400/50',
        text: 'text-sky-100',
        label: 'STAFF'
      };
    }
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

  const progressWidth = (() => {
    const levelStr = level.toString();
    const parts = levelStr.split(".");
    if (parts.length === 1) return "0%";
    const decimal = parts[1];
    if (decimal === "00") return "0%";
    const percentage = decimal.length === 1 ? decimal + "0" : decimal;
    return percentage + "%";
  })();

  return (
    <div className="flex relative items-center justify-start flex-col w-full h-[50%] px-2 sm:px-4 py-1 min-w-0" style={{ fontFamily: "var(--font-pixel)" }}>
      <div className="w-full mb-2 min-h-[24px] flex items-center justify-between">
        <div className="flex items-center gap-2 flex-row">
          <span className={`text-[9px] font-bold uppercase tracking-wider ${muted ? "text-[var(--theme-primary-muted)]" : "text-slate-400"}`}>Rank</span>
          {rank !== -1 && (
              <p className={`min-w-[26px] min-h-[26px] w-[26px] text-[10px] font-bold flex items-center justify-center border-2 bg-gray-950/98 ${
                podiumPosition === "gold" ? "border-yellow-400/70 text-yellow-200" :
                podiumPosition === "silver" ? "border-slate-400/60 text-slate-200" :
                podiumPosition === "bronze" ? "border-amber-600/60 text-amber-200" :
                podiumPosition === "staff" ? "border-sky-400/70 text-sky-200" :
                "theme-border text-white"
              }`} style={{ boxShadow: "2px 2px 0 var(--theme-shadow-sm)" }}>
              {rank}
            </p>
          )}
          {badgeConfig && BadgeIcon && rank !== -1 && !(badge?.type === "owner" || badge?.name === "owner") && !(badge?.type === "staff" || badge?.name === "staff") && (
            <div className={`px-2 py-1 border-2 flex flex-row items-center gap-1 ${badgeConfig.bg} ${badgeConfig.border}`} style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
              <BadgeIcon className={`${badgeConfig.text} text-[10px] flex-shrink-0`} />
              <span className={`${badgeConfig.text} text-[8px] font-bold uppercase tracking-wider`}>
                {badgeConfig.label}
              </span>
            </div>
          )}
        </div>
        <span className={`text-sm font-bold ${
          podiumPosition === "gold" ? "text-yellow-200" : podiumPosition === "silver" ? "text-slate-200" : podiumPosition === "bronze" ? "text-amber-200" : podiumPosition === "staff" ? "text-sky-200" : "text-white"
        }`} style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.3)" }}>
          {level.toFixed(2)}
        </span>
      </div>
      <div className={`w-full h-3 border-2 bg-gray-950/98 relative overflow-hidden ${
        podiumPosition === "gold" ? "border-yellow-400/40" : podiumPosition === "silver" ? "border-slate-400/40" : podiumPosition === "bronze" ? "border-amber-600/40" : podiumPosition === "staff" ? "border-sky-400/40" : "theme-border"
      }`} style={{ boxShadow: "inset 2px 2px 0 rgba(0,0,0,0.15)" }}>
        <div
          style={{
            width: progressWidth,
            background: podiumPosition === "gold" ? "linear-gradient(to right, #facc15, #eab308)" :
              podiumPosition === "silver" ? "linear-gradient(to right, #cbd5e1, #94a3b8)" :
              podiumPosition === "bronze" ? "linear-gradient(to right, #f59e0b, #d97706)" :
              podiumPosition === "staff" ? "linear-gradient(to right, #38bdf8, #0ea5e9)" :
              "linear-gradient(to right, var(--theme-primary-muted), var(--theme-primary))"
          }}
          className="h-full relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
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
  muted?: boolean;
}> = ({ wallet, kind, staff, correction_point, muted }) => {
  const cardClass = muted ? "border-2 border-slate-600/50 bg-gray-950/98 p-3 sm:p-4" : "border-2 theme-border bg-gray-950/98 p-3 sm:p-4";
  const cardShadow = { boxShadow: muted ? "3px 3px 0 rgba(0,0,0,0.2)" : "3px 3px 0 var(--theme-shadow-sm)" };
  const labelClass = "text-[10px] font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-1.5";
  const valueClass = "text-base font-bold theme-text";
  const subClass = "text-[9px] text-[var(--theme-primary-muted)] uppercase tracking-wider mt-1";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4" style={{ fontFamily: "var(--font-pixel)" }}>
      <div className={cardClass} style={cardShadow}>
        <p className={labelClass}>Account Type</p>
        <p className={valueClass}>{kind}</p>
        <p className={subClass}>{staff ? "Staff Member" : "Student Account"}</p>
      </div>
      <div className={cardClass} style={cardShadow}>
        <p className={labelClass}>Evaluation Points</p>
        <p className={valueClass}>{correction_point}</p>
        <p className={subClass}>Available for Corrections</p>
      </div>
      <div className={cardClass} style={cardShadow}>
        <p className={labelClass}>Wallet Balance</p>
        <p className={valueClass}>{wallet}</p>
        <p className={subClass}>Digital Credits</p>
      </div>
    </div>
  );
};

const PoolInformation: React.FC<{
  pool_month: string;
  pool_year: string;
  location: string | null;
  muted?: boolean;
}> = ({ pool_month, pool_year, location, muted }) => {
  const borderClass = muted ? "border-2 border-slate-600/50" : "border-2 theme-border";
  return (
    <div style={{ fontFamily: "var(--font-pixel)" }}>
      <h3 className="text-xs font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-2">
        Pool Information
      </h3>
      <div className={`${borderClass} bg-gray-950/98 p-3 sm:p-4`} style={{ boxShadow: muted ? "3px 3px 0 rgba(0,0,0,0.2)" : "3px 3px 0 var(--theme-shadow-sm)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-[9px] text-[var(--theme-primary-muted)] uppercase tracking-wider mb-1">Pool Period</p>
            <p className="text-sm font-bold theme-text capitalize">{pool_month} {pool_year}</p>
          </div>
          <div>
            <p className="text-[9px] text-[var(--theme-primary-muted)] uppercase tracking-wider mb-1">Current Location</p>
            <p className="text-sm font-bold theme-text">{location || "Not Available"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CampusInformation: React.FC<{
  campus_name: string;
  campus_id: number;
  muted?: boolean;
}> = ({ campus_name, campus_id, muted }) => {
  const borderClass = muted ? "border-2 border-slate-600/50" : "border-2 theme-border";
  return (
    <div style={{ fontFamily: "var(--font-pixel)" }}>
      <h3 className="text-xs font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-2">
        Campus Details
      </h3>
      <div className={`${borderClass} bg-gray-950/98 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2`} style={{ boxShadow: muted ? "3px 3px 0 rgba(0,0,0,0.2)" : "3px 3px 0 var(--theme-shadow-sm)" }}>
        <div>
          <p className="text-sm font-bold theme-text">{campus_name}</p>
          <p className="text-[9px] text-[var(--theme-primary-muted)] uppercase tracking-wider">Campus ID: {campus_id}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-[var(--theme-primary-muted)] uppercase tracking-wider mb-1">Status</p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-slate-400" />
            <p className="text-[10px] font-bold theme-text-muted uppercase">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactInformation: React.FC<{ email: string; muted?: boolean }> = ({ email, muted }) => {
  const borderClass = muted ? "border-2 border-slate-600/50" : "border-2 theme-border";
  return (
    <div className="flex-1" style={{ fontFamily: "var(--font-pixel)" }}>
      <h3 className="text-xs font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-2">
        Contact Information
      </h3>
      <div className={`${borderClass} bg-gray-950/98 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 min-w-0`} style={{ boxShadow: muted ? "3px 3px 0 rgba(0,0,0,0.2)" : "3px 3px 0 var(--theme-shadow-sm)" }}>
        <div className={`w-8 h-8 ${borderClass} bg-gray-950/98 flex items-center justify-center flex-shrink-0`}>
          <span className="theme-text text-sm font-bold">@</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold theme-text truncate">{email}</p>
          <p className="text-[9px] text-[var(--theme-primary-muted)] uppercase tracking-wider">Primary Email Address</p>
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
  const svgId = React.useId().replace(/:/g, '');

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

  const isOwnerCard = userData?.badge?.name === "owner" || userData?.badge?.name === "Owner" || userData?.badge?.type === "owner";
  const isStaffCard = (userData?.badge?.type === "staff" || userData?.badge?.name === "staff") && !isOwnerCard;

  // Determine background based on badge type or podium position (for both grid and list views)
  const getBackgroundClass = () => {
    // Dashboard's own card (rank=-1): owner gets golden, staff gets blue/slate, others get muted slate
    if (rank === -1) {
      if (isOwnerCard) return "bg-gray-950/98 border-4 border-amber-400/90";
      if (isStaffCard) return "bg-gray-950/98 border-4 border-sky-400/80";
      return "bg-gray-950/98 border-4 border-slate-600/60";
    }
    // Staff - blue/slate professional card (dashboard only, staff filtered from progress)
    if (isStaffCard) {
      return "bg-gray-950/98 border-4 border-sky-400/80";
    }
    // Check for special badges (both grid and list view) - solid background, colored border
    if (userData?.badge) {
      // Owner - golden card (highest tier)
      if (isOwnerCard) {
        return "bg-gray-950/98 border-4 border-amber-400/90";
      }
      // Check for VIP by name (handles both type='vip' and type='feedback' with name='VIP')
      if (userData?.badge?.name === "VIP" || userData?.badge?.name === "vip" || userData?.badge?.type === "vip") {
        return "bg-gray-950/98 border-4 border-purple-400/80";
      } else if (userData?.badge?.name === "Top Feedback") {
        return "bg-gray-950/98 border-4 border-purple-400/80";
      } else if (userData?.badge?.name === "Helpful") {
        return "bg-gray-950/98 border-4 border-blue-400/80";
      } else if (userData?.badge?.name === "Innovative") {
        return "bg-gray-950/98 border-4 border-emerald-400/80";
      } else if (userData?.badge?.name === "Critical Thinker") {
        return "bg-gray-950/98 border-4 border-indigo-400/80";
      } else if (userData?.badge?.name === "Contributor") {
        return "bg-gray-950/98 border-4 border-rose-400/80";
      }
    }
    
    // Podium positions (top 3 ranks) - special solid design
    if (podiumPosition === "gold") {
      return "bg-gray-950/98 border-4 border-yellow-400/90";
    } else if (podiumPosition === "silver") {
      return "bg-gray-950/98 border-4 border-slate-400/80";
    } else if (podiumPosition === "bronze") {
      return "bg-gray-950/98 border-4 border-amber-600/80";
    }
    
    // Check for top 3 ranks even without podiumPosition (for list view) - solid like podium
    if (!isGridView && rank >= 1 && rank <= 3) {
      if (rank === 1) {
        return "bg-gray-950/98 border-4 border-yellow-400/90";
      } else if (rank === 2) {
        return "bg-gray-950/98 border-4 border-slate-400/80";
      } else if (rank === 3) {
        return "bg-gray-950/98 border-4 border-amber-600/80";
      }
    }
    
    // Regular cards - pixel style (navbar-like solid)
    return "bg-gray-950/98 border-4 theme-border-strong";
  };

  return (
    <div
      ref={cardRef}
      onClick={() =>
        window.open(`https://profile.intra.42.fr/users/${userData?.login}`)
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`flex cursor-pointer relative min-w-0 ${
        isGridView ? "flex-col w-full h-auto" : "flex-row w-full h-full min-h-[110px] sm:min-h-[130px]"
      } ${getBackgroundClass()} justify-between ${isGridView ? "py-6 px-3 gap-1" : "p-2 sm:p-4 gap-1 sm:gap-2"} ${
        isGridView ? "hover:shadow-[0_0_30px_var(--theme-bg)]" : "hover:scale-[1.01] transition-all duration-300"
      }`}
      style={{
        transform: enable3D && isGridView && cardTransform ? cardTransform : isGridView && enable3D ? 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)' : undefined,
        transition: isGridView ? 'transform 0.15s ease-out, box-shadow 0.3s ease, filter 0.3s ease' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transformStyle: enable3D ? 'preserve-3d' : undefined,
        willChange: enable3D ? 'transform' : undefined,
        filter: enable3D && isGridView && cardTransform ? 'brightness(1.1) drop-shadow(0 20px 40px rgba(139, 92, 246, 0.3))' : undefined,
        ...(!isGridView ? {
          boxShadow: (() => {
            if (rank === -1) {
              if (isOwnerCard) return '4px 4px 0 rgba(0,0,0,0.3), 0 0 25px rgba(251,191,36,0.25), inset 0 1px 0 rgba(251,191,36,0.2)';
              if (isStaffCard) return '4px 4px 0 rgba(0,0,0,0.3), 0 0 20px rgba(56,189,248,0.2), inset 0 1px 0 rgba(56,189,248,0.15)';
              return '4px 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(71,85,105,0.3)';
            }
            if (isOwnerCard) return '4px 4px 0 rgba(0,0,0,0.3), 0 0 25px rgba(251,191,36,0.25), inset 0 1px 0 rgba(251,191,36,0.2)';
            if (isStaffCard) return '4px 4px 0 rgba(0,0,0,0.3), 0 0 20px rgba(56,189,248,0.2), inset 0 1px 0 rgba(56,189,248,0.15)';
            return '4px 4px 0 var(--theme-shadow-md), inset 0 1px 0 var(--theme-border)';
          })()
        } : {}),
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

      {/* Pixel corner accents - navbar style (list view / dashboard), rank-colored for top 3, muted for dashboard */}
      {!isGridView && (
        <>
          <div className={`absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 pointer-events-none ${
            rank === -1 ? (isOwnerCard ? "border-amber-400" : isStaffCard ? "border-sky-400" : "border-slate-600/60") :
            isOwnerCard ? "border-amber-400" : isStaffCard ? "border-sky-400" :
            podiumPosition === "gold" ? "border-yellow-400" : podiumPosition === "silver" ? "border-slate-400" : podiumPosition === "bronze" ? "border-amber-600" : "theme-border"
          }`} />
          <div className={`absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 pointer-events-none ${
            rank === -1 ? (isOwnerCard ? "border-amber-400" : isStaffCard ? "border-sky-400" : "border-slate-600/60") :
            isOwnerCard ? "border-amber-400" : isStaffCard ? "border-sky-400" :
            podiumPosition === "gold" ? "border-yellow-400" : podiumPosition === "silver" ? "border-slate-400" : podiumPosition === "bronze" ? "border-amber-600" : "theme-border"
          }`} />
          <div className={`absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 pointer-events-none ${
            rank === -1 ? (isOwnerCard ? "border-amber-400" : isStaffCard ? "border-sky-400" : "border-slate-600/60") :
            isOwnerCard ? "border-amber-400" : isStaffCard ? "border-sky-400" :
            podiumPosition === "gold" ? "border-yellow-400" : podiumPosition === "silver" ? "border-slate-400" : podiumPosition === "bronze" ? "border-amber-600" : "theme-border"
          }`} />
          <div className={`absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 pointer-events-none ${
            rank === -1 ? (isOwnerCard ? "border-amber-400" : isStaffCard ? "border-sky-400" : "border-slate-600/60") :
            isOwnerCard ? "border-amber-400" : isStaffCard ? "border-sky-400" :
            podiumPosition === "gold" ? "border-yellow-400" : podiumPosition === "silver" ? "border-slate-400" : podiumPosition === "bronze" ? "border-amber-600" : "theme-border"
          }`} />
        </>
      )}

      {/* Owner badge - ticket sticking out bottom-right, absolute, same size as other badges */}
      {isOwnerCard && userData && (
        <div 
          className="absolute bottom-0 right-0 z-20 px-2 py-1 border-2 flex items-center gap-1 bg-gradient-to-r from-amber-400/60 via-yellow-400/60 to-amber-500/60 border-amber-300/80 rotate-[-8deg] origin-bottom-right"
          style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
        >
          <FaCrown className="text-amber-100 text-[10px] flex-shrink-0" />
          <span className="text-amber-100 text-[8px] font-bold uppercase tracking-wider">OWNER</span>
        </div>
      )}

      {/* Staff badge - ticket sticking out bottom-right, absolute, same size as other badges */}
      {isStaffCard && userData && (
        <div 
          className="absolute bottom-0 right-0 z-20 px-2 py-1 border-2 flex items-center gap-1 bg-gradient-to-r from-sky-500/60 via-blue-500/60 to-sky-600/60 border-sky-300/80 rotate-[-8deg] origin-bottom-right"
          style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
        >
          <FaUserShield className="text-sky-100 text-[10px] flex-shrink-0" />
          <span className="text-sky-100 text-[8px] font-bold uppercase tracking-wider">STAFF</span>
        </div>
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
            // Grid Layout - pixel/theme vibe, podium gets metal accents
            <div className="flex flex-col w-full h-full items-center justify-start gap-6" style={{ fontFamily: "var(--font-pixel)" }}>
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
                      <linearGradient id={`progressGradient-${svgId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        {isOwnerCard || podiumPosition === "gold" ? (
                          <><stop offset="0%" stopColor="#facc15" /><stop offset="100%" stopColor="#eab308" /></>
                        ) : isStaffCard ? (
                          <><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#0ea5e9" /></>
                        ) : podiumPosition === "silver" ? (
                          <><stop offset="0%" stopColor="#cbd5e1" /><stop offset="100%" stopColor="#94a3b8" /></>
                        ) : podiumPosition === "bronze" ? (
                          <><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#d97706" /></>
                        ) : (
                          <><stop offset="0%" stopColor="var(--theme-primary)" /><stop offset="100%" stopColor="var(--theme-primary-muted)" /></>
                        )}
                      </linearGradient>
                      <filter id={`glow-${svgId}`}>
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <circle cx="65" cy="65" r="60" fill="none" stroke={(isOwnerCard || isStaffCard || podiumPosition) ? (isOwnerCard || podiumPosition === "gold" ? "rgba(250,204,21,0.2)" : isStaffCard ? "rgba(56,189,248,0.2)" : podiumPosition === "silver" ? "rgba(148,163,184,0.2)" : "rgba(217,119,6,0.2)") : "var(--theme-border)"} strokeWidth="6" />
                    <circle 
                      cx="65" 
                      cy="65" 
                      r="60" 
                      fill="none" 
                      stroke={`url(#progressGradient-${svgId})`}
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
                      filter={`url(#glow-${svgId})`}
                      style={{
                        filter: isOwnerCard || podiumPosition === "gold" ? 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.5))' : isStaffCard ? 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.5))' : podiumPosition === "silver" ? 'drop-shadow(0 0 8px rgba(148, 163, 184, 0.5))' : podiumPosition === "bronze" ? 'drop-shadow(0 0 8px rgba(217, 119, 6, 0.5))' : undefined,
                      }}
                    />
                  </svg>

                  {/* Avatar - Centered in Ring with 3D depth */}
                  <div 
                    className={`relative w-[120px] h-[120px] rounded-full overflow-visible border-4 flex-shrink-0 z-10 transition-all duration-300 group ${
                      isOwnerCard || podiumPosition === "gold" ? "border-yellow-400/60" : isStaffCard ? "border-sky-400/60" : podiumPosition === "silver" ? "border-slate-400/50" : podiumPosition === "bronze" ? "border-amber-600/50" : "theme-border-strong"
                    }`}
                    style={{ ...(enable3D ? { transform: 'translateZ(30px)' } : {}), boxShadow: isOwnerCard || isStaffCard || podiumPosition ? "4px 4px 0 rgba(0,0,0,0.3)" : "4px 4px 0 var(--theme-shadow-sm)" }}
                  >
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                    <img
                      src={userData.image != null ? userData.image : "nopic.jpg"}
                      alt="User Avatar"
                      className="w-full h-full object-cover rounded-full transition-all duration-300 group-hover:scale-105"
                      style={{ imageRendering: "pixelated", transition: "transform 0.3s ease-out" }}
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
                    </div>
                    
                    {/* Rank Badge - On Top Right of Avatar with enhanced 3D */}
                    <div 
                      className="absolute -top-3 -right-3 z-20 transition-all duration-300"
                      style={enable3D ? { transform: 'translateZ(50px)' } : undefined}
                    >
                      <p className={`border-2 font-black w-[44px] h-[44px] text-[16px] flex items-center justify-center ${
                        isOwnerCard || podiumPosition === "gold" ? "border-yellow-400/80 bg-gray-950/98 text-yellow-200" :
                        isStaffCard ? "border-sky-400/70 bg-gray-950/98 text-sky-200" :
                        podiumPosition === "silver" ? "border-slate-400/70 bg-gray-950/98 text-slate-200" :
                        podiumPosition === "bronze" ? "border-amber-600/70 bg-gray-950/98 text-amber-200" :
                        "theme-border-strong bg-gray-950/98 text-white"
                      }`}
                      style={{ boxShadow: isOwnerCard || isStaffCard || podiumPosition ? "3px 3px 0 rgba(0,0,0,0.3)" : "3px 3px 0 var(--theme-shadow-sm)" }}>
                        {rank}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Section - User Info */}
              <div className="w-full flex flex-col items-center gap-3">
                {/* Username Box - pixel style */}
                <div 
                  className={`px-4 py-2 border-2 transition-all duration-300 ${
                    isOwnerCard || podiumPosition === "gold" ? "bg-gray-950/98 border-yellow-400/60" :
                    isStaffCard ? "bg-gray-950/98 border-sky-400/60" :
                    podiumPosition === "silver" ? "bg-gray-950/98 border-slate-400/50" :
                    podiumPosition === "bronze" ? "bg-gray-950/98 border-amber-600/50" :
                    "bg-gray-950/98 theme-border-strong"
                  }`}
                  style={{ boxShadow: isOwnerCard || isStaffCard || podiumPosition ? "3px 3px 0 rgba(0,0,0,0.2)" : "3px 3px 0 var(--theme-shadow-sm)", ...(enable3D ? { transform: 'translateZ(10px)' } : {}) }}
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
                  <p className={`text-[11px] font-bold text-center line-clamp-1 uppercase tracking-wider ${
                    isOwnerCard || podiumPosition === "gold" ? "text-amber-200" : isStaffCard ? "text-sky-200" : podiumPosition === "silver" ? "text-slate-200" : podiumPosition === "bronze" ? "text-amber-200" : "text-white"
                  }`}>
                    @{userData.login}
                  </p>
                </div>

                {/* Level Display */}
                <span 
                  className={`text-[18px] font-black transition-all duration-300 ${
                    isOwnerCard || podiumPosition === "gold" ? "text-amber-200" : isStaffCard ? "text-sky-200" : podiumPosition === "silver" ? "text-slate-200" : podiumPosition === "bronze" ? "text-amber-200" : "text-white"
                  }`}
                  style={enable3D ? { transform: 'translateZ(15px)' } : undefined}
                >
                  {userData.level.toFixed(2)}
                </span>

                {/* Name */}
                <p 
                  className={`text-[13px] text-center line-clamp-2 font-bold leading-tight px-2 min-h-[36px] flex items-center justify-center ${isOwnerCard ? "text-amber-200" : isStaffCard ? "text-sky-200" : "text-slate-200"}`}
                  style={enable3D ? { transform: 'translateZ(20px)' } : undefined}
                  onMouseEnter={(e) => {
                    if (enable3D && isGridView) {
                      e.currentTarget.style.transform = 'translateZ(80px) scale(1.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (enable3D && isGridView) {
                      e.currentTarget.style.transform = 'translateZ(20px) scale(1)';
                    }
                  }}
                >
                  {userData.fullname}
                </p>

                {/* Online/Offline Status - pixel style */}
                <div className={`px-3 py-1.5 border-2 flex items-center gap-2 min-w-[100px] justify-center ${
                  userData.location 
                    ? "bg-emerald-500/10 border-emerald-500/50" 
                    : "bg-red-500/10 border-red-500/50"
                }`}
                style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                  <div className={`w-2 h-2 flex-shrink-0 ${userData.location ? "bg-emerald-400" : "bg-red-400"}`}></div>
                  <p className={`text-[9px] font-bold uppercase tracking-wider truncate ${
                    userData.location ? "text-emerald-300" : "text-red-300"
                  }`}>
                    {userData.location ? userData.location : "Offline"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Original Horizontal Layout
            <>
              <ImageSideComp image={userData.image as string} podiumPosition={isOwnerCard ? "gold" : isStaffCard ? "staff" : podiumPosition} muted={rank === -1} />
              <div className="flex-1 h-full flex items-center justify-center flex-col min-w-0 overflow-hidden">
                <div className="w-full min-h-[40px] sm:min-h-[44px] mt-0 relative flex items-center justify-start min-w-0">
                  <LocationUserDetails
                    location={userData.location}
                    username={userData.login}
                    podiumPosition={isOwnerCard ? "gold" : isStaffCard ? "staff" : podiumPosition}
                    muted={rank === -1}
                  />
                  <WalletCoins
                    wallet={userData.wallet}
                    correctionPoints={userData.correction_point}
                    muted={rank === -1}
                  />
                </div>
                <div className="w-full min-h-[20px] mb-1 sm:mb-2 pl-2 sm:pl-4 flex items-center justify-start min-w-0">
                  <p className={`font-bold text-[10px] sm:text-[11px] uppercase tracking-wider truncate ${
                    isOwnerCard ? "text-amber-200" : isStaffCard ? "text-sky-200" : podiumPosition === "gold" ? "text-yellow-200" : podiumPosition === "silver" ? "text-slate-200" : podiumPosition === "bronze" ? "text-amber-200" : "text-white"
                  }`} style={{ fontFamily: "var(--font-pixel)" }}>
                    {userData.fullname}
                  </p>
                </div>
                <LevelProgress
                  level={userData.level}
                  rank={rank}
                  username={userData.login}
                  badge={userData.badge}
                  podiumPosition={isOwnerCard ? "gold" : isStaffCard ? "staff" : podiumPosition}
                  muted={rank === -1}
                />
              </div>
            </>
          )}
        </>
      ) : (
        <div className="relative flex flex-1 w-full min-h-[110px] sm:min-h-[130px] flex-row p-2 sm:p-4 gap-2" style={{ fontFamily: "var(--font-pixel)" }}>
          {/* Skeleton matching horizontal/list layout */}
          <div className="w-[80px] sm:w-[110px] h-full flex-shrink-0 border-2 theme-border skeleton-shimmer" style={{ boxShadow: "3px 3px 0 var(--theme-shadow-sm)", minHeight: "90px" }} />
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="flex gap-2">
              <div className="h-8 flex-1 border-2 theme-border skeleton-shimmer" style={{ boxShadow: "2px 2px 0 var(--theme-shadow-sm)" }} />
            </div>
            <div className="h-4 w-[75%] border-2 theme-border skeleton-shimmer" style={{ boxShadow: "2px 2px 0 var(--theme-shadow-sm)" }} />
            <div className="h-3 w-full border-2 theme-border skeleton-shimmer" style={{ boxShadow: "inset 2px 2px 0 rgba(0,0,0,0.15)" }} />
          </div>
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
