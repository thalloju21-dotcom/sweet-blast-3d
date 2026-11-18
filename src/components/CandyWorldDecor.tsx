import React from 'react';
import { CandyPiece } from './CandyPiece';

interface CandyWorldDecorProps {
  heroImgFailed: boolean;
  onHeroImgError: () => void;
}

/**
 * Renders the bright, magical Fantasy Candy World environment for the Home Screen:
 * - Multi-layered colourful candy mountains with snow-white & strawberry sugar frosting
 * - Top & bottom glossy melted chocolate borders and wafer decorations
 * - Giant animated swirl lollipops & translucent jelly arches
 * - Smoothly floating 3D glossy candies in the background
 */
export const CandyWorldDecor: React.FC<CandyWorldDecorProps> = ({
  heroImgFailed,
  onHeroImgError,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* 1. Magical Candy Sky Gradient & Illustrated Valley */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#3B125E] via-[#8E246D] to-[#FF9E6D]" />

      {!heroImgFailed && (
        <img
          src="/src/assets/images/candy_kingdom_backdrop_1794915431357.jpg"
          alt="Enchanted Sugar Kingdom Valley"
          referrerPolicy="no-referrer"
          onError={onHeroImgError}
          className="absolute inset-0 w-full h-full object-cover object-bottom opacity-45 mix-blend-luminosity"
        />
      )}

      {/* Bright magical radial glow behind the center PLAY button & logo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(255, 236, 179, 0.38) 0%, rgba(255, 77, 136, 0.25) 42%, rgba(28, 10, 46, 0.72) 100%)',
        }}
      />

      {/* 2. Top Melted Chocolate Drip Valance */}
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className="absolute top-0 left-0 w-full h-12 sm:h-16 drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
      >
        <defs>
          <linearGradient id="chocoTopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5C2C16" />
            <stop offset="55%" stopColor="#3E1B0C" />
            <stop offset="100%" stopColor="#240D04" />
          </linearGradient>
          <linearGradient id="chocoHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A16247" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#FDE68A" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#A16247" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path
          d="M0,0 H1440 V28 C1390,28 1370,68 1330,68 C1290,68 1275,32 1230,32 C1185,32 1165,78 1120,78 C1075,78 1055,26 1000,26 C945,26 925,62 880,62 C835,62 815,30 760,30 C705,30 685,84 640,84 C595,84 575,28 520,28 C465,28 445,66 400,66 C355,66 335,32 280,32 C225,32 205,74 160,74 C115,74 95,30 50,30 C20,30 10,45 0,45 Z"
          fill="url(#chocoTopGrad)"
        />
        <path
          d="M0,12 H1440"
          stroke="url(#chocoHighlight)"
          strokeWidth="3"
          strokeDasharray="18 12"
        />
      </svg>

      {/* 3. Colourful Candy Mountains, Lollipops, Jelly Domes & Chocolate Hills at Bottom */}
      <svg
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-[38vh] sm:h-[42vh]"
      >
        <defs>
          {/* Far Candy Mountain: Lavender & Berry */}
          <linearGradient id="mtnPurple" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="45%" stopColor="#7E22CE" />
            <stop offset="100%" stopColor="#3B0764" />
          </linearGradient>
          {/* Left Candy Mountain: Strawberry Pink & Cream */}
          <linearGradient id="mtnPink" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF80B5" />
            <stop offset="50%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#690622" />
          </linearGradient>
          {/* Right Candy Mountain: Mint & Turquoise Jelly */}
          <linearGradient id="mtnMint" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>
          {/* Center-Right Caramel Gold Hill */}
          <linearGradient id="mtnGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          {/* Foreground Chocolate Slope */}
          <linearGradient id="chocoHill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4E2513" />
            <stop offset="55%" stopColor="#2B1207" />
            <stop offset="100%" stopColor="#160702" />
          </linearGradient>
          {/* Cream Frosting Cap */}
          <linearGradient id="frostingCap" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#FFE4E6" />
            <stop offset="100%" stopColor="#FDA4AF" />
          </linearGradient>
        </defs>

        {/* Distant Berry Candy Mountains */}
        <path
          d="M-60,420 L-60,210 C60,110 210,90 360,190 C510,80 690,65 860,185 C1020,75 1210,85 1370,180 L1500,240 L1500,420 Z"
          fill="url(#mtnPurple)"
          opacity="0.85"
        />

        {/* Giant Swirl Lollipop Left */}
        <g transform="translate(155, 85)" className="animate-float-slow">
          <rect x="46" y="85" width="10" height="140" rx="5" fill="#FFFBEB" stroke="#D97706" strokeWidth="2" />
          <circle cx="51" cy="51" r="46" fill="#FF2E63" stroke="#FFF" strokeWidth="4" />
          <path
            d="M51,51 C51,32 72,32 72,51 C72,74 26,74 26,48 C26,18 84,18 84,52"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <ellipse cx="35" cy="30" rx="14" ry="6" transform="rotate(-25 35 30)" fill="#FFFFFF" fillOpacity="0.6" />
        </g>

        {/* Giant Swirl Lollipop Right */}
        <g transform="translate(1180, 75)" className="animate-float-slow" style={{ animationDelay: '1.2s' }}>
          <rect x="46" y="85" width="10" height="150" rx="5" fill="#FFFBEB" stroke="#0284C7" strokeWidth="2" />
          <circle cx="51" cy="51" r="44" fill="#0EA5E9" stroke="#FEF08A" strokeWidth="4" />
          <path
            d="M51,51 C51,32 70,32 70,51 C70,72 28,72 28,48 C28,20 82,20 82,52"
            fill="none"
            stroke="#FEF08A"
            strokeWidth="7.5"
            strokeLinecap="round"
          />
          <ellipse cx="35" cy="30" rx="13" ry="5.5" transform="rotate(-25 35 30)" fill="#FFFFFF" fillOpacity="0.65" />
        </g>

        {/* Mid-Left Strawberry Candy Mountain with Dripping Sugar Frosting */}
        <path
          d="M-40,420 L-40,220 C80,120 260,115 430,245 C540,320 620,360 720,420 Z"
          fill="url(#mtnPink)"
        />
        <path
          d="M35,174 C125,126 235,128 330,182 C305,198 292,222 272,220 C252,218 245,192 222,192 C198,192 188,226 165,226 C142,226 134,195 110,195 C88,195 75,216 55,212 C40,208 28,185 35,174 Z"
          fill="url(#frostingCap)"
        />

        {/* Mid-Right Mint Jelly & Caramel Mountains */}
        <path
          d="M620,420 C740,260 920,140 1120,165 C1260,180 1370,235 1480,290 L1480,420 Z"
          fill="url(#mtnGold)"
        />
        <path
          d="M840,420 C960,230 1140,125 1320,175 C1400,195 1450,240 1490,275 L1490,420 Z"
          fill="url(#mtnMint)"
        />

        {/* Translucent Bouncy Jelly Beans & Sugar Sprinkles on Hills */}
        <circle cx="190" cy="270" r="18" fill="#FACC15" fillOpacity="0.8" />
        <circle cx="250" cy="300" r="14" fill="#38BDF8" fillOpacity="0.8" />
        <circle cx="1180" cy="260" r="20" fill="#FF3366" fillOpacity="0.8" />
        <circle cx="1090" cy="295" r="15" fill="#A855F7" fillOpacity="0.8" />

        {/* Foreground Rich Chocolate Fudge Hills */}
        <path
          d="M-20,420 L-20,335 C180,285 410,315 680,365 C960,310 1220,280 1460,340 L1460,420 Z"
          fill="url(#chocoHill)"
        />
        <path
          d="M-20,345 C180,295 410,325 680,375 C960,320 1220,290 1460,350"
          fill="none"
          stroke="#FDE68A"
          strokeWidth="3"
          strokeOpacity="0.35"
        />
      </svg>

      {/* 4. Floating Glossy 3D Candies Across the Magical Sky */}
      <div
        className="absolute top-[13%] left-[5%] w-14 h-14 sm:w-20 sm:h-20 animate-float-slow"
        style={{ animationDelay: '0s' }}
      >
        <CandyPiece color="red" special="none" />
      </div>

      <div
        className="absolute top-[15%] right-[6%] w-14 h-14 sm:w-20 sm:h-20 animate-float-slow"
        style={{ animationDelay: '0.9s' }}
      >
        <CandyPiece color="blue" special="striped_h" />
      </div>

      <div
        className="absolute top-[36%] left-[4%] sm:left-[9%] w-12 h-12 sm:w-16 sm:h-16 animate-float-slow"
        style={{ animationDelay: '1.7s' }}
      >
        <CandyPiece color="green" special="none" />
      </div>

      <div
        className="absolute top-[35%] right-[4%] sm:right-[9%] w-12 h-12 sm:w-16 sm:h-16 animate-float-slow"
        style={{ animationDelay: '2.3s' }}
      >
        <CandyPiece color="orange" special="none" />
      </div>

      <div
        className="absolute bottom-[25%] left-[7%] sm:left-[13%] w-14 h-14 sm:w-20 sm:h-20 animate-float-slow"
        style={{ animationDelay: '0.5s' }}
      >
        <CandyPiece color="yellow" special="wrapped" />
      </div>

      <div
        className="absolute bottom-[24%] right-[7%] sm:right-[13%] w-16 h-16 sm:w-20 sm:h-20 animate-float-slow"
        style={{ animationDelay: '1.4s' }}
      >
        <CandyPiece color="purple" special="color_bomb" />
      </div>

      <div
        className="hidden md:block absolute top-[22%] left-[22%] w-12 h-12 animate-float-slow opacity-90"
        style={{ animationDelay: '2.1s' }}
      >
        <CandyPiece color="purple" special="none" />
      </div>

      <div
        className="hidden md:block absolute top-[21%] right-[22%] w-12 h-12 animate-float-slow opacity-90"
        style={{ animationDelay: '0.4s' }}
      >
        <CandyPiece color="yellow" special="none" />
      </div>
    </div>
  );
};
