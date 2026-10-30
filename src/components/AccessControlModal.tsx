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
  Info,
  Crown,
  UserPlus,
  Trash2,
  SlidersHorizontal
} from 'lucide-react';
import { 
  CDZ_LIST, 
  ALL_MODULES, 
  ALL_COLLABORATORS, 
  ModuleKey, 
  CdzPermissions,
  DEFAULT_CDZ_PERMISSIONS,
  DEFAULT_MANAGERS,
  ManagerUser
} from '../data/cdzHierarchy';

interface AccessControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: Record<string, CdzPermissions>;
  onSavePermissions: (updated: Record<string, CdzPermissions>) => void;
  currentAccessMode: string;
  onSelectAccessMode: (mode: string) => void;
  managersList: ManagerUser[];
  onSaveManagersList: (managers: ManagerUser[]) => void;
}

export const AccessControlModal: React.FC<AccessControlModalProps> = ({
  isOpen,
  onClose,
  permissions,
  onSavePermissions,
  currentAccessMode,
  onSelectAccessMode,
  managersList,
  onSaveManagersList
}) => {
  // Main Tab: 'cdz' (Permissions des CDZ) ou 'managers' (Espace & Liste des Managers)
  const [activeSubTab, setActiveSubTab] = useState<'cdz' | 'managers'>('managers');

  // CDZ Configuration state
  const [selectedCdzEmail, setSelectedCdzEmail] = useState<string>(
    CDZ_LIST[0]?.email || 'mohamed.jouini@vilavi.tn'
  );
  const [localPerms, setLocalPerms] = useState<Record<string, CdzPermissions>>(() => ({
    ...permissions
  }));
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [searchCollab, setSearchCollab] = useState<string>('');

  // Managers Management state
  const [localManagers, setLocalManagers] = useState<ManagerUser[]>(() => [...managersList]);
  const [newManagerEmail, setNewManagerEmail] = useState<string>('');
  const [newManagerNom, setNewManagerNom] = useState<string>('');
  const [newManagerRole, setNewManagerRole] = useState<string>('Manager Commercial');

  if (!isOpen) return null;

  const currentCdz = CDZ_LIST.find((c) => c.email.toLowerCase() === selectedCdzEmail.toLowerCase()) || CDZ_LIST[0];
  const cdzConfig = localPerms[selectedCdzEmail.toLowerCase()] || DEFAULT_CDZ_PERMISSIONS[selectedCdzEmail.toLowerCase()] || {
    allowedModules: ['pOverview', 'pVisites', 'pMonth', 'pFrigos'],
    allowedTeamEmails: currentCdz.teamEmails
  };

  // Toggle allowed module for a CDZ
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

  // Add a new manager
  const handleAddManager = (e: React.FormEvent) => {
    e.preventDefault();
    const emailClean = newManagerEmail.trim().toLowerCase();
    const nomClean = newManagerNom.trim();
    if (!emailClean || !nomClean) {
      alert('Veuillez saisir un nom et une adresse email.');
      return;
    }
    if (localManagers.some((m) => m.email.toLowerCase() === emailClean)) {
      alert('Ce collaborateur a déjà le statut Manager.');
      return;
    }

    const updated = [
      ...localManagers,
      { email: emailClean, nom: nomClean, role: newManagerRole.trim() || 'Manager' }
    ];
    setLocalManagers(updated);
    setNewManagerEmail('');
    setNewManagerNom('');
  };

  // Remove a manager
  const handleRemoveManager = (emailToRemove: string) => {
    if (emailToRemove.toLowerCase() === 'yosra.dallegi@vilavi.tn') {
      alert('Le compte principal de Direction ne peut pas être retiré.');
      return;
    }
    const updated = localManagers.filter((m) => m.email.toLowerCase() !== emailToRemove.toLowerCase());
    setLocalManagers(updated);
  };

  // Save All
  const handleSaveAll = () => {
    onSavePermissions(localPerms);
    onSaveManagersList(localManagers);
    setSavedBanner('Modifications enregistrées avec succès !');
    setTimeout(() => {
      setSavedBanner(null);
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
                Gestion des Rôles & Sécurité d'Accès
              </h2>
              <p className="text-xs text-sky-100/90 mt-0.5">
                Attribuez l'accès Manager global (Oubaied, etc.) et configurez les droits fins des Chefs de Zone.
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

        {/* Sub-Tabs: Espace Managers VS Droits des CDZ */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-6 pt-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setActiveSubTab('managers')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-t-2 ${
              activeSubTab === 'managers'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-blue-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>👑 Espace Managers (Accès Global & Tout Voir)</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-amber-100 text-amber-800 rounded-full font-bold">
              {localManagers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('cdz')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-t-2 ${
              activeSubTab === 'cdz'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-blue-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
            <span>👤 Droits par CDZ (Modules & Équipes)</span>
          </button>
        </div>

        {/* Saved Toast */}
        {savedBanner && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-6 py-2.5 flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
            <Check className="w-4 h-4" />
            {savedBanner}
          </div>
        )}

        {/* ======================================================== */}
        {/* CONTENU ONGLET 1 : ESPACE MANAGERS (Oubaied, Direction) */}
        {/* ======================================================== */}
        {activeSubTab === 'managers' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/50">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    Privilèges du Profil Manager
                  </h3>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1 leading-relaxed">
                    Toute personne ajoutée ci-dessous bénéficie d'une <b>visibilité totale à 360°</b> : elle accède à l'ensemble des modules (Tâches, Visites GPS, Réalisation, Frigos) et voit la totalité des données de <b>tous les Chefs de Zone et commerciaux sans restriction</b>.
                  </p>
                </div>
              </div>
            </div>

            {/* Liste des Managers Actuels */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Managers Actuels avec Accès Global ({localManagers.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {localManagers.map((mgr) => (
                  <div
                    key={mgr.email}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white truncate">
                        <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{mgr.nom}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {mgr.email}
                      </div>
                      <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                        {mgr.role}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <button
                        onClick={() => {
                          onSelectAccessMode(mgr.email);
                          onClose();
                        }}
                        className="px-2 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 rounded-lg transition cursor-pointer"
                        title="Basculer sur cette session"
                      >
                        Se connecter
                      </button>

                      {mgr.email.toLowerCase() !== 'yosra.dallegi@vilavi.tn' && (
                        <button
                          onClick={() => handleRemoveManager(mgr.email)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                          title="Révoquer l'accès Manager"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulaire : Ajouter un nouveau Manager (ex: Oubaiedallah, Rafik, etc.) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                Accorder l'accès Manager à un autre collaborateur
              </h4>

              <form onSubmit={handleAddManager} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Sélectionner ou saisir un nom
                  </label>
                  <input
                    type="text"
                    list="collabs-datalist"
                    placeholder="Ex: Oubaiedallah Woissoissi"
                    value={newManagerNom}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewManagerNom(val);
                      // Auto-fill email if matched
                      const found = ALL_COLLABORATORS.find((c) => c.nom.toLowerCase() === val.toLowerCase());
                      if (found) {
                        setNewManagerEmail(found.email);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="collabs-datalist">
                    {ALL_COLLABORATORS.map((c) => (
                      <option key={c.email} value={c.nom}>{c.email}</option>
                    ))}
                  </datalist>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Adresse e-mail Vilavi
                  </label>
                  <input
                    type="email"
                    placeholder="oubaiedallah.woissoissi@vilavi.tn"
                    value={newManagerEmail}
                    onChange={(e) => setNewManagerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Titre / Rôle
                  </label>
                  <input
                    type="text"
                    placeholder="Manager"
                    value={newManagerRole}
                    onChange={(e) => setNewManagerRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CONTENU ONGLET 2 : DROITS DES CDZ (Modules & Équipes)   */}
        {/* ======================================================== */}
        {activeSubTab === 'cdz' && (
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

            {/* Right Column: Configuration */}
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

              {/* Part 2: Team Member Visibility */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      2. Périmètre des Collaborateurs & Équipe Visible
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cochez les personnes dont {currentCdz.name} peut voir les données (ex: Ahmed Trabelsi, Aymen Amdouni...).
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

                <div>
                  <input
                    type="text"
                    placeholder="Filtrer un collaborateur par nom, email ou rôle (ex: Ahmed, Aymen, PRV...)"
                    value={searchCollab}
                    onChange={(e) => setSearchCollab(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

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
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-500" />
            <span>Les modifications sont enregistrées localement et appliquées instantanément.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition cursor-pointer"
            >
              Fermer
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Enregistrer les Modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
