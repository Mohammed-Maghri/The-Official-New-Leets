"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  type Node,
  type Edge,
  type OnConnect,
  type ReactFlowInstance,
  ConnectionLineType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { AiOutlineDatabase } from "react-icons/ai";
import { DatabaseTableNode } from "./nodes/DatabaseTableNode";
import { Sidebar, type TableTemplate } from "./Sidebar";
import { ProjectHeader, type SchemaProject } from "./ProjectHeader";

const nodeTypes = { databaseTable: DatabaseTableNode };

const EMPTY_NODES: Node[] = [];
const EMPTY_EDGES: Edge[] = [];

function getNextNodeId(nodes: Node[]): number {
  let max = 0;
  for (const n of nodes) {
    const num = parseInt(String(n.id), 10);
    if (!isNaN(num) && num > max) max = num;
  }
  return max + 1;
}

function CanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const nodeIdRef = useRef(1);
  const [nodes, setNodes, onNodesChange] = useNodesState(EMPTY_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(EMPTY_EDGES);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [projects, setProjects] = useState<SchemaProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    fetch("/api/schema-projects")
      .then((r) => {
        if (r.status === 401) setAuthError(true);
        return r.ok ? r.json() : { projects: [] };
      })
      .then((data) => {
        setProjects(data.projects ?? []);
        if ((data.projects?.length ?? 0) > 0) {
          const first = data.projects[0];
          setCurrentProjectId((prev) => prev ?? first.id);
          setCurrentProjectName(first.name);
        }
      })
      .catch(() => setProjects([]))
      .finally(() => setIsLoadingProjects(false));
  }, []);

  useEffect(() => {
    if (!currentProjectId) {
      setNodes(EMPTY_NODES);
      setEdges(EMPTY_EDGES);
      nodeIdRef.current = 1;
      return;
    }
    fetch(`/api/schema-projects/${currentProjectId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.nodes && data?.edges) {
          setNodes(Array.isArray(data.nodes) ? data.nodes : EMPTY_NODES);
          setEdges(Array.isArray(data.edges) ? data.edges : EMPTY_EDGES);
          nodeIdRef.current = getNextNodeId(data.nodes ?? []);
          setCurrentProjectName(data.name ?? "");
        }
      })
      .catch(() => {});
  }, [currentProjectId]);

  const saveProject = useCallback(async () => {
    if (!currentProjectId) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/schema-projects/${currentProjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === currentProjectId ? { ...p, name: currentProjectName, updated_at: new Date().toISOString() } : p
          )
        );
      }
    } finally {
      setIsSaving(false);
    }
  }, [currentProjectId, nodes, edges, currentProjectName]);

  const createProject = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const res = await fetch("/api/schema-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled Project" }),
      });
      const data = await res.json();
      if (data?.id) {
        setProjects((prev) => [{ id: data.id, name: data.name, created_at: data.created_at, updated_at: data.updated_at }, ...prev]);
        setCurrentProjectId(data.id);
        setCurrentProjectName(data.name);
        setNodes(EMPTY_NODES);
        setEdges(EMPTY_EDGES);
        nodeIdRef.current = 1;
      }
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  const selectProject = useCallback(async (id: number) => {
    if (id === currentProjectId) return;
    if (currentProjectId) {
      await fetch(`/api/schema-projects/${currentProjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges }),
      });
    }
    setCurrentProjectId(id);
    const p = projects.find((x) => x.id === id);
    if (p) setCurrentProjectName(p.name);
  }, [currentProjectId, nodes, edges, projects]);

  const renameProject = useCallback(async (id: number, name: string) => {
    const res = await fetch(`/api/schema-projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
      if (id === currentProjectId) setCurrentProjectName(name);
    }
  }, [currentProjectId]);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const templateStr = e.dataTransfer.getData("application/reactflow");
      if (!templateStr || !reactFlowInstance) return;

      const parsed = JSON.parse(templateStr) as TableTemplate;
      const position = reactFlowInstance.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      const newId = nodeIdRef.current++;
      const newNode: Node = {
        id: String(newId),
        type: "databaseTable",
        position,
        data: {
          label: parsed.label,
          schema: parsed.schema,
          columns: parsed.columns,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- template passed via dataTransfer to onDrop
  const onDragStart = useCallback((template: TableTemplate) => {
    /* no-op */
  }, []);

  const onDragEnd = useCallback(() => {
    /* no-op */
  }, []);

  const onAddTable = useCallback(() => {
    const newId = String(nodeIdRef.current++);
    const newNode: Node = {
      id: newId,
      type: "databaseTable",
      position: reactFlowInstance
        ? reactFlowInstance.screenToFlowPosition({ x: window.innerWidth / 2 - 100, y: 200 })
        : { x: 250, y: 200 },
      data: {
        label: `table_${newId}`,
        schema: "public",
        columns: [{ id: "id", name: "id", type: "SERIAL", pk: true }],
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes]);

  const onDeleteTable = useCallback(
    (nodeIdToDelete: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeIdToDelete));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeIdToDelete && e.target !== nodeIdToDelete)
      );
    },
    [setNodes, setEdges]
  );

  const onSelectTable = useCallback(
    (nodeIdToSelect: string) => {
      if (!reactFlowInstance) return;
      const node = reactFlowInstance.getNode(nodeIdToSelect);
      if (node) {
        const { x, y } = node.position;
        const width = (node.measured?.width ?? 200) / 2;
        const height = (node.measured?.height ?? 100) / 2;
        reactFlowInstance.setCenter(x + width, y + height, { duration: 300, zoom: 1 });
        setNodes((nds) =>
          nds.map((n) => ({ ...n, selected: n.id === nodeIdToSelect }))
        );
      }
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-gray-950 relative z-[50]">
      <ProjectHeader
        projects={projects}
        currentProjectId={currentProjectId}
        currentProjectName={currentProjectName}
        isLoading={isLoadingProjects}
        isSaving={isSaving}
        authError={authError}
        onSelectProject={selectProject}
        onCreateProject={createProject}
        onSave={saveProject}
        onRenameProject={renameProject}
      />
      <div className="flex flex-1 min-h-[200px] sm:min-h-0 relative z-[50]">
      <Sidebar
        nodes={nodes}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onAddTable={onAddTable}
        onDeleteTable={onDeleteTable}
        onSelectTable={onSelectTable}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {!sidebarOpen && (
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="md:hidden absolute left-2 top-2 z-[90] w-9 h-9 flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800/95 text-slate-300 hover:bg-slate-700"
        title="Open tables"
      >
        <AiOutlineDatabase className="text-lg" />
      </button>
      )}
      <div
        ref={reactFlowWrapper}
        className="database-react-flow-wrapper relative z-[40] flex-1 min-h-[280px] sm:min-h-[400px] min-w-0 w-full h-full bg-gray-950 overflow-hidden"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          nodesDraggable={true}
          nodesConnectable
          panOnDrag
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnScroll={false}
          zoomOnDoubleClick={true}
          fitView
          minZoom={0.2}
          maxZoom={2}
          preventScrolling={true}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: true,
            style: { stroke: "var(--theme-primary)", strokeWidth: 2 },
          }}
          proOptions={{ hideAttribution: true }}
          className="bg-gray-950"
        >
          <Background
            color="rgba(148, 163, 184, 0.15)"
            gap={20}
            size={1}
          />
          <Controls
            className="!bg-gray-900 !border-slate-600 !rounded-lg !shadow-lg"
            showInteractive
          />
          <MiniMap
            className="!bg-[var(--theme-bg-card)] !border-[var(--theme-border)]"
            nodeColor="#0f172a"
            maskColor="rgba(15, 23, 42, 0.8)"
          />
        </ReactFlow>
      </div>
      </div>
    </div>
  );
}

export function DatabaseCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
