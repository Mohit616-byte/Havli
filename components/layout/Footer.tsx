import Link from "next/link";

const FOOTER_LINKS = {
  Platform: [
    { href: "/explore", label: "Explore" },
    { href: "/host", label: "Host an event" },
    { href: "/about", label: "About Havli" },
  ],
  Support: [
    { href: "/about#safety", label: "Safety" },
    { href: "/about#how-it-works", label: "How it works" },
  ],
  Legal: [
    { href: "#", label: "Privacy" },
    { href: "#", label: "Terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-black text-xl tracking-tight text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors"
            >
              <span className="text-[var(--color-primary)]">●</span>
              HAVLI
            </Link>
            <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed max-w-xs">
              Find your people. Find your plans. Delhi NCR&apos;s social event discovery platform.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="#"
                aria-label="Instagram"
                className="p-2 rounded-full border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-border-light)] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a
                href="#"
                aria-label="Twitter / X"
                className="p-2 rounded-full border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-border-light)] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.25 2.25h6.963l4.258 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted-2)] mb-4">
                {group}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-muted-2)]">
            © {new Date().getFullYear()} Havli. All rights reserved.
          </p>
          <p className="text-xs text-[var(--color-muted-2)]">
            Delhi NCR &mdash; Gurgaon · Noida · Delhi · Greater Noida · Ghaziabad · Faridabad
          </p>
        </div>
      </div>
    </footer>
  );
}
