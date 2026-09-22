import React from 'react';
import { MedicationType } from '../types';

interface Props {
  type?: MedicationType | string;
  name?: string;
  className?: string;
  size?: number;
  color?: string;
}

/**
 * Normalizes input medication type and medicine name to a standard form category:
 * - tablet/pill/capsule
 * - syrup
 * - injection/insulin
 * - drops (ear/eye drops)
 * - inhaler
 */
export function getNormalizedMedicationCategory(type?: string, name?: string): 'tablet' | 'syrup' | 'injection' | 'drops' | 'inhaler' {
  const t = (type || '').toLowerCase().trim();
  const n = (name || '').toLowerCase().trim();

  // Inhaler detection
  if (t === 'inhaler' || n.includes('inhaler') || n.includes('rotacap') || n.includes('puff') || n.includes('respules')) {
    return 'inhaler';
  }

  // Drops detection (ear or eye drops)
  if (t === 'drops' || n.includes('drop') || n.includes('eye') || n.includes('ear') || n.includes('ophthalmic') || n.includes('otic')) {
    return 'drops';
  }

  // Injection / Insulin detection
  if (t === 'injection' || t === 'insulin' || n.includes('injection') || n.includes('insulin') || n.includes('inj') || n.includes('vial') || n.includes('pen')) {
    return 'injection';
  }

  // Syrup / Liquid detection
  if (t === 'liquid' || t === 'syrup' || n.includes('syrup') || n.includes('suspension') || n.includes('tonic') || n.includes('liquid') || n.includes('solution') || n.includes('cough')) {
    return 'syrup';
  }

  // Default to Tablet / Pill / Capsule
  return 'tablet';
}

export const MedicineShapeIcon: React.FC<Props> = ({
  type,
  name,
  className = 'w-6 h-6',
  size,
  color
}) => {
  const category = getNormalizedMedicationCategory(type, name);

  // Tablet or Pill or Capsule Shape
  if (category === 'tablet') {
    return (
      <svg
        viewBox="0 0 48 48"
        width={size || '100%'}
        height={size || '100%'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ color: color || undefined }}
        aria-label="Tablet / Capsule"
      >
        {/* Angled Capsule */}
        <g transform="translate(24, 24) rotate(-35) translate(-24, -24)">
          <rect x="15" y="8" width="18" height="32" rx="9" stroke="currentColor" fill="currentColor" fillOpacity="0.12" />
          <line x1="15" y1="24" x2="33" y2="24" stroke="currentColor" strokeWidth="2.8" />
          {/* Subtle shine mark */}
          <path d="M20 13 C20 11 22 10 24 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </g>
      </svg>
    );
  }

  // Syrup / Liquid Bottle + Spoon Shape
  if (category === 'syrup') {
    return (
      <svg
        viewBox="0 0 48 48"
        width={size || '100%'}
        height={size || '100%'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ color: color || undefined }}
        aria-label="Syrup"
      >
        {/* Syrup Bottle */}
        <path d="M12 18 C12 16 14 15 16 15 L24 15 C26 15 28 16 28 18 L28 40 C28 42 26 43 24 43 L16 43 C14 43 12 42 12 40 Z" fill="currentColor" fillOpacity="0.12" />
        {/* Bottle Neck & Cap */}
        <rect x="17" y="10" width="6" height="5" />
        <rect x="15" y="6" width="10" height="4" rx="1.5" fill="currentColor" />
        {/* Liquid level fill & label */}
        <line x1="16" y1="27" x2="24" y2="27" strokeDasharray="1.5 2" />
        <line x1="16" y1="33" x2="24" y2="33" strokeDasharray="1.5 2" />

        {/* Medicine Spoon on the side with a droplet */}
        <path d="M32 20 C32 18 35 17 38 18 C41 19 41 23 38 25 C35 26 33 24 33 22" fill="currentColor" fillOpacity="0.25" />
        <path d="M35 25 L39 42" strokeWidth="2.5" />
        {/* Falling syrup droplet */}
        <path d="M37 11 C37 11 35 14 35 15 C35 16.1 35.9 17 37 17 C38.1 17 39 16.1 39 15 C39 14 37 11 37 11 Z" fill="currentColor" />
      </svg>
    );
  }

  // Injection or Insulin Shape
  if (category === 'injection') {
    return (
      <svg
        viewBox="0 0 48 48"
        width={size || '100%'}
        height={size || '100%'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ color: color || undefined }}
        aria-label="Injection / Insulin"
      >
        <g transform="translate(24, 24) rotate(-45) translate(-24, -24)">
          {/* Needle Tip */}
          <line x1="24" y1="4" x2="24" y2="12" strokeWidth="2.2" />
          {/* Needle Hub */}
          <path d="M22 12 L26 12 L25 15 L23 15 Z" fill="currentColor" />
          {/* Syringe Barrel */}
          <rect x="18" y="15" width="12" height="20" rx="2" fill="currentColor" fillOpacity="0.12" />
          {/* Dosage Graduations */}
          <line x1="22" y1="19" x2="30" y2="19" strokeWidth="1.8" />
          <line x1="24" y1="23" x2="30" y2="23" strokeWidth="1.8" />
          <line x1="22" y1="27" x2="30" y2="27" strokeWidth="1.8" />
          <line x1="24" y1="31" x2="30" y2="31" strokeWidth="1.8" />
          {/* Plunger & Flange */}
          <line x1="24" y1="35" x2="24" y2="43" strokeWidth="3" />
          <line x1="20" y1="43" x2="28" y2="43" strokeWidth="3.2" strokeLinecap="round" />
          <line x1="16" y1="35" x2="32" y2="35" strokeWidth="2.8" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  // Ear or Eye Drops Shape
  if (category === 'drops') {
    return (
      <svg
        viewBox="0 0 48 48"
        width={size || '100%'}
        height={size || '100%'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ color: color || undefined }}
        aria-label="Ear or Eye Drops"
      >
        {/* Dropper Pipette / Bottle */}
        <path d="M16 19 C16 17 18 15 20 15 L28 15 C30 15 32 17 32 19 L32 37 C32 40 30 42 28 42 L20 42 C18 42 16 40 16 37 Z" fill="currentColor" fillOpacity="0.12" />
        {/* Nozzle tip for eye/ear drops */}
        <path d="M22 15 L22 10 L26 10 L26 15" />
        <rect x="20" y="7" width="8" height="4" rx="1.5" fill="currentColor" />

        {/* Falling Liquid Drop 1 */}
        <path
          d="M24 23 C24 23 20 28 20 30 C20 32.2 21.8 34 24 34 C26.2 34 28 32.2 28 30 C28 28 24 23 24 23 Z"
          fill="currentColor"
          fillOpacity="0.35"
        />

        {/* Second small splash droplet */}
        <path
          d="M37 28 C37 28 34 32 34 33.5 C34 35 35.3 36 37 36 C38.7 36 40 35 40 33.5 C40 32 37 28 37 28 Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  // Inhaler Shape
  return (
    <svg
      viewBox="0 0 48 48"
      width={size || '100%'}
      height={size || '100%'}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ color: color || undefined }}
      aria-label="Inhaler"
    >
      {/* Inhaler Canister on Top */}
      <rect x="14" y="6" width="13" height="18" rx="3" fill="currentColor" fillOpacity="0.2" />
      <line x1="14" y1="12" x2="27" y2="12" strokeWidth="1.8" />

      {/* L-Shaped Body & Mouthpiece */}
      <path
        d="M11 20 L29 20 C30.5 20 31.5 21 31.5 22.5 L31.5 32 C31.5 33 32.5 34 33.5 34 L38 34 C39.5 34 40.5 35.2 40.5 36.8 L40.5 39.2 C40.5 40.8 39.5 42 38 42 L22 42 C16 42 11 37 11 31 Z"
        fill="currentColor"
        fillOpacity="0.12"
      />

      {/* Spray / Aerosol Burst Puffs from Mouthpiece */}
      <circle cx="43" cy="38" r="1.5" fill="currentColor" />
      <circle cx="46" cy="36" r="1" fill="currentColor" />
      <circle cx="45" cy="41" r="1" fill="currentColor" />
    </svg>
  );
};
