"use client";
import React, { FC } from "react";
import { ButtonsProps } from "./navbar.types";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

const Buttons: FC<ButtonsProps> = ({ icon, title, route }) => {
  const router = useRouter();
  return (
    <motion.div
      onClick={() => router.push(route)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex bg-[#0070ef]/3 border-solid border-[1px] border-[#0070ef]/0
     w-[120px] cursor-pointer rounded-md hover:border-[#0070ef]/40
     duration-200 items-center justify-center gap-1 h-[30px]"
    >
      <div className="  flex items-center justify-center">{icon}</div>
      <p className="text-white font-Tektur text-[11px]">{title}</p>
    </motion.div>
  );
};

export { Buttons };
