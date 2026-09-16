import { FaCalculator, FaDatabase, FaFolder, FaUsers, FaTrophy, FaGlobeAmericas, FaBell, FaDoorOpen, FaGithub, FaVolumeUp } from "react-icons/fa";

export type XPIconName = "computer" | "calculator" | "database" | "folder" | "users" | "trophy" | "globe" | "bell" | "logout" | "github" | "volume";
export function XPIcon({ name, size = 24 }: { name: XPIconName; size?: number }) {
  if (name === "computer") return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" shapeRendering="crispEdges">
      <path d="M6 2h21v21h-7v3h8v4H2v-5h10v-2H6z" fill="#77766f" stroke="#383838" />
      <path d="M5 1h21v21H5z" fill="#d8d8c9" stroke="#f9f9ef" />
      <path d="M8 4h15v14H8z" fill="#003ebd" stroke="#4a4a4a" />
      <path d="M10 6h4v2h-2v3h-2z" fill="white" />
      <path d="M14 22h5v4h-5zM3 26h22v3H3z" fill="#c9c9bf" />
      <path d="M5 27h3m2 0h3m2 0h3m2 0h3" stroke="#62625f" />
    </svg>
  );
  const icons = { calculator: FaCalculator, database: FaDatabase, folder: FaFolder, users: FaUsers, trophy: FaTrophy, globe: FaGlobeAmericas, bell: FaBell, logout: FaDoorOpen, github: FaGithub, volume: FaVolumeUp };
  const colors = { calculator: "#405e84", database: "#767b80", folder: "#edb829", users: "#208348", trophy: "#d99a00", globe: "#168634", bell: "#1679c4", logout: "#b78924", github: "#202020", volume: "#e2efff" };
  const Icon = icons[name];
  return <Icon size={size} color={colors[name]} aria-hidden="true" />;
}
