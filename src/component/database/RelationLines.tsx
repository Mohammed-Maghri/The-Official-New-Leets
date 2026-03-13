"use client";

import React from "react";
import type { DbTable, Relation } from "./database.types";

interface RelationLinesProps {
  tables: DbTable[];
  relations: Relation[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  tablePositions: Map<string, { x: number; y: number; w: number; h: number }>;
}

export const RelationLines: React.FC<RelationLinesProps> = ({
  relations,
  containerRef,
  tablePositions,
}) => {
  if (!containerRef.current) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none w-full h-full overflow-visible"
      style={{ zIndex: 0 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="var(--theme-primary)" />
        </marker>
      </defs>
      {relations.map((r) => {
        const from = tablePositions.get(r.fromTableId);
        const to = tablePositions.get(r.toTableId);
        if (!from || !to) return null;
        const x1 = from.x + from.w / 2;
        const y1 = from.y + from.h / 2;
        const x2 = to.x + to.w / 2;
        const y2 = to.y + to.h / 2;
        return (
          <line
            key={r.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--theme-primary)"
            strokeWidth="2"
            strokeDasharray="4 4"
            markerEnd="url(#arrowhead)"
          />
        );
      })}
    </svg>
  );
};
