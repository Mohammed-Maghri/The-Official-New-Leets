import React from "react";
import Image from "next/image";
import { RiUserStarLine } from "react-icons/ri";
import { UserData } from "../navbar/navbar.types";
import { Skeleton } from "@mui/material";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const ImageSideComp: React.FC<{ image: string }> = ({ image }) => {
  return (
    <div className="relative duration-200 transition-all w-[150px] h-[200px] lg:w-[200px] lg:h-[200px] flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-br rounded-r-full ">
        <div className="w-full h-full bg-gray-900 rounded-r-full overflow-hidden">
          <Image
            src={image}
            alt="User Avatar"
            width={200}
            height={200}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

const LocationUserDetails: React.FC<{
  location: string | null;
  username: string;
}> = ({ location, username }) => {
  return (
    <div className="w-[150px] h-full flex items-center justify-center flex-col">
      <div
        className={`gap-2 p-3 w-[120px] ${
          location
            ? "bg-green-500/5 border-green-400/15"
            : "bg-red-500/5 border-red-400/15"
        } border-solid border-[1px] rounded-md h-[30px] flex items-center justify-center`}
      >
        <div className="w-[20px] h-[20px] flex items-center justify-center">
          <div
            className={`w-[8px] h-[8px] ${
              location ? "bg-green-400" : "bg-red-400"
            }  rounded-full shadow-lg`}
          ></div>
        </div>
        <div className="flex-1">
          <p
            className={`font-light text-[12px] font-Tektur ${
              location ? "text-green-500" : "text-red-400"
            }`}
          >
            {location ? location : "offline"}
          </p>
        </div>
      </div>

      <div className=" h-[30px] gap-2 border-solid border-[#0070ef]/10 border-[1px] bg-[#0070ef]/5 w-[120px] p-3 rounded-md mt-1 flex items-center justify-center relative">
        <div className="w-[20px] h-[20px] flex items-center justify-center">
          <RiUserStarLine color="#0070ef" size={15} />
        </div>
        <div className="flex-1">
          <p className="font-extralight font-Tektur text-[12px]  text-[#54a4ff]">
            mmaghri
          </p>
        </div>
      </div>
    </div>
  );
};

const WalletCoins: React.FC<{ wallet: number; correctionPoints: number }> = ({
  wallet,
  correctionPoints,
}) => {
  return (
    <div className="absolute right-4  hidden sm:flex gap-2">
      {/* Wallet */}
      <div className="w-full bg-yellow-500/5 border border-yellow-400/15 rounded-md p-1 flex flex-col items-center justify-center">
        <div className="w-[50px] bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mb-0.5"></div>
        <div className="text-center">
          <p className="font-bold text-[10px] font-Tektur text-yellow-400 leading-none">
            {wallet}
          </p>
          <p className="font-light text-[7px] font-Tektur text-yellow-500/70 leading-none">
            Wallet
          </p>
        </div>
      </div>

      {/* Correction Points */}
      <div className="w-full bg-[#0070ef]/5 border border-[#0070ef]/15 rounded-md p-1 flex flex-col items-center justify-center">
        <div className="w-[50px] bg-gradient-to-r from-[#0070ef] to-blue-400 rounded-full mb-0.5"></div>
        <div className="text-center">
          <p className="font-bold text-[10px] font-Tektur text-[#0070ef] leading-none">
            {correctionPoints}
          </p>
          <p className="font-light text-[7px] font-Tektur text-[#0070ef]/70 leading-none">
            Points
          </p>
        </div>
      </div>
    </div>
  );
};

const LevelProgress: React.FC<{ level: number }> = ({ level }) => {
  return (
    <div className="flex items-center justify-start  flex-col w-full h-[50%] bg-amber-50/0 pr-4 pl-4">
      <div className="w-full p-0.5 mb-1 h-[20px] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white/90 font-Tektur">
            Level
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-lg font-bold bg-white bg-clip-text text-transparent font-Tektur">
            11
          </span>
        </div>
      </div>
      <div className="ml-0.5 w-full h-[15%] backdrop-blur-md rounded-r-lg bg-gradient-to-r from-[#0070ef]/10 to-yellow-400/10 relative overflow-hidden">
        <div className="w-[63%] h-full bg-gradient-to-r from-[#0070ef] via-blue-400 to-yellow-400 rounded-r-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/30 via-transparent to-yellow-400/30 animate-pulse delay-700"></div>
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
}> = ({ wallet, kind, staff, correction_point }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Account Type */}
      <div className="bg-gradient-to-br from-[#0070ef]/10 to-blue-500/5 border border-[#0070ef]/20 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-3 h-3 bg-gradient-to-r from-[#0070ef] to-blue-400 rounded-full"></div>
          <p className="text-sm font-medium text-[#0070ef] font-Tektur">
            Account Type
          </p>
        </div>
        <p className="text-lg font-bold text-white font-Tektur capitalize">
          {kind}
        </p>
        <p className="text-xs text-blue-300/70 font-light font-Tektur">
          {staff ? "Staff Member" : "Student Account"}
        </p>
      </div>

      {/* Correction Points Detail */}
      <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/5 border border-rose-400/20 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-3 h-3 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"></div>
          <p className="text-sm font-medium text-rose-400 font-Tektur">
            Evaluation
          </p>
        </div>
        <p className="text-lg font-bold text-white font-Tektur">
          {correction_point} Points
        </p>
        <p className="text-xs text-rose-300/70 font-light font-Tektur">
          Available for Corrections
        </p>
      </div>

      {/* Wallet Detail */}
      <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-400/20 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"></div>
          <p className="text-sm font-medium text-yellow-400 font-Tektur">
            Balance
          </p>
        </div>
        <p className="text-lg font-bold text-white font-Tektur">
          {wallet} Credits
        </p>
        <p className="text-xs text-yellow-300/70 font-light font-Tektur">
          Digital Wallet
        </p>
      </div>
    </div>
  );
};

const PoolInformation: React.FC<{
  pool_month: string;
  pool_year: string;
  location: string | null;
}> = ({ pool_month, pool_year, location }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white font-Tektur mb-3">
        Pool Information
      </h3>
      <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/20 border border-gray-600/30 rounded-lg p-4 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400 font-Tektur mb-1">
              Pool Period
            </p>
            <p className="text-base font-medium text-white font-Tektur capitalize">
              {pool_month} {pool_year}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 font-Tektur mb-1">
              Current Location
            </p>
            <p className="text-base font-medium text-green-400 font-Tektur">
              {location || "Not Available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CampusInformation: React.FC<{
  campus_name: string;
  campus_id: number;
}> = ({ campus_name, campus_id }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white font-Tektur mb-3">
        Campus Details
      </h3>
      <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/20 border border-gray-600/30 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-medium text-white font-Tektur">
              {campus_name}
            </p>
            <p className="text-sm text-gray-400 font-Tektur">
              Campus ID: {campus_id}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 font-Tektur">Status</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-green-400 font-Tektur">
                Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactInformation: React.FC<{ email: string }> = ({ email }) => {
  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-white font-Tektur mb-3">
        Contact Information
      </h3>
      <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/20 border border-gray-600/30 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#0070ef] to-blue-400 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">@</span>
          </div>
          <div>
            <p className="text-base font-medium text-white font-Tektur">
              {email}
            </p>
            <p className="text-sm text-gray-400 font-Tektur">
              Primary Email Address
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RankComponent: React.FC<{ userData: UserData }> = ({ userData }) => {
  return (
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
