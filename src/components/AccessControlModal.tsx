import React, { useState, useEffect } from 'react';
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
  SlidersHorizontal,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Navigation,
  TrendingUp,
  Snowflake,
  ExternalLink,
  Share2,
  Copy,
  CheckCheck,
  Link2,
  Send
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
import { 
  setUserPassword, 
  resetUserPassword, 
  hasCustomPassword, 
  DEFAULT_PASSWORD_HINT, 
  syncPasswordsFromServer 
} from '../services/authService';

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
  // Tabs: 'users' (Création & gestion des accès) | 'passwords' (Mots de passe)
  const [activeTab, setActiveTab] = useState<'users' | 'passwords'>('users');

  // Permissions state
  const [localPerms, setLocalPerms] = useState<Record<string, CdzPermissions>>(() => ({
    ...(permissions || {})
  }));

  // Managers state
  const [localManagers, setLocalManagers] = useState<ManagerUser[]>(() => [
    ...(managersList || [])
  ]);

  // Selected user being edited
  const [editingEmail, setEditingEmail] = useState<string>('mohamed.jouini@vilavi.tn');

  // Form for creating a brand new access
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newNom, setNewNom] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('Chef de Zone');
  const [newIsGlobal, setNewIsGlobal] = useState<boolean>(false);
  const [newModules, setNewModules] = useState<ModuleKey[]>(['pOverview', 'pFrigos']);
  const [newTeamEmails, setNewTeamEmails] = useState<string[]>([]);

  // Search & Filters
  const [searchCollab, setSearchCollab] = useState<string>('');
  const [searchUser, setSearchUser] = useState<string>('');
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [copiedLinkEmail, setCopiedLinkEmail] = useState<string | null>(null);
  const [createdUserShareInfo, setCreatedUserShareInfo] = useState<{ email: string; nom: string; link: string } | null>(null);

  const getShareableLink = (email: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/?user=${encodeURIComponent(email.trim().toLowerCase())}`;
  };

  const copyShareableLink = async (email: string, nom: string) => {
    const link = getShareableLink(email);
    try {
      if (navigator && navigator.clipboard) {
        await navigator.clipboard.writeText(link);
      } else {
        throw new Error('No clipboard');
      }
      setCopiedLinkEmail(email);
      setSavedBanner(`Lien d'accès copié pour ${nom} !`);
      setTimeout(() => {
        setCopiedLinkEmail(null);
        setSavedBanner(null);
      }, 3000);
    } catch {
      prompt("Copiez ce lien d'accès :", link);
    }
  };

  // Password Management state
  const [selectedPwdEmail, setSelectedPwdEmail] = useState<string>('yosra.dallegi@vilavi.tn');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [showPwdInput, setShowPwdInput] = useState<boolean>(false);
  const [pwdFeedback, setPwdFeedback] = useState<string | null>(null);
  const [, setPwdVersion] = useState<number>(0);

  // Sync from props
  useEffect(() => {
    if (permissions) {
      setLocalPerms({ ...permissions });
    }
  }, [permissions]);

  useEffect(() => {
    if (managersList) {
      setLocalManagers([...managersList]);
    }
  }, [managersList]);

  useEffect(() => {
    if (isOpen) {
      syncPasswordsFromServer().then(() => {
        setPwdVersion((v) => v + 1);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build the complete list of known users in the system
  const allUserAccounts = (() => {
    const map = new Map<string, { email: string; nom: string; role: string; isManager: boolean; isCdz: boolean }>();

    // 1. Admin principal
    map.set('yosra.dallegi@vilavi.tn', {
      email: 'yosra.dallegi@vilavi.tn',
      nom: 'Yosra Dallegi',
      role: 'Direction Commerciale (Admin Total)',
      isManager: true,
      isCdz: false
    });

    // 2. Managers
    (localManagers || []).forEach((m) => {
      if (m?.email && !map.has(m.email.toLowerCase())) {
        map.set(m.email.toLowerCase(), {
          email: m.email.toLowerCase(),
          nom: m.nom || m.email,
          role: m.role || 'Manager Commercial',
          isManager: true,
          isCdz: false
        });
      }
    });

    // 3. CDZ par défaut
    CDZ_LIST.forEach((c) => {
      const em = c.email.toLowerCase();
      if (!map.has(em)) {
        map.set(em, {
          email: em,
          nom: c.name,
          role: 'Chef de Zone',
          isManager: false,
          isCdz: true
        });
      }
    });

    // 4. Utilisateurs personnalisés enregistrés dans localPerms
    Object.keys(localPerms).forEach((em) => {
      const lower = em.toLowerCase();
      if (!map.has(lower)) {
        const p = localPerms[lower];
        map.set(lower, {
          email: lower,
          nom: p.nom || lower,
          role: p.role || 'Collaborateur personnalisé',
          isManager: !!p.isGlobalManager,
          isCdz: false
        });
      }
    });

    return Array.from(map.values());
  })();

  // Current user being edited
  const currentEditingUser = allUserAccounts.find((u) => u.email === editingEmail.toLowerCase()) || allUserAccounts[0];
  const currentConfig: CdzPermissions = localPerms[editingEmail.toLowerCase()] || DEFAULT_CDZ_PERMISSIONS[editingEmail.toLowerCase()] || {
    allowedModules: ['pOverview', 'pFrigos'],
    allowedTeamEmails: (() => {
      const c = CDZ_LIST.find((x) => x.email.toLowerCase() === editingEmail.toLowerCase());
      return c ? c.teamEmails : [editingEmail.toLowerCase()];
    })(),
    isGlobalManager: currentEditingUser?.isManager || false,
    nom: currentEditingUser?.nom,
    role: currentEditingUser?.role
  };

  // Toggle Module for currently edited user
  const handleToggleModule = (moduleKey: ModuleKey) => {
    const current = currentConfig.allowedModules || ['pOverview', 'pFrigos'];
    let updated: ModuleKey[];
    if (current.includes(moduleKey)) {
      if (current.length === 1) {
        alert('Chaque utilisateur doit conserver l\'accès à au moins une vue.');
        return;
      }
      updated = current.filter((m) => m !== moduleKey);
    } else {
      updated = [...current, moduleKey];
    }

    setLocalPerms((prev) => ({
      ...prev,
      [editingEmail.toLowerCase()]: {
        ...currentConfig,
        allowedModules: updated
      }
    }));
  };

  // Toggle Collaborator for currently edited user
  const handleToggleCollaborator = (collabEmail: string) => {
    const currentEmails = (currentConfig.allowedTeamEmails || []).map((e) => e.toLowerCase());
    const target = collabEmail.toLowerCase();
    let updated: string[];

    if (currentEmails.includes(target)) {
      updated = currentEmails.filter((e) => e !== target);
    } else {
      updated = [...currentEmails, target];
    }

    setLocalPerms((prev) => ({
      ...prev,
      [editingEmail.toLowerCase()]: {
        ...currentConfig,
        allowedTeamEmails: updated
      }
    }));
  };

  const handleSelectAllCollabs = () => {
    const all = ALL_COLLABORATORS.map((c) => c.email.toLowerCase());
    setLocalPerms((prev) => ({
      ...prev,
      [editingEmail.toLowerCase()]: {
        ...currentConfig,
        allowedTeamEmails: all
      }
    }));
  };

  const handleSelectSelfOnly = () => {
    setLocalPerms((prev) => ({
      ...prev,
      [editingEmail.toLowerCase()]: {
        ...currentConfig,
        allowedTeamEmails: [editingEmail.toLowerCase()]
      }
    }));
  };

  const handleToggleGlobalManager = (isGlobal: boolean) => {
    setLocalPerms((prev) => ({
      ...prev,
      [editingEmail.toLowerCase()]: {
        ...currentConfig,
        isGlobalManager: isGlobal
      }
    }));

    // Si devenu global, s'assurer qu'il est présent dans localManagers
    if (isGlobal) {
      if (!localManagers.some((m) => m.email.toLowerCase() === editingEmail.toLowerCase())) {
        setLocalManagers((prev) => [
          ...prev,
          {
            email: editingEmail.toLowerCase(),
            nom: currentEditingUser?.nom || editingEmail,
            role: currentEditingUser?.role || 'Manager Commercial'
          }
        ]);
      }
    }
  };

  // Create brand new access
  const handleCreateNewAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    const cleanNom = newNom.trim();
    if (!cleanEmail || !cleanNom) {
      alert('Veuillez renseigner un nom et une adresse email.');
      return;
    }
    if (allUserAccounts.some((u) => u.email === cleanEmail)) {
      alert(`Un compte avec l'adresse "${cleanEmail}" existe déjà.`);
      return;
    }

    // 1. Définir les permissions
    const newPerm: CdzPermissions = {
      allowedModules: newModules.length > 0 ? newModules : ['pOverview', 'pFrigos'],
      allowedTeamEmails: newIsGlobal ? [] : (newTeamEmails.length > 0 ? newTeamEmails : [cleanEmail]),
      isGlobalManager: newIsGlobal,
      nom: cleanNom,
      role: newRole.trim() || 'Collaborateur'
    };

    const updatedPerms = {
      ...localPerms,
      [cleanEmail]: newPerm
    };
    setLocalPerms(updatedPerms);

    // 2. Si global, ajouter aux managers
    let updatedManagers = localManagers;
    if (newIsGlobal) {
      updatedManagers = [
        ...localManagers,
        { email: cleanEmail, nom: cleanNom, role: newRole.trim() || 'Manager Commercial' }
      ];
      setLocalManagers(updatedManagers);
    }

    // 3. Sauvegarde et synchronisation serveur IMMÉDIATE
    onSavePermissions(updatedPerms);
    onSaveManagersList(updatedManagers);

    // 4. Générer le lien de partage automatique
    const magicLink = getShareableLink(cleanEmail);
    setCreatedUserShareInfo({
      email: cleanEmail,
      nom: cleanNom,
      link: magicLink
    });

    // 5. Reset form
    setNewNom('');
    setNewEmail('');
    setNewRole('Chef de Zone');
    setNewIsGlobal(false);
    setNewModules(['pOverview', 'pFrigos']);
    setNewTeamEmails([]);
    setShowCreateForm(false);
    setEditingEmail(cleanEmail);

    setSavedBanner(`Compte "${cleanNom}" (${cleanEmail}) créé et synchronisé sur le serveur !`);
    setTimeout(() => setSavedBanner(null), 5000);
  };

  // Remove an access
  const handleRemoveUser = (emailToRemove: string) => {
    const em = emailToRemove.toLowerCase();
    if (em === 'yosra.dallegi@vilavi.tn' || em === 'yosra.dallgi@vilavi.tn') {
      alert('Le compte principal de Direction ne peut pas être supprimé.');
      return;
    }
    if (!confirm(`Confirmez-vous la suppression de l'accès pour "${emailToRemove}" ?`)) return;

    // Remove from permissions
    const updatedPerms = { ...localPerms };
    delete updatedPerms[em];
    setLocalPerms(updatedPerms);

    // Remove from managers
    const updatedManagers = localManagers.filter((m) => m.email.toLowerCase() !== em);
    setLocalManagers(updatedManagers);

    // Sauvegarder sur le serveur
    onSavePermissions(updatedPerms);
    onSaveManagersList(updatedManagers);

    if (editingEmail.toLowerCase() === em) {
      setEditingEmail('mohamed.jouini@vilavi.tn');
    }

    setSavedBanner(`Accès pour ${emailToRemove} retiré et synchronisé.`);
    setTimeout(() => setSavedBanner(null), 3000);
  };

  // Save All Changes & Push to Server
  const handleSaveAll = () => {
    onSavePermissions(localPerms);
    onSaveManagersList(localManagers);
    setSavedBanner('Toutes les modifications de sécurité et vues ont été enregistrées avec succès !');
    setTimeout(() => {
      setSavedBanner(null);
      onClose();
    }, 1500);
  };

  // Filtered Collaborators for team assignment
  const filteredCollabs = ALL_COLLABORATORS.filter((c) => {
    const q = searchCollab.trim().toLowerCase();
    if (!q) return true;
    return c.nom.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.role.toLowerCase().includes(q);
  });

  // Filtered Users list
  const filteredUsers = allUserAccounts.filter((u) => {
    const q = searchUser.trim().toLowerCase();
    if (!q) return true;
    return u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
        {/* Header avec dégradé bleu corporate */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md shadow-inner text-sky-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight flex items-center gap-2">
                <span>Gestion des Droits d'Accès, Vues & Données</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/30 text-sky-200 border border-blue-400/30">
                  {allUserAccounts.length} comptes
                </span>
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Créez de nouveaux accès, choisissez précisément les vues autorisées et délimitez le périmètre des données.
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

        {/* Sub-Tabs: Gestion des utilisateurs VS Mots de passe */}
        <div className="bg-slate-100 px-6 pt-2.5 flex items-center gap-2 border-b border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-t-2 ${
              activeTab === 'users'
                ? 'bg-white text-blue-600 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>👥 Utilisateurs, Vues & Périmètre de Données</span>
          </button>

          <button
            onClick={() => setActiveTab('passwords')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-t-2 ${
              activeTab === 'passwords'
                ? 'bg-white text-blue-600 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span>🔑 Gestion des Mots de Passe ({DEFAULT_PASSWORD_HINT})</span>
          </button>
        </div>

        {/* Banner notification */}
        {savedBanner && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold px-6 py-2.5 flex items-center justify-center gap-2 shadow-sm animate-in slide-in-from-top-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{savedBanner}</span>
          </div>
        )}

        {/* TAB 1 : Gestion des utilisateurs, vues et données */}
        {activeTab === 'users' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Action Bar : Bouton Créer un Nouvel Accès */}
            <div className="flex items-center justify-between gap-4 flex-wrap bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 p-4 rounded-2xl border border-blue-100">
              <div>
                <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  Créer un nouvel accès sur mesure
                </h3>
                <p className="text-xs text-blue-800/80 mt-0.5">
                  Attribuez un identifiant avec choix exact des <strong>vues à afficher</strong> et des <strong>données visibles</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                {showCreateForm ? 'Masquer le formulaire' : '+ Créer un Nouvel Accès'}
              </button>
            </div>

            {/* FORMULAIRE DE CRÉATION DE COMPTE */}
            {showCreateForm && (
              <form onSubmit={handleCreateNewAccess} className="p-5 bg-white border-2 border-blue-300 rounded-2xl shadow-lg space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    Nouveau Collaborateur / Compte
                  </h4>
                  <span className="text-xs text-slate-500">Mot de passe par défaut : <code className="font-mono font-bold text-blue-600">{DEFAULT_PASSWORD_HINT}</code></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet</label>
                    <input
                      type="text"
                      placeholder="Ex: Sami Ben Ali"
                      value={newNom}
                      onChange={(e) => setNewNom(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse email Vilavi</label>
                    <input
                      type="email"
                      placeholder="sami.benali@vilavi.tn"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rôle / Fonction</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="Chef de Zone">Chef de Zone</option>
                      <option value="Superviseur">Superviseur</option>
                      <option value="Manager Commercial">Manager Commercial</option>
                      <option value="Auditeur & Contrôle">Auditeur & Contrôle</option>
                      <option value="Direction">Direction</option>
                    </select>
                  </div>
                </div>

                {/* Choix des Vues à afficher */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800">
                    1. Vues (onglets) autorisées pour ce compte :
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ALL_MODULES.map((mod) => {
                      const isChecked = newModules.includes(mod.key);
                      return (
                        <div
                          key={mod.key}
                          onClick={() => {
                            if (isChecked) {
                              if (newModules.length > 1) {
                                setNewModules(newModules.filter((m) => m !== mod.key));
                              }
                            } else {
                              setNewModules([...newModules, mod.key]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2 ${
                            isChecked
                              ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                          }`}
                        >
                          {isChecked ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                          <span className="text-xs truncate">{mod.label.split('(')[0].trim()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Choix du périmètre de données */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800">
                    2. Périmètre des données visibles :
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                        newIsGlobal ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="newScope"
                        checked={newIsGlobal}
                        onChange={() => setNewIsGlobal(true)}
                        className="text-amber-600"
                      />
                      <div>
                        <div className="text-xs font-bold">👑 Accès Total 360° (Manager / Direction)</div>
                        <div className="text-[11px] text-slate-500 font-normal">Accès sans filtre à toutes les données de l'entreprise</div>
                      </div>
                    </label>

                    <label
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                        !newIsGlobal ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="newScope"
                        checked={!newIsGlobal}
                        onChange={() => setNewIsGlobal(false)}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="text-xs font-bold">🔒 Accès Restreint par Équipe / Collaborateurs</div>
                        <div className="text-[11px] text-slate-500 font-normal">Sélection fine des personnes dont il voit les données</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Enregistrer l'accès & Générer le lien
                  </button>
                </div>
              </form>
            )}

            {/* CARTE PARTAGE DU LIEN GÉNÉRÉ APRÈS CRÉATION */}
            {createdUserShareInfo && (
              <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-xl border border-blue-400/40 space-y-3 animate-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg border border-emerald-400/40 shrink-0">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                        <span>Compte créé et synchronisé sur le serveur : {createdUserShareInfo.nom}</span>
                        <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30 font-bold">
                          Lien d'accès prêt
                        </span>
                      </h4>
                      <p className="text-xs text-blue-200/90 mt-0.5">
                        Voici le lien direct à envoyer à ce collaborateur pour qu'il ouvre immédiatement son tableau de bord :
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreatedUserShareInfo(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
                    title="Fermer cette bannière"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <input
                    type="text"
                    readOnly
                    value={createdUserShareInfo.link}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-white/10 border border-white/20 rounded-xl text-sky-200 select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyShareableLink(createdUserShareInfo.email, createdUserShareInfo.nom)}
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedLinkEmail === createdUserShareInfo.email ? (
                      <>
                        <CheckCheck className="w-4 h-4 text-emerald-300" />
                        <span>Lien Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copier le lien</span>
                      </>
                    )}
                  </button>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Bonjour ${createdUserShareInfo.nom}, voici votre lien d'accès direct pour l'application EskiFlow Vilavi :\n${createdUserShareInfo.link}\nMot de passe par défaut : vilavi2026`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`mailto:${createdUserShareInfo.email}?subject=${encodeURIComponent('Votre accès à EskiFlow Vilavi')}&body=${encodeURIComponent(`Bonjour ${createdUserShareInfo.nom},\n\nVotre accès à l'application EskiFlow Vilavi a été configuré.\n\nVous pouvez y accéder directement via ce lien personnel :\n${createdUserShareInfo.link}\n\nMot de passe par défaut : vilavi2026\n\nCordialement,\nDirection Vilavi`)}`}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            )}

            {/* Grille principale : Sélection du compte à gauche / Configuration à droite */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Colonne gauche : Liste des comptes (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Comptes existants ({filteredUsers.length})
                  </h4>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrer par nom ou email..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredUsers.map((user) => {
                    const isSelected = editingEmail.toLowerCase() === user.email.toLowerCase();
                    const cfg = localPerms[user.email.toLowerCase()] || DEFAULT_CDZ_PERMISSIONS[user.email.toLowerCase()];
                    const allowedMods = cfg?.allowedModules || ['pOverview', 'pFrigos'];
                    const isGlobal = cfg?.isGlobalManager || user.isManager;

                    return (
                      <div
                        key={user.email}
                        onClick={() => setEditingEmail(user.email)}
                        className={`p-3 rounded-2xl border transition cursor-pointer space-y-2 ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-400 shadow-sm ring-2 ring-blue-400/40'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                              {user.email === 'yosra.dallegi@vilavi.tn' ? (
                                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              ) : isGlobal ? (
                                <span className="text-amber-600">👑</span>
                              ) : (
                                <span className="text-blue-600">👤</span>
                              )}
                              <span className="truncate">{user.nom}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyShareableLink(user.email, user.nom);
                              }}
                              className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                              title="Copier le lien direct pour partager l'app à ce collaborateur"
                            >
                              {copiedLinkEmail === user.email ? (
                                <>
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                  <span>Copié</span>
                                </>
                              ) : (
                                <>
                                  <Link2 className="w-3 h-3 text-blue-600" />
                                  <span>Lien</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectAccessMode(user.email);
                                setSavedBanner(`Aperçu activé : vous visualisez maintenant le dashboard tel que le voit "${user.nom}".`);
                                setTimeout(() => setSavedBanner(null), 3500);
                              }}
                              className="px-2 py-1 text-[10px] font-bold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg transition"
                              title="Tester cet accès en direct"
                            >
                              Tester
                            </button>

                            {user.email !== 'yosra.dallegi@vilavi.tn' && user.email !== 'yosra.dallgi@vilavi.tn' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveUser(user.email);
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                                title="Supprimer cet accès"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Badges vues autorisées */}
                        <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-slate-100/80 text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded font-bold ${
                            isGlobal ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isGlobal ? '👑 360° Total' : `🔒 ${(cfg?.allowedTeamEmails || []).length} collab.`}
                          </span>

                          <span className="text-slate-300">|</span>

                          {allowedMods.map((m) => (
                            <span key={m} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                              {m === 'pOverview' ? 'Tâches' : 'Frigos'}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Colonne droite : Détails & Édition des vues et données (7 cols) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
                {/* Header profil sélectionné */}
                <div className="border-b border-slate-100 pb-4 flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
                      Configuration des droits
                    </span>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>{currentEditingUser?.nom}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {currentEditingUser?.role}
                      </span>
                    </h3>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{currentEditingUser?.email}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectAccessMode(currentEditingUser?.email);
                      setSavedBanner(`Session basculée sur "${currentEditingUser?.nom}". Fermez le panneau pour voir.`);
                      setTimeout(() => setSavedBanner(null), 3000);
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Tester cette vue en direct
                  </button>
                </div>

                {/* Lien d'accès direct généré & Partage */}
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-sky-50 border border-blue-200/90 rounded-2xl p-4 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">Lien d'accès direct pour ce collaborateur</h4>
                        <p className="text-[11px] text-slate-500">Envoyez ce lien pour ouvrir l'application directement dans sa session</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <input
                      type="text"
                      readOnly
                      value={getShareableLink(currentEditingUser?.email || '')}
                      className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-blue-200 rounded-xl text-slate-700 select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => copyShareableLink(currentEditingUser?.email || '', currentEditingUser?.nom || '')}
                      className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {copiedLinkEmail === currentEditingUser?.email ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Lien Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier le lien</span>
                        </>
                      )}
                    </button>
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Bonjour ${currentEditingUser?.nom}, voici votre lien d'accès direct pour l'application EskiFlow Vilavi :\n${getShareableLink(currentEditingUser?.email || '')}\nMot de passe par défaut : vilavi2026`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                      title="Envoyer par WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* 1. Vues autorisées */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      1. Vues (onglets) autorisées dans le tableau de bord :
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {(currentConfig.allowedModules || []).length} / 2 actives
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ALL_MODULES.map((mod) => {
                      const isAllowed = (currentConfig.allowedModules || []).includes(mod.key);
                      return (
                        <div
                          key={mod.key}
                          onClick={() => handleToggleModule(mod.key)}
                          className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                            isAllowed
                              ? 'bg-blue-50/70 border-blue-300 text-blue-950 font-bold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-400 opacity-60'
                          }`}
                        >
                          {isAllowed ? (
                            <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="text-xs leading-tight">{mod.label}</div>
                            <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">{mod.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Périmètre des données visibles */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                    2. Périmètre des données autorisées :
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleGlobalManager(true)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        currentConfig.isGlobalManager
                          ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/40 text-amber-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs flex items-center gap-1.5 font-bold">
                        <span>👑 Accès Total 360°</span>
                        {currentConfig.isGlobalManager && <Check className="w-3.5 h-3.5 text-amber-600" />}
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                        Voit l'ensemble des données de toute l'entreprise sans restriction.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleGlobalManager(false)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        !currentConfig.isGlobalManager
                          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400/40 text-blue-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs flex items-center gap-1.5 font-bold">
                        <span>🔒 Accès Restreint</span>
                        {!currentConfig.isGlobalManager && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                        Restreint strictement aux collaborateurs cochés ci-dessous.
                      </div>
                    </button>
                  </div>

                  {/* Collaborateurs si accès restreint */}
                  {!currentConfig.isGlobalManager && (
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="text-xs font-bold text-slate-800">
                          Collaborateurs visibles par {currentEditingUser?.nom} ({(currentConfig.allowedTeamEmails || []).length} cochés)
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            onClick={handleSelectAllCollabs}
                            className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                          >
                            Tout cocher
                          </button>
                          <span className="text-slate-300">·</span>
                          <button
                            type="button"
                            onClick={handleSelectSelfOnly}
                            className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                          >
                            Lui-même uniquement
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Rechercher un superviseur, prévendeur ou CDZ..."
                          value={searchCollab}
                          onChange={(e) => setSearchCollab(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                        {filteredCollabs.map((collab) => {
                          const isChecked = (currentConfig.allowedTeamEmails || [])
                            .map((e) => e.toLowerCase())
                            .includes(collab.email.toLowerCase());

                          return (
                            <div
                              key={collab.email}
                              onClick={() => handleToggleCollaborator(collab.email)}
                              className={`p-2 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2 ${
                                isChecked
                                  ? 'bg-blue-50/80 border-blue-200 text-blue-950 font-semibold'
                                  : 'bg-white border-slate-100 text-slate-400 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" /> : <Square className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                                <div className="min-w-0">
                                  <div className="text-xs truncate leading-none">{collab.nom}</div>
                                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{collab.email}</div>
                                </div>
                              </div>
                              <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                                {collab.role}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 : Gestion des mots de passe */}
        {activeTab === 'passwords' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-950 leading-relaxed">
                <strong>Gestion des mots de passe :</strong> Chaque utilisateur dispose par défaut du mot de passe initial <code className="bg-blue-200/80 px-1.5 py-0.5 rounded font-mono font-bold text-blue-900">{DEFAULT_PASSWORD_HINT}</code>. Vous pouvez définir un mot de passe personnalisé ou le réinitialiser en un clic pour n'importe quel compte.
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Colonne gauche : Sélection du compte */}
              <div className="lg:col-span-5 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Sélectionner un compte ({allUserAccounts.length})
                </div>

                <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                  {allUserAccounts.map((user) => {
                    const isSelected = selectedPwdEmail.toLowerCase() === user.email.toLowerCase();
                    const isCustom = hasCustomPassword(user.email);

                    return (
                      <button
                        key={user.email}
                        type="button"
                        onClick={() => {
                          setSelectedPwdEmail(user.email);
                          setNewPasswordInput('');
                          setPwdFeedback(null);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/40 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                            {user.email === 'yosra.dallegi@vilavi.tn' ? '👑 ' : '👤 '}
                            <span className="truncate">{user.nom}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                        </div>

                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          isCustom ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isCustom ? 'Personnalisé' : 'Défaut'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colonne droite : Formulaire mot de passe */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Compte sélectionné
                  </div>
                  <div className="text-base font-bold text-slate-900">{selectedPwdEmail}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Statut actuel : {hasCustomPassword(selectedPwdEmail) ? (
                      <span className="text-emerald-700 font-semibold">Mot de passe personnalisé actif</span>
                    ) : (
                      <span className="text-slate-600 font-medium">Mot de passe standard ({DEFAULT_PASSWORD_HINT})</span>
                    )}
                  </div>
                </div>

                {pwdFeedback && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{pwdFeedback}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Définir un nouveau mot de passe pour ce compte
                  </label>
                  <div className="relative">
                    <input
                      type={showPwdInput ? 'text' : 'password'}
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Saisir un nouveau mot de passe (min. 4 car.)"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwdInput(!showPwdInput)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPwdInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    <button
                      type="button"
                      disabled={!newPasswordInput.trim() || newPasswordInput.trim().length < 4}
                      onClick={async () => {
                        const ok = await setUserPassword(selectedPwdEmail, newPasswordInput.trim());
                        setPwdVersion((v) => v + 1);
                        setPwdFeedback(
                          ok
                            ? `Nouveau mot de passe appliqué et synchronisé sur le serveur pour ${selectedPwdEmail} !`
                            : `Mot de passe appliqué en local pour ${selectedPwdEmail}.`
                        );
                        setNewPasswordInput('');
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Appliquer ce mot de passe
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        await resetUserPassword(selectedPwdEmail);
                        setPwdVersion((v) => v + 1);
                        setPwdFeedback(
                          `Mot de passe réinitialisé à "${DEFAULT_PASSWORD_HINT}" pour ${selectedPwdEmail} (synchronisé serveur).`
                        );
                        setNewPasswordInput('');
                      }}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                      Réinitialiser à {DEFAULT_PASSWORD_HINT}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                  <div>• Hachage cryptographique SHA-256 : aucun mot de passe ne transite en clair.</div>
                  <div>• Tous les appareils et téléphones accèdent aux mêmes mots de passe synchronisés en direct.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Les modifications sont répercutées immédiatement sur tous les appareils connectés.</span>
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
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Enregistrer & Synchroniser Tout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
