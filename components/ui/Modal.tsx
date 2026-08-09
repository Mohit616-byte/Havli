"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
};

const maxWidths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };

export default function Modal({ isOpen, onClose, title, children, maxWidth = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`relative w-full ${maxWidths[maxWidth]} bg-[var(--color-surface)] border border-[var(--color-border)] rounded-t-3xl sm:rounded-3xl shadow-[var(--shadow-card-hover)] max-h-[92svh] overflow-y-auto`}
        style={{ animation: "slideUp 0.25s ease-out" }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--color-border)]">
            <h2 id="modal-title" className="text-lg font-semibold text-[var(--color-foreground)]">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 rounded-full hover:bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors z-10"
          >
            <X size={18} />
          </button>
        )}

        <div className="px-6 pb-6 pt-4">{children}</div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes slideUp { from { opacity: 0; } to { opacity: 1; } }
        }
      `}</style>
    </div>
  );
}
