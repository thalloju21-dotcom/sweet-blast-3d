import React, { useId } from 'react';
import { BlockerType, CandyColor, SpecialCandyType } from '../types/game';

interface CandyPieceProps {
  color: CandyColor;
  special: SpecialCandyType;
  blocker?: BlockerType;
  sizeClass?: string;
}

/**
 * Custom-designed, high-gloss 3D confectionery SVG artwork for SWEET BLAST 3D:
 * 1. Red: Shiny curved Jelly Bean with subsurface ruby glow & dual specular reflections.
 * 2. Blue: Glossy spherical Round Hard Candy with sculpted swirl ridges & azure refraction.
 * 3. Green: Square Jelly Cushion with rounded corners, beveled gummy rim & emerald translucency.
 * 4. Yellow: Shiny Teardrop (pear-drop) candy with tapered crown, golden glow & liquid highlight.
 * 5. Purple: Glossy multi-lobed Berry/Grape Cluster where every lobe has 3D shading & specular droplets.
 * 6. Orange: Plump Oval Lozenge candy with recessed citrus ring, 3D sidewall & glass sheen.
 */
export const CandyPiece: React.FC<CandyPieceProps> = ({
  color,
  special,
  blocker = 'none',
  sizeClass = 'w-full h-full',
}) => {
  const uid = useId().replace(/:/g, '');

  // Wafer crate blocker completely covers the tile
  if (blocker === 'wafer_crate') {
    return (
      <div className={`relative ${sizeClass} flex items-center justify-center p-0.5`}>
        <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow-[0_4px_5px_rgba(0,0,0,0.6)]">
          <defs>
            <linearGradient id={`wafer_${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="68" height="68" rx="14" fill={`url(#wafer_${uid})`} stroke="#451A03" strokeWidth="3" />
          <rect x="14" y="14" width="52" height="52" rx="9" fill="#92400E" stroke="#FDE68A" strokeWidth="1.8" strokeOpacity="0.5" />
          <path d="M18 30H62M18 50H62M30 18V62M50 18V62" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M19 19L61 61M61 19L19 61" stroke="#FDE68A" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.7" />
          <circle cx="40" cy="40" r="7.5" fill="#FDE68A" stroke="#78350F" strokeWidth="2.5" />
        </svg>
      </div>
    );
  }

  // Geometry paths in an 80x80 coordinate space for high-detail 3D rendering
  // 1. RED JELLY BEAN: Smooth tilted kidney-bean silhouette with indented waist
  const redBeanPath =
    'M 22,19 C 33,9 57,10 64,23 C 70,35 64,56 50,64 C 37,71 17,67 12,54 C 8,43 15,37 22,33 C 26,30 14,26 22,19 Z';

  // 2. GREEN SQUARE JELLY: Plump pillowed square with smooth rounded corners
  const greenPillowPath =
    'M 25,11 C 35,9.5 45,9.5 55,11 C 64,12.5 67.5,16 69,25 C 70.5,35 70.5,45 69,55 C 67.5,64 64,67.5 55,69 C 45,70.5 35,70.5 25,69 C 16,67.5 12.5,64 11,55 C 9.5,45 9.5,35 11,25 C 12.5,16 16,12.5 25,11 Z';

  // 4. YELLOW TEARDROP: Classic glossy pear-drop candy with rounded base and sculpted top point
  const yellowTeardropPath =
    'M 40,8 C 43.5,8 46.5,12.5 50.5,20 C 57.5,32.5 64,43 64,52.5 C 64,65.5 53.5,72 40,72 C 26.5,72 16,65.5 16,52.5 C 16,43 22.5,32.5 29.5,20 C 33.5,12.5 36.5,8 40,8 Z';

  // 5. PURPLE CLUSTER: 6-lobed glossy grape/berry cluster silhouette (for stripe clipping & shadow)
  const purpleClusterPath =
    'M 40,9 C 48,9 54,14 55,21 C 63,23 68,30 66,39 C 68,47 63,56 55,58 C 52,66 46,71 40,71 C 34,71 28,66 25,58 C 17,56 12,47 14,39 C 12,30 17,23 25,21 C 26,14 32,9 40,9 Z';

  return (
    <div className={`relative ${sizeClass} flex items-center justify-center select-none pointer-events-none`}>
      <svg
        viewBox="0 0 80 80"
        className="w-[95%] h-[95%] overflow-visible drop-shadow-[0_5px_6px_rgba(0,0,0,0.62)]"
      >
        <defs>
          {/* ==============================================================
              SHARED 3D LIGHTING, SPECULAR & STRIPE DEFINITIONS
          ============================================================== */}
          <linearGradient id={`spec_top_${uid}`} x1="0%" y1="0%" x2="25%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id={`spec_soft_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </linearGradient>

          {/* 3D Sculpted Cream-White Sugar Stripes (Horizontal & Vertical) */}
          <pattern
            id={`stripe_h_${uid}`}
            width="80"
            height="15"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-6)"
          >
            <rect x="0" y="0" width="80" height="7" fill="#FFFDF9" fillOpacity="0.92" />
            <rect x="0" y="0" width="80" height="2" fill="#FFFFFF" />
            <rect x="0" y="5.5" width="80" height="1.8" fill="#E2E8F0" fillOpacity="0.75" />
          </pattern>

          <pattern
            id={`stripe_v_${uid}`}
            width="15"
            height="80"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(6)"
          >
            <rect x="0" y="0" width="7" height="80" fill="#FFFDF9" fillOpacity="0.92" />
            <rect x="0" y="0" width="2" height="80" fill="#FFFFFF" />
            <rect x="5.5" y="0" width="1.8" height="80" fill="#E2E8F0" fillOpacity="0.75" />
          </pattern>

          {/* Wrapped Foil Translucent Cellophane Gradients */}
          <linearGradient id={`foil_back_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="45%" stopColor="#FDE68A" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.55" />
          </linearGradient>

          <linearGradient id={`foil_front_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.68" />
            <stop offset="30%" stopColor="#FFFBEB" stopOpacity="0.22" />
            <stop offset="70%" stopColor="#FDE047" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.58" />
          </linearGradient>

          {/* ==============================================================
              1. RED SHINY JELLY BEAN GRADIENTS
          ============================================================== */}
          <radialGradient id={`red_body_${uid}`} cx="36%" cy="28%" r="68%" fx="30%" fy="22%">
            <stop offset="0%" stopColor="#FF8FA3" />
            <stop offset="22%" stopColor="#FF1E42" />
            <stop offset="62%" stopColor="#C80026" />
            <stop offset="88%" stopColor="#7A0016" />
            <stop offset="100%" stopColor="#4D000B" />
          </radialGradient>
          <radialGradient id={`red_sss_${uid}`} cx="68%" cy="76%" r="48%">
            <stop offset="0%" stopColor="#FF5C77" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#FF1E42" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7A0016" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`clip_red_${uid}`}>
            <path d={redBeanPath} />
          </clipPath>

          {/* ==============================================================
              2. BLUE GLOSSY ROUND CANDY GRADIENTS
          ============================================================== */}
          <radialGradient id={`blue_body_${uid}`} cx="34%" cy="26%" r="68%" fx="28%" fy="20%">
            <stop offset="0%" stopColor="#BDF4FF" />
            <stop offset="20%" stopColor="#1AD1FF" />
            <stop offset="56%" stopColor="#0077E6" />
            <stop offset="86%" stopColor="#003B8E" />
            <stop offset="100%" stopColor="#001D4A" />
          </radialGradient>
          <radialGradient id={`blue_sss_${uid}`} cx="70%" cy="78%" r="46%">
            <stop offset="0%" stopColor="#5CEEFF" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#00A6FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#003B8E" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`clip_blue_${uid}`}>
            <circle cx="40" cy="40" r="29" />
          </clipPath>

          {/* ==============================================================
              3. GREEN SQUARE JELLY CANDY GRADIENTS
          ============================================================== */}
          <radialGradient id={`green_body_${uid}`} cx="34%" cy="26%" r="72%" fx="28%" fy="22%">
            <stop offset="0%" stopColor="#B8FFCE" />
            <stop offset="22%" stopColor="#1EE65A" />
            <stop offset="60%" stopColor="#059B38" />
            <stop offset="88%" stopColor="#02591F" />
            <stop offset="100%" stopColor="#013310" />
          </radialGradient>
          <radialGradient id={`green_sss_${uid}`} cx="65%" cy="78%" r="50%">
            <stop offset="0%" stopColor="#73FF9E" stopOpacity="0.88" />
            <stop offset="60%" stopColor="#10B981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#02591F" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`clip_green_${uid}`}>
            <path d={greenPillowPath} />
          </clipPath>

          {/* ==============================================================
              4. YELLOW SHINY TEARDROP CANDY GRADIENTS
          ============================================================== */}
          <radialGradient id={`yellow_body_${uid}`} cx="36%" cy="34%" r="68%" fx="30%" fy="26%">
            <stop offset="0%" stopColor="#FFFDE0" />
            <stop offset="22%" stopColor="#FFE81A" />
            <stop offset="58%" stopColor="#F59E0B" />
            <stop offset="88%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </radialGradient>
          <radialGradient id={`yellow_sss_${uid}`} cx="58%" cy="76%" r="44%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.92" />
            <stop offset="60%" stopColor="#FACC15" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`clip_yellow_${uid}`}>
            <path d={yellowTeardropPath} />
          </clipPath>

          {/* ==============================================================
              5. PURPLE GLOSSY CLUSTER CANDY GRADIENTS
          ============================================================== */}
          <radialGradient id={`purple_lobe_${uid}`} cx="34%" cy="28%" r="70%" fx="28%" fy="22%">
            <stop offset="0%" stopColor="#F7D4FF" />
            <stop offset="24%" stopColor="#D13BFF" />
            <stop offset="62%" stopColor="#8611C2" />
            <stop offset="90%" stopColor="#4A0475" />
            <stop offset="100%" stopColor="#2A0047" />
          </radialGradient>
          <radialGradient id={`purple_sss_${uid}`} cx="68%" cy="76%" r="50%">
            <stop offset="0%" stopColor="#F0ABFC" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#4A0475" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`clip_purple_${uid}`}>
            <path d={purpleClusterPath} />
          </clipPath>

          {/* ==============================================================
              6. ORANGE OVAL LOZENGE CANDY GRADIENTS
          ============================================================== */}
          <radialGradient id={`orange_body_${uid}`} cx="34%" cy="28%" r="70%" fx="28%" fy="20%">
            <stop offset="0%" stopColor="#FFF0C2" />
            <stop offset="22%" stopColor="#FF8811" />
            <stop offset="60%" stopColor="#EA4C00" />
            <stop offset="88%" stopColor="#9A2400" />
            <stop offset="100%" stopColor="#5C1100" />
          </radialGradient>
          <radialGradient id={`orange_sss_${uid}`} cx="66%" cy="78%" r="48%">
            <stop offset="0%" stopColor="#FDBA74" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#FB923C" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#9A2400" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`clip_orange_${uid}`}>
            <ellipse cx="40" cy="40" rx="31" ry="22" transform="rotate(-14 40 40)" />
          </clipPath>

          {/* ==============================================================
              SPECIAL: RAINBOW COLOUR BOMB GRADIENTS
          ============================================================== */}
          <radialGradient id={`choco_bomb_${uid}`} cx="34%" cy="28%" r="70%" fx="26%" fy="22%">
            <stop offset="0%" stopColor="#8B5E4B" />
            <stop offset="28%" stopColor="#4E2A1E" />
            <stop offset="68%" stopColor="#29120B" />
            <stop offset="92%" stopColor="#140703" />
            <stop offset="100%" stopColor="#080200" />
          </radialGradient>
          <radialGradient id={`bomb_aura_${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FDE047" stopOpacity="0.45" />
            <stop offset="80%" stopColor="#EC4899" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ================================================================
            WRAPPED CANDY BACK FOIL LAYER (Crinkled 3D Cellophane Ears)
        ================================================================ */}
        {special === 'wrapped' && (
          <g className="animate-pulse-glow">
            {/* Top-left & Bottom-right crinkled wrapper twists */}
            <path
              d="M 6,16 C 14,4 22,8 27,18 L 18,27 C 8,22 4,22 6,16 Z"
              fill={`url(#foil_back_${uid})`}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeOpacity="0.85"
            />
            <path
              d="M 74,16 C 66,4 58,8 53,18 L 62,27 C 72,22 76,22 74,16 Z"
              fill={`url(#foil_back_${uid})`}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeOpacity="0.85"
            />
            <path
              d="M 6,64 C 14,76 22,72 27,62 L 18,53 C 8,58 4,58 6,64 Z"
              fill={`url(#foil_back_${uid})`}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeOpacity="0.85"
            />
            <path
              d="M 74,64 C 66,76 58,72 53,62 L 62,53 C 72,58 76,58 74,64 Z"
              fill={`url(#foil_back_${uid})`}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeOpacity="0.85"
            />
            {/* Translucent rear cushion pouch */}
            <rect
              x="9"
              y="9"
              width="62"
              height="62"
              rx="18"
              fill={`url(#foil_back_${uid})`}
              stroke="#FFFBEB"
              strokeWidth="2"
              strokeOpacity="0.9"
            />
          </g>
        )}

        {/* ================================================================
            SPECIAL CANDY: RAINBOW COLOUR BOMB (Chocolate Sphere + 3D Gems)
        ================================================================ */}
        {special === 'color_bomb' ? (
          <g>
            {/* Outer Rainbow Halo */}
            <circle cx="40" cy="40" r="37" fill={`url(#bomb_aura_${uid})`} className="animate-pulse-glow" />

            {/* 3D Base Shadow Rim */}
            <circle cx="40" cy="42" r="29" fill="#090301" />

            {/* Main Glossy Chocolate Fudge Sphere */}
            <circle
              cx="40"
              cy="40"
              r="29"
              fill={`url(#choco_bomb_${uid})`}
              stroke="#6E4230"
              strokeWidth="1.4"
            />

            {/* Chocolate Specular Glaze Reflection */}
            <path
              d="M 22,23 C 28,15 44,14 52,20 C 44,18 30,20 22,29 Z"
              fill={`url(#spec_top_${uid})`}
            />

            {/* 3D Protruding Rainbow Sugar Cones / Sprinkles */}
            {[
              { cx: 40, cy: 17, r: 5.5, c1: '#FF94B2', c2: '#FF1E42', c3: '#7A0016' }, // Red top
              { cx: 21, cy: 27, r: 5.4, c1: '#BAE6FD', c2: '#0099FF', c3: '#003B8E' }, // Blue upper-left
              { cx: 59, cy: 27, r: 5.4, c1: '#FEF9C3', c2: '#FFD60A', c3: '#A16207' }, // Yellow upper-right
              { cx: 19, cy: 46, r: 5.4, c1: '#BBF7D0', c2: '#10E65A', c3: '#045D22' }, // Green lower-left
              { cx: 61, cy: 46, r: 5.4, c1: '#F5D0FE', c2: '#C026D3', c3: '#581C87' }, // Purple lower-right
              { cx: 31, cy: 60, r: 5.2, c1: '#FFEDD5', c2: '#FF7A00', c3: '#7C2D12' }, // Orange bottom-left
              { cx: 49, cy: 60, r: 5.2, c1: '#A5F3FC', c2: '#06B6D4', c3: '#164E63' }, // Cyan bottom-right
              { cx: 40, cy: 36, r: 6.4, c1: '#FFFBEB', c2: '#FF2E63', c3: '#880E4F' }, // Center core gem
              { cx: 31, cy: 41, r: 4.6, c1: '#FEF9C3', c2: '#FACC15', c3: '#854D0E' },
              { cx: 49, cy: 41, r: 4.6, c1: '#D9F99D', c2: '#22C55E', c3: '#14532D' },
              { cx: 40, cy: 26, r: 4.5, c1: '#E9D5FF', c2: '#A855F7', c3: '#4C1D95' },
              { cx: 40, cy: 50, r: 4.8, c1: '#BAE6FD', c2: '#38BDF8', c3: '#075985' },
            ].map((gem, idx) => (
              <g key={idx}>
                {/* Socket shadow on chocolate */}
                <circle cx={gem.cx} cy={gem.cy + 1.4} r={gem.r} fill="#080200" fillOpacity="0.75" />
                {/* 3D Sugar Drop */}
                <circle cx={gem.cx} cy={gem.cy} r={gem.r} fill={gem.c2} stroke={gem.c3} strokeWidth="1" />
                {/* Inner bright cap */}
                <circle cx={gem.cx - gem.r * 0.22} cy={gem.cy - gem.r * 0.22} r={gem.r * 0.58} fill={gem.c1} fillOpacity="0.85" />
                {/* Pinpoint white glint */}
                <circle cx={gem.cx - gem.r * 0.32} cy={gem.cy - gem.r * 0.32} r={gem.r * 0.24} fill="#FFFFFF" />
              </g>
            ))}
          </g>
        ) : (
          <g>
            {/* ==============================================================
                1. RED CANDY: SHINY 3D JELLY BEAN
            ============================================================== */}
            {color === 'red' && (
              <g>
                {/* 3D Extruded Bottom Rim for physical thickness */}
                <path d={redBeanPath} transform="translate(0, 3.2)" fill="#4A000B" />
                {/* Main Sculpted Jelly Bean Volume */}
                <path d={redBeanPath} fill={`url(#red_body_${uid})`} />
                {/* Subsurface Scattering Internal Ruby Glow */}
                <path d={redBeanPath} fill={`url(#red_sss_${uid})`} />

                {/* Striped Overlay Clipped to Jelly Bean Contour */}
                {special === 'striped_h' && (
                  <g clipPath={`url(#clip_red_${uid})`}>
                    <rect x="0" y="0" width="80" height="80" fill={`url(#stripe_h_${uid})`} />
                  </g>
                )}
                {special === 'striped_v' && (
                  <g clipPath={`url(#clip_red_${uid})`}>
                    <rect x="0" y="0" width="80" height="80" fill={`url(#stripe_v_${uid})`} />
                  </g>
                )}

                {/* Rim Highlight around curved bean contour */}
                <path
                  d={redBeanPath}
                  fill="none"
                  stroke="#FFCCD5"
                  strokeWidth="1.5"
                  strokeOpacity="0.45"
                />
                {/* Bottom-Right Reflected Bounce Light Arc */}
                <path
                  d="M 24,60 C 36,65 52,60 58,47"
                  fill="none"
                  stroke="#FF8FA3"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeOpacity="0.6"
                />
                {/* Primary Curved Liquid-Glass Specular Highlight */}
                <path
                  d="M 25,21 C 34,13 51,14 57,23 C 59,26 55,29 50,26 C 43,21 33,21 26,27 C 22,30 21,25 25,21 Z"
                  fill={`url(#spec_top_${uid})`}
                />
                {/* Secondary Pinpoint Glint */}
                <ellipse
                  cx="57"
                  cy="31"
                  rx="3.2"
                  ry="2.2"
                  transform="rotate(25 57 31)"
                  fill="#FFFFFF"
                  fillOpacity="0.88"
                />
              </g>
            )}

            {/* ==============================================================
                2. BLUE CANDY: GLOSSY 3D ROUND SPHERE CANDY
            ============================================================== */}
            {color === 'blue' && (
              <g>
                {/* 3D Extruded Bottom Shadow Rim */}
                <circle cx="40" cy="43.2" r="29" fill="#001840" />
                {/* Main Spherical Candy Body */}
                <circle cx="40" cy="40" r="29" fill={`url(#blue_body_${uid})`} />
                {/* Subsurface Cyan Refraction Glow */}
                <circle cx="40" cy="40" r="29" fill={`url(#blue_sss_${uid})`} />

                {/* Subtle Sculpted Hard-Candy Concentric Ridges / Swirl Texture */}
                <circle
                  cx="40"
                  cy="40"
                  r="21"
                  fill="none"
                  stroke="#7CE8FF"
                  strokeWidth="2"
                  strokeOpacity="0.25"
                />
                <path
                  d="M 40,26 C 49,26 55,33 54,42 C 53,50 45,55 36,53 C 29,51 25,44 27,36 C 29,30 35,28 40,31"
                  fill="none"
                  stroke="#002B6B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeOpacity="0.28"
                />
                <path
                  d="M 40,25 C 49,25 55,32 54,41 C 53,49 45,54 36,52 C 29,50 25,43 27,35"
                  fill="none"
                  stroke="#E0F9FF"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeOpacity="0.4"
                />

                {/* Striped Overlay Clipped to Sphere */}
                {special === 'striped_h' && (
                  <g clipPath={`url(#clip_blue_${uid})`}>
                    <rect x="0" y="0" width="80" height="80" fill={`url(#stripe_h_${uid})`} />
                  </g>
                )}
                {special === 'striped_v' && (
                  <g clipPath={`url(#clip_blue_${uid})`}>
                    <rect x="0" y="0" width="80" height="80" fill={`url(#stripe_v_${uid})`} />
                  </g>
                )}

                {/* Outer Rim Light */}
                <circle
                  cx="40"
                  cy="40"
                  r="28.5"
                  fill="none"
                  stroke="#BAE6FD"
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                />
                {/* Lower Cyan Bounce Light */}
                <path
                  d="M 24,59 A 24,24 0 0 0 58,56"
                  fill="none"
                  stroke="#7DD3FC"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeOpacity="0.65"
                />
                {/* Primary Curved Window Highlight on Upper-Left Hemisphere */}
                <path
                  d="M 19,29 C 22,18 34,13 46,16 C 49,17 48,22 43,22 C 34,21 26,25 23,32 C 21,35 17,33 19,29 Z"
                  fill={`url(#spec_top_${uid})`}
                />
                {/* Secondary Bright Glint Dot */}
                <circle cx="20" cy="38" r="2.8" fill="#FFFFFF" fillOpacity="0.9" />
              </g>
            )}

            {/* ==============================================================
                3. GREEN CANDY: 3D SQUARE JELLY CUSHION WITH ROUNDED CORNERS
            ============================================================== */}
            {color === 'green' && (
              <g>
                {/* 3D Extruded Base Rim */}
                <path d={greenPillowPath} transform="translate(0, 3.4)" fill="#012B0D" />
                {/* Outer Pillowed Gummy Body */}
                <path d={greenPillowPath} fill={`url(#green_body_${uid})`} />
                {/* Subsurface Emerald Glow */}
                <path d={greenPillowPath} fill={`url(#green_sss_${uid})`} />

                {/* Sculpted Recessed Jelly Cushion Top Bevel */}
                <rect
                  x="18"
                  y="18"
                  width="44"
                  height="44"
                  rx="13"
                  fill="#047835"
                  fillOpacity="0.32"
                  stroke="#A7F3D0"
                  strokeWidth="1.8"
                  strokeOpacity="0.55"
                />
                {/* Inner Translucent Jelly Core Highlight */}
                <rect
                  x="22"
                  y="22"
                  width="36"
                  height="36"
                  rx="10"
                  fill={`url(#spec_soft_${uid})`}
                  fillOpacity="0.35"
                />

                {/* Striped Overlay Clipped to Square Jelly */}
                {special === 'striped_h' && (
                  <g clipPath={`url(#clip_green_${uid})`}>
                    <rect x="0" y="0" width="80" height="80" fill={`url(#stripe_h_${uid})`} />
                  </g>
                )}
                {special === 'striped_v' && (
                  <g clipPath={`url(#clip_green_${uid})`}>
                    <rect x="0" y="0" width="80" height="80" fill={`url(#stripe_v_${uid})`} />
                  </g>
                )}

                {/* Outer Edge Specular Rim */}
                <path
                  d={greenPillowPath}
                  fill="none"
                  stroke="#D1FAE5"
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                />
                {/* Bottom Emerald Bounce Reflection */}
                <path
                  d="M 22,64 H 58"
                  stroke="#6EE7B7"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeOpacity="0.6"
                />
                {/* Glossy Top-Left Corner Cushion Highlight */}
                <path
                  d="M 16,28 C 16,17 21,14 36,14 C 46,14 54,15 57,17 C 59,19 56,22 50,21 C 41,20 28,20 24,23 C 20,26 20,33 18,35 C 16,36 16,32 16,28 Z"
                  fill={`url(#spec_top_${uid})`}
                />
                <circle cx="18" cy="41" r="2.4" fill="#FFFFFF" fillOpacity="0.85" />
              </g>
            )}

            {/* ==============================================================
                4. YELLOW CANDY: SHINY 3D TEARDROP CANDY
            ============================================================== */}
            {color === 'yellow' && (
              <g>
                {/* 3D Extruded Bottom Rim */}
                <path d={yellowTeardropPath} transform="translate(0, 3.4)" fill="#632B04" />
                {/* Main Sculpted Teardrop Body */}
                <path d={yellowTeardropPath} fill={`url(#yellow_body_${uid})`} />
                {/* Golden Subsurface Glow */}
                <path d={yellowTeardropPath} fill={`url(#yellow_sss_${uid})`} />

                {/* Sculpted Vertical Pear-Drop Facet Flutes */}
                <path
                  d="M 40,14 C 34,30 28,44 30,66"
                  fill="none"
                  stroke="#FEF9C3"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeOpacity="0.42"
                />
                <path
                  d="M 40,14 C 46,30 52,44 50,66"
                  fill="none"
                  stroke="#B45309"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeOpacity="0.28"
                />

                {/* Striped Overlay Clipped to Teardrop */}
                {special === 'striped_h' && (
                  <g clipPath={`url(#clip_yellow_${uid})`}>
                    <rect x="0" y="0" width="80" height="80" fill={`url(#stripe_h_${uid})`} />
                  </g>
                )}
                {special === 'striped_v' && (
                  <g clipPath={`url(#clip_yellow_${uid})`}>
                    <rect x="0" y="0" width="80" height="80" fill={`url(#stripe_v_${uid})`} />
                  </g>
                )}

                {/* Outer Teardrop Rim Highlight */}
                <path
                  d={yellowTeardropPath}
                  fill="none"
                  stroke="#FEF08A"
                  strokeWidth="1.6"
                  strokeOpacity="0.6"
                />
                {/* Bottom-Right Golden Bounce Light */}
                <path
                  d="M 27,65 C 37,69 51,66 56,55"
                  fill="none"
                  stroke="#FEF9C3"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeOpacity="0.75"
                />
                {/* Long Curved Teardrop Specular Highlight */}
                <path
                  d="M 38,14 C 39,14 39,20 35,28 C 30,38 25,46 26,54 C 26,57 21,56 20,51 C 19,42 25,31 32,20 C 35,15 37,14 38,14 Z"
                  fill={`url(#spec_top_${uid})`}
                />
                {/* Pinpoint Glint near Crown & Base */}
                <circle cx="40" cy="14" r="2.2" fill="#FFFFFF" />
                <circle cx="24" cy="59" r="2.6" fill="#FFFFFF" fillOpacity="0.9" />
              </g>
            )}

            {/* ==============================================================
                5. PURPLE CANDY: GLOSSY 3D CLUSTER-SHAPED CANDY
            ============================================================== */}
            {color === 'purple' && (
              <g>
                {/* 3D Base Drop Rim for Cluster */}
                <g fill="#23003B" transform="translate(0, 3.2)">
                  <circle cx="40" cy="21" r="12.5" />
                  <circle cx="25" cy="31" r="12.5" />
                  <circle cx="55" cy="31" r="12.5" />
                  <circle cx="25" cy="49" r="12.5" />
                  <circle cx="55" cy="49" r="12.5" />
                  <circle cx="40" cy="58" r="12.5" />
                </g>

                {/* Outer 6 Sculpted Berry Lobes + Plump Center Lobe */}
                {[
                  { cx: 40, cy: 20, r: 12.5 }, // Top lobe
                  { cx: 25, cy: 31, r: 12.5 }, // Upper-left lobe
                  { cx: 55, cy: 31, r: 12.5 }, // Upper-right lobe
                  { cx: 25, cy: 49, r: 12.5 }, // Lower-left lobe
                  { cx: 55, cy: 49, r: 12.5 }, // Lower-right lobe
                  { cx: 40, cy: 58, r: 12.5 }, // Bottom lobe
                  { cx: 40, cy: 39, r: 14.5 }, // Prominent center lobe
                ].map((lobe, idx) => (
                  <g key={idx}>
                    {/* Soft crease shadow under each lobe */}
                    <circle
                      cx={lobe.cx}
                      cy={lobe.cy + 1.5}
                      r={lobe.r}
                      fill="#2A0047"
                      fillOpacity="0.55"
                    />
                    {/* Lobe 3D Volume */}
                    <circle
                      cx={lobe.cx}
                      cy={lobe.cy}
                      r={lobe.r}
                      fill={`url(#purple_lobe_${uid})`}
                      stroke="#F3E8FF"
                      strokeWidth="1"
                      strokeOpacity="0.38"
                    />
                    {/* Lobe Subsurface Glow */}
                    <circle
                      cx={lobe.cx}
                      cy={lobe.cy}
                      r={lobe.r}
                      fill={`url(#purple_sss_${uid})`}
                    />
                    {/* Individual Glossy Specular Highlight on Each Lobe */}
                    <ellipse
                      cx={lobe.cx - lobe.r * 0.28}
                      cy={lobe.cy - lobe.r * 0.32}
                      rx={lobe.r * 0.42}
                      ry={lobe.r * 0.24}
                      transform={`rotate(-28 ${lobe.cx - lobe.r * 0.28} ${lobe.cy - lobe.r * 0.32})`}
                      fill="#FFFFFF"
                      fillOpacity="0.82"
                    />
                    <circle
                      cx={lobe.cx - lobe.r * 0.45}
                      cy={lobe.cy - lobe.r * 0.05}
                      r={lobe.r * 0.11}
                      fill="#FFFFFF"
                      fillOpacity="0.9"
                    />
                  </g>
                ))}

                {/* Striped Overlay Clipped to Cluster Silhouette */}
                {special === 'striped_h' && (
                  <g clipPath={`url(#clip_purple_${uid})`}>
                    <rect x="0" y="0" width="80" height="80" fill={`url(#stripe_h_${uid})`} />
                  </g>
                )}
                {special === 'striped_v' && (
                  <g clipPath={`url(#clip_purple_${uid})`}>
                    <rect x="0" y="0" width="80" height="80" fill={`url(#stripe_v_${uid})`} />
                  </g>
                )}
              </g>
            )}

            {/* ==============================================================
                6. ORANGE CANDY: 3D OVAL LOZENGE CANDY
            ============================================================== */}
            {color === 'orange' && (
              <g>
                {/* 3D Extruded Bottom Sidewall for Oval Lozenge */}
                <ellipse
                  cx="40"
                  cy="43.5"
                  rx="31"
                  ry="22"
                  transform="rotate(-14 40 43.5)"
                  fill="#5C1100"
                />
                {/* Main Sculpted Oval Lozenge Body */}
                <ellipse
                  cx="40"
                  cy="40"
                  rx="31"
                  ry="22"
                  transform="rotate(-14 40 40)"
                  fill={`url(#orange_body_${uid})`}
                />
                {/* Subsurface Amber Citrus Glow */}
                <ellipse
                  cx="40"
                  cy="40"
                  rx="31"
                  ry="22"
                  transform="rotate(-14 40 40)"
                  fill={`url(#orange_sss_${uid})`}
                />

                {/* Recessed Lozenge Inner Oval Groove & Embossed Center */}
                <ellipse
                  cx="40"
                  cy="40"
                  rx="22"
                  ry="14.5"
                  transform="rotate(-14 40 40)"
                  fill="#C2410C"
                  fillOpacity="0.28"
                  stroke="#FFEDD5"
                  strokeWidth="1.8"
                  strokeOpacity="0.55"
                />
                <ellipse
                  cx="39"
                  cy="38.5"
                  rx="16"
                  ry="9.5"
                  transform="rotate(-14 39 38.5)"
                  fill={`url(#spec_soft_${uid})`}
                  fillOpacity="0.32"
                />

                {/* Striped Overlay Clipped to Oval Lozenge */}
                {special === 'striped_h' && (
                  <g clipPath={`url(#clip_orange_${uid})`}>
                    <rect x="0" y="0" width="80" height="80" fill={`url(#stripe_h_${uid})`} />
                  </g>
                )}
                {special === 'striped_v' && (
                  <g clipPath={`url(#clip_orange_${uid})`}>
                    <rect x="0" y="0" width="80" height="80" fill={`url(#stripe_v_${uid})`} />
                  </g>
                )}

                {/* Outer Rim Highlight */}
                <ellipse
                  cx="40"
                  cy="40"
                  rx="30.5"
                  ry="21.5"
                  transform="rotate(-14 40 40)"
                  fill="none"
                  stroke="#FFEDD5"
                  strokeWidth="1.5"
                  strokeOpacity="0.55"
                />
                {/* Lower Tangerine Bounce Light */}
                <path
                  d="M 22,55 C 35,61 54,57 64,45"
                  fill="none"
                  stroke="#FDBA74"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeOpacity="0.7"
                />
                {/* Sweeping Curved Specular Glass Highlight on Upper Lozenge Edge */}
                <path
                  d="M 16,34 C 20,23 36,16 54,19 C 58,20 56,24 51,24 C 37,22 25,27 20,35 C 18,38 15,37 16,34 Z"
                  fill={`url(#spec_top_${uid})`}
                />
                <circle cx="15" cy="41" r="2.4" fill="#FFFFFF" fillOpacity="0.9" />
              </g>
            )}

            {/* ==============================================================
                STRIPED CANDY SHIMMER RIM (Subtle glowing energy ring)
            ============================================================== */}
            {(special === 'striped_h' || special === 'striped_v') && (
              <g>
                {special === 'striped_h' ? (
                  <g opacity="0.92">
                    <path
                      d="M 7,40 L 15,34 V 46 Z M 73,40 L 65,34 V 46 Z"
                      fill="#FFFFFF"
                      stroke="#0F172A"
                      strokeWidth="1"
                    />
                  </g>
                ) : (
                  <g opacity="0.92">
                    <path
                      d="M 40,7 L 34,15 H 46 Z M 40,73 L 34,65 H 46 Z"
                      fill="#FFFFFF"
                      stroke="#0F172A"
                      strokeWidth="1"
                    />
                  </g>
                )}
              </g>
            )}

            {/* ==============================================================
                WRAPPED CANDY FRONT GLOSSY CELLOPHANE OVERLAY
            ============================================================== */}
            {special === 'wrapped' && (
              <g>
                <rect
                  x="11"
                  y="11"
                  width="58"
                  height="58"
                  rx="16"
                  fill={`url(#foil_front_${uid})`}
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeOpacity="0.92"
                />
                {/* Glossy diagonal wrapper fold creases */}
                <path
                  d="M 16,22 C 26,15 44,15 56,20"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeOpacity="0.85"
                />
                <path
                  d="M 20,60 C 34,65 50,64 62,56"
                  fill="none"
                  stroke="#FEF08A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeOpacity="0.75"
                />
                {/* Corner twist ties */}
                <path
                  d="M 14,18 L 22,22 M 66,18 L 58,22 M 14,62 L 22,58 M 66,62 L 58,58"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeOpacity="0.8"
                />
              </g>
            )}
          </g>
        )}
      </svg>

      {/* Sugar Frosting / Icing Blocker Overlay */}
      {(blocker === 'icing' || blocker === 'double_icing') && (
        <div
          className={`absolute inset-0.5 rounded-xl pointer-events-none flex items-center justify-center ${
            blocker === 'double_icing'
              ? 'bg-sky-100/80 border-2 border-white shadow-[inset_0_2px_6px_rgba(14,165,233,0.45)]'
              : 'bg-white/45 border-2 border-white/80'
          }`}
        >
          <svg viewBox="0 0 48 48" className="w-4/5 h-4/5 opacity-90">
            <path
              d="M10 14C16 10 32 10 38 14C42 20 42 28 38 34C32 38 16 38 10 34C6 28 6 20 10 14Z"
              fill={blocker === 'double_icing' ? '#E0F2FE' : 'none'}
              stroke="#0284C7"
              strokeWidth="2.2"
              strokeDasharray={blocker === 'double_icing' ? 'none' : '4 3'}
            />
            {blocker === 'double_icing' && (
              <text
                x="24"
                y="29"
                textAnchor="middle"
                fill="#0369A1"
                fontSize="14"
                fontWeight="800"
              >
                2x
              </text>
            )}
          </svg>
        </div>
      )}
    </div>
  );
};
