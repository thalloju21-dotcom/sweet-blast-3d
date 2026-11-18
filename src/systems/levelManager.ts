import { BlockerType, CandyColor, LevelConfig, LevelObjectiveType } from '../types/game';

export const TOTAL_LEVELS = 1000;

export const CHAPTER_NAMES = [
  'Caramel Valley',
  'Peppermint Peaks',
  'Berry Glaze Harbor',
  'Citron Conservatory',
  'Velvet Ganache Citadel',
  'Spun Gold Observatory',
  'Praline Clockwork',
  'Cinnamon Ember Forge',
  'Starlight Macaron Isles',
  'Grand Confectionery Crown',
];

const ALL_COLORS: CandyColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

const COLOR_DISPLAY_NAMES: Record<CandyColor, string> = {
  red: 'Red Jelly Beans',
  blue: 'Blue Round Candies',
  green: 'Green Jelly Squares',
  yellow: 'Yellow Teardrops',
  purple: 'Purple Clusters',
  orange: 'Orange Lozenges',
};

// Deterministic pseudo-random helper for level layout generation
function seededValue(level: number, salt: number): number {
  const x = Math.sin(level * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function buildEmptyMask(): boolean[][] {
  return Array.from({ length: 8 }, () => Array(8).fill(false));
}

function buildEmptyBlockers(): BlockerType[][] {
  return Array.from({ length: 8 }, () => Array(8).fill('none'));
}

export function getLevelConfig(levelNumber: number): LevelConfig {
  const clamped = Math.max(1, Math.min(TOTAL_LEVELS, Math.floor(levelNumber)));
  const chapterIndex = Math.min(9, Math.floor((clamped - 1) / 100));
  const chapterName = CHAPTER_NAMES[chapterIndex];

  const holeMask = buildEmptyMask();
  const initialBlockers = buildEmptyBlockers();

  // Sculpted board geometry based on level pattern (keep early levels 1-4 full 8x8 for easy onboarding)
  if (clamped >= 5) {
    const layoutVariant = (clamped * 7 + chapterIndex * 3) % 8;
    if (layoutVariant === 1) {
      // clipped corners
      holeMask[0][0] = true;
      holeMask[0][7] = true;
      holeMask[7][0] = true;
      holeMask[7][7] = true;
    } else if (layoutVariant === 2) {
      // deep diamond corners
      const corners = [
        [0, 0], [0, 1], [1, 0],
        [0, 6], [0, 7], [1, 7],
        [6, 0], [7, 0], [7, 1],
        [6, 7], [7, 6], [7, 7],
      ];
      corners.forEach(([r, c]) => { holeMask[r][c] = true; });
    } else if (layoutVariant === 3) {
      // side notches (hourglass waist)
      holeMask[3][0] = true;
      holeMask[4][0] = true;
      holeMask[3][7] = true;
      holeMask[4][7] = true;
    } else if (layoutVariant === 4) {
      // center fountain pillars
      holeMask[3][3] = true;
      holeMask[4][4] = true;
    } else if (layoutVariant === 5) {
      // top & bottom arches
      holeMask[0][3] = true;
      holeMask[0][4] = true;
      holeMask[7][3] = true;
      holeMask[7][4] = true;
    }
  }

  // Determine objective type so levels are varied and non-repetitive
  let objectiveType: LevelObjectiveType = 'score';
  if (clamped === 1) {
    objectiveType = 'score';
  } else if (clamped === 2) {
    objectiveType = 'collect_color';
  } else if (clamped === 3) {
    objectiveType = 'clear_icing';
  } else {
    const modeRoll = clamped % 4;
    if (modeRoll === 0) objectiveType = 'hybrid';
    else if (modeRoll === 1) objectiveType = 'score';
    else if (modeRoll === 2) objectiveType = 'collect_color';
    else objectiveType = 'clear_icing';
  }

  // Place blockers for clear_icing, hybrid, or higher difficulty levels
  let icingCount = 0;
  const shouldPlaceBlockers =
    objectiveType === 'clear_icing' || objectiveType === 'hybrid' || clamped >= 6;

  if (shouldPlaceBlockers) {
    const patternType = clamped % 5;
    for (let r = 1; r < 7; r++) {
      for (let c = 1; c < 7; c++) {
        if (holeMask[r][c]) continue;
        let place = false;
        if (patternType === 0 && (r === 2 || r === 5) && c >= 2 && c <= 5) place = true;
        else if (patternType === 1 && (r + c) % 3 === 0 && r >= 2 && r <= 5) place = true;
        else if (patternType === 2 && (c === 2 || c === 5) && r >= 2 && r <= 5) place = true;
        else if (patternType === 3 && r >= 2 && r <= 5 && c >= 2 && c <= 5 && (r === c || r + c === 7)) place = true;
        else if (patternType === 4 && seededValue(clamped, r * 8 + c) > 0.68) place = true;

        if (place) {
          let blocker: BlockerType = 'icing';
          if (clamped >= 15 && (r + c + clamped) % 4 === 0) {
            blocker = 'double_icing';
          } else if (clamped >= 35 && (r * c + clamped) % 7 === 0) {
            blocker = 'wafer_crate';
          }
          initialBlockers[r][c] = blocker;
          icingCount++;
        }
      }
    }

    // Ensure at least 6 blockers if objective requires clearing icing
    if ((objectiveType === 'clear_icing' || objectiveType === 'hybrid') && icingCount < 6) {
      const fallbackCoords = [
        [2, 2], [2, 5], [3, 3], [3, 4],
        [4, 3], [4, 4], [5, 2], [5, 5],
      ];
      for (const [r, c] of fallbackCoords) {
        if (!holeMask[r][c] && initialBlockers[r][c] === 'none') {
          initialBlockers[r][c] = clamped > 20 ? 'double_icing' : 'icing';
          icingCount++;
        }
      }
    }
  }

  // Moves & Target Score progression across 1,000 levels
  const baseMoves = clamped <= 5 ? 24 : Math.max(15, 26 - Math.floor((clamped % 25) / 4));
  const moves = baseMoves + (clamped % 10 === 0 ? 4 : 0); // Boss milestone levels get +4 moves

  const targetScore = Math.round((1200 + clamped * 220 + chapterIndex * 850) / 50) * 50;
  const star1 = targetScore;
  const star2 = Math.round((targetScore * 1.45) / 50) * 50;
  const star3 = Math.round((targetScore * 2.0) / 50) * 50;

  // Active candy colors: 5 colors on early levels for juicy cascades, 6 colors on advanced levels
  const numColors = clamped <= 8 || clamped % 7 === 0 ? 5 : 6;
  const spawnColors = ALL_COLORS.slice(0, numColors);

  const targetColor = spawnColors[clamped % spawnColors.length];
  const targetColorCount = Math.min(48, 14 + Math.floor(clamped / 12) + (clamped % 8));

  let description = `Score ${targetScore.toLocaleString()} pts`;
  if (objectiveType === 'clear_icing') {
    description = `Clear all ${icingCount} Sugar Frostings`;
  } else if (objectiveType === 'collect_color') {
    description = `Collect ${targetColorCount} ${COLOR_DISPLAY_NAMES[targetColor]}`;
  } else if (objectiveType === 'hybrid') {
    description = `Clear ${icingCount} Frostings & Collect ${Math.ceil(targetColorCount * 0.7)} ${COLOR_DISPLAY_NAMES[targetColor]}`;
  }

  return {
    levelNumber: clamped,
    chapterIndex,
    chapterName,
    moves,
    holeMask,
    initialBlockers,
    spawnColors,
    objective: {
      type: objectiveType,
      targetScore,
      starThresholds: [star1, star2, star3],
      targetIcingCount: objectiveType === 'clear_icing' || objectiveType === 'hybrid' ? icingCount : undefined,
      targetColor: objectiveType === 'collect_color' || objectiveType === 'hybrid' ? targetColor : undefined,
      targetColorCount:
        objectiveType === 'collect_color'
          ? targetColorCount
          : objectiveType === 'hybrid'
          ? Math.ceil(targetColorCount * 0.7)
          : undefined,
      description,
    },
  };
}
