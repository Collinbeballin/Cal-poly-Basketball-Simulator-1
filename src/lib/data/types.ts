import type { ScenarioCategory } from "@/lib/scenario/types";

export interface RosterEntry {
  id: string;
  name: string;
  position?: string;
}

export interface RepRecord {
  id: string;
  playerId: string;
  scenarioId: string;
  scenarioTitle: string;
  category: ScenarioCategory;
  chosenOptionId: string;
  chosenOptionLabel: string;
  correctOptionId: string;
  correctOptionLabel: string;
  correct: boolean;
  timedOut: boolean;
  reactionMs: number;
  difficultyAtRep: number;
  errorType?: string;
  timestamp: string; // ISO
}

export interface CategoryProfile {
  category: ScenarioCategory;
  accuracy: number; // 0-1
  avgReactionMs: number;
  repsCompleted: number;
}

export interface WeaknessSummary {
  category: ScenarioCategory;
  accuracy: number;
  reason: string;
  recommendedScenarioIds: string[];
}

export interface PlayerProfile {
  id: string;
  name: string;
  position?: string;
  overallAccuracy: number;
  avgReactionMs: number;
  correctCount: number;
  incorrectCount: number;
  situationsTrained: number;
  categoryProfiles: CategoryProfile[];
  weakness: WeaknessSummary | null;
}

export interface CommonError {
  errorType: string;
  count: number;
}

export interface HardestScenario {
  scenarioId: string;
  scenarioTitle: string;
  accuracy: number;
  attempts: number;
}

export interface TeamAggregate {
  teamAccuracy: number;
  teamAvgReactionMs: number;
  totalReps: number;
  commonErrors: CommonError[];
  hardestScenarios: HardestScenario[];
  players: PlayerProfile[];
}
