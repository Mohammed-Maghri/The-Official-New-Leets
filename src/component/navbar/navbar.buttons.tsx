"use client";
import React, { FC } from "react";
import { ButtonsProps } from "./navbar.types";
import { motion } from "motion/react";
import { useRouter, usePathname } from "next/navigation";

const Buttons: FC<ButtonsProps> = ({ icon, title, route }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === route;

  return (
    <motion.div
      onClick={() => router.push(route)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        flex border-2 items-center justify-center gap-1.5 h-8 px-3 cursor-pointer
        transition-all duration-150 active:translate-y-0.5
        font-bold text-[10px] uppercase tracking-wider
        ${isActive
          ? "theme-border-strong bg-[var(--theme-bg)] text-white shadow-[0_0_15px_var(--theme-bg)]"
          : "theme-border bg-[var(--theme-bg-card)] theme-text hover:border-[var(--theme-border-strong)] hover:bg-[var(--theme-bg)]"
        }
      `}
      style={{
        fontFamily: "var(--font-pixel)",
        boxShadow: isActive
          ? "3px 3px 0 var(--theme-shadow-md), inset 0 1px 0 rgba(255,255,255,0.1)"
          : "2px 2px 0 rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex items-center justify-center [&>svg]:w-3.5 [&>svg]:h-3.5">
        {icon}
      </div>
      <span>{title}</span>
    </motion.div>
  );
};

export { Buttons };
