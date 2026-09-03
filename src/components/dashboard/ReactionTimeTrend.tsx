import type { RepRecord } from "@/lib/data/types";

export function ReactionTimeTrend({ reps }: { reps: RepRecord[] }) {
  const sorted = [...reps]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(-24);

  if (sorted.length < 2) {
    return <p className="text-sm text-white/40">Not enough reps yet for a trend.</p>;
  }

  const values = sorted.map((r) => r.reactionMs);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);

  const width = 320;
  const height = 64;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#c9a24a"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-white/40">
        <span>{(min / 1000).toFixed(2)}s fastest</span>
        <span>{(max / 1000).toFixed(2)}s slowest</span>
      </div>
    </div>
  );
}
