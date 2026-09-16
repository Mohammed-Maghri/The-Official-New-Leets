import React from "react";
import { RiUserStarLine } from "react-icons/ri";
import { UserData } from "../navbar/navbar.types";
import { BsStars, BsDiamond, BsLightbulb } from "react-icons/bs";
import { FaCrown, FaHandsHelping, FaBrain, FaUserShield } from "react-icons/fa";
import { MdOutlineEmojiEvents } from "react-icons/md";

const ImageSideComp: React.FC<{ image: string; podiumPosition?: "gold" | "silver" | "bronze" | "staff"; muted?: boolean }> = ({ image, podiumPosition, muted }) => {
  const borderClass = muted ? "border-[#a0a6b0]" : podiumPosition === "gold" ? "border-[#a0a6b0]" : podiumPosition === "silver" ? "border-[#a0a6b0]" : podiumPosition === "bronze" ? "border-[#a0a6b0]" : podiumPosition === "staff" ? "border-[#a0a6b0]" : "theme-border";
  return (
    <div className={`relative w-[80px] sm:w-[110px] lg:w-[130px] h-full flex-shrink-0 border-2 ${borderClass} overflow-hidden`} style={{ boxShadow: "none" }}>
      <div className="w-full h-full bg-[#ece9d8] overflow-hidden">
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
  const usernameBoxClass = muted ? "border-[#a0a6b0]" : podiumPosition === "gold" ? "border-[#a0a6b0]" : podiumPosition === "silver" ? "border-[#a0a6b0]" : podiumPosition === "bronze" ? "border-[#a0a6b0]" : podiumPosition === "staff" ? "border-[#a0a6b0]" : "theme-border";
  const usernameTextClass = podiumPosition === "gold" ? "text-[#3e3d35]" : podiumPosition === "silver" ? "text-[#3e3d35]" : podiumPosition === "bronze" ? "text-[#3e3d35]" : podiumPosition === "staff" ? "text-[#3e3d35]" : "text-[#151515]";
  const iconClass = podiumPosition === "gold" ? "text-[#3e3d35]" : podiumPosition === "silver" ? "text-[#3e3d35]" : podiumPosition === "bronze" ? "text-[#3e3d35]" : podiumPosition === "staff" ? "text-[#3e3d35]" : "text-[#3e3d35]";
  const statusClass = muted
    ? "bg-[#d9e5f5] border-[#a0a6b0]"
    : location ? "bg-[#d9e5f5] border-[#a0a6b0]" : "bg-[#d9e5f5] border-[#a0a6b0]";
  const dotClass = muted ? "bg-[#d9e5f5]" : location ? "bg-[#d9e5f5]" : "bg-[#d9e5f5]";
  const statusTextClass = muted ? "text-[#3e3d35]" : location ? "text-[#3e3d35]" : "text-[#3e3d35]";
  return (
    <div className="p-1 sm:p-2 h-full flex items-center justify-center flex-row gap-1 sm:gap-2 min-w-0 flex-1" style={{ fontFamily: "var(--font-ui)" }}>
      <div
        className={`gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 sm:py-1.5 w-[60px] sm:w-[75px] border-2 flex items-center justify-center flex-shrink-0 ${statusClass}`}
        style={{ boxShadow: "none" }}
      >
        <div className={`w-2 h-2 flex-shrink-0 ${dotClass}`} />
        <p className={`font-bold text-[8px] sm:text-[9px] uppercase tracking-wider truncate ${statusTextClass}`}>
          {location ? location : "offline"}
        </p>
      </div>
      <div
        className={`gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 sm:py-1.5 border-2 ${usernameBoxClass} bg-[#ece9d8] min-w-0 flex-1 flex items-center justify-center`}
        style={{ boxShadow: "none" }}
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
  const borderClass = muted ? "border-[#a0a6b0]" : "theme-border";
  const shadowStyle = muted ? { boxShadow: "none" } : { boxShadow: "none" };
  const valueClass = "font-bold text-[10px] text-[#151515] leading-tight";
  const labelClass = muted ? "font-bold text-[8px] text-[var(--theme-primary-muted)] uppercase tracking-wider leading-tight" : "font-bold text-[8px] text-[#3e3d35] uppercase tracking-wider leading-tight";
  return (
    <div className="absolute right-4 hidden sm:flex gap-2" style={{ fontFamily: "var(--font-ui)" }}>
      <div className={`border-2 ${borderClass} bg-[#ece9d8] px-2 py-1.5 flex flex-col items-center justify-center`} style={shadowStyle}>
        <p className={valueClass}>{wallet}</p>
        <p className={labelClass}>Wallet</p>
      </div>
      <div className={`border-2 ${borderClass} bg-[#ece9d8] px-2 py-1.5 flex flex-col items-center justify-center`} style={shadowStyle}>
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
        bg: 'bg-[#f5f3e9]   ',
        border: 'border-[#a0a6b0]',
        shadow: '-400/50',
        text: 'text-[#3e3d35]',
        label: 'OWNER'
      };
    }
    // Creator - golden badge (same tier as owner)
    if (badge.name === 'Creator' || badge.name === 'creator' || badge.type === 'creator') {
      return {
        icon: FaCrown,
        bg: 'bg-[#f5f3e9]   ',
        border: 'border-[#a0a6b0]',
        shadow: '-400/50',
        text: 'text-[#3e3d35]',
        label: 'CREATOR'
      };
    }
    // Staff - sky/blue badge
    if (badge.name === 'staff' || badge.name === 'Staff' || badge.type === 'staff') {
      return {
        icon: FaUserShield,
        bg: 'bg-[#f5f3e9]   ',
        border: 'border-[#a0a6b0]',
        shadow: '-400/50',
        text: 'text-[#3e3d35]',
        label: 'STAFF'
      };
    }
    // Check for VIP by name first (handles both type='vip' and type='feedback' with name='VIP')
    if (badge.name === 'VIP' || badge.name === 'vip' || badge.type === 'vip') {
      return {
        icon: BsDiamond,
        bg: 'bg-[#f5f3e9]  ',
        border: 'border-[#a0a6b0]',
        shadow: '-400/40',
        text: 'text-[#3e3d35]',
        label: 'VIP'
      };
    }

    // Feedback badges
    switch (badge.name) {
      case 'Top Feedback':
        return {
          icon: MdOutlineEmojiEvents,
          bg: 'bg-[#f5f3e9]  ',
          border: 'border-[#a0a6b0]',
          shadow: '-400/40',
          text: 'text-[#3e3d35]',
          label: 'TOP FEEDBACK'
        };
      case 'Helpful':
        return {
          icon: FaHandsHelping,
          bg: 'bg-[#f5f3e9]  ',
          border: 'border-[#a0a6b0]',
          shadow: '-400/40',
          text: 'text-[#3e3d35]',
          label: 'HELPFUL'
        };
      case 'Innovative':
        return {
          icon: BsLightbulb,
          bg: 'bg-[#f5f3e9]  ',
          border: 'border-[#a0a6b0]',
          shadow: '-400/40',
          text: 'text-[#3e3d35]',
          label: 'INNOVATIVE'
        };
      case 'Critical Thinker':
        return {
          icon: FaBrain,
          bg: 'bg-[#f5f3e9]  ',
          border: 'border-[#a0a6b0]',
          shadow: '-400/40',
          text: 'text-[#3e3d35]',
          label: 'THINKER'
        };
      case 'Contributor':
        return {
          icon: BsStars,
          bg: 'bg-[#f5f3e9]  ',
          border: 'border-[#a0a6b0]',
          shadow: '-400/40',
          text: 'text-[#3e3d35]',
          label: 'CONTRIBUTOR'
        };
      default:
        return {
          icon: BsStars,
          bg: 'bg-[#d9e5f5]',
          border: 'border-[#a0a6b0]',
          shadow: '-400/40',
          text: 'text-[#3e3d35]',
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
    <div className="flex relative items-center justify-start flex-col w-full h-[50%] px-2 sm:px-4 py-1 min-w-0" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="w-full mb-2 min-h-[24px] flex items-center justify-between">
        <div className="flex items-center gap-2 flex-row">
          <span className={`text-[9px] font-bold uppercase tracking-wider ${muted ? "text-[var(--theme-primary-muted)]" : "text-[#3e3d35]"}`}>Rank</span>
          {rank !== -1 && (
              <p className={`min-w-[26px] min-h-[26px] w-[26px] text-[10px] font-bold flex items-center justify-center border-2 bg-[#ece9d8] ${
                podiumPosition === "gold" ? "border-[#a0a6b0] text-[#3e3d35]" :
                podiumPosition === "silver" ? "border-[#a0a6b0] text-[#3e3d35]" :
                podiumPosition === "bronze" ? "border-[#a0a6b0] text-[#3e3d35]" :
                podiumPosition === "staff" ? "border-[#a0a6b0] text-[#3e3d35]" :
                "theme-border text-[#151515]"
              }`} style={{ boxShadow: "none" }}>
              {rank}
            </p>
          )}
          {badgeConfig && BadgeIcon && rank !== -1 && !(badge?.type === "owner" || badge?.name === "owner") && !(badge?.type === "staff" || badge?.name === "staff") && (
            <div className={`px-2 py-1 border-2 flex flex-row items-center gap-1 ${badgeConfig.bg} ${badgeConfig.border}`} style={{ boxShadow: "none" }}>
              <BadgeIcon className={`${badgeConfig.text} text-[10px] flex-shrink-0`} />
              <span className={`${badgeConfig.text} text-[8px] font-bold uppercase tracking-wider`}>
                {badgeConfig.label}
              </span>
            </div>
          )}
        </div>
        <span className={`text-sm font-bold ${
          podiumPosition === "gold" ? "text-[#3e3d35]" : podiumPosition === "silver" ? "text-[#3e3d35]" : podiumPosition === "bronze" ? "text-[#3e3d35]" : podiumPosition === "staff" ? "text-[#3e3d35]" : "text-[#151515]"
        }`} style={{ textShadow: "none" }}>
          {level.toFixed(2)}
        </span>
      </div>
      <div className={`w-full h-3 border-2 bg-[#ece9d8] relative overflow-hidden ${
        podiumPosition === "gold" ? "border-[#a0a6b0]" : podiumPosition === "silver" ? "border-[#a0a6b0]" : podiumPosition === "bronze" ? "border-[#a0a6b0]" : podiumPosition === "staff" ? "border-[#a0a6b0]" : "theme-border"
      }`} style={{ boxShadow: "none" }}>
        <div
          style={{
            width: progressWidth,
            background: "var(--theme-primary)"
          }}
          className="h-full relative overflow-hidden"
        >
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
  badge?: { type: 'creator' | 'vip' | 'owner' | 'staff' | 'feedback'; name: string } | null;
  muted?: boolean;
}> = ({ wallet, kind, staff, correction_point, badge, muted }) => {
  const cardClass = muted ? "border-2 border-[#a0a6b0] bg-[#ece9d8] p-3 sm:p-4" : "border-2 theme-border bg-[#ece9d8] p-3 sm:p-4";
  const cardShadow = { boxShadow: "none" };
  const labelClass = "text-[10px] font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-1.5";
  const valueClass = "text-base font-bold theme-text";
  const subClass = "text-[9px] text-[var(--theme-primary-muted)] uppercase tracking-wider mt-1";

  // Account type: prefer badge (owner, creator, staff, vip) over 42 kind (student, pooler)
  const accountType = badge ? badge.name : kind;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4" style={{ fontFamily: "var(--font-ui)" }}>
      <div className={cardClass} style={cardShadow}>
        <p className={labelClass}>Account Type</p>
        <p className={valueClass}>{accountType}</p>
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
  const borderClass = muted ? "border-2 border-[#a0a6b0]" : "border-2 theme-border";
  return (
    <div style={{ fontFamily: "var(--font-ui)" }}>
      <h3 className="text-xs font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-2">
        Pool Information
      </h3>
      <div className={`${borderClass} bg-[#ece9d8] p-3 sm:p-4`} style={{ boxShadow: "none" }}>
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
  const borderClass = muted ? "border-2 border-[#a0a6b0]" : "border-2 theme-border";
  return (
    <div style={{ fontFamily: "var(--font-ui)" }}>
      <h3 className="text-xs font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-2">
        Campus Details
      </h3>
      <div className={`${borderClass} bg-[#ece9d8] p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2`} style={{ boxShadow: "none" }}>
        <div>
          <p className="text-sm font-bold theme-text">{campus_name}</p>
          <p className="text-[9px] text-[var(--theme-primary-muted)] uppercase tracking-wider">Campus ID: {campus_id}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-[var(--theme-primary-muted)] uppercase tracking-wider mb-1">Status</p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-[#d9e5f5]" />
            <p className="text-[10px] font-bold theme-text-muted uppercase">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactInformation: React.FC<{ email: string; muted?: boolean }> = ({ email, muted }) => {
  const borderClass = muted ? "border-2 border-[#a0a6b0]" : "border-2 theme-border";
  return (
    <div className="flex-1" style={{ fontFamily: "var(--font-ui)" }}>
      <h3 className="text-xs font-bold text-[var(--theme-primary-muted)] uppercase tracking-wider mb-2">
        Contact Information
      </h3>
      <div className={`${borderClass} bg-[#ece9d8] p-3 sm:p-4 flex items-center gap-2 sm:gap-3 min-w-0`} style={{ boxShadow: "none" }}>
        <div className={`w-8 h-8 ${borderClass} bg-[#ece9d8] flex items-center justify-center flex-shrink-0`}>
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

const RankComponent: React.FC<{ userData: UserData | null; rank: number; isGridView?: boolean; podiumPosition?: "gold" | "silver" | "bronze"; enable3D?: boolean }> = ({ userData, rank, isGridView = false, podiumPosition }) => {
  if (!userData) return <div className="xp-rank-card xp-rank-loading" role="status" aria-label="Loading student"><div className="xp-rank-title">1337LEETS</div><div className="skeleton-shimmer m-4 h-24" /></div>;
  const progress = Math.round((userData.level - Math.floor(userData.level)) * 10000) / 100;
  return (
    <article className={`xp-rank-card ${isGridView ? "" : "xp-rank-card--list"} ${podiumPosition ? `xp-rank-card--${podiumPosition}` : ""}`}>
      <div className="xp-rank-title">
        <span>{rank > 0 ? rank : "My profile"}</span>
        {podiumPosition && <FaCrown aria-label={`${podiumPosition} place`} size={23} />}
        <a href={`https://profile.intra.42.fr/users/${userData.login}`} target="_blank" rel="noopener noreferrer" aria-label={`Open ${userData.login}'s profile`} className="xp-rank-open">↗</a>
      </div>
      <div className="xp-rank-content">
        <img className="xp-rank-avatar" src={userData.image || "/nopic.jpg"} alt={`${userData.login}'s avatar`} loading="lazy" decoding="async" width={144} height={144} />
        <div className="xp-rank-details">
          <a className="xp-username" href={`https://profile.intra.42.fr/users/${userData.login}`} target="_blank" rel="noopener noreferrer">{userData.login}</a>
          <strong className="xp-rank-level">{userData.level.toFixed(2)}</strong>
          <div className="xp-level-progress">
            <div className="xp-level-progress-label"><span>Level XP</span><span>{progress}%</span></div>
            <div className="xp-level-progress-track" role="progressbar" aria-label={`${userData.login} progress to level ${Math.floor(userData.level) + 1}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
              <div className="xp-level-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <p className="xp-rank-name">{userData.fullname}</p>
          {!isGridView && <dl className="xp-rank-stats">
            <div><dt>Wallet</dt><dd>{userData.wallet ?? "—"}</dd></div>
            <div><dt>Correction points</dt><dd>{userData.correction_point ?? "—"}</dd></div>
          </dl>}
          {userData.badge && <span className="xp-rank-badge">{userData.badge.name}</span>}
          <span className="xp-status"><i className={userData.location ? "xp-online" : "xp-offline"} aria-hidden="true" />{userData.location || "OFFLINE"}</span>
        </div>
      </div>
    </article>
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
