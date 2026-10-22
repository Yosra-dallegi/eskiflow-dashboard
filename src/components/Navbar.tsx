import React, { useState } from 'react';
import {
  Download,
  RefreshCw,
  FileSpreadsheet,
  Mic,
  Smartphone,
  LayoutGrid,
  TrendingUp,
  Snowflake,
  MoreVertical,
  X,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'pOverview' | 'pMonth' | 'pFrigos';
  setActiveTab: (tab: 'pOverview' | 'pMonth' | 'pFrigos') => void;
  lastMaj: string;
  onRefresh: () => void;
  onExport: () => void;
  onOpenExcelSync: () => void;
  onOpenVoiceModal: () => void;
  onOpenInstallModal?: () => void;
  isAutonome: boolean;
  isRefreshing?: boolean;
  hasUpdate?: boolean;
  onApplyUpdate?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lastMaj,
  onRefresh,
  onExport,
  onOpenExcelSync,
  onOpenVoiceModal,
  onOpenInstallModal,
  isAutonome,
  isRefreshing,
  hasUpdate,
  onApplyUpdate
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Main Top Header */}
      <header className="bg-white rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm border border-slate-200/80 mb-3 sm:mb-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
          {/* Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-400 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-sm shrink-0">
              ✓
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-none truncate">
                Suivi des tâches
              </h1>
              <div className="text-[11px] sm:text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="font-medium text-slate-700">Eskimo / Paname</span>
                <span className="hidden xs:inline">·</span>
                <span className="hidden sm:inline text-slate-500">
                  {lastMaj ? `Données du ${lastMaj}` : 'Données prêtes'}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('pOverview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'pOverview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('pMonth')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'pMonth'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Réalisation par mois
            </button>
            <button
              onClick={() => setActiveTab('pFrigos')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'pFrigos'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Suivi Frigos
            </button>
          </div>

          {/* Actions: Desktop full / Mobile compact */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Icône animée / Bouton lumineux de Mise à jour disponible */}
            {hasUpdate && onApplyUpdate && (
              <button
                type="button"
                onClick={onApplyUpdate}
                title="Une nouvelle version est disponible ! Cliquez pour mettre à jour."
                className="relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-xl shadow-md shadow-emerald-500/30 transition cursor-pointer border border-emerald-300 ring-2 ring-emerald-400/60 animate-pulse group"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="hidden xs:inline">Version dispo !</span>
                <span className="xs:hidden">MàJ</span>
              </button>
            )}

            {/* Assistant Vocal Button */}
            <button
              onClick={onOpenVoiceModal}
              title="Assistant Vocal & Filtrage Derja (Etkallem maa l'assistant)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition cursor-pointer shadow-xs group"
            >
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 group-hover:scale-110 transition-transform animate-pulse" />
              <span className="hidden xs:inline">Assistant Vocal</span>
              <span className="xs:hidden">Vocal</span>
            </button>

            {/* Quick Refresh icon on mobile */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Actualiser les données Google Drive"
              className={`flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 text-xs font-medium text-white rounded-lg transition shadow-sm ${
                isRefreshing
                  ? 'bg-blue-400 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 cursor-pointer'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-1.5">{isRefreshing ? 'Actualisation...' : 'Actualiser'}</span>
            </button>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {onOpenInstallModal && (
                <button
                  onClick={onOpenInstallModal}
                  title="Installer l'application sur smartphone Android / iPhone ou générer APK"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer shadow-xs"
                >
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Installer Mobile (APK)</span>
                </button>
              )}

              <button
                onClick={onOpenExcelSync}
                title="Charger directement vos fichiers Excel (.xlsx) sans Apps Script"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Données Excel</span>
              </button>

              <button
                onClick={onExport}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Exporter</span>
              </button>
            </div>

            {/* Mobile More Options Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              title="Menu et options supplémentaires"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile secondary tabs bar */}
        <div className="md:hidden mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('pOverview')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition truncate cursor-pointer ${
              activeTab === 'pOverview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('pMonth')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition truncate cursor-pointer ${
              activeTab === 'pMonth'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            Ventes mensuelles
          </button>
          <button
            onClick={() => setActiveTab('pFrigos')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition truncate cursor-pointer ${
              activeTab === 'pFrigos'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            Suivi Frigos
          </button>
        </div>

        {/* Mobile dropdown menu for secondary options */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in duration-150">
            {hasUpdate && onApplyUpdate && (
              <button
                onClick={() => {
                  onApplyUpdate();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 animate-spin" />
                <span>Mettre à jour l'application (Nouvelle version)</span>
              </button>
            )}

            {onOpenInstallModal && (
              <button
                onClick={() => {
                  onOpenInstallModal();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Installer sur Smartphone (APK)</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenExcelSync();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Charger fichier Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => {
                onExport();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600 shrink-0" />
              <span>Exporter en Excel</span>
            </button>
          </div>
        )}
      </header>

      {/* Fixed Bottom Navigation Bar on Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 pb-safe flex items-center justify-around">
        <button
          onClick={() => setActiveTab('pOverview')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'pOverview'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Tâches</span>
        </button>

        <button
          onClick={() => setActiveTab('pMonth')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'pMonth'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Ventes</span>
        </button>

        <button
          onClick={() => setActiveTab('pFrigos')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'pFrigos'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Snowflake className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Frigos</span>
        </button>

        {/* Si mise à jour disponible : bouton MàJ lumineux en bas aussi */}
        {hasUpdate && onApplyUpdate ? (
          <button
            onClick={onApplyUpdate}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-emerald-700 font-bold transition cursor-pointer animate-pulse"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span className="text-[10px] mt-0.5 text-emerald-700 font-extrabold">MàJ !</span>
          </button>
        ) : (
          <button
            onClick={onOpenVoiceModal}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-blue-700 font-bold transition cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Mic className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <span className="text-[10px] mt-0.5 text-blue-700 font-bold">Assistant</span>
          </button>
        )}
      </nav>
    </>
  );
};
