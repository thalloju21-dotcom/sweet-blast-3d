import {
  BlockerType,
  CandyCell,
  CandyColor,
  LevelConfig,
  ParticleFX,
  SpecialCandyType,
} from '../types/game';
import { canCellSwap, findMatchGroups, findValidMoves } from './matchDetector';

let idCounter = 1;
export function nextCandyId(): string {
  idCounter += 1;
  return `candy_${Date.now()}_${idCounter}`;
}

export const CANDY_HEX_MAP: Record<CandyColor, string> = {
  red: '#FF3366',
  blue: '#0EA5E9',
  green: '#10B981',
  yellow: '#FACC15',
  purple: '#A855F7',
  orange: '#F97316',
};

function pickRandomColor(colors: CandyColor[]): CandyColor {
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Creates a fresh 8x8 board for the given level config with 0 pre-existing matches
 * and at least 1 guaranteed valid move.
 */
export function createInitialBoard(config: LevelConfig): CandyCell[][] {
  const rows = 8;
  const cols = 8;
  let attempts = 0;

  while (attempts < 40) {
    attempts++;
    const grid: CandyCell[][] = [];

    for (let r = 0; r < rows; r++) {
      const rowCells: CandyCell[] = [];
      for (let c = 0; c < cols; c++) {
        const isHole = config.holeMask[r][c];
        const blocker = isHole ? 'none' : config.initialBlockers[r][c];

        // Choose a color that does not immediately form a 3-in-a-row horizontally or vertically
        const forbidden = new Set<CandyColor>();
        if (c >= 2 && !rowCells[c - 1].hole && !rowCells[c - 2].hole) {
          if (rowCells[c - 1].color === rowCells[c - 2].color) {
            forbidden.add(rowCells[c - 1].color);
          }
        }
        if (r >= 2 && !grid[r - 1][c].hole && !grid[r - 2][c].hole) {
          if (grid[r - 1][c].color === grid[r - 2][c].color) {
            forbidden.add(grid[r - 1][c].color);
          }
        }

        const allowed = config.spawnColors.filter((col) => !forbidden.has(col));
        const color = pickRandomColor(allowed.length > 0 ? allowed : config.spawnColors);

        rowCells.push({
          id: nextCandyId(),
          row: r,
          col: c,
          color,
          special: 'none',
          blocker,
          hole: isHole,
        });
      }
      grid.push(rowCells);
    }

    if (findMatchGroups(grid).length === 0 && findValidMoves(grid).length > 0) {
      return grid;
    }
  }

  return shuffleBoard(
    Array.from({ length: 8 }, (_, r) =>
      Array.from({ length: 8 }, (__, c) => ({
        id: nextCandyId(),
        row: r,
        col: c,
        color: pickRandomColor(config.spawnColors),
        special: 'none' as SpecialCandyType,
        blocker: config.holeMask[r][c] ? ('none' as BlockerType) : config.initialBlockers[r][c],
        hole: config.holeMask[r][c],
      }))
    ),
    config.spawnColors
  );
}

/**
 * Shuffles swappable candies on the board so there are no immediate matches
 * and at least 1 valid move exists.
 */
export function shuffleBoard(grid: CandyCell[][], spawnColors: CandyColor[]): CandyCell[][] {
  const clone = grid.map((row) => row.map((cell) => ({ ...cell, isNew: true })));
  const swappableCoords: { row: number; col: number }[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (canCellSwap(clone[r][c])) {
        swappableCoords.push({ row: r, col: c });
      }
    }
  }

  for (let attempt = 0; attempt < 30; attempt++) {
    for (const { row, col } of swappableCoords) {
      const forbidden = new Set<CandyColor>();
      if (col >= 2 && clone[row][col - 1].color === clone[row][col - 2].color) {
        forbidden.add(clone[row][col - 1].color);
      }
      if (row >= 2 && clone[row - 1][col].color === clone[row - 2][col].color) {
        forbidden.add(clone[row - 1][col].color);
      }
      const pool = spawnColors.filter((c) => !forbidden.has(c));
      clone[row][col].color = pickRandomColor(pool.length > 0 ? pool : spawnColors);
      clone[row][col].id = nextCandyId();
    }

    if (findMatchGroups(clone).length === 0 && findValidMoves(clone).length > 0) {
      break;
    }
  }

  // Fallback guarantee: if heavily blocked board still has 0 valid moves, grant a Colour Bomb on a swappable cell
  if (findValidMoves(clone).length === 0 && swappableCoords.length > 0) {
    for (const { row, col } of swappableCoords) {
      const hasSwappableNeighbor =
        (row > 0 && canCellSwap(clone[row - 1][col])) ||
        (row < 7 && canCellSwap(clone[row + 1][col])) ||
        (col > 0 && canCellSwap(clone[row][col - 1])) ||
        (col < 7 && canCellSwap(clone[row][col + 1]));
      if (hasSwappableNeighbor) {
        clone[row][col].special = 'color_bomb';
        break;
      }
    }
  }

  return clone;
}

export interface BlastResolutionResult {
  clearedCoords: { row: number; col: number }[];
  damagedBlockers: { row: number; col: number; clearedCompletely: boolean }[];
  spawnedSpecials: {
    row: number;
    col: number;
    special: SpecialCandyType;
    color: CandyColor;
    isChargedWrapped?: boolean;
  }[];
  particles: ParticleFX[];
  pointsEarned: number;
  collectedByColor: Record<CandyColor, number>;
  icingClearedCount: number;
  triggeredSupernova: boolean;
  soundCue: 'match' | 'line' | 'wrapped_1' | 'wrapped_2' | 'color_bomb' | 'supernova';
}

/**
 * If a Colour Bomb is swapped with a Striped or Wrapped candy, returns a board state where
 * every candy of the partner's color is visually converted into that Special Candy before detonation!
 */
export function prepareColorBombComboGrid(
  grid: CandyCell[][],
  posA: { row: number; col: number },
  posB: { row: number; col: number }
): CandyCell[][] | null {
  const cellA = grid[posA.row][posA.col];
  const cellB = grid[posB.row][posB.col];
  const isColorBombA = cellA.special === 'color_bomb';
  const isColorBombB = cellB.special === 'color_bomb';
  if (!isColorBombA && !isColorBombB) return null;
  if (isColorBombA && isColorBombB) return null;

  const partner = isColorBombA ? cellB : cellA;
  if (partner.special === 'none' || partner.special === 'color_bomb') return null;

  const targetColor = partner.color;
  const partnerSpecial = partner.special;

  return grid.map((row, r) =>
    row.map((cell, c) => {
      if (cell.hole || cell.color !== targetColor) return { ...cell };
      if ((r === posA.row && c === posA.col) || (r === posB.row && c === posB.col)) {
        return { ...cell };
      }
      const nextSpec: SpecialCandyType =
        partnerSpecial === 'wrapped'
          ? 'wrapped'
          : (r + c) % 2 === 0
          ? 'striped_h'
          : 'striped_v';
      return {
        ...cell,
        special: nextSpec,
        isNew: true,
      };
    })
  );
}

/**
 * Resolves a special + special swap OR color_bomb + any candy swap directly.
 */
export function resolveSpecialSwapCombo(
  grid: CandyCell[][],
  posA: { row: number; col: number },
  posB: { row: number; col: number }
): BlastResolutionResult | null {
  const cellA = grid[posA.row][posA.col];
  const cellB = grid[posB.row][posB.col];

  const isColorBombA = cellA.special === 'color_bomb';
  const isColorBombB = cellB.special === 'color_bomb';
  const bothSpecial = cellA.special !== 'none' && cellB.special !== 'none';

  if (!isColorBombA && !isColorBombB && !bothSpecial) {
    return null;
  }

  const toClearSet = new Set<string>();
  const particles: ParticleFX[] = [];
  const spawnedSpecials: BlastResolutionResult['spawnedSpecials'] = [];
  let triggeredSupernova = false;
  let soundCue: BlastResolutionResult['soundCue'] = 'line';

  const markClear = (r: number, c: number) => {
    if (r < 0 || r >= 8 || c < 0 || c >= 8) return;
    if (grid[r][c].hole) return;
    toClearSet.add(`${r},${c}`);
  };

  markClear(posA.row, posA.col);
  markClear(posB.row, posB.col);

  if (isColorBombA && isColorBombB) {
    // Rainbow Supernova: Clear the ENTIRE 8x8 board!
    triggeredSupernova = true;
    soundCue = 'supernova';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        markClear(r, c);
        if ((r + c) % 3 === 0 && !grid[r][c].hole) {
          particles.push({
            id: nextCandyId(),
            row: posB.row,
            col: posB.col,
            targetRow: r,
            targetCol: c,
            colorHex: CANDY_HEX_MAP[grid[r][c].color],
            type: 'lightning',
          });
        }
      }
    }
    particles.push({
      id: nextCandyId(),
      row: posB.row,
      col: posB.col,
      colorHex: '#FACC15',
      type: 'rainbow',
    });
  } else if (isColorBombA || isColorBombB) {
    const bombPos = isColorBombA ? posA : posB;
    const partner = isColorBombA ? cellB : cellA;
    const targetColor = partner.color;
    const partnerSpecial = partner.special;
    soundCue = partnerSpecial !== 'none' ? 'supernova' : 'color_bomb';
    if (partnerSpecial !== 'none') triggeredSupernova = true;

    particles.push({
      id: nextCandyId(),
      row: bombPos.row,
      col: bombPos.col,
      colorHex: CANDY_HEX_MAP[targetColor],
      type: 'rainbow',
    });

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (!grid[r][c].hole && grid[r][c].color === targetColor) {
          markClear(r, c);
          // Rainbow lightning arc from the Colour Bomb to each matching candy!
          particles.push({
            id: nextCandyId(),
            row: bombPos.row,
            col: bombPos.col,
            targetRow: r,
            targetCol: c,
            colorHex: CANDY_HEX_MAP[targetColor],
            type: 'lightning',
          });

          // If combined with Striped or Wrapped, trigger secondary blasts at every matching candy!
          if (partnerSpecial === 'striped_h' || partnerSpecial === 'striped_v') {
            const horiz = (r + c) % 2 === 0;
            if (horiz) {
              for (let cc = 0; cc < 8; cc++) markClear(r, cc);
              particles.push({
                id: nextCandyId(),
                row: r,
                col: c,
                colorHex: CANDY_HEX_MAP[targetColor],
                type: 'beam_h',
              });
            } else {
              for (let rr = 0; rr < 8; rr++) markClear(rr, c);
              particles.push({
                id: nextCandyId(),
                row: r,
                col: c,
                colorHex: CANDY_HEX_MAP[targetColor],
                type: 'beam_v',
              });
            }
          } else if (partnerSpecial === 'wrapped') {
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                markClear(r + dr, c + dc);
              }
            }
            particles.push({
              id: nextCandyId(),
              row: r,
              col: c,
              colorHex: CANDY_HEX_MAP[targetColor],
              type: 'shockwave',
            });
          }
        }
      }
    }
  } else if (bothSpecial) {
    const specs = [cellA.special, cellB.special];
    const hasWrapped = specs.includes('wrapped');
    const bothWrapped = cellA.special === 'wrapped' && cellB.special === 'wrapped';
    const bothStriped =
      (cellA.special === 'striped_h' || cellA.special === 'striped_v') &&
      (cellB.special === 'striped_h' || cellB.special === 'striped_v');

    if (bothStriped) {
      // Cross Blast: Full Row + Full Column
      soundCue = 'line';
      for (let c = 0; c < 8; c++) markClear(posB.row, c);
      for (let r = 0; r < 8; r++) markClear(r, posB.col);
      particles.push(
        { id: nextCandyId(), row: posB.row, col: posB.col, colorHex: '#FFF9F2', type: 'beam_h' },
        { id: nextCandyId(), row: posB.row, col: posB.col, colorHex: '#FFF9F2', type: 'beam_v' }
      );
    } else if (bothWrapped) {
      // 5x5 Mega Bomb (Double Explosion! Keep 1 charged wrapped candy for the 2nd blast!)
      triggeredSupernova = true;
      soundCue = 'wrapped_1';
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          markClear(posB.row + dr, posB.col + dc);
        }
      }
      spawnedSpecials.push({
        row: posB.row,
        col: posB.col,
        special: 'wrapped',
        color: cellB.color,
        isChargedWrapped: true,
      });
      particles.push({
        id: nextCandyId(),
        row: posB.row,
        col: posB.col,
        colorHex: '#FF3366',
        type: 'double_shockwave',
      });
    } else if (hasWrapped) {
      // Striped + Wrapped = 3-Row + 3-Column Giant Cross!
      triggeredSupernova = true;
      soundCue = 'supernova';
      for (let d = -1; d <= 1; d++) {
        const rr = posB.row + d;
        const cc = posB.col + d;
        if (rr >= 0 && rr < 8) {
          for (let c = 0; c < 8; c++) markClear(rr, c);
          particles.push({
            id: nextCandyId(),
            row: rr,
            col: posB.col,
            colorHex: '#FACC15',
            type: 'beam_h',
          });
        }
        if (cc >= 0 && cc < 8) {
          for (let r = 0; r < 8; r++) markClear(r, cc);
          particles.push({
            id: nextCandyId(),
            row: posB.row,
            col: cc,
            colorHex: '#FACC15',
            type: 'beam_v',
          });
        }
      }
    }
  }

  return finalizeClearSet(
    grid,
    toClearSet,
    spawnedSpecials,
    particles,
    triggeredSupernova,
    2,
    soundCue
  );
}

/**
 * Resolves standard match groups on the board, including recursive chain detonations
 * of any special candies caught in the match.
 */
export function resolveBoardMatches(
  grid: CandyCell[][],
  comboMultiplier: number,
  lastSwapPositions?: [{ row: number; col: number }, { row: number; col: number }]
): BlastResolutionResult | null {
  const groups = findMatchGroups(grid, lastSwapPositions);
  if (groups.length === 0) return null;

  const toClearSet = new Set<string>();
  const spawnedSpecials: BlastResolutionResult['spawnedSpecials'] = [];
  const particles: ParticleFX[] = [];

  for (const g of groups) {
    for (const c of g.cells) {
      toClearSet.add(`${c.row},${c.col}`);
    }
    if (g.spawnSpecial !== 'none') {
      spawnedSpecials.push({
        row: g.spawnPosition.row,
        col: g.spawnPosition.col,
        special: g.spawnSpecial,
        color: g.color,
      });
    }
  }

  return finalizeClearSet(
    grid,
    toClearSet,
    spawnedSpecials,
    particles,
    false,
    comboMultiplier,
    'match'
  );
}

/**
 * Resolves the 2nd Explosion of any Charged Wrapped Candies (`isChargedWrapped === true`)
 * currently on the board after their 1st explosion and gravity settle!
 */
export function resolveChargedWrappedCandies(
  grid: CandyCell[][],
  comboMultiplier: number
): BlastResolutionResult | null {
  const chargedCoords: { row: number; col: number; color: CandyColor }[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = grid[r][c];
      if (!cell.hole && cell.isChargedWrapped) {
        chargedCoords.push({ row: r, col: c, color: cell.color });
      }
    }
  }

  if (chargedCoords.length === 0) return null;

  const toClearSet = new Set<string>();
  const particles: ParticleFX[] = [];

  for (const cw of chargedCoords) {
    particles.push({
      id: nextCandyId(),
      row: cw.row,
      col: cw.col,
      colorHex: CANDY_HEX_MAP[cw.color],
      type: 'double_shockwave',
    });
    // 2nd Explosion clears a generous 3x3 area around its settled position
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = cw.row + dr;
        const nc = cw.col + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !grid[nr][nc].hole) {
          toClearSet.add(`${nr},${nc}`);
        }
      }
    }
  }

  return finalizeClearSet(
    grid,
    toClearSet,
    [],
    particles,
    true,
    comboMultiplier + 1,
    'wrapped_2'
  );
}

/**
 * Expands chain-reaction special candies, handles Wrapped Candy 1st-stage survival,
 * damages adjacent blockers, and calculates score & objective tallies.
 */
export function finalizeClearSet(
  grid: CandyCell[][],
  initialClearSet: Set<string>,
  initialSpawnedSpecials: BlastResolutionResult['spawnedSpecials'],
  initialParticles: ParticleFX[],
  initialSupernova: boolean,
  comboMultiplier: number,
  initialSoundCue: BlastResolutionResult['soundCue'] = 'match'
): BlastResolutionResult {
  const toClearSet = new Set<string>(initialClearSet);
  const processedSpecials = new Set<string>();
  const particles: ParticleFX[] = [...initialParticles];
  const spawnedSpecials: BlastResolutionResult['spawnedSpecials'] = [...initialSpawnedSpecials];
  let triggeredSupernova = initialSupernova;
  let soundCue = initialSoundCue;

  // Recursive expansion if any cleared cell holds an existing Special Candy
  let expanded = true;
  while (expanded) {
    expanded = false;
    for (const key of Array.from(toClearSet)) {
      if (processedSpecials.has(key)) continue;
      const [r, c] = key.split(',').map(Number);
      const cell = grid[r]?.[c];
      if (!cell || cell.hole || cell.special === 'none') continue;

      processedSpecials.add(key);
      expanded = true;

      if (cell.special === 'striped_h') {
        if (soundCue === 'match') soundCue = 'line';
        particles.push({
          id: nextCandyId(),
          row: r,
          col: c,
          colorHex: CANDY_HEX_MAP[cell.color],
          type: 'beam_h',
        });
        for (let cc = 0; cc < 8; cc++) {
          if (!grid[r][cc].hole) toClearSet.add(`${r},${cc}`);
        }
      } else if (cell.special === 'striped_v') {
        if (soundCue === 'match') soundCue = 'line';
        particles.push({
          id: nextCandyId(),
          row: r,
          col: c,
          colorHex: CANDY_HEX_MAP[cell.color],
          type: 'beam_v',
        });
        for (let rr = 0; rr < 8; rr++) {
          if (!grid[rr][c].hole) toClearSet.add(`${rr},${c}`);
        }
      } else if (cell.special === 'wrapped') {
        // WRAPPED CANDY DOUBLE EXPLOSION:
        // If this wrapped candy is on its 1st explosion (!cell.isChargedWrapped),
        // it blasts 3x3 AND survives as an `isChargedWrapped: true` candy to explode a 2nd time!
        if (!cell.isChargedWrapped) {
          if (soundCue === 'match' || soundCue === 'line') soundCue = 'wrapped_1';
          particles.push({
            id: nextCandyId(),
            row: r,
            col: c,
            colorHex: CANDY_HEX_MAP[cell.color],
            type: 'shockwave',
          });
          // Ensure it stays on the board as a charged wrapped candy for the 2nd blast
          if (!spawnedSpecials.some((sp) => sp.row === r && sp.col === c)) {
            spawnedSpecials.push({
              row: r,
              col: c,
              special: 'wrapped',
              color: cell.color,
              isChargedWrapped: true,
            });
          }
        } else {
          soundCue = 'wrapped_2';
          particles.push({
            id: nextCandyId(),
            row: r,
            col: c,
            colorHex: CANDY_HEX_MAP[cell.color],
            type: 'double_shockwave',
          });
        }

        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !grid[nr][nc].hole) {
              toClearSet.add(`${nr},${nc}`);
            }
          }
        }
      } else if (cell.special === 'color_bomb') {
        triggeredSupernova = true;
        soundCue = 'color_bomb';
        particles.push({
          id: nextCandyId(),
          row: r,
          col: c,
          colorHex: '#FACC15',
          type: 'rainbow',
        });
        const targetColor = cell.color;
        for (let rr = 0; rr < 8; rr++) {
          for (let cc = 0; cc < 8; cc++) {
            if (!grid[rr][cc].hole && grid[rr][cc].color === targetColor) {
              toClearSet.add(`${rr},${cc}`);
              particles.push({
                id: nextCandyId(),
                row: r,
                col: c,
                targetRow: rr,
                targetCol: cc,
                colorHex: CANDY_HEX_MAP[targetColor],
                type: 'lightning',
              });
            }
          }
        }
      }
    }
  }

  // Damage blockers on cleared cells or orthogonally adjacent to cleared cells
  const blockerHitSet = new Set<string>();
  for (const key of Array.from(toClearSet)) {
    const [r, c] = key.split(',').map(Number);
    if (grid[r][c].blocker !== 'none') {
      blockerHitSet.add(`${r},${c}`);
    }
    const neighbors = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ];
    for (const [nr, nc] of neighbors) {
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !grid[nr][nc].hole) {
        if (grid[nr][nc].blocker !== 'none') {
          blockerHitSet.add(`${nr},${nc}`);
        }
      }
    }
  }

  const damagedBlockers: { row: number; col: number; clearedCompletely: boolean }[] = [];
  let icingClearedCount = 0;

  for (const bKey of Array.from(blockerHitSet)) {
    const [r, c] = bKey.split(',').map(Number);
    const bType = grid[r][c].blocker;
    if (bType === 'double_icing') {
      damagedBlockers.push({ row: r, col: c, clearedCompletely: false });
    } else if (bType === 'icing' || bType === 'wafer_crate') {
      damagedBlockers.push({ row: r, col: c, clearedCompletely: true });
      icingClearedCount += 1;
    }
  }

  const collectedByColor: Record<CandyColor, number> = {
    red: 0,
    blue: 0,
    green: 0,
    yellow: 0,
    purple: 0,
    orange: 0,
  };

  const clearedCoords: { row: number; col: number }[] = [];
  const clearedCoordKeys = new Set<string>();
  for (const key of Array.from(toClearSet)) {
    const [r, c] = key.split(',').map(Number);
    const cell = grid[r][c];
    if (!cell || cell.hole) continue;
    if (cell.blocker === 'wafer_crate') continue;
    clearedCoords.push({ row: r, col: c });
    clearedCoordKeys.add(key);
    collectedByColor[cell.color] = (collectedByColor[cell.color] || 0) + 1;
    particles.push({
      id: nextCandyId(),
      row: r,
      col: c,
      colorHex: CANDY_HEX_MAP[cell.color],
      type: 'burst',
    });
  }

  // When a wafer_crate is destroyed, also mark its coordinate as cleared so gravity drops a new candy into it
  for (const db of damagedBlockers) {
    if (db.clearedCompletely && grid[db.row][db.col].blocker === 'wafer_crate') {
      const k = `${db.row},${db.col}`;
      if (!clearedCoordKeys.has(k)) {
        clearedCoords.push({ row: db.row, col: db.col });
        clearedCoordKeys.add(k);
      }
    }
  }

  const basePoints =
    clearedCoords.length * 60 +
    spawnedSpecials.length * 200 +
    icingClearedCount * 150 +
    (triggeredSupernova ? 650 : 0);
  const pointsEarned = Math.round(basePoints * (1 + (comboMultiplier - 1) * 0.35));

  return {
    clearedCoords,
    damagedBlockers,
    spawnedSpecials,
    particles,
    pointsEarned,
    collectedByColor,
    icingClearedCount,
    triggeredSupernova,
    soundCue,
  };
}

/**
 * Applies gravity to each column and spawns fresh candies in empty top slots.
 */
export function applyGravityAndRefill(
  grid: CandyCell[][],
  clearedCoords: { row: number; col: number }[],
  damagedBlockers: { row: number; col: number; clearedCompletely: boolean }[],
  spawnedSpecials: BlastResolutionResult['spawnedSpecials'],
  spawnColors: CandyColor[]
): CandyCell[][] {
  const nextGrid: CandyCell[][] = grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      isMatched: false,
      isNew: false,
      dropDistance: 0,
    }))
  );

  // 1. Update blockers
  for (const b of damagedBlockers) {
    if (b.clearedCompletely) {
      nextGrid[b.row][b.col].blocker = 'none';
    } else if (nextGrid[b.row][b.col].blocker === 'double_icing') {
      nextGrid[b.row][b.col].blocker = 'icing';
    }
  }

  // 2. Mark cleared cells and place all newly spawned / charged special candies
  const emptySet = new Set<string>();
  for (const { row, col } of clearedCoords) {
    emptySet.add(`${row},${col}`);
  }

  for (const sp of spawnedSpecials) {
    const key = `${sp.row},${sp.col}`;
    emptySet.delete(key);
    nextGrid[sp.row][sp.col] = {
      ...nextGrid[sp.row][sp.col],
      id: nextCandyId(),
      color: sp.color,
      special: sp.special,
      blocker: 'none',
      isChargedWrapped: sp.isChargedWrapped || false,
      isNew: true,
    };
  }

  // 3. Process column by column gravity (skipping holes and stationary wafer crates)
  for (let c = 0; c < 8; c++) {
    const playableRows: number[] = [];
    const survivingCells: CandyCell[] = [];

    for (let r = 0; r < 8; r++) {
      if (nextGrid[r][c].hole || nextGrid[r][c].blocker === 'wafer_crate') {
        continue;
      }
      playableRows.push(r);
      if (!emptySet.has(`${r},${c}`)) {
        survivingCells.push(nextGrid[r][c]);
      }
    }

    const missingCount = playableRows.length - survivingCells.length;
    if (missingCount === 0) continue;

    const newTopCells: CandyCell[] = Array.from({ length: missingCount }, () => ({
      id: nextCandyId(),
      row: 0,
      col: c,
      color: pickRandomColor(spawnColors),
      special: 'none' as SpecialCandyType,
      blocker: 'none' as BlockerType,
      hole: false,
      isNew: true,
      dropDistance: missingCount,
      isChargedWrapped: false,
    }));

    const combined = [...newTopCells, ...survivingCells];
    playableRows.forEach((targetRow, idx) => {
      const item = combined[idx];
      const existingBlocker = nextGrid[targetRow][c].blocker;
      nextGrid[targetRow][c] = {
        ...item,
        row: targetRow,
        col: c,
        blocker: existingBlocker,
        isNew: item.isNew || item.row !== targetRow,
      };
    });
  }

  return nextGrid;
}
