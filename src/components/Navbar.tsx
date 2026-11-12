import React, { useState } from 'react';
import {
  Download,
  RefreshCw,
  FileSpreadsheet,
  Smartphone,
  LayoutGrid,
  Snowflake,
  MoreVertical,
  X,
  Sparkles,
  ShieldCheck,
  Crown,
  Lock,
  LogOut,
  Link2
} from 'lucide-react';
import { CDZ_LIST, ManagerUser } from '../data/cdzHierarchy';

interface NavbarProps {
  activeTab: 'pOverview' | 'pFrigos';
  setActiveTab: (tab: 'pOverview' | 'pFrigos') => void;
  accessMode: string;
  onAccessModeChange: (mode: string) => void;
  managersList?: ManagerUser[];
  allowedModules?: ('pOverview' | 'pFrigos')[];
  lastMaj: string;
  onRefresh: () => void;
  onExport: () => void;
  onOpenExcelSync?: () => void;
  onOpenInstallModal?: () => void;
  onOpenAccessControl?: () => void;
  onOpenAppSheetLinks?: () => void;
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
  onOpenAppSheetLinks,
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
                Suivi des Tâches & Frigos
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

          {/* Desktop Modern Views Bar (Exclusivement Tâches et Frigos) */}
          <div className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-slate-100 via-blue-50/60 to-indigo-50/50 p-1.5 rounded-2xl border border-blue-200/50 shadow-inner">
            {(!allowedModules || allowedModules.includes('pOverview')) && (
              <button
                onClick={() => setActiveTab('pOverview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'pOverview'
                    ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-white/80'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>📋 Suivi des Tâches</span>
              </button>
            )}
            {(!allowedModules || allowedModules.includes('pFrigos')) && (
              <button
                onClick={() => setActiveTab('pFrigos')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'pFrigos'
                    ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-white/80'
                }`}
              >
                <Snowflake className="w-4 h-4" />
                <span>❄️ Suivi des Frigos</span>
              </button>
            )}
          </div>

          {/* Access Mode Selector — affiché pour l'Admin */}
          {isAdmin && (
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1.5 rounded-xl border border-amber-200 transition">
              <Crown className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-amber-700 leading-none">Périmètre Admin</span>
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

          {/* Badge profil pour les non-Admin */}
          {!isAdmin && accessMode && (
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

          {/* Actions Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Bouton Liens AppSheet (Recommandé) */}
            {onOpenAppSheetLinks && (
              <button
                type="button"
                onClick={onOpenAppSheetLinks}
                title="Obtenir les liens et formules d'intégration AppSheet"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition shadow-xs cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Liens AppSheet</span>
                <span className="sm:hidden">AppSheet</span>
              </button>
            )}

            {/* Icône animée Mise à jour */}
            {hasUpdate && onApplyUpdate && (
              <button
                type="button"
                onClick={onApplyUpdate}
                title="Une nouvelle version est disponible ! Cliquez pour mettre à jour."
                className="relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-xl shadow-md shadow-emerald-500/30 transition cursor-pointer border border-emerald-300 ring-2 ring-emerald-400/60 animate-pulse group"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="hidden xs:inline">Version dispo !</span>
                <span className="xs:hidden">MàJ</span>
              </button>
            )}

            {/* Refresh */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Actualiser les données"
              className={`flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 text-xs font-semibold text-white rounded-xl transition shadow-sm ${
                isRefreshing
                  ? 'bg-blue-400 cursor-wait'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20 cursor-pointer'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-1.5">Actualiser</span>
            </button>

            {/* Export (réservé à l'Admin) */}
            {canExport && (
              <button
                onClick={onExport}
                title="Exporter les données affichées vers Excel"
                className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline ml-1.5">Exporter</span>
              </button>
            )}

            {/* Synchronisation Excel (Admin seulement) */}
            {isAdmin && onOpenExcelSync && (
              <button
                onClick={onOpenExcelSync}
                title="Synchroniser un fichier Excel ou Google Drive"
                className="hidden sm:flex items-center px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-blue-600" />
                <span>Sync Fichier</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="md:hidden mt-2 pt-2 border-t border-slate-100 flex items-center justify-around gap-1">
          {(!allowedModules || allowedModules.includes('pOverview')) && (
            <button
              onClick={() => setActiveTab('pOverview')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                activeTab === 'pOverview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📋 Tâches
            </button>
          )}
          {(!allowedModules || allowedModules.includes('pFrigos')) && (
            <button
              onClick={() => setActiveTab('pFrigos')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                activeTab === 'pFrigos'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ❄️ Frigos
            </button>
          )}
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl p-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧊</span>
                  <span className="font-bold text-slate-800 text-sm">Menu Eskiflow</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Links */}
              <div className="space-y-2">
                {onOpenAppSheetLinks && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAppSheetLinks();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                  >
                    <Link2 className="w-4 h-4 text-blue-600" />
                    <span>🔗 Liens d'Intégration AppSheet</span>
                  </button>
                )}

                {isAdmin && onOpenAccessControl && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAccessControl();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>⚙️ Gestion des Accès (Admin)</span>
                  </button>
                )}

                {isAdmin && onOpenExcelSync && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenExcelSync();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                    <span>Synchroniser Fichier Excel / Drive</span>
                  </button>
                )}

                {onOpenInstallModal && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenInstallModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-slate-500" />
                    <span>Installer l'application sur le téléphone</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom logout */}
            {onLogout && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
