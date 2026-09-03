"use client";

import type { RepRecord } from "@/lib/data/types";
import { formatMs } from "@/lib/utils/time";

interface RepDrilldownModalProps {
  title: string;
  reps: RepRecord[];
  onClose: () => void;
}

/** Shows the exact reps behind a selected weakness — what was shown, what
 * was chosen, what was correct, and how long it took. */
export function RepDrilldownModal({ title, reps, onClose }: RepDrilldownModalProps) {
  const sorted = [...reps].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-ink-600 bg-ink-900 p-6 shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-white/50 hover:bg-ink-800 hover:text-white"
          >
            Close
          </button>
        </div>

        {sorted.length === 0 ? (
          <p className="text-sm text-white/40">No reps recorded for this situation.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sorted.map((rep) => (
              <li
                key={rep.id}
                className={`rounded-xl border px-4 py-3 text-sm ${
                  rep.correct
                    ? "border-signal-correct/20 bg-signal-correct/5"
                    : "border-signal-incorrect/20 bg-signal-incorrect/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{rep.scenarioTitle}</span>
                  <span className="font-mono text-white/50">{formatMs(rep.reactionMs)}</span>
                </div>
                <div className="mt-1 text-white/60">
                  Chose <span className="text-white/90">{rep.chosenOptionLabel}</span>
                  {!rep.correct && (
                    <>
                      {" "}
                      — correct read was{" "}
                      <span className="text-accent-bright">{rep.correctOptionLabel}</span>
                    </>
                  )}
                </div>
                {rep.errorType && (
                  <div className="mt-1 text-xs uppercase tracking-wide text-signal-incorrect/80">
                    {rep.errorType}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
