"use client";
import React from "react";
import Particles from "@/component/landing/particels";
import { Navbar } from "@/component/navbar/navbar";
import { usePathname } from "next/navigation";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return (
    <div className="relative h-full flex-1 flex flex-col w-full">
      {pathname !== "/" && <Navbar />}
      {children}
      <div
        className="h-full bg-transparent w-full absolute"
        style={{ width: "100%", height: "100%" }}
      >
        <Particles
          particleColors={["#ffffff", "#ffffff"]}
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
