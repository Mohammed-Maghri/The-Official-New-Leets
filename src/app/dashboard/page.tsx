"use client";
import React from "react";
import {
  RankComponent,
  StatusGrid,
  PoolInformation,
  CampusInformation,
  ContactInformation,
} from "@/component/dashboard/dashboard";
import { ContextCreator } from "@/component/context/context";
import { ContextProps, UserData } from "@/component/context/context.types";
import { TbSkiJumping } from "react-icons/tb";

const Dashboard = () => {
  const { userData } = React.useContext(ContextCreator) as ContextProps;
  return (
    <div className="flex flex-1 overflow-auto p-10 gap-2 z-10 flex-col">
      <div className="w-full h-[200px]">
        <RankComponent userData={userData as UserData} rank={-1} />
      </div>
      <div className=" flex-1 bg-gradient-to-r from-gray-900/20 via-[#0070ef]/5 backdrop-blur-sm rounded-md p-5 flex flex-col ">
        {userData != null ? (
          <>
            <StatusGrid
              wallet={userData.wallet}
              kind={userData.kind}
              staff={userData.staff}
              correction_point={userData.correction_point}
            />
            <PoolInformation
              pool_month={userData.pool_month}
              pool_year={userData.pool_year}
              location={userData.location}
            />
            {/* Campus Information */}
            <CampusInformation
              campus_name={userData.campus_name}
              campus_id={userData.campus_id}
            />
            {/* Contact Information */}
            <ContactInformation email={userData.email} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="shadow-2xl">
              <TbSkiJumping className="animate-bounce w-[50px] h-[50px] text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
