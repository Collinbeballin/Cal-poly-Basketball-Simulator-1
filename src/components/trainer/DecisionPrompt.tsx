"use client";

import type { DecisionOption } from "@/lib/scenario/types";
import { HudTimer } from "./HudTimer";

interface DecisionPromptProps {
  prompt: string;
  options: DecisionOption[];
  onSelect: (optionId: string) => void;
  countdownRemainingMs: number | null;
  decisionWindowMs: number | null;
}

/**
 * The one moment the UI takes over the screen: playback is frozen, and
 * everything else fades away except this prompt. Kept large, high-contrast,
 * and fast to scan under time pressure.
 */
export function DecisionPrompt({
  prompt,
  options,
  onSelect,
  countdownRemainingMs,
  decisionWindowMs,
}: DecisionPromptProps) {
  return (
    <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-ink-950/95 via-ink-950/50 to-transparent px-6 pb-10">
      <div className="flex w-full max-w-3xl flex-col items-center gap-6 animate-[fadein_180ms_ease-out]">
        {countdownRemainingMs != null && decisionWindowMs != null && (
          <HudTimer remainingMs={countdownRemainingMs} totalMs={decisionWindowMs} />
        )}

        <h2 className="text-hud-xl font-semibold uppercase tracking-tight text-white text-center drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
          {prompt}
        </h2>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className="group rounded-xl border border-ink-600 bg-ink-900/80 px-6 py-4 text-left text-lg font-medium text-white shadow-panel backdrop-blur-hud transition hover:border-accent hover:bg-ink-800 active:scale-[0.98]"
            >
              <span className="block text-white/90 group-hover:text-accent-bright">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
