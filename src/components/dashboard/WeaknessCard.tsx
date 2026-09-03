import Link from "next/link";
import { categoryLabel } from "@/lib/content/labels";
import type { WeaknessSummary } from "@/lib/data/types";

export function WeaknessCard({ weakness }: { weakness: WeaknessSummary | null }) {
  if (!weakness) {
    return (
      <div className="rounded-2xl border border-ink-700 bg-ink-900/60 p-6">
        <div className="text-sm text-white/50">
          No clear weakness identified yet — keep training across categories to
          build a full cognitive profile.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-signal-incorrect/30 bg-signal-incorrect/5 p-6">
      <div className="mb-1 text-xs uppercase tracking-[0.2em] text-signal-incorrect">
        Biggest Weakness
      </div>
      <div className="mb-2 text-xl font-semibold text-white">
        {categoryLabel(weakness.category)}
      </div>
      <p className="mb-4 text-sm text-white/60">{weakness.reason}</p>
      <Link
        href={`/train?category=${weakness.category}`}
        className="inline-block rounded-full border border-signal-incorrect/40 px-5 py-2 text-sm font-medium text-white transition hover:bg-signal-incorrect/10"
      >
        Train this weakness
      </Link>
    </div>
  );
}
