import type { ScenarioCategory } from "@/lib/scenario/types";

/** Rolling per-category performance used to drive adaptive difficulty. */
export interface RollingStat {
  /** Exponential moving average of correctness, 0-1. */
  accuracy: number;
  /** Exponential moving average of reaction time, ms. */
  avgReactionMs: number;
  /** Consecutive-correct count when positive, consecutive-incorrect when negative. */
  streak: number;
  sampleCount: number;
  /** Difficulty score, 1 (easiest) - 10 (hardest). */
  difficulty: number;
}

const EMA_ALPHA = 0.25;
const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 10;

export function createInitialRollingStat(): RollingStat {
  return {
    accuracy: 0.6,
    avgReactionMs: 1800,
    streak: 0,
    sampleCount: 0,
    difficulty: 3,
  };
}

/**
 * Folds one rep's result into a category's rolling stat and applies the
 * adaptive difficulty rule:
 *  - accuracy >= 0.80 with a streak >= 3 correct -> difficulty +1 (capped),
 *    then the streak resets so the next bump requires a fresh run.
 *  - accuracy < 0.55, or two straight misses -> difficulty -1 (floored).
 *  - otherwise unchanged.
 */
export function updateRollingStat(
  prev: RollingStat,
  correct: boolean,
  reactionMs: number
): RollingStat {
  const accuracy = prev.accuracy * (1 - EMA_ALPHA) + (correct ? 1 : 0) * EMA_ALPHA;
  const avgReactionMs =
    prev.sampleCount === 0
      ? reactionMs
      : prev.avgReactionMs * (1 - EMA_ALPHA) + reactionMs * EMA_ALPHA;
  const streak = correct
    ? Math.max(1, prev.streak + 1)
    : Math.min(-1, prev.streak - 1);
  const sampleCount = prev.sampleCount + 1;

  let difficulty = prev.difficulty;
  let nextStreak = streak;
  if (accuracy >= 0.8 && streak >= 3) {
    difficulty = Math.min(MAX_DIFFICULTY, difficulty + 1);
    nextStreak = 0;
  } else if (accuracy < 0.55 || streak <= -2) {
    difficulty = Math.max(MIN_DIFFICULTY, difficulty - 1);
  }

  return {
    accuracy,
    avgReactionMs,
    streak: nextStreak,
    sampleCount,
    difficulty,
  };
}

export interface PlaybackParams {
  speedMultiplier: number;
  decisionWindowMs: number;
}

/** Maps a 1-10 difficulty score to concrete scenario-playback parameters. */
export function difficultyToParams(difficulty: number): PlaybackParams {
  const d = clamp(difficulty, MIN_DIFFICULTY, MAX_DIFFICULTY);
  const speedMultiplier = 0.85 + d * 0.045;
  const decisionWindowMs = clamp(3200 - d * 180, 1400, 3000);
  return { speedMultiplier, decisionWindowMs };
}

/** How far a scenario's base difficulty may sit from the current score and still be eligible for selection. */
export const ELIGIBILITY_BAND = 3;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export type CategoryStats = Partial<Record<ScenarioCategory, RollingStat>>;

export function getStatOrDefault(
  stats: CategoryStats,
  category: ScenarioCategory
): RollingStat {
  return stats[category] ?? createInitialRollingStat();
}
