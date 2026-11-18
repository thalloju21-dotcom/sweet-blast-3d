import { ActiveLevelSession, BoosterType, SaveData } from '../types/game';

const STORAGE_KEY = 'sweet_blast_3d_save_v1';
const ACTIVE_SESSION_KEY = 'sweet_blast_3d_active_session_v1';
const IDB_NAME = 'sweet_blast_3d_offline_db';
const IDB_STORE = 'save_store';

export function generateGuestPlayerId(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `SB-${randomDigits}`;
}

export const DEFAULT_SAVE_DATA: SaveData = {
  guestId: 'SB-748291',
  playerName: 'Sweet Player',
  playerAvatar: 'red',
  currentLevel: 1,
  highestUnlockedLevel: 1,
  coins: 650,
  totalScore: 0,
  highestScore: 0,
  gamesPlayed: 0,
  levelStars: {},
  levelHighScores: {},
  boosters: {
    hammer: 3,
    color_bomb: 2,
    striped_candy: 2,
    wrapped_candy: 2,
    extra_moves: 2,
    extra_life: 2,
    shuffle: 3,
    row_blast: 2,
    col_blast: 2,
  },
  settings: {
    music: true,
    sound: true,
    vibration: true,
    musicVolume: 0.35,
    soundVolume: 0.75,
    language: 'en',
  },
  dailyRewardLastClaimDate: null,
  dailyRewardStreak: 0,
  syncedRewardIds: [],
  pendingSyncCount: 0,
  lastSyncedAt: null,
};

/**
 * Mirrors SaveData into IndexedDB for resilient offline persistence alongside localStorage.
 */
function writeToIndexedDB(key: string, value: unknown): void {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;
  try {
    const request = window.indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => {
      try {
        const db = request.result;
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).put(value, key);
      } catch {
        // Ignore IDB transaction errors
      }
    };
  } catch {
    // Ignore IDB access errors in restricted frames
  }
}

/**
 * Restores SaveData from IndexedDB if localStorage was ever cleared while offline.
 */
export function hydrateFromIndexedDBIfNeeded(
  onRestored: (restored: SaveData, restoredSession?: ActiveLevelSession | null) => void
): void {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;
  try {
    const request = window.indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => {
      try {
        const db = request.result;
        const tx = db.transaction(IDB_STORE, 'readonly');
        const store = tx.objectStore(IDB_STORE);
        const getReq = store.get(STORAGE_KEY);
        const getSessionReq = store.get(ACTIVE_SESSION_KEY);

        getReq.onsuccess = () => {
          const idbData = getReq.result as SaveData | undefined;
          const idbSession = getSessionReq.result as ActiveLevelSession | null | undefined;
          const localSession = loadActiveLevelSession();
          let restoredSession: ActiveLevelSession | null = null;

          if (!localSession && idbSession && idbSession.movesLeft > 0) {
            saveActiveLevelSession(idbSession);
            restoredSession = idbSession;
          }

          if (!idbData) {
            if (restoredSession) {
              onRestored(loadSaveData(), restoredSession);
            }
            return;
          }

          const currentLocal = loadSaveData();
          const hasMoreProgress =
            (idbData.highestUnlockedLevel || 1) > currentLocal.highestUnlockedLevel ||
            (idbData.totalScore || 0) > currentLocal.totalScore ||
            (idbData.dailyRewardStreak || 0) > currentLocal.dailyRewardStreak ||
            (idbData.gamesPlayed || 0) > currentLocal.gamesPlayed ||
            (idbData.syncedRewardIds?.length || 0) > (currentLocal.syncedRewardIds?.length || 0) ||
            (idbData.playerName &&
              idbData.playerName !== 'Sweet Player' &&
              currentLocal.playerName === 'Sweet Player');

          if (hasMoreProgress) {
            writeSaveData(idbData);
            onRestored(idbData, restoredSession);
          } else if (restoredSession) {
            onRestored(currentLocal, restoredSession);
          }
        };
      } catch {
        // Ignore IDB read errors
      }
    };
  } catch {
    // Ignore
  }
}

export function loadSaveData(): SaveData {
  if (typeof window === 'undefined') return DEFAULT_SAVE_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: SaveData = {
        ...DEFAULT_SAVE_DATA,
        guestId: generateGuestPlayerId(),
      };
      writeSaveData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const levelHighScores = parsed.levelHighScores || {};
    const levelStars = parsed.levelStars || {};
    const maxLevelScore = Object.values(levelHighScores).reduce(
      (max, val) => Math.max(max, val || 0),
      0
    );
    const resolvedGuestId =
      parsed.guestId && parsed.guestId.trim().length > 0
        ? parsed.guestId
        : generateGuestPlayerId();
    const resolvedName =
      !parsed.playerName || parsed.playerName === 'Sweet Master'
        ? 'Sweet Player'
        : parsed.playerName;

    const merged: SaveData = {
      ...DEFAULT_SAVE_DATA,
      ...parsed,
      guestId: resolvedGuestId,
      playerName: resolvedName,
      highestScore: Math.max(parsed.highestScore || 0, maxLevelScore),
      gamesPlayed: Math.max(
        parsed.gamesPlayed || 0,
        Object.keys(levelStars).length
      ),
      boosters: {
        ...DEFAULT_SAVE_DATA.boosters,
        ...(parsed.boosters || {}),
      },
      settings: {
        ...DEFAULT_SAVE_DATA.settings,
        ...(parsed.settings || {}),
      },
      levelStars,
      levelHighScores,
      syncedRewardIds: Array.isArray(parsed.syncedRewardIds) ? parsed.syncedRewardIds : [],
      pendingSyncCount: parsed.pendingSyncCount || 0,
      lastSyncedAt: parsed.lastSyncedAt || null,
    };

    if (!parsed.guestId) {
      writeSaveData(merged);
    }
    return merged;
  } catch {
    return DEFAULT_SAVE_DATA;
  }
}

export function writeSaveData(data: SaveData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    writeToIndexedDB(STORAGE_KEY, data);
  } catch {
    // Ignore storage quota errors
  }
}

export function resetSaveData(): SaveData {
  const fresh: SaveData = {
    ...JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA)),
    guestId: generateGuestPlayerId(),
  };
  writeSaveData(fresh);
  clearActiveLevelSession();
  return fresh;
}

/**
 * Saves the active in-progress level board state so players can resume offline or after reopening the app.
 */
export function saveActiveLevelSession(session: ActiveLevelSession): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    writeToIndexedDB(ACTIVE_SESSION_KEY, session);
  } catch {
    // Ignore quota errors
  }
}

export function loadActiveLevelSession(): ActiveLevelSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveLevelSession;
    if (
      parsed &&
      typeof parsed.levelNumber === 'number' &&
      Array.isArray(parsed.grid) &&
      parsed.grid.length === 8 &&
      parsed.movesLeft > 0
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearActiveLevelSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ACTIVE_SESSION_KEY);
    writeToIndexedDB(ACTIVE_SESSION_KEY, null);
  } catch {
    // Ignore
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function canClaimDailyReward(save: SaveData): boolean {
  const today = getTodayDateString();
  return save.dailyRewardLastClaimDate !== today;
}

export interface DailyRewardTier {
  day: number;
  title: string;
  coins: number;
  booster?: { type: BoosterType; count: number; label: string };
  specialGiftBundle?: Partial<Record<BoosterType, number>>;
  specialGiftLabel?: string;
}

export const DAILY_REWARD_TIERS: DailyRewardTier[] = [
  {
    day: 1,
    title: '100 Coins',
    coins: 100,
  },
  {
    day: 2,
    title: '150 Coins',
    coins: 150,
  },
  {
    day: 3,
    title: '200 Coins',
    coins: 200,
  },
  {
    day: 4,
    title: '1 Hammer Booster',
    coins: 0,
    booster: { type: 'hammer', count: 1, label: '1 Hammer Booster' },
  },
  {
    day: 5,
    title: '300 Coins',
    coins: 300,
  },
  {
    day: 6,
    title: '2 Colour Bomb Boosters',
    coins: 0,
    booster: { type: 'color_bomb', count: 2, label: '2 Colour Bomb Boosters' },
  },
  {
    day: 7,
    title: '500 Coins + Special Gift',
    coins: 500,
    booster: { type: 'color_bomb', count: 1, label: 'Special Gift Chest' },
    specialGiftBundle: {
      hammer: 1,
      color_bomb: 1,
      striped_candy: 1,
      wrapped_candy: 1,
      extra_moves: 1,
      extra_life: 1,
      shuffle: 1,
    },
    specialGiftLabel: 'Special Gift (+1 of Every Booster!)',
  },
];
