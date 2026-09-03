/** performance.now()-based helpers for high-resolution, monotonic timing. */

export function now(): number {
  if (typeof performance !== "undefined") return performance.now();
  return Date.now();
}

export function formatMs(ms: number): string {
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatMsShort(ms: number): string {
  return `${Math.round(ms)}ms`;
}
