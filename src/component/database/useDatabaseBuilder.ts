"use client";

import { useCallback, useState } from "react";
import type { DbTable, TableColumn, Relation } from "./database.types";

const COLUMN_TYPES = ["TEXT", "INTEGER", "SERIAL", "VARCHAR", "BOOLEAN", "TIMESTAMP", "BIGINT"];

const genId = () => Math.random().toString(36).slice(2, 11);

export function useDatabaseBuilder(initialTables: DbTable[] = []) {
  const [tables, setTables] = useState<DbTable[]>(initialTables);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<{
    tableId: string;
    columnId: string;
  } | null>(null);

  const addTable = useCallback(() => {
    const id = genId();
    setTables((prev) => [
      ...prev,
      {
        id,
        schema: "public",
        name: `table_${prev.length + 1}`,
        columns: [{ id: genId(), name: "id", type: "SERIAL", pk: true }],
        x: 50 + prev.length * 20,
        y: 50 + (prev.length % 3) * 30,
      },
    ]);
  }, []);

  const updateTablePosition = useCallback((id: string, x: number, y: number) => {
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, x, y } : t))
    );
  }, []);

  const updateTableName = useCallback((id: string, name: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name } : t))
    );
  }, []);

  const addColumn = useCallback((tableId: string) => {
    const colId = genId();
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              columns: [
                ...t.columns,
                { id: colId, name: "new_column", type: "TEXT" },
              ],
            }
          : t
      )
    );
  }, []);

  const updateColumn = useCallback(
    (tableId: string, columnId: string, updates: Partial<TableColumn>) => {
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? {
                ...t,
                columns: t.columns.map((c) =>
                  (c.id ?? c.name) === columnId ? { ...c, ...updates } : c
                ),
              }
            : t
        )
      );
    },
    []
  );

  const removeColumn = useCallback((tableId: string, columnId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              columns: t.columns.filter((c) => (c.id ?? c.name) !== columnId),
            }
          : t
      )
    );
    setRelations((prev) =>
      prev.filter(
        (r) =>
          !(
            (r.fromTableId === tableId && r.fromColumnId === columnId) ||
            (r.toTableId === tableId && r.toColumnId === columnId)
          )
      )
    );
  }, []);

  const removeTable = useCallback((tableId: string) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId));
    setRelations((prev) =>
      prev.filter((r) => r.fromTableId !== tableId && r.toTableId !== tableId)
    );
  }, []);

  const handleColumnClick = useCallback(
    (tableId: string, columnId: string) => {
      if (selectedColumn) {
        if (
          selectedColumn.tableId === tableId &&
          selectedColumn.columnId === columnId
        ) {
          setSelectedColumn(null);
          return;
        }
        if (selectedColumn.tableId !== tableId) {
          setRelations((prev) => [
            ...prev,
            {
              id: genId(),
              fromTableId: selectedColumn.tableId,
              fromColumnId: selectedColumn.columnId,
              toTableId: tableId,
              toColumnId: columnId,
            },
          ]);
        }
        setSelectedColumn(null);
      } else {
        setSelectedColumn({ tableId, columnId });
      }
    },
    [selectedColumn]
  );

  const removeRelation = useCallback((relationId: string) => {
    setRelations((prev) => prev.filter((r) => r.id !== relationId));
  }, []);

  return {
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
    removeRelation,
    setSelectedColumn,
    COLUMN_TYPES,
  };
}
