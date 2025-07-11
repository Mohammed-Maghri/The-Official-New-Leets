"use client";
import React from "react";
import { CiSearch } from "react-icons/ci";
import { FaCaretDown } from "react-icons/fa";
import { motion } from "motion/react";

const Progress = () => {
  const [cursuson, setCursuson] = React.useState<boolean>(false);
  const [campusOn, setCampusOn] = React.useState<boolean>(false);

  return (
    <div className=" flex flex-1 z-10 items-center overflow-auto justify-start flex-col ">
      <div className="w-full gap-2 h-[60px] bg-amber-100/2 backdrop-blur-lg flex items-center justify-center">
        <div
          onClick={() => setCampusOn(!campusOn)}
          className="w-[110px] cursor-pointer relative rounded-md border-solid border-[1px] border-white/5 h-[30px]
         bg-[#0070ef]/20 gap-1 flex items-center justify-center"
        >
          <p className="font-Tektur font-extralight text-white text-[12px]">
            Campus
          </p>
          <FaCaretDown color="white" />
          {campusOn && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-8 bg-[#001226] w-[110px] h-[100px] rounded-md p-2 flex flex-col gap-1"
            ></motion.div>
          )}
        </div>

        <div
          onClick={() => setCursuson(!cursuson)}
          className="w-[110px] cursor-pointer relative rounded-md border-solid border-[1px] border-white/5 h-[30px]
         bg-[#0070ef]/20 gap-1 flex items-center justify-center"
        >
          <p className="font-Tektur font-extralight text-white text-[12px]">
            Cursus
          </p>
          <FaCaretDown color="white" />
          {cursuson && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-8 bg-[#001226] w-[110px] h-[100px] rounded-md p-2 flex flex-col gap-1"
            ></motion.div>
          )}
        </div>
        <div className="w-[30px] cursor-pointer rounded-md border-solid border-[1px] border-white/4 h-[30px] bg-[#0070ef]/20 flex items-center justify-center">
          <CiSearch color="white" />
        </div>
      </div>
    </div>
  );
};

export default Progress;
