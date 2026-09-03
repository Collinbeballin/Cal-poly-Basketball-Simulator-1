"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createInitialRollingStat,
  difficultyToParams,
  getStatOrDefault,
  updateRollingStat,
  type CategoryStats,
  type PlaybackParams,
} from "@/lib/difficulty/engine";
import type { ScenarioCategory } from "@/lib/scenario/types";

const RECENT_SCENARIO_LIMIT = 2;

interface SimulatorStore {
  categoryStats: CategoryStats;
  recentScenarioIds: string[];
  sessionRepCount: number;

  recordDecision: (
    category: ScenarioCategory,
    correct: boolean,
    reactionMs: number
  ) => void;
  pushRecentScenario: (id: string) => void;
  getDifficultyParams: (category: ScenarioCategory) => PlaybackParams;
  getDifficultyScore: (category: ScenarioCategory) => number;
  resetSession: () => void;
}

/**
 * Cross-route session state: rolling per-category difficulty stats and the
 * active training session's rep count. Zustand rather than React context
 * because the reveal/outcome flow needs to update this immediately after
 * each rep, independent of any single component's render cycle, and the
 * state needs to survive client-side navigation between /train, /dashboard
 * and /coach. Persisted to localStorage so a refresh mid-session doesn't
 * reset difficulty back to the baseline.
 */
export const useSimulatorStore = create<SimulatorStore>()(
  persist(
    (set, get) => ({
      categoryStats: {},
      recentScenarioIds: [],
      sessionRepCount: 0,

      recordDecision: (category, correct, reactionMs) => {
        set((state) => {
          const prev = getStatOrDefault(state.categoryStats, category);
          const next = updateRollingStat(prev, correct, reactionMs);
          return {
            categoryStats: { ...state.categoryStats, [category]: next },
            sessionRepCount: state.sessionRepCount + 1,
          };
        });
      },

      pushRecentScenario: (id) => {
        set((state) => ({
          recentScenarioIds: [id, ...state.recentScenarioIds].slice(
            0,
            RECENT_SCENARIO_LIMIT
          ),
        }));
      },

      getDifficultyParams: (category) => {
        const stat = getStatOrDefault(get().categoryStats, category);
        return difficultyToParams(stat.difficulty);
      },

      getDifficultyScore: (category) => {
        return getStatOrDefault(get().categoryStats, category).difficulty;
      },

      resetSession: () => {
        set({ categoryStats: {}, recentScenarioIds: [], sessionRepCount: 0 });
      },
    }),
    {
      name: "cbcs:difficulty-store",
      partialize: (state) => ({
        categoryStats: state.categoryStats,
      }),
    }
  )
);

export { createInitialRollingStat };
