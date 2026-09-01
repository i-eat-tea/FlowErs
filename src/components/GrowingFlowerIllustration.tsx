/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type FlowerLifeStage = 
  | 'seed' 
  | 'sprout' 
  | 'small_plant' 
  | 'growing_plant' 
  | 'flower_bud' 
  | 'blooming' 
  | 'full_bloom';

export function getStageFromWeek(week: number): FlowerLifeStage {
  if (week <= 4) return 'seed';
  if (week <= 8) return 'sprout';
  if (week <= 14) return 'small_plant';
  if (week <= 20) return 'growing_plant';
  if (week <= 27) return 'flower_bud';
  if (week <= 35) return 'blooming';
  return 'full_bloom';
}

interface GrowingFlowerIllustrationProps {
  week?: number;
  stage?: FlowerLifeStage;
  className?: string;
  size?: number;
}

export default function GrowingFlowerIllustration({
  week = 24,
  stage,
  className = "w-full h-full",
  size
}: GrowingFlowerIllustrationProps) {
  const currentStage = stage || getStageFromWeek(week);

  // SVG viewBox is 48 48 for crisp vector scaling
  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      aria-label={`Pregnancy flower growth stage: ${currentStage}`}
    >
      {/* 1. SEED STAGE (Weeks 1 - 4) */}
      {currentStage === 'seed' && (
        <g className="transition-all duration-300">
          {/* Subtle soil / ground mound */}
          <path 
            d="M8 38C14 36 34 36 40 38" 
            stroke="#7ECBBF" 
            strokeWidth="2" 
            strokeLinecap="round" 
          />
          <path 
            d="M14 41C18 39.5 30 39.5 34 41" 
            stroke="#AEE3D8" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
          />
          {/* Tiny gentle root shoot */}
          <path 
            d="M24 35C24.5 38 23 40 22 42" 
            stroke="#7ECBBF" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
          />
          {/* The warm golden/rose seed body */}
          <ellipse 
            cx="24" 
            cy="31" 
            rx="5.5" 
            ry="7.5" 
            fill="#F4A6B5" 
            stroke="#FA6B90" 
            strokeWidth="1.5" 
          />
          {/* Seed core glow */}
          <ellipse 
            cx="23" 
            cy="29.5" 
            rx="2.5" 
            ry="3.5" 
            fill="#FEFAFB" 
            opacity="0.75" 
          />
          {/* Tiny micro embryo sprout tip emerging */}
          <path 
            d="M24 23.5C24 20 27 18 28.5 17" 
            stroke="#7ECBBF" 
            strokeWidth="2" 
            strokeLinecap="round" 
          />
          <circle cx="28.5" cy="17" r="1.5" fill="#7ECBBF" />
        </g>
      )}

      {/* 2. SPROUT STAGE (Weeks 5 - 8) */}
      {currentStage === 'sprout' && (
        <g className="transition-all duration-300">
          {/* Ground line */}
          <path 
            d="M10 40C16 38.5 32 38.5 38 40" 
            stroke="#7ECBBF" 
            strokeWidth="2" 
            strokeLinecap="round" 
          />
          {/* Main tender curved sprout stem */}
          <path 
            d="M24 39C24 31 23 25 24 19" 
            stroke="#7ECBBF" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          {/* Left cotyledon leaf */}
          <path 
            d="M24 21C20 20 14 21 14 17C18 16 23 18 24 21Z" 
            fill="#AEE3D8" 
            stroke="#7ECBBF" 
            strokeWidth="1.5" 
            strokeLinejoin="round" 
          />
          {/* Right cotyledon leaf */}
          <path 
            d="M24 20C28 19 34 20 34 16C30 15 25 17 24 20Z" 
            fill="#7ECBBF" 
            stroke="#2F6F8F" 
            strokeWidth="1.5" 
            strokeLinejoin="round" 
          />
          {/* Soft seed coat resting at root */}
          <ellipse cx="21" cy="38.5" rx="3.5" ry="2.5" fill="#F4A6B5" stroke="#FA6B90" strokeWidth="1" />
        </g>
      )}

      {/* 3. SMALL PLANT STAGE (Weeks 9 - 14) */}
      {currentStage === 'small_plant' && (
        <g className="transition-all duration-300">
          {/* Ground mound */}
          <path 
            d="M10 41C16 39.5 32 39.5 38 41" 
            stroke="#7ECBBF" 
            strokeWidth="2" 
            strokeLinecap="round" 
          />
          {/* Primary stem */}
          <path 
            d="M24 40C24 30 23.5 20 24 13" 
            stroke="#7ECBBF" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          {/* Lower left mature leaf */}
          <path 
            d="M24 30C17 29 11 31 10 26C15 24 22 27 24 30Z" 
            fill="#AEE3D8" 
            stroke="#7ECBBF" 
            strokeWidth="1.5" 
            strokeLinejoin="round" 
          />
          {/* Lower right mature leaf */}
          <path 
            d="M24 28C31 27 37 29 38 24C33 22 26 25 24 28Z" 
            fill="#7ECBBF" 
            stroke="#2F6F8F" 
            strokeWidth="1.5" 
            strokeLinejoin="round" 
          />
          {/* Top fresh tender leaf pair */}
          <path 
            d="M24 16C21 13 18 12 17 8C21 8 23 12 24 16Z" 
            fill="#F4A6B5" 
            stroke="#FA6B90" 
            strokeWidth="1.2" 
          />
          <path 
            d="M24 15C27 12 30 11 31 7C27 7 25 11 24 15Z" 
            fill="#AEE3D8" 
            stroke="#7ECBBF" 
            strokeWidth="1.2" 
          />
        </g>
      )}

      {/* 4. GROWING PLANT STAGE (Weeks 15 - 20) */}
      {currentStage === 'growing_plant' && (
        <g className="transition-all duration-300">
          {/* Ground */}
          <path d="M12 42C17 40.5 31 40.5 36 42" stroke="#7ECBBF" strokeWidth="2" strokeLinecap="round" />
          {/* Strong graceful main stem */}
          <path d="M24 41C24 30 23.5 18 24 10" stroke="#7ECBBF" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Bottom leaves */}
          <path d="M24 33C16 32 9 34 8 28C14 26 22 30 24 33Z" fill="#AEE3D8" stroke="#7ECBBF" strokeWidth="1.5" />
          <path d="M24 31C32 30 39 32 40 26C34 24 26 28 24 31Z" fill="#7ECBBF" stroke="#2F6F8F" strokeWidth="1.5" />
          
          {/* Mid leaves */}
          <path d="M24 22C17 20 12 20 12 15C17 14 22 18 24 22Z" fill="#AEE3D8" stroke="#7ECBBF" strokeWidth="1.5" />
          <path d="M24 20C31 18 36 18 36 13C31 12 26 16 24 20Z" fill="#7ECBBF" stroke="#2F6F8F" strokeWidth="1.5" />
          
          {/* Crown top young shoot / future bud point */}
          <circle cx="24" cy="9.5" r="2.5" fill="#F4A6B5" stroke="#FA6B90" strokeWidth="1.5" />
        </g>
      )}

      {/* 5. FLOWER BUD STAGE (Weeks 21 - 27) */}
      {currentStage === 'flower_bud' && (
        <g className="transition-all duration-300">
          {/* Stem */}
          <path d="M24 43C24 32 23.5 22 24 17" stroke="#7ECBBF" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Healthy side leaves */}
          <path d="M24 34C15 33 8 36 7 30C13 28 22 31 24 34Z" fill="#AEE3D8" stroke="#7ECBBF" strokeWidth="1.5" />
          <path d="M24 30C33 29 40 32 41 26C35 24 26 27 24 30Z" fill="#7ECBBF" stroke="#2F6F8F" strokeWidth="1.5" />
          <path d="M24 24C17 22 13 21 13 16C17 15 22 19 24 24Z" fill="#AEE3D8" stroke="#7ECBBF" strokeWidth="1.2" />

          {/* Green Calyx / Sepals embracing the bud */}
          <path d="M20 18C20 15 22 13 24 13C26 13 28 15 28 18Z" fill="#7ECBBF" stroke="#2F6F8F" strokeWidth="1.2" />
          <path d="M19 19C17 15 17 12 19 9" stroke="#7ECBBF" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M29 19C31 15 31 12 29 9" stroke="#7ECBBF" strokeWidth="1.5" strokeLinecap="round" />

          {/* Plump, glowing closed Rose/Lotus Bud */}
          <path 
            d="M24 5C20 8 18 13 20 17C22 19 26 19 28 17C30 13 28 8 24 5Z" 
            fill="#FA6B90" 
            stroke="#FA6B90" 
            strokeWidth="1.5" 
          />
          {/* Inner petal layer showing subtle pink blush */}
          <path 
            d="M24 6.5C21.5 9.5 21 13 22.5 15.5C23.5 16.5 24.5 16.5 25.5 15.5C27 13 26.5 9.5 24 6.5Z" 
            fill="#FDDEEC" 
          />
        </g>
      )}

      {/* 6. BLOOMING FLOWER STAGE (Weeks 28 - 35) */}
      {currentStage === 'blooming' && (
        <g className="transition-all duration-300">
          {/* Stem */}
          <path d="M24 43C24 33 23.5 24 24 20" stroke="#7ECBBF" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Lush supporting leaves */}
          <path d="M24 35C15 34 8 37 7 31C13 29 22 32 24 35Z" fill="#AEE3D8" stroke="#7ECBBF" strokeWidth="1.5" />
          <path d="M24 32C33 31 40 34 41 28C35 26 26 29 24 32Z" fill="#7ECBBF" stroke="#2F6F8F" strokeWidth="1.5" />

          {/* Flower calyx */}
          <path d="M20 21C22 23 26 23 28 21L24 23Z" fill="#7ECBBF" stroke="#2F6F8F" strokeWidth="1" />

          {/* Outer blossoming petals opening outwards */}
          <path 
            d="M24 16C16 14 11 11 12 5C17 6 21 11 24 16Z" 
            fill="#F4A6B5" 
            stroke="#FA6B90" 
            strokeWidth="1.2" 
          />
          <path 
            d="M24 16C32 14 37 11 36 5C31 6 27 11 24 16Z" 
            fill="#F4A6B5" 
            stroke="#FA6B90" 
            strokeWidth="1.2" 
          />
          {/* Lower flared petals */}
          <path 
            d="M24 17C17 19 12 18 10 13C14 11 20 14 24 17Z" 
            fill="#FA6B90" 
            stroke="#FA6B90" 
            strokeWidth="1.2" 
          />
          <path 
            d="M24 17C31 19 36 18 38 13C34 11 28 14 24 17Z" 
            fill="#FA6B90" 
            stroke="#FA6B90" 
            strokeWidth="1.2" 
          />
          {/* Central opening petals */}
          <path 
            d="M24 7C20 10 19 15 24 18C29 15 28 10 24 7Z" 
            fill="#FDDEEC" 
            stroke="#FA6B90" 
            strokeWidth="1.2" 
          />
          {/* Radiant golden core */}
          <circle cx="24" cy="14" r="2.5" fill="#F6D365" stroke="#E5B942" strokeWidth="1" />
        </g>
      )}

      {/* 7. FULL BLOOM STAGE (Weeks 36 - 40+) */}
      {currentStage === 'full_bloom' && (
        <g className="transition-all duration-300">
          {/* Subtle stem base */}
          <path d="M24 44C24 38 23.5 33 24 29" stroke="#7ECBBF" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Base leaves */}
          <path d="M24 37C16 36 9 39 8 34C14 32 21 35 24 37Z" fill="#AEE3D8" stroke="#7ECBBF" strokeWidth="1.3" />
          <path d="M24 35C32 34 39 37 40 32C34 30 27 33 24 35Z" fill="#7ECBBF" stroke="#2F6F8F" strokeWidth="1.3" />

          {/* Full multi-layered flower blossom */}
          {/* 5 Outer round petals */}
          <circle cx="24" cy="10" r="7" fill="#F4A6B5" stroke="#FA6B90" strokeWidth="1.2" />
          <circle cx="12" cy="18" r="7" fill="#F4A6B5" stroke="#FA6B90" strokeWidth="1.2" />
          <circle cx="36" cy="18" r="7" fill="#F4A6B5" stroke="#FA6B90" strokeWidth="1.2" />
          <circle cx="17" cy="27" r="6.5" fill="#FA6B90" stroke="#FA6B90" strokeWidth="1.2" />
          <circle cx="31" cy="27" r="6.5" fill="#FA6B90" stroke="#FA6B90" strokeWidth="1.2" />

          {/* Inner Petals */}
          <path 
            d="M24 9C20 13 18 19 24 23C30 19 28 13 24 9Z" 
            fill="#FDDEEC" 
            stroke="#FA6B90" 
            strokeWidth="1.2" 
          />
          <path 
            d="M15 18C19 16 25 18 25 21C21 24 16 22 15 18Z" 
            fill="#FDDEEC" 
            opacity="0.8" 
          />
          <path 
            d="M33 18C29 16 23 18 23 21C27 24 32 22 33 18Z" 
            fill="#FDDEEC" 
            opacity="0.8" 
          />

          {/* Golden luminous center stamen with little dots */}
          <circle cx="24" cy="18" r="4.5" fill="#F6D365" stroke="#E5B942" strokeWidth="1.2" />
          <circle cx="22.5" cy="16.8" r="0.8" fill="#B7891A" />
          <circle cx="25.5" cy="16.8" r="0.8" fill="#B7891A" />
          <circle cx="24" cy="19.2" r="0.8" fill="#B7891A" />
        </g>
      )}
    </svg>
  );
}
