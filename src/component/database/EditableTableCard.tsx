"use client";

import React, { useRef, useState } from "react";
import type { DbTable, TableColumn } from "./database.types";

interface EditableTableCardProps {
  table: DbTable;
  isColumnSelected: (tableId: string, columnId: string) => boolean;
  onColumnClick: (tableId: string, columnId: string) => void;
  onUpdateName: (id: string, name: string) => void;
  onAddColumn: (tableId: string) => void;
  onUpdateColumn: (
    tableId: string,
    columnId: string,
    updates: Partial<TableColumn>
  ) => void;
  onRemoveColumn: (tableId: string, columnId: string) => void;
  onRemoveTable: (tableId: string) => void;
  onDrag: (id: string, x: number, y: number) => void;
  columnTypes: string[];
}

export const EditableTableCard: React.FC<EditableTableCardProps> = ({
  table,
  isColumnSelected,
  onColumnClick,
  onUpdateName,
  onAddColumn,
  onUpdateColumn,
  onRemoveColumn,
  onRemoveTable,
  onDrag,
  columnTypes,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(table.name);
  const dragRef = useRef<{ startX: number; startY: number; tableX: number; tableY: number } | null>(null);

  const fullName = table.schema ? `${table.schema}.${table.name}` : table.name;

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("input, button, select")) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      tableX: table.x ?? 0,
      tableY: table.y ?? 0,
    };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      onDrag(table.id, dragRef.current.tableX + dx, dragRef.current.tableY + dy);
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      className="border-2 theme-border bg-[var(--theme-bg-card)] p-3 cursor-grab active:cursor-grabbing min-w-[180px] max-w-[220px] select-none"
      style={{
        fontFamily: "var(--font-pixel)",
        boxShadow: "4px 4px 0 var(--theme-shadow-sm)",
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        {isEditingName ? (
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={() => {
              onUpdateName(table.id, nameInput || table.name);
              setIsEditingName(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onUpdateName(table.id, nameInput || table.name);
                setIsEditingName(false);
              }
            }}
            className="flex-1 px-2 py-1 text-[10px] border theme-border bg-gray-950 theme-text outline-none"
            autoFocus
          />
        ) : (
          <div
            className="text-[10px] font-bold text-[var(--theme-primary)] uppercase tracking-wider truncate flex-1"
            onDoubleClick={() => setIsEditingName(true)}
          >
            {fullName}
          </div>
        )}
        <button
          onClick={() => onRemoveTable(table.id)}
          className="text-red-400 hover:text-red-300 text-xs p-0.5"
          title="Remove table"
        >
          ×
        </button>
      </div>
      <div className="space-y-1">
        {table.columns.map((col) => (
          <div
            key={col.id ?? col.name}
            className={`flex items-center gap-1 group ${
              isColumnSelected(table.id, col.id ?? col.name)
                ? "ring-1 ring-[var(--theme-primary)]"
                : ""
            }`}
          >
            <button
              type="button"
              onClick={() => onColumnClick(table.id, col.id ?? col.name)}
              className="flex-1 flex items-center gap-1 text-left text-[9px] theme-text-muted hover:theme-text min-w-0"
            >
              <span className="font-bold theme-text truncate">{col.name}</span>
              <span className="text-[8px] opacity-70 truncate">{col.type}</span>
              {col.pk && (
                <span className="text-[8px] text-amber-400 font-bold">PK</span>
              )}
            </button>
            <select
              value={col.type}
              onChange={(e) =>
                onUpdateColumn(table.id, col.id ?? col.name, { type: e.target.value })
              }
              className="text-[8px] bg-gray-900 theme-border border px-1 py-0.5 theme-text w-16"
            >
              {columnTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              onClick={() => onRemoveColumn(table.id, col.id ?? col.name)}
              className="opacity-0 group-hover:opacity-100 text-red-400 text-[8px] p-0.5"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => onAddColumn(table.id)}
        className="mt-2 w-full py-1 text-[8px] border theme-border hover:bg-[var(--theme-bg)] theme-text-muted"
      >
        + Add column
      </button>
    </div>
  );
};
