"use client";

interface HudTimerProps {
  remainingMs: number;
  totalMs: number;
}

/** Shrinking countdown bar shown while the player is deciding. */
export function HudTimer({ remainingMs, totalMs }: HudTimerProps) {
  const pct = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
  const urgent = pct < 0.3;

  return (
    <div className="w-full max-w-md">
      <div className="h-1 w-full overflow-hidden rounded-full bg-ink-700">
        <div
          className={`h-full rounded-full transition-[width] duration-100 ease-linear ${
            urgent ? "bg-signal-incorrect" : "bg-accent"
          }`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}
