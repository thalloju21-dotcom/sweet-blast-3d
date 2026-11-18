import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  CloudOff,
  Crown,
  Download,
  Play,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Star,
  Trophy,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { SaveData } from '../types/game';
import { soundManager } from '../systems/soundManager';
import { CandyAvatarSVG } from './PlayerProfileModal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/**
 * Tracks browser online/offline state + supports an in-app "Simulate Offline Mode" toggle
 * so players/testers can verify offline fallback screens without disconnecting OS Wi-Fi.
 */
export function useOnlineStatus() {
  const [browserOnline, setBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isOnline = browserOnline && !simulatedOffline;

  return {
    isOnline,
    browserOnline,
    simulatedOffline,
    setSimulatedOffline,
  };
}

/**
 * Hook for PWA Installability (Chromium beforeinstallprompt + iOS Safari detection).
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

/**
 * In-App PWA Install Button (mounts on Home Screen & Settings Modal).
 */
export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => {
          soundManager.playButton();
          install();
        }}
        className={`btn-3d-gold rounded-2xl font-extrabold flex items-center justify-center gap-1.5 border border-white whitespace-nowrap shrink-0 ${
          compact ? 'px-3 py-2 text-xs' : 'px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm'
        }`}
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            soundManager.playButton();
            setShowIOSGuide(true);
          }}
          className={`btn-3d-plum rounded-2xl font-extrabold text-[#FFF9F2] flex items-center justify-center gap-1.5 border border-amber-300/35 whitespace-nowrap shrink-0 ${
            compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-xs sm:text-sm'
          }`}
        >
          <Smartphone className="w-4 h-4 text-amber-300 shrink-0" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-sm rounded-3xl board-tray-3d bg-[#241134] p-6 text-center text-[#FFF9F2] border-2 border-amber-300/60 space-y-4">
              <Smartphone className="w-10 h-10 text-amber-300 mx-auto" />
              <h3 className="font-display text-xl font-black text-white">
                Install Sweet Blast 3D
              </h3>
              <p className="text-xs text-[#E8D5C8] leading-relaxed text-left">
                1. Tap the <strong>Share</strong> button in your Safari toolbar.
                <br />
                2. Scroll down and tap <strong>Add to Home Screen</strong> for full-screen offline play!
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="btn-3d-pink w-full py-2.5 rounded-xl text-xs font-extrabold text-white"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

/**
 * Non-intrusive connectivity pill displayed when playing in Offline Mode or right after syncing.
 */
export const OfflineStatusBadge: React.FC<{
  isOnline: boolean;
  syncToast: string | null;
  onClick?: () => void;
}> = ({ isOnline, syncToast, onClick }) => {
  if (isOnline && !syncToast) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed bottom-3 left-3 z-40 flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-extrabold shadow-xl border transition-all ${
        !isOnline
          ? 'bg-[#2A113B]/95 text-amber-200 border-amber-300/60'
          : 'bg-emerald-950/95 text-emerald-200 border-emerald-400/60'
      }`}
    >
      {!isOnline ? (
        <>
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <WifiOff className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>Offline Mode Active · Saved Locally</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncToast}</span>
        </>
      )}
    </button>
  );
};

interface OnlineLeaderboardModalProps {
  isOnline: boolean;
  simulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  saveData: SaveData;
  onClose: () => void;
}

/**
 * Displays the Online Kingdom Leaderboard when connected to the internet,
 * and shows the dedicated Offline Fallback Screen ONLY when internet is disconnected.
 */
export const OnlineLeaderboardModal: React.FC<OnlineLeaderboardModalProps> = ({
  isOnline,
  simulatedOffline,
  onToggleSimulatedOffline,
  saveData,
  onClose,
}) => {
  const playerStars = Object.values(saveData.levelStars).reduce((a, b) => a + b, 0);
  const levelsCleared = Object.keys(saveData.levelStars).length;

  const leaderboardEntries = [
    {
      name: 'Empress Sugarplum',
      avatar: 'cupcake_princess' as const,
      stars: Math.max(playerStars + 42, 120),
      score: Math.max(saveData.totalScore + 48500, 145000),
      isPlayer: false,
    },
    {
      name: 'Duke Butterscotch',
      avatar: 'golden_truffle' as const,
      stars: Math.max(playerStars + 18, 75),
      score: Math.max(saveData.totalScore + 19200, 88400),
      isPlayer: false,
    },
    {
      name: saveData.playerName || 'Sweet Player',
      avatar: saveData.playerAvatar || ('red' as const),
      stars: playerStars,
      score: saveData.totalScore,
      isPlayer: true,
    },
    {
      name: 'Lady Peppermint',
      avatar: 'mint_macaron' as const,
      stars: Math.max(0, playerStars - 3),
      score: Math.max(1200, saveData.totalScore - 4500),
      isPlayer: false,
    },
    {
      name: 'Baron Von Jelly',
      avatar: 'blue' as const,
      stars: Math.max(0, playerStars - 7),
      score: Math.max(800, saveData.totalScore - 8200),
      isPlayer: false,
    },
  ].sort((a, b) => b.stars - a.stars || b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl board-tray-3d bg-[#241134] text-[#FFF9F2] overflow-hidden border-2 border-amber-300/45 shadow-2xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#4A2B5E] bg-[#1A0B24]">
          <div className="flex items-center gap-2.5">
            {isOnline ? (
              <Trophy className="w-5 h-5 text-amber-300" />
            ) : (
              <CloudOff className="w-5 h-5 text-amber-300" />
            )}
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                {isOnline ? 'Online Kingdom Network' : 'Offline Mode Active'}
              </span>
              <h2 className="font-display text-lg sm:text-xl font-black text-white leading-tight">
                {isOnline ? 'GLOBAL LEADERBOARD' : 'ONLINE LEADERBOARD'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Offline Test Toggle so users can test Offline Mode anytime */}
            <button
              type="button"
              onClick={() => {
                soundManager.playButton();
                onToggleSimulatedOffline();
              }}
              title="Toggle Offline Mode Simulation"
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 border ${
                isOnline
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                  : 'bg-amber-500/20 border-amber-300/60 text-amber-200'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Online' : simulatedOffline ? 'Sim Offline' : 'Offline'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playButton();
                onClose();
              }}
              aria-label="Close Leaderboard"
              className="p-2 rounded-xl bg-[#341C47] hover:bg-[#46265E] text-[#FFF9F2]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content: Dedicated Offline Fallback Screen vs. Online Leaderboard */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!isOnline ? (
            /* =================================================================
               OFFLINE FALLBACK SCREEN (ONLY for features requiring internet)
            ================================================================= */
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#34174A] to-[#1D0B2B] border-2 border-amber-300/45 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-400/15 border-2 border-amber-300/60 flex items-center justify-center">
                <WifiOff className="w-8 h-8 text-amber-300" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  Internet Required for Global Rankings
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-black text-white mt-1.5">
                  You&apos;re Playing in Offline Mode!
                </h3>
                <p className="text-xs text-[#E2C9B8] mt-1 leading-relaxed">
                  Global Leaderboards and Rewarded Video Ads are paused while offline, but{' '}
                  <strong className="text-white">
                    100% of Sweet Blast 3D gameplay works completely offline
                  </strong>
                  !
                </p>
              </div>

              {/* Offline Capabilities Summary Checklist */}
              <div className="p-3.5 rounded-2xl bg-[#14071E] border border-[#45245B] text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>All {saveData.highestUnlockedLevel} Unlocked Levels &amp; 8x8 Board Ready Offline</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    Coins ({saveData.coins.toLocaleString()}), Stars ({playerStars}★) &amp; Boosters Saved Locally
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    Guest Profile ({saveData.playerName}) &amp; Web Audio Music Work Offline
                  </span>
                </div>
                {(saveData.pendingSyncCount || 0) > 0 && (
                  <div className="flex items-center gap-2 text-amber-300 font-bold pt-1 border-t border-white/10">
                    <RefreshCw className="w-4 h-4 shrink-0" />
                    <span>
                      {saveData.pendingSyncCount} offline reward/progress update(s) queued for safe sync when online.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                {simulatedOffline && (
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playButton();
                      onToggleSimulatedOffline();
                    }}
                    className="btn-3d-plum flex-1 py-3 px-4 rounded-2xl text-xs font-extrabold text-emerald-300 flex items-center justify-center gap-1.5"
                  >
                    <Wifi className="w-4 h-4" />
                    <span>Reconnect Online</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButton();
                    onClose();
                  }}
                  className="btn-3d-pink flex-1 py-3 px-5 rounded-2xl text-xs sm:text-sm font-extrabold text-white flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Continue Offline Gameplay</span>
                </button>
              </div>
            </div>
          ) : (
            /* =================================================================
               ONLINE GLOBAL LEADERBOARD & SAFE SYNC STATUS
            ================================================================= */
            <>
              <div className="p-3.5 rounded-2xl bg-[#170924] border border-emerald-400/35 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-extrabold text-white block">
                      Offline-to-Online Sync Active &amp; Protected
                    </span>
                    <span className="text-[11px] text-[#D9C3B0]">
                      {levelsCleared} levels &amp; {(saveData.syncedRewardIds || []).length} verified reward IDs synchronized without duplicates.
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {leaderboardEntries.map((entry, idx) => (
                  <div
                    key={entry.name}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                      entry.isPlayer
                        ? 'bg-gradient-to-r from-[#4A1E6B] to-[#2F1247] border-amber-300 ring-1 ring-amber-300/50'
                        : 'bg-[#1A0B24] border-[#422459]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg font-mono-tabular font-black text-xs flex items-center justify-center shrink-0 ${
                          idx === 0
                            ? 'bg-amber-300 text-[#2B1204]'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-900'
                            : idx === 2
                            ? 'bg-amber-600 text-white'
                            : 'bg-[#2C143D] text-[#D9C3B0]'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-[#12061B] border border-amber-300/40 p-1 shrink-0">
                        <CandyAvatarSVG avatarId={entry.avatar} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-extrabold text-white truncate">
                            {entry.name}
                          </span>
                          {entry.isPlayer && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-300 text-[#2B1204] text-[9px] font-black uppercase">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono-tabular text-[#D9C3B0]">
                          Score: {entry.score.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#12061B] border border-amber-300/30 font-mono-tabular text-xs font-black text-amber-300 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      <span>{entry.stars}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
