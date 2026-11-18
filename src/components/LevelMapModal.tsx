import React, { useState } from 'react';
import { Lock, Play, Sparkles, Star, Trophy, X } from 'lucide-react';
import { CHAPTER_NAMES, getLevelConfig, TOTAL_LEVELS } from '../systems/levelManager';
import { soundManager } from '../systems/soundManager';
import { SaveData } from '../types/game';

interface LevelMapModalProps {
  saveData: SaveData;
  onSelectLevel: (levelNumber: number) => void;
  onClose: () => void;
}

export const LevelMapModal: React.FC<LevelMapModalProps> = ({
  saveData,
  onSelectLevel,
  onClose,
}) => {
  const initialChapter = Math.min(9, Math.floor((saveData.currentLevel - 1) / 100));
  const [selectedChapter, setSelectedChapter] = useState<number>(initialChapter);

  const startLevel = selectedChapter * 100 + 1;
  const endLevel = Math.min(TOTAL_LEVELS, (selectedChapter + 1) * 100);
  const levelsInChapter = Array.from(
    { length: endLevel - startLevel + 1 },
    (_, i) => startLevel + i
  );

  const totalStarsEarned = Object.values(saveData.levelStars).reduce((acc, s) => acc + s, 0);
  const activeLevelCfg = getLevelConfig(saveData.currentLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2.5 sm:p-6">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl board-tray-3d bg-[#221130] text-[#FFF9F2] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#4A2B5E] bg-[#1A0B24]">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#FFF9F2]">
              Candy Kingdom Level Map
            </h2>
            <p className="text-xs sm:text-sm text-[#D9C3B0] mt-0.5">
              Chapter {selectedChapter + 1}: {CHAPTER_NAMES[selectedChapter]} ·{' '}
              <span className="font-mono-tabular text-amber-300 font-bold">{totalStarsEarned}</span>{' '}
              Stars Collected · Unlocked up to{' '}
              <span className="font-mono-tabular text-white font-bold">
                Level {saveData.highestUnlockedLevel}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playButton();
                const ch = Math.min(9, Math.floor((saveData.highestUnlockedLevel - 1) / 100));
                setSelectedChapter(ch);
              }}
              className="btn-3d-plum px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 whitespace-nowrap shrink-0"
            >
              Jump to Lv. {saveData.highestUnlockedLevel}
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.playButton();
                onClose();
              }}
              aria-label="Close Kingdom Map"
              className="p-2 rounded-xl bg-[#341C47] hover:bg-[#46265E] text-[#FFF9F2] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Featured Next/Current Level Launch Banner */}
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-[#3D1A54] via-[#59226E] to-[#3B1852] border-b border-amber-300/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-[#2B1204] font-display font-black text-lg flex items-center justify-center shrink-0 shadow-md">
              {saveData.currentLevel}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Selected Stage · {activeLevelCfg.chapterName}</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white truncate">
                {activeLevelCfg.objective.description} · {activeLevelCfg.moves} Moves
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundManager.playButton();
              onSelectLevel(saveData.currentLevel);
            }}
            className="btn-3d-pink w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold text-white flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Level {saveData.currentLevel}</span>
          </button>
        </div>

        {/* 10 Chapter Selector Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-4 sm:px-6 py-2.5 bg-[#1E0E29] border-b border-[#3F2352]">
          {CHAPTER_NAMES.map((name, idx) => {
            const chStart = idx * 100 + 1;
            const chEnd = (idx + 1) * 100;
            const isActive = selectedChapter === idx;
            const isUnlocked = saveData.highestUnlockedLevel >= chStart;
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setSelectedChapter(idx);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#FF3366] text-white shadow-md'
                    : isUnlocked
                    ? 'bg-[#311A42] text-[#D9C3B0] hover:text-white'
                    : 'bg-[#21102D] text-[#8E7699]'
                }`}
              >
                <span>
                  {chStart}–{chEnd}
                </span>
                <span aria-hidden="true">·</span>
                <span>{name}</span>
              </button>
            );
          })}
        </div>

        {/* Level Nodes Grid (Unlocked & Locked Levels) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-2.5 sm:gap-3">
          {levelsInChapter.map((lvl) => {
            const isUnlocked = lvl <= saveData.highestUnlockedLevel;
            const isCurrent = lvl === saveData.currentLevel;
            const stars = saveData.levelStars[lvl] || 0;
            const isMilestone = lvl % 10 === 0;
            const cfg = getLevelConfig(lvl);

            return (
              <button
                key={lvl}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  soundManager.playButton();
                  onSelectLevel(lvl);
                }}
                className={`group relative min-h-[78px] rounded-2xl p-2 flex flex-col items-center justify-between transition-transform ${
                  isCurrent
                    ? 'btn-3d-pink text-white ring-2 ring-amber-300 scale-[1.03]'
                    : isUnlocked
                    ? isMilestone
                      ? 'btn-3d-gold'
                      : 'btn-3d-plum text-[#FFF9F2] hover:scale-[1.03]'
                    : 'bg-[#1B0D26] border border-[#341C45] text-[#6B5378] opacity-75 cursor-not-allowed'
                }`}
              >
                <div className="w-full flex items-center justify-between text-[10px] opacity-85">
                  <span className="font-mono-tabular font-semibold">
                    {cfg.objective.type === 'clear_icing'
                      ? 'ICE'
                      : cfg.objective.type === 'collect_color'
                      ? 'GEM'
                      : cfg.objective.type === 'hybrid'
                      ? 'MIX'
                      : 'PTS'}
                  </span>
                  {isMilestone && <Trophy className="w-3 h-3 text-amber-200" />}
                </div>

                <span className="font-display text-lg sm:text-xl font-extrabold font-mono-tabular leading-none">
                  {lvl}
                </span>

                {isUnlocked ? (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= stars
                            ? 'text-amber-300 fill-amber-300'
                            : 'text-black/40 fill-black/20'
                        }`}
                      />
                    ))}
                  </div>
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[#6B5378]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
