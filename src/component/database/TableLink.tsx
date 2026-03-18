"use client";

import React from "react";

interface TableLinkProps {
  from: string;
  to: string;
  label?: string;
  className?: string;
}

export const TableLink: React.FC<TableLinkProps> = ({
  from,
  to,
  label,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-center gap-1 sm:gap-2 flex-shrink-0 ${className}`}
      style={{ fontFamily: "var(--font-ui)" }}
      data-from={from}
      data-to={to}
    >
      <div className="w-4 sm:w-8 h-px bg-[var(--theme-primary)]/50" />
      {label && (
        <span className="text-[8px] theme-text-muted uppercase tracking-wider whitespace-nowrap">
          {label}
        </span>
      )}
      <div className="w-4 sm:w-8 h-px bg-[var(--theme-primary)]/50" />
    </div>
  );
};
