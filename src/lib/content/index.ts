import type { ScenarioCategory, ScenarioSpec } from "@/lib/scenario/types";
import { pickAndRollDrop } from "./offense-pick-and-roll";
import { pickAndPopRead } from "./offense-pick-and-pop";
import { closeoutAttackCorner } from "./offense-closeout-attack";
import { transitionTwoOnOne } from "./offense-transition";
import { driveAndKickTag } from "./offense-drive-and-kick";
import { helpRecognitionSkip } from "./offense-help-recognition";
import { postEntryFronted } from "./offense-post-entry";
import { lateClockDecision } from "./offense-late-clock";

/** Every authored scenario in the MVP — all offense, per current scope. */
export const SCENARIOS: ScenarioSpec[] = [
  pickAndRollDrop,
  pickAndPopRead,
  closeoutAttackCorner,
  transitionTwoOnOne,
  driveAndKickTag,
  helpRecognitionSkip,
  postEntryFronted,
  lateClockDecision,
];

export function getScenarioById(id: string): ScenarioSpec | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export function getScenariosByCategory(
  category: ScenarioCategory
): ScenarioSpec[] {
  return SCENARIOS.filter((s) => s.category === category);
}

export function getAllCategories(): ScenarioCategory[] {
  return Array.from(new Set(SCENARIOS.map((s) => s.category)));
}
