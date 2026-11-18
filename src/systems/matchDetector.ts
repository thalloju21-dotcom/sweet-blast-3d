import { CandyCell, CandyColor, SpecialCandyType } from '../types/game';

export interface MatchGroup {
  cells: { row: number; col: number }[];
  color: CandyColor;
  spawnSpecial: SpecialCandyType;
  spawnPosition: { row: number; col: number };
}

export interface ValidMove {
  from: { row: number; col: number };
  to: { row: number; col: number };
  priority: number;
}

export function canCellMatch(cell: CandyCell | undefined): boolean {
  if (!cell || cell.hole) return false;
  if (cell.blocker === 'wafer_crate') return false;
  if (cell.special === 'color_bomb') return false; // Color bombs match via swap, not passive 3-in-a-row color
  return true;
}

export function canCellSwap(cell: CandyCell | undefined): boolean {
  if (!cell || cell.hole) return false;
  if (cell.blocker === 'wafer_crate' || cell.blocker === 'double_icing') return false;
  return true;
}

/**
 * Detects all horizontal and vertical runs of 3+, merges intersecting runs of the same color
 * into L/T/Cross shapes, and determines if a Striped, Wrapped, or Colour Bomb should spawn.
 */
export function findMatchGroups(
  grid: CandyCell[][],
  lastSwapPositions?: [{ row: number; col: number }, { row: number; col: number }]
): MatchGroup[] {
  const rows = grid.length;
  const cols = grid[0].length;

  interface Run {
    cells: { row: number; col: number }[];
    color: CandyColor;
    orientation: 'h' | 'v';
  }

  const runs: Run[] = [];

  // 1. Horizontal runs
  for (let r = 0; r < rows; r++) {
    let c = 0;
    while (c < cols) {
      const startCell = grid[r][c];
      if (!canCellMatch(startCell)) {
        c++;
        continue;
      }
      const color = startCell.color;
      const runCells = [{ row: r, col: c }];
      let nextC = c + 1;
      while (nextC < cols && canCellMatch(grid[r][nextC]) && grid[r][nextC].color === color) {
        runCells.push({ row: r, col: nextC });
        nextC++;
      }
      if (runCells.length >= 3) {
        runs.push({ cells: runCells, color, orientation: 'h' });
      }
      c = nextC;
    }
  }

  // 2. Vertical runs
  for (let c = 0; c < cols; c++) {
    let r = 0;
    while (r < rows) {
      const startCell = grid[r][c];
      if (!canCellMatch(startCell)) {
        r++;
        continue;
      }
      const color = startCell.color;
      const runCells = [{ row: r, col: c }];
      let nextR = r + 1;
      while (nextR < rows && canCellMatch(grid[nextR][c]) && grid[nextR][c].color === color) {
        runCells.push({ row: nextR, col: c });
        nextR++;
      }
      if (runCells.length >= 3) {
        runs.push({ cells: runCells, color, orientation: 'v' });
      }
      r = nextR;
    }
  }

  if (runs.length === 0) return [];

  // 3. Merge intersecting runs of the same color using BFS
  const visitedRun = new Array(runs.length).fill(false);
  const groups: MatchGroup[] = [];

  const shareCell = (a: Run, b: Run): boolean => {
    if (a.color !== b.color) return false;
    return a.cells.some((ca) => b.cells.some((cb) => ca.row === cb.row && ca.col === cb.col));
  };

  for (let i = 0; i < runs.length; i++) {
    if (visitedRun[i]) continue;
    visitedRun[i] = true;
    const queue = [runs[i]];
    const componentRuns: Run[] = [runs[i]];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (let j = 0; j < runs.length; j++) {
        if (!visitedRun[j] && shareCell(curr, runs[j])) {
          visitedRun[j] = true;
          queue.push(runs[j]);
          componentRuns.push(runs[j]);
        }
      }
    }

    // Deduplicate cells in this connected component and locate any H+V intersection cells
    const cellMap = new Map<string, { row: number; col: number }>();
    const cellCountMap = new Map<string, number>();
    let maxSingleLineLength = 0;
    let hasHorizontal = false;
    let hasVertical = false;
    let primaryOrientation: 'h' | 'v' = componentRuns[0].orientation;

    for (const run of componentRuns) {
      if (run.cells.length > maxSingleLineLength) {
        maxSingleLineLength = run.cells.length;
        primaryOrientation = run.orientation;
      }
      if (run.orientation === 'h') hasHorizontal = true;
      if (run.orientation === 'v') hasVertical = true;
      for (const cell of run.cells) {
        const key = `${cell.row},${cell.col}`;
        cellMap.set(key, cell);
        cellCountMap.set(key, (cellCountMap.get(key) || 0) + 1);
      }
    }

    const uniqueCells = Array.from(cellMap.values());

    // Determine special candy creation
    let spawnSpecial: SpecialCandyType = 'none';
    if (maxSingleLineLength >= 5) {
      spawnSpecial = 'color_bomb';
    } else if (hasHorizontal && hasVertical) {
      // L, T, or Cross shape creates a Wrapped explosive candy
      spawnSpecial = 'wrapped';
    } else if (maxSingleLineLength === 4) {
      // Match 4 creates a Striped candy: if player swapped horizontally/vertically, align blast excitingly
      if (lastSwapPositions) {
        const [p1, p2] = lastSwapPositions;
        const swappedVertically = Math.abs(p1.row - p2.row) === 1;
        spawnSpecial = swappedVertically ? 'striped_h' : 'striped_v';
      } else {
        spawnSpecial = primaryOrientation === 'h' ? 'striped_v' : 'striped_h';
      }
    }

    // Choose optimal spawn position:
    // 1. Prefer player's swapped cell if inside uniqueCells (and prefer one that isn't already a special candy)
    // 2. Else for L/T shapes, prefer the exact intersection corner cell
    // 3. Else prefer a cell in uniqueCells that doesn't already hold a special candy
    const nonSpecialCells = uniqueCells.filter(
      (u) => grid[u.row][u.col].special === 'none'
    );
    const candidatePool = nonSpecialCells.length > 0 ? nonSpecialCells : uniqueCells;
    let spawnPosition = candidatePool[Math.floor(candidatePool.length / 2)];

    // Check if there is an L/T intersection cell
    const intersectionCell = candidatePool.find(
      (u) => (cellCountMap.get(`${u.row},${u.col}`) || 0) > 1
    );
    if (intersectionCell) {
      spawnPosition = intersectionCell;
    }

    if (lastSwapPositions) {
      const [p1, p2] = lastSwapPositions;
      const hitP2 = candidatePool.find((u) => u.row === p2.row && u.col === p2.col);
      const hitP1 = candidatePool.find((u) => u.row === p1.row && u.col === p1.col);
      if (hitP2) spawnPosition = hitP2;
      else if (hitP1) spawnPosition = hitP1;
    }

    groups.push({
      cells: uniqueCells,
      color: componentRuns[0].color,
      spawnSpecial,
      spawnPosition,
    });
  }

  return groups;
}

/**
 * Checks whether two cells are orthogonally adjacent.
 */
export function areAdjacent(
  a: { row: number; col: number },
  b: { row: number; col: number }
): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

/**
 * Finds all valid moves on the current board (for hints and deadlock prevention).
 */
export function findValidMoves(grid: CandyCell[][]): ValidMove[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const validMoves: ValidMove[] = [];

  const tryVirtualSwap = (r1: number, c1: number, r2: number, c2: number): number => {
    const cellA = grid[r1][c1];
    const cellB = grid[r2][c2];
    if (!canCellSwap(cellA) || !canCellSwap(cellB)) return 0;

    // Special combination swaps are always valid and high priority!
    if (cellA.special === 'color_bomb' || cellB.special === 'color_bomb') {
      return 100;
    }
    if (cellA.special !== 'none' && cellB.special !== 'none') {
      return 90;
    }

    // Perform virtual swap
    const clone = grid.map((row) => row.map((cell) => ({ ...cell })));
    const tempColor = clone[r1][c1].color;
    const tempSpecial = clone[r1][c1].special;
    clone[r1][c1].color = clone[r2][c2].color;
    clone[r1][c1].special = clone[r2][c2].special;
    clone[r2][c2].color = tempColor;
    clone[r2][c2].special = tempSpecial;

    const groups = findMatchGroups(clone);
    if (groups.length === 0) return 0;

    let scorePriority = 0;
    for (const g of groups) {
      scorePriority += g.cells.length * 10;
      if (g.spawnSpecial === 'color_bomb') scorePriority += 50;
      else if (g.spawnSpecial === 'wrapped') scorePriority += 35;
      else if (g.spawnSpecial !== 'none') scorePriority += 20;
    }
    return scorePriority;
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c + 1 < cols) {
        const p = tryVirtualSwap(r, c, r, c + 1);
        if (p > 0) {
          validMoves.push({ from: { row: r, col: c }, to: { row: r, col: c + 1 }, priority: p });
        }
      }
      if (r + 1 < rows) {
        const p = tryVirtualSwap(r, c, r + 1, c);
        if (p > 0) {
          validMoves.push({ from: { row: r, col: c }, to: { row: r + 1, col: c }, priority: p });
        }
      }
    }
  }

  return validMoves.sort((a, b) => b.priority - a.priority);
}
