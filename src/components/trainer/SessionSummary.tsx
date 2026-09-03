"use client";

import Link from "next/link";
import { formatMs } from "@/lib/utils/time";

interface SessionSummaryProps {
  repsCompleted: number;
  correctCount: number;
  avgReactionMs: number;
  onTrainAgain: () => void;
}

export function SessionSummary({
  repsCompleted,
  correctCount,
  avgReactionMs,
  onTrainAgain,
}: SessionSummaryProps) {
  const accuracy = repsCompleted > 0 ? correctCount / repsCompleted : 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 text-center">
      <span className="mb-2 text-xs uppercase tracking-[0.3em] text-white/40">
        Session Complete
      </span>
      <h1 className="text-hud-xl font-semibold text-white">
        {Math.round(accuracy * 100)}%
      </h1>
      <p className="mb-10 text-white/50">decision accuracy this session</p>

      <div className="mb-12 grid w-full max-w-md grid-cols-2 gap-4 text-left">
        <Stat label="Reps trained" value={String(repsCompleted)} />
        <Stat label="Avg decision time" value={formatMs(avgReactionMs)} />
        <Stat label="Correct reads" value={String(correctCount)} />
        <Stat label="Missed reads" value={String(repsCompleted - correctCount)} />
      </div>

      <div className="flex gap-4">
        <button
          onClick={onTrainAgain}
          className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-ink-950 transition hover:bg-accent-bright"
        >
          Train Again
        </button>
        <Link
          href="/dashboard"
          className="rounded-full border border-ink-500 px-8 py-3 text-sm font-medium text-white/80 transition hover:border-accent hover:text-accent-bright"
        >
          View Dashboard
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900 px-5 py-4">
      <div className="text-2xl font-semibold tabular-nums text-white">{value}</div>
      <div className="text-xs uppercase tracking-wide text-white/40">{label}</div>
    </div>
  );
}
