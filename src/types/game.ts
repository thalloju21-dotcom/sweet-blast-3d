export type CandyColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export type CandyAvatarId =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'cupcake_princess'
  | 'lollipop_swirl'
  | 'choco_donut'
  | 'mint_macaron'
  | 'cotton_cloud'
  | 'golden_truffle';

export type SpecialCandyType = 'none' | 'striped_h' | 'striped_v' | 'wrapped' | 'color_bomb';

export type BlockerType = 'none' | 'icing' | 'double_icing' | 'wafer_crate';

export type BoosterType =
  | 'hammer'
  | 'color_bomb'
  | 'striped_candy'
  | 'wrapped_candy'
  | 'extra_moves'
  | 'extra_life'
  | 'shuffle'
  | 'row_blast'
  | 'col_blast';

export type GameState =
  | 'SPLASH'
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'ROUND_SUMMARY'
  | 'GAME_OVER';

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'hi';

export interface CandyCell {
  id: string;
  row: number;
  col: number;
  color: CandyColor;
  special: SpecialCandyType;
  blocker: BlockerType;
  hole?: boolean; // For sculpted board masks in higher levels
  isMatched?: boolean;
  isNew?: boolean;
  dropDistance?: number;
  isChargedWrapped?: boolean; // True when a wrapped candy has completed its 1st explosion and is primed for its 2nd blast
}

export type LevelObjectiveType = 'score' | 'clear_icing' | 'collect_color' | 'hybrid';

export interface LevelObjective {
  type: LevelObjectiveType;
  targetScore: number;
  starThresholds: [number, number, number];
  targetIcingCount?: number;
  targetColor?: CandyColor;
  targetColorCount?: number;
  description: string;
}

export interface LevelConfig {
  levelNumber: number;
  chapterIndex: number;
  chapterName: string;
  moves: number;
  objective: LevelObjective;
  holeMask: boolean[][]; // 8x8 mask where true = disabled hole tile
  initialBlockers: BlockerType[][]; // 8x8 initial blocker layout
  spawnColors: CandyColor[]; // Active colors for this level (5 or 6 colors)
}

export interface BoosterInventory {
  hammer: number;
  color_bomb: number;
  striped_candy: number;
  wrapped_candy: number;
  extra_moves: number;
  extra_life: number;
  shuffle: number;
  row_blast: number;
  col_blast: number;
}

export interface GameSettings {
  music: boolean;
  sound: boolean;
  vibration: boolean;
  musicVolume: number;
  soundVolume: number;
  language: LanguageCode;
}

export interface ActiveLevelSession {
  levelNumber: number;
  grid: CandyCell[][];
  score: number;
  movesLeft: number;
  collectedColors: Record<CandyColor, number>;
  savedAt: number;
}

export interface SaveData {
  guestId: string;
  playerName: string;
  playerAvatar: CandyAvatarId;
  currentLevel: number;
  highestUnlockedLevel: number;
  coins: number;
  totalScore: number;
  highestScore: number;
  gamesPlayed: number;
  levelStars: Record<number, number>; // levelNumber -> 1 | 2 | 3
  levelHighScores: Record<number, number>;
  boosters: BoosterInventory;
  settings: GameSettings;
  dailyRewardLastClaimDate: string | null; // YYYY-MM-DD
  dailyRewardStreak: number; // 0..6
  syncedRewardIds?: string[]; // Prevents duplicate rewards during offline->online synchronization
  pendingSyncCount?: number; // Number of offline events queued for sync
  lastSyncedAt?: string | null; // ISO timestamp of last safe sync
}

export interface ParticleFX {
  id: string;
  row: number;
  col: number;
  targetRow?: number;
  targetCol?: number;
  colorHex: string;
  type: 'burst' | 'beam_h' | 'beam_v' | 'shockwave' | 'double_shockwave' | 'rainbow' | 'lightning';
}

export interface FloatingScoreFX {
  id: string;
  row: number;
  col: number;
  text: string;
  subtext?: string;
  colorHex: string;
}

export interface AdIntegrationConfig {
  enabled: boolean;
  providerName: string;
  appId: string;
  rewardedSlotId: string;
  interstitialSlotId: string;
}
