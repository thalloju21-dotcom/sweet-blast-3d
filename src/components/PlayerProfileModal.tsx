import React, { useState } from 'react';
import {
  Award,
  Check,
  Coins,
  Copy,
  Crown,
  Edit3,
  Flame,
  Gamepad2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  User,
  X,
} from 'lucide-react';
import { CandyAvatarId, SaveData } from '../types/game';
import { soundManager } from '../systems/soundManager';

interface PlayerProfileModalProps {
  saveData: SaveData;
  onUpdateProfile: (name: string, avatar: CandyAvatarId) => void;
  onClose: () => void;
}

export interface CandyAvatarOption {
  id: CandyAvatarId;
  name: string;
  subtitle: string;
  bgGradient: string;
}

export const CANDY_AVATARS: CandyAvatarOption[] = [
  {
    id: 'red',
    name: 'King Jellybean',
    subtitle: 'Royal Strawberry',
    bgGradient: 'from-[#FF2E63] to-[#880626]',
  },
  {
    id: 'blue',
    name: 'Captain Blueberry',
    subtitle: 'Sapphire Star',
    bgGradient: 'from-[#0EA5E9] to-[#1E3A8A]',
  },
  {
    id: 'green',
    name: 'Chef Gummy',
    subtitle: 'Emerald Apple',
    bgGradient: 'from-[#10B981] to-[#064E3B]',
  },
  {
    id: 'yellow',
    name: 'Sunny Lemon',
    subtitle: 'Golden Drop',
    bgGradient: 'from-[#FACC15] to-[#92400E]',
  },
  {
    id: 'purple',
    name: 'Mystic Grape',
    subtitle: 'Sugar Wizard',
    bgGradient: 'from-[#A855F7] to-[#4C1D95]',
  },
  {
    id: 'orange',
    name: 'Turbo Tangerine',
    subtitle: 'Citrus Blitz',
    bgGradient: 'from-[#F97316] to-[#7C2D12]',
  },
  {
    id: 'cupcake_princess',
    name: 'Princess Cupcake',
    subtitle: 'Cherry Frosting',
    bgGradient: 'from-[#EC4899] to-[#831843]',
  },
  {
    id: 'lollipop_swirl',
    name: 'Swirl Lollipop',
    subtitle: 'RainbowPop',
    bgGradient: 'from-[#F43F5E] via-[#A855F7] to-[#0EA5E9]',
  },
  {
    id: 'choco_donut',
    name: 'Sprinkle Donut',
    subtitle: 'Choco Glaze',
    bgGradient: 'from-[#A16207] to-[#451A03]',
  },
  {
    id: 'mint_macaron',
    name: 'Royal Macaron',
    subtitle: 'Mint Patisserie',
    bgGradient: 'from-[#2DD4BF] to-[#115E59]',
  },
  {
    id: 'cotton_cloud',
    name: 'Cotton Cloud',
    subtitle: 'Fluffy Sugar',
    bgGradient: 'from-[#F472B6] to-[#38BDF8]',
  },
  {
    id: 'golden_truffle',
    name: 'Golden Truffle',
    subtitle: 'Legend Bomb',
    bgGradient: 'from-[#FDE047] via-[#F59E0B] to-[#78350F]',
  },
];

/**
 * Renders 12 custom-designed 3D Cartoon Candy Avatars with glossy shading,
 * expressive eyes/smiles, and candy accessories.
 */
export const CandyAvatarSVG: React.FC<{
  avatarId: CandyAvatarId;
  className?: string;
}> = ({ avatarId, className = 'w-full h-full' }) => {
  switch (avatarId) {
    case 'red':
      // 1. King Jellybean (Crimson 3D Jelly Bean with Golden Crown & Happy Smile)
      return (
        <svg viewBox="0 0 64 64" className={`${className} select-none overflow-visible`}>
          <defs>
            <radialGradient id="avRed" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FF8FA3" />
              <stop offset="45%" stopColor="#FF2E63" />
              <stop offset="100%" stopColor="#800020" />
            </radialGradient>
          </defs>
          <path
            d="M19 16L24 7L32 13L40 7L45 16Z"
            fill="#FACC15"
            stroke="#FFF"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <rect
            x="12"
            y="14"
            width="40"
            height="40"
            rx="18"
            fill="url(#avRed)"
            stroke="#FFF9F2"
            strokeWidth="2.4"
          />
          <ellipse cx="24" cy="22" rx="9" ry="4" fill="#FFF" opacity="0.55" transform="rotate(-15 24 22)" />
          {/* Cartoon Eyes & Smile */}
          <circle cx="24" cy="33" r="3.4" fill="#1E092B" />
          <circle cx="40" cy="33" r="3.4" fill="#1E092B" />
          <circle cx="25" cy="31.8" r="1.3" fill="#FFF" />
          <circle cx="41" cy="31.8" r="1.3" fill="#FFF" />
          <ellipse cx="19" cy="37" rx="3" ry="1.8" fill="#FF99AC" opacity="0.8" />
          <ellipse cx="45" cy="37" rx="3" ry="1.8" fill="#FF99AC" opacity="0.8" />
          <path d="M26 40Q32 46 38 40" fill="none" stroke="#FFF" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );

    case 'blue':
      // 2. Captain Blueberry (Glossy Sapphire Sphere with Star Shades & Cool Grin)
      return (
        <svg viewBox="0 0 64 64" className={`${className} select-none overflow-visible`}>
          <defs>
            <radialGradient id="avBlue" cx="35%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="45%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="34" r="21" fill="url(#avBlue)" stroke="#FFF9F2" strokeWidth="2.4" />
          <ellipse cx="24" cy="21" rx="9" ry="4.5" fill="#FFF" opacity="0.6" transform="rotate(-20 24 21)" />
          {/* Star Visor / Eyes */}
          <circle cx="24" cy="33" r="4" fill="#0F172A" stroke="#FDE047" strokeWidth="1.6" />
          <circle cx="40" cy="33" r="4" fill="#0F172A" stroke="#FDE047" strokeWidth="1.6" />
          <line x1="28" y1="33" x2="36" y2="33" stroke="#FDE047" strokeWidth="2" />
          <circle cx="23" cy="31.8" r="1.4" fill="#FFF" />
          <circle cx="39" cy="31.8" r="1.4" fill="#FFF" />
          <path d="M25 42Q32 47 39 42" fill="none" stroke="#FFF" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );

    case 'green':
      // 3. Chef Gummy (Emerald Jelly Cushion with Pastry Chef Hat & Wink)
      return (
        <svg viewBox="0 0 64 64" className={`${className} select-none overflow-visible`}>
          <defs>
            <linearGradient id="avGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>
          </defs>
          {/* Mini Chef Hat */}
          <path
            d="M21 16C18 11 23 6 28 9C31 5 37 6 38 10C43 8 46 13 43 16Z"
            fill="#FFF"
            stroke="#CBD5E1"
            strokeWidth="1.6"
          />
          <rect
            x="13"
            y="15"
            width="38"
            height="38"
            rx="12"
            fill="url(#avGreen)"
            stroke="#FFF9F2"
            strokeWidth="2.4"
          />
          <rect x="18" y="19" width="20" height="4.5" rx="2.2" fill="#FFF" opacity="0.55" />
          <circle cx="24" cy="33" r="3.4" fill="#064E3B" />
          <circle cx="25" cy="31.8" r="1.3" fill="#FFF" />
          <path d="M36 33Q40 29 44 33" fill="none" stroke="#064E3B" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M26 41Q32 46 38 41" fill="none" stroke="#FFF" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );

    case 'yellow':
      // 4. Sunny Lemon Drop (Golden Pear Drop Candy with Rosy Cheeks)
      return (
        <svg viewBox="0 0 64 64" className={`${className} select-none overflow-visible`}>
          <defs>
            <radialGradient id="avYellow" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FEF9C3" />
              <stop offset="50%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#B45309" />
            </radialGradient>
          </defs>
          <path
            d="M32 9C32 9 52 28 52 41C52 51.5 43 56 32 56C21 56 12 51.5 12 41C12 28 32 9 32 9Z"
            fill="url(#avYellow)"
            stroke="#FFF9F2"
            strokeWidth="2.4"
          />
          <ellipse cx="25" cy="28" rx="4" ry="8" fill="#FFF" opacity="0.6" transform="rotate(20 25 28)" />
          <circle cx="25" cy="39" r="3.3" fill="#451A03" />
          <circle cx="39" cy="39" r="3.3" fill="#451A03" />
          <circle cx="26" cy="37.8" r="1.2" fill="#FFF" />
          <circle cx="40" cy="37.8" r="1.2" fill="#FFF" />
          <ellipse cx="20" cy="43" rx="3" ry="1.8" fill="#F43F5E" opacity="0.55" />
          <ellipse cx="44" cy="43" rx="3" ry="1.8" fill="#F43F5E" opacity="0.55" />
          <path d="M27 45Q32 50 37 45" fill="none" stroke="#451A03" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );

    case 'purple':
      // 5. Mystic Grape (Amethyst Berry Cluster with Starry Wizard Hat)
      return (
        <svg viewBox="0 0 64 64" className={`${className} select-none overflow-visible`}>
          <defs>
            <radialGradient id="avPurple" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#E9D5FF" />
              <stop offset="50%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#3B0764" />
            </radialGradient>
          </defs>
          <circle cx="22" cy="27" r="11" fill="url(#avPurple)" stroke="#FFF" strokeWidth="1.5" />
          <circle cx="42" cy="27" r="11" fill="url(#avPurple)" stroke="#FFF" strokeWidth="1.5" />
          <circle cx="32" cy="37" r="16" fill="url(#avPurple)" stroke="#FFF9F2" strokeWidth="2.2" />
          {/* Wizard Cone Hat */}
          <path d="M18 19L32 4L46 19Z" fill="#4F46E5" stroke="#FACC15" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="26" cy="35" r="3.2" fill="#FFF" />
          <circle cx="38" cy="35" r="3.2" fill="#FFF" />
          <circle cx="26" cy="35" r="1.6" fill="#1E1B4B" />
          <circle cx="38" cy="35" r="1.6" fill="#1E1B4B" />
          <path d="M27 43Q32 47 37 43" fill="none" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'orange':
      // 6. Turbo Tangerine (Glossy Citrus Lozenge with Lightning Crest)
      return (
        <svg viewBox="0 0 64 64" className={`${className} select-none overflow-visible`}>
          <defs>
            <linearGradient id="avOrange" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="45%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#9A3412" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="34" rx="22" ry="18" fill="url(#avOrange)" stroke="#FFF9F2" strokeWidth="2.4" />
          <path d="M33 8L27 18H33L29 26L40 15H33Z" fill="#FACC15" stroke="#FFF" strokeWidth="1.2" />
          <circle cx="24" cy="33" r="3.2" fill="#431407" />
          <circle cx="40" cy="33" r="3.2" fill="#431407" />
          <circle cx="25" cy="32" r="1.2" fill="#FFF" />
          <circle cx="41" cy="32" r="1.2" fill="#FFF" />
          <path d="M25 40Q32 45 39 40" fill="none" stroke="#FFF" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );

    case 'cupcake_princess':
      // 7. Princess Cupcake (Pink Swirl Frosting Cupcake with Cherry on Top)
      return (
        <svg viewBox="0 0 64 64" className={`${className} select-none overflow-visible`}>
          <defs>
            <linearGradient id="avCupcakeFrost" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FCE7F3" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#9D174D" />
            </linearGradient>
          </defs>
          {/* Cupcake Golden Wrapper Base */}
          <path
            d="M18 36H46L42 54H22Z"
            fill="#F59E0B"
            stroke="#FFF9F2"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Swirl Pink Frosting */}
          <path
            d="M14 36C11 28 19 22 23 23C25 16 39 16 41 23C45 22 53 28 50 36Z"
            fill="url(#avCupcakeFrost)"
            stroke="#FFF9F2"
            strokeWidth="2.2"
          />
          {/* Glossy Red Cherry on Top */}
          <circle cx="32" cy="13" r="5.5" fill="#E11D48" stroke="#FFF" strokeWidth="1.6" />
          {/* Cute Face on Cupcake */}
          <circle cx="26" cy="43" r="2.6" fill="#2B1204" />
          <circle cx="38" cy="43" r="2.6" fill="#2B1204" />
          <path d="M28 48Q32 51 36 48" fill="none" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'lollipop_swirl':
      // 8. Swirl Lollipop (Giant Rainbow Swirl Lollipop with Bowtie & Happy Eyes)
      return (
        <svg viewBox="0 0 64 64" className={`${className} select-none overflow-visible`}>
          <rect x="29" y="42" width="6" height="16" rx="3" fill="#FFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <circle cx="32" cy="27" r="19" fill="#FF2E63" stroke="#FFF9F2" strokeWidth="2.4" />
          <path
            d="M32 27C32 19 42 19 42 27C42 37 20 37 20 25C20 13 45 13 45 28"
            fill="none"
            stroke="#FEF08A"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="25" cy="26" r="3.2" fill="#1E092B" />
          <circle cx="39" cy="26" r="3.2" fill="#1E092B" />
          <circle cx="26" cy="24.8" r="1.2" fill="#FFF" />
          <circle cx="40" cy="24.8" r="1.2" fill="#FFF" />
          {/* Cute Bowtie on Stick */}
          <path d="M23 44L32 48L23 52ZM41 44L32 48L41 52Z" fill="#0EA5E9" stroke="#FFF" strokeWidth="1.2" />
          <circle cx="32" cy="48" r="2.5" fill="#FACC15" />
        </svg>
      );

    case 'choco_donut':
      // 9. Sprinkle Donut (Chocolate Glazed Ring Donut with Rainbow Sprinkles & Smile)
      return (
        <svg viewBox="0 0 64 64" className={`${className} select-none overflow-visible`}>
          <circle cx="32" cy="32" r="21" fill="#FBBF24" stroke="#FFF9F2" strokeWidth="2.2" />
          <circle cx="32" cy="32" r="20" fill="#5C2D16" />
          {/* Sprinkles */}
          <rect x="20" y="16" width="5" height="2.2" rx="1" fill="#FF2E63" transform="rotate(-20 20 16)" />
          <rect x="38" y="17" width="5" height="2.2" rx="1" fill="#0EA5E9" transform="rotate(25 38 17)" />
          <rect x="16" y="38" width="5" height="2.2" rx="1" fill="#10B981" transform="rotate(15 16 38)" />
          <rect x="42" y="38" width="5" height="2.2" rx="1" fill="#FACC15" transform="rotate(-15 42 38)" />
          {/* Donut Center & Cute Eyes */}
          <circle cx="32" cy="32" r="6.5" fill="#241134" stroke="#FDE68A" strokeWidth="2" />
          <circle cx="21" cy="29" r="3" fill="#FFF" />
          <circle cx="43" cy="29" r="3" fill="#FFF" />
          <circle cx="21" cy="29" r="1.5" fill="#1E092B" />
          <circle cx="43" cy="29" r="1.5" fill="#1E092B" />
          <path d="M26 44Q32 48 38 44" fill="none" stroke="#FFF" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );

    case 'mint_macaron':
      // 10. Royal Macaron (Pastel Mint & Strawberry Cream French Macaron)
      return (
        <svg viewBox="0 0 64 64" className={`${className} select-none overflow-visible`}>
          {/* Top Mint Shell */}
          <path
            d="M12 29C12 17 52 17 52 29Z"
            fill="#2DD4BF"
            stroke="#FFF9F2"
            strokeWidth="2.2"
          />
          {/* Strawberry Ganache Filling */}
          <rect x="10" y="29" width="44" height="7" rx="3.5" fill="#FF2E63" stroke="#FFF" strokeWidth="1.5" />
          {/* Bottom Mint Shell */}
          <path
            d="M12 36C12 47 52 47 52 36Z"
            fill="#14B8A6"
            stroke="#FFF9F2"
            strokeWidth="2.2"
          />
          <circle cx="25" cy="25" r="2.6" fill="#0F172A" />
          <circle cx="39" cy="25" r="2.6" fill="#0F172A" />
          <circle cx="25.8" cy="24.2" r="1" fill="#FFF" />
          <circle cx="39.8" cy="24.2" r="1" fill="#FFF" />
          <path d="M28 40Q32 43 36 40" fill="none" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'cotton_cloud':
      // 11. Cotton Candy Cloud (Fluffy Pink & Sky Blue Cotton Candy Puff)
      return (
        <svg viewBox="0 0 64 64" className={`${className} select-none overflow-visible`}>
          <defs>
            <linearGradient id="avCotton" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F9A8D4" />
              <stop offset="55%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
          <path d="M29 44L32 57L35 44Z" fill="#FEF08A" stroke="#FFF" strokeWidth="1.5" />
          <path
            d="M18 39C11 39 9 29 15 25C14 16 25 12 31 17C37 11 49 15 48 24C55 28 53 39 45 39Z"
            fill="url(#avCotton)"
            stroke="#FFF9F2"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <circle cx="25" cy="28" r="3" fill="#1E092B" />
          <circle cx="39" cy="28" r="3" fill="#1E092B" />
          <circle cx="26" cy="27" r="1.2" fill="#FFF" />
          <circle cx="40" cy="27" r="1.2" fill="#FFF" />
          <path d="M28 33Q32 37 36 33" fill="none" stroke="#1E092B" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );

    case 'golden_truffle':
      // 12. Golden Star Truffle (Spun-Gold Rainbow Legend Bomb with Halo)
      return (
        <svg viewBox="0 0 64 64" className={`${className} select-none overflow-visible`}>
          <defs>
            <radialGradient id="avGoldTruffle" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="45%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#92400E" />
            </radialGradient>
          </defs>
          <ellipse cx="32" cy="10" rx="14" ry="3.5" fill="none" stroke="#FEF08A" strokeWidth="2.5" />
          <circle cx="32" cy="35" r="20" fill="url(#avGoldTruffle)" stroke="#FFF" strokeWidth="2.4" />
          <circle cx="20" cy="24" r="3" fill="#FF2E63" />
          <circle cx="44" cy="24" r="3" fill="#0EA5E9" />
          <circle cx="20" cy="45" r="3" fill="#10B981" />
          <circle cx="44" cy="45" r="3" fill="#A855F7" />
          <circle cx="25" cy="34" r="3.4" fill="#2B1204" />
          <circle cx="39" cy="34" r="3.4" fill="#2B1204" />
          <circle cx="26" cy="32.8" r="1.2" fill="#FFF" />
          <circle cx="40" cy="32.8" r="1.2" fill="#FFF" />
          <path d="M26 41Q32 46 38 41" fill="none" stroke="#2B1204" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );
  }
};

interface AchievementItem {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unlocked: boolean;
  accentColor: string;
  badgeLabel: string;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  saveData,
  onUpdateProfile,
  onClose,
}) => {
  const [nameInput, setNameInput] = useState(saveData.playerName || 'Sweet Player');
  const [selectedAvatar, setSelectedAvatar] = useState<CandyAvatarId>(
    saveData.playerAvatar || 'red'
  );
  const [savedToast, setSavedToast] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements'>('overview');

  // Compute all 6 required Player Statistics
  const currentLevel = saveData.currentLevel || 1;
  const levelsCompleted = Object.keys(saveData.levelStars).length;
  const totalStars = Object.values(saveData.levelStars).reduce((a, b) => a + b, 0);
  const totalCoins = saveData.coins || 0;
  const maxFromMap = Object.values(saveData.levelHighScores).reduce(
    (max, v) => Math.max(max, v || 0),
    0
  );
  const highestScore = Math.max(saveData.highestScore || 0, maxFromMap);
  const gamesPlayed = Math.max(saveData.gamesPlayed || 0, levelsCompleted);

  // Determine Royal Confectioner Rank Title
  const rankTitle =
    totalStars >= 250
      ? 'Grand Sugar Emperor'
      : totalStars >= 100
      ? 'Royal Pastry Archduke'
      : totalStars >= 30
      ? 'Master Confectioner'
      : totalStars >= 10
      ? 'Caramel Artisan'
      : 'Sweet Kingdom Explorer';

  // Compute 8 Dynamic Achievements & Badges
  const achievements: AchievementItem[] = [
    {
      id: 'first_win',
      title: 'First Sweet Victory',
      description: 'Complete your very first level on the Candy Board.',
      current: Math.min(1, levelsCompleted),
      target: 1,
      unlocked: levelsCompleted >= 1,
      accentColor: 'from-pink-500 to-rose-600',
      badgeLabel: '1st Win',
    },
    {
      id: 'level_explorer',
      title: 'Kingdom Adventurer',
      description: 'Reach or unlock Level 5 in the Candy Kingdom.',
      current: Math.min(5, Math.max(currentLevel, saveData.highestUnlockedLevel)),
      target: 5,
      unlocked: Math.max(currentLevel, saveData.highestUnlockedLevel) >= 5,
      accentColor: 'from-sky-400 to-blue-600',
      badgeLabel: 'Lv. 5',
    },
    {
      id: 'star_collector',
      title: 'Star Collector',
      description: 'Earn 10 or more Total Stars across completed levels.',
      current: Math.min(10, totalStars),
      target: 10,
      unlocked: totalStars >= 10,
      accentColor: 'from-amber-300 to-amber-600',
      badgeLabel: '10 Stars',
    },
    {
      id: 'coin_treasurer',
      title: 'Golden Treasurer',
      description: 'Hold at least 500 Coins in your Royal Treasury.',
      current: Math.min(500, totalCoins),
      target: 500,
      unlocked: totalCoins >= 500,
      accentColor: 'from-yellow-300 to-orange-500',
      badgeLabel: '500 Coins',
    },
    {
      id: 'high_scorer',
      title: 'Sugar High Roller',
      description: 'Achieve a Highest Score of 2,500+ points in a single level.',
      current: Math.min(2500, highestScore),
      target: 2500,
      unlocked: highestScore >= 2500,
      accentColor: 'from-purple-400 to-indigo-600',
      badgeLabel: '2.5K Pts',
    },
    {
      id: 'candy_veteran',
      title: 'Candy Board Regular',
      description: 'Play 5 or more puzzle games in Sweet Blast 3D.',
      current: Math.min(5, gamesPlayed),
      target: 5,
      unlocked: gamesPlayed >= 5,
      accentColor: 'from-emerald-400 to-teal-600',
      badgeLabel: '5 Games',
    },
    {
      id: 'daily_devotee',
      title: 'Daily Gift Opener',
      description: 'Claim at least 1 Daily Login Gift Box reward.',
      current: Math.min(1, saveData.dailyRewardStreak),
      target: 1,
      unlocked: saveData.dailyRewardStreak >= 1,
      accentColor: 'from-rose-400 to-pink-600',
      badgeLabel: 'Daily Gift',
    },
    {
      id: 'grand_champion',
      title: 'Grand Sugar Champion',
      description: 'Collect 30 Total Stars across the Candy Kingdom.',
      current: Math.min(30, totalStars),
      target: 30,
      unlocked: totalStars >= 30,
      accentColor: 'from-amber-200 via-yellow-400 to-amber-600',
      badgeLabel: '30 Stars',
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const activeAvatarMeta =
    CANDY_AVATARS.find((a) => a.id === selectedAvatar) || CANDY_AVATARS[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playCoinReward();
    const cleaned = nameInput.trim().slice(0, 20) || 'Sweet Player';
    setNameInput(cleaned);
    onUpdateProfile(cleaned, selectedAvatar);
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2000);
  };

  const handleCopyGuestId = () => {
    soundManager.playButton();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(saveData.guestId).catch(() => {});
    }
    setCopiedId(true);
    window.setTimeout(() => setCopiedId(false), 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2.5 sm:p-5">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl board-tray-3d bg-[#241134] text-[#FFF9F2] overflow-hidden border-2 border-amber-300/45 shadow-[0_24px_70px_rgba(0,0,0,0.9)]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#4A2B5E] bg-gradient-to-r from-[#1A0B24] via-[#2B123D] to-[#1A0B24]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-amber-300 to-amber-600 p-1.5 flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-[#2B1204]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Guest Mode · Instant Play
                </span>
              </div>
              <h2 className="font-display text-lg sm:text-2xl font-black text-[#FFF9F2] leading-tight">
                PLAYER PROFILE
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Guest ID Pill */}
            <button
              type="button"
              onClick={handleCopyGuestId}
              title="Copy Guest Player ID"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#14071E] border border-amber-300/40 text-xs font-mono-tabular font-bold text-amber-300 flex items-center gap-1.5 hover:border-amber-300 transition-colors"
            >
              <span>ID: {saveData.guestId}</span>
              {copiedId ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 opacity-75" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playButton();
                onClose();
              }}
              aria-label="Close Profile"
              className="p-2 rounded-xl bg-[#341C47] hover:bg-[#46265E] text-[#FFF9F2] border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Hero Guest Player Card */}
          <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#3E1D59] via-[#54226E] to-[#34164B] border-2 border-amber-300/45 flex flex-col sm:flex-row items-center gap-4 shadow-lg">
            {/* Selected 3D Cartoon Candy Avatar Preview */}
            <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-3xl bg-[#1A0B26] border-2 border-amber-300 p-2.5 flex items-center justify-center shrink-0 shadow-[0_10px_25px_rgba(0,0,0,0.6)]">
              <CandyAvatarSVG avatarId={selectedAvatar} />
              <span className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-amber-300 text-[#2B1204] text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow">
                {activeAvatarMeta.name}
              </span>
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/35 border border-amber-300/35 text-xs font-bold text-amber-300">
                <Crown className="w-3.5 h-3.5" />
                <span>{rankTitle}</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-black text-white truncate mt-1">
                {nameInput || 'Sweet Player'}
              </h3>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5 text-xs text-[#E8D5C8]">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold">
                  Guest Player ID: {saveData.guestId}
                </span>
                <span>·</span>
                <span>
                  Badges:{' '}
                  <strong className="text-amber-300 font-mono-tabular">
                    {unlockedCount}/{achievements.length}
                  </strong>
                </span>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setActiveTab('overview');
                }}
                className={`flex-1 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border ${
                  activeTab === 'overview'
                    ? 'btn-3d-gold border-white'
                    : 'bg-[#1B0C28] text-[#D9C3B0] border-white/15'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Profile &amp; Stats</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  setActiveTab('achievements');
                }}
                className={`flex-1 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border ${
                  activeTab === 'achievements'
                    ? 'btn-3d-gold border-white'
                    : 'bg-[#1B0C28] text-[#D9C3B0] border-white/15'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>
                  Badges ({unlockedCount}/{achievements.length})
                </span>
              </button>
            </div>
          </div>

          {/* 6 Required Player Statistics Grid (Always Visible) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                Player Statistics
              </span>
              <span className="text-[11px] text-[#D9C3B0]">Saved Automatically to Device</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* 1. Current Level */}
              <div className="p-3 rounded-2xl bg-[#1A0B24] border border-[#492961] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-sky-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#D9C3B0] font-semibold">Current Level</p>
                  <p className="font-mono-tabular text-base sm:text-lg font-black text-white">
                    Level {currentLevel}
                  </p>
                </div>
              </div>

              {/* 2. Completed Levels */}
              <div className="p-3 rounded-2xl bg-[#1A0B24] border border-[#492961] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#D9C3B0] font-semibold">Completed Levels</p>
                  <p className="font-mono-tabular text-base sm:text-lg font-black text-white">
                    {levelsCompleted}
                  </p>
                </div>
              </div>

              {/* 3. Total Stars */}
              <div className="p-3 rounded-2xl bg-[#1A0B24] border border-[#492961] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#D9C3B0] font-semibold">Total Stars</p>
                  <p className="font-mono-tabular text-base sm:text-lg font-black text-amber-300">
                    {totalStars} ★
                  </p>
                </div>
              </div>

              {/* 4. Total Coins */}
              <div className="p-3 rounded-2xl bg-[#1A0B24] border border-[#492961] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center shrink-0">
                  <Coins className="w-5 h-5 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#D9C3B0] font-semibold">Total Coins</p>
                  <p className="font-mono-tabular text-base sm:text-lg font-black text-amber-300">
                    {totalCoins.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* 5. Highest Score */}
              <div className="p-3 rounded-2xl bg-[#1A0B24] border border-[#492961] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-purple-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#D9C3B0] font-semibold">Highest Score</p>
                  <p className="font-mono-tabular text-base sm:text-lg font-black text-white">
                    {highestScore.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* 6. Games Played */}
              <div className="p-3 rounded-2xl bg-[#1A0B24] border border-[#492961] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center shrink-0">
                  <Gamepad2 className="w-5 h-5 text-pink-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#D9C3B0] font-semibold">Games Played</p>
                  <p className="font-mono-tabular text-base sm:text-lg font-black text-white">
                    {gamesPlayed}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {activeTab === 'overview' ? (
            <>
              {/* Edit Player Nickname */}
              <div className="p-4 rounded-2xl bg-[#1A0B24] border border-[#46265E] space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="player-name-input"
                    className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Guest Nickname</span>
                  </label>
                  <span className="text-[11px] text-[#D9C3B0]">
                    {nameInput.length}/20 characters
                  </span>
                </div>
                <input
                  id="player-name-input"
                  type="text"
                  maxLength={20}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Sweet Player"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12061B] border-2 border-[#522D6E] text-sm sm:text-base font-extrabold text-white focus:outline-none focus:border-amber-300"
                />
              </div>

              {/* Select from 12 Colourful Cartoon Candy Avatars */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Choose Your 3D Cartoon Candy Avatar (12 Avatars)
                  </span>
                  <span className="text-xs font-bold text-white">{activeAvatarMeta.name}</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {CANDY_AVATARS.map((item) => {
                    const isSelected = selectedAvatar === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          soundManager.playButton();
                          setSelectedAvatar(item.id);
                        }}
                        title={`${item.name} (${item.subtitle})`}
                        className={`relative p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-gradient-to-b from-[#4C226B] to-[#2B1040] border-amber-300 ring-2 ring-amber-300/60 scale-105 shadow-lg'
                            : 'bg-[#190B24] border-[#3F2254] hover:border-amber-300/50 hover:scale-105'
                        }`}
                      >
                        <div className="w-11 h-11 sm:w-12 sm:h-12">
                          <CandyAvatarSVG avatarId={item.id} />
                        </div>
                        <span className="text-[10px] font-extrabold text-white truncate max-w-full">
                          {item.name}
                        </span>
                        {isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Achievements & Badges Showcase */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Kingdom Achievements &amp; Badges
                </span>
                <span className="text-xs font-mono-tabular font-bold text-emerald-300">
                  {unlockedCount} / {achievements.length} Unlocked
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievements.map((ach) => {
                  const pct = Math.min(100, Math.round((ach.current / ach.target) * 100));
                  return (
                    <div
                      key={ach.id}
                      className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 transition-all ${
                        ach.unlocked
                          ? 'bg-gradient-to-r from-[#34184C] to-[#230F36] border-amber-300/70 shadow-md'
                          : 'bg-[#160920]/80 border-[#361E47] opacity-75'
                      }`}
                    >
                      {/* 3D Badge Medallion */}
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
                          ach.unlocked ? ach.accentColor : 'from-slate-700 to-slate-900'
                        } border-2 ${
                          ach.unlocked ? 'border-amber-200' : 'border-white/15'
                        } flex flex-col items-center justify-center shrink-0 shadow-md`}
                      >
                        <Award
                          className={`w-5 h-5 ${
                            ach.unlocked ? 'text-white' : 'text-slate-400'
                          }`}
                        />
                        <span className="text-[8px] font-black uppercase text-white tracking-tighter">
                          {ach.badgeLabel}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">
                            {ach.title}
                          </h4>
                          {ach.unlocked ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-black shrink-0">
                              UNLOCKED ✓
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono-tabular text-[#D9C3B0] shrink-0">
                              {ach.current}/{ach.target}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#D9C3B0] mt-0.5 leading-snug">
                          {ach.description}
                        </p>
                        {/* Progress Bar */}
                        <div className="mt-2 h-2 w-full rounded-full bg-[#11061A] border border-white/10 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              ach.unlocked
                                ? 'bg-gradient-to-r from-emerald-400 to-amber-300'
                                : 'bg-pink-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Save Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#432459]">
            <div className="text-xs text-[#D9C3B0]">
              Playing as <strong className="text-white">Guest ({saveData.guestId})</strong> · Local Save Active
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={() => {
                  soundManager.playButton();
                  onClose();
                }}
                className="btn-3d-plum px-4 py-2.5 rounded-2xl text-xs font-bold text-[#FFF9F2]"
              >
                Close
              </button>

              <button
                type="submit"
                className="btn-3d-pink px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold text-white flex items-center gap-2 shadow-lg"
              >
                {savedToast ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Profile Saved!</span>
                  </>
                ) : (
                  <span>Save Guest Profile</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
