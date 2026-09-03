import type {
  PlayerProfile,
  RepRecord,
  RosterEntry,
  TeamAggregate,
} from "./types";
import type { ScenarioCategory } from "@/lib/scenario/types";
import { LocalStorageRepository } from "./localStorageAdapter";

export interface RepFilter {
  category?: ScenarioCategory;
  scenarioId?: string;
}

/**
 * Data-access seam: nothing outside this file (and its implementations)
 * should touch localStorage/a future API directly. Swapping persistence
 * later means writing e.g. a `RestDataRepository` implementing this same
 * interface and changing the factory below — nothing else in the app
 * changes.
 */
export interface DataRepository {
  isSeeded(): boolean;
  markSeeded(): void;

  upsertPlayer(entry: RosterEntry): void;
  getRoster(): RosterEntry[];

  getPlayer(id: string): PlayerProfile | undefined;
  listPlayers(): PlayerProfile[];

  listReps(playerId: string, filter?: RepFilter): RepRecord[];
  saveRep(rep: RepRecord): void;
  bulkSaveReps(reps: RepRecord[]): void;

  getTeamAggregate(): TeamAggregate;

  /** Wipes all stored data. Used only for demo/dev reset. */
  reset(): void;
}

let cachedRepository: DataRepository | null = null;

export function getRepository(): DataRepository {
  if (!cachedRepository) {
    cachedRepository = new LocalStorageRepository();
  }
  return cachedRepository!;
}
