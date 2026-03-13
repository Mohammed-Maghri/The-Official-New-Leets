"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import ProjectNameModal from "@/component/canvas/ProjectNameModal";
import ProjectSelect from "@/component/canvas/ProjectSelect";

type Tool =
  | "hand"
  | "select"
  | "pen"
  | "eraser"
  | "rectangle"
  | "circle"
  | "line"
  | "arrow";

interface Point {
  x: number;
  y: number;
}

interface Selection {
  x: number;
  y: number;
  width: number;
  height: number;
  imageData: ImageData | null;
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ffffff",
  "#000000",
];

const TOOL_ICONS: Record<Tool, React.ReactNode> = {
  hand: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0" />
      <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-16 0v-2a2 2 0 0 1 4 0v2" />
    </svg>
  ),
  select: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M3 3l7.07 16.97 2.51-5.39 5.39-2.51L3 3z" />
    </svg>
  ),
  pen: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 15.5L13 18l5-5z" />
    </svg>
  ),
  eraser: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M20 20H7L3 16a2 2 0 0 1 0-2.83L16 1a2 2 0 0 1 2.83 0l4.17 4.17a2 2 0 0 1 0 2.83L10 20" />
    </svg>
  ),
  line: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <line x1="5" y1="19" x2="19" y2="5" />
    </svg>
  ),
  arrow: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <line x1="5" y1="19" x2="19" y2="5" />
      <polyline points="12 5 19 5 19 12" />
    </svg>
  ),
  rectangle: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  circle: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
};

const UNDO_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <path d="M3 10h10a5 5 0 0 1 5 5v2" />
    <path d="M3 10l4-4" />
    <path d="M3 10l4 4" />
  </svg>
);

const REDO_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <path d="M21 10H11a5 5 0 0 0-5 5v2" />
    <path d="M21 10l-4-4" />
    <path d="M21 10l-4 4" />
  </svg>
);

const CLEAR_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const BG_BLACK = "#000000";
const BG_WHITE = "#ffffff";

const CANVAS_SIZE = 4096;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("hand");
  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(4);
  const [boardMode, setBoardMode] = useState<"black" | "white">("black");
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [tempCanvas, setTempCanvas] = useState<ImageData | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [moveOffset, setMoveOffset] = useState<Point>({ x: 0, y: 0 });

  // Pan & zoom (tldraw-style)
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
  const spacePressed = useRef(false);

  // Projects (save/load)
  interface CanvasProject {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  }
  const [projects, setProjects] = useState<CanvasProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [authError, setAuthError] = useState(false);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => prev.slice(0, historyIndex + 1).concat(imageData));
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.putImageData(history[historyIndex - 1], 0, 0);
    setHistoryIndex((prev) => prev - 1);
    setSelection(null);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.putImageData(history[historyIndex + 1], 0, 0);
    setHistoryIndex((prev) => prev + 1);
    setSelection(null);
  }, [history, historyIndex]);

  const bgColor = boardMode === "black" ? BG_BLACK : BG_WHITE;

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSelection(null);
    saveState();
  }, [saveState, bgColor]);

  const switchBoardMode = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const oldR = boardMode === "black" ? 0 : 255;
    const oldG = boardMode === "black" ? 0 : 255;
    const oldB = boardMode === "black" ? 0 : 255;
    const newR = boardMode === "black" ? 255 : 0;
    const newG = boardMode === "black" ? 255 : 0;
    const newB = boardMode === "black" ? 255 : 0;
    const tolerance = 30;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (
        Math.abs(r - oldR) <= tolerance &&
        Math.abs(g - oldG) <= tolerance &&
        Math.abs(b - oldB) <= tolerance
      ) {
        data[i] = newR;
        data[i + 1] = newG;
        data[i + 2] = newB;
      }
    }

    const nextMode = boardMode === "black" ? "white" : "black";
    setBoardMode(nextMode);
    ctx.putImageData(imageData, 0, 0);
    saveState();
    setColor((c) => (nextMode === "white" && c === "#ffffff" ? "#000000" : c));
  }, [boardMode, saveState]);

  const getCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  }, [zoom]);

  const drawLine = useCallback(
    (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    },
    []
  );

  const drawArrow = useCallback(
    (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const len = 15;
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - len * Math.cos(angle - Math.PI / 6), end.y - len * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - len * Math.cos(angle + Math.PI / 6), end.y - len * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    },
    []
  );

  const drawRectangle = useCallback(
    (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
      const w = end.x - start.x;
      const h = end.y - start.y;
      ctx.strokeRect(start.x, start.y, w, h);
    },
    []
  );

  const drawCircle = useCallback(
    (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    },
    []
  );

  const getResizeHandle = useCallback(
    (point: Point): string | null => {
      if (!selection) return null;
      const handles: Record<string, Point> = {
        nw: { x: selection.x, y: selection.y },
        ne: { x: selection.x + selection.width, y: selection.y },
        sw: { x: selection.x, y: selection.y + selection.height },
        se: { x: selection.x + selection.width, y: selection.y + selection.height },
      };
      const threshold = 10;
      for (const [key, pos] of Object.entries(handles)) {
        if (Math.abs(point.x - pos.x) <= threshold && Math.abs(point.y - pos.y) <= threshold) return key;
      }
      return null;
    },
    [selection]
  );

  const isInsideSelection = useCallback(
    (point: Point): boolean => {
      if (!selection) return false;
      return (
        point.x >= selection.x &&
        point.x <= selection.x + selection.width &&
        point.y >= selection.y &&
        point.y <= selection.y + selection.height
      );
    },
    [selection]
  );

  useEffect(() => {
    fetch("/api/canvas-projects")
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
    if (!currentProjectId) return;
    fetch(`/api/canvas-projects/${currentProjectId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.image_data && canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0);
              setHistory([ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE)]);
              setHistoryIndex(0);
            };
            img.src = data.image_data;
          }
        }
        if (data?.board_mode) setBoardMode(data.board_mode === "white" ? "white" : "black");
        if (data?.name) setCurrentProjectName(data.name);
      })
      .catch(() => {});
  }, [currentProjectId]);

  const saveProject = useCallback(async () => {
    if (!currentProjectId || !canvasRef.current) return;
    setIsSaving(true);
    try {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const res = await fetch(`/api/canvas-projects/${currentProjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_data: dataUrl, board_mode: boardMode }),
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
  }, [currentProjectId, boardMode, currentProjectName]);

  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameModalMode, setNameModalMode] = useState<"create" | "rename">("create");

  const createProjectWithName = useCallback(
    async (name: string) => {
      setIsLoadingProjects(true);
      try {
        const res = await fetch("/api/canvas-projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        const data = await res.json();
        if (data?.id) {
          setProjects((prev) => [{ id: data.id, name: data.name, created_at: data.created_at, updated_at: data.updated_at }, ...prev]);
          setCurrentProjectId(data.id);
          setCurrentProjectName(data.name);
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
              ctx.fillStyle = boardMode === "black" ? BG_BLACK : BG_WHITE;
              ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
              setHistory([ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE)]);
              setHistoryIndex(0);
            }
          }
        }
      } finally {
        setIsLoadingProjects(false);
      }
    },
    [boardMode]
  );

  const renameProjectWithName = useCallback(
    async (name: string) => {
      if (!currentProjectId || name === currentProjectName) return;
      try {
        const res = await fetch(`/api/canvas-projects/${currentProjectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (res.ok) {
          setCurrentProjectName(name);
          setProjects((prev) =>
            prev.map((p) => (p.id === currentProjectId ? { ...p, name, updated_at: new Date().toISOString() } : p))
          );
        }
      } catch {
        /* ignore */
      }
    },
    [currentProjectId, currentProjectName]
  );

  const openCreateModal = useCallback(() => {
    setNameModalMode("create");
    setNameModalOpen(true);
  }, []);

  const openRenameModal = useCallback(() => {
    if (!currentProjectId) return;
    setNameModalMode("rename");
    setNameModalOpen(true);
  }, [currentProjectId]);

  const handleNameSubmit = useCallback(
    (name: string) => {
      if (nameModalMode === "create") createProjectWithName(name);
      else renameProjectWithName(name);
    },
    [nameModalMode, createProjectWithName, renameProjectWithName]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx.fillStyle = bgColorRef.current;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    setHistoryIndex(0);

    // Center canvas in view
    const centerPan = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      setPan({ x: (w - CANVAS_SIZE) / 2, y: (h - CANVAS_SIZE) / 2 });
    };
    centerPan();
    const ro = new ResizeObserver(centerPan);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Pan: hand tool, middle-click, or space+drag
      if (tool === "hand" || e.button === 1 || spacePressed.current) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        return;
      }
      if (e.button !== 0) return;

      const point = getCoords(e);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (tool === "select") {
        const handle = getResizeHandle(point);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          setTempCanvas(ctx.getImageData(0, 0, canvas.width, canvas.height));
          setIsDrawing(true);
        } else if (isInsideSelection(point)) {
          setIsMoving(true);
          setMoveOffset({ x: point.x - selection!.x, y: point.y - selection!.y });
          setTempCanvas(ctx.getImageData(0, 0, canvas.width, canvas.height));
          setIsDrawing(true);
        } else {
          setSelection(null);
          setTempCanvas(ctx.getImageData(0, 0, canvas.width, canvas.height));
          setStartPoint(point);
          setIsDrawing(true);
        }
      } else if (tool === "pen" || tool === "eraser") {
        setStartPoint(point);
        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.strokeStyle = tool === "eraser" ? bgColor : color;
        ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      } else {
        setTempCanvas(ctx.getImageData(0, 0, canvas.width, canvas.height));
        setStartPoint(point);
        setIsDrawing(true);
      }
    },
    [tool, color, brushSize, bgColor, pan, getCoords, getResizeHandle, isInsideSelection, selection]
  );

  const bgColorRef = useRef(bgColor);
  bgColorRef.current = bgColor;

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isPanning) {
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
        return;
      }
      if (!isDrawing || !startPoint) return;
      const point = getCoords(e);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (isResizing && selection && resizeHandle && tempCanvas) {
        ctx.putImageData(tempCanvas, 0, 0);
        let newX: number, newY: number, newW: number, newH: number;
        const { x: sx, y: sy, width: sw, height: sh } = selection;
        switch (resizeHandle) {
          case "nw":
            newW = sx + sw - point.x;
            newH = sy + sh - point.y;
            newX = newW > 0 ? point.x : sx + sw;
            newY = newH > 0 ? point.y : sy + sh;
            newW = Math.abs(newW);
            newH = Math.abs(newH);
            break;
          case "ne":
            newW = point.x - sx;
            newH = sy + sh - point.y;
            newX = sx;
            newY = newH > 0 ? point.y : sy + sh;
            newW = Math.max(2, newW);
            newH = Math.abs(newH);
            break;
          case "sw":
            newW = sx + sw - point.x;
            newH = point.y - sy;
            newX = newW > 0 ? point.x : sx + sw;
            newY = sy;
            newW = Math.abs(newW);
            newH = Math.max(2, newH);
            break;
          case "se":
            newX = sx;
            newY = sy;
            newW = Math.max(2, point.x - sx);
            newH = Math.max(2, point.y - sy);
            break;
          default:
            newX = sx;
            newY = sy;
            newW = sw;
            newH = sh;
        }
        if (newW > 2 && newH > 2 && selection.imageData) {
          const temp = document.createElement("canvas");
          temp.width = selection.width;
          temp.height = selection.height;
          const tCtx = temp.getContext("2d")!;
          tCtx.putImageData(selection.imageData, 0, 0);
          ctx.drawImage(temp, newX, newY, newW, newH);
        }
      } else if (isMoving && selection && tempCanvas) {
        ctx.putImageData(tempCanvas, 0, 0);
        const newX = point.x - moveOffset.x;
        const newY = point.y - moveOffset.y;
        if (selection.imageData) {
          ctx.putImageData(selection.imageData, newX, newY);
        }
      } else if (tool === "pen" || tool === "eraser") {
        ctx.strokeStyle = tool === "eraser" ? bgColor : color;
        ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize;
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      } else if (tempCanvas && (tool === "line" || tool === "arrow" || tool === "rectangle" || tool === "circle")) {
        ctx.putImageData(tempCanvas, 0, 0);
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        if (tool === "line") drawLine(ctx, startPoint, point);
        else if (tool === "arrow") drawArrow(ctx, startPoint, point);
        else if (tool === "rectangle") drawRectangle(ctx, startPoint, point);
        else if (tool === "circle") drawCircle(ctx, startPoint, point);
      } else if (tool === "select" && tempCanvas) {
        ctx.putImageData(tempCanvas, 0, 0);
        const w = point.x - startPoint.x;
        const h = point.y - startPoint.y;
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(startPoint.x, startPoint.y, w, h);
        ctx.setLineDash([]);
      }
    },
    [
      isDrawing,
      startPoint,
      tool,
      color,
      brushSize,
      isResizing,
      isMoving,
      selection,
      tempCanvas,
      resizeHandle,
      moveOffset,
      getCoords,
      drawLine,
      drawArrow,
      drawRectangle,
      drawCircle,
      bgColor,
      isPanning,
      panStart,
    ]
  );

  const stopDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isPanning) {
        setIsPanning(false);
        return;
      }
      if (!isDrawing) return;
      const point = getCoords(e);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (isResizing && selection && resizeHandle && tempCanvas) {
        ctx.putImageData(tempCanvas, 0, 0);
        let newX: number, newY: number, newW: number, newH: number;
        const { x: sx, y: sy, width: sw, height: sh } = selection;
        switch (resizeHandle) {
          case "nw":
            newW = sx + sw - point.x;
            newH = sy + sh - point.y;
            newX = newW > 0 ? point.x : sx + sw;
            newY = newH > 0 ? point.y : sy + sh;
            newW = Math.abs(newW);
            newH = Math.abs(newH);
            break;
          case "ne":
            newW = point.x - sx;
            newH = sy + sh - point.y;
            newX = sx;
            newY = newH > 0 ? point.y : sy + sh;
            newW = Math.max(2, newW);
            newH = Math.abs(newH);
            break;
          case "sw":
            newW = sx + sw - point.x;
            newH = point.y - sy;
            newX = newW > 0 ? point.x : sx + sw;
            newY = sy;
            newW = Math.abs(newW);
            newH = Math.max(2, newH);
            break;
          case "se":
            newX = sx;
            newY = sy;
            newW = Math.max(2, point.x - sx);
            newH = Math.max(2, point.y - sy);
            break;
          default:
            newX = sx;
            newY = sy;
            newW = sw;
            newH = sh;
        }
        if (newW > 2 && newH > 2 && selection.imageData) {
          const temp = document.createElement("canvas");
          temp.width = selection.width;
          temp.height = selection.height;
          const tCtx = temp.getContext("2d")!;
          tCtx.putImageData(selection.imageData, 0, 0);
          ctx.drawImage(temp, newX, newY, newW, newH);
          setSelection({ x: newX, y: newY, width: newW, height: newH, imageData: ctx.getImageData(newX, newY, newW, newH) });
        }
        saveState();
      } else if (isMoving && selection && tempCanvas) {
        const newX = point.x - moveOffset.x;
        const newY = point.y - moveOffset.y;
        if (selection.imageData) {
          ctx.putImageData(tempCanvas, 0, 0);
          ctx.putImageData(selection.imageData, newX, newY);
          setSelection({ ...selection, x: newX, y: newY });
        }
        saveState();
      } else if (tool === "select" && startPoint) {
        const w = point.x - startPoint.x;
        const h = point.y - startPoint.y;
        if (Math.abs(w) > 5 && Math.abs(h) > 5) {
          const x = Math.min(startPoint.x, point.x);
          const y = Math.min(startPoint.y, point.y);
          const width = Math.abs(w);
          const height = Math.abs(h);
          const imageData = ctx.getImageData(x, y, width, height);
          ctx.fillStyle = bgColor;
          ctx.fillRect(x, y, width, height);
          ctx.putImageData(imageData, x, y);
          setSelection({ x, y, width, height, imageData });
        }
        saveState();
      } else if (tool !== "pen" && tool !== "eraser" && (tool === "line" || tool === "arrow" || tool === "rectangle" || tool === "circle")) {
        saveState();
      } else if (tool === "pen" || tool === "eraser") {
        saveState();
      }

      setIsDrawing(false);
      setIsMoving(false);
      setIsResizing(false);
      setResizeHandle(null);
      setStartPoint(null);
      setTempCanvas(null);
    },
    [isDrawing, isResizing, isMoving, isPanning, tool, startPoint, selection, tempCanvas, resizeHandle, moveOffset, getCoords, saveState, bgColor]
  );

  const getCursor = useCallback((): string => {
    if (isPanning || spacePressed.current) return "grabbing";
    if (tool === "hand") return "grab";
    if (tool === "select" && selection) {
      const handle = resizeHandle;
      if (handle === "nw" || handle === "se") return "nwse-resize";
      if (handle === "ne" || handle === "sw") return "nesw-resize";
      if (isMoving) return "grabbing";
      return "grab";
    }
    if (tool === "pen" || tool === "eraser") return "crosshair";
    return "crosshair";
  }, [tool, selection, resizeHandle, isMoving, isPanning]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        spacePressed.current = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        spacePressed.current = false;
        if (isPanning) setIsPanning(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [isPanning]);

  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  zoomRef.current = zoom;
  panRef.current = pan;
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const delta = -e.deltaY * 0.002;
      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom * (1 + delta)));
      setZoom(newZoom);
      setPan({
        x: mouseX - (mouseX - currentPan.x) * (newZoom / currentZoom),
        y: mouseY - (mouseY - currentPan.y) * (newZoom / currentZoom),
      });
    };
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="relative z-10 flex flex-1 flex-col min-h-0 w-full h-full overflow-hidden" style={{ fontFamily: "var(--font-pixel)" }}>
      <ProjectNameModal
        isOpen={nameModalOpen}
        onClose={() => setNameModalOpen(false)}
        onSubmit={handleNameSubmit}
        initialValue={nameModalMode === "rename" ? currentProjectName : "tldrw"}
        title={nameModalMode === "rename" ? "Rename project" : "New project"}
      />
      {/* Canvas - full area with pan/zoom */}
      <div
        ref={containerRef}
        className="absolute inset-0 min-w-0 overflow-hidden"
        style={{ backgroundColor: boardMode === "black" ? "#000000" : "#ffffff" }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onContextMenu={(e) => e.preventDefault()}
          className="block cursor-crosshair origin-top-left"
          style={{
            cursor: getCursor(),
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
          }}
        />
        {selection && (
          <div
            className="absolute pointer-events-none border-2 border-dashed border-blue-500"
            style={{
              left: pan.x + selection.x * zoom,
              top: pan.y + selection.y * zoom,
              width: selection.width * zoom,
              height: selection.height * zoom,
            }}
          >
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500" style={{ left: 0, top: 0 }} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500" style={{ right: 0, top: 0 }} />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500" style={{ left: 0, bottom: 0 }} />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500" style={{ right: 0, bottom: 0 }} />
          </div>
        )}
      </div>

      {/* tldraw-style floating toolbar - bottom center */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-600/50 shadow-xl shadow-black/30 max-w-[calc(100vw-1rem)] overflow-x-auto"
      >
        {/* Project controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {authError && (
            <span className="text-[9px] text-amber-400 hidden sm:inline">Log in to save</span>
          )}
          <ProjectSelect
            projects={projects}
            value={currentProjectId}
            onChange={(id) => {
              setCurrentProjectId(id);
              const p = id ? projects.find((x) => x.id === id) : null;
              setCurrentProjectName(p?.name ?? "tldrw");
            }}
            disabled={isLoadingProjects}
            placeholder="tldrw"
          />
          <button
            onClick={openCreateModal}
            disabled={isLoadingProjects}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 flex-shrink-0"
            title="New canvas"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            onClick={openRenameModal}
            disabled={!currentProjectId}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 flex-shrink-0"
            title="Rename project"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={saveProject}
            disabled={!currentProjectId || isSaving}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 flex-shrink-0"
            title="Save"
          >
            {isSaving ? (
              <span className="text-[10px] animate-pulse">...</span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            )}
          </button>
        </div>

        <div className="w-px h-8 bg-slate-600/60 flex-shrink-0" />

        {/* Tools */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {(Object.keys(TOOL_ICONS) as Tool[]).map((t) => (
            <button
              key={t}
              onClick={() => setTool(t)}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all flex-shrink-0 ${
                tool === t
                  ? "bg-[var(--theme-primary)]/30 text-[var(--theme-primary)] border border-[var(--theme-primary)]/50"
                  : "text-slate-300 hover:bg-slate-700/80 hover:text-white border border-transparent"
              }`}
              title={t}
            >
              {TOOL_ICONS[t]}
            </button>
          ))}
        </div>

        <div className="w-px h-8 bg-slate-600/60 mx-1" />

        {/* Colors */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg border-2 flex-shrink-0 transition-all ${
                color === c ? "border-white ring-2 ring-white/40 scale-110" : "border-slate-600/60 hover:border-slate-500"
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg border-2 border-slate-600/60 cursor-pointer flex-shrink-0 p-0.5 bg-transparent"
          />
        </div>

        <div className="w-px h-8 bg-slate-600/60 mx-1" />

        {/* Brush size */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider hidden sm:inline">Size</span>
          <input
            type="range"
            min={1}
            max={20}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-16 sm:w-24 accent-[var(--theme-primary)]"
          />
        </div>

        <div className="w-px h-8 bg-slate-600/60 mx-1" />

        {/* Board mode */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={() => boardMode !== "black" && switchBoardMode()}
            className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all flex-shrink-0 ${
              boardMode === "black"
                ? "bg-[var(--theme-primary)]/30 border border-[var(--theme-primary)]/50"
                : "hover:bg-slate-700/80 border border-transparent"
            }`}
            title="Black board"
          >
            <div className="w-5 h-5 rounded border border-slate-500 bg-black" />
          </button>
          <button
            onClick={() => boardMode !== "white" && switchBoardMode()}
            className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all flex-shrink-0 ${
              boardMode === "white"
                ? "bg-[var(--theme-primary)]/30 border border-[var(--theme-primary)]/50"
                : "hover:bg-slate-700/80 border border-transparent"
            }`}
            title="White board"
          >
            <div className="w-5 h-5 rounded border border-slate-500 bg-white" />
          </button>
        </div>

        <div className="w-px h-8 bg-slate-600/60 mx-1" />

        {/* Zoom */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.25))}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-700/80 hover:text-white transition-all flex-shrink-0"
            title="Zoom out"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 min-w-[2rem] sm:min-w-[2.5rem] text-center truncate">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.25))}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-700/80 hover:text-white transition-all flex-shrink-0"
            title="Zoom in"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        </div>

        <div className="w-px h-8 bg-slate-600/60 mx-1" />

        {/* Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-700/80 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
            title="Undo"
          >
            {UNDO_ICON}
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-700/80 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
            title="Redo"
          >
            {REDO_ICON}
          </button>
          <button
            onClick={clearCanvas}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-500/20 transition-all flex-shrink-0"
            title="Clear"
          >
            {CLEAR_ICON}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
