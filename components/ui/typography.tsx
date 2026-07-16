import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gold", className)}>
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn("mb-12 max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <h2 className="text-balance font-serif text-3xl font-semibold text-fg sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-sm leading-relaxed text-overlay/60 sm:text-base">{description}</p>}
    </div>
  );
}
