import React from "react";
import { RiUserStarLine, RiVipCrown2Fill } from "react-icons/ri";
import { UserData } from "../navbar/navbar.types";
import { Skeleton } from "@mui/material";
import { BsEmojiKiss } from "react-icons/bs";
import { GiQueenCrown } from "react-icons/gi";
import { users } from "./dashboard.types";

const ImageSideComp: React.FC<{ image: string }> = ({ image }) => {
  return (
    <div className="relative duration-200 transition-all rounded-l-sm w-[110px] h-full lg:w-[130px] flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-br rounded-l-md rounded-r-full ">
        <div className="w-full h-full bg-gray-900 rounded-l-md rounded-r-full overflow-hidden">
          <img
            src={image != null ? image : "nopic.jpg"}
            alt="User Avatar"
            width={200}
            height={200}
            className="w-full h-full object-cover rounded-l-sm"
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
    <div className=" p-2 h-full flex items-center justify-center flex-row gap-1">
      <div
        className={`gap-2 p-3 w-[75px] ${
          location
            ? "bg-green-500/5 border-green-400/15"
            : "bg-red-500/5 border-red-400/15"
        } border-solid border-[1px] rounded-md h-[40%] flex items-center justify-center`}
      >
        <div className="w-[20px] h-[20px] flex items-center justify-center">
          <div
            className={`w-[8px] h-[8px] ${
              location ? "bg-green-400" : "bg-red-400"
            }  rounded-full shadow-lg`}
          ></div>
        </div>
        <div className="flex-1 ">
          <p
            className={`font-light text-[12px] font-Tektur ${
              location ? "text-green-500" : "text-red-400"
            }`}
          >
            {location ? location : "offline"}
          </p>
        </div>
      </div>

      <div
        className=" h-[40%] gap-1 border-solid  border-yellow-400/15 border-[1px] bg-gradient-to-r
       from-yellow-400/5 to-amber-500/5 sm:w-[120px] p-3 rounded-md  flex items-center justify-center relative"
      >
        <div className="w-[20px] h-[20px] flex items-center justify-center">
          <RiUserStarLine color="#d6c800" size={15} />
        </div>
        <div className="flex-1">
          <p className="font-extralight font-Tektur text-[12px]  text-white">
            {username}
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

const LevelProgress: React.FC<{
  username: string;
  level: number;
  rank: number;
}> = ({ level, rank, username }) => {
  return (
    <div className="flex relative items-center  justify-start  flex-col w-full h-[50%] bg-amber-50/0 pr-4 pl-4">
      <div className="w-full p-0.5 mb-3 h-[20px] flex items-center justify-between">
        <div className="flex items-center w-[100px]  flex-row">
          <span className="text-[11px] font-medium text-white/90 font-Tektur">
            Rank{" "}
          </span>
          {rank !== -1 && (
            <>
              <p
                className="ml-1 font-Tektur border-solid border-[2px] border-white/30
              text-red-100  min-w-[30px] min-h-[30px] w-[30px] text-[11px] rounded-full flex items-center justify-center"
              >
                {rank}
              </p>
              {users.includes(username) && (
                <div className="ml-1 px-3 py-1.5 bg-yellow-400/40 border-2 border-yellow-300/60 rounded-full shadow-xl shadow-yellow-400/40 animate-pulse flex flex-row items-center gap-1">
                  <RiVipCrown2Fill className="text-yellow-100 text-[12px]" />
                  <span className="text-yellow-100 font-Tektur text-[8px] font-bold tracking-widest">
                    VIP
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-center">
          <span className="text-lg font-bold bg-white bg-clip-text text-transparent font-Tektur">
            {level.toFixed(2)}{" "}
          </span>
        </div>
      </div>
      <div className="ml-0.5 w-full h-[15%] rounded-r-lg bg-blue-500/20 relative overflow-hidden">
        <div
          style={{
            width: (() => {
              const levelStr = level.toString();
              const parts = levelStr.split(".");

              if (parts.length === 1) {
                return "0%";
              }
              const decimal = parts[1];

              if (decimal === "00") {
                return "0%";
              }

              const percentage = decimal.length === 1 ? decimal + "0" : decimal;
              return percentage + "%";
            })(),
          }}
          className=" h-full bg-gradient-to-r from-pink-400 to-yellow-400 rounded-r-lg relative overflow-hidden"
        >
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
      <div className="bg-blue-500/10 border border-[#0070ef]/20 rounded-lg p-4">
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

      <div className="bg-rose-500/10 border border-rose-400/20 rounded-lg p-4">
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

      <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-lg p-4">
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
      <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-4">
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
      <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-4">
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
      <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
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

const RankComponent: React.FC<{ userData: UserData | null; rank: number }> = ({
  userData,
  rank,
}) => {
  return (
    <div
      onClick={() =>
        window.open(`https://profile.intra.42.fr/users/${userData?.login}`)
      }
      className="flex cursor-pointer  relative rounded-l-sm w-full  h-full gap-1 min-h-[130px] bg-gray-800 border border-gray-800/50 rounded-2xl shadow-2xl"
    >
      {userData != null ? (
        <>
          {rank !== -1 && rank >= 1 && rank < 4 && (
            <div className="w-[100px] h-[60px] z-20 absolute top-[-25px] left-[-45px] rotate-[-40deg] flex items-center justify-center">
              <GiQueenCrown
                size={50}
                className={`${
                  rank == 1
                    ? "text-yellow-300"
                    : rank == 2
                    ? "text-gray-500"
                    : rank == 3
                    ? "text-amber-600"
                    : ""
                }`}
              />
            </div>
          )}
          <ImageSideComp image={userData.image as string} />
          <div className="flex-1  h-full flex items-center justify-center flex-col">
            <div className="w-full h-[40px] mt-1 relative  flex items-center justify-start ">
              <LocationUserDetails
                location={userData.location}
                username={userData.login}
              />
              <WalletCoins
                wallet={userData.wallet}
                correctionPoints={userData.correction_point}
              />
            </div>
            <div className="w-full h-[20px] mb-3 pl-4 flex items-center justify-start">
              <p className="font-Tektur text-[12px] text-white">
                {userData.fullname}
              </p>
            </div>
            <LevelProgress
              level={userData.level}
              rank={rank}
              username={userData.login}
            />
          </div>
        </>
      ) : (
        <div className="relative flex flex-1 items-center gap-2 justify-center">
          <p className="font-Tektur font-light text-white">
            {" "}
            Loading Data ...{" "}
          </p>
          <div className="flex items-center justify-center animate-bounce">
            <BsEmojiKiss color="white" />
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
