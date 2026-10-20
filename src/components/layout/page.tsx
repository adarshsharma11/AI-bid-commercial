import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="border-line flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-muted text-xs font-medium tracking-wide uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-ink text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-muted mt-1 max-w-3xl text-sm">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-ink text-sm font-semibold">{title}</h2>
        {description ? <p className="text-muted mt-1 text-sm">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-muted text-xs">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? <span aria-hidden>/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
