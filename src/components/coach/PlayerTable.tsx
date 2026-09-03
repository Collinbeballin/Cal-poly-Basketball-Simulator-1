"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PlayerProfile } from "@/lib/data/types";
import { formatMs } from "@/lib/utils/time";
import { categoryLabel } from "@/lib/content/labels";

type SortKey = "name" | "overallAccuracy" | "avgReactionMs" | "situationsTrained";

export function PlayerTable({ players }: { players: PlayerProfile[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("overallAccuracy");
  const [asc, setAsc] = useState(false);

  const sorted = useMemo(() => {
    const copy = [...players];
    copy.sort((a, b) => {
      let diff = 0;
      if (sortKey === "name") diff = a.name.localeCompare(b.name);
      else diff = (a[sortKey] as number) - (b[sortKey] as number);
      return asc ? diff : -diff;
    });
    return copy;
  }, [players, sortKey, asc]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setAsc(!asc);
    else {
      setSortKey(key);
      setAsc(false);
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-700 bg-ink-900/60">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wide text-white/40">
            <Th label="Player" onClick={() => toggleSort("name")} />
            <Th label="Accuracy" onClick={() => toggleSort("overallAccuracy")} align="right" />
            <Th label="Decision Time" onClick={() => toggleSort("avgReactionMs")} align="right" />
            <Th label="Reps" onClick={() => toggleSort("situationsTrained")} align="right" />
            <th className="px-5 py-3">Common Error</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr
              key={p.id}
              className="border-b border-ink-800 last:border-none hover:bg-ink-800/50"
            >
              <td className="px-5 py-3">
                <Link
                  href={`/coach/players/${p.id}`}
                  className="font-medium text-white hover:text-accent-bright"
                >
                  {p.name}
                </Link>
                {p.position && (
                  <span className="ml-2 text-xs text-white/30">{p.position}</span>
                )}
              </td>
              <td className="px-5 py-3 text-right font-mono tabular-nums text-white/80">
                {p.situationsTrained > 0 ? `${Math.round(p.overallAccuracy * 100)}%` : "—"}
              </td>
              <td className="px-5 py-3 text-right font-mono tabular-nums text-white/60">
                {p.situationsTrained > 0 ? formatMs(p.avgReactionMs) : "—"}
              </td>
              <td className="px-5 py-3 text-right font-mono tabular-nums text-white/60">
                {p.situationsTrained}
              </td>
              <td className="px-5 py-3 text-white/50">
                {p.weakness
                  ? `${categoryLabel(p.weakness.category)} (${Math.round(
                      p.weakness.accuracy * 100
                    )}%)`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  label,
  onClick,
  align = "left",
}: {
  label: string;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th
      onClick={onClick}
      className={`cursor-pointer select-none px-5 py-3 hover:text-white/70 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {label}
    </th>
  );
}
