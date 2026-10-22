import React from 'react';
import { Sparkles, RefreshCw, X, ArrowUpCircle } from 'lucide-react';

interface UpdateNotificationBannerProps {
  hasUpdate: boolean;
  onApplyUpdate: () => void;
  onDismiss: () => void;
}

export const UpdateNotificationBanner: React.FC<UpdateNotificationBannerProps> = ({
  hasUpdate,
  onApplyUpdate,
  onDismiss
}) => {
  if (!hasUpdate) return null;

  return (
    <aside aria-label="Mise à jour disponible" className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-2xl p-3.5 shadow-2xl border border-emerald-300/40 backdrop-blur-md flex items-center justify-between gap-3 ring-4 ring-emerald-500/20">
        <div className="flex items-center gap-3 min-w-0">
          {/* Icône qui s'allume / pulsation lumineuse */}
          <div className="relative shrink-0">
            <span className="absolute -inset-1 rounded-xl bg-amber-400 blur-sm opacity-70 animate-pulse"></span>
            <div className="relative w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-amber-200">
              <Sparkles className="w-5 h-5 animate-spin text-amber-300" style={{ animationDuration: '4s' }} />
            </div>
            {/* Petit point clignotant */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
            </span>
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 leading-tight">
              <span>Nouvelle version disponible !</span>
              <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-emerald-950 px-1.5 py-0.2 rounded-full">
                MàJ
              </span>
            </h4>
            <p className="text-[11px] text-emerald-100/90 truncate mt-0.5">
              Cliquez pour recharger et appliquer les améliorations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onApplyUpdate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mettre à jour</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-7 h-7 rounded-lg bg-black/10 hover:bg-black/20 text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Masquer l'alerte"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
