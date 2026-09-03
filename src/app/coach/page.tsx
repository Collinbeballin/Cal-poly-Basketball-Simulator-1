"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { TeamOverview } from "@/components/coach/TeamOverview";
import { PlayerTable } from "@/components/coach/PlayerTable";
import { getRepository } from "@/lib/data/repository";
import type { TeamAggregate } from "@/lib/data/types";

export default function CoachPage() {
  const [team, setTeam] = useState<TeamAggregate | null>(null);

  useEffect(() => {
    setTeam(getRepository().getTeamAggregate());
  }, []);

  if (!team) return null;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <PageHeader eyebrow="Coach" title="Team Performance" />

      <div className="mb-10">
        <TeamOverview team={team} />
      </div>

      <div className="mb-4 text-xs uppercase tracking-[0.2em] text-white/40">
        Roster
      </div>
      <PlayerTable players={team.players} />
    </main>
  );
}
