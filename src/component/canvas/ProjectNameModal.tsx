"use client";
import { XPDialogTitle } from "../xp/XPDialogTitle";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ProjectNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialValue?: string;
  title?: string;
}

export default function ProjectNameModal({
  isOpen,
  onClose,
  onSubmit,
  initialValue = "tldrw",
  title = "Project name",
}: ProjectNameModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) setValue(initialValue);
  }, [isOpen, initialValue]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim().slice(0, 255) || "tldrw";
      onSubmit(trimmed);
      onClose();
    },
    [value, onSubmit, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60  z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="xp-dialog xp-dialog-padded bg-[#f5f3e9] p-6 w-full max-w-sm"
        >
          <XPDialogTitle title={title} onClose={onClose} />
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="tldrw"
              autoFocus
              className="rounded-lg border border-[#a0a6b0] bg-[#e2dfd0] px-3 py-2 text-sm text-[#3e3d35] placeholder-neutral-500 focus:border-[var(--theme-primary)] focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-[#3e3d35] hover:text-[#3e3d35] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border border-[var(--theme-primary)]/50 hover:bg-[var(--theme-primary)]/30 transition-colors"
              >
                OK
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
