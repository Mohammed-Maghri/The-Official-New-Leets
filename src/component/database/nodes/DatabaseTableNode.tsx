"use client";

import React, { memo, useState, useCallback, useEffect, useRef } from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import { AiOutlinePlus, AiOutlineDelete, AiOutlineEdit, AiOutlineCheck } from "react-icons/ai";

export interface TableColumnData {
  id: string;
  name: string;
  type: string;
  pk?: boolean;
  fk?: boolean;
  enumValues?: string[];
}

const COLUMN_TYPES = [
  "SERIAL",
  "INTEGER",
  "BIGINT",
  "TEXT",
  "VARCHAR",
  "BOOLEAN",
  "TIMESTAMP",
  "DATE",
  "JSON",
  "JSONB",
  "UUID",
  "ENUM",
  "DECIMAL",
  "NUMERIC",
  "REAL",
  "FLOAT",
  "BYTEA",
] as const;

export interface DatabaseTableNodeData {
  label: string;
  schema?: string;
  columns: TableColumnData[];
}

function DatabaseTableNodeComponent({ id, data: rawData, selected }: NodeProps) {
  const data = rawData as unknown as DatabaseTableNodeData;
  const { setNodes, setEdges } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(() => data.label ?? "");
  const [editSchema, setEditSchema] = useState(() => data.schema ?? "public");
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [editColName, setEditColName] = useState("");
  const [editColType, setEditColType] = useState("TEXT");
  const [editEnumValues, setEditEnumValues] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const colInputRef = useRef<HTMLInputElement>(null);
  const addColInputRef = useRef<HTMLInputElement>(null);

  const columns = Array.isArray(data.columns) ? data.columns : [];
  const fullName = data.schema ? `${data.schema}.${data.label}` : data.label;

  const saveEdit = useCallback(() => {
    const label = String(editLabel ?? "").trim() || "table";
    const schema = String(editSchema ?? "").trim() || "public";
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, label, schema } }
          : n
      )
    );
    setIsEditing(false);
  }, [id, editLabel, editSchema, setNodes]);

  useEffect(() => {
    if (isEditing) {
      setEditLabel(data.label ?? "");
      setEditSchema(data.schema ?? "public");
      inputRef.current?.focus();
    }
  }, [isEditing, data.label, data.schema]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") {
      setEditLabel(data.label ?? "");
      setEditSchema(data.schema ?? "public");
      setIsEditing(false);
    }
  };

  const updateColumn = useCallback(
    (colId: string, updates: Partial<TableColumnData>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
                ...n,
                data: {
                  ...n.data,
                  columns: (Array.isArray(n.data.columns) ? n.data.columns : []).map((c) =>
                    c.id === colId ? { ...c, ...updates } : c
                  ),
                },
              }
            : n
        )
      );
    },
    [id, setNodes]
  );

  const saveColEdit = useCallback(() => {
    if (!editingColId) return;
    const name = editColName.trim() || "column";
    const type = editColType.trim() || "TEXT";
    const enumValues =
      type === "ENUM" && editEnumValues.trim()
        ? editEnumValues.split(",").map((v) => v.trim()).filter(Boolean)
        : undefined;
    updateColumn(editingColId, { name, type, enumValues });
    setEditingColId(null);
  }, [editingColId, editColName, editColType, editEnumValues, updateColumn]);

  const startAddColumn = useCallback(() => {
    setIsAddingColumn(true);
    setEditColName("new_column");
    setEditColType("TEXT");
    setEditEnumValues("");
    setTimeout(() => addColInputRef.current?.focus(), 0);
  }, []);

  const confirmAddColumn = useCallback(() => {
    const name = editColName.trim() || "new_column";
    const type = editColType.trim() || "TEXT";
    const newId = `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newCol: TableColumnData = {
      id: newId,
      name,
      type,
      pk: false,
      enumValues:
        type === "ENUM" && editEnumValues.trim()
          ? editEnumValues.split(",").map((v) => v.trim()).filter(Boolean)
          : undefined,
    };
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? {
              ...n,
              data: {
                ...n.data,
                columns: [...(Array.isArray(n.data.columns) ? n.data.columns : []), newCol],
              },
            }
          : n
      )
    );
    setIsAddingColumn(false);
    setEditColName("");
    setEditColType("TEXT");
    setEditEnumValues("");
  }, [id, editColName, editColType, editEnumValues, setNodes]);

  const cancelAddColumn = useCallback(() => {
    setIsAddingColumn(false);
    setEditColName("");
    setEditColType("TEXT");
    setEditEnumValues("");
  }, []);

  const deleteColumn = useCallback(
    (colId: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
                ...n,
                data: {
                  ...n.data,
                  columns: (Array.isArray(n.data.columns) ? n.data.columns : []).filter((c) => c.id !== colId),
                },
              }
            : n
        )
      );
      setEdges((eds) =>
        eds.filter(
          (e) =>
            !(
              (e.source === id && e.sourceHandle === colId) ||
              (e.target === id && e.targetHandle === colId)
            )
        )
      );
      if (editingColId === colId) setEditingColId(null);
    },
    [id, editingColId, setNodes, setEdges]
  );

  const togglePk = useCallback(
    (colId: string) => {
      const col = columns.find((c) => c.id === colId);
      if (!col) return;
      const newPk = !col.pk;
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
                ...n,
                data: {
                  ...n.data,
                  columns: (Array.isArray(n.data.columns) ? n.data.columns : []).map((c) =>
                    c.id === colId ? { ...c, pk: newPk } : c
                  ),
                },
              }
            : n
        )
      );
    },
    [id, columns, setNodes]
  );

  useEffect(() => {
    if (editingColId) {
      const col = columns.find((c) => c.id === editingColId);
      setEditColName(col?.name ?? "");
      setEditColType(col?.type ?? "TEXT");
      setEditEnumValues(col?.enumValues?.join(", ") ?? "");
      colInputRef.current?.focus();
    }
  }, [editingColId, columns]);

  return (
    <div
      className={`
        rounded-2xl border-2 bg-[#f5f3e9]
        w-[260px] overflow-visible
        transition-all duration-200
        ${selected ? "border-[#a0a6b0]  -500/20" : "border-[#a0a6b0] hover:border-[#a0a6b0]"}
      `}
    >
      <div
        className="relative h-12 px-4 flex items-center bg-[#e2dfd0] border-b border-[#a0a6b0] rounded-t-2xl group/header shrink-0"
        onDoubleClick={() => {
          setIsEditing(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <div className="font-semibold text-sm text-[#3e3d35] truncate flex-1 min-w-0">
          {fullName}
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className="nodrag shrink-0 rounded p-1 text-[#3e3d35] hover:text-[#3e3d35] hover:bg-[#d6d2c2]"
            title="Edit table name"
          >
            <AiOutlineEdit className="text-sm" />
          </button>
        )}
        {isEditing && (
          <div
            className="nodrag absolute inset-0 flex items-center gap-1 px-3 bg-[#e2dfd0] z-10 rounded-t-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={editSchema}
              onChange={(e) => setEditSchema(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-14 rounded border border-[#a0a6b0] bg-[#f5f3e9] px-1.5 py-0.5 text-[10px] text-[#3e3d35] focus:border-[#a0a6b0] focus:outline-none"
              placeholder="schema"
            />
            <span className="text-[#3e3d35] text-[10px]">.</span>
            <input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-0 rounded border border-[#a0a6b0] bg-[#f5f3e9] px-1.5 py-0.5 text-xs text-[#3e3d35] focus:border-[#a0a6b0] focus:outline-none"
              placeholder="table"
            />
            <button
              type="button"
              onClick={saveEdit}
              className="nodrag shrink-0 rounded p-0.5 text-[#3e3d35] hover:bg-[#d9e5f5]"
              title="Done"
            >
              <AiOutlineCheck className="text-sm" />
            </button>
          </div>
        )}
      </div>
      <div className="divide-y divide-neutral-700/50">
        {columns.map((col) => (
          <div
            key={col.id}
            className="relative flex items-center gap-2 px-3 h-10 shrink-0 group/row"
            onDoubleClick={() => {
              setEditingColId(col.id);
              setEditColName(col.name);
              setEditColType(col.type ?? "TEXT");
              setEditEnumValues(col.enumValues?.join(", ") ?? "");
            }}
          >
            {/* Link in - always visible */}
            <Handle
              type="target"
              position={Position.Left}
              id={col.id}
              className="!w-3 !h-3 !bg-[#d9e5f5] !border-2 !border-[#a0a6b0] shrink-0"
              title="Connect from another table"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span className="text-xs font-medium text-[#3e3d35] truncate block">
                {col.name}
                {col.pk && (
                  <span className="ml-1.5 text-[10px] text-[#3e3d35] font-bold">PK</span>
                )}
              </span>
              <span className="text-[10px] text-[#3e3d35] truncate block">
                {col.type}
                {col.enumValues?.length ? `(${col.enumValues.join(", ")})` : ""}
              </span>
            </div>
            {editingColId !== col.id && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingColId(col.id);
                  setEditColName(col.name);
                  setEditColType(col.type ?? "TEXT");
                  setEditEnumValues(col.enumValues?.join(", ") ?? "");
                  setTimeout(() => colInputRef.current?.focus(), 0);
                }}
                className="nodrag shrink-0 rounded p-1 text-[#3e3d35] hover:text-[#3e3d35] hover:bg-[#d6d2c2]"
                title="Edit column"
              >
                <AiOutlineEdit className="text-sm" />
              </button>
            )}
            {/* Edit overlay - same size, positioned on top */}
            {editingColId === col.id && (
              <>
                <div
                  className="nodrag absolute inset-0 flex items-center gap-1.5 px-3 bg-[#f5f3e9] z-10"
                  onClick={(e) => e.stopPropagation()}
                  onBlur={(e) => {
                    const overlay = e.currentTarget;
                    const next = e.relatedTarget as HTMLElement | null;
                    if (!next || !overlay.contains(next)) saveColEdit();
                  }}
                >
                  <input
                    ref={colInputRef}
                    value={editColName}
                    onChange={(e) => setEditColName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveColEdit();
                      if (e.key === "Escape") {
                        setEditColName(col.name);
                        setEditingColId(null);
                      }
                    }}
                    className="flex-1 min-w-0 w-20 rounded border border-[#a0a6b0] bg-[#e2dfd0] px-1.5 py-0.5 text-[11px] text-[#3e3d35] focus:border-[#a0a6b0] focus:outline-none"
                    placeholder="name"
                  />
                  <select
                    value={editColType}
                    onChange={(e) => setEditColType(e.target.value)}
                    className="nodrag w-28 rounded border border-[#a0a6b0] bg-[#e2dfd0] px-1.5 py-0.5 text-[10px] text-[#3e3d35] focus:border-[#a0a6b0] focus:outline-none shrink-0"
                  >
                    {COLUMN_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => togglePk(col.id)}
                    className={`rounded px-1 py-0.5 text-[9px] font-bold shrink-0 ${
                      col.pk
                        ? "bg-[#d9e5f5] text-[#3e3d35] border border-[#a0a6b0]"
                        : "bg-[#d6d2c2] text-[#3e3d35] border border-[#a0a6b0]"
                    }`}
                    title="Primary key"
                  >
                    PK
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteColumn(col.id)}
                    className="rounded p-0.5 text-[#3e3d35] hover:text-[#3e3d35] hover:bg-[#d9e5f5] shrink-0"
                    title="Delete column"
                  >
                    <AiOutlineDelete className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={saveColEdit}
                    className="nodrag rounded p-0.5 text-[#3e3d35] hover:bg-[#d9e5f5] shrink-0"
                    title="Done"
                  >
                    <AiOutlineCheck className="text-sm" />
                  </button>
                </div>
                {editColType === "ENUM" && (
                  <div
                    className="nodrag absolute left-0 right-0 top-full mt-0.5 px-3 py-1.5 bg-[#e2dfd0] border border-[#a0a6b0] rounded z-20 "
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      value={editEnumValues}
                      onChange={(e) => setEditEnumValues(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveColEdit();
                        if (e.key === "Escape") setEditingColId(null);
                      }}
                      className="w-full rounded border border-[#a0a6b0] bg-[#f5f3e9] px-2 py-0.5 text-[10px] text-[#3e3d35] focus:border-[#a0a6b0] focus:outline-none"
                      placeholder="value1, value2, value3"
                    />
                  </div>
                )}
              </>
            )}
            {/* Link out - always visible */}
            <Handle
              type="source"
              position={Position.Right}
              id={col.id}
              className="!w-3 !h-3 !bg-[#d9e5f5] !border-2 !border-[#a0a6b0] shrink-0"
              title="Connect to another table"
            />
          </div>
        ))}
        {isAddingColumn ? (
          <div
            className="nodrag flex flex-col gap-2 p-3 border-t border-[#a0a6b0] bg-[#e2dfd0] rounded-b-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-2 items-center">
              <input
                ref={addColInputRef}
                value={editColName}
                onChange={(e) => setEditColName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmAddColumn();
                  if (e.key === "Escape") cancelAddColumn();
                }}
                placeholder="Column name"
                className="flex-1 min-w-0 rounded border border-[#a0a6b0] bg-[#f5f3e9] px-2 py-1 text-xs text-[#3e3d35] focus:border-[#a0a6b0] focus:outline-none"
              />
              <select
                value={editColType}
                onChange={(e) => setEditColType(e.target.value)}
                className="nodrag rounded border border-[#a0a6b0] bg-[#f5f3e9] px-2 py-1 text-xs text-[#3e3d35] focus:border-[#a0a6b0] focus:outline-none w-28"
              >
                {COLUMN_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            {editColType === "ENUM" && (
              <input
                value={editEnumValues}
                onChange={(e) => setEditEnumValues(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmAddColumn();
                  if (e.key === "Escape") cancelAddColumn();
                }}
                placeholder="Values: a, b, c"
                className="w-full rounded border border-[#a0a6b0] bg-[#f5f3e9] px-2 py-1 text-[10px] text-[#3e3d35] focus:border-[#a0a6b0] focus:outline-none"
              />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmAddColumn}
                className="flex-1 rounded border border-[#a0a6b0] bg-[#e2dfd0] px-2 py-1 text-[11px] text-[#3e3d35] hover:bg-[#d9e5f5]"
              >
                Add
              </button>
              <button
                type="button"
                onClick={cancelAddColumn}
                className="rounded border border-[#a0a6b0] bg-[#e2dfd0] px-2 py-1 text-[11px] text-[#3e3d35] hover:bg-[#d6d2c2]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={startAddColumn}
            className="w-full h-9 flex items-center justify-center gap-1.5 text-[11px] text-[#3e3d35] hover:text-[#3e3d35] hover:bg-[#e2dfd0] border-t border-[#a0a6b0] rounded-b-2xl transition-colors shrink-0"
          >
            <AiOutlinePlus className="text-sm" />
            Add column
          </button>
        )}
      </div>
    </div>
  );
}

export const DatabaseTableNode = memo(DatabaseTableNodeComponent);
