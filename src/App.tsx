import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Coins,
  Gift,
  HelpCircle,
  Map as MapIcon,
  Music,
  Pause,
  Play,
  RotateCcw,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  BoosterType,
  CandyCell,
  CandyColor,
  FloatingScoreFX,
  GameSettings,
  GameState,
  LevelConfig,
  ParticleFX,
  SaveData,
} from './types/game';
import {
  applyGravityAndRefill,
  CANDY_HEX_MAP,
  createInitialBoard,
  finalizeClearSet,
  nextCandyId,
  prepareColorBombComboGrid,
  resolveBoardMatches,
  resolveChargedWrappedCandies,
  resolveSpecialSwapCombo,
  shuffleBoard,
} from './systems/boardManager';
import { areAdjacent, canCellSwap, findValidMoves } from './systems/matchDetector';
import { getLevelConfig, TOTAL_LEVELS } from './systems/levelManager';
import {
  canClaimDailyReward,
  clearActiveLevelSession,
  DAILY_REWARD_TIERS,
  DailyRewardTier,
  getTodayDateString,
  hydrateFromIndexedDBIfNeeded,
  loadActiveLevelSession,
  loadSaveData,
  resetSaveData,
  saveActiveLevelSession,
  writeSaveData,
} from './systems/saveSystem';
import { soundManager } from './systems/soundManager';
import { TRANSLATIONS } from './systems/i18n';
import { CandyPiece } from './components/CandyPiece';
import { CandyWorldDecor } from './components/CandyWorldDecor';
import { BoosterIconSVG, SweetBlastLogoSVG } from './components/GameIcons';
import { LevelMapModal } from './components/LevelMapModal';
import {
  OfflineStatusBadge,
  OnlineLeaderboardModal,
  PWAInstallButton,
  useOnlineStatus,
} from './components/OfflineAndPWAManager';
import { CandyAvatarSVG, PlayerProfileModal } from './components/PlayerProfileModal';
import { DailyRewardModal, ShopModal } from './components/ShopAndRewardsModal';
import { SettingsModal, WinLoseModal } from './components/SettingsAndModals';
import { SplashScreen } from './components/SplashScreen';

const COMBO_CALLOUTS = [
  '',
  'Sweet!',
  'Tasty x2!',
  'Delicious x3!',
  'Sugar Rush x4!',
  'Royal Blast x5!',
  'Confectionery Nova!',
];

export default function App() {
  const [saveData, setSaveData] = useState<SaveData>(() => loadSaveData());
  const [gameState, setGameState] = useState<GameState>('SPLASH');

  // Active level & board state
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(() =>
    getLevelConfig(loadSaveData().currentLevel)
  );
  const [grid, setGrid] = useState<CandyCell[][]>(() =>
    createInitialBoard(getLevelConfig(loadSaveData().currentLevel))
  );
  const [score, setScore] = useState<number>(0);
  const [movesLeft, setMovesLeft] = useState<number>(() =>
    getLevelConfig(loadSaveData().currentLevel).moves
  );
  const [collectedColors, setCollectedColors] = useState<Record<CandyColor, number>>({
    red: 0,
    blue: 0,
    green: 0,
    yellow: 0,
    purple: 0,
    orange: 0,
  });

  // Interaction & Animation state
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [invalidPair, setInvalidPair] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeBoosterMode, setActiveBoosterMode] = useState<BoosterType | null>(null);
  const [hintMove, setHintMove] = useState<{
    from: { row: number; col: number };
    to: { row: number; col: number };
  } | null>(null);
  const [particles, setParticles] = useState<ParticleFX[]>([]);
  const [floatingScores, setFloatingScores] = useState<FloatingScoreFX[]>([]);
  const [boardShake, setBoardShake] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Modals
  const [showLevelMap, setShowLevelMap] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showDailyReward, setShowDailyReward] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  // Offline & Active Session Resume state
  const { isOnline, simulatedOffline, setSimulatedOffline } = useOnlineStatus();
  const [savedSession, setSavedSession] = useState(() => loadActiveLevelSession());
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // End-of-round summary stats
  const [lastRoundResult, setLastRoundResult] = useState<{
    stars: number;
    coinsEarned: number;
  }>({ stars: 1, coinsEarned: 50 });

  // Backdrop fallback state
  const [heroImgFailed, setHeroImgFailed] = useState<boolean>(false);

  // Pointer swipe tracking ref
  const swipeStartRef = useRef<{ row: number; col: number; x: number; y: number } | null>(null);

  const t = TRANSLATIONS[saveData.settings.language];

  // Hydrate from IndexedDB backup on initial startup if needed
  useEffect(() => {
    let mounted = true;
    hydrateFromIndexedDBIfNeeded((restoredData, restoredSession) => {
      if (!mounted) return;
      setSaveData(restoredData);
      const fallbackSession = restoredSession || loadActiveLevelSession();
      if (fallbackSession) setSavedSession(fallbackSession);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Sync saveData to localStorage + IndexedDB & audio settings
  useEffect(() => {
    writeSaveData(saveData);
    soundManager.updateSettings(saveData.settings);
  }, [saveData]);

  // Persist active in-progress level board state so players can resume or restart offline
  useEffect(() => {
    if ((gameState === 'PLAYING' || gameState === 'PAUSED') && movesLeft > 0) {
      const session = {
        levelNumber: levelConfig.levelNumber,
        score,
        movesLeft,
        collectedColors,
        grid,
        savedAt: Date.now(),
      };
      saveActiveLevelSession(session);
      setSavedSession(session);
    }
  }, [gameState, levelConfig.levelNumber, score, movesLeft, collectedColors, grid]);

  // Safely synchronize offline queued rewards/stats when internet connection returns (preventing duplicate rewards)
  useEffect(() => {
    if (isOnline && (saveData.pendingSyncCount || 0) > 0) {
      const syncedCount = saveData.pendingSyncCount || 0;
      setSaveData((prev) => ({
        ...prev,
        pendingSyncCount: 0,
        lastSyncedAt: new Date().toISOString(),
      }));
      setSyncToast(`Cloud Sync Complete (${syncedCount} offline update${syncedCount > 1 ? 's' : ''} verified)`);
      const timer = window.setTimeout(() => setSyncToast(null), 3200);
      return () => window.clearTimeout(timer);
    }
  }, [isOnline, saveData.pendingSyncCount]);

  // Automatically switch between Home Screen Music and Gameplay Music with smooth crossfade
  useEffect(() => {
    if (gameState === 'SPLASH' || gameState === 'TITLE_MENU') {
      soundManager.playMenuMusic();
    } else if (gameState === 'PLAYING') {
      soundManager.playGameplayMusic();
    }
  }, [gameState]);

  // Count remaining icing / blockers on the board
  const remainingBlockersCount = useMemo(() => {
    let count = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (!grid[r][c].hole && grid[r][c].blocker !== 'none') {
          count++;
        }
      }
    }
    return count;
  }, [grid]);

  // Show temporary banner
  const triggerBanner = useCallback((text: string, durationMs = 1600) => {
    setStatusBanner(text);
    window.setTimeout(() => {
      setStatusBanner((prev) => (prev === text ? null : prev));
    }, durationMs);
  }, []);

  // Start or restart a specific level
  const startLevel = useCallback((lvlNum: number) => {
    const clamped = Math.max(1, Math.min(TOTAL_LEVELS, lvlNum));
    const cfg = getLevelConfig(clamped);
    const freshGrid = createInitialBoard(cfg);

    setLevelConfig(cfg);
    setGrid(freshGrid);
    setScore(0);
    setMovesLeft(cfg.moves);
    setCollectedColors({ red: 0, blue: 0, green: 0, yellow: 0, purple: 0, orange: 0 });
    setSelectedCell(null);
    setActiveBoosterMode(null);
    setHintMove(null);
    setParticles([]);
    setFloatingScores([]);
    setIsProcessing(false);
    setGameState('PLAYING');
    setShowLevelMap(false);

    setSaveData((prev) => ({
      ...prev,
      currentLevel: clamped,
      gamesPlayed: (prev.gamesPlayed || 0) + 1,
    }));

    soundManager.playGameplayMusic();
  }, []);

  // Resume a previously saved in-progress level session (offline or after app reload)
  const resumeSavedLevel = useCallback(() => {
    const session = loadActiveLevelSession() || savedSession;
    if (!session) {
      startLevel(saveData.currentLevel);
      return;
    }
    const cfg = getLevelConfig(session.levelNumber);
    setLevelConfig(cfg);
    setGrid(session.grid);
    setScore(session.score);
    setMovesLeft(session.movesLeft);
    setCollectedColors(session.collectedColors);
    setSelectedCell(null);
    setActiveBoosterMode(null);
    setHintMove(null);
    setParticles([]);
    setFloatingScores([]);
    setIsProcessing(false);
    setGameState('PLAYING');
    setShowLevelMap(false);
    soundManager.playGameplayMusic();
    triggerBanner(`Resumed Level ${session.levelNumber} (${session.movesLeft} Moves Left)`);
  }, [savedSession, saveData.currentLevel, startLevel, triggerBanner]);

  // Keyboard shortcuts (`Enter`/`Space` on Title Menu opens Level Map, `Esc` to Pause/Close Modals, `Space` for Hint)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        showShop ||
        showDailyReward ||
        showSettings ||
        showProfile ||
        showLeaderboard
      ) {
        if (e.key === 'Escape') {
          e.preventDefault();
          soundManager.playButton();
          setShowShop(false);
          setShowDailyReward(false);
          setShowSettings(false);
          setShowProfile(false);
          setShowLeaderboard(false);
        }
        return;
      }
      if (showLevelMap && e.key === 'Escape') {
        e.preventDefault();
        soundManager.playButton();
        setShowLevelMap(false);
        return;
      }
      if (gameState === 'TITLE_MENU' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        soundManager.playButton();
        if (!showLevelMap) {
          setShowLevelMap(true);
        } else {
          startLevel(saveData.currentLevel);
        }
      } else if (gameState === 'PLAYING' && e.key === 'Escape') {
        e.preventDefault();
        soundManager.playButton();
        setGameState('PAUSED');
      } else if (gameState === 'PAUSED' && e.key === 'Escape') {
        e.preventDefault();
        soundManager.playButton();
        setGameState('PLAYING');
      } else if (gameState === 'PLAYING' && e.key === ' ' && !isProcessing) {
        e.preventDefault();
        const moves = findValidMoves(grid);
        if (moves.length > 0) {
          soundManager.playButton();
          setHintMove(moves[0]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameState,
    grid,
    isProcessing,
    saveData.currentLevel,
    showDailyReward,
    showLeaderboard,
    showLevelMap,
    showProfile,
    showSettings,
    showShop,
    startLevel,
  ]);

  // Check if level objective is fulfilled
  const checkObjectiveMet = useCallback(
    (
      currentScore: number,
      currentBlockersLeft: number,
      currentCollected: Record<CandyColor, number>
    ): boolean => {
      const obj = levelConfig.objective;
      if (obj.type === 'score') {
        return currentScore >= obj.targetScore;
      }
      if (obj.type === 'clear_icing') {
        return currentBlockersLeft === 0;
      }
      if (obj.type === 'collect_color' && obj.targetColor && obj.targetColorCount) {
        return (currentCollected[obj.targetColor] || 0) >= obj.targetColorCount;
      }
      if (obj.type === 'hybrid' && obj.targetColor && obj.targetColorCount) {
        return (
          currentBlockersLeft === 0 &&
          (currentCollected[obj.targetColor] || 0) >= obj.targetColorCount
        );
      }
      return currentScore >= obj.targetScore;
    },
    [levelConfig]
  );

  // Helper to spawn floating score text & particles
  const addVisualFeedback = useCallback(
    (
      newParticles: ParticleFX[],
      row: number,
      col: number,
      points: number,
      comboStep: number,
      colorHex: string
    ) => {
      setParticles((prev) => [...prev.slice(-48), ...newParticles]);
      const callout =
        comboStep >= 2
          ? COMBO_CALLOUTS[Math.min(comboStep, COMBO_CALLOUTS.length - 1)]
          : undefined;
      const floatItem: FloatingScoreFX = {
        id: nextCandyId(),
        row,
        col,
        text: `+${points}`,
        subtext: callout,
        colorHex,
      };
      setFloatingScores((prev) => [...prev.slice(-12), floatItem]);
    },
    []
  );

  // Core Cascade Loop: resolves all matches, Wrapped 2nd explosions & gravity steps sequentially
  const runCascadeLoop = useCallback(
    async (
      initialGrid: CandyCell[][],
      initialSwapPair?: [{ row: number; col: number }, { row: number; col: number }],
      preResolvedBlast?: ReturnType<typeof resolveSpecialSwapCombo>,
      movesAfterAction?: number
    ) => {
      setIsProcessing(true);
      setHintMove(null);

      let workingGrid = initialGrid.map((r) => r.map((c) => ({ ...c })));
      let comboStep = 1;
      let runningScore = score;
      const runningCollected = { ...collectedColors };

      const wait = (ms: number) => new Promise((res) => window.setTimeout(res, ms));

      const executeBlastStep = async (
        blast: NonNullable<ReturnType<typeof resolveSpecialSwapCombo>>,
        isPreResolvedCombo = false
      ) => {
        if (blast.soundCue !== 'match') {
          soundManager.playExplosion(blast.soundCue);
        } else {
          // Play distinct Match 3, Match 4, or Match 5+ jelly-pop & chime
          soundManager.playMatch(comboStep, blast.clearedCoords.length);
          if (blast.spawnedSpecials.some((sp) => !sp.isChargedWrapped)) {
            const newlyCreated = blast.spawnedSpecials.find((sp) => !sp.isChargedWrapped);
            if (newlyCreated) soundManager.playSpecialCreated(newlyCreated.special);
          }
        }

        if (
          blast.triggeredSupernova ||
          blast.soundCue === 'wrapped_1' ||
          blast.soundCue === 'wrapped_2' ||
          blast.soundCue === 'line' ||
          comboStep >= 3
        ) {
          setBoardShake(true);
          window.setTimeout(() => setBoardShake(false), 270);
        }

        const midCoord =
          blast.clearedCoords[Math.floor(blast.clearedCoords.length / 2)] ||
          blast.damagedBlockers[0] || { row: 3, col: 3 };
        const midCell = workingGrid[midCoord.row]?.[midCoord.col];
        addVisualFeedback(
          blast.particles,
          midCoord.row,
          midCoord.col,
          blast.pointsEarned,
          isPreResolvedCombo ? Math.max(2, comboStep) : comboStep,
          isPreResolvedCombo ? '#FACC15' : CANDY_HEX_MAP[midCell?.color || 'red'] || '#FFF9F2'
        );

        runningScore += blast.pointsEarned;
        setScore(runningScore);

        (Object.keys(blast.collectedByColor) as CandyColor[]).forEach((cKey) => {
          runningCollected[cKey] =
            (runningCollected[cKey] || 0) + blast.collectedByColor[cKey];
        });
        setCollectedColors({ ...runningCollected });

        // Mark matched for pop animation (except cells where a newly created or charged wrapped special stays)
        const survivingSpecialSet = new Set(
          blast.spawnedSpecials.map((sp) => `${sp.row},${sp.col}`)
        );
        const clearKeySet = new Set(
          blast.clearedCoords.map((c) => `${c.row},${c.col}`)
        );
        workingGrid = workingGrid.map((row) =>
          row.map((cell) =>
            clearKeySet.has(`${cell.row},${cell.col}`) &&
            !survivingSpecialSet.has(`${cell.row},${cell.col}`)
              ? { ...cell, isMatched: true }
              : cell
          )
        );
        setGrid(workingGrid);
        await wait(215);

        workingGrid = applyGravityAndRefill(
          workingGrid,
          blast.clearedCoords,
          blast.damagedBlockers,
          blast.spawnedSpecials,
          levelConfig.spawnColors
        );
        setGrid(workingGrid);
        await wait(205);
        comboStep++;
      };

      // Step A: If a special+special swap or booster triggered a pre-resolved blast, execute it first
      if (preResolvedBlast && preResolvedBlast.clearedCoords.length > 0) {
        await executeBlastStep(preResolvedBlast, true);
      }

      // Step B: Standard cascading match loop + Wrapped Candy 2nd Explosion loop
      let keepSettling = true;
      let swapRef = initialSwapPair;

      while (keepSettling) {
        // 1. Resolve all cascading matches
        let matchedInPass = false;
        while (true) {
          const resolution = resolveBoardMatches(workingGrid, comboStep, swapRef);
          swapRef = undefined;
          if (!resolution || resolution.clearedCoords.length === 0) {
            break;
          }
          matchedInPass = true;
          await executeBlastStep(resolution, false);
        }

        // 2. Check if any Wrapped Candy completed its 1st explosion and is primed for its 2nd blast!
        const secondWrappedBlast = resolveChargedWrappedCandies(workingGrid, comboStep);
        if (secondWrappedBlast && secondWrappedBlast.clearedCoords.length > 0) {
          await wait(140); // Brief charge pulse before 2nd detonation
          await executeBlastStep(secondWrappedBlast, true);
          // Continue outer loop so cascades resulting from the 2nd explosion also resolve!
          continue;
        }

        if (!matchedInPass) {
          keepSettling = false;
        }
      }

      // Clean up temporary particles
      setParticles([]);

      // Count remaining blockers on settled workingGrid
      let settledBlockers = 0;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (!workingGrid[r][c].hole && workingGrid[r][c].blocker !== 'none') {
            settledBlockers++;
          }
        }
      }

      // Check if player won or ran out of moves
      const effectiveMovesLeft =
        movesAfterAction !== undefined ? movesAfterAction : movesLeft;
      const won = checkObjectiveMet(runningScore, settledBlockers, runningCollected);

      if (won) {
        // Bonus points for remaining moves
        const moveBonus = effectiveMovesLeft * 120;
        const finalScore = runningScore + moveBonus;
        setScore(finalScore);

        const [s1, s2, s3] = levelConfig.objective.starThresholds;
        const stars = finalScore >= s3 ? 3 : finalScore >= s2 ? 2 : finalScore >= s1 ? 1 : 1;
        const coinsEarned = 40 + stars * 25 + (levelConfig.levelNumber % 10 === 0 ? 60 : 0);

        clearActiveLevelSession();
        setSavedSession(null);

        const rewardEventId = `win-L${levelConfig.levelNumber}-${Date.now()}`;
        setLastRoundResult({ stars, coinsEarned });
        setSaveData((prev) => {
          if ((prev.syncedRewardIds || []).includes(rewardEventId)) {
            return prev;
          }
          const prevStars = prev.levelStars[levelConfig.levelNumber] || 0;
          const prevHigh = prev.levelHighScores[levelConfig.levelNumber] || 0;
          const nextLevelNum = Math.min(TOTAL_LEVELS, levelConfig.levelNumber + 1);
          const nextSyncedIds = [...(prev.syncedRewardIds || []).slice(-99), rewardEventId];
          return {
            ...prev,
            coins: prev.coins + coinsEarned,
            totalScore: prev.totalScore + finalScore,
            highestScore: Math.max(prev.highestScore || 0, finalScore),
            currentLevel:
              levelConfig.levelNumber >= prev.currentLevel ? nextLevelNum : prev.currentLevel,
            highestUnlockedLevel: Math.max(prev.highestUnlockedLevel, nextLevelNum),
            levelStars: {
              ...prev.levelStars,
              [levelConfig.levelNumber]: Math.max(prevStars, stars),
            },
            levelHighScores: {
              ...prev.levelHighScores,
              [levelConfig.levelNumber]: Math.max(prevHigh, finalScore),
            },
            syncedRewardIds: nextSyncedIds,
            pendingSyncCount: isOnline ? prev.pendingSyncCount || 0 : (prev.pendingSyncCount || 0) + 1,
            lastSyncedAt: isOnline ? new Date().toISOString() : prev.lastSyncedAt,
          };
        });

        soundManager.playVictory();
        setIsProcessing(false);
        setGameState('ROUND_SUMMARY');
        return;
      }

      if (effectiveMovesLeft <= 0) {
        clearActiveLevelSession();
        setSavedSession(null);
        setSaveData((prev) => ({
          ...prev,
          totalScore: prev.totalScore + runningScore,
          highestScore: Math.max(prev.highestScore || 0, runningScore),
          pendingSyncCount: isOnline ? prev.pendingSyncCount || 0 : (prev.pendingSyncCount || 0) + 1,
        }));
        soundManager.playGameOver();
        setIsProcessing(false);
        setGameState('GAME_OVER');
        return;
      }

      // Check for deadlock (no valid moves remaining)
      const validMovesAfter = findValidMoves(workingGrid);
      if (validMovesAfter.length === 0) {
        triggerBanner('No Valid Moves — Auto Reshuffling!');
        await wait(500);
        const reshuffled = shuffleBoard(workingGrid, levelConfig.spawnColors);
        setGrid(reshuffled);
      }

      setIsProcessing(false);
    },
    [
      addVisualFeedback,
      checkObjectiveMet,
      collectedColors,
      isOnline,
      levelConfig,
      movesLeft,
      score,
      triggerBanner,
    ]
  );

  // Attempt to swap two adjacent cells
  const attemptSwap = useCallback(
    async (posA: { row: number; col: number }, posB: { row: number; col: number }) => {
      if (isProcessing || gameState !== 'PLAYING') return;
      if (!areAdjacent(posA, posB)) return;

      const cellA = grid[posA.row]?.[posA.col];
      const cellB = grid[posB.row]?.[posB.col];
      if (!canCellSwap(cellA) || !canCellSwap(cellB)) {
        soundManager.playInvalidSwap();
        setInvalidPair([`${posA.row},${posA.col}`, `${posB.row},${posB.col}`]);
        window.setTimeout(() => setInvalidPair([]), 260);
        return;
      }

      setSelectedCell(null);
      soundManager.playSwap();

      // Create swapped board copy (keeping any stationary tile frosting anchored to its coordinate)
      const swappedGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
      const blockerA = swappedGrid[posA.row][posA.col].blocker;
      const blockerB = swappedGrid[posB.row][posB.col].blocker;
      const copyA = {
        ...swappedGrid[posA.row][posA.col],
        row: posB.row,
        col: posB.col,
        blocker: blockerB,
      };
      const copyB = {
        ...swappedGrid[posB.row][posB.col],
        row: posA.row,
        col: posA.col,
        blocker: blockerA,
      };
      swappedGrid[posA.row][posA.col] = copyB;
      swappedGrid[posB.row][posB.col] = copyA;

      // 1. Check if this swap is a Special Combo (e.g. Colour Bomb or Special+Special)
      const transformedComboGrid = prepareColorBombComboGrid(swappedGrid, posA, posB);
      const comboSourceGrid = transformedComboGrid || swappedGrid;
      const specialComboBlast = resolveSpecialSwapCombo(comboSourceGrid, posA, posB);
      if (specialComboBlast) {
        const nextMoves = movesLeft - 1;
        setMovesLeft(nextMoves);
        setGrid(comboSourceGrid);
        if (transformedComboGrid) {
          soundManager.playComboTransform();
          await new Promise((res) => window.setTimeout(res, 270));
        }
        await runCascadeLoop(comboSourceGrid, [posA, posB], specialComboBlast, nextMoves);
        return;
      }

      // 2. Check if this swap creates a normal 3+ match
      const matchCheck = resolveBoardMatches(swappedGrid, 1, [posA, posB]);
      if (!matchCheck) {
        // Invalid move: animate shake and do NOT deduct a move
        soundManager.playInvalidSwap();
        setInvalidPair([`${posA.row},${posA.col}`, `${posB.row},${posB.col}`]);
        window.setTimeout(() => setInvalidPair([]), 260);
        return;
      }

      // Valid move! Deduct 1 move and run cascades
      const nextMoves = movesLeft - 1;
      setMovesLeft(nextMoves);
      setGrid(swappedGrid);
      await runCascadeLoop(swappedGrid, [posA, posB], null, nextMoves);
    },
    [gameState, grid, isProcessing, movesLeft, runCascadeLoop]
  );

  // Execute targeted booster on a board cell (`hammer`, `color_bomb`, `striped_candy`, `wrapped_candy`, `row_blast`, `col_blast`)
  const applyTargetedBoosterOnCell = useCallback(
    async (row: number, col: number, booster: BoosterType) => {
      const targetCell = grid[row]?.[col];
      if (!targetCell || targetCell.hole) return;

      // Consume 1 booster from inventory
      setSaveData((prev) => ({
        ...prev,
        boosters: {
          ...prev.boosters,
          [booster]: Math.max(0, (prev.boosters[booster] || 0) - 1),
        },
      }));
      setActiveBoosterMode(null);

      if (booster === 'hammer') {
        const clearSet = new Set<string>([`${row},${col}`]);
        const blast = finalizeClearSet(
          grid,
          clearSet,
          [],
          [
            {
              id: nextCandyId(),
              row,
              col,
              colorHex: '#FF3366',
              type: 'shockwave',
            },
          ],
          false,
          1,
          'wrapped_1'
        );
        await runCascadeLoop(grid, undefined, blast, movesLeft);
      } else if (booster === 'striped_candy') {
        // Striped Candy Booster: Blast entire row & column with dual laser beams!
        const clearSet = new Set<string>();
        for (let c = 0; c < 8; c++) {
          if (!grid[row][c].hole) clearSet.add(`${row},${c}`);
        }
        for (let r = 0; r < 8; r++) {
          if (!grid[r][col].hole) clearSet.add(`${r},${col}`);
        }
        const blast = finalizeClearSet(
          grid,
          clearSet,
          [],
          [
            { id: nextCandyId(), row, col, colorHex: '#0EA5E9', type: 'beam_h' },
            { id: nextCandyId(), row, col, colorHex: '#38BDF8', type: 'beam_v' },
          ],
          true,
          2,
          'line'
        );
        triggerBanner('STRIPED CANDY BLAST!');
        await runCascadeLoop(grid, undefined, blast, movesLeft);
      } else if (booster === 'wrapped_candy') {
        // Wrapped Candy Booster: Convert tapped cell into a Wrapped Candy & trigger its 2-stage double explosion!
        const wrappedGrid = grid.map((rCells, rIdx) =>
          rCells.map((cCell, cIdx) =>
            rIdx === row && cIdx === col
              ? { ...cCell, special: 'wrapped' as const, isChargedWrapped: false }
              : cCell
          )
        );
        const clearSet = new Set<string>([`${row},${col}`]);
        const blast = finalizeClearSet(
          wrappedGrid,
          clearSet,
          [],
          [
            {
              id: nextCandyId(),
              row,
              col,
              colorHex: '#EC4899',
              type: 'shockwave',
            },
          ],
          true,
          2,
          'wrapped_1'
        );
        triggerBanner('WRAPPED CANDY DOUBLE BLAST!');
        await runCascadeLoop(wrappedGrid, undefined, blast, movesLeft);
      } else if (booster === 'row_blast') {
        const clearSet = new Set<string>();
        for (let c = 0; c < 8; c++) {
          if (!grid[row][c].hole) clearSet.add(`${row},${c}`);
        }
        const blast = finalizeClearSet(
          grid,
          clearSet,
          [],
          [{ id: nextCandyId(), row, col, colorHex: '#0EA5E9', type: 'beam_h' }],
          false,
          2,
          'line'
        );
        await runCascadeLoop(grid, undefined, blast, movesLeft);
      } else if (booster === 'col_blast') {
        const clearSet = new Set<string>();
        for (let r = 0; r < 8; r++) {
          if (!grid[r][col].hole) clearSet.add(`${r},${col}`);
        }
        const blast = finalizeClearSet(
          grid,
          clearSet,
          [],
          [{ id: nextCandyId(), row, col, colorHex: '#10B981', type: 'beam_v' }],
          false,
          2,
          'line'
        );
        await runCascadeLoop(grid, undefined, blast, movesLeft);
      } else if (booster === 'color_bomb') {
        // Place a Colour Bomb and immediately detonate all candies of that cell's color with lightning arcs!
        const targetColor = targetCell.color;
        const clearSet = new Set<string>([`${row},${col}`]);
        const bombParticles: ParticleFX[] = [
          { id: nextCandyId(), row, col, colorHex: '#FACC15', type: 'rainbow' },
        ];
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (!grid[r][c].hole && grid[r][c].color === targetColor) {
              clearSet.add(`${r},${c}`);
              bombParticles.push({
                id: nextCandyId(),
                row,
                col,
                targetRow: r,
                targetCol: c,
                colorHex: CANDY_HEX_MAP[targetColor],
                type: 'lightning',
              });
            }
          }
        }
        const blast = finalizeClearSet(
          grid,
          clearSet,
          [],
          bombParticles,
          true,
          2,
          'color_bomb'
        );
        await runCascadeLoop(grid, undefined, blast, movesLeft);
      }
    },
    [grid, movesLeft, runCascadeLoop, triggerBanner]
  );

  // Activate a booster button from the bottom bar
  const handleBoosterClick = (type: BoosterType) => {
    if (isProcessing || gameState !== 'PLAYING') return;
    soundManager.playButton();

    const count = saveData.boosters[type] || 0;
    if (count <= 0) {
      setShowShop(true);
      return;
    }

    if (type === ('ActiveCancel' as unknown as BoosterType) || activeBoosterMode === type) {
      setActiveBoosterMode(null);
      return;
    }

    // Instant boosters (`shuffle`, `extra_moves`, `extra_life`) execute immediately
    if (type === 'shuffle') {
      setSaveData((prev) => ({
        ...prev,
        boosters: { ...prev.boosters, shuffle: Math.max(0, prev.boosters.shuffle - 1) },
      }));
      soundManager.playSpecialCreated('wrapped');
      triggerBanner('Board Reshuffled!');
      setGrid((prev) => shuffleBoard(prev, levelConfig.spawnColors));
      return;
    }

    if (type === 'extra_moves') {
      setSaveData((prev) => ({
        ...prev,
        boosters: {
          ...prev.boosters,
          extra_moves: Math.max(0, prev.boosters.extra_moves - 1),
        },
      }));
      soundManager.playCoinReward();
      setMovesLeft((m) => m + 5);
      triggerBanner('+5 Extra Moves Added!');
      return;
    }

    if (type === 'extra_life') {
      setSaveData((prev) => ({
        ...prev,
        boosters: {
          ...prev.boosters,
          extra_life: Math.max(0, (prev.boosters.extra_life || 0) - 1),
        },
      }));
      soundManager.playVictory();
      setMovesLeft((m) => m + 5);
      setGrid((prev) => shuffleBoard(prev, levelConfig.spawnColors));
      triggerBanner('Extra Life Activated! +5 Moves & Fresh Board!');
      return;
    }

    // Targeted boosters wait for the user to tap a board cell
    setActiveBoosterMode(type);
    setSelectedCell(null);
  };

  // Cell pointer & click handlers (supporting both Click-Click and Touch/Mouse Drag Swipes)
  const handleCellPointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    row: number,
    col: number
  ) => {
    if (isProcessing || gameState !== 'PLAYING') return;
    const cell = grid[row]?.[col];
    if (!cell || cell.hole) return;

    if (activeBoosterMode) {
      applyTargetedBoosterOnCell(row, col, activeBoosterMode);
      return;
    }

    swipeStartRef.current = { row, col, x: e.clientX, y: e.clientY };

    if (!selectedCell) {
      soundManager.playButton();
      setSelectedCell({ row, col });
    } else if (selectedCell.row === row && selectedCell.col === col) {
      setSelectedCell(null);
    } else if (areAdjacent(selectedCell, { row, col })) {
      attemptSwap(selectedCell, { row, col });
    } else {
      soundManager.playButton();
      setSelectedCell({ row, col });
    }
  };

  const handleCellPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!swipeStartRef.current || isProcessing || activeBoosterMode) return;
    const dx = e.clientX - swipeStartRef.current.x;
    const dy = e.clientY - swipeStartRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist >= 24) {
      const { row, col } = swipeStartRef.current;
      swipeStartRef.current = null;
      let targetRow = row;
      let targetCol = col;
      if (Math.abs(dx) > Math.abs(dy)) {
        targetCol += dx > 0 ? 1 : -1;
      } else {
        targetRow += dy > 0 ? 1 : -1;
      }
      if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
        attemptSwap({ row, col }, { row: targetRow, col: targetCol });
      }
    }
  };

  const handleCellPointerUp = () => {
    swipeStartRef.current = null;
  };

  // Shop & Daily Reward handlers
  const handleBuyBooster = (type: BoosterType, cost: number, qty: number): boolean => {
    if (saveData.coins < cost) return false;
    soundManager.playCoinReward();
    setSaveData((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      boosters: {
        ...prev.boosters,
        [type]: (prev.boosters[type] || 0) + qty,
      },
    }));
    return true;
  };

  const handleBuyBundle = (
    cost: number,
    items: Partial<Record<BoosterType, number>>
  ): boolean => {
    if (saveData.coins < cost) return false;
    soundManager.playGiftOpen();
    window.setTimeout(() => soundManager.playCoinReward(), 180);
    setSaveData((prev) => {
      const nextBoosters = { ...prev.boosters };
      (Object.keys(items) as BoosterType[]).forEach((k) => {
        nextBoosters[k] = (nextBoosters[k] || 0) + (items[k] || 0);
      });
      return {
        ...prev,
        coins: prev.coins - cost,
        boosters: nextBoosters,
      };
    });
    return true;
  };

  const handleClaimDailyReward = (): DailyRewardTier | null => {
    if (!canClaimDailyReward(saveData)) return null;
    const dayIndex = saveData.dailyRewardStreak % 7;
    const tier = DAILY_REWARD_TIERS[dayIndex];
    soundManager.playGiftOpen();
    if (tier.coins > 0) {
      window.setTimeout(() => soundManager.playCoinReward(), 180);
    }
    if (tier.specialGiftBundle) {
      window.setTimeout(() => soundManager.playVictory(), 320);
    }

    const todayKey = getTodayDateString();
    const dailyRewardId = `daily-${todayKey}-streak-${saveData.dailyRewardStreak + 1}`;

    setSaveData((prev) => {
      if ((prev.syncedRewardIds || []).includes(dailyRewardId)) {
        return prev;
      }
      const nextBoosters = { ...prev.boosters };
      if (tier.specialGiftBundle) {
        (Object.keys(tier.specialGiftBundle) as BoosterType[]).forEach((bKey) => {
          nextBoosters[bKey] =
            (nextBoosters[bKey] || 0) + (tier.specialGiftBundle?.[bKey] || 0);
        });
      } else if (tier.booster) {
        nextBoosters[tier.booster.type] =
          (nextBoosters[tier.booster.type] || 0) + tier.booster.count;
      }
      const nextSyncedIds = [...(prev.syncedRewardIds || []).slice(-99), dailyRewardId];
      return {
        ...prev,
        coins: prev.coins + tier.coins,
        boosters: nextBoosters,
        dailyRewardLastClaimDate: todayKey,
        dailyRewardStreak: prev.dailyRewardStreak + 1,
        syncedRewardIds: nextSyncedIds,
        pendingSyncCount: isOnline ? prev.pendingSyncCount || 0 : (prev.pendingSyncCount || 0) + 1,
        lastSyncedAt: isOnline ? new Date().toISOString() : prev.lastSyncedAt,
      };
    });
    return tier;
  };

  const handleUpdateSettings = (nextSettings: GameSettings) => {
    setSaveData((prev) => ({
      ...prev,
      settings: nextSettings,
    }));
  };

  const handleResetProgress = () => {
    const fresh = resetSaveData();
    setSaveData(fresh);
    setSavedSession(null);
    startLevel(1);
    setGameState('TITLE_MENU');
  };

  const dailyAvailable = canClaimDailyReward(saveData);
  const star3Target = levelConfig.objective.starThresholds[2];
  const progressPct = Math.min(100, Math.round((score / star3Target) * 100));

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#180D1E] text-[#FFF9F2] flex flex-col select-none"
      onPointerUp={handleCellPointerUp}
    >
      {/* =====================================================================
          0. STARTUP SPLASH SCREEN (Initial App Entry Screen)
      ===================================================================== */}
      {gameState === 'SPLASH' && (
        <SplashScreen
          heroImgFailed={heroImgFailed}
          onHeroImgError={() => setHeroImgFailed(true)}
          onComplete={() => setGameState('TITLE_MENU')}
        />
      )}

      {/* =====================================================================
          1. PREMIUM FANTASY CANDY HOME SCREEN (Full-Viewport Game Shell)
      ===================================================================== */}
      {gameState === 'TITLE_MENU' && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
          {/* Magical Fantasy Candy World Environment: Candy Mountains, Chocolate Drips, Lollipops & Floating 3D Candies */}
          <CandyWorldDecor
            heroImgFailed={heroImgFailed}
            onHeroImgError={() => setHeroImgFailed(true)}
          />

          {/* Top Perimeter Bar: Player Profile Icon, Coins Balance, Sound & Music Controls, Settings */}
          <header className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-8 pt-4 sm:pt-6 flex items-center justify-between gap-2 sm:gap-4">
            {/* Left Cluster: Player Profile Icon + Coins Balance */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* 3. Guest Player Profile Button */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setShowProfile(true);
                }}
                aria-label="Open Guest Player Profile"
                className="btn-3d-plum pl-1.5 pr-3 py-1.5 rounded-2xl flex items-center gap-2 border border-amber-300/40"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1A0B26] border border-amber-300/80 p-1 flex items-center justify-center shrink-0">
                  <CandyAvatarSVG avatarId={saveData.playerAvatar || 'red'} />
                </div>
                <div className="text-left hidden xs:block sm:block">
                  <span className="block text-xs font-extrabold text-white leading-tight truncate max-w-[110px]">
                    {saveData.playerName || 'Sweet Player'}
                  </span>
                  <span className="block text-[10px] font-mono-tabular text-amber-300 font-semibold">
                    Lv. {saveData.currentLevel} ·{' '}
                    {Object.values(saveData.levelStars).reduce((a, b) => a + b, 0)}★
                  </span>
                </div>
                <User className="w-4 h-4 text-amber-300 sm:hidden" />
              </button>

              {/* 4. Coins Balance Button */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setShowShop(true);
                }}
                aria-label="Coins Balance and Shop"
                className="btn-3d-plum px-3 sm:px-4 py-2 rounded-2xl flex items-center gap-2 border border-amber-300/40"
              >
                <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                <span className="font-mono-tabular font-extrabold text-xs sm:text-sm text-amber-300">
                  {saveData.coins.toLocaleString()}
                </span>
                <span className="w-4 h-4 rounded-full bg-amber-400 text-[#2B1204] font-black text-xs flex items-center justify-center leading-none">
                  +
                </span>
              </button>
            </div>

            {/* Right Cluster: PWA Install + 8. Sound & Music Controls + 6. Settings Button */}
            <div className="flex items-center gap-2">
              <PWAInstallButton />

              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  handleUpdateSettings({
                    ...saveData.settings,
                    music: !saveData.settings.music,
                  });
                }}
                aria-label="Toggle Background Music"
                title="Toggle Music"
                className={`btn-3d-plum px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 border ${
                  saveData.settings.music ? 'border-emerald-400/45' : 'border-rose-400/40 opacity-80'
                }`}
              >
                <Music
                  className={`w-4 h-4 ${
                    saveData.settings.music ? 'text-emerald-300' : 'text-rose-400'
                  }`}
                />
                <span className="hidden sm:inline">
                  {saveData.settings.music ? 'Music ON' : 'Music OFF'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleUpdateSettings({
                    ...saveData.settings,
                    sound: !saveData.settings.sound,
                  });
                }}
                aria-label="Toggle Sound Effects"
                title="Toggle Sound Effects"
                className={`btn-3d-plum px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 border ${
                  saveData.settings.sound ? 'border-amber-300/45' : 'border-rose-400/40 opacity-80'
                }`}
              >
                {saveData.settings.sound ? (
                  <Volume2 className="w-4 h-4 text-amber-300" />
                ) : (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                )}
                <span className="hidden sm:inline">
                  {saveData.settings.sound ? 'Sound ON' : 'Sound OFF'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setShowSettings(true);
                }}
                aria-label="Open Settings"
                title="Settings"
                className="btn-3d-plum p-2.5 rounded-2xl text-[#FFF9F2] border border-white/15"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
              </button>
            </div>
          </header>

          {/* Center Hero Stage: 1. SWEET BLAST 3D Logo + Animated 3D Candies + 2. Large PLAY Button */}
          <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center max-w-2xl mx-auto">
            {/* 1. SWEET BLAST 3D Logo at the Top */}
            <SweetBlastLogoSVG className="w-full max-w-[310px] sm:max-w-[430px]" />

            {/* Glossy 3D Candy Collection Showcase Bar */}
            <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 sm:gap-3.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-3xl bg-[#240E38]/90 border-2 border-amber-300/45 shadow-[0_10px_28px_rgba(0,0,0,0.65)]">
              {(['red', 'blue', 'green', 'yellow', 'purple', 'orange'] as CandyColor[]).map(
                (col, i) => (
                  <div
                    key={col}
                    className="w-9 h-9 sm:w-12 sm:h-12 transition-transform hover:scale-110"
                  >
                    <CandyPiece
                      color={col}
                      special={i === 1 ? 'striped_h' : i === 3 ? 'wrapped' : 'none'}
                    />
                  </div>
                )
              )}
            </div>

            {/* Current Stage Indicator */}
            <div className="mt-3 px-4 py-1 rounded-full bg-black/45 border border-white/15 text-xs sm:text-sm font-semibold text-amber-200">
              <span>
                Chapter {Math.floor((saveData.currentLevel - 1) / 100) + 1}:{' '}
                {getLevelConfig(saveData.currentLevel).chapterName}
              </span>
              <span aria-hidden="true" className="mx-2">
                ·
              </span>
              <span className="text-white font-bold">Level {saveData.currentLevel}</span>
            </div>

            {/* 2. Large Beautiful PLAY Button in the Center -> Opens the Level Map! + Offline Session Resume */}
            <div className="mt-5 sm:mt-6 flex flex-col items-center justify-center gap-2.5 w-full">
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setShowLevelMap(true);
                }}
                className="btn-3d-pink group relative min-w-[240px] sm:min-w-[290px] py-4 sm:py-5 px-10 sm:px-14 rounded-3xl font-display text-2xl sm:text-4xl font-black tracking-wider text-white border-2 border-amber-200/80 flex items-center justify-center gap-3.5 animate-pulse-glow"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white ml-0.5" />
                </div>
                <span className="drop-shadow-[0_3px_3px_rgba(0,0,0,0.45)]">PLAY</span>
              </button>

              {savedSession && savedSession.movesLeft > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButton();
                    resumeSavedLevel();
                  }}
                  className="btn-3d-gold px-5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold text-[#2B1204] border border-white flex items-center gap-2 shadow-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>
                    Resume Level {savedSession.levelNumber} ({savedSession.movesLeft} Moves Left ·{' '}
                    {savedSession.score.toLocaleString()} pts)
                  </span>
                </button>
              )}
            </div>

            {/* Bottom Action Dock: 5. Daily Rewards, Level Map, 7. Shop, 6. Settings */}
            <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
              {/* 5. Daily Rewards Button */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setShowDailyReward(true);
                }}
                className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 whitespace-nowrap shrink-0 border ${
                  dailyAvailable
                    ? 'btn-3d-gold border-white'
                    : 'btn-3d-plum text-[#FFF9F2] border-amber-300/30'
                }`}
              >
                <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t.dailyBonus}</span>
                {dailyAvailable && (
                  <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black">
                    NEW
                  </span>
                )}
              </button>

              {/* 7. Shop Button */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setShowShop(true);
                }}
                className="btn-3d-plum px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-[#FFF9F2] border border-amber-300/30 flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                <span>{t.shop}</span>
              </button>

              {/* Kingdom Level Map Button */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setShowLevelMap(true);
                }}
                className="btn-3d-plum px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-[#FFF9F2] border border-amber-300/30 flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <MapIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                <span>{t.levels}</span>
              </button>

              {/* Guest Profile Button */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setShowProfile(true);
                }}
                className="btn-3d-plum px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-[#FFF9F2] border border-amber-300/30 flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
                <span>Profile</span>
              </button>

              {/* Global Leaderboard (Online Feature with Offline Fallback Screen) */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setShowLeaderboard(true);
                }}
                className="btn-3d-plum px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-[#FFF9F2] border border-amber-300/30 flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                <span>Leaderboard</span>
              </button>

              {/* 6. Settings Button */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setShowSettings(true);
                }}
                className="btn-3d-plum px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-[#FFF9F2] border border-amber-300/30 flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-sky-300" />
                <span>{t.settings}</span>
              </button>
            </div>
          </main>

          {/* Single Flat Control-Hint Line at Bottom */}
          <footer className="relative z-10 pb-3.5 pt-1 px-4 text-center">
            <p className="text-xs text-[#FFF9F2]/90 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] tracking-wide">
              Click PLAY to Open Level Map · Swipe or Click Candies to Swap · Space Hint · Esc Pause
            </p>
          </footer>
        </div>
      )}

      {/* =====================================================================
          2. ACTIVE GAMEPLAY VIEW (8x8 Board + Low-Occlusion Perimeter HUD)
      ===================================================================== */}
      {gameState !== 'TITLE_MENU' && gameState !== 'SPLASH' && (
        <div className="relative w-full h-full flex flex-col justify-between max-w-5xl mx-auto px-2.5 sm:px-6 py-2 sm:py-4">
          {/* Top Perimeter HUD */}
          <header className="w-full flex items-center justify-between gap-2 sm:gap-4 px-3.5 py-2.5 rounded-2xl board-tray-3d">
            {/* Left Zone: Level & Objective Target */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="px-3 py-1.5 rounded-xl bg-[#1A0B24] border border-[#4D2C66] text-center shrink-0">
                <span className="block text-[10px] text-[#D9C3B0] font-semibold">
                  {t.level}
                </span>
                <span className="font-display text-base sm:text-lg font-extrabold font-mono-tabular text-amber-300">
                  {levelConfig.levelNumber}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFF9F2] truncate">
                  <span>{levelConfig.objective.description}</span>
                </div>

                {/* Dynamic Objective Counter */}
                <div className="flex items-center gap-3 mt-1 text-xs text-[#D9C3B0] font-mono-tabular">
                  {(levelConfig.objective.type === 'clear_icing' ||
                    levelConfig.objective.type === 'hybrid') && (
                    <span>
                      Frosting Left: <strong className="text-sky-300">{remainingBlockersCount}</strong>
                    </span>
                  )}
                  {(levelConfig.objective.type === 'collect_color' ||
                    levelConfig.objective.type === 'hybrid') &&
                    levelConfig.objective.targetColor && (
                      <span className="flex items-center gap-1">
                        <span>Collected:</span>
                        <strong className="text-amber-300">
                          {collectedColors[levelConfig.objective.targetColor] || 0} /{' '}
                          {levelConfig.objective.targetColorCount}
                        </strong>
                      </span>
                    )}
                  {levelConfig.objective.type === 'score' && (
                    <span>
                      {t.target}:{' '}
                      <strong className="text-amber-300">
                        {levelConfig.objective.targetScore.toLocaleString()}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center Zone: Score & 3-Star Progress Bar */}
            <div className="hidden md:flex flex-col items-center flex-1 max-w-xs px-2">
              <div className="w-full flex items-center justify-between text-xs mb-1">
                <span className="text-[#D9C3B0] font-semibold">{t.score}</span>
                <span className="font-mono-tabular font-extrabold text-white">
                  {score.toLocaleString()}
                </span>
              </div>
              <div className="relative w-full h-3 rounded-full bg-[#160820] border border-[#492961] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF3366] via-[#F59E0B] to-[#FACC15] transition-all duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Right Zone: Moves Left + Utility Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile Compact Score */}
              <div className="md:hidden text-right mr-1">
                <span className="block text-[10px] text-[#D9C3B0]">{t.score}</span>
                <span className="font-mono-tabular font-bold text-xs text-white">
                  {score.toLocaleString()}
                </span>
              </div>

              {/* Synchronized Coins Balance Pill */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setShowShop(true);
                }}
                aria-label="Open Sweet Shop"
                title="Coins Balance & Sweet Shop"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A0B24] border border-amber-400/45 text-amber-300 hover:border-amber-300 transition-colors"
              >
                <Coins className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="font-mono-tabular font-extrabold text-xs sm:text-sm">
                  {saveData.coins.toLocaleString()}
                </span>
              </button>

              {/* Remaining Moves Badge */}
              <div
                className={`px-3.5 py-1.5 rounded-xl border text-center min-w-[64px] ${
                  movesLeft <= 5
                    ? 'bg-rose-950/90 border-rose-400 text-rose-200'
                    : 'bg-[#1A0B24] border-amber-400/50 text-amber-300'
                }`}
              >
                <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-85">
                  {t.moves}
                </span>
                <span className="font-display text-lg sm:text-xl font-black font-mono-tabular leading-none">
                  {movesLeft}
                </span>
              </div>

              {/* Hint Button */}
              <button
                type="button"
                onClick={() => {
                  if (isProcessing) return;
                  soundManager.playButton();
                  const moves = findValidMoves(grid);
                  if (moves.length > 0) setHintMove(moves[0]);
                }}
                aria-label="Show Hint"
                title="Show Valid Move Hint (Space)"
                className="btn-3d-plum p-2.5 rounded-xl text-amber-300"
              >
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Pause Button */}
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setGameState('PAUSED');
                }}
                aria-label="Pause Game"
                className="btn-3d-plum p-2.5 rounded-xl text-[#FFF9F2]"
              >
                <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </header>

          {/* Center Playfield: 8x8 Confectionery Board */}
          <main className="relative flex-1 flex flex-col items-center justify-center my-1 sm:my-2 min-h-0">
            {/* Active Booster Targeting Prompt or Cascade Status Banner */}
            {(activeBoosterMode || statusBanner) && (
              <div className="mb-2 px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>
                  {activeBoosterMode
                    ? `Tap any tile on the board to use ${activeBoosterMode.replace('_', ' ')}!`
                    : statusBanner}
                </span>
                {activeBoosterMode && (
                  <button
                    type="button"
                    onClick={() => setActiveBoosterMode(null)}
                    className="ml-2 underline text-xs font-extrabold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}

            {/* Responsive 8x8 Board Container */}
            <div
              onPointerMove={handleCellPointerMove}
              className={`relative aspect-square w-full max-w-[min(92vw,470px)] max-h-[min(64vh,470px)] p-2 sm:p-3 rounded-3xl board-tray-3d touch-none ${
                boardShake ? 'animate-board-shake' : ''
              }`}
            >
              <div className="relative w-full h-full grid grid-cols-8 grid-rows-8 gap-1 sm:gap-1.5 touch-none">
                {grid.map((rowCells, r) =>
                  rowCells.map((cell, c) => {
                    if (cell.hole) {
                      return (
                        <div
                          key={`hole_${r}_${c}`}
                          className="w-full h-full rounded-xl bg-black/20 border border-white/5"
                        />
                      );
                    }

                    const isSelected =
                      selectedCell?.row === r && selectedCell?.col === c;
                    const isHinted =
                      (hintMove?.from.row === r && hintMove?.from.col === c) ||
                      (hintMove?.to.row === r && hintMove?.to.col === c);
                    const isInvalid = invalidPair.includes(`${r},${c}`);
                    const isEven = (r + c) % 2 === 0;

                    return (
                      <button
                        key={cell.id}
                        type="button"
                        onPointerDown={(e) => handleCellPointerDown(e, r, c)}
                        onPointerMove={handleCellPointerMove}
                        aria-label={`Row ${r + 1} Column ${c + 1} ${cell.color} candy`}
                        className={`relative w-full h-full rounded-xl sm:rounded-2xl p-0.5 flex items-center justify-center transition-transform duration-150 touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                          isEven ? 'cell-well-even' : 'cell-well-odd'
                        } ${
                          isSelected
                            ? 'ring-2 sm:ring-3 ring-amber-300 scale-105 z-10 bg-[#4B2763]'
                            : isHinted
                            ? 'ring-2 ring-emerald-400 animate-pulse-glow z-10'
                            : ''
                        } ${
                          cell.isChargedWrapped
                            ? 'animate-charged-wrapped ring-2 ring-amber-300 z-10'
                            : ''
                        } ${isInvalid ? 'animate-invalid-shake' : ''} ${
                          cell.isMatched
                            ? 'animate-candy-pop'
                            : cell.isNew
                            ? 'animate-candy-drop'
                            : 'hover:scale-[1.04]'
                        }`}
                      >
                        <CandyPiece
                          color={cell.color}
                          special={cell.special}
                          blocker={cell.blocker}
                        />
                      </button>
                    );
                  })
                )}
              </div>

              {/* Non-Occluding Particle, Lightning & Laser Beam Overlay (`pointer-events: none`) */}
              <div className="absolute inset-2 sm:inset-3 pointer-events-none overflow-hidden rounded-2xl z-20">
                {/* Color Bomb Rainbow Lightning Arcs */}
                {particles.some((p) => p.type === 'lightning') && (
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full"
                  >
                    {particles
                      .filter((p) => p.type === 'lightning' && p.targetRow !== undefined && p.targetCol !== undefined)
                      .map((p) => {
                        const x1 = p.col * 12.5 + 6.25;
                        const y1 = p.row * 12.5 + 6.25;
                        const x2 = p.targetCol! * 12.5 + 6.25;
                        const y2 = p.targetRow! * 12.5 + 6.25;
                        const mx = (x1 + x2) / 2 + ((p.targetRow! % 2 === 0 ? 1 : -1) * 3.5);
                        const my = (y1 + y2) / 2 + ((p.targetCol! % 2 === 0 ? -1 : 1) * 3.5);
                        return (
                          <g key={p.id}>
                            <polyline
                              points={`${x1},${y1} ${mx},${my} ${x2},${y2}`}
                              fill="none"
                              stroke={p.colorHex}
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              opacity="0.9"
                            />
                            <polyline
                              points={`${x1},${y1} ${mx},${my} ${x2},${y2}`}
                              fill="none"
                              stroke="#FFFFFF"
                              strokeWidth="0.9"
                              strokeLinecap="round"
                            />
                            <circle cx={x2} cy={y2} r="3.2" fill="#FFFFFF" opacity="0.85" />
                          </g>
                        );
                      })}
                  </svg>
                )}

                {particles.map((p) => {
                  if (p.type === 'lightning') return null;
                  const topPct = (p.row / 8) * 100 + 6.25;
                  const leftPct = (p.col / 8) * 100 + 6.25;

                  if (p.type === 'beam_h') {
                    return (
                      <div
                        key={p.id}
                        style={{ top: `${(p.row / 8) * 100 + 1.25}%`, height: '10%' }}
                        className="absolute left-0 right-0 flex items-center justify-center animate-beam-h"
                      >
                        <div
                          style={{ backgroundColor: p.colorHex }}
                          className="w-full h-full opacity-80 blur-[2px] rounded-full"
                        />
                        <div className="absolute inset-x-0 h-[48%] bg-white shadow-[0_0_20px_#FFF] rounded-full" />
                      </div>
                    );
                  }

                  if (p.type === 'beam_v') {
                    return (
                      <div
                        key={p.id}
                        style={{ left: `${(p.col / 8) * 100 + 1.25}%`, width: '10%' }}
                        className="absolute top-0 bottom-0 flex items-center justify-center animate-beam-v"
                      >
                        <div
                          style={{ backgroundColor: p.colorHex }}
                          className="w-full h-full opacity-80 blur-[2px] rounded-full"
                        />
                        <div className="absolute inset-y-0 w-[48%] bg-white shadow-[0_0_20px_#FFF] rounded-full" />
                      </div>
                    );
                  }

                  if (p.type === 'shockwave' || p.type === 'double_shockwave' || p.type === 'rainbow') {
                    const isLarge = p.type === 'double_shockwave' || p.type === 'rainbow';
                    return (
                      <div
                        key={p.id}
                        style={{
                          top: `${topPct}%`,
                          left: `${leftPct}%`,
                          borderColor: p.colorHex,
                        }}
                        className={`absolute rounded-full border-4 animate-shockwave-ring ${
                          isLarge
                            ? 'w-44 h-44 shadow-[0_0_36px_#FACC15,inset_0_0_24px_#FF3366]'
                            : 'w-32 h-32 shadow-[0_0_24px_#FFF]'
                        }`}
                      >
                        <div
                          style={{ backgroundColor: p.colorHex }}
                          className="w-full h-full rounded-full opacity-35"
                        />
                      </div>
                    );
                  }

                  // Default 'burst': multi-shard radial candy destruction effect
                  return (
                    <div
                      key={p.id}
                      style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 animate-candy-pop"
                    >
                      <div
                        style={{ backgroundColor: p.colorHex }}
                        className="absolute inset-2 rounded-full opacity-85 shadow-[0_0_12px_#FFF]"
                      />
                      <span
                        style={{ backgroundColor: p.colorHex }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white/80"
                      />
                      <span
                        style={{ backgroundColor: p.colorHex }}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white/80"
                      />
                      <span
                        style={{ backgroundColor: p.colorHex }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white/80"
                      />
                      <span
                        style={{ backgroundColor: p.colorHex }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white/80"
                      />
                    </div>
                  );
                })}

                {/* Floating Score & Combo Callouts */}
                {floatingScores.map((fs) => (
                  <div
                    key={fs.id}
                    style={{
                      top: `${(fs.row / 8) * 100 + 4}%`,
                      left: `${(fs.col / 8) * 100 + 6}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-center animate-float-score z-30"
                  >
                    {fs.subtext && (
                      <span className="block font-display text-xs sm:text-sm font-black text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] whitespace-nowrap">
                        {fs.subtext}
                      </span>
                    )}
                    <span className="font-mono-tabular text-sm sm:text-base font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                      {fs.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* Bottom Perimeter Booster Dock (All 7 Shop Boosters Working) */}
          <footer className="w-full flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-2xl board-tray-3d">
            <div className="flex items-center justify-around sm:justify-center gap-1 sm:gap-2.5 w-full overflow-x-auto">
              {(
                [
                  { type: 'hammer', label: 'Hammer' },
                  { type: 'color_bomb', label: 'Color Bomb' },
                  { type: 'striped_candy', label: 'Striped' },
                  { type: 'wrapped_candy', label: 'Wrapped' },
                  { type: 'extra_moves', label: '+5 Moves' },
                  { type: 'extra_life', label: 'Extra Life' },
                  { type: 'shuffle', label: 'Shuffle' },
                ] as { type: BoosterType; label: string }[]
              ).map(({ type, label }) => {
                const count = saveData.boosters[type] || 0;
                const isArmed = activeBoosterMode === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleBoosterClick(type)}
                    className={`relative flex-1 min-w-[46px] max-w-[98px] py-1.5 px-1.5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-transform ${
                      isArmed
                        ? 'btn-3d-gold ring-2 ring-white scale-105'
                        : 'btn-3d-plum text-[#FFF9F2]'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <BoosterIconSVG type={type} className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="font-mono-tabular text-xs font-extrabold text-amber-300">
                        {count > 0 ? count : '+'}
                      </span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-semibold truncate max-w-full opacity-90">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </footer>
        </div>
      )}

      {/* =====================================================================
          3. PAUSE MODAL
      ===================================================================== */}
      {gameState === 'PAUSED' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-3xl board-tray-3d bg-[#241134] p-6 text-center space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#FFF9F2]">Game Paused</h2>
            <p className="text-xs text-[#D9C3B0]">
              {t.level} {levelConfig.levelNumber} · {levelConfig.objective.description}
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setGameState('PLAYING');
                }}
                className="btn-3d-pink w-full py-3 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Resume Game</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  startLevel(levelConfig.levelNumber);
                }}
                className="btn-3d-plum w-full py-3 rounded-2xl text-sm font-bold text-[#FFF9F2] flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.replay}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setShowSettings(true);
                }}
                className="btn-3d-plum w-full py-3 rounded-2xl text-sm font-bold text-[#FFF9F2] flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span>{t.settings}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setGameState('TITLE_MENU');
                }}
                className="btn-3d-plum w-full py-3 rounded-2xl text-sm font-bold text-amber-300"
              >
                Home Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. VICTORY & GAME OVER MODALS
      ===================================================================== */}
      {(gameState === 'ROUND_SUMMARY' || gameState === 'GAME_OVER') && (
        <WinLoseModal
          mode={gameState === 'ROUND_SUMMARY' ? 'victory' : 'gameover'}
          levelConfig={levelConfig}
          score={score}
          starsEarned={lastRoundResult.stars}
          coinsEarned={gameState === 'ROUND_SUMMARY' ? lastRoundResult.coinsEarned : 0}
          saveData={saveData}
          onNextLevel={() => startLevel(Math.min(TOTAL_LEVELS, levelConfig.levelNumber + 1))}
          onReplay={() => startLevel(levelConfig.levelNumber)}
          onUseExtraMoves={() => {
            if ((saveData.boosters.extra_life || 0) > 0) {
              setSaveData((prev) => ({
                ...prev,
                boosters: {
                  ...prev.boosters,
                  extra_life: Math.max(0, (prev.boosters.extra_life || 0) - 1),
                },
              }));
              setMovesLeft(5);
              setGrid((prev) => shuffleBoard(prev, levelConfig.spawnColors));
              setGameState('PLAYING');
              triggerBanner('Extra Life Activated! +5 Moves & Fresh Board!');
            } else if ((saveData.boosters.extra_moves || 0) > 0) {
              setSaveData((prev) => ({
                ...prev,
                boosters: {
                  ...prev.boosters,
                  extra_moves: Math.max(0, prev.boosters.extra_moves - 1),
                },
              }));
              setMovesLeft(5);
              setGameState('PLAYING');
            } else if (saveData.coins >= 250) {
              setSaveData((prev) => ({
                ...prev,
                coins: prev.coins - 250,
              }));
              setMovesLeft(5);
              setGameState('PLAYING');
            }
          }}
          onOpenMap={() => {
            setGameState('TITLE_MENU');
            setShowLevelMap(true);
          }}
        />
      )}

      {/* =====================================================================
          5. KINGDOM MAP, SHOP, DAILY REWARDS & SETTINGS MODALS
      ===================================================================== */}
      {showLevelMap && (
        <LevelMapModal
          saveData={saveData}
          onSelectLevel={(lvl) => startLevel(lvl)}
          onClose={() => setShowLevelMap(false)}
        />
      )}

      {showShop && (
        <ShopModal
          saveData={saveData}
          onBuyBooster={handleBuyBooster}
          onBuyBundle={handleBuyBundle}
          onClose={() => setShowShop(false)}
          onOpenDailyRewards={() => setShowDailyReward(true)}
        />
      )}

      {showDailyReward && (
        <DailyRewardModal
          saveData={saveData}
          onClaimDaily={handleClaimDailyReward}
          onClose={() => setShowDailyReward(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={saveData.settings}
          onUpdateSettings={handleUpdateSettings}
          onResetProgress={handleResetProgress}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showProfile && (
        <PlayerProfileModal
          saveData={saveData}
          onUpdateProfile={(playerName, playerAvatar) =>
            setSaveData((prev) => ({
              ...prev,
              playerName,
              playerAvatar,
            }))
          }
          onClose={() => setShowProfile(false)}
        />
      )}

      {showLeaderboard && (
        <OnlineLeaderboardModal
          saveData={saveData}
          isOnline={isOnline}
          simulatedOffline={simulatedOffline}
          onToggleSimulatedOffline={() => {
            soundManager.playButton();
            setSimulatedOffline(!simulatedOffline);
          }}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Offline Game Mode Indicator & Safe Reconnect Toast */}
      {gameState !== 'SPLASH' && (
        <OfflineStatusBadge
          isOnline={isOnline}
          syncToast={syncToast}
          onClick={() => {
            soundManager.playButton();
            setShowLeaderboard(true);
          }}
        />
      )}
    </div>
  );
}
