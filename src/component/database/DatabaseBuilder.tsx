"use client";

import React, { useCallback, useRef, useState } from "react";
import { EditableTableCard } from "./EditableTableCard";
import { RelationLines } from "./RelationLines";
import { useDatabaseBuilder } from "./useDatabaseBuilder";
import type { DbTable } from "./database.types";

const INITIAL_TABLES: DbTable[] = [
  {
    id: "t1",
    schema: "leets",
    name: "users",
    columns: [
      { id: "c1", name: "id", type: "SERIAL", pk: true },
      { id: "c2", name: "login", type: "TEXT" },
    ],
    x: 40,
    y: 40,
  },
  {
    id: "t2",
    schema: "leets",
    name: "posts",
    columns: [
      { id: "c3", name: "id", type: "SERIAL", pk: true },
      { id: "c4", name: "user_id", type: "INTEGER", fk: "users.id" },
      { id: "c5", name: "title", type: "TEXT" },
    ],
    x: 320,
    y: 40,
  },
];

export const DatabaseBuilder: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tablePositions, setTablePositions] = useState<
    Map<string, { x: number; y: number; w: number; h: number }>
  >(new Map());

  const {
    tables,
    relations,
    selectedColumn,
    addTable,
    updateTablePosition,
    updateTableName,
    addColumn,
    updateColumn,
    removeColumn,
    removeTable,
    handleColumnClick,
    COLUMN_TYPES,
  } = useDatabaseBuilder(INITIAL_TABLES);

  const updatePositions = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const cards = containerRef.current.querySelectorAll("[data-table-id]");
    const next = new Map<string, { x: number; y: number; w: number; h: number }>();
    cards.forEach((el) => {
      const id = (el as HTMLElement).dataset.tableId;
      if (!id) return;
      const r = (el as HTMLElement).getBoundingClientRect();
      next.set(id, {
        x: r.left - containerRect.left + containerRef.current!.scrollLeft,
        y: r.top - containerRect.top + containerRef.current!.scrollTop,
        w: r.width,
        h: r.height,
      });
    });
    setTablePositions(next);
  }, []);

  React.useEffect(() => {
    updatePositions();
    const ro = new ResizeObserver(updatePositions);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [tables, relations, updatePositions]);

  const isColumnSelected = useCallback(
    (tableId: string, columnId: string) =>
      selectedColumn?.tableId === tableId && selectedColumn?.columnId === columnId,
    [selectedColumn]
  );

  return (
    <div
      className="flex flex-1 flex-col min-h-0 overflow-hidden"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      <div className="flex items-center gap-2 p-2 border-b-2 theme-border flex-shrink-0">
        <button
          onClick={addTable}
          className="px-4 py-2 border-2 theme-border font-bold text-[10px] uppercase tracking-wider
            hover:bg-[var(--theme-bg-card)] transition-all active:translate-y-0.5"
          style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
        >
          + Add table
        </button>
        <span className="text-[9px] theme-text-muted uppercase">
          Click a column, then another to create relation (FK)
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 relative overflow-auto min-h-[300px] bg-[var(--theme-bg)]/30"
        style={{ minHeight: "400px" }}
      >
        <RelationLines
          tables={tables}
          relations={relations}
          containerRef={containerRef}
          tablePositions={tablePositions}
        />
        <div className="relative" style={{ minWidth: "800px", minHeight: "500px" }}>
          {tables.map((table) => (
            <div
              key={table.id}
              data-table-id={table.id}
              className="absolute"
              style={{ left: table.x, top: table.y }}
            >
              <EditableTableCard
                table={table}
                isColumnSelected={isColumnSelected}
                onColumnClick={handleColumnClick}
                onUpdateName={updateTableName}
                onAddColumn={addColumn}
                onUpdateColumn={updateColumn}
                onRemoveColumn={removeColumn}
                onRemoveTable={removeTable}
                onDrag={updateTablePosition}
                columnTypes={COLUMN_TYPES}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
