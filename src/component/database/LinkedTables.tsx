"use client";

import React from "react";
import { TableCard } from "./TableCard";
import { TableLink } from "./TableLink";
import type { DbTable } from "./database.types";

interface LinkedTablesProps {
  tables: DbTable[];
  linkLabel?: string;
}

export const LinkedTables: React.FC<LinkedTablesProps> = ({
  tables,
  linkLabel = "FK",
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
      {tables.map((table, i) => (
        <React.Fragment key={table.id}>
          {i > 0 && (
            <TableLink
              from={tables[i - 1].id}
              to={table.id}
              label={linkLabel}
              className="sm:flex-col sm:w-8 sm:flex-none"
            />
          )}
          <div className="flex-1 min-w-0">
            <TableCard table={table} />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
