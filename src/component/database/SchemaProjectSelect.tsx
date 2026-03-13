"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface SchemaProject {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface SchemaProjectSelectProps {
  projects: SchemaProject[];
  value: number | null;
  onChange: (id: number) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const truncate = (s: string, maxLen: number) =>
  s.length > maxLen ? `${s.slice(0, maxLen)}...` : s;

export function SchemaProjectSelect({
  projects,
  value,
  onChange,
  disabled = false,
  placeholder = "Select project...",
  className = "",
}: SchemaProjectSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        ref.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      )
        return;
      setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current && typeof document !== "undefined") {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        left: rect.left,
        top: rect.bottom + 4,
        width: Math.max(rect.width, 180),
        maxHeight: "12rem",
        zIndex: 2147483647,
      });
    }
  }, [isOpen]);

  const selected = projects.find((p) => p.id === value);
  const displayText = selected ? truncate(selected.name, 25) : placeholder;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen((o) => !o)}
        disabled={disabled}
        className="nodrag relative flex-1 min-w-0 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 pr-8 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none text-left truncate disabled:opacity-50"
      >
        <span className="block truncate">{displayText}</span>
        <svg
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            className="overflow-y-auto rounded-lg border border-slate-600 bg-slate-800 shadow-xl flex flex-col"
            style={dropdownStyle}
          >
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onChange(p.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm truncate hover:bg-slate-700/80 flex-shrink-0 ${
                  value === p.id ? "text-[var(--theme-primary)] bg-slate-700/50" : "text-slate-200"
                }`}
                title={p.name}
              >
                {truncate(p.name, 35)}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
