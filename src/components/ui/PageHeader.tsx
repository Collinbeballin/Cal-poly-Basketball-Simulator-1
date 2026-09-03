import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow?: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-ink-700 pb-6">
      <div>
        <Link
          href="/"
          className="mb-2 inline-block text-xs uppercase tracking-[0.3em] text-white/40 hover:text-accent-bright"
        >
          Cal Poly · Cognitive Simulator
        </Link>
        {eyebrow && (
          <div className="text-xs uppercase tracking-[0.2em] text-accent-bright">
            {eyebrow}
          </div>
        )}
        <h1 className="text-hud-lg font-semibold text-white">{title}</h1>
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}
