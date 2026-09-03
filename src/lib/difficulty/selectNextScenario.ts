import { getAllCategories, getScenariosByCategory } from "@/lib/content";
import type { ScenarioCategory, ScenarioSpec } from "@/lib/scenario/types";
import {
  ELIGIBILITY_BAND,
  type CategoryStats,
  getStatOrDefault,
} from "./engine";

/**
 * Picks the next scenario to run. Weaker categories are sampled more often
 * (weighted by inverse accuracy) so a struggling player sees more
 * repetition where they need it; within a category, scenarios are filtered
 * to those near the category's current difficulty score, and immediate
 * repeats are avoided when the pool allows it.
 */
export function selectNextScenario(
  stats: CategoryStats,
  recentScenarioIds: string[],
  focusCategory?: ScenarioCategory
): ScenarioSpec {
  const category = focusCategory ?? pickWeightedCategory(stats);
  const stat = getStatOrDefault(stats, category);

  let pool = getScenariosByCategory(category).filter(
    (s) => Math.abs(s.difficulty - stat.difficulty) <= ELIGIBILITY_BAND
  );
  if (pool.length === 0) {
    pool = getScenariosByCategory(category);
  }

  const withoutRecent = pool.filter((s) => !recentScenarioIds.includes(s.id));
  const finalPool = withoutRecent.length > 0 ? withoutRecent : pool;

  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

function pickWeightedCategory(stats: CategoryStats): ScenarioCategory {
  const categories = getAllCategories();
  const weights = categories.map((c) => {
    const accuracy = getStatOrDefault(stats, c).accuracy;
    return 1 / (accuracy + 0.1);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < categories.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return categories[i];
  }
  return categories[categories.length - 1];
}
