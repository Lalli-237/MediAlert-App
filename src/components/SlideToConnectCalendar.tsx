import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, Check, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  isConnected: boolean;
  onConnect: () => void;
  accountEmail?: string;
  lastSyncedAt?: string | null;
}

export const SlideToConnectCalendar: React.FC<Props> = ({
  isConnected,
  onConnect,
  accountEmail,
  lastSyncedAt
}) => {
  const [slideProgress, setSlideProgress] = useState<number>(isConnected ? 1 : 0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef<number>(0);

  useEffect(() => {
    setSlideProgress(isConnected ? 1 : 0);
  }, [isConnected]);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    startXRef.current = clientX;
  };

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const maxDistance = rect.width - 52; // subtract button thumb width
    if (maxDistance <= 0) return;

    const currentX = clientX - rect.left - 26;
    const progress = Math.max(0, Math.min(1, currentX / maxDistance));
    setSlideProgress(progress);
  }, [isDragging]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (slideProgress >= 0.75) {
      // Trigger complete connection
      setSlideProgress(1);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(50);
        } catch {}
      }
      onConnect();
    } else {
      // Snap back if not slid far enough (unless was already connected)
      setSlideProgress(isConnected ? 1 : 0);
    }
  }, [isDragging, slideProgress, isConnected, onConnect]);

  // Global mouse / touch listeners while dragging
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  // 1-Tap quick click fallback on track
  const handleTrackClick = () => {
    if (!isDragging) {
      setSlideProgress(1);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(50);
        } catch {}
      }
      onConnect();
    }
  };

  return (
    <div className="w-full space-y-2 select-none">
      {/* Slide Track */}
      <div
        id="slider-connect-google-calendar"
        ref={trackRef}
        onClick={handleTrackClick}
        role="button"
        tabIndex={0}
        aria-label="Slide to connect Google Account Calendar"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTrackClick();
          }
        }}
        className={`relative w-full h-14 rounded-2xl overflow-hidden p-1 flex items-center transition-all cursor-pointer border ${
          isConnected
            ? 'bg-emerald-50 border-emerald-300 shadow-inner'
            : 'bg-slate-100 hover:bg-slate-200/80 border-slate-300 shadow-inner'
        }`}
      >
        {/* Dynamic Progress Fill */}
        <div
          className={`absolute left-0 top-0 bottom-0 transition-all duration-75 rounded-2xl ${
            isConnected
              ? 'bg-emerald-500/20 w-full'
              : 'bg-blue-500/20'
          }`}
          style={{ width: isConnected ? '100%' : `${Math.round(slideProgress * 100)}%` }}
        />

        {/* Center Prompt Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12">
          {isConnected ? (
            <span className="text-xs sm:text-sm font-extrabold text-emerald-800 flex items-center gap-1.5 animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>✓ Connected to Google Account Calendar</span>
            </span>
          ) : (
            <span className="text-xs sm:text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <span>Slide to Connect Google Calendar</span>
              <ArrowRight className="w-4 h-4 text-blue-600 animate-pulse" />
            </span>
          )}
        </div>

        {/* Draggable Slider Thumb / Handle */}
        <div
          id="thumb-connect-google-calendar"
          onMouseDown={(e) => {
            e.stopPropagation();
            handleStart(e.clientX);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            if (e.touches[0]) handleStart(e.touches[0].clientX);
          }}
          className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md transition-transform duration-75 cursor-grab active:cursor-grabbing ${
            isConnected
              ? 'bg-emerald-600 shadow-emerald-700/30'
              : 'bg-[#4285F4] hover:bg-[#3367D6] shadow-blue-500/30'
          }`}
          style={{
            transform: `translateX(${
              trackRef.current
                ? slideProgress * Math.max(0, trackRef.current.clientWidth - 56)
                : 0
            }px)`
          }}
        >
          {isConnected ? (
            <Check className="w-6 h-6 stroke-[3]" />
          ) : (
            <Calendar className="w-5 h-5 text-white" />
          )}
        </div>
      </div>

      {/* Sync Status / Google Account Info */}
      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] px-1 font-medium text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <span>
            {isConnected
              ? `Google Account: ${accountEmail || 'Primary Google Account'}`
              : 'Google Calendar integration ready'}
          </span>
        </div>
        {lastSyncedAt && (
          <span className="text-slate-400 font-semibold">
            Last synced: {lastSyncedAt}
          </span>
        )}
      </div>
    </div>
  );
};
