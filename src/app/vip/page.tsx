"use client";
import React from "react";
import { LaoderComp } from "@/app/vip/vip.component";
import { ResponseData } from "./vip.types";

const VipPage = () => {
  const [DataReturned, setDataReturned] = React.useState<
    ResponseData[] | null | undefined
  >(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const FetchTest = async () => {
    const data = await fetch("/api/projects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!data.ok) {
      throw new Error("Network response was not ok");
    }
  };

  const functionfetchdata = async () => {
    try {
      setIsLoading(true);
      const data = await fetch("/api/slots", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!data.ok) {
        setDataReturned(undefined);
        setIsLoading(false);
        return;
      }
      const response = await data.json();
      console.log("API request successful, data:", response);
      setDataReturned(response);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setDataReturned(undefined);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    functionfetchdata();
  }, []);

  console.log(
    "Render state - isLoading:",
    isLoading,
    "DataReturned:",
    DataReturned
  );

  return (
    <div
      className="flex flex-1 items-center justify-start overflow-x-hidden flex-col
     bg-gradient-to-br z-20 from-gray-900/50 via-[#0070ef]/20 to-rose-500/30 relative p-6"
    >
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <LaoderComp />
        </div>
      ) : DataReturned && Array.isArray(DataReturned) ? (
        <div
          onClick={() => FetchTest()}
          className="w-full cursor-pointer  bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex flex-1 flex-col p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white font-Tektur">
              Teams & Projects
            </h2>
            <div className="text-sm text-gray-300 font-Tektur bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              {DataReturned.length} team{DataReturned.length !== 1 ? "s" : ""}{" "}
              found
            </div>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6 auto-rows-max">
            {DataReturned.map((team, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white font-Tektur mb-2">
                      {team.name}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="text-gray-200 font-Tektur">
                        Project ID: {team.project_id}
                      </span>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium font-Tektur ${
                          team.status === "finished"
                            ? "bg-green-500/30 text-green-300 border border-green-400/50"
                            : team.status === "in_progress"
                            ? "bg-blue-500/30 text-blue-300 border border-blue-400/50"
                            : "bg-gray-500/30 text-gray-300 border border-gray-400/50"
                        }`}
                      >
                        {team.status.replace("_", " ").toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {team.locked && (
                    <div className="bg-red-500/30 text-red-300 px-3 py-1 rounded-full text-xs font-medium font-Tektur border border-red-400/50">
                      🔒 LOCKED
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-200 font-Tektur mb-3">
                    Team Members:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {team.users.map((user, userIndex) => (
                      <div
                        key={userIndex}
                        className={`px-3 py-1 rounded-full text-xs font-medium font-Tektur border ${
                          user.leader
                            ? "bg-yellow-500/30 text-yellow-300 border-yellow-400/50"
                            : "bg-blue-500/30 text-blue-300 border-blue-400/50"
                        }`}
                      >
                        {user.leader && "👑 "}
                        {user.login}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-gray-200 font-Tektur text-xs mb-1">
                      Final Mark
                    </div>
                    <div
                      className={`font-bold font-Tektur ${
                        team.final_mark === null
                          ? "text-gray-400"
                          : team.final_mark >= 80
                          ? "text-green-300"
                          : team.final_mark >= 60
                          ? "text-yellow-300"
                          : "text-red-300"
                      }`}
                    >
                      {team.final_mark ?? "Not Graded"}
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-gray-200 font-Tektur text-xs mb-1">
                      Validation
                    </div>
                    <div
                      className={`font-medium font-Tektur ${
                        team.validated === "true"
                          ? "text-green-300"
                          : team.validated === "false"
                          ? "text-red-300"
                          : "text-gray-400"
                      }`}
                    >
                      {team.validated === "true"
                        ? "✅ Validated"
                        : team.validated === "false"
                        ? "❌ Not Validated"
                        : "⏳ Pending"}
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-gray-200 font-Tektur text-xs mb-1">
                      Closed At
                    </div>
                    <div className="font-medium text-gray-100 font-Tektur">
                      {team.closed_at
                        ? new Date(team.closed_at).toLocaleDateString()
                        : "Not Closed"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : DataReturned === undefined ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center shadow-2xl">
            {/* Access Denied Icon */}
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center border border-red-400/30">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-9V6a3 3 0 00-3-3H6a3 3 0 00-3 3v3a3 3 0 003 3h3a3 3 0 003-3z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white font-Tektur mb-3">
              🔒 VIP Access Required
            </h2>

            {/* Description */}
            <p className="text-gray-300 font-Tektur mb-6 leading-relaxed">
              This exclusive area is reserved for VIP members only. You need
              special authorization to access teams and projects data.
            </p>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default VipPage;
