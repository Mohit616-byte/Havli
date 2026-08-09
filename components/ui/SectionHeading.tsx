type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  centered,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`${centered ? "text-center" : ""} ${className}`}>
      {eyebrow && (
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-primary)] mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-foreground)] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-[var(--color-muted)] max-w-xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
