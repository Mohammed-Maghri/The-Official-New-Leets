import { UserData } from "../navbar/navbar.types";
import { Socket } from "socket.io-client";

interface Message {
  id: string;
  message: string;
  username: string;
  avatar: string;
  level: number;
  campus: string;
  timestamp: number;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  flagged?: boolean;
  moderationCategories?: string[];
  moderationSeverity?: string;
}

interface ContextProps {
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  userData: UserData | null;
  socket?: Socket;
  isSocketConnected?: boolean;
  messages?: Message[];
  hasMore?: boolean;
  isLoadingMessages?: boolean;
  isLoadingMore?: boolean;
  setIsLoadingMore?: React.Dispatch<React.SetStateAction<boolean>>;
}

export type { ContextProps, UserData, Message };
