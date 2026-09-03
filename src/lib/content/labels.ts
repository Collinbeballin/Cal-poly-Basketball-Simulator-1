import type { ScenarioCategory } from "@/lib/scenario/types";

export const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  "offense-pnr": "Pick & Roll Reads",
  "offense-pnp": "Pick & Pop Reads",
  "offense-closeout-attack": "Closeout Attacks",
  "offense-transition": "Transition",
  "offense-drive-kick": "Drive & Kick",
  "offense-help-recognition": "Help Defense Recognition",
  "offense-post-entry": "Post Entry",
  "offense-late-clock": "Late-Clock Situations",
  "offense-skip-pass": "Skip-Pass Opportunities",
  "offense-off-ball-screen": "Off-Ball Screening",
  "offense-dho": "DHO Reads",
  "defense-pnr-coverage": "Pick & Roll Coverage",
  "defense-switch": "Switching",
  "defense-drop": "Drop Coverage",
  "defense-ice": "ICE Coverage",
  "defense-tag-roller": "Tagging the Roller",
  "defense-low-man": "Low-Man Rotation",
  "defense-closeout": "Defensive Closeouts",
  "defense-help-side": "Help-Side Positioning",
  "defense-stunt": "Stunting",
  "defense-transition": "Transition Defense",
  "defense-xout": "X-Outs",
  "defense-scram-switch": "Scram Switches",
};

export function categoryLabel(category: ScenarioCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}
