"use client";

import React from "react";
import { DatabaseCanvas } from "@/component/database";

const DatabasePage = () => {
  return (
    <div className="relative z-0 flex flex-1 flex-col min-h-0 w-full overflow-auto sm:overflow-hidden px-3 py-2 sm:p-0 bg-gray-950">
      <DatabaseCanvas />
    </div>
  );
};

export default DatabasePage;
