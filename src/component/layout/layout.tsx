"use client";
import React from "react";
import Image from "next/image";
import Particles from "@/component/landing/particels";
import { Navbar } from "@/component/navbar/navbar";
import { usePathname } from "next/navigation";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return (
    <div className="relative h-full flex-1 flex flex-col w-full bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950/30">
      {pathname !== "/" && <Navbar />}
      {children}

      {/* Enhanced Background Layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-blue-900/10" />

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div
        className="h-full bg-transparent w-full absolute"
        style={{ width: "100%", height: "100%" }}
      >
        <Particles
          particleColors={["#ffffff", "#60a5fa"]}
          particleCount={1000}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={50}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>

      {/* Created with Love Component */}
      <div className="fixed bottom-4 right-4 z-50 group">
        <div className="flex items-center space-x-2 bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-full px-4 py-2 shadow-lg transition-all duration-300 hover:bg-gray-800/90 hover:scale-105">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
            <Image
              src="/muh.png"
              alt="Creator"
              className="w-full h-full object-cover rounded-full"
              width={32}
              height={32}
            />
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-300 font-Tektur">
              Created with
            </span>
            <span className="text-red-400 animate-pulse">❤️</span>
            <span className="text-xs text-gray-300 font-Tektur">by</span>
            <span
              onClick={() =>
                window.open("https://profile.intra.42.fr/users/mmaghri")
              }
              className="cursor-pointer text-xs text-blue-300 font-Tektur underline font-medium"
            >
              mmaghri
            </span>
          </div>
        </div>

        {/* Tooltip on hover */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-800/95 backdrop-blur-sm text-xs text-gray-200 px-3 py-2 rounded-lg shadow-xl border border-gray-600/30">
            <div className="font-Tektur font-medium text-blue-300">
              Mohammed Maghri
            </div>
            <div className="font-Tektur text-gray-400">
              Full Stack Developer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Layout };
