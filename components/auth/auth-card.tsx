import Link from "next/link";

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-matte-black py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(201,162,75,0.12),transparent_55%)]" />
      <div className="relative w-full max-w-md px-4 sm:px-0">
        <div className="mb-8 text-center">
          <Link href="/" className="font-serif text-2xl font-bold text-brand-white">
            R&amp;G <span className="text-gold">SCENTS</span>
          </Link>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm sm:p-10">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">{eyebrow}</span>
          <h1 className="mt-3 font-serif text-2xl font-semibold text-brand-white sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 text-sm text-white/50">{description}</p>}
          <div className="mt-8">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-white/50">{footer}</div>}
      </div>
    </div>
  );
}
