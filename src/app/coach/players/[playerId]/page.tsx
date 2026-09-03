"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatTile } from "@/components/dashboard/StatTile";
import { CategoryProfileChart } from "@/components/dashboard/CategoryProfileChart";
import { WeaknessCard } from "@/components/dashboard/WeaknessCard";
import { RepDrilldownModal } from "@/components/coach/RepDrilldownModal";
import { categoryLabel } from "@/lib/content/labels";
import { getRepository } from "@/lib/data/repository";
import type { PlayerProfile, RepRecord } from "@/lib/data/types";
import type { ScenarioCategory } from "@/lib/scenario/types";
import { formatMs } from "@/lib/utils/time";

export default function CoachPlayerDetailPage() {
  const params = useParams<{ playerId: string }>();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [allReps, setAllReps] = useState<RepRecord[]>([]);
  const [drilldownCategory, setDrilldownCategory] =
    useState<ScenarioCategory | null>(null);

  useEffect(() => {
    const repo = getRepository();
    setProfile(repo.getPlayer(params.playerId) ?? null);
    setAllReps(repo.listReps(params.playerId));
  }, [params.playerId]);

  if (!profile) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
        <PageHeader eyebrow="Coach" title="No Data" />
        <p className="text-white/50">No training data found for this player.</p>
        <Link href="/coach" className="mt-6 inline-block text-accent-bright">
          ← Back to Coach View
        </Link>
      </main>
    );
  }

  const drilldownReps = drilldownCategory
    ? allReps.filter((r) => r.category === drilldownCategory)
    : [];

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <PageHeader
        eyebrow={profile.position ?? "Player"}
        title={profile.name}
        actions={
          <Link
            href="/coach"
            className="rounded-full border border-ink-500 px-6 py-2.5 text-sm font-medium text-white/80 hover:border-accent hover:text-accent-bright"
          >
            ← Coach View
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
            Cognitive Profile — click a category to see the reps
          </div>
          <CategoryProfileChart
            profiles={profile.categoryProfiles}
            onSelectCategory={setDrilldownCategory}
          />
        </div>

        <WeaknessCard weakness={profile.weakness} />
      </div>

      {drilldownCategory && (
        <RepDrilldownModal
          title={categoryLabel(drilldownCategory)}
          reps={drilldownReps}
          onClose={() => setDrilldownCategory(null)}
        />
      )}
    </main>
  );
}
