"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatTile } from "@/components/dashboard/StatTile";
import { CategoryProfileChart } from "@/components/dashboard/CategoryProfileChart";
import { WeaknessCard } from "@/components/dashboard/WeaknessCard";
import { ReactionTimeTrend } from "@/components/dashboard/ReactionTimeTrend";
import { getRepository } from "@/lib/data/repository";
import { DEMO_PLAYER_ID } from "@/lib/data/constants";
import type { PlayerProfile, RepRecord } from "@/lib/data/types";
import { formatMs } from "@/lib/utils/time";

export default function DashboardPage() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [reps, setReps] = useState<RepRecord[]>([]);

  useEffect(() => {
    const repo = getRepository();
    setProfile(repo.getPlayer(DEMO_PLAYER_ID) ?? null);
    setReps(repo.listReps(DEMO_PLAYER_ID));
  }, []);

  if (!profile || profile.situationsTrained === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
        <PageHeader eyebrow="Player" title="Your Dashboard" />
        <p className="mb-8 text-white/50">
          You haven&apos;t trained yet — complete a session to build your
          cognitive profile.
        </p>
        <Link
          href="/train"
          className="inline-block rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-ink-950 transition hover:bg-accent-bright"
        >
          Start Training
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <PageHeader
        eyebrow="Player"
        title="Your Dashboard"
        actions={
          <Link
            href="/train"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-accent-bright"
          >
            Train Again
          </Link>
        }
      />

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label="Decision Accuracy"
          value={`${Math.round(profile.overallAccuracy * 100)}%`}
        />
        <StatTile
          label="Avg Decision Time"
          value={formatMs(profile.avgReactionMs)}
        />
        <StatTile label="Correct Reads" value={String(profile.correctCount)} />
        <StatTile
          label="Situations Trained"
          value={String(profile.situationsTrained)}
        />
      </div>

      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-700 bg-ink-900/60 p-6">
          <div className="mb-4 text-xs uppercase tracking-[0.2em] text-white/40">
            Cognitive Profile
          </div>
          <CategoryProfileChart profiles={profile.categoryProfiles} />
        </div>

        <div className="flex flex-col gap-6">
          <WeaknessCard weakness={profile.weakness} />
          <div className="rounded-2xl border border-ink-700 bg-ink-900/60 p-6">
            <div className="mb-4 text-xs uppercase tracking-[0.2em] text-white/40">
              Decision Speed Trend
            </div>
            <ReactionTimeTrend reps={reps} />
          </div>
        </div>
      </div>
    </main>
  );
}
