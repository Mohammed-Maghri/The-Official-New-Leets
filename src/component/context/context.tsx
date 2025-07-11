"use client";
import React from "react";
import { ContextProps, UserData } from "./context.types";

const ContextCreator = React.createContext<ContextProps | null>(null);

const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = React.useState<UserData | null>(null);
  return (
    <ContextCreator.Provider value={{ setUserData, userData }}>
      {children}
    </ContextCreator.Provider>
  );
};

export { ContextProvider, ContextCreator };
