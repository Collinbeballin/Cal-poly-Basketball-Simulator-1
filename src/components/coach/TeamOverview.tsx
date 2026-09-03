import { StatTile } from "@/components/dashboard/StatTile";
import type { TeamAggregate } from "@/lib/data/types";
import { formatMs } from "@/lib/utils/time";

export function TeamOverview({ team }: { team: TeamAggregate }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label="Team Decision Accuracy"
          value={`${Math.round(team.teamAccuracy * 100)}%`}
        />
        <StatTile
          label="Avg Decision Speed"
          value={formatMs(team.teamAvgReactionMs)}
        />
        <StatTile label="Total Reps Logged" value={String(team.totalReps)} />
        <StatTile label="Players Tracked" value={String(team.players.length)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-700 bg-ink-900/60 p-6">
          <div className="mb-4 text-xs uppercase tracking-[0.2em] text-white/40">
            Most Common Errors
          </div>
          {team.commonErrors.length === 0 ? (
            <p className="text-sm text-white/40">No errors logged yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {team.commonErrors.map((e) => (
                <li key={e.errorType} className="flex items-center justify-between text-sm">
                  <span className="text-white/80">{e.errorType}</span>
                  <span className="font-mono text-white/40">{e.count}×</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-ink-700 bg-ink-900/60 p-6">
          <div className="mb-4 text-xs uppercase tracking-[0.2em] text-white/40">
            Most Difficult Situations
          </div>
          {team.hardestScenarios.length === 0 ? (
            <p className="text-sm text-white/40">Not enough data yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {team.hardestScenarios.map((s) => (
                <li key={s.scenarioId} className="flex items-center justify-between text-sm">
                  <span className="text-white/80">{s.scenarioTitle}</span>
                  <span className="font-mono text-signal-incorrect">
                    {Math.round(s.accuracy * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
