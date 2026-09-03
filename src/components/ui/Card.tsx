import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-ink-700 bg-ink-900/60 p-6 shadow-panel ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-white/40">
      {children}
    </div>
  );
}
