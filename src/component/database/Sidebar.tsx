"use client";

import React from "react";
import { AiOutlineDatabase, AiOutlinePlus, AiOutlineDelete } from "react-icons/ai";
import type { TableColumnData } from "./nodes/DatabaseTableNode";
import type { Node } from "@xyflow/react";

export interface TableTemplate {
  id: string;
  label: string;
  schema?: string;
  columns: TableColumnData[];
}

const DEFAULT_TEMPLATES: TableTemplate[] = [
  {
    id: "users",
    label: "users",
    schema: "public",
    columns: [
      { id: "id", name: "id", type: "SERIAL", pk: true },
      { id: "login", name: "login", type: "TEXT" },
      { id: "email", name: "email", type: "TEXT" },
      { id: "created_at", name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "posts",
    label: "posts",
    schema: "public",
    columns: [
      { id: "id", name: "id", type: "SERIAL", pk: true },
      { id: "user_id", name: "user_id", type: "INTEGER" },
      { id: "title", name: "title", type: "TEXT" },
      { id: "content", name: "content", type: "TEXT" },
      { id: "created_at", name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "comments",
    label: "comments",
    schema: "public",
    columns: [
      { id: "id", name: "id", type: "SERIAL", pk: true },
      { id: "post_id", name: "post_id", type: "INTEGER" },
      { id: "user_id", name: "user_id", type: "INTEGER" },
      { id: "body", name: "body", type: "TEXT" },
      { id: "created_at", name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "empty",
    label: "New Table",
    schema: "public",
    columns: [{ id: "id", name: "id", type: "SERIAL", pk: true }],
  },
];

interface SidebarProps {
  nodes: Node[];
  onDragStart: (template: TableTemplate) => void;
  onDragEnd: () => void;
  onAddTable: () => void;
  onDeleteTable: (nodeId: string) => void;
  onSelectTable: (nodeId: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  nodes,
  onDragStart,
  onDragEnd,
  onAddTable,
  onDeleteTable,
  onSelectTable,
  isOpen = true,
  onClose,
}) => {
  const tableNodes = nodes.filter((n) => n.type === "databaseTable");

  return (
    <div
      className={`
        relative z-[60] w-64 flex-shrink-0 border-r border-slate-700/60 bg-gray-950 flex flex-col
        transition-all duration-200 ease-out
        ${isOpen ? "flex" : "hidden md:flex"}
      `}
    >
      <div className="p-4 border-b border-slate-700/60 flex items-center justify-between gap-2">
        <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <AiOutlineDatabase className="text-slate-500" />
          Database Schema
        </h2>
        <p className="text-[11px] text-slate-500 mt-1">
          Add tables, rename, connect
        </p>
        <button
          type="button"
          onClick={onAddTable}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border border-slate-600/60 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800 transition-colors"
        >
          <AiOutlinePlus className="text-sm" />
          Add Table
        </button>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {/* Tables on canvas */}
        <div>
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            On Canvas ({tableNodes.length})
          </h3>
          <div className="space-y-1.5">
            {tableNodes.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic py-2">No tables yet</p>
            ) : (
              tableNodes.map((node) => {
                const d = node.data as { label?: string; schema?: string; columns?: unknown[] };
                const fullName = d.schema ? `${d.schema}.${d.label}` : d.label ?? "table";
                const colCount = d.columns?.length ?? 0;
                return (
                  <div
                    key={node.id}
                    className="group flex items-center gap-2 rounded-lg border border-slate-600/60 bg-slate-900/80 p-2 hover:border-slate-500/60"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectTable(node.id)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="font-medium text-sm text-slate-200 truncate">
                        {fullName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {colCount} column{colCount !== 1 ? "s" : ""}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTable(node.id)}
                      className="rounded p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete table"
                    >
                      <AiOutlineDelete className="text-sm" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Templates to drag */}
        <div>
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Templates (drag to add)
          </h3>
          <div className="space-y-2">
            {DEFAULT_TEMPLATES.map((template) => (
              <div
                key={template.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/reactflow", JSON.stringify(template));
                  e.dataTransfer.effectAllowed = "move";
                  onDragStart(template);
                }}
                onDragEnd={onDragEnd}
                className="
                  rounded-lg border border-slate-600/60 bg-gray-900
                  p-3 cursor-grab active:cursor-grabbing
                  hover:border-slate-500/60 hover:bg-gray-800
                  transition-colors
                "
              >
                <div className="font-medium text-sm text-slate-200 truncate">
                  {template.schema ? `${template.schema}.${template.label}` : template.label}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {template.columns.length} columns
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
