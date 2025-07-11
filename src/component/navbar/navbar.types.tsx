import {
  GiRank3,
  FaUsersViewfinder,
  RiVipCrown2Line,
  CiCalculator1,
} from "./navbar.imports";

interface UserData {
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
}

interface ButtonsProps {
  icon: React.ReactNode;
  title: string;
  route: string;
}

const PathsObject: ButtonsProps[] = [
  {
    icon: <RiVipCrown2Line size={15} className="text-rose-500" />,
    title: "Vip",
    route: "/vip",
  },
  {
    icon: <CiCalculator1 size={15} className="text-orange-400" />,
    title: "Calculator",
    route: "/calculator",
  },
  {
    icon: <FaUsersViewfinder size={15} className="text-green-400" />,
    title: "Peer-finder",
    route: "/peer-finder",
  },
  {
    icon: <GiRank3 size={15} className="text-yellow-300" />,
    title: "Rank",
    route: "/progress",
  },
];

export type { ButtonsProps, UserData };
export { PathsObject };
