import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Check, 
  UserCheck, 
  LayoutGrid, 
  RotateCcw, 
  Users, 
  CheckSquare, 
  Square,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  CDZ_LIST, 
  ALL_MODULES, 
  ALL_COLLABORATORS, 
  ModuleKey, 
  CdzPermissions,
  DEFAULT_CDZ_PERMISSIONS 
} from '../data/cdzHierarchy';

interface AccessControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: Record<string, CdzPermissions>;
  onSavePermissions: (updated: Record<string, CdzPermissions>) => void;
  currentAccessMode: string;
  onSelectAccessMode: (mode: string) => void;
}

export const AccessControlModal: React.FC<AccessControlModalProps> = ({
  isOpen,
  onClose,
  permissions,
  onSavePermissions,
  currentAccessMode,
  onSelectAccessMode
}) => {
  const [selectedCdzEmail, setSelectedCdzEmail] = useState<string>(
    CDZ_LIST[0]?.email || 'mohamed.jouini@vilavi.tn'
  );
  const [localPerms, setLocalPerms] = useState<Record<string, CdzPermissions>>(() => ({
    ...permissions
  }));
  const [savedBanner, setSavedBanner] = useState<boolean>(false);
  const [searchCollab, setSearchCollab] = useState<string>('');

  if (!isOpen) return null;

  const currentCdz = CDZ_LIST.find((c) => c.email.toLowerCase() === selectedCdzEmail.toLowerCase()) || CDZ_LIST[0];
  const cdzConfig = localPerms[selectedCdzEmail.toLowerCase()] || DEFAULT_CDZ_PERMISSIONS[selectedCdzEmail.toLowerCase()] || {
    allowedModules: ['pOverview', 'pVisites', 'pMonth', 'pFrigos'],
    allowedTeamEmails: currentCdz.teamEmails
  };

  // Toggle allowed module
  const toggleModule = (moduleKey: ModuleKey) => {
    const currentList = cdzConfig.allowedModules || [];
    let updated: ModuleKey[];
    if (currentList.includes(moduleKey)) {
      if (currentList.length === 1) {
        alert('Chaque Chef de Zone doit au moins conserver l\'accès à un module.');
        return;
      }
      updated = currentList.filter((m) => m !== moduleKey);
    } else {
      updated = [...currentList, moduleKey];
    }

    setLocalPerms((prev) => ({
      ...prev,
      [selectedCdzEmail.toLowerCase()]: {
        ...cdzConfig,
        allowedModules: updated
      }
    }));
  };

  // Toggle allowed collaborator / team member
  const toggleCollaborator = (collabEmail: string) => {
    const currentEmails = (cdzConfig.allowedTeamEmails || []).map((e) => e.toLowerCase());
    const target = collabEmail.toLowerCase();
    let updated: string[];

    if (currentEmails.includes(target)) {
      updated = currentEmails.filter((e) => e !== target);
    } else {
      updated = [...currentEmails, target];
    }

    setLocalPerms((prev) => ({
      ...prev,
      [selectedCdzEmail.toLowerCase()]: {
        ...cdzConfig,
        allowedTeamEmails: updated
      }
    }));
  };

  // Select all or deselect all collaborators
  const handleSelectAllCollabs = () => {
    const all = ALL_COLLABORATORS.map((c) => c.email.toLowerCase());
    setLocalPerms((prev) => ({
      ...prev,
      [selectedCdzEmail.toLowerCase()]: {
        ...cdzConfig,
        allowedTeamEmails: all
      }
    }));
  };

  const handleResetCdzToDefault = () => {
    const def = DEFAULT_CDZ_PERMISSIONS[selectedCdzEmail.toLowerCase()];
    if (def) {
      setLocalPerms((prev) => ({
        ...prev,
        [selectedCdzEmail.toLowerCase()]: {
          allowedModules: [...def.allowedModules],
          allowedTeamEmails: [...def.allowedTeamEmails]
        }
      }));
    }
  };

  const handleSave = () => {
    onSavePermissions(localPerms);
    setSavedBanner(true);
    setTimeout(() => {
      setSavedBanner(false);
      onClose();
    }, 1200);
  };

  const filteredCollabs = ALL_COLLABORATORS.filter((c) => {
    const q = searchCollab.trim().toLowerCase();
    if (!q) return true;
    return c.nom.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.role.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md shadow-inner">
              <ShieldCheck className="w-6 h-6 text-sky-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">
                Gestion des Accès & Permissions par Chef de Zone (CDZ)
              </h2>
              <p className="text-xs text-sky-100/90 mt-0.5">
                Définissez avec précision les modules et les collaborateurs que chaque CDZ est autorisé à voir.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Banner Toast */}
        {savedBanner && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-6 py-2.5 flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
            <Check className="w-4 h-4" />
            Permissions enregistrées avec succès et appliquées instantanément !
          </div>
        )}

        {/* Content Area with 2 Columns: Left CDZ Selection, Right Permissions */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Column: CDZ List */}
          <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 overflow-y-auto space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
              Sélectionnez un Chef de Zone :
            </div>

            {CDZ_LIST.map((cdz) => {
              const isSelected = selectedCdzEmail.toLowerCase() === cdz.email.toLowerCase();
              const cdzP = localPerms[cdz.email.toLowerCase()] || DEFAULT_CDZ_PERMISSIONS[cdz.email.toLowerCase()];
              const modCount = cdzP?.allowedModules?.length || 4;
              const teamCount = cdzP?.allowedTeamEmails?.length || cdz.teamEmails.length;

              return (
                <button
                  key={cdz.email}
                  onClick={() => setSelectedCdzEmail(cdz.email)}
                  className={`w-full text-left p-3 rounded-2xl transition border cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/70 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm truncate">{cdz.name}</span>
                    {currentAccessMode.toLowerCase() === cdz.email.toLowerCase() && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Actif
                      </span>
                    )}
                  </div>
                  <div className={`text-xs truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    {cdz.email}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[11px]">
                    <span className={`px-2 py-0.5 rounded-md font-semibold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {modCount}/4 modules
                    </span>
                    <span className={`px-2 py-0.5 rounded-md font-semibold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {teamCount} membres
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Module & Team Configuration for the selected CDZ */}
          <div className="md:col-span-8 p-5 overflow-y-auto space-y-6">
            {/* CDZ Profile Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
              <div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                  Configuration active pour :
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                  <span>{currentCdz.name}</span>
                  <span className="text-xs font-normal text-slate-500">({currentCdz.email})</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectAccessMode(currentCdz.email);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  title="Simuler ou tester la vue en tant que ce CDZ"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Voir en tant que {currentCdz.name.split(' ')[0]}
                </button>

                <button
                  onClick={handleResetCdzToDefault}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white border border-slate-200 transition cursor-pointer"
                  title="Rétablir les autorisations d'origine"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Part 1: Module Authorizations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-blue-600" />
                  1. Modules Autorisés pour {currentCdz.name}
                </div>
                <span className="text-xs text-slate-400">
                  {cdzConfig.allowedModules?.length || 0} / {ALL_MODULES.length} actifs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ALL_MODULES.map((mod) => {
                  const isChecked = (cdzConfig.allowedModules || []).includes(mod.key);
                  return (
                    <div
                      key={mod.key}
                      onClick={() => toggleModule(mod.key)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isChecked ? (
                          <div className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {mod.label}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {mod.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Part 2: Team Member Visibility / Collaborateurs autorisés */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    2. Périmètre des Collaborateurs & Équipe Visible
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sélectionnez les commerciaux/superviseurs dont {currentCdz.name} peut consulter les données et visites.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllCollabs}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                  >
                    Tout sélectionner
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    onClick={() => {
                      setLocalPerms((prev) => ({
                        ...prev,
                        [selectedCdzEmail.toLowerCase()]: {
                          ...cdzConfig,
                          allowedTeamEmails: [selectedCdzEmail.toLowerCase()]
                        }
                      }));
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                  >
                    Uniquement lui-même
                  </button>
                </div>
              </div>

              {/* Search input for team members */}
              <div>
                <input
                  type="text"
                  placeholder="Filtrer un collaborateur par nom, email ou rôle (ex: Ahmed, Aymen, PRV...)"
                  value={searchCollab}
                  onChange={(e) => setSearchCollab(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Collaborators Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                {filteredCollabs.map((collab) => {
                  const isChecked = (cdzConfig.allowedTeamEmails || [])
                    .map((e) => e.toLowerCase())
                    .includes(collab.email.toLowerCase());

                  return (
                    <div
                      key={collab.email}
                      onClick={() => toggleCollaborator(collab.email)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                        isChecked
                          ? 'bg-purple-50/80 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700/60 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-purple-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate leading-tight">
                            {collab.nom}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {collab.email}
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                        collab.role === 'CDZ'
                          ? 'bg-blue-100 text-blue-700'
                          : collab.role === 'PRV'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {collab.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-500" />
            <span>Les droits sont sauvegardés localement et appliqués instantanément sur le dashboard.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition cursor-pointer"
            >
              Fermer
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Enregistrer les Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
