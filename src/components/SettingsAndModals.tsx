import React, { useState } from 'react';
import {
  Coins,
  Globe,
  RotateCcw,
  Settings,
  Smartphone,
  Star,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { GameSettings, LanguageCode, LevelConfig, SaveData } from '../types/game';
import { TRANSLATIONS } from '../systems/i18n';
import { soundManager } from '../systems/soundManager';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (next: GameSettings) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

const LANGUAGE_LABELS: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
  { code: 'hi', label: 'हिन्दी' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const t = TRANSLATIONS[settings.language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl board-tray-3d bg-[#221130] text-[#FFF9F2] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#4A2B5E] bg-[#1A0B24]">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-amber-300" />
            <h2 className="font-display text-xl font-bold text-[#FFF9F2]">{t.settings}</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playButton();
              onClose();
            }}
            aria-label="Close Settings"
            className="p-2 rounded-xl bg-[#341C47] hover:bg-[#46265E] text-[#FFF9F2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Audio & Haptics Toggles */}
          <div className="space-y-3">
            {/* Music */}
            <div className="p-3.5 rounded-2xl bg-[#2A153B] border border-[#46275E] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {settings.music ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  )}
                  <span className="text-sm font-semibold">{t.music}</span>
                  <span className="text-xs font-mono-tabular text-amber-300 font-bold">
                    {Math.round(settings.musicVolume * 100)}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButton();
                    onUpdateSettings({ ...settings, music: !settings.music });
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    settings.music
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-[#1B0C26] text-[#9A82A8]'
                  }`}
                >
                  {settings.music ? 'ON' : 'OFF'}
                </button>
              </div>
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={settings.musicVolume}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, musicVolume: parseFloat(e.target.value) })
                }
                aria-label="Music Volume"
                className="w-full accent-[#FF3366]"
              />
            </div>

            {/* Sound FX */}
            <div className="p-3.5 rounded-2xl bg-[#2A153B] border border-[#46275E] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {settings.sound ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  )}
                  <span className="text-sm font-semibold">{t.sound}</span>
                  <span className="text-xs font-mono-tabular text-amber-300 font-bold">
                    {Math.round(settings.soundVolume * 100)}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextSound = !settings.sound;
                    onUpdateSettings({ ...settings, sound: nextSound });
                    if (nextSound) {
                      window.setTimeout(() => soundManager.playButton(), 30);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    settings.sound
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-[#1B0C26] text-[#9A82A8]'
                  }`}
                >
                  {settings.sound ? 'ON' : 'OFF'}
                </button>
              </div>
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={settings.soundVolume}
                onChange={(e) => {
                  onUpdateSettings({ ...settings, soundVolume: parseFloat(e.target.value) });
                  soundManager.playButton();
                }}
                aria-label="Sound Effects Volume"
                className="w-full accent-[#FF3366]"
              />
            </div>

            {/* Vibration */}
            <div className="p-3.5 rounded-2xl bg-[#2A153B] border border-[#46275E] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-semibold">{t.vibration}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  onUpdateSettings({ ...settings, vibration: !settings.vibration });
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  settings.vibration
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-[#1B0C26] text-[#9A82A8]'
                }`}
              >
                {settings.vibration ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Language Selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D9C3B0]">
              <Globe className="w-4 h-4 text-amber-300" />
              <span>{t.language}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGE_LABELS.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    soundManager.playButton();
                    onUpdateSettings({ ...settings, language: lang.code });
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    settings.language === lang.code
                      ? 'bg-[#FF3366] text-white shadow-sm'
                      : 'bg-[#2A153B] text-[#D9C3B0] hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Special Candy Combo Guide */}
          <div className="p-3.5 rounded-2xl bg-[#1A0B24] border border-[#3F2352] space-y-1.5 text-xs text-[#D9C3B0]">
            <h4 className="font-bold text-amber-300">Special Candy Guide</h4>
            <p>· Match 4 in a line: Creates a Striped Line Blast candy.</p>
            <p>· Match in L or T shape: Creates a 3x3 Wrapped Foil Bomb.</p>
            <p>· Match 5 in a line: Creates a Rainbow Colour Bomb.</p>
            <p>· Swap any 2 Special Candies together for mega board-clearing combinations!</p>
          </div>

          {/* Reset Save Progress */}
          <div className="pt-2 border-t border-[#3F2352] flex items-center justify-between">
            <span className="text-xs text-[#D9C3B0]">Save Data (Local Storage)</span>
            {!confirmingReset ? (
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setConfirmingReset(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-950/80 border border-rose-500/40 text-xs font-bold text-rose-200 hover:bg-rose-900"
              >
                {t.resetProgress}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButton();
                    onResetProgress();
                    setConfirmingReset(false);
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white"
                >
                  {t.confirmReset}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingReset(false)}
                  className="px-3 py-2 rounded-xl bg-[#341C47] text-xs font-semibold text-[#D9C3B0]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface WinLoseModalProps {
  mode: 'victory' | 'gameover';
  levelConfig: LevelConfig;
  score: number;
  starsEarned: number;
  coinsEarned: number;
  saveData: SaveData;
  onNextLevel: () => void;
  onReplay: () => void;
  onUseExtraMoves: () => void;
  onOpenMap: () => void;
}

export const WinLoseModal: React.FC<WinLoseModalProps> = ({
  mode,
  levelConfig,
  score,
  starsEarned,
  coinsEarned,
  saveData,
  onNextLevel,
  onReplay,
  onUseExtraMoves,
  onOpenMap,
}) => {
  const t = TRANSLATIONS[saveData.settings.language];
  const isVictory = mode === 'victory';
  const canContinueWithBooster =
    (saveData.boosters.extra_life || 0) > 0 ||
    (saveData.boosters.extra_moves || 0) > 0 ||
    saveData.coins >= 250;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-md rounded-3xl board-tray-3d bg-[#241134] p-6 text-center text-[#FFF9F2] space-y-5">
        {/* Top Emblem */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-600 flex items-center justify-center shadow-lg">
          {isVictory ? (
            <Trophy className="w-9 h-9 text-[#2B1204]" />
          ) : (
            <RotateCcw className="w-9 h-9 text-[#2B1204]" />
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-amber-300">
            {t.level} {levelConfig.levelNumber} · {levelConfig.chapterName}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold mt-1">
            {isVictory ? t.victoryTitle : t.gameOverTitle}
          </h2>
        </div>

        {/* 3-Star Display */}
        {isVictory && (
          <div className="flex items-center justify-center gap-3 py-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`p-2.5 rounded-2xl border ${
                  s <= starsEarned
                    ? 'bg-amber-400/20 border-amber-300 scale-105'
                    : 'bg-[#190B24] border-[#381F4C] opacity-50'
                }`}
              >
                <Star
                  className={`w-8 h-8 ${
                    s <= starsEarned
                      ? 'text-amber-300 fill-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.8)]'
                      : 'text-slate-600'
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Score & Coin Summary */}
        <div className="p-4 rounded-2xl bg-[#1A0B24] border border-[#422559] grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-[#D9C3B0]">{t.score}</p>
            <p className="font-mono-tabular text-xl font-extrabold text-white mt-0.5">
              {score.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#D9C3B0]">Reward</p>
            <p className="font-mono-tabular text-xl font-extrabold text-amber-300 mt-0.5 flex items-center justify-center gap-1">
              <Coins className="w-4 h-4" />
              +{coinsEarned}
            </p>
          </div>
        </div>

        {/* Actions */}
        {isVictory ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                soundManager.playButton();
                onReplay();
              }}
              className="btn-3d-plum flex-1 py-3 px-4 rounded-2xl text-sm font-bold text-[#FFF9F2]"
            >
              {t.replay}
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.playButton();
                onNextLevel();
              }}
              className="btn-3d-pink flex-1 py-3 px-5 rounded-2xl text-sm font-extrabold text-white"
            >
              {t.nextLevel}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {canContinueWithBooster && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playRetry();
                  onUseExtraMoves();
                }}
                className="btn-3d-gold w-full py-3 px-5 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2"
              >
                <span>
                  {(saveData.boosters.extra_life || 0) > 0
                    ? 'Revive with Extra Life'
                    : t.useExtraMoves}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">
                  {(saveData.boosters.extra_life || 0) > 0
                    ? `Use Extra Life (${saveData.boosters.extra_life})`
                    : (saveData.boosters.extra_moves || 0) > 0
                    ? `Use Booster (${saveData.boosters.extra_moves})`
                    : '250 Coins'}
                </span>
              </button>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  onOpenMap();
                }}
                className="btn-3d-plum flex-1 py-3 px-4 rounded-2xl text-sm font-bold text-[#FFF9F2]"
              >
                {t.levels}
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playRetry();
                  onReplay();
                }}
                className="btn-3d-pink flex-1 py-3 px-4 rounded-2xl text-sm font-extrabold text-white"
              >
                {t.retry}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
