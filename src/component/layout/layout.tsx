"use client";
import React from "react";
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
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
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
    </div>
  );
};

export { Layout };
