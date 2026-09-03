/**
 * Perspective projection: maps normalized court coordinates (x: 0-100
 * lateral, y: 0-100 depth) to screen pixels, simulating a ground plane
 * receding toward a horizon. This is the one piece of "3D-ish" math the
 * Canvas2D renderer needs — a future Three.js renderer replaces the whole
 * SceneRenderer component and doesn't need this file at all.
 */

export interface ProjectionParams {
  width: number;
  height: number;
  /** Horizon as a fraction of height, e.g. 0.34. */
  horizon: number;
  /** Extra horizontal bias from camera pan, in normalized x units (-1..1 * this). */
  panInfluence: number;
  panX: number;
}

export interface ScreenPoint {
  screenX: number;
  screenY: number;
  /** 0 (far/horizon) - 1 (near/bottom), useful for occlusion/size cues. */
  depth: number;
}

/**
 * y=0 sits at the camera (bottom of viewport, wide field of view).
 * y=100 sits at the horizon (top band, converged toward center).
 */
export function project(
  x: number,
  y: number,
  params: ProjectionParams
): ScreenPoint {
  const { width, height, horizon, panInfluence, panX } = params;
  const depth = clamp01(1 - y / 100); // 1 = near, 0 = far
  const horizonY = height * horizon;

  // Vertical: near depth maps to the bottom of the canvas, far depth to the
  // horizon line. Ease so movement close to the camera reads faster than
  // movement near the horizon (perspective compression).
  const verticalT = Math.pow(depth, 0.72);
  const screenY = horizonY + (height - horizonY) * verticalT;

  // Horizontal: field of view narrows toward the horizon. At depth=1 the
  // full width is usable; at depth=0 everything converges near center.
  const halfWidthAtDepth = (width / 2) * (0.15 + 0.85 * verticalT);
  const centerX = width / 2 + panX * panInfluence * (1 - verticalT);
  const normalizedX = (x - 50) / 50; // -1..1
  const screenX = centerX + normalizedX * halfWidthAtDepth;

  return { screenX, screenY, depth };
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
