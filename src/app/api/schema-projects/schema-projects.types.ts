import { z } from "zod";

// Limits for robustness and DoS mitigation
const MAX_NODES = 500;
const MAX_EDGES = 1000;
const MAX_COLUMNS_PER_TABLE = 50;
const MAX_STRING_LENGTH = 255;
const MAX_ENUM_VALUES = 20;

const tableColumnSchema = z
  .object({
    id: z.string().max(MAX_STRING_LENGTH),
    name: z.string().max(MAX_STRING_LENGTH),
    type: z.string().max(MAX_STRING_LENGTH),
    pk: z.boolean().optional(),
    fk: z.boolean().optional(),
    enumValues: z.array(z.string().max(MAX_STRING_LENGTH)).max(MAX_ENUM_VALUES).optional(),
  })
  .passthrough();

const databaseTableNodeDataSchema = z
  .object({
    label: z.string().max(MAX_STRING_LENGTH),
    schema: z.string().max(MAX_STRING_LENGTH).optional(),
    columns: z.array(tableColumnSchema).max(MAX_COLUMNS_PER_TABLE),
  })
  .passthrough();

const positionSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});

const schemaProjectNodeSchema = z
  .object({
    id: z.coerce.string().max(MAX_STRING_LENGTH),
    type: z.string().max(MAX_STRING_LENGTH).optional(),
    position: positionSchema,
    data: databaseTableNodeDataSchema,
    sourcePosition: z.enum(["left", "right", "top", "bottom"]).optional(),
    targetPosition: z.enum(["left", "right", "top", "bottom"]).optional(),
    width: z.number().finite().optional(),
    height: z.number().finite().optional(),
    selected: z.boolean().optional(),
    draggable: z.boolean().optional(),
    selectable: z.boolean().optional(),
    connectable: z.boolean().optional(),
    deletable: z.boolean().optional(),
    parentId: z.string().max(MAX_STRING_LENGTH).optional(),
    zIndex: z.number().int().optional(),
  })
  .passthrough();

const schemaProjectEdgeSchema = z
  .object({
    id: z.coerce.string().max(MAX_STRING_LENGTH),
    source: z.coerce.string().max(MAX_STRING_LENGTH),
    target: z.coerce.string().max(MAX_STRING_LENGTH),
    sourceHandle: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .transform((v) => (v === undefined || v === null ? v : String(v))),
    targetHandle: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .transform((v) => (v === undefined || v === null ? v : String(v))),
    type: z.string().max(MAX_STRING_LENGTH).optional(),
    animated: z.boolean().optional(),
    hidden: z.boolean().optional(),
    deletable: z.boolean().optional(),
    selectable: z.boolean().optional(),
    selected: z.boolean().optional(),
    zIndex: z.number().int().optional(),
  })
  .passthrough();

export const schemaProjectPutBodySchema = z.object({
  name: z.string().trim().max(MAX_STRING_LENGTH).optional(),
  nodes: z
    .array(schemaProjectNodeSchema)
    .max(MAX_NODES, `At most ${MAX_NODES} nodes allowed`)
    .optional(),
  edges: z
    .array(schemaProjectEdgeSchema)
    .max(MAX_EDGES, `At most ${MAX_EDGES} edges allowed`)
    .optional(),
}).refine(
  (data) =>
    data.name !== undefined || data.nodes !== undefined || data.edges !== undefined,
  { message: "Provide at least one of: name, nodes, edges" }
);

export type SchemaProjectPutBody = z.infer<typeof schemaProjectPutBodySchema>;
