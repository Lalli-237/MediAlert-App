import React from 'react';

interface Props {
  className?: string;
  size?: number;
  showText?: boolean;
}

/**
 * Main MediAlert Logo matching the uploaded screenshot:
 * Purple heart background (#5B2FD6) with an angled white capsule pill
 * featuring the distinct lower capsule body and upper arched pill cap.
 */
export const AppLogo: React.FC<Props> = ({ className = 'w-10 h-10', size, showText = false }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <svg
        viewBox="0 0 200 200"
        width={size || '100%'}
        height={size || '100%'}
        className="shrink-0 aspect-square overflow-visible drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="logo-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#2D1270" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Purple Heart Body matching user image (#5125DA) */}
        <path
          d="M100 178 C100 178, 18 126, 18 70 C18 36, 44 14, 76 14 C90 14, 100 22, 100 22 C100 22, 110 14, 124 14 C156 14, 182 36, 182 70 C182 126, 100 178, 100 178 Z"
          fill="#5125DA"
          filter="url(#logo-shadow)"
        />

        {/* Angled Capsule Pill inside Heart matching exact geometry from screenshot */}
        <g transform="translate(102, 98) rotate(-42)">
          {/* Lower Half: Solid White Capsule Cup */}
          <path
            d="M -23 4 L -23 26 C -23 38 -12 48 0 48 C 12 48 23 38 23 26 L 23 4 Z"
            fill="#FFFFFF"
          />

          {/* Top Left: Arched Handle Loop (Inverted U with thick rounded stroke) */}
          <path
            d="M -15 -6 C -15 -24 -2 -34 10 -30 C 18 -27 20 -18 20 -10"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="8.5"
            strokeLinecap="round"
          />

          {/* Top Right: Open Lid / Lever Spout with Flared Tip */}
          <path
            d="M 17 -3 L 26 -28 C 26 -30 31 -32 36 -32 L 35 -26 C 30 -26 27 -23 24 -4 Z"
            fill="#FFFFFF"
          />
        </g>
      </svg>

      {showText && (
        <div className="min-w-0">
          <span className="font-extrabold text-lg sm:text-xl text-[#5B2FD6] dark:text-purple-300 tracking-tight block leading-none">
            MediAlert
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#1B1642]/60 dark:text-slate-300 font-semibold block mt-0.5">
            Smart Medicine Reminder
          </span>
        </div>
      )}
    </div>
  );
};
