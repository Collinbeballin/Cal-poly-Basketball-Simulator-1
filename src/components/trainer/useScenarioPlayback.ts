"use client";

import { useEffect, useRef, useState } from "react";
import {
  ScenarioPlayer,
  type DecisionResult,
  type PlaybackSnapshot,
  type PlayerOptions,
} from "@/lib/scenario/player";
import type { ScenarioSpec } from "@/lib/scenario/types";
import { now } from "@/lib/utils/time";

export interface UseScenarioPlaybackOptions {
  speedMultiplier: number;
  decisionWindowMs: number | null;
  onDecision?: (result: DecisionResult) => void;
  onDone?: () => void;
}

/**
 * Drives a ScenarioPlayer with a requestAnimationFrame loop and exposes a
 * live PlaybackSnapshot to React. This is the only place the engine
 * (framework-agnostic) is wired to React — a future 3D renderer subscribes
 * to the same snapshot shape and never needs to touch ScenarioPlayer.
 */
export function useScenarioPlayback(
  scenario: ScenarioSpec,
  options: UseScenarioPlaybackOptions
) {
  const playerRef = useRef<ScenarioPlayer | null>(null);
  const rafRef = useRef<number | null>(null);
  const [snapshot, setSnapshot] = useState<PlaybackSnapshot | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const playerOptions: PlayerOptions = {
      speedMultiplier: optionsRef.current.speedMultiplier,
      decisionWindowMs: optionsRef.current.decisionWindowMs,
      onDecision: (result) => optionsRef.current.onDecision?.(result),
      onDone: () => optionsRef.current.onDone?.(),
    };
    const player = new ScenarioPlayer(scenario, playerOptions);
    playerRef.current = player;
    player.start(now());

    const loop = () => {
      const t = now();
      player.tick(t);
      setSnapshot(player.getSnapshot(t));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      playerRef.current = null;
    };
    // Re-run only when the scenario itself changes — a new rep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario]);

  const selectOption = (optionId: string) => {
    playerRef.current?.selectOption(optionId, now());
  };

  const continueToOutcome = () => {
    playerRef.current?.continueToOutcome(now());
  };

  return { snapshot, selectOption, continueToOutcome };
}
