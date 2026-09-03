"use client";

import { useEffect } from "react";
import type { DecisionOption } from "@/lib/scenario/types";
import { formatMs } from "@/lib/utils/time";

interface RevealPanelProps {
  chosenOption: DecisionOption | null;
  correctOption: DecisionOption;
  reactionMs: number | null;
  rationale: string;
  timedOut: boolean;
  onContinue: () => void;
  autoAdvanceMs?: number;
}

/**
 * Immediate feedback the instant a read is made: correct/incorrect,
 * measured decision time, and why. Auto-advances into the outcome after a
 * beat so the loop stays fast, but a manual continue is always available.
 */
export function RevealPanel({
  chosenOption,
  correctOption,
  reactionMs,
  rationale,
  timedOut,
  onContinue,
  autoAdvanceMs = 2200,
}: RevealPanelProps) {
  const correct = chosenOption?.isCorrect ?? false;

  useEffect(() => {
    const timer = setTimeout(onContinue, autoAdvanceMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center bg-ink-950/90 px-6 backdrop-blur-hud animate-[fadein_150ms_ease-out]">
      <div className="flex w-full max-w-lg flex-col items-center gap-5 text-center">
        <span
          className={`text-hud-lg font-bold uppercase tracking-tight ${
            correct ? "text-signal-correct" : "text-signal-incorrect"
          }`}
        >
          {timedOut ? "Too Slow" : correct ? "Correct Read" : "Incorrect Read"}
        </span>

        <div className="flex items-baseline gap-2 font-mono text-white">
          <span className="text-4xl font-semibold tabular-nums">
            {reactionMs != null ? formatMs(reactionMs) : "—"}
          </span>
          <span className="text-sm uppercase tracking-wide text-white/50">
            decision time
          </span>
        </div>

        {!correct && chosenOption && (
          <p className="text-sm text-white/60">
            You chose <span className="text-white">{chosenOption.label}</span>.
          </p>
        )}
        <p className="text-base text-white/80">
          <span className="text-accent-bright">{correctOption.label}</span> —{" "}
          {rationale}
        </p>

        <button
          onClick={onContinue}
          className="mt-2 rounded-full border border-ink-500 px-6 py-2 text-sm font-medium text-white/80 transition hover:border-accent hover:text-accent-bright"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
