export interface TableColumn {
  id?: string;
  name: string;
  type: string;
  pk?: boolean;
  fk?: string;
}

export interface DbTable {
  id: string;
  schema: string;
  name: string;
  columns: TableColumn[];
  x?: number;
  y?: number;
  /** Table IDs this table links to (for relation visualization) */
  linksTo?: string[];
}

export interface Relation {
  id: string;
  fromTableId: string;
  fromColumnId: string;
  toTableId: string;
  toColumnId: string;
}
