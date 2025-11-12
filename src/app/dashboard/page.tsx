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
import { fetchVIPUsers } from "@/component/dashboard/dashboard.types";
import { useRouter } from "next/navigation";
import { BsStars } from "react-icons/bs";

const Dashboard = () => {
  const { userData } = React.useContext(ContextCreator) as ContextProps;
  const router = useRouter();
  const [isCreator, setIsCreator] = React.useState<boolean>(false);

  // Fetch VIP users on component mount
  React.useEffect(() => {
    fetchVIPUsers();
  }, []);

  // Check if user is a creator
  React.useEffect(() => {
    const checkCreatorStatus = async () => {
      try {
        const response = await fetch("/api/check-creator", {
          method: "GET",
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsCreator(data.isCreator || false);
        }
      } catch (error) {
        console.error("Error checking creator status:", error);
      }
    };
    
    if (userData) {
      checkCreatorStatus();
    }
  }, [userData]);

  return (
    <div className="flex flex-1 overflow-auto p-5 sm:p-10 gap-4 z-10 flex-col">
      {/* Creator Button */}
      {isCreator && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => router.push("/dashboard/feedback-reviews")}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-gray-900 font-Tektur font-bold rounded-xl shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105"
          >
            <BsStars className="w-5 h-5" />
            <span className="hidden sm:inline">Feedback Reviews</span>
            <span className="sm:hidden">Reviews</span>
          </button>
        </div>
      )}

      <div className="w-full h-[200px]">
        <RankComponent userData={userData as UserData} rank={-1} />
      </div>
      
      <div className="flex-1 bg-blue-950/30 border border-blue-800/50 backdrop-blur-sm rounded-2xl p-5 flex flex-col gap-5">
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
            <CampusInformation
              campus_name={userData.campus_name}
              campus_id={userData.campus_id}
            />
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
