import type { CameraKeyframe, Entity, EntityKeyframe } from "./types";

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, f: number): number {
  return a + (b - a) * f;
}

/**
 * Distance-derived scale: far entities (y near 100) render small, near
 * entities (y near 0) render large. Used when a keyframe doesn't specify an
 * explicit scale override.
 */
export function scaleFromDepth(y: number): number {
  return clamp(1.6 - (y / 100) * 1.35, 0.18, 1.6);
}

export interface ResolvedEntityState {
  id: string;
  kind: Entity["kind"];
  label?: string;
  number?: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  action?: EntityKeyframe["action"];
}

/**
 * Finds the two keyframes bracketing `t` and linearly interpolates between
 * them. Before the first keyframe, holds the first frame's values; after the
 * last, holds the last frame's values (clamped scenario, no extrapolation).
 */
export function resolveEntityState(
  entity: Entity,
  t: number
): ResolvedEntityState | null {
  const frames = entity.keyframes;
  if (frames.length === 0) return null;

  if (t <= frames[0].t) {
    return snapshotFromFrame(entity, frames[0]);
  }
  const last = frames[frames.length - 1];
  if (t >= last.t) {
    return snapshotFromFrame(entity, last);
  }

  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i];
    const b = frames[i + 1];
    if (t >= a.t && t <= b.t) {
      const span = b.t - a.t;
      const f = span === 0 ? 0 : (t - a.t) / span;
      const x = lerp(a.x, b.x, f);
      const y = lerp(a.y, b.y, f);
      const scale =
        b.scale !== undefined && a.scale !== undefined
          ? lerp(a.scale, b.scale, f)
          : (a.scale ?? scaleFromDepth(a.y)) * (1 - f) +
            (b.scale ?? scaleFromDepth(b.y)) * f;
      const opacity = lerp(a.opacity ?? 1, b.opacity ?? 1, f);
      // Action is a discrete cue: show the upcoming frame's action once
      // we're past the midpoint, so it reads at the moment it starts.
      const action = f < 0.5 ? a.action : b.action ?? a.action;
      return {
        id: entity.id,
        kind: entity.kind,
        label: entity.label,
        number: entity.number,
        x,
        y,
        scale,
        opacity,
        action,
      };
    }
  }
  return snapshotFromFrame(entity, last);
}

function snapshotFromFrame(
  entity: Entity,
  frame: EntityKeyframe
): ResolvedEntityState {
  return {
    id: entity.id,
    kind: entity.kind,
    label: entity.label,
    number: entity.number,
    x: frame.x,
    y: frame.y,
    scale: frame.scale ?? scaleFromDepth(frame.y),
    opacity: frame.opacity ?? 1,
    action: frame.action,
  };
}

export function resolveCameraPan(frames: CameraKeyframe[], t: number): number {
  if (frames.length === 0) return 0;
  if (t <= frames[0].t) return frames[0].panX;
  const last = frames[frames.length - 1];
  if (t >= last.t) return last.panX;
  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i];
    const b = frames[i + 1];
    if (t >= a.t && t <= b.t) {
      const span = b.t - a.t;
      const f = span === 0 ? 0 : (t - a.t) / span;
      return lerp(a.panX, b.panX, f);
    }
  }
  return last.panX;
}
