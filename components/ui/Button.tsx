import Link from "next/link";

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  fullWidth?: boolean;
};

const base =
  "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed select-none";

const variants = {
  primary:
    "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white active:scale-[0.98] shadow-[0_0_20px_rgba(255,79,31,0.3)] hover:shadow-[0_0_28px_rgba(255,79,31,0.45)]",
  secondary:
    "bg-[var(--color-surface-2)] hover:bg-[var(--color-border-light)] text-[var(--color-foreground)] border border-[var(--color-border)] active:scale-[0.98]",
  ghost:
    "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)] active:scale-[0.98]",
  outline:
    "border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] active:scale-[0.98]",
};

const sizes = {
  sm: "text-sm px-4 py-2 rounded-full gap-1.5",
  md: "text-sm px-5 py-2.5 rounded-full gap-2",
  lg: "text-base px-7 py-3.5 rounded-full gap-2.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  href,
  children,
  className = "",
  onClick,
  type = "button",
  disabled,
  fullWidth,
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
