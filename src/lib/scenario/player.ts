import {
  resolveCameraPan,
  resolveEntityState,
  type ResolvedEntityState,
} from "./interpolate";
import type {
  DecisionOption,
  Entity,
  OutcomeBranch,
  ScenarioCategory,
  ScenarioSpec,
} from "./types";

export type PlaybackPhase =
  | "idle"
  | "playing"
  | "frozen"
  | "revealed"
  | "outcome"
  | "done";

export interface PlaybackSnapshot {
  phase: PlaybackPhase;
  entities: ResolvedEntityState[];
  panX: number;
  chosenOption: DecisionOption | null;
  correctOption: DecisionOption;
  reactionMs: number | null;
  timedOut: boolean;
  outcome: OutcomeBranch | null;
  /** ms remaining on the decision countdown, or null if untimed. */
  countdownRemainingMs: number | null;
}

export interface DecisionResult {
  scenarioId: string;
  category: ScenarioCategory;
  chosenOptionId: string;
  correctOptionId: string;
  correct: boolean;
  reactionMs: number;
  timedOut: boolean;
}

export interface PlayerOptions {
  /** Playback speed for the pre-freeze timeline (1.0 = authored speed). */
  speedMultiplier: number;
  /** Hard cap on think time once frozen; null = untimed. */
  decisionWindowMs: number | null;
  onFrozen?: () => void;
  onDecision?: (result: DecisionResult) => void;
  onOutcomeStart?: (outcome: OutcomeBranch) => void;
  onDone?: () => void;
}

/**
 * Framework-agnostic playback engine for a single ScenarioSpec rep.
 * Owns the play -> freeze -> decide -> reveal -> outcome -> done state
 * machine and precise reaction-time measurement. No React, no DOM — a
 * `useScenarioPlayback` hook drives this from a requestAnimationFrame loop
 * and a canvas (or, later, a 3D renderer) reads `getSnapshot()`.
 */
export class ScenarioPlayer {
  readonly scenario: ScenarioSpec;
  private options: PlayerOptions;

  private phase: PlaybackPhase = "idle";
  private startPerfTime = 0;
  private decisionShownAt = 0;
  private outcomeStartPerfTime = 0;

  private chosenOption: DecisionOption | null = null;
  private reactionMs: number | null = null;
  private timedOut = false;
  private activeOutcome: OutcomeBranch | null = null;

  constructor(scenario: ScenarioSpec, options: PlayerOptions) {
    this.scenario = scenario;
    this.options = options;
  }

  getPhase(): PlaybackPhase {
    return this.phase;
  }

  updateOptions(next: Partial<PlayerOptions>) {
    this.options = { ...this.options, ...next };
  }

  start(nowMs: number) {
    this.phase = "playing";
    this.startPerfTime = nowMs;
  }

  /** Call every animation frame with performance.now(). */
  tick(nowMs: number) {
    if (this.phase === "playing") {
      const t = this.timelineT(nowMs);
      if (t >= this.scenario.decisionPoint.t) {
        this.freeze(nowMs);
      }
      return;
    }

    if (this.phase === "frozen" && this.options.decisionWindowMs != null) {
      const elapsed = nowMs - this.decisionShownAt;
      if (elapsed >= this.options.decisionWindowMs) {
        this.selectOption(null, nowMs, true);
      }
      return;
    }

    if (this.phase === "outcome" && this.activeOutcome) {
      const elapsed = nowMs - this.outcomeStartPerfTime;
      if (elapsed >= this.activeOutcome.outcomeDurationMs) {
        this.phase = "done";
        this.options.onDone?.();
      }
    }
  }

  private freeze(nowMs: number) {
    this.phase = "frozen";
    this.decisionShownAt = nowMs;
    this.options.onFrozen?.();
  }

  /**
   * Records the player's read. Pass `optionId = null` only for an
   * engine-driven timeout. reactionMs is measured as pure wall-clock time
   * since the freeze frame committed — the decision window is not affected
   * by the pre-freeze speedMultiplier.
   */
  selectOption(optionId: string | null, nowMs: number, timedOut = false) {
    if (this.phase !== "frozen") return;

    const options = this.scenario.decisionPoint.options;
    const correct = options.find((o) => o.isCorrect)!;
    const chosen = optionId ? options.find((o) => o.id === optionId) ?? null : null;

    this.chosenOption = chosen;
    this.timedOut = timedOut || !chosen;
    this.reactionMs = timedOut
      ? this.options.decisionWindowMs ?? nowMs - this.decisionShownAt
      : nowMs - this.decisionShownAt;
    this.phase = "revealed";

    this.options.onDecision?.({
      scenarioId: this.scenario.id,
      category: this.scenario.category,
      chosenOptionId: chosen?.id ?? "__timeout__",
      correctOptionId: correct.id,
      correct: chosen?.isCorrect ?? false,
      reactionMs: this.reactionMs,
      timedOut: this.timedOut,
    });
  }

  /** Advance from the reveal into the outcome playback. */
  continueToOutcome(nowMs: number) {
    if (this.phase !== "revealed") return;
    const correctOption = this.scenario.decisionPoint.options.find(
      (o) => o.isCorrect
    )!;
    const optionId = this.chosenOption?.id ?? correctOption.id;
    const branch =
      this.scenario.outcomes.find((o) => o.optionId === optionId) ??
      this.scenario.outcomes.find((o) => o.optionId === correctOption.id) ??
      this.scenario.outcomes[0] ??
      null;

    this.activeOutcome = branch;
    this.outcomeStartPerfTime = nowMs;
    this.phase = "outcome";
    if (branch) {
      this.options.onOutcomeStart?.(branch);
    } else {
      this.phase = "done";
      this.options.onDone?.();
    }
  }

  private timelineT(nowMs: number): number {
    return (nowMs - this.startPerfTime) * this.options.speedMultiplier;
  }

  getSnapshot(nowMs: number): PlaybackSnapshot {
    const correctOption = this.scenario.decisionPoint.options.find(
      (o) => o.isCorrect
    )!;

    let entities: ResolvedEntityState[];
    let panX: number;
    let countdownRemainingMs: number | null = null;

    if (this.phase === "idle") {
      entities = this.resolveAt(0);
      panX = resolveCameraPan(this.scenario.camera, 0);
    } else if (this.phase === "playing") {
      const t = this.timelineT(nowMs);
      entities = this.resolveAt(t);
      panX = resolveCameraPan(this.scenario.camera, t);
    } else if (this.phase === "frozen" || this.phase === "revealed") {
      const t = this.scenario.decisionPoint.t;
      entities = this.resolveAt(t);
      panX = resolveCameraPan(this.scenario.camera, t);
      if (this.phase === "frozen" && this.options.decisionWindowMs != null) {
        countdownRemainingMs = Math.max(
          0,
          this.options.decisionWindowMs - (nowMs - this.decisionShownAt)
        );
      }
    } else {
      // outcome | done
      const outcomeT = this.activeOutcome
        ? Math.min(
            nowMs - this.outcomeStartPerfTime,
            this.activeOutcome.outcomeDurationMs
          )
        : 0;
      entities = this.resolveOutcomeAt(outcomeT);
      panX = resolveCameraPan(
        this.scenario.camera,
        this.scenario.decisionPoint.t
      );
    }

    return {
      phase: this.phase,
      entities,
      panX,
      chosenOption: this.chosenOption,
      correctOption,
      reactionMs: this.reactionMs,
      timedOut: this.timedOut,
      outcome: this.activeOutcome,
      countdownRemainingMs,
    };
  }

  private resolveAt(t: number): ResolvedEntityState[] {
    return this.scenario.entities
      .map((e) => resolveEntityState(e, t))
      .filter((s): s is ResolvedEntityState => s !== null);
  }

  private resolveOutcomeAt(outcomeT: number): ResolvedEntityState[] {
    const branch = this.activeOutcome;
    return this.scenario.entities
      .map((entity) => {
        const continuation = branch?.continuation[entity.id];
        if (continuation && continuation.length > 0) {
          const synthetic: Entity = { ...entity, keyframes: continuation };
          return resolveEntityState(synthetic, outcomeT);
        }
        // No continuation authored for this entity: hold its frozen pose.
        return resolveEntityState(entity, this.scenario.decisionPoint.t);
      })
      .filter((s): s is ResolvedEntityState => s !== null);
  }
}
