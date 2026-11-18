import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Coins,
  Gift,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { BoosterType, SaveData } from '../types/game';
import { canClaimDailyReward, DAILY_REWARD_TIERS, DailyRewardTier } from '../systems/saveSystem';
import { soundManager } from '../systems/soundManager';
import { BoosterIconSVG } from './GameIcons';

interface ShopModalProps {
  saveData: SaveData;
  onBuyBooster: (type: BoosterType, cost: number, quantity: number) => boolean;
  onBuyBundle: (cost: number, items: Partial<Record<BoosterType, number>>) => boolean;
  onClose: () => void;
  onOpenDailyRewards?: () => void;
}

export interface ShopCatalogItem {
  id: string;
  type?: BoosterType;
  isSpecialGiftBox?: boolean;
  bundleItems?: Partial<Record<BoosterType, number>>;
  name: string;
  badge: string;
  description: string;
  cost: number;
  quantity: number;
  accentGradient: string;
}

export const SHOP_CATALOG: ShopCatalogItem[] = [
  {
    id: 'hammer',
    type: 'hammer',
    name: 'Hammer Booster',
    badge: 'Single Target',
    description: 'Smash any single candy or frosting blocker on the board with one tap.',
    cost: 100,
    quantity: 1,
    accentGradient: 'from-[#FF2E63]/35 via-[#3B174D] to-[#240F33]',
  },
  {
    id: 'color_bomb',
    type: 'color_bomb',
    name: 'Rainbow Colour Bomb',
    badge: 'Board Clearer',
    description: 'Place a glowing Rainbow Bomb to vaporize all candies of the tapped colour!',
    cost: 200,
    quantity: 1,
    accentGradient: 'from-[#A855F7]/35 via-[#391852] to-[#240F33]',
  },
  {
    id: 'striped_candy',
    type: 'striped_candy',
    name: 'Striped Candy Booster',
    badge: 'Row & Column Blast',
    description: 'Fire a high-energy Striped Candy laser blast across an entire row & column.',
    cost: 150,
    quantity: 1,
    accentGradient: 'from-[#0EA5E9]/35 via-[#251E52] to-[#240F33]',
  },
  {
    id: 'wrapped_candy',
    type: 'wrapped_candy',
    name: 'Wrapped Candy Booster',
    badge: 'Double Explosion',
    description: 'Detonate a powerful Wrapped Candy bomb that explodes twice in a 5x5 blast.',
    cost: 150,
    quantity: 1,
    accentGradient: 'from-[#EC4899]/35 via-[#3D1647] to-[#240F33]',
  },
  {
    id: 'extra_moves',
    type: 'extra_moves',
    name: 'Extra 5 Moves',
    badge: '+5 Moves',
    description: 'Instantly add +5 extra moves during any level or continue when moves run out.',
    cost: 250,
    quantity: 1,
    accentGradient: 'from-[#8B5CF6]/35 via-[#32174D] to-[#240F33]',
  },
  {
    id: 'extra_life',
    type: 'extra_life',
    name: 'Extra Life',
    badge: 'Revive & Shield',
    description: 'Grants a full Extra Life revive (+5 moves & fresh board shuffle) when in trouble.',
    cost: 300,
    quantity: 1,
    accentGradient: 'from-[#F43F5E]/35 via-[#421438] to-[#240F33]',
  },
  {
    id: 'shuffle',
    type: 'shuffle',
    name: 'Shuffle Booster',
    badge: 'Board Remix',
    description: 'Remix all candies on the 8x8 board to create fresh cascading combinations.',
    cost: 100,
    quantity: 1,
    accentGradient: 'from-[#10B981]/35 via-[#17383B] to-[#240F33]',
  },
  {
    id: 'special_gift_box',
    isSpecialGiftBox: true,
    bundleItems: {
      hammer: 1,
      color_bomb: 1,
      striped_candy: 1,
      wrapped_candy: 1,
      extra_moves: 1,
      extra_life: 1,
      shuffle: 1,
    },
    name: 'Special Gift Box',
    badge: 'All-in-One Pack',
    description: 'Royal Mystery Box granting +1 of ALL 7 Boosters (1,250 Coins value!).',
    cost: 500,
    quantity: 1,
    accentGradient: 'from-[#FACC15]/40 via-[#4B2152] to-[#28113B]',
  },
];

export const ShopModal: React.FC<ShopModalProps> = ({
  saveData,
  onBuyBooster,
  onBuyBundle,
  onClose,
  onOpenDailyRewards,
}) => {
  const [bannerFailed, setBannerFailed] = useState(false);
  const [justPurchasedId, setJustPurchasedId] = useState<string | null>(null);
  const [coinPulse, setCoinPulse] = useState(false);
  const [purchasedModalItem, setPurchasedModalItem] = useState<ShopCatalogItem | null>(null);
  const [insufficientPopupItem, setInsufficientPopupItem] = useState<ShopCatalogItem | null>(
    null
  );

  const handlePurchaseClick = (item: ShopCatalogItem) => {
    // Check if player has enough coins
    if (saveData.coins < item.cost) {
      soundManager.playInvalidSwap();
      setInsufficientPopupItem(item);
      return;
    }

    let success = false;
    if (item.isSpecialGiftBox && item.bundleItems) {
      success = onBuyBundle(item.cost, item.bundleItems);
    } else if (item.type) {
      success = onBuyBooster(item.type, item.cost, item.quantity);
    }

    if (success) {
      setJustPurchasedId(item.id);
      setCoinPulse(true);
      setPurchasedModalItem(item);
      window.setTimeout(() => setJustPurchasedId(null), 900);
      window.setTimeout(() => setCoinPulse(false), 600);
    } else {
      soundManager.playInvalidSwap();
      setInsufficientPopupItem(item);
    }
  };

  const totalBoostersOwned =
    (saveData.boosters.hammer || 0) +
    (saveData.boosters.color_bomb || 0) +
    (saveData.boosters.striped_candy || 0) +
    (saveData.boosters.wrapped_candy || 0) +
    (saveData.boosters.extra_moves || 0) +
    (saveData.boosters.extra_life || 0) +
    (saveData.boosters.shuffle || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2.5 sm:p-5">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl board-tray-3d bg-[#221130] text-[#FFF9F2] overflow-hidden border-2 border-amber-300/45 shadow-[0_24px_70px_rgba(0,0,0,0.9)]">
        {/* Top Header Bar: Back Button + Shop Title + Live Synchronized Coin Balance */}
        <div className="flex items-center justify-between gap-2 px-3.5 sm:px-6 py-3.5 border-b border-[#4A2B5E] bg-gradient-to-r from-[#1A0B24] via-[#2B123D] to-[#1A0B24]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Functional BACK Button */}
            <button
              type="button"
              onClick={() => {
                soundManager.playButton();
                onClose();
              }}
              aria-label="Back"
              className="btn-3d-plum px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-[#FFF9F2] flex items-center gap-1.5 border border-amber-300/35"
            >
              <ArrowLeft className="w-4 h-4 text-amber-300" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-pink-400 to-rose-600 p-1.5 flex items-center justify-center shadow-md border border-white/40 hidden xs:flex">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                  Sweet Blast 3D Boutique
                </span>
                <h2 className="font-display text-lg sm:text-2xl font-black text-white leading-tight">
                  COIN SHOP
                </h2>
              </div>
            </div>
          </div>

          {/* Right Cluster: Live Synchronized Coin Balance + Close Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-[#14071E] border-2 border-amber-400/70 shadow-inner transition-transform duration-300 ${
                coinPulse ? 'scale-110 ring-2 ring-amber-300' : ''
              }`}
              title="Current Coin Balance"
            >
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
              <div className="text-left">
                <span className="block text-[9px] uppercase tracking-wider text-[#D9C3B0] font-bold leading-none">
                  Coins Balance
                </span>
                <span className="font-mono-tabular font-black text-sm sm:text-base text-amber-300 leading-tight">
                  {saveData.coins.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundManager.playButton();
                onClose();
              }}
              aria-label="Close Coin Shop"
              className="p-2 rounded-xl bg-[#341C47] hover:bg-[#46265E] text-[#FFF9F2] transition-colors border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Scrollable Shop Content */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5">
          {/* Colourful Candy-Themed Shop Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-amber-300/35 bg-gradient-to-r from-[#3E185A] via-[#661E6B] to-[#31134C] shadow-lg">
            {!bannerFailed && (
              <img
                src="/src/assets/images/candy_shop_banner_1794915431935.jpg"
                alt="Sweet Blast 3D Coin Shop"
                referrerPolicy="no-referrer"
                onError={() => setBannerFailed(true)}
                className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
              />
            )}
            <div className="relative z-10 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-t from-[#190A24]/90 via-[#250E36]/65 to-transparent">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#1B0B28]/90 border-2 border-amber-300/60 flex items-center justify-center shrink-0 shadow-lg">
                  <AnimatedGiftBoxSVG isOpen={false} className="w-12 h-12 sm:w-14 sm:h-14" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-extrabold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>POWER UP YOUR CANDY BOARD</span>
                  </div>
                  <h3 className="font-display text-lg sm:text-2xl font-black text-white">
                    Magical Candy Boosters &amp; Extra Lives
                  </h3>
                  <p className="text-xs text-[#E8D5C8] mt-0.5">
                    Stock up on 3D boosters with your Coins and unleash chain reactions inside any level!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#160822]/90 border border-amber-300/35 shrink-0">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <div className="text-left">
                  <span className="block text-[10px] text-[#D9C3B0] font-semibold">
                    Total Boosters in Bag
                  </span>
                  <span className="font-mono-tabular font-black text-sm text-white">
                    {totalBoostersOwned} Items Ready
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 8-Item Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {SHOP_CATALOG.map((item) => {
              const ownedCount = item.type ? saveData.boosters[item.type] || 0 : null;
              const canAfford = saveData.coins >= item.cost;
              const isJustBought = justPurchasedId === item.id;

              return (
                <div
                  key={item.id}
                  className={`relative rounded-2xl p-4 bg-gradient-to-b ${item.accentGradient} border-2 transition-all duration-200 flex flex-col justify-between ${
                    isJustBought
                      ? 'border-emerald-300 ring-4 ring-emerald-400/50 scale-[1.03]'
                      : item.isSpecialGiftBox
                      ? 'border-amber-300/80 shadow-[0_0_24px_rgba(250,204,21,0.22)]'
                      : 'border-[#573073] hover:border-amber-300/60'
                  }`}
                >
                  {/* Top Badge + Inventory Counter */}
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          item.isSpecialGiftBox
                            ? 'bg-amber-300 text-[#2B1204]'
                            : 'bg-black/40 text-amber-200 border border-white/15'
                        }`}
                      >
                        {item.badge}
                      </span>

                      {ownedCount !== null ? (
                        <span className="px-2 py-0.5 rounded-md bg-[#14071E]/85 border border-white/15 text-[11px] font-mono-tabular font-extrabold text-emerald-300">
                          Owned: {ownedCount}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase">
                          7x Value
                        </span>
                      )}
                    </div>

                    {/* 3D Item Icon Showcase Pedestal */}
                    <div className="relative mx-auto my-2 w-20 h-20 rounded-2xl bg-[#160822]/90 border-2 border-amber-300/35 flex items-center justify-center shadow-[inset_0_3px_10px_rgba(0,0,0,0.75)]">
                      <div className="
                        absolute inset-1 rounded-xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none
                      " />
                      {item.isSpecialGiftBox ? (
                        <AnimatedGiftBoxSVG
                          isOpen={isJustBought}
                          className="w-16 h-16"
                        />
                      ) : (
                        item.type && (
                          <div
                            className={`transition-transform duration-300 ${
                              isJustBought ? 'scale-125 rotate-6' : 'hover:scale-110'
                            }`}
                          >
                            <BoosterIconSVG type={item.type} className="w-13 h-13" />
                          </div>
                        )
                      )}

                      {/* Floating +1 Badge on Purchase */}
                      {isJustBought && (
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-mono-tabular font-black text-xs shadow-lg animate-bounce">
                          {item.isSpecialGiftBox ? '+7!' : '+1!'}
                        </span>
                      )}
                    </div>

                    {/* Item Name & Description */}
                    <div className="text-center mt-2.5">
                      <h4 className="font-display text-base font-extrabold text-white leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#DFC9B8] mt-1 leading-relaxed min-h-[36px]">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Glowing Purchase Button */}
                  <div className="mt-4 pt-2.5 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handlePurchaseClick(item)}
                      className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                        canAfford
                          ? item.isSpecialGiftBox
                            ? 'btn-3d-gold animate-pulse-glow'
                            : 'btn-3d-pink text-white shadow-[0_0_16px_rgba(255,46,99,0.4)]'
                          : 'bg-[#1A0B26] hover:bg-[#271138] text-[#B89EC7] border border-rose-400/35'
                      }`}
                    >
                      <Coins
                        className={`w-4 h-4 shrink-0 ${
                          canAfford
                            ? item.isSpecialGiftBox
                              ? 'text-[#2B1204]'
                              : 'text-amber-300'
                            : 'text-amber-400/70'
                        }`}
                      />
                      <span className="font-mono-tabular font-black">
                        {item.cost} Coins
                      </span>
                      <span
                        className={`ml-auto px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          canAfford
                            ? item.isSpecialGiftBox
                              ? 'bg-[#2B1204]/20 text-[#2B1204]'
                              : 'bg-white/20 text-white'
                            : 'bg-rose-950/80 text-rose-300'
                        }`}
                      >
                        BUY
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Footer Bar with Back Button */}
        <div className="px-4 sm:px-6 py-3 border-t border-[#4A2B5E] bg-[#1A0B24] flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#D9C3B0]">
            Purchased boosters are saved automatically and ready to use on the Candy Board.
          </p>
          <button
            type="button"
            onClick={() => {
              soundManager.playButton();
              onClose();
            }}
            className="btn-3d-plum px-5 py-2 rounded-xl text-xs font-extrabold text-amber-300 flex items-center gap-1.5 border border-amber-300/35"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Game</span>
          </button>
        </div>

        {/* =====================================================================
            PURCHASE SUCCESS POPUP OVERLAY
        ===================================================================== */}
        {purchasedModalItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
            <div className="relative w-full max-w-sm rounded-3xl board-tray-3d bg-gradient-to-b from-[#3A1954] via-[#27103B] to-[#1A0926] p-6 text-center text-[#FFF9F2] border-2 border-emerald-300 shadow-[0_0_50px_rgba(16,185,129,0.45)] space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-extrabold">
                <Check className="w-3.5 h-3.5" />
                <span>PURCHASE SUCCESSFUL!</span>
              </div>

              <div className="mx-auto w-24 h-24 rounded-3xl bg-[#160822] border-2 border-amber-300/60 flex items-center justify-center shadow-xl">
                {purchasedModalItem.isSpecialGiftBox ? (
                  <AnimatedGiftBoxSVG isOpen={true} className="w-20 h-20" />
                ) : (
                  purchasedModalItem.type && (
                    <BoosterIconSVG type={purchasedModalItem.type} className="w-16 h-16" />
                  )
                )}
              </div>

              <div>
                <h3 className="font-display text-2xl font-black text-white">
                  {purchasedModalItem.name}
                </h3>
                <p className="text-xs text-amber-200 font-semibold mt-1">
                  {purchasedModalItem.isSpecialGiftBox
                    ? '+1 of ALL 7 Boosters added to your inventory!'
                    : `+${purchasedModalItem.quantity} added to your Booster Inventory!`}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#150821] border border-[#492761] flex items-center justify-around text-xs">
                {purchasedModalItem.type && (
                  <div>
                    <span className="block text-[#D9C3B0]">Now In Bag</span>
                    <span className="font-mono-tabular text-base font-black text-emerald-300">
                      {saveData.boosters[purchasedModalItem.type] || 0}
                    </span>
                  </div>
                )}
                <div>
                  <span className="block text-[#D9C3B0]">Remaining Coins</span>
                  <span className="font-mono-tabular text-base font-black text-amber-300 flex items-center justify-center gap-1">
                    <Coins className="w-4 h-4" />
                    {saveData.coins.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setPurchasedModalItem(null);
                }}
                className="btn-3d-gold w-full py-3 rounded-2xl font-display text-base font-black"
              >
                AWESOME!
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            INSUFFICIENT COINS POPUP OVERLAY
        ===================================================================== */}
        {insufficientPopupItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
            <div className="relative w-full max-w-sm rounded-3xl board-tray-3d bg-gradient-to-b from-[#3B1538] via-[#261033] to-[#190924] p-6 text-center text-[#FFF9F2] border-2 border-rose-400/80 shadow-[0_0_50px_rgba(244,63,94,0.45)] space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-9 h-9 text-amber-300" />
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-rose-300">
                  Not Enough Coins
                </span>
                <h3 className="font-display text-2xl font-black text-white mt-0.5">
                  Insufficient Coins!
                </h3>
                <p className="text-xs text-[#E2C9B8] mt-1.5 leading-relaxed">
                  You need{' '}
                  <strong className="text-amber-300 font-mono-tabular">
                    {(insufficientPopupItem.cost - saveData.coins).toLocaleString()} more Coins
                  </strong>{' '}
                  to buy <strong>{insufficientPopupItem.name}</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#14071E] border border-[#46245C] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="block text-[#D9C3B0]">Your Coins</span>
                  <span className="font-mono-tabular text-base font-black text-rose-300 flex items-center justify-center gap-1 mt-0.5">
                    <Coins className="w-4 h-4 text-amber-300" />
                    {saveData.coins.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="block text-[#D9C3B0]">Item Price</span>
                  <span className="font-mono-tabular text-base font-black text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                    <Coins className="w-4 h-4 text-amber-300" />
                    {insufficientPopupItem.cost.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#D9C3B0]">
                Tip: Complete levels on the Candy Board or claim your Daily Login Gift to earn free Coins!
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                {onOpenDailyRewards && (
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playButton();
                      setInsufficientPopupItem(null);
                      onClose();
                      onOpenDailyRewards();
                    }}
                    className="btn-3d-gold flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Daily Rewards</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButton();
                    setInsufficientPopupItem(null);
                  }}
                  className="btn-3d-pink flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold text-white"
                >
                  OK, Got It
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface DailyRewardModalProps {
  saveData: SaveData;
  onClaimDaily: () => DailyRewardTier | null;
  onClose: () => void;
}

const AnimatedGiftBoxSVG: React.FC<{ isOpen: boolean; isShaking?: boolean; className?: string }> = ({
  isOpen,
  isShaking = false,
  className = 'w-20 h-20',
}) => (
  <svg
    viewBox="0 0 120 120"
    className={`${className} select-none overflow-visible ${
      isShaking ? 'animate-invalid-shake' : 'animate-float-slow'
    }`}
  >
    <defs>
      <radialGradient id="giftGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
        <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="boxRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF5582" />
        <stop offset="55%" stopColor="#E11D48" />
        <stop offset="100%" stopColor="#881337" />
      </linearGradient>
      <linearGradient id="ribbonGold" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="45%" stopColor="#FACC15" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
    </defs>

    {/* Magical Golden Aura Behind Gift Box */}
    <circle cx="60" cy="62" r="54" fill="url(#giftGlow)" />

    {/* Bursting Sparkles & Coins When Open */}
    {isOpen && (
      <g>
        <circle cx="34" cy="24" r="7" fill="url(#ribbonGold)" stroke="#FFF" strokeWidth="1.5" />
        <circle cx="86" cy="22" r="7" fill="url(#ribbonGold)" stroke="#FFF" strokeWidth="1.5" />
        <circle cx="60" cy="14" r="8" fill="#0EA5E9" stroke="#FFF" strokeWidth="1.5" />
        <path
          d="M22,42 L26,34 L30,42 L22,38 L30,38 Z M92,38 L96,30 L100,38 L92,34 L100,34 Z"
          fill="#FEF08A"
        />
      </g>
    )}

    {/* Gift Box Base */}
    <rect
      x="26"
      y="54"
      width="68"
      height="50"
      rx="10"
      fill="url(#boxRed)"
      stroke="#FFF"
      strokeWidth="2"
    />
    {/* Vertical Gold Ribbon on Base */}
    <rect x="52" y="54" width="16" height="50" fill="url(#ribbonGold)" />
    {/* Horizontal Gold Ribbon on Base */}
    <rect x="26" y="73" width="68" height="12" fill="url(#ribbonGold)" />

    {/* Gift Box Lid + Bow (Tilted Open when isOpen is true) */}
    <g transform={isOpen ? 'translate(8, -22) rotate(16 60 45)' : 'translate(0, 0)'}>
      {/* Ribbon Bow Loops */}
      <path
        d="M60,38 C44,18 28,26 38,40 C44,44 54,40 60,38 Z"
        fill="url(#ribbonGold)"
        stroke="#78350F"
        strokeWidth="1.5"
      />
      <path
        d="M60,38 C76,18 92,26 82,40 C76,44 66,40 60,38 Z"
        fill="url(#ribbonGold)"
        stroke="#78350F"
        strokeWidth="1.5"
      />
      <circle cx="60" cy="37" r="6.5" fill="url(#ribbonGold)" stroke="#FFF" strokeWidth="1.5" />

      {/* Box Lid */}
      <rect
        x="21"
        y="38"
        width="78"
        height="18"
        rx="6"
        fill="url(#boxRed)"
        stroke="#FFF"
        strokeWidth="2"
      />
      <rect x="51" y="38" width="18" height="18" fill="url(#ribbonGold)" />
      {/* Glossy Highlight on Lid */}
      <rect x="26" y="41" width="20" height="4" rx="2" fill="#FFFFFF" fillOpacity="0.55" />
    </g>
  </svg>
);

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  saveData,
  onClaimDaily,
  onClose,
}) => {
  const [isOpeningBox, setIsOpeningBox] = useState(false);
  const [claimedPopupTier, setClaimedPopupTier] = useState<
    (typeof DAILY_REWARD_TIERS)[number] | null
  >(null);

  const claimable = canClaimDailyReward(saveData);
  const completedInCycle = saveData.dailyRewardStreak % 7;
  // Determine which day index (0..6) is active today or was just claimed today
  const activeDayIndex = claimable
    ? completedInCycle
    : (saveData.dailyRewardStreak - 1 + 7) % 7;
  const nextRewardIndex = claimable
    ? (activeDayIndex + 1) % 7
    : completedInCycle;
  const nextRewardTier = DAILY_REWARD_TIERS[nextRewardIndex];

  const handleTriggerClaim = () => {
    if (!claimable || isOpeningBox) return;
    soundManager.playButton();
    setIsOpeningBox(true);

    window.setTimeout(() => {
      const tier = onClaimDaily();
      setIsOpeningBox(false);
      if (tier) {
        setClaimedPopupTier(tier);
      }
    }, 420);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2.5 sm:p-6">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl board-tray-3d bg-[#221130] text-[#FFF9F2] overflow-hidden">
        {/* Top Header with Synchronized Live Coin Balance */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#4A2B5E] bg-[#1A0B24]">
          <div className="flex items-center gap-2.5">
            <Gift className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="font-display text-lg sm:text-2xl font-bold text-[#FFF9F2] leading-tight">
                7-Day Daily Login Rewards
              </h2>
              <p className="text-[11px] sm:text-xs text-[#D9C3B0]">
                Streak: <strong className="text-amber-300">{saveData.dailyRewardStreak}</strong>{' '}
                {saveData.dailyRewardStreak === 1 ? 'Day' : 'Days'} · Claim once per calendar day
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Synchronized Coin Balance */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2E173D] border border-amber-400/40">
              <Coins className="w-4 h-4 text-amber-300" />
              <span className="font-mono-tabular font-extrabold text-xs sm:text-sm text-amber-300">
                {saveData.coins.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                soundManager.playButton();
                onClose();
              }}
              aria-label="Close Daily Rewards"
              className="p-2 rounded-xl bg-[#341C47] hover:bg-[#46265E] text-[#FFF9F2]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Hero Gift Box Showcase Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#3B1954] via-[#58226E] to-[#34154A] border border-amber-300/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <AnimatedGiftBoxSVG
                isOpen={!claimable}
                isShaking={isOpeningBox}
                className="w-16 h-16 sm:w-20 sm:h-20 shrink-0"
              />
              <div>
                <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-amber-300">
                  {claimable
                    ? `Day ${activeDayIndex + 1} Gift Ready!`
                    : 'Today’s Gift Collected!'}
                </span>
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-white mt-0.5">
                  {claimable
                    ? DAILY_REWARD_TIERS[activeDayIndex].title
                    : `Next Reward: Day ${nextRewardTier.day} (${nextRewardTier.title})`}
                </h3>
                <p className="text-xs text-[#D9C3B0] mt-0.5">
                  {claimable
                    ? 'Tap the glowing CLAIM button below to open your daily gift box!'
                    : 'Come back tomorrow to unlock your next daily reward.'}
                </p>
              </div>
            </div>

            {/* Glowing CLAIM Button in Banner */}
            {claimable ? (
              <button
                type="button"
                disabled={isOpeningBox}
                onClick={handleTriggerClaim}
                className="btn-3d-gold w-full sm:w-auto px-6 py-3 rounded-2xl font-display text-base sm:text-lg font-black flex items-center justify-center gap-2 animate-pulse-glow shrink-0 border-2 border-white"
              >
                <Gift className="w-5 h-5" />
                <span>{isOpeningBox ? 'OPENING...' : 'CLAIM'}</span>
              </button>
            ) : (
              <div className="px-4 py-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 text-xs font-extrabold flex items-center gap-1.5 shrink-0">
                <Check className="w-4 h-4" />
                <span>Claimed Today</span>
              </div>
            )}
          </div>

          {/* 7-Day Reward Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {DAILY_REWARD_TIERS.map((tier, idx) => {
              const isCompleted = claimable
                ? idx < activeDayIndex
                : idx <= activeDayIndex;
              const isTodayTarget = claimable && idx === activeDayIndex;
              const isNextTarget = idx === nextRewardIndex && !isTodayTarget && !isCompleted;
              const isDay7 = tier.day === 7;

              return (
                <div
                  key={tier.day}
                  className={`relative p-3.5 rounded-2xl border flex flex-col items-center justify-between text-center gap-2 transition-all ${
                    isDay7 ? 'col-span-2 sm:col-span-3 sm:flex-row sm:px-6 sm:py-4' : ''
                  } ${
                    isTodayTarget
                      ? 'bg-gradient-to-b from-[#542375] to-[#32124A] border-amber-300 ring-2 ring-amber-300/80 shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                      : isCompleted
                      ? 'bg-[#1B0D26] border-emerald-500/50 opacity-85'
                      : isNextTarget
                      ? 'bg-[#2E1742] border-pink-400/60'
                      : 'bg-[#261236] border-[#43255B]'
                  }`}
                >
                  {/* Day Header & Status Tag */}
                  <div className={`flex flex-col ${isDay7 ? 'sm:items-start sm:text-left' : 'items-center'} gap-1`}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-amber-300">
                        Day {tier.day}
                      </span>
                      {isTodayTarget && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-400 text-[#2B1204] text-[10px] font-black">
                          TODAY
                        </span>
                      )}
                      {isNextTarget && (
                        <span className="px-2 py-0.5 rounded-md bg-pink-500 text-white text-[10px] font-black">
                          NEXT
                        </span>
                      )}
                    </div>

                    <h4 className="font-display text-sm sm:text-base font-extrabold text-white">
                      {tier.title}
                    </h4>

                    {tier.specialGiftLabel && (
                      <p className="text-[11px] text-amber-200 font-semibold">
                        {tier.specialGiftLabel}
                      </p>
                    )}
                  </div>

                  {/* Visual Reward Icon */}
                  <div className="flex items-center justify-center gap-2 my-1">
                    {tier.coins > 0 && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/35 border border-amber-300/30 font-mono-tabular font-extrabold text-sm text-amber-300">
                        <Coins className="w-4 h-4 text-amber-300" />
                        <span>+{tier.coins}</span>
                      </div>
                    )}
                    {tier.booster && !tier.specialGiftBundle && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/35 border border-pink-400/30 text-xs font-extrabold text-white">
                        <BoosterIconSVG type={tier.booster.type} className="w-5 h-5" />
                        <span>x{tier.booster.count}</span>
                      </div>
                    )}
                    {tier.specialGiftBundle && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-300 text-xs font-extrabold text-amber-200">
                        <Gift className="w-4 h-4 text-amber-300" />
                        <span>Special Gift Chest</span>
                      </div>
                    )}
                  </div>

                  {/* Completed Checkmark or Upcoming State */}
                  <div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-[11px] text-emerald-300 font-extrabold">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Completed</span>
                      </span>
                    ) : isTodayTarget ? (
                      <span className="text-[11px] font-extrabold text-amber-300">
                        Ready to Claim!
                      </span>
                    ) : isNextTarget ? (
                      <span className="text-[11px] font-semibold text-pink-300">
                        Unlocks Tomorrow
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#9A82A8]">Upcoming</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#3F2352]">
            <span className="text-xs text-[#D9C3B0]">
              Next Scheduled Reward: <strong className="text-white">Day {nextRewardTier.day} — {nextRewardTier.title}</strong>
            </span>

            {claimable ? (
              <button
                type="button"
                disabled={isOpeningBox}
                onClick={handleTriggerClaim}
                className="btn-3d-gold w-full sm:w-auto px-8 py-3 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 border-2 border-white animate-pulse-glow"
              >
                <Gift className="w-4 h-4" />
                <span>Claim Day {activeDayIndex + 1} Reward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  onClose();
                }}
                className="btn-3d-plum w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs font-bold text-[#FFF9F2]"
              >
                Back to Kingdom
              </button>
            )}
          </div>
        </div>

        {/* =================================================================
            REWARD SUCCESS POPUP OVERLAY
        ================================================================= */}
        {claimedPopupTier && (
          <div className="absolute inset-0 z-30 bg-black/85 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-3xl board-tray-3d bg-gradient-to-b from-[#3E1B5C] to-[#210D33] border-2 border-amber-300 p-6 text-center space-y-4 shadow-[0_0_50px_rgba(251,191,36,0.45)] animate-candy-drop">
              <div className="mx-auto flex items-center justify-center">
                <AnimatedGiftBoxSVG isOpen={true} className="w-24 h-24" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-amber-400 text-[#2B1204] text-xs font-black uppercase tracking-wider">
                  Day {claimedPopupTier.day} Reward Claimed!
                </span>
                <h3 className="font-display text-2xl font-black text-white mt-2">
                  {claimedPopupTier.title}
                </h3>
                {claimedPopupTier.specialGiftLabel && (
                  <p className="text-xs font-bold text-amber-300 mt-1">
                    {claimedPopupTier.specialGiftLabel}
                  </p>
                )}
              </div>

              {/* Breakdown of Claimed Items */}
              <div className="p-3.5 rounded-2xl bg-[#160822] border border-amber-300/35 space-y-2">
                {claimedPopupTier.coins > 0 && (
                  <div className="flex items-center justify-center gap-2 font-mono-tabular text-lg font-extrabold text-amber-300">
                    <Coins className="w-5 h-5" />
                    <span>+{claimedPopupTier.coins} Coins Added</span>
                  </div>
                )}
                {claimedPopupTier.booster && !claimedPopupTier.specialGiftBundle && (
                  <div className="flex items-center justify-center gap-2 text-sm font-extrabold text-white">
                    <BoosterIconSVG type={claimedPopupTier.booster.type} className="w-6 h-6" />
                    <span>+{claimedPopupTier.booster.label} Added to Inventory</span>
                  </div>
                )}
                {claimedPopupTier.specialGiftBundle && (
                  <p className="text-xs text-emerald-300 font-bold">
                    +1 Hammer, +1 Colour Bomb, +1 Striped, +1 Wrapped, +1 Extra Moves, +1 Extra Life &amp; +1 Shuffle Added!
                  </p>
                )}
                <p className="text-[11px] text-[#D9C3B0] pt-1 border-t border-white/10">
                  New Coin Balance:{' '}
                  <strong className="font-mono-tabular text-amber-300">
                    {saveData.coins.toLocaleString()} Coins
                  </strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setClaimedPopupTier(null);
                }}
                className="btn-3d-pink w-full py-3.5 rounded-2xl font-display text-base font-extrabold text-white border border-amber-200/60"
              >
                Awesome! Collect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
