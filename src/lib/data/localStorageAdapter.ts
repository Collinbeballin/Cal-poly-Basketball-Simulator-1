import { buildPlayerProfile, buildTeamAggregate } from "@/lib/utils/stats";
import type { DataRepository, RepFilter } from "./repository";
import type {
  PlayerProfile,
  RepRecord,
  RosterEntry,
  TeamAggregate,
} from "./types";

const KEYS = {
  seeded: "cbcs:seeded",
  roster: "cbcs:roster",
  reps: "cbcs:reps",
} as const;

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function read<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable (private mode, quota) — fail silently,
    // the session still works in-memory for the current page load.
  }
}

/**
 * localStorage-backed implementation of DataRepository. Namespaced keys,
 * aggregates computed on read rather than stored redundantly. This is the
 * only implementation in the MVP; a future `RestDataRepository` would
 * implement the same interface against a real API.
 */
export class LocalStorageRepository implements DataRepository {
  isSeeded(): boolean {
    return read<boolean>(KEYS.seeded, false);
  }

  markSeeded(): void {
    write(KEYS.seeded, true);
  }

  upsertPlayer(entry: RosterEntry): void {
    const roster = this.getRoster();
    const existing = roster.findIndex((p) => p.id === entry.id);
    if (existing >= 0) {
      roster[existing] = entry;
    } else {
      roster.push(entry);
    }
    write(KEYS.roster, roster);
  }

  getRoster(): RosterEntry[] {
    return read<RosterEntry[]>(KEYS.roster, []);
  }

  getPlayer(id: string): PlayerProfile | undefined {
    const roster = this.getRoster();
    const entry = roster.find((p) => p.id === id);
    const reps = this.listReps(id);
    if (!entry && reps.length === 0) return undefined;
    return buildPlayerProfile(
      id,
      entry?.name ?? id,
      entry?.position,
      reps
    );
  }

  listPlayers(): PlayerProfile[] {
    const roster = this.getRoster();
    const allReps = this.getAllReps();
    const ids = new Set(roster.map((p) => p.id));
    for (const rep of allReps) ids.add(rep.playerId);

    return Array.from(ids).map((id) => {
      const entry = roster.find((p) => p.id === id);
      const reps = allReps.filter((r) => r.playerId === id);
      return buildPlayerProfile(id, entry?.name ?? id, entry?.position, reps);
    });
  }

  private getAllReps(): RepRecord[] {
    return read<RepRecord[]>(KEYS.reps, []);
  }

  listReps(playerId: string, filter?: RepFilter): RepRecord[] {
    return this.getAllReps().filter((r) => {
      if (r.playerId !== playerId) return false;
      if (filter?.category && r.category !== filter.category) return false;
      if (filter?.scenarioId && r.scenarioId !== filter.scenarioId)
        return false;
      return true;
    });
  }

  saveRep(rep: RepRecord): void {
    const reps = this.getAllReps();
    reps.push(rep);
    write(KEYS.reps, reps);
  }

  bulkSaveReps(reps: RepRecord[]): void {
    const existing = this.getAllReps();
    write(KEYS.reps, existing.concat(reps));
  }

  getTeamAggregate(): TeamAggregate {
    const players = this.listPlayers();
    const allReps = this.getAllReps();
    return buildTeamAggregate(players, allReps);
  }

  reset(): void {
    if (!hasStorage()) return;
    window.localStorage.removeItem(KEYS.seeded);
    window.localStorage.removeItem(KEYS.roster);
    window.localStorage.removeItem(KEYS.reps);
  }
}
