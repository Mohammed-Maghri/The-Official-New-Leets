"use client";
import React, { useCallback, useEffect, useState } from "react";
import { ChromeDinosaur } from "./ChromeDinosaur";

const CELL_SIZE = 20;
const FRAME_HEIGHT = 10; // cells top/bottom of card
const CARD_WIDTH_CELLS = 20; // space for card in center

// Maze: frame path around the card. 1=path, 0=wall
// Grid: top frame | left + card + right | bottom frame
const getMazeCell = (x: number, y: number): boolean => {
  // Top path
  if (y === 0 || y === 1) return true;
  // Bottom path
  if (y >= FRAME_HEIGHT * 2 + 2 - 2) return true;
  // Left path
  if (x < 2) return true;
  if (x === 2 && y >= 2 && y < FRAME_HEIGHT * 2 + 2 - 2) return true;
  // Right path
  const rightEdge = 2 + CARD_WIDTH_CELLS + 2;
  if (x >= rightEdge) return true;
  if (x === rightEdge - 1 && y >= 2 && y < FRAME_HEIGHT * 2 + 2 - 2) return true;
  return false;
};

const GRID_W = 2 + CARD_WIDTH_CELLS + 2 + 2;
const GRID_H = FRAME_HEIGHT * 2 + 2;

interface MazeLandingProps {
  children: React.ReactNode;
}

const MazeLanding: React.FC<MazeLandingProps> = ({ children }) => {
  const [pos, setPos] = useState({ x: 1, y: 1 });
  const [facing, setFacing] = useState<"left" | "right">("right");

  const isValidMove = useCallback((nx: number, ny: number) => {
    if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) return false;
    return getMazeCell(nx, ny);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      let nx = pos.x;
      let ny = pos.y;
      if (e.key === "ArrowUp") ny--;
      else if (e.key === "ArrowDown") ny++;
      else if (e.key === "ArrowLeft") {
        nx--;
        setFacing("left");
      } else if (e.key === "ArrowRight") {
        nx++;
        setFacing("right");
      } else return;

      if (isValidMove(nx, ny)) {
        setPos({ x: nx, y: ny });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pos, isValidMove]);

  const mazeWidth = GRID_W * CELL_SIZE;
  const mazeHeight = GRID_H * CELL_SIZE;
  const cardOffsetX = 2 * CELL_SIZE;
  const cardOffsetY = 2 * CELL_SIZE;
  const cardAreaW = CARD_WIDTH_CELLS * CELL_SIZE;
  const cardAreaH = (GRID_H - 4) * CELL_SIZE;

  return (
    <div
      className="relative flex flex-col items-center justify-center py-8"
      style={{ fontFamily: "var(--font-pixel)" }}
    >
      {/* Maze frame with card cutout */}
      <div
        className="relative border-4 theme-border-strong overflow-hidden"
        style={{
          width: mazeWidth,
          height: mazeHeight,
          background: "rgba(15,23,42,0.95)",
          boxShadow: "6px 6px 0 var(--theme-shadow-lg), inset 0 0 30px rgba(0,0,0,0.5)",
        }}
      >
        {/* Maze cells */}
        {Array.from({ length: GRID_H }).map((_, ry) =>
          Array.from({ length: GRID_W }).map((_, rx) => {
            const isPath = getMazeCell(rx, ry);
            const isCardArea =
              rx >= 2 &&
              rx < 2 + CARD_WIDTH_CELLS &&
              ry >= 2 &&
              ry < GRID_H - 2;
            if (isCardArea) return null;
            return (
              <div
                key={`${ry}-${rx}`}
                className="absolute border border-gray-800/50"
                style={{
                  left: rx * CELL_SIZE,
                  top: ry * CELL_SIZE,
                  width: CELL_SIZE - 1,
                  height: CELL_SIZE - 1,
                  background: isPath
                    ? "rgba(51,65,85,0.5)"
                    : "rgba(15,23,42,0.98)",
                  borderColor: isPath ? "rgba(71,85,105,0.4)" : "rgba(30,41,59,0.8)",
                }}
              />
            );
          })
        )}

        {/* Card in center */}
        <div
          className="absolute z-20 flex items-center justify-center"
          style={{
            left: cardOffsetX,
            top: cardOffsetY,
            width: cardAreaW,
            height: cardAreaH,
          }}
        >
          {children}
        </div>

        {/* Dinosaur - moves in maze */}
        <div
          className="absolute z-30 transition-all duration-100 ease-out"
          style={{
            left: pos.x * CELL_SIZE + (CELL_SIZE - 48) / 2,
            top: pos.y * CELL_SIZE + (CELL_SIZE - 56) / 2,
            width: 48,
            height: 56,
            transform: facing === "left" ? "scaleX(-1)" : "none",
          }}
        >
          <ChromeDinosaur />
        </div>
      </div>

      {/* Hint */}
      <p className="mt-4 text-[10px] theme-text-muted uppercase tracking-wider">
        Use arrow keys to move
      </p>
    </div>
  );
};

export { MazeLanding };
