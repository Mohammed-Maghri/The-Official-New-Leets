"use client";
import React, { useEffect } from "react";
import {
  ImageSideComp,
  LocationUserDetails,
  WalletCoins,
  LevelProgress,
  StatusGrid,
  PoolInformation,
  CampusInformation,
  ContactInformation,
} from "@/component/dashboard/dashboard";
import { ContextCreator } from "@/component/context/context";
import { ContextProps } from "@/component/context/context.types";
import { Skeleton } from "@mui/material";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { TbSkiJumping } from "react-icons/tb";

const Dashboard = () => {
  const { userData } = React.useContext(ContextCreator) as ContextProps;
  return (
    <div className="flex flex-1 overflow-auto p-10 gap-2 z-10 flex-col">
      <div className="flex w-full min-h-[200px] gap-0 h-[200px] bg-gradient-to-r from-gray-900/20 via-[#0070ef]/5 to-rose-500/10 border border-gray-800/50 backdrop-blur-xl rounded-2xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#0070ef]/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-rose-500/15 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-yellow-400/10 rounded-full blur-2xl"></div>
        {userData != null ? (
          <>
            <ImageSideComp image={userData.image as string} />
            <div className="flex-1  h-full flex items-center justify-center flex-col">
              <div className="w-full h-[50%] relative  flex items-center justify-start">
                <LocationUserDetails
                  location={userData.location}
                  username={userData.login}
                />
                <WalletCoins
                  wallet={userData.wallet}
                  correctionPoints={userData.correction_point}
                />
              </div>
              <LevelProgress level={11} />
            </div>
          </>
        ) : (
          <div className="relative flex flex-1 items-center gap-2 justify-center">
            <p className="font-Tektur font-light text-white">
              {" "}
              Loading Data ...{" "}
            </p>
            <div className="flex items-center justify-center animate-spin">
              <AiOutlineLoading3Quarters color="white" />
            </div>
            <Skeleton
              variant="rectangular"
              sx={{ bg: "white", position: "absolute" }}
              width="100%"
              height="100%"
            />
          </div>
        )}
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
