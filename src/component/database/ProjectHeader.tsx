"use client";

import React, { useState } from "react";
import { AiOutlinePlus, AiOutlineSave, AiOutlineFolderOpen } from "react-icons/ai";
import { SchemaProjectSelect } from "./SchemaProjectSelect";

export interface SchemaProject {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface ProjectHeaderProps {
  projects: SchemaProject[];
  currentProjectId: number | null;
  currentProjectName: string;
  isLoading: boolean;
  isSaving: boolean;
  authError?: boolean;
  onSelectProject: (id: number) => void;
  onCreateProject: () => void;
  onSave: () => void;
  onRenameProject: (id: number, name: string) => void;
}

export function ProjectHeader({
  projects,
  currentProjectId,
  currentProjectName,
  isLoading,
  isSaving,
  authError,
  onSelectProject,
  onCreateProject,
  onSave,
  onRenameProject,
}: ProjectHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(currentProjectName);

  const handleSaveName = () => {
    const name = editName.trim().slice(0, 255) || "Untitled";
    if (currentProjectId && name !== currentProjectName) {
      onRenameProject(currentProjectId, name);
    }
    setIsEditingName(false);
  };

  return (
    <div className="flex-shrink-0 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2 px-3 sm:px-4 py-3 sm:py-3 border-b border-slate-700/60 bg-gray-950 relative z-[70]">
      {authError && (
        <span className="text-[11px] text-amber-400 order-last w-full sm:w-auto">
          Log in to save and load projects
        </span>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <AiOutlineFolderOpen className="text-slate-500 shrink-0 text-base" />
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Project
          </label>
          <SchemaProjectSelect
            projects={projects}
            value={currentProjectId}
            onChange={onSelectProject}
            disabled={isLoading}
            placeholder="Select project..."
          />
        </div>
        {currentProjectId && (
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") {
                    setEditName(currentProjectName);
                    setIsEditingName(false);
                  }
                }}
                autoFocus
                className="nodrag flex-1 min-w-0 rounded border border-slate-500 bg-slate-900 px-2 py-1.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditName(currentProjectName);
                  setIsEditingName(true);
                }}
                className="text-sm text-slate-200 hover:text-white truncate max-w-full"
                title="Click to rename"
              >
                {currentProjectName}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onCreateProject}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800 disabled:opacity-50"
        >
          <AiOutlinePlus className="text-base" />
          <span className="sm:hidden">New</span>
          <span className="hidden sm:inline">New Project</span>
        </button>
        {currentProjectId && (
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg border border-cyan-600/50 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:border-cyan-500 hover:bg-slate-800 disabled:opacity-50"
          >
            <AiOutlineSave className="text-base" />
            {isSaving ? "..." : "Save"}
          </button>
        )}
      </div>
    </div>
  );
}
