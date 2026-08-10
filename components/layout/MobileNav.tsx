"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, MapPin, User as UserIcon, LogOut } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";

type MobileNavProps = {
  isOpen: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
};

export default function MobileNav({ isOpen, onClose, links }: MobileNavProps) {
  const { user, profile, logout } = useAuth();

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-[var(--color-surface)] border-l border-[var(--color-border)] flex flex-col transition-transform duration-300 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--color-border)]">
          <Link
            href="/"
            onClick={onClose}
            className="font-black text-xl tracking-tight text-[var(--color-foreground)]"
          >
            <span className="text-[var(--color-primary)]">●</span> HAVLI
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-full hover:bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Links */}
        <nav className="flex flex-col px-4 pt-4 gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="px-4 py-3 rounded-xl text-base font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-[var(--color-foreground)] bg-[var(--color-surface-2)] transition-colors mt-2"
            >
              <UserIcon size={18} className="text-[var(--color-primary)]" />
              <span>{profile?.name || "My Profile"}</span>
            </Link>
          ) : null}
        </nav>

        {/* Bottom */}
        <div className="mt-auto px-6 pb-8 flex flex-col gap-3">
          <button className="flex items-center gap-2 text-sm text-[var(--color-muted)] px-1 py-2">
            <MapPin size={14} />
            Delhi NCR
          </button>

          {user ? (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                logout();
                onClose();
              }}
            >
              <LogOut size={16} className="inline mr-2" /> Log out
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Button href="/login" variant="secondary" fullWidth onClick={onClose}>
                Login
              </Button>
              <Button href="/signup" fullWidth onClick={onClose}>
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
