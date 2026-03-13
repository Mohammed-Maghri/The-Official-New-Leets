"use client";

import React from "react";
import type { DbTable } from "./database.types";

interface TableCardProps {
  table: DbTable;
}

export const TableCard: React.FC<TableCardProps> = ({ table }) => {
  const fullName = table.schema ? `${table.schema}.${table.name}` : table.name;

  return (
    <div
      className="border-2 theme-border bg-[var(--theme-bg-card)] p-3 sm:p-4 min-w-0"
      style={{
        fontFamily: "var(--font-pixel)",
        boxShadow: "3px 3px 0 var(--theme-shadow-sm)",
      }}
    >
      <div className="text-[10px] font-bold text-[var(--theme-primary)] uppercase tracking-wider mb-2 truncate">
        {fullName}
      </div>
      <div className="space-y-1">
        {table.columns.slice(0, 6).map((col) => (
          <div
            key={col.id ?? col.name}
            className="flex items-center gap-2 text-[9px] theme-text-muted truncate"
          >
            <span className="font-bold theme-text min-w-0 truncate">{col.name}</span>
            <span className="text-[8px] opacity-70 truncate">{col.type}</span>
            {col.pk && (
              <span className="text-[8px] text-amber-400 font-bold">PK</span>
            )}
          </div>
        ))}
        {table.columns.length > 6 && (
          <div className="text-[8px] theme-text-muted pt-1">
            +{table.columns.length - 6} more
          </div>
        )}
      </div>
    </div>
  );
};
