import {
  GiRank3,
  FaUsersViewfinder,
  CiCalculator1,
  AiOutlineDatabase,
  TbBrush,
} from "./navbar.imports";

interface UserData {
  fullname?: string;
  level: number;
  email: string;
  login: string;
  kind: string;
  image: string;
  staff: boolean;
  correction_point: number;
  pool_month: string;
  pool_year: string;
  location: string | null;
  wallet: number;
  campus_id: number;
  campus_name: string;
  badge?: {
    type: 'creator' | 'vip' | 'owner' | 'staff' | 'feedback';
    name: string;
  } | null;
}

interface ButtonsProps {
  icon: React.ReactNode;
  title: string;
  route: string;
}

const PathsObject: ButtonsProps[] = [
  {
    icon: <CiCalculator1 size={15} className="text-orange-400" />,
    title: "Calculator",
    route: "/calculator",
  },
  {
    icon: <AiOutlineDatabase size={15} className="text-cyan-400" />,
    title: "Database",
    route: "/database",
  },
  {
    icon: <TbBrush size={15} className="text-pink-400" />,
    title: "tldrw",
    route: "/dashboard/canvas",
  },
  {
    icon: <FaUsersViewfinder size={15} className="text-green-400" />,
    title: "Peer-finder",
    route: "/peerfinder",
  },
  {
    icon: <GiRank3 size={15} className="text-yellow-300" />,
    title: "Rank",
    route: "/progress",
  },
];

export type { ButtonsProps, UserData };
export { PathsObject };
