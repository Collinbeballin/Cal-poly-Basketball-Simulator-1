import { getScenariosByCategory } from "@/lib/content";
import type { ScenarioCategory } from "@/lib/scenario/types";
import type {
  CategoryProfile,
  CommonError,
  HardestScenario,
  PlayerProfile,
  RepRecord,
  TeamAggregate,
  WeaknessSummary,
} from "@/lib/data/types";

const MIN_REPS_FOR_WEAKNESS = 3;

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function accuracyOf(reps: RepRecord[]): number {
  if (reps.length === 0) return 0;
  return reps.filter((r) => r.correct).length / reps.length;
}

export function buildCategoryProfiles(reps: RepRecord[]): CategoryProfile[] {
  const byCategory = new Map<ScenarioCategory, RepRecord[]>();
  for (const rep of reps) {
    const list = byCategory.get(rep.category) ?? [];
    list.push(rep);
    byCategory.set(rep.category, list);
  }
  return Array.from(byCategory.entries())
    .map(([category, categoryReps]) => ({
      category,
      accuracy: accuracyOf(categoryReps),
      avgReactionMs: average(categoryReps.map((r) => r.reactionMs)),
      repsCompleted: categoryReps.length,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

export function buildWeakness(
  categoryProfiles: CategoryProfile[]
): WeaknessSummary | null {
  const eligible = categoryProfiles.filter(
    (c) => c.repsCompleted >= MIN_REPS_FOR_WEAKNESS
  );
  if (eligible.length === 0) return null;

  const weakest = eligible.reduce((worst, c) =>
    c.accuracy < worst.accuracy ? c : worst
  );
  if (weakest.accuracy >= 0.8) return null;

  const recommendedScenarioIds = getScenariosByCategory(weakest.category).map(
    (s) => s.id
  );

  return {
    category: weakest.category,
    accuracy: weakest.accuracy,
    reason: `Recognizing and reading ${categoryPhrase(weakest.category)} — ${Math.round(
      weakest.accuracy * 100
    )}% correct over ${weakest.repsCompleted} reps.`,
    recommendedScenarioIds,
  };
}

function categoryPhrase(category: ScenarioCategory): string {
  return category
    .replace(/^offense-|^defense-/, "")
    .replace(/-/g, " ");
}

export function buildPlayerProfile(
  playerId: string,
  name: string,
  position: string | undefined,
  reps: RepRecord[]
): PlayerProfile {
  const categoryProfiles = buildCategoryProfiles(reps);
  return {
    id: playerId,
    name,
    position,
    overallAccuracy: accuracyOf(reps),
    avgReactionMs: average(reps.map((r) => r.reactionMs)),
    correctCount: reps.filter((r) => r.correct).length,
    incorrectCount: reps.filter((r) => !r.correct).length,
    situationsTrained: reps.length,
    categoryProfiles,
    weakness: buildWeakness(categoryProfiles),
  };
}

export function buildTeamAggregate(
  players: PlayerProfile[],
  allReps: RepRecord[]
): TeamAggregate {
  const errorCounts = new Map<string, number>();
  for (const rep of allReps) {
    if (rep.correct || !rep.errorType) continue;
    errorCounts.set(rep.errorType, (errorCounts.get(rep.errorType) ?? 0) + 1);
  }
  const commonErrors: CommonError[] = Array.from(errorCounts.entries())
    .map(([errorType, count]) => ({ errorType, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const byScenario = new Map<string, RepRecord[]>();
  for (const rep of allReps) {
    const list = byScenario.get(rep.scenarioId) ?? [];
    list.push(rep);
    byScenario.set(rep.scenarioId, list);
  }
  const hardestScenarios: HardestScenario[] = Array.from(byScenario.entries())
    .filter(([, reps]) => reps.length >= 3)
    .map(([scenarioId, reps]) => ({
      scenarioId,
      scenarioTitle: reps[0].scenarioTitle,
      accuracy: accuracyOf(reps),
      attempts: reps.length,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 6);

  return {
    teamAccuracy: accuracyOf(allReps),
    teamAvgReactionMs: average(allReps.map((r) => r.reactionMs)),
    totalReps: allReps.length,
    commonErrors,
    hardestScenarios,
    players,
  };
}
