import React from 'react';
import { BoosterType } from '../types/game';

export const SweetBlastLogoSVG: React.FC<{ className?: string }> = ({
  className = 'w-full max-w-[380px]',
}) => (
  <svg
    viewBox="0 0 560 205"
    className={`${className} select-none drop-shadow-[0_12px_22px_rgba(0,0,0,0.68)]`}
  >
    <defs>
      <linearGradient id="titleGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="35%" stopColor="#FDE047" />
        <stop offset="80%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="titlePinkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFC2D4" />
        <stop offset="38%" stopColor="#FF2E63" />
        <stop offset="85%" stopColor="#C80032" />
        <stop offset="100%" stopColor="#7A001C" />
      </linearGradient>
      <linearGradient id="chocoCrestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#6D371A" />
        <stop offset="55%" stopColor="#431E0C" />
        <stop offset="100%" stopColor="#240D04" />
      </linearGradient>
      <linearGradient id="frostingRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="50%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#FDE68A" />
      </linearGradient>
    </defs>

    {/* Flanking Mini Swirl Lollipops Behind Crest */}
    <g transform="translate(88, 32) rotate(-22)">
      <rect x="-4" y="18" width="8" height="48" rx="4" fill="#FFFBEB" stroke="#B45309" strokeWidth="2" />
      <circle cx="0" cy="0" r="24" fill="#0EA5E9" stroke="#FFFFFF" strokeWidth="3.5" />
      <path d="M0,0 C0,-10 12,-10 12,0 C12,13 -14,13 -14,-2 C-14,-16 17,-16 17,2" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
    </g>
    <g transform="translate(472, 32) rotate(22)">
      <rect x="-4" y="18" width="8" height="48" rx="4" fill="#FFFBEB" stroke="#B45309" strokeWidth="2" />
      <circle cx="0" cy="0" r="24" fill="#10B981" stroke="#FFFFFF" strokeWidth="3.5" />
      <path d="M0,0 C0,-10 12,-10 12,0 C12,13 -14,13 -14,-2 C-14,-16 17,-16 17,2" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
    </g>

    {/* 3D Chocolate & Gold Confectionery Crest Backing */}
    <rect
      x="68"
      y="34"
      width="424"
      height="146"
      rx="46"
      fill="url(#chocoCrestGrad)"
      stroke="url(#frostingRimGrad)"
      strokeWidth="5"
    />
    <rect
      x="78"
      y="42"
      width="404"
      height="130"
      rx="38"
      fill="none"
      stroke="#A16207"
      strokeWidth="2"
      strokeDasharray="10 6"
    />

    {/* Royal Golden Crown */}
    <path
      d="M236 36L254 10L280 28L306 10L324 36H236Z"
      fill="url(#titleGoldGrad)"
      stroke="#451A03"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <circle cx="254" cy="8" r="4.5" fill="#0EA5E9" stroke="#FFF" strokeWidth="1.5" />
    <circle cx="280" cy="6" r="5.5" fill="#FF2E63" stroke="#FFF" strokeWidth="1.5" />
    <circle cx="306" cy="8" r="4.5" fill="#10B981" stroke="#FFF" strokeWidth="1.5" />

    {/* SWEET (3D Extruded Depth + Glossy Strawberry Fill) */}
    <text
      x="280"
      y="102"
      textAnchor="middle"
      fontFamily="Fraunces, Georgia, serif"
      fontWeight="900"
      fontSize="68"
      letterSpacing="2"
      fill="#3B0416"
      stroke="#3B0416"
      strokeWidth="15"
      strokeLinejoin="round"
      transform="translate(0, 7)"
    >
      SWEET
    </text>
    <text
      x="280"
      y="102"
      textAnchor="middle"
      fontFamily="Fraunces, Georgia, serif"
      fontWeight="900"
      fontSize="68"
      letterSpacing="2"
      fill="url(#titlePinkGrad)"
      stroke="#FFF9F2"
      strokeWidth="3.5"
      strokeLinejoin="round"
    >
      SWEET
    </text>

    {/* BLAST 3D (3D Extruded Depth + Spun Gold Fill) */}
    <text
      x="280"
      y="158"
      textAnchor="middle"
      fontFamily="Fraunces, Georgia, serif"
      fontWeight="900"
      fontSize="54"
      letterSpacing="3"
      fill="#2B0E02"
      stroke="#2B0E02"
      strokeWidth="14"
      strokeLinejoin="round"
      transform="translate(0, 6)"
    >
      BLAST 3D
    </text>
    <text
      x="280"
      y="158"
      textAnchor="middle"
      fontFamily="Fraunces, Georgia, serif"
      fontWeight="900"
      fontSize="54"
      letterSpacing="3"
      fill="url(#titleGoldGrad)"
      stroke="#FFFBEB"
      strokeWidth="3"
      strokeLinejoin="round"
    >
      BLAST 3D
    </text>

    {/* Decorative Corner Candy Gems on the Plaque */}
    <circle cx="96" cy="106" r="8" fill="#FF2E63" stroke="#FFF" strokeWidth="2" />
    <circle cx="464" cy="106" r="8" fill="#0EA5E9" stroke="#FFF" strokeWidth="2" />
  </svg>
);

export const BoosterIconSVG: React.FC<{ type: BoosterType; className?: string }> = ({
  type,
  className = 'w-6 h-6',
}) => {
  switch (type) {
    case 'hammer':
      return (
        <svg viewBox="0 0 48 48" className={`${className} drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)]`}>
          <defs>
            <linearGradient id="hammerHeadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF85A2" />
              <stop offset="45%" stopColor="#FF2E63" />
              <stop offset="100%" stopColor="#9E0B33" />
            </linearGradient>
            <linearGradient id="hammerStickGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
          </defs>
          {/* Golden Candy Cane Handle */}
          <path
            d="M11 38L28 21"
            stroke="url(#hammerStickGrad)"
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          <path
            d="M11 38L28 21"
            stroke="#FFFBEB"
            strokeWidth="2"
            strokeDasharray="3 4"
            strokeLinecap="round"
          />
          {/* 3D Mallet Head */}
          <g transform="rotate(42 29 17)">
            <rect
              x="17"
              y="8"
              width="24"
              height="15"
              rx="6"
              fill="url(#hammerHeadGrad)"
              stroke="#FFF9F2"
              strokeWidth="2"
            />
            {/* Gold End Caps */}
            <rect x="16" y="9.5" width="3.5" height="12" rx="1.5" fill="#FACC15" />
            <rect x="38.5" y="9.5" width="3.5" height="12" rx="1.5" fill="#FACC15" />
            {/* Glossy Specular Highlight */}
            <rect x="21" y="10.5" width="14" height="4" rx="2" fill="#FFFFFF" opacity="0.65" />
          </g>
          {/* Impact Star Sparkle */}
          <circle cx="14" cy="14" r="2.2" fill="#FEF08A" />
        </svg>
      );

    case 'color_bomb':
      return (
        <svg viewBox="0 0 48 48" className={`${className} drop-shadow-[0_3px_6px_rgba(0,0,0,0.55)]`}>
          <defs>
            <radialGradient id="bombSphereGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#6D3B8E" />
              <stop offset="50%" stopColor="#2E1344" />
              <stop offset="100%" stopColor="#12051E" />
            </radialGradient>
          </defs>
          {/* Outer Rainbow Glow Ring */}
          <circle
            cx="24"
            cy="24"
            r="19"
            fill="url(#bombSphereGrad)"
            stroke="#FACC15"
            strokeWidth="2.8"
          />
          {/* Glossy Top Reflection */}
          <ellipse cx="19" cy="14" rx="8" ry="4" fill="#FFFFFF" opacity="0.35" transform="rotate(-18 19 14)" />
          {/* 3D Rainbow Sprinkles */}
          <circle cx="17" cy="17" r="3.5" fill="#FF2E63" stroke="#FFF" strokeWidth="1" />
          <circle cx="31" cy="17" r="3.5" fill="#0EA5E9" stroke="#FFF" strokeWidth="1" />
          <circle cx="15" cy="28" r="3.5" fill="#10B981" stroke="#FFF" strokeWidth="1" />
          <circle cx="33" cy="28" r="3.5" fill="#FACC15" stroke="#FFF" strokeWidth="1" />
          <circle cx="24" cy="34" r="3.5" fill="#F97316" stroke="#FFF" strokeWidth="1" />
          <circle cx="24" cy="23" r="4.2" fill="#A855F7" stroke="#FFF" strokeWidth="1.2" />
        </svg>
      );

    case 'striped_candy':
      return (
        <svg viewBox="0 0 48 48" className={`${className} drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]`}>
          <defs>
            <linearGradient id="stripedBoosterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
          </defs>
          {/* Energy Arrows Behind */}
          <path
            d="M4 24H44M9 19L3 24L9 29M39 19L45 24L39 29"
            stroke="#FDE047"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Glossy 3D Striped Candy Core */}
          <circle
            cx="24"
            cy="24"
            r="14"
            fill="url(#stripedBoosterGrad)"
            stroke="#FFFFFF"
            strokeWidth="2.4"
          />
          {/* Sugar Cream Stripes */}
          <path
            d="M13 18H35M11 24H37M13 30H35"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            opacity="0.92"
          />
          {/* Top Specular Shine */}
          <ellipse cx="20" cy="15" rx="6" ry="2.5" fill="#FFFFFF" opacity="0.7" />
        </svg>
      );

    case 'wrapped_candy':
      return (
        <svg viewBox="0 0 48 48" className={`${className} drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]`}>
          <defs>
            <linearGradient id="wrappedBoosterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="50%" stopColor="#DB2777" />
              <stop offset="100%" stopColor="#831843" />
            </linearGradient>
          </defs>
          {/* Left & Right Twisted Foil Wrapper Tails */}
          <path
            d="M12 18L4 12V36L12 30Z"
            fill="#FACC15"
            stroke="#FFF"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M36 18L44 12V36L36 30Z"
            fill="#FACC15"
            stroke="#FFF"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* 3D Rounded Square Candy Body */}
          <rect
            x="11"
            y="11"
            width="26"
            height="26"
            rx="8"
            fill="url(#wrappedBoosterGrad)"
            stroke="#FFF"
            strokeWidth="2.4"
          />
          {/* Explosive Star Center */}
          <path
            d="M24 16L26.2 21.5L32 22L27.5 25.8L29 31.5L24 28.2L19 31.5L20.5 25.8L16 22L21.8 21.5Z"
            fill="#FEF08A"
          />
          {/* Top Gloss Highlight */}
          <rect x="15" y="13.5" width="14" height="3.5" rx="1.75" fill="#FFFFFF" opacity="0.65" />
        </svg>
      );

    case 'extra_moves':
      return (
        <svg viewBox="0 0 48 48" className={`${className} drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]`}>
          <defs>
            <linearGradient id="movesOrbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="55%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#4C1D95" />
            </linearGradient>
          </defs>
          <circle
            cx="24"
            cy="24"
            r="18"
            fill="url(#movesOrbGrad)"
            stroke="#FDE047"
            strokeWidth="2.8"
          />
          <ellipse cx="20" cy="13" rx="8" ry="3.5" fill="#FFFFFF" opacity="0.45" />
          <text
            x="24"
            y="30"
            textAnchor="middle"
            fill="#FFFBEB"
            fontSize="18"
            fontWeight="900"
            fontFamily="Fraunces, Georgia, serif"
          >
            +5
          </text>
        </svg>
      );

    case 'extra_life':
      return (
        <svg viewBox="0 0 48 48" className={`${className} drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]`}>
          <defs>
            <linearGradient id="heartLifeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF7597" />
              <stop offset="45%" stopColor="#FF1E56" />
              <stop offset="100%" stopColor="#880626" />
            </linearGradient>
          </defs>
          {/* Golden Crown atop the Heart */}
          <path
            d="M17 12L20 6L24 10L28 6L31 12Z"
            fill="#FACC15"
            stroke="#FFF"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* 3D Glossy Ruby Heart */}
          <path
            d="M24 41C24 41 7 30 7 18.5C7 12.8 11.5 9 16.5 9C19.8 9 22.5 10.8 24 13.3C25.5 10.8 28.2 9 31.5 9C36.5 9 41 12.8 41 18.5C41 30 24 41 24 41Z"
            fill="url(#heartLifeGrad)"
            stroke="#FFF9F2"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          {/* Specular Shine */}
          <ellipse
            cx="15.5"
            cy="16.5"
            rx="4.5"
            ry="2.5"
            transform="rotate(-28 15.5 16.5)"
            fill="#FFFFFF"
            opacity="0.7"
          />
          {/* Plus Emblem */}
          <path
            d="M24 20V29M19.5 24.5H28.5"
            stroke="#FFFBEB"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'shuffle':
      return (
        <svg viewBox="0 0 48 48" className={`${className} drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]`}>
          <defs>
            <linearGradient id="shuffleGemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="55%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>
          </defs>
          <rect
            x="6"
            y="6"
            width="36"
            height="36"
            rx="12"
            fill="url(#shuffleGemGrad)"
            stroke="#FDE047"
            strokeWidth="2.5"
          />
          <path
            d="M13 18H20L28 30H35M35 18H28L20 30H13"
            stroke="#FEF08A"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M31 14L35 18L31 22M31 26L35 30L31 34"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      );

    case 'row_blast':
      return (
        <svg viewBox="0 0 36 36" className={className}>
          <rect x="4" y="13" width="28" height="10" rx="5" fill="#0EA5E9" stroke="#FFF" strokeWidth="1.6" />
          <path d="M8 18H28M12 14L7 18L12 22M24 14L29 18L24 22" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'col_blast':
      return (
        <svg viewBox="0 0 36 36" className={className}>
          <rect x="13" y="4" width="10" height="28" rx="5" fill="#10B981" stroke="#FFF" strokeWidth="1.6" />
          <path d="M18 8V28M14 12L18 7L22 12M14 24L18 29L22 24" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
};

