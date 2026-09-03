import { SCENARIOS } from "@/lib/content";
import type { ScenarioCategory } from "@/lib/scenario/types";
import { DEMO_PLAYER_ID, DEMO_PLAYER_NAME } from "./constants";
import { getRepository } from "./repository";
import type { RepRecord } from "./types";

type Position = "PG" | "SG" | "SF" | "PF" | "C";

interface SeedPlayerDef {
  id: string;
  name: string;
  position: Position;
  /** Base skill 0-1, drives accuracy and reaction-time distributions. */
  skill: number;
}

// Simulated roster for the demo — fictional names, not real Cal Poly
// players, since these performance numbers are synthetic.
const ROSTER: SeedPlayerDef[] = [
  { id: "sim-1", name: "J. Carter", position: "PG", skill: 0.78 },
  { id: "sim-2", name: "D. Whitfield", position: "PG", skill: 0.62 },
  { id: "sim-3", name: "M. Alonzo", position: "SG", skill: 0.72 },
  { id: "sim-4", name: "T. Reyes", position: "SG", skill: 0.58 },
  { id: "sim-5", name: "K. Boston", position: "SF", skill: 0.68 },
  { id: "sim-6", name: "A. Ferreira", position: "SF", skill: 0.6 },
  { id: "sim-7", name: "S. Okafor", position: "PF", skill: 0.71 },
  { id: "sim-8", name: "L. Petrov", position: "PF", skill: 0.55 },
  { id: "sim-9", name: "R. Hendricks", position: "C", skill: 0.73 },
  { id: "sim-10", name: "B. Mackey", position: "C", skill: 0.52 },
  { id: "sim-11", name: "N. Alvarado", position: "SG", skill: 0.65 },
  { id: "sim-12", name: "C. Deshields", position: "PF", skill: 0.6 },
];

const GUARD_CATEGORIES: ScenarioCategory[] = [
  "offense-drive-kick",
  "offense-transition",
  "offense-closeout-attack",
  "offense-late-clock",
  "offense-help-recognition",
];
const BIG_CATEGORIES: ScenarioCategory[] = [
  "offense-post-entry",
  "offense-pnr",
  "offense-pnp",
];

function positionMultiplier(
  position: Position,
  category: ScenarioCategory
): number {
  const isGuard = position === "PG" || position === "SG";
  const isBig = position === "PF" || position === "C";
  if (isGuard) {
    if (GUARD_CATEGORIES.includes(category)) return 1.18;
    if (BIG_CATEGORIES.includes(category)) return 0.82;
  }
  if (isBig) {
    if (BIG_CATEGORIES.includes(category)) return 1.18;
    if (GUARD_CATEGORIES.includes(category)) return 0.82;
  }
  return 1.0;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function jitter(range: number): number {
  return (Math.random() * 2 - 1) * range;
}

function randomRecentTimestamp(daysBack: number): string {
  const now = Date.now();
  const past = now - Math.random() * daysBack * 24 * 60 * 60 * 1000;
  return new Date(past).toISOString();
}

function generateReps(): RepRecord[] {
  const reps: RepRecord[] = [];

  for (const player of ROSTER) {
    for (const scenario of SCENARIOS) {
      const repCount = 4 + Math.floor(Math.random() * 5); // 4-8
      const mult = positionMultiplier(player.position, scenario.category);
      const baseAccuracy = clamp(player.skill * mult, 0.15, 0.95);
      const correctOption = scenario.decisionPoint.options.find(
        (o) => o.isCorrect
      )!;
      const wrongOptions = scenario.decisionPoint.options.filter(
        (o) => !o.isCorrect
      );

      for (let i = 0; i < repCount; i++) {
        const correct = Math.random() < clamp(baseAccuracy + jitter(0.08), 0.05, 0.98);
        const reactionMean = clamp(
          2350 - player.skill * 1150 + scenario.difficulty * 25,
          550,
          2400
        );
        const reactionMs = Math.round(Math.max(420, reactionMean + jitter(350)));
        const chosen = correct
          ? correctOption
          : wrongOptions[Math.floor(Math.random() * wrongOptions.length)];

        reps.push({
          id: `${player.id}-${scenario.id}-${i}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          playerId: player.id,
          scenarioId: scenario.id,
          scenarioTitle: scenario.title,
          category: scenario.category,
          chosenOptionId: chosen.id,
          chosenOptionLabel: chosen.label,
          correctOptionId: correctOption.id,
          correctOptionLabel: correctOption.label,
          correct,
          timedOut: false,
          reactionMs,
          difficultyAtRep: scenario.difficulty,
          errorType: correct ? undefined : chosen.errorType,
          timestamp: randomRecentTimestamp(21),
        });
      }
    }
  }

  return reps;
}

/** Seeds a simulated roster + rep history once, and ensures the live demo
 * player always has a roster entry so their name shows up correctly. */
export function seedDemoDataIfNeeded(): void {
  const repo = getRepository();

  repo.upsertPlayer({ id: DEMO_PLAYER_ID, name: DEMO_PLAYER_NAME });

  if (repo.isSeeded()) return;

  for (const player of ROSTER) {
    repo.upsertPlayer({
      id: player.id,
      name: player.name,
      position: player.position,
    });
  }
  repo.bulkSaveReps(generateReps());
  repo.markSeeded();
}
