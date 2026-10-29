// src/app/(dashboard)/_components/ui/Panel.tsx
import type { ReactNode } from "react";

type PanelProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
  children: ReactNode;
};

export function Panel({
  title,
  description,
  action,
  compact = false,
  className = "",
  children,
}: PanelProps) {
  return (
    <section
      className={`rounded-sm border border-neutral-300 bg-white ${compact ? "p-4" : "p-5"} ${className}`}
    >
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-bold">{title}</h2>}
            {description && <p className="mt-1 text-xs text-neutral-600">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}