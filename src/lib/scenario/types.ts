/**
 * Core data model for a training scenario.
 *
 * A ScenarioSpec is pure data: a timeline of entity keyframes, a camera
 * timeline, and a single decision point. Nothing here knows about React,
 * canvas, or any particular renderer — that's the seam that lets a future
 * Three.js / real-video layer replace Canvas2DRenderer without touching
 * this file, ScenarioPlayer, or the training loop.
 */

export type EntityId = string;

export type EntityKind =
  | "ball"
  | "ball-handler"
  | "teammate"
  | "defender"
  | "screener"
  | "hoop";

export type EntityAction =
  | "dribble"
  | "screen"
  | "cut"
  | "closeout"
  | "pass"
  | "catch"
  | "shoot"
  | "rotate"
  | "post-up";

export interface EntityKeyframe {
  /** Milliseconds from scenario start. */
  t: number;
  /** Normalized lateral position, 0 (left sideline) - 100 (right sideline). */
  x: number;
  /** Normalized depth, 0 (at the camera) - 100 (far baseline / hoop). */
  y: number;
  /** Explicit scale override; defaults to a distance-derived value from y. */
  scale?: number;
  /** 0-1 opacity, for fade in/out (subs, screens setting/releasing). */
  opacity?: number;
  /** What the entity is doing at this instant — drives visual cues. */
  action?: EntityAction;
}

export interface Entity {
  id: EntityId;
  kind: EntityKind;
  /** Short label for dev overlays / coach film review, e.g. "PG", "Help X". */
  label?: string;
  /** Jersey number, shown small on the silhouette when present. */
  number?: number;
  keyframes: EntityKeyframe[];
}

export interface CameraKeyframe {
  t: number;
  /** -1 (look left) .. 1 (look right), biases the projection origin. */
  panX: number;
}

export interface DecisionOption {
  id: string;
  label: string;
  isCorrect: boolean;
  /** Shown on the reveal panel when this option is wrong. */
  feedback?: string;
  /** Coach-analytics label for what kind of misread this represents. */
  errorType?: string;
}

export interface DecisionPoint {
  /** ms — when playback freezes and the prompt appears. */
  t: number;
  prompt: string;
  options: DecisionOption[];
  /** Why the correct read is correct, shown on reveal. */
  rationale: string;
}

export interface OutcomeBranch {
  optionId: string;
  /** Continuation keyframes appended after the decision point, per entity. */
  continuation: Partial<Record<EntityId, EntityKeyframe[]>>;
  /** ms after the decision point this branch's continuation plays for. */
  outcomeDurationMs: number;
  resultLabel: string;
}

export type ScenarioCategory =
  // Offense — built in this MVP
  | "offense-pnr"
  | "offense-pnp"
  | "offense-closeout-attack"
  | "offense-transition"
  | "offense-drive-kick"
  | "offense-help-recognition"
  | "offense-post-entry"
  | "offense-late-clock"
  // Offense — reserved for future content
  | "offense-skip-pass"
  | "offense-off-ball-screen"
  | "offense-dho"
  // Defense — reserved for future content, not authored in this MVP
  | "defense-pnr-coverage"
  | "defense-switch"
  | "defense-drop"
  | "defense-ice"
  | "defense-tag-roller"
  | "defense-low-man"
  | "defense-closeout"
  | "defense-help-side"
  | "defense-stunt"
  | "defense-transition"
  | "defense-xout"
  | "defense-scram-switch";

export const OFFENSE_CATEGORIES: ScenarioCategory[] = [
  "offense-pnr",
  "offense-pnp",
  "offense-closeout-attack",
  "offense-transition",
  "offense-drive-kick",
  "offense-help-recognition",
  "offense-post-entry",
  "offense-late-clock",
];

export interface ScenarioSpec {
  id: string;
  title: string;
  category: ScenarioCategory;
  side: "offense" | "defense";
  /** Base difficulty 1-10, used by the adaptive engine's eligibility band. */
  difficulty: number;
  /** Full playback length (ms) before the decision point, informational. */
  durationMs: number;
  entities: Entity[];
  camera: CameraKeyframe[];
  decisionPoint: DecisionPoint;
  outcomes: OutcomeBranch[];
  tags?: string[];
}
