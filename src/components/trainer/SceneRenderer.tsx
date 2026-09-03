"use client";

import { useEffect, useRef } from "react";
import { project, type ProjectionParams } from "@/lib/scenario/projection";
import type { PlaybackSnapshot } from "@/lib/scenario/player";
import type { ResolvedEntityState } from "@/lib/scenario/interpolate";
import type { ScenarioSpec } from "@/lib/scenario/types";
import { now } from "@/lib/utils/time";

interface SceneRendererProps {
  scenario: ScenarioSpec;
  snapshot: PlaybackSnapshot | null;
}

const PALETTE = {
  skyTop: "#05070a",
  skyBottom: "#0e1218",
  floor: "#3a2416",
  floorFar: "#241609",
  line: "rgba(230, 219, 189, 0.55)",
  hoopRim: "#e2622f",
  hoopBoard: "rgba(230, 236, 240, 0.85)",
  ball: "#d97b3a",
  ballSeam: "#1a1108",
  defender: "#b9c3ce",
  defenderShadow: "#5c6672",
  teammate: "#c9a24a",
  teammateShadow: "#8a7133",
  screenerRing: "rgba(201, 162, 74, 0.35)",
  handTone: "rgba(219, 190, 150, 0.9)",
};

/**
 * Canvas2D implementation of the first-person render seam. Redraws every
 * time `snapshot` changes (driven by the parent's RAF loop via
 * useScenarioPlayback). A future 3D/video renderer replaces only this
 * component — nothing else in the trainer depends on how the scene is
 * actually drawn.
 */
export function SceneRenderer({ scenario, snapshot }: SceneRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });

  // Keep the canvas backing store sized to its container.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      sizeRef.current = { width: rect.width, height: rect.height, dpr };
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Subtle handheld camera sway, decoupled from scenario keyframe data.
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const t = now();
        const swayX = Math.sin(t / 900) * 2;
        const swayY = Math.sin(t / 1400) * 1.5;
        canvas.style.transform = `translate(${swayX}px, ${swayY}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !snapshot) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height, dpr } = sizeRef.current;
    if (width === 0 || height === 0) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const horizon = 0.34;
    const params: ProjectionParams = {
      width,
      height,
      horizon,
      panInfluence: width * 0.35,
      panX: snapshot.panX,
    };

    drawSky(ctx, width, height, horizon);
    drawFloor(ctx, params);
    drawHoop(ctx, params, snapshot.entities);
    drawEntities(ctx, params, snapshot);
    drawHands(ctx, width, height, snapshot);
  }, [snapshot]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-ink-950">
      <canvas ref={canvasRef} className="block h-full w-full will-change-transform" />
    </div>
  );
}

function drawSky(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  horizon: number
) {
  const horizonY = height * horizon;
  const grad = ctx.createLinearGradient(0, 0, 0, horizonY);
  grad.addColorStop(0, PALETTE.skyTop);
  grad.addColorStop(1, PALETTE.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, horizonY);

  // Faint arena light glow above the hoop.
  const glow = ctx.createRadialGradient(
    width / 2,
    horizonY * 0.4,
    0,
    width / 2,
    horizonY * 0.4,
    width * 0.4
  );
  glow.addColorStop(0, "rgba(120,140,170,0.10)");
  glow.addColorStop(1, "rgba(120,140,170,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, horizonY);
}

function drawFloor(ctx: CanvasRenderingContext2D, params: ProjectionParams) {
  const { width, height, horizon } = params;
  const horizonY = height * horizon;

  const floorGrad = ctx.createLinearGradient(0, horizonY, 0, height);
  floorGrad.addColorStop(0, PALETTE.floorFar);
  floorGrad.addColorStop(1, PALETTE.floor);
  ctx.fillStyle = floorGrad;
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, horizonY);
  ctx.lineTo(width, horizonY);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Court markings: key/paint rectangle and a simplified three-point arc,
  // projected the same way as every other entity so they recede correctly.
  ctx.strokeStyle = PALETTE.line;
  ctx.lineWidth = 2;

  const paint = [
    project(38, 100, params),
    project(62, 100, params),
    project(62, 55, params),
    project(38, 55, params),
  ];
  strokePath(ctx, paint, true);

  const ft = [project(38, 55, params), project(62, 55, params)];
  ctx.beginPath();
  ctx.moveTo(ft[0].screenX, ft[0].screenY);
  ctx.lineTo(ft[1].screenX, ft[1].screenY);
  ctx.stroke();

  // Three-point arc, approximated with sampled points from the baseline.
  ctx.beginPath();
  const arcSamples = 24;
  for (let i = 0; i <= arcSamples; i++) {
    const a = (i / arcSamples) * Math.PI;
    const x = 50 - Math.cos(a) * 46;
    const y = 100 - Math.sin(a) * 46;
    const p = project(x, Math.max(6, y), params);
    if (i === 0) ctx.moveTo(p.screenX, p.screenY);
    else ctx.lineTo(p.screenX, p.screenY);
  }
  ctx.stroke();

  // Sideline hints.
  ctx.strokeStyle = "rgba(230, 219, 189, 0.28)";
  const left = [project(2, 100, params), project(2, 0, params)];
  const right = [project(98, 100, params), project(98, 0, params)];
  strokePath(ctx, left, false);
  strokePath(ctx, right, false);
}

function strokePath(
  ctx: CanvasRenderingContext2D,
  points: { screenX: number; screenY: number }[],
  close: boolean
) {
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.screenX, p.screenY);
    else ctx.lineTo(p.screenX, p.screenY);
  });
  if (close) ctx.closePath();
  ctx.stroke();
}

function drawHoop(
  ctx: CanvasRenderingContext2D,
  params: ProjectionParams,
  entities: ResolvedEntityState[]
) {
  const hoop = entities.find((e) => e.kind === "hoop");
  const x = hoop?.x ?? 50;
  const y = hoop?.y ?? 98;
  const p = project(x, y, params);
  const size = Math.max(6, 26 * (1 - p.depth) + 6);

  // Backboard
  ctx.fillStyle = PALETTE.hoopBoard;
  ctx.fillRect(p.screenX - size * 0.9, p.screenY - size * 1.7, size * 1.8, size * 1.1);
  // Rim
  ctx.strokeStyle = PALETTE.hoopRim;
  ctx.lineWidth = Math.max(1.5, size * 0.12);
  ctx.beginPath();
  ctx.ellipse(p.screenX, p.screenY - size * 0.55, size * 0.55, size * 0.16, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawEntities(
  ctx: CanvasRenderingContext2D,
  params: ProjectionParams,
  snapshot: PlaybackSnapshot
) {
  const drawable = snapshot.entities.filter((e) => e.kind !== "hoop");
  // Farthest first so nearer entities correctly occlude them.
  const sorted = [...drawable].sort((a, b) => b.y - a.y);

  for (const entity of sorted) {
    const p = project(entity.x, entity.y, params);
    if (entity.kind === "ball") {
      drawBall(ctx, p.screenX, p.screenY, entity);
      continue;
    }
    drawPerson(ctx, p.screenX, p.screenY, entity);
  }
}

function drawPerson(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  entity: ResolvedEntityState
) {
  const isDefender = entity.kind === "defender";
  const bodyColor = isDefender ? PALETTE.defender : PALETTE.teammate;
  const shadowColor = isDefender ? PALETTE.defenderShadow : PALETTE.teammateShadow;
  const scale = entity.scale;
  const opacity = entity.opacity;

  const height = 92 * scale;
  const width = 30 * scale;
  const headR = 11 * scale;

  ctx.save();
  ctx.globalAlpha = opacity;

  if (entity.action === "screen") {
    ctx.fillStyle = PALETTE.screenerRing;
    ctx.beginPath();
    ctx.ellipse(x, y - height * 0.3, width * 1.4, height * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + 4 * scale, width * 0.7, width * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Torso
  ctx.fillStyle = bodyColor;
  roundRect(ctx, x - width / 2, y - height, width, height * 0.72, width * 0.32);
  ctx.fill();

  // Shading
  ctx.fillStyle = shadowColor;
  ctx.globalAlpha = opacity * 0.5;
  roundRect(ctx, x, y - height, width / 2, height * 0.72, width * 0.32);
  ctx.fill();
  ctx.globalAlpha = opacity;

  // Head
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(x, y - height - headR * 0.7, headR, 0, Math.PI * 2);
  ctx.fill();

  // Jersey number
  if (entity.number != null && scale > 0.55) {
    ctx.fillStyle = "rgba(5,7,10,0.85)";
    ctx.font = `${Math.max(9, 13 * scale)}px var(--font-mono, monospace)`;
    ctx.textAlign = "center";
    ctx.fillText(String(entity.number), x, y - height * 0.55);
  }

  ctx.restore();
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  entity: ResolvedEntityState
) {
  const r = Math.max(3, 9 * entity.scale);
  ctx.save();
  ctx.globalAlpha = entity.opacity;
  ctx.fillStyle = PALETTE.ball;
  ctx.beginPath();
  ctx.arc(x, y - r, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ballSeam;
  ctx.lineWidth = Math.max(0.6, r * 0.12);
  ctx.beginPath();
  ctx.arc(x, y - r, r, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - r * 2);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.restore();
}

function drawHands(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  snapshot: PlaybackSnapshot
) {
  const ball = snapshot.entities.find((e) => e.kind === "ball");
  let opacity = 0.1;
  if (ball?.action === "dribble") opacity = 0.22;
  if (ball?.action === "catch" || ball?.action === "pass") opacity = 0.38;
  if (snapshot.phase !== "playing" && snapshot.phase !== "outcome") opacity *= 0.5;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = PALETTE.handTone;

  const handW = width * 0.16;
  const handH = height * 0.1;
  roundRect(ctx, width * 0.08, height - handH * 0.6, handW, handH, handH * 0.4);
  ctx.fill();
  roundRect(ctx, width - handW - width * 0.08, height - handH * 0.6, handW, handH, handH * 0.4);
  ctx.fill();
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
