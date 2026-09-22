import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  // If already installed as PWA, show a subtle badge or return null
  if (isInstalled) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Installed App Mode (Background Active)</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="btn-install-pwa-app"
        onClick={install}
        className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-purple-600/25 hover:from-purple-700 hover:to-indigo-700 active:scale-95 transition-all cursor-pointer ${className}`}
      >
        <Download className="w-4 h-4 stroke-[2.5]" />
        <span>Install App for Closed-App Alerts</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="btn-install-ios-guide"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-bold text-[#5e35b1] hover:bg-purple-100 transition-colors cursor-pointer ${className}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Install on iPhone / iPad</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#5e35b1] flex items-center justify-center mb-3">
                <Smartphone className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-black text-slate-900">
                Install on iPhone / iPad
              </h3>
              <p className="mt-1 text-xs text-slate-600 font-medium">
                Installing enables standalone app mode and persistent background alerts.
              </p>

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <p>
                  1. Tap the <strong>Share</strong> icon in Safari’s bottom toolbar (the square with an up arrow).
                </p>
                <p>
                  2. Scroll down and select <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
                </p>
                <p>
                  3. Tap <strong>&ldquo;Add&rdquo;</strong> in the top right.
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-[#5e35b1] py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#512da8] transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
