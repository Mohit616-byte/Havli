"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MapPin, User as UserIcon, LogOut } from "lucide-react";
import MobileNav from "./MobileNav";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, loading, logout } = useAuth();

  const navLinks = user
    ? [
        { href: "/explore", label: "Explore" },
        { href: "/host", label: "Host a Party" },
        { href: "/profile", label: "Profile" },
      ]
    : [{ href: "/explore", label: "Explore" }];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--color-background)]/90 backdrop-blur-md border-b border-[var(--color-border)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-black text-xl tracking-tight text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors"
          >
            <span className="text-[var(--color-primary)]">●</span>
            HAVLI
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  pathname === link.href
                    ? "text-[var(--color-foreground)] bg-[var(--color-surface-2)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side — Auth aware */}
          <div className="hidden md:flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors px-3 py-2 rounded-full hover:bg-[var(--color-surface-2)]">
              <MapPin size={14} />
              <span>NCR</span>
            </button>

            {loading ? (
              <div className="w-20 h-9 bg-[var(--color-surface-2)] rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    pathname === "/profile"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-foreground)]"
                      : "border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)]"
                  }`}
                >
                  <UserIcon size={14} className="text-[var(--color-primary)]" />
                  <span>{profile?.name || user.email?.split("@")[0] || "Profile"}</span>
                </Link>
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 rounded-full text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] px-3 py-2 transition-colors"
                >
                  Login
                </Link>
                <Button href="/signup" variant="primary" size="sm">
                  Sign up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} links={navLinks} />
    </>
  );
}
