import React, { useEffect, useState } from 'react';
import { CandyPiece } from './CandyPiece';
import { CandyWorldDecor } from './CandyWorldDecor';
import { SweetBlastLogoSVG } from './GameIcons';

interface SplashScreenProps {
  heroImgFailed: boolean;
  onHeroImgError: () => void;
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  heroImgFailed,
  onHeroImgError,
  onComplete,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [fadingOut, setFadingOut] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    // Preload game key-art assets in the background while loading bar progresses
    const assetUrls = [
      '/src/assets/images/candy_kingdom_backdrop_1794915431357.jpg',
      '/src/assets/images/candy_shop_banner_1794915431935.jpg',
    ];
    assetUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });

    const durationMs = 2200;
    const startTime = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      if (!isMounted) return;
      const elapsed = now - startTime;
      // Smooth ease-out progression from 0 to 100
      const rawRatio = Math.min(1, elapsed / durationMs);
      const easedRatio = 1 - Math.pow(1 - rawRatio, 2.2);
      const currentPct = Math.min(100, Math.round(easedRatio * 100));
      setProgress(currentPct);

      if (rawRatio < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setFadingOut(true);
        window.setTimeout(() => {
          if (isMounted) {
            onComplete();
          }
        }, 240);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      isMounted = false;
      cancelAnimationFrame(rafId);
    };
  }, [onComplete]);

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-between overflow-hidden select-none transition-opacity duration-200 ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 1. Full-Screen Colourful Candy Fantasy Background (Candy Mountains, Lollipops & Chocolate Drips) */}
      <CandyWorldDecor heroImgFailed={heroImgFailed} onHeroImgError={onHeroImgError} />

      {/* Magical Rotating/Glowing Starburst Rays Behind the Center Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[540px] h-[540px] sm:w-[720px] sm:h-[720px] rounded-full opacity-45"
          style={{
            background:
              'radial-gradient(circle, rgba(254, 240, 138, 0.58) 0%, rgba(255, 46, 99, 0.28) 45%, rgba(24, 13, 30, 0) 72%)',
          }}
        />
      </div>

      {/* Top Spacer for Vertical Balance */}
      <div className="relative z-10 pt-8 sm:pt-12" />

      {/* 2. Center Showcase: Large SWEET BLAST 3D Logo Surrounded by Floating Glossy 3D Candies */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-2xl px-4">
        <div className="relative flex flex-col items-center justify-center w-full py-10 sm:py-14">
          {/* Orbiting / Floating 3D Candies Around the Logo */}
          <div
            className="absolute -top-4 left-[6%] sm:left-[10%] w-16 h-16 sm:w-22 sm:h-22 animate-float-slow drop-shadow-[0_10px_14px_rgba(0,0,0,0.65)]"
            style={{ animationDelay: '0s' }}
          >
            <CandyPiece color="red" special="none" />
          </div>

          <div
            className="absolute -top-6 right-[6%] sm:right-[10%] w-16 h-16 sm:w-22 sm:h-22 animate-float-slow drop-shadow-[0_10px_14px_rgba(0,0,0,0.65)]"
            style={{ animationDelay: '0.7s' }}
          >
            <CandyPiece color="blue" special="striped_h" />
          </div>

          <div
            className="absolute top-1/2 -translate-y-1/2 -left-1 sm:left-[2%] w-14 h-14 sm:w-20 sm:h-20 animate-float-slow drop-shadow-[0_10px_14px_rgba(0,0,0,0.65)]"
            style={{ animationDelay: '1.3s' }}
          >
            <CandyPiece color="green" special="none" />
          </div>

          <div
            className="absolute top-1/2 -translate-y-1/2 -right-1 sm:right-[2%] w-14 h-14 sm:w-20 sm:h-20 animate-float-slow drop-shadow-[0_10px_14px_rgba(0,0,0,0.65)]"
            style={{ animationDelay: '1.9s' }}
          >
            <CandyPiece color="orange" special="none" />
          </div>

          <div
            className="absolute -bottom-5 left-[10%] sm:left-[14%] w-16 h-16 sm:w-22 sm:h-22 animate-float-slow drop-shadow-[0_10px_14px_rgba(0,0,0,0.65)]"
            style={{ animationDelay: '0.4s' }}
          >
            <CandyPiece color="yellow" special="wrapped" />
          </div>

          <div
            className="absolute -bottom-6 right-[10%] sm:right-[14%] w-16 h-16 sm:w-22 sm:h-22 animate-float-slow drop-shadow-[0_10px_14px_rgba(0,0,0,0.65)]"
            style={{ animationDelay: '1.1s' }}
          >
            <CandyPiece color="purple" special="color_bomb" />
          </div>

          {/* Center Featured Purple Cluster & Yellow Teardrop Accents */}
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 sm:w-18 sm:h-18 animate-float-slow drop-shadow-[0_10px_14px_rgba(0,0,0,0.65)]"
            style={{ animationDelay: '1.6s' }}
          >
            <CandyPiece color="purple" special="none" />
          </div>

          {/* Large SWEET BLAST 3D Logo in the Center */}
          <div className="relative z-10 animate-pulse-glow px-2">
            <SweetBlastLogoSVG className="w-full max-w-[330px] sm:max-w-[470px]" />
          </div>
        </div>
      </main>

      {/* 3. Bottom Loading Bar & "Loading Sweet World..." Status */}
      <footer className="relative z-10 w-full max-w-md px-6 pb-8 sm:pb-12 flex flex-col items-center gap-2.5">
        <div className="w-full flex items-center justify-between px-1">
          <span className="font-display text-sm sm:text-base font-extrabold text-[#FFF9F2] tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
            Loading Sweet World...
          </span>
          <span className="font-mono-tabular text-xs sm:text-sm font-extrabold text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
            {progress}%
          </span>
        </div>

        {/* 3D Chocolate & Gold Framed Candy Loading Bar */}
        <div className="relative w-full h-6 sm:h-7 p-1 rounded-full bg-[#240D04] border-2 border-amber-300/80 shadow-[0_6px_16px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(0,0,0,0.8)] overflow-hidden">
          <div
            className="relative h-full rounded-full transition-all duration-75 ease-out overflow-hidden"
            style={{
              width: `${Math.max(6, progress)}%`,
              background:
                'repeating-linear-gradient(-45deg, #FF2E63, #FF2E63 12px, #FF7597 12px, #FF7597 24px)',
              boxShadow: '0 0 14px rgba(255, 46, 99, 0.85)',
            }}
          >
            {/* Top glossy glass reflection along the loading bar */}
            <div className="absolute inset-x-0 top-0 h-[45%] bg-white/40 rounded-full" />
          </div>
        </div>
      </footer>
    </div>
  );
};
