import { UserData } from "../navbar/navbar.types";
interface ContextProps {
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  userData: UserData | null;
}

export type { ContextProps, UserData };
