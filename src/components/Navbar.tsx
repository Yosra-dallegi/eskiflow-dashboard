import React, { useState } from 'react';
import {
  Download,
  RefreshCw,
  FileSpreadsheet,
  Smartphone,
  LayoutGrid,
  TrendingUp,
  Snowflake,
  MoreVertical,
  X,
  Sparkles,
  ShieldCheck,
  Navigation,
  Crown,
  Lock,
  LogOut
} from 'lucide-react';
import { CDZ_LIST, ManagerUser } from '../data/cdzHierarchy';

interface NavbarProps {
  activeTab: 'pOverview' | 'pMonth' | 'pFrigos' | 'pVisites';
  setActiveTab: (tab: 'pOverview' | 'pMonth' | 'pFrigos' | 'pVisites') => void;
  accessMode: string;
  onAccessModeChange: (mode: string) => void;
  managersList?: ManagerUser[];
  allowedModules?: ('pOverview' | 'pMonth' | 'pFrigos' | 'pVisites')[];
  lastMaj: string;
  onRefresh: () => void;
  onExport: () => void;
  onOpenExcelSync?: () => void;
  onOpenInstallModal?: () => void;
  onOpenAccessControl?: () => void;
  onLogout?: () => void;
  isAutonome: boolean;
  isRefreshing?: boolean;
  hasUpdate?: boolean;
  onApplyUpdate?: () => void;
  isAdmin?: boolean;       // Yosra uniquement : accès panneau admin
  canExport?: boolean;     // Exporter autorisé pour ce profil
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  accessMode,
  onAccessModeChange,
  managersList,
  allowedModules,
  lastMaj,
  onRefresh,
  onExport,
  onOpenExcelSync,
  onOpenInstallModal,
  onOpenAccessControl,
  onLogout,
  isAutonome,
  isRefreshing,
  hasUpdate,
  onApplyUpdate,
  isAdmin = false,
  canExport = false
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Main Top Header avec dégradé bleu moderne */}
      <header className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm border border-blue-100/80 mb-3 sm:mb-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
          {/* Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-700 via-indigo-600 to-sky-500 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-md shadow-blue-500/25 shrink-0">
              🧊
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-none truncate flex items-center gap-1.5">
                Suivi des tâches
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-300 rounded-full shadow-xs">
                    <Crown className="w-3 h-3 text-amber-600" />
                    ADMIN
                  </span>
                )}
              </h1>
              <div className="text-[11px] sm:text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-blue-900">Eskimo / Paname</span>
                <span className="hidden xs:inline">·</span>
                <span className="hidden sm:inline text-slate-500">
                  {lastMaj ? `Données du ${lastMaj}` : 'Données prêtes'}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Modern Views Bar (en haut avec dégradé bleu) */}
          <div className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-slate-100 via-blue-50/60 to-indigo-50/50 p-1.5 rounded-2xl border border-blue-200/50 shadow-inner">
            {(!allowedModules || allowedModules.includes('pOverview')) && (
              <button
                onClick={() => setActiveTab('pOverview')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'pOverview'
                    ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-white/80'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Vue d'ensemble</span>
              </button>
            )}
            {(!allowedModules || allowedModules.includes('pVisites')) && (
              <button
                onClick={() => setActiveTab('pVisites')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'pVisites'
                    ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-white/80'
                }`}
              >
                <Navigation className="w-4 h-4" />
                <span>Visites Clients</span>
              </button>
            )}
            {(!allowedModules || allowedModules.includes('pMonth')) && (
              <button
                onClick={() => setActiveTab('pMonth')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'pMonth'
                    ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-white/80'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Réalisation Ventes</span>
              </button>
            )}
            {(!allowedModules || allowedModules.includes('pFrigos')) && (
              <button
                onClick={() => setActiveTab('pFrigos')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'pFrigos'
                    ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-white/80'
                }`}
              >
                <Snowflake className="w-4 h-4" />
                <span>Suivi Frigos</span>
              </button>
            )}
          </div>

          {/* Access Mode Selector — affiché uniquement si Admin */}
          {isAdmin && (
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1.5 rounded-xl border border-amber-200 transition">
              <Crown className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-amber-500 leading-none">Périmètre Admin</span>
                <select
                  value={accessMode}
                  onChange={(e) => onAccessModeChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
                >
                  <optgroup label="👑 Espace Managers (Accès 360°)">
                    <option value="MANAGER">👑 Tous les Managers (Vue globale)</option>
                    {(managersList || []).map((mgr) => (
                      <option key={mgr.email} value={mgr.email}>
                        👑 {mgr.nom} ({mgr.role})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Chefs de Zone (Voir juste leur équipe)">
                    {CDZ_LIST.map((cdz) => (
                      <option key={cdz.email} value={cdz.email}>
                        👤 CDZ : {cdz.name} ({cdz.teamEmails.length} pers.)
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              {onOpenAccessControl && (
                <button
                  type="button"
                  onClick={onOpenAccessControl}
                  className="ml-1 p-1 rounded-lg hover:bg-white text-amber-600 hover:text-amber-800 transition cursor-pointer"
                  title="Gérer les droits, modules et accès (Admin seulement)"
                >
                  ⚙️
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Se déconnecter"
                  className="p-1 rounded-lg hover:bg-white text-amber-500 hover:text-red-600 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Badge profil pour les non-Admin (lecture seule, affichage de qui est connecté) */}
          {!isAdmin && (
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div className="text-xs font-semibold text-slate-700 truncate max-w-[180px]">
                {accessMode === 'MANAGER'
                  ? '👑 Accès Manager'
                  : (() => {
                      const mgr = (managersList || []).find((m) => m.email.toLowerCase() === accessMode.toLowerCase());
                      if (mgr) return `👑 ${mgr.nom}`;
                      const cdz = CDZ_LIST.find((c) => c.email.toLowerCase() === accessMode.toLowerCase());
                      return cdz ? `👤 CDZ : ${cdz.name}` : accessMode;
                    })()
                }
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Se déconnecter"
                  className="ml-1 p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Actions: Desktop full / Mobile compact */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Icône animée Mise à jour */}
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

            {/* Refresh */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Actualiser les données Google Drive"
              className={`flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 text-xs font-semibold text-white rounded-xl transition shadow-sm ${
                isRefreshing
                  ? 'bg-blue-400 cursor-wait'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20 cursor-pointer'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-1.5">{isRefreshing ? 'Actualisation...' : 'Actualiser'}</span>
            </button>

            {/* Desktop Actions — réservées Admin uniquement */}
            <div className="hidden lg:flex items-center gap-2">
              {isAdmin && onOpenAccessControl && (
                <button
                  onClick={onOpenAccessControl}
                  title="Gérer les droits, modules et accès par CDZ/Manager (Admin)"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition cursor-pointer shadow-xs"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>Gestion Accès</span>
                </button>
              )}

              {isAdmin && onOpenInstallModal && (
                <button
                  onClick={onOpenInstallModal}
                  title="Installer l'application sur smartphone"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer shadow-xs"
                >
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Installer Mobile</span>
                </button>
              )}

              {isAdmin && onOpenExcelSync && (
                <button
                  onClick={onOpenExcelSync}
                  title="Charger directement vos fichiers Excel (.xlsx)"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Données Excel</span>
                </button>
              )}

              {(isAdmin || canExport) && (
                <button
                  onClick={onExport}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Exporter</span>
                </button>
              )}
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
          {(!allowedModules || allowedModules.includes('pOverview')) && (
            <button
              onClick={() => setActiveTab('pOverview')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition truncate cursor-pointer ${
                activeTab === 'pOverview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              Tâches
            </button>
          )}
          {(!allowedModules || allowedModules.includes('pVisites')) && (
            <button
              onClick={() => setActiveTab('pVisites')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition truncate cursor-pointer ${
                activeTab === 'pVisites'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              Visites
            </button>
          )}
          {(!allowedModules || allowedModules.includes('pMonth')) && (
            <button
              onClick={() => setActiveTab('pMonth')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition truncate cursor-pointer ${
                activeTab === 'pMonth'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              Ventes
            </button>
          )}
          {(!allowedModules || allowedModules.includes('pFrigos')) && (
            <button
              onClick={() => setActiveTab('pFrigos')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition truncate cursor-pointer ${
                activeTab === 'pFrigos'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              Frigos
            </button>
          )}
        </div>

        {/* Mobile access selector — Admin seulement */}
        {isAdmin && (
          <div className="sm:hidden mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-600 shrink-0" />
            <select
              value={accessMode}
              onChange={(e) => onAccessModeChange(e.target.value)}
              className="flex-1 bg-amber-50 border border-amber-200 py-1 px-2 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
            >
              <optgroup label="👑 Managers">
                <option value="MANAGER">👑 Tous les Managers</option>
                {(managersList || []).map((mgr) => (
                  <option key={mgr.email} value={mgr.email}>
                    👑 {mgr.nom}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Chefs de Zone">
                {CDZ_LIST.map((cdz) => (
                  <option key={cdz.email} value={cdz.email}>
                    👤 CDZ : {cdz.name}
                  </option>
                ))}
              </optgroup>
            </select>
            {onOpenAccessControl && (
              <button
                onClick={onOpenAccessControl}
                className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200"
              >
                ⚙️
              </button>
            )}
          </div>
        )}

        {/* Mobile dropdown menu — actions réservées Admin */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in duration-150">
            {hasUpdate && onApplyUpdate && (
              <button
                onClick={() => { onApplyUpdate(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 animate-spin" />
                <span>Mettre à jour l'application</span>
              </button>
            )}

            {isAdmin && onOpenInstallModal && (
              <button
                onClick={() => { onOpenInstallModal(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Installer sur Smartphone</span>
              </button>
            )}

            {isAdmin && onOpenExcelSync && (
              <button
                onClick={() => { onOpenExcelSync!(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Charger fichier Excel (.xlsx)</span>
              </button>
            )}

            {(isAdmin || canExport) && (
              <button
                onClick={() => { onExport(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Exporter en Excel</span>
              </button>
            )}

            {!isAdmin && !canExport && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-slate-400 text-xs border border-slate-200">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Export et données Excel réservés à l'administrateur</span>
              </div>
            )}

            {onLogout && (
              <button
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Se déconnecter</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Fixed Bottom Navigation Bar on Mobile — Vues autorisées uniquement */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-blue-100 shadow-lg px-2 py-1.5 pb-safe flex items-center justify-around">
        {(!allowedModules || allowedModules.includes('pOverview')) && (
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
        )}

        {(!allowedModules || allowedModules.includes('pVisites')) && (
          <button
            onClick={() => setActiveTab('pVisites')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
              activeTab === 'pVisites'
                ? 'text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Navigation className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Visites</span>
          </button>
        )}

        {(!allowedModules || allowedModules.includes('pMonth')) && (
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
        )}

        {(!allowedModules || allowedModules.includes('pFrigos')) && (
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
        )}

        {hasUpdate && onApplyUpdate && (
          <button
            onClick={onApplyUpdate}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-emerald-700 font-bold transition cursor-pointer animate-pulse"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span className="text-[10px] mt-0.5 text-emerald-700 font-extrabold">MàJ !</span>
          </button>
        )}
      </nav>
    </>
  );
};
