"use client";

import { type ReactNode, useEffect } from "react";

type ModalShellProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  headerLeft?: ReactNode;
  headerLeftAlignment?: "left" | "center";
  children: ReactNode;
  maxWidthClassName?: string;
};

export default function ModalShell({
  isOpen,
  onClose,
  title,
  description,
  headerLeft,
  headerLeftAlignment = "left",
  children,
  maxWidthClassName = "max-w-5xl",
}: ModalShellProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={`app-panel max-h-[90vh] w-full ${maxWidthClassName} overflow-y-auto p-5`}
        onClick={(event) => event.stopPropagation()}
      >
        {headerLeftAlignment === "center" ? (
          <div className="mb-4 relative flex min-h-10 items-center justify-center">
            <div className="w-full max-w-md">{headerLeft}</div>
            <button
              type="button"
              onClick={onClose}
              className="app-btn-ghost absolute right-0 px-3 py-2 text-xs font-medium"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex-1 pr-3">{headerLeft}</div>

            <button
              type="button"
              onClick={onClose}
              className="app-btn-ghost px-3 py-2 text-xs font-medium"
            >
              Close
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}