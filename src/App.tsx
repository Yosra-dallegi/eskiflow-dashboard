import React, { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown, Filter } from 'lucide-react';
import { TaskItem, FrigoData } from './types/task';
import { INITIAL_TASKS, INITIAL_FRIGOS } from './data/mockData';
import { 
  CDZ_LIST, 
  ALL_COLLABORATORS,
  CdzPermissions, 
  DEFAULT_CDZ_PERMISSIONS, 
  DEFAULT_MANAGERS, 
  ManagerUser, 
  isModuleAllowed, 
  getAuthorizedTeamEmails,
  isUserAuthorized,
  isRecordAuthorizedForCdz,
  getCdzForSupervisor
} from './data/cdzHierarchy';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OverviewTab } from './components/OverviewTab';
import { FrigosTab } from './components/FrigosTab';
import { AccessControlModal } from './components/AccessControlModal';
import { AccessDeniedScreen } from './components/AccessDeniedScreen';
import { LoginScreen } from './components/LoginScreen';
import { TaskModal } from './components/TaskModal';
import { AppSheetLinksModal } from './components/AppSheetLinksModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { exportTasksExcel, exportFrigosExcel } from './services/exportService';
import { storageService } from './services/storageService';
import { loadTasksFromStaticCsv, loadFrigosFromStaticCache } from './services/excelReaderService';
import { useAppUpdate } from './hooks/useAppUpdate';
import { UpdateNotificationBanner } from './components/UpdateNotificationBanner';

const SANS_CHEF = '— Non rattaché —';

const toDate = (s?: string) => {
  if (!s) return null;
  const p = s.split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
};

function computeTaskFields(rawTasks: TaskItem[]): TaskItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return rawTasks.map((t) => {
    const isDone = /^termin/i.test(t.statut);
    const e = toDate(t.echeance);
    const isLate = !isDone && !!e && e < today;
    const etat: 'Terminée' | 'En attente' | 'En retard' = isDone
      ? 'Terminée'
      : isLate
      ? 'En retard'
      : 'En attente';
    const rawChef = t.chef ? t.chef.trim() : SANS_CHEF;
    // Résolution automatique de la Zone CDZ officielle selon la table d'affectation
    const cdzMatch = getCdzForSupervisor(rawChef);
    const chef = cdzMatch ? cdzMatch.cdzName : rawChef;
    const superviseur = t.superviseur || (cdzMatch ? rawChef : t.demandeur || '');

    const ecart =
      isDone && t.dateReal && e
        ? Math.round((toDate(t.dateReal)!.getTime() - e.getTime()) / 864e5)
        : null;

    return {
      ...t,
      done: isDone,
      late: isLate,
      etat,
      chef,
      superviseur,
      ecart
    };
  });
}

export default function App() {
  const { hasUpdate, applyUpdate, dismissUpdate } = useAppUpdate();

  // Mode actif : 'pOverview' (Tâches) ou 'pFrigos' (Frigos)
  // Prise en charge automatique des liens AppSheet (?view=tasks ou ?view=frigos)
  const [activeTab, setActiveTab] = useState<'pOverview' | 'pFrigos'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const view = (params.get('view') || params.get('tab') || '').toLowerCase();
        if (view.includes('frigo') || view === 'freezers') {
          return 'pFrigos';
        }
      } catch {}
    }
    return 'pOverview';
  });

  // Datasets
  const [tasks, setTasks] = useState<TaskItem[]>(() => computeTaskFields(INITIAL_TASKS));
  const [frigoData, setFrigoData] = useState<FrigoData>(INITIAL_FRIGOS);

  // Mode d'accès : 'MANAGER' (tout voir) ou email d'un collaborateur
  // Prise en charge automatique des liens magiques partagés (?user=... ou ?login=... ou ?auth=...)
  const [accessMode, setAccessMode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlUser = params.get('user') || params.get('login') || params.get('auth') || params.get('email');
        if (urlUser) {
          const clean = urlUser.trim().toLowerCase();
          storageService.saveAccessMode(clean);
          return clean;
        }
      } catch {}
    }
    return storageService.loadAccessMode() || '';
  });
  
  // Liste des managers autorisés (Oubaiedallah, Rafik, Yosra...)
  const [managersList, setManagersList] = useState<ManagerUser[]>(() => {
    return storageService.loadManagersList() || DEFAULT_MANAGERS;
  });

  // Permissions par CDZ et collaborateurs (modules autorisés & équipe visible)
  const [cdzPermissions, setCdzPermissions] = useState<Record<string, CdzPermissions>>(() => {
    return storageService.loadCdzPermissions() || DEFAULT_CDZ_PERMISSIONS;
  });

  const [isAccessModalOpen, setIsAccessModalOpen] = useState<boolean>(false);
  const [isAppSheetLinksOpen, setIsAppSheetLinksOpen] = useState<boolean>(false);

  // Détection URL magique et vue en continu
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlUser = params.get('user') || params.get('login') || params.get('auth') || params.get('email');
        if (urlUser) {
          const clean = urlUser.trim().toLowerCase();
          if (clean && clean !== accessMode) {
            setAccessMode(clean);
            storageService.saveAccessMode(clean);
          }
        }
        const view = (params.get('view') || params.get('tab') || '').toLowerCase();
        if (view.includes('frigo') && activeTab !== 'pFrigos') {
          setActiveTab('pFrigos');
        } else if ((view === 'tasks' || view === 'taches' || view === 'overview') && activeTab !== 'pOverview') {
          setActiveTab('pOverview');
        }
      } catch {}
    }
  }, [accessMode, activeTab]);

  // Admin exclusif : yosra.dallegi@vilavi.tn (gère aussi l'alias yosra.dallgi@vilavi.tn)
  const ADMIN_EMAILS = ['yosra.dallegi@vilavi.tn', 'yosra.dallgi@vilavi.tn'];
  const isAdmin = ADMIN_EMAILS.includes((accessMode || '').toLowerCase());
  // Export réservé à l'admin uniquement
  const canExport = isAdmin;

  // Est-ce un accès à 360° total (sans restriction de données) ?
  const isGlobalUser = useMemo(() => {
    if (!accessMode) return false;
    if (accessMode === 'MANAGER') return true;
    const em = accessMode.trim().toLowerCase();
    if (ADMIN_EMAILS.includes(em)) return true;

    const perm = cdzPermissions[em];
    if (perm && perm.isGlobalManager !== undefined) {
      return perm.isGlobalManager === true;
    }

    return (managersList || []).some((m) => m?.email && m.email.toLowerCase() === em);
  }, [accessMode, cdzPermissions, managersList]);

  const isManager = useMemo(() => {
    return isGlobalUser;
  }, [isGlobalUser]);

  const isCdz = useMemo(() => {
    return CDZ_LIST.some((c) => c?.email && c.email.toLowerCase() === (accessMode || '').toLowerCase());
  }, [accessMode]);

  const isCollab = useMemo(() => {
    const em = (accessMode || '').trim().toLowerCase();
    return ALL_COLLABORATORS.some((c) => c?.email && c.email.toLowerCase() === em);
  }, [accessMode]);

  const isCustomUser = useMemo(() => {
    const em = (accessMode || '').trim().toLowerCase();
    return Boolean(em && cdzPermissions && cdzPermissions[em]);
  }, [accessMode, cdzPermissions]);

  // Zéro blocage injustifié : tout collaborateur, manager ou utilisateur avec email valide est autorisé
  const isAuthorized = Boolean(
    accessMode &&
    (isManager || isCdz || isCollab || isCustomUser || accessMode.includes('@') || accessMode === 'MANAGER')
  );

  const handleSaveCdzPermissions = (updated: Record<string, CdzPermissions>) => {
    setCdzPermissions(updated);
    storageService.saveCdzPermissions(updated);
  };

  const handleSaveManagersList = (updated: ManagerUser[]) => {
    setManagersList(updated);
    storageService.saveManagersList(updated);
  };

  const handleAccessModeChange = (mode: string) => {
    setAccessMode(mode);
    storageService.saveAccessMode(mode);
    const modeLower = (mode || '').toLowerCase();
    const perm = cdzPermissions[modeLower] || DEFAULT_CDZ_PERMISSIONS[modeLower];
    const isGlobal =
      mode === 'MANAGER' ||
      ADMIN_EMAILS.includes(modeLower) ||
      (perm && perm.isGlobalManager !== undefined
        ? perm.isGlobalManager === true
        : (managersList || []).some((m) => m?.email && m.email.toLowerCase() === modeLower));

    if (!isGlobal) {
      const cdz = CDZ_LIST.find((c) => c?.email && c.email.toLowerCase() === modeLower);
      if (cdz) {
        setFilterChefs([cdz.name]);
        setZChefs([cdz.name]);
      } else {
        setFilterChefs([]);
        setZChefs([]);
      }
      if (perm && Array.isArray(perm.allowedModules) && perm.allowedModules.length > 0) {
        if (!perm.allowedModules.includes(activeTab)) {
          setActiveTab(perm.allowedModules[0] || 'pOverview');
        }
      }
    } else {
      setFilterChefs([]);
      setZChefs([]);
    }
  };

  const [lastMaj, setLastMaj] = useState<string>(() => {
    return storageService.loadLastMaj() || '20/10/2026 18:15';
  });

  // Synchronisation des permissions CDZ et des Managers depuis le serveur
  useEffect(() => {
    storageService.fetchCdzPermissions().then((perms) => {
      if (perms) setCdzPermissions(perms);
    });
    storageService.fetchManagersList().then((mgrs) => {
      if (mgrs) setManagersList(mgrs);
    });
  }, []);

  // Garde-fou automatique : si un utilisateur a des vues restreintes, forcer l'accès uniquement à ses modules autorisés
  useEffect(() => {
    if (!isAdmin && accessMode) {
      const em = accessMode.trim().toLowerCase();
      const perms = cdzPermissions[em] || DEFAULT_CDZ_PERMISSIONS[em];
      if (perms && Array.isArray(perms.allowedModules) && perms.allowedModules.length > 0) {
        if (!perms.allowedModules.includes(activeTab)) {
          setActiveTab(perms.allowedModules[0] || 'pOverview');
        }
      }
    }
  }, [accessMode, isAdmin, cdzPermissions, activeTab]);

  // Chargement exhaustif des données : IndexedDB + Serveur / Cache statique (10 000+ tâches et 7 100+ frigos)
  useEffect(() => {
    async function loadSavedData() {
      try {
        let loadedTasksCount = 0;
        let loadedFrigosCount = 0;

        // 1. Charger depuis le cache local IndexedDB
        const savedTasks = await storageService.loadTasks();
        if (savedTasks && savedTasks.length > 20) {
          setTasks(computeTaskFields(savedTasks));
          loadedTasksCount = savedTasks.length;
        }

        const savedFrigos = await storageService.loadFrigos();
        if (savedFrigos && savedFrigos.frigos && savedFrigos.frigos.length > 20) {
          setFrigoData(savedFrigos);
          loadedFrigosCount = savedFrigos.frigos.length;
        }

        const maj = storageService.loadLastMaj();
        if (maj) setLastMaj(maj);

        // 2. Si le cache local est insuffisant, charger immédiatement les fichiers statiques pré-embarqués
        if (loadedTasksCount < 100) {
          loadTasksFromStaticCsv().then((staticTasks) => {
            if (staticTasks && staticTasks.length > 0) {
              const computed = computeTaskFields(staticTasks);
              setTasks(computed);
              storageService.saveTasks(computed);
            }
          });
        }
        if (loadedFrigosCount < 20) {
          loadFrigosFromStaticCache().then((cachedFrz) => {
            if (cachedFrz && cachedFrz.frigos && cachedFrz.frigos.length > 0) {
              setFrigoData(cachedFrz);
              storageService.saveFrigos(cachedFrz);
            }
          });
        }

        // 3. Synchronisation automatique en arrière-plan depuis le serveur
        const overviewEndpoint = '/api/sync-drive?type=overview';

        fetch(overviewEndpoint)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.tasks && data.tasks.length > 0) {
              const computed = computeTaskFields(data.tasks);
              setTasks(computed);
              storageService.saveTasks(computed);
              if (data.maj) {
                setLastMaj(data.maj);
                storageService.saveLastMaj(data.maj);
              }
            }
          })
          .catch((e) => console.warn('Auto-sync tasks error:', e));

        fetch('/api/sync-drive?type=frigos')
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.frigos && data.frigos.length > 0) {
              const newFrzData = { frigos: data.frigos, maj: data.maj };
              setFrigoData(newFrzData);
              storageService.saveFrigos(newFrzData);
            }
          })
          .catch((e) => console.warn('Auto-sync frigos error:', e));
      } catch (e) {
        console.warn('Erreur chargement données:', e);
      }
    }
    loadSavedData();
  }, []);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [viewingTask, setViewingTask] = useState<TaskItem | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);

  // ==========================================
  // ISOLATION DES DONNÉES PAR ACCÈS (SCOPED DATA)
  // ==========================================
  const managerEmails = useMemo(() => (managersList || []).map((m) => m?.email).filter(Boolean) as string[], [managersList]);

  // Tâches autorisées pour l'utilisateur connecté (Admin & Managers = 100% des tâches)
  const scopedTasks = useMemo(() => {
    if (isManager || isAdmin) return tasks;
    return tasks.filter((t) => isRecordAuthorizedForCdz({
      chefZone: t.chef,
      superviseur: t.superviseur || t.demandeur,
      demandeur: t.demandeur,
      realisePar: t.realisePar,
      repr: t.repr,
      codeClient: t.code
    }, accessMode, cdzPermissions, managerEmails));
  }, [tasks, isManager, isAdmin, accessMode, cdzPermissions, managerEmails]);

  // Frigos autorisés pour l'utilisateur connecté
  const scopedFrigos = useMemo(() => {
    if (isManager || isAdmin) return frigoData.frigos;
    return frigoData.frigos.filter((f) => isRecordAuthorizedForCdz({
      chefZone: f.chefZone,
      superviseur: f.superviseur,
      repr: f.nomRep || f.codeRep,
      codeClient: f.codeClient
    }, accessMode, cdzPermissions, managerEmails));
  }, [frigoData.frigos, isManager, isAdmin, accessMode, cdzPermissions, managerEmails]);

  const scopedFrigoData = useMemo(() => ({
    ...frigoData,
    frigos: scopedFrigos
  }), [frigoData, scopedFrigos]);

  // ==========================================
  // ÉTATS DES FILTRES À CHOIX MULTIPLES
  // ==========================================

  // Overview Filters (Multi-select)
  const [filterChefs, setFilterChefs] = useState<string[]>([]);
  const [filterSuperviseurs, setFilterSuperviseurs] = useState<string[]>([]);
  const [filterCdrs, setFilterCdrs] = useState<string[]>([]);
  const [filterTitres, setFilterTitres] = useState<string[]>([]);
  const [filterEtats, setFilterEtats] = useState<string[]>([]);
  const [filterDemandeurs, setFilterDemandeurs] = useState<string[]>([]);
  const [filterFid, setFilterFid] = useState<string>('');
  const [filterFrom, setFilterFrom] = useState<string>('');
  const [filterTo, setFilterTo] = useState<string>('');
  const [filterCaMin, setFilterCaMin] = useState<string>('');
  const [filterCaMax, setFilterCaMax] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Frigos Filters (Multi-select)
  const [zSerial, setZSerial] = useState<string>('');
  const [zStatuts, setZStatuts] = useState<string[]>([]);
  const [zAnnees, setZAnnees] = useState<string[]>([]);
  const [zContrats, setZContrats] = useState<string[]>([]);
  const [zReps, setZReps] = useState<string[]>([]);
  const [zSups, setZSups] = useState<string[]>([]);
  const [zChefs, setZChefs] = useState<string[]>([]);
  const [zRisques, setZRisques] = useState<string[]>([]);
  const [zActions, setZActions] = useState<string[]>([]);

  // Unique options for Overview filters
  const uniqueChefs = useMemo(() => {
    return Array.from(new Set(scopedTasks.map((t) => t.chef).filter(Boolean))).sort();
  }, [scopedTasks]);

  const uniqueSuperviseurs = useMemo(() => {
    return Array.from(
      new Set(scopedTasks.map((t) => String(t.superviseur || '').trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
  }, [scopedTasks]);

  const uniqueCdrs = useMemo(() => {
    return Array.from(new Set(scopedTasks.map((t) => t.cdr).filter(Boolean))).sort();
  }, [scopedTasks]);

  const uniqueTitres = useMemo(() => {
    return Array.from(new Set(scopedTasks.map((t) => t.titre).filter(Boolean))).sort();
  }, [scopedTasks]);

  const uniqueDemandeurs = useMemo(() => {
    return Array.from(
      new Set(scopedTasks.map((t) => String(t.demandeur || '').trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
  }, [scopedTasks]);

  // Unique options for Frigos
  const uniqueFrzProp = (key: keyof typeof frigoData.frigos[0]) => {
    return Array.from(
      new Set(scopedFrigos.map((f) => String(f[key] || '').trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
  };

  const uniqueFrzStatuts = useMemo(() => uniqueFrzProp('statutFrz'), [scopedFrigos]);
  const uniqueFrzAnnees = useMemo(() => uniqueFrzProp('annee'), [scopedFrigos]);
  const uniqueFrzContrats = useMemo(() => uniqueFrzProp('contrat'), [scopedFrigos]);
  const uniqueFrzReps = useMemo(() => uniqueFrzProp('nomRep'), [scopedFrigos]);
  const uniqueFrzSups = useMemo(() => uniqueFrzProp('superviseur'), [scopedFrigos]);
  const uniqueFrzChefs = useMemo(() => uniqueFrzProp('chefZone'), [scopedFrigos]);
  const uniqueFrzRisques = useMemo(() => uniqueFrzProp('risque'), [scopedFrigos]);
  const uniqueFrzActions = useMemo(() => uniqueFrzProp('actions'), [scopedFrigos]);

  // Reset Filters Handlers
  const handleResetOverview = () => {
    if (isManager || isAdmin) {
      setFilterChefs([]);
    } else {
      const cdz = CDZ_LIST.find((c) => c?.email && c.email.toLowerCase() === (accessMode || '').toLowerCase());
      setFilterChefs(cdz ? [cdz.name] : []);
    }
    setFilterSuperviseurs([]);
    setFilterCdrs([]);
    setFilterTitres([]);
    setFilterEtats([]);
    setFilterDemandeurs([]);
    setFilterFid('');
    setFilterFrom('');
    setFilterTo('');
    setFilterCaMin('');
    setFilterCaMax('');
    setFilterSearch('');
  };

  const handleResetFrigos = () => {
    setZSerial('');
    setZStatuts([]);
    setZAnnees([]);
    setZContrats([]);
    setZReps([]);
    setZSups([]);
    if (isManager || isAdmin) {
      setZChefs([]);
    } else {
      const cdz = CDZ_LIST.find((c) => c?.email && c.email.toLowerCase() === (accessMode || '').toLowerCase());
      setZChefs(cdz ? [cdz.name] : []);
    }
    setZRisques([]);
    setZActions([]);
  };

  // Filtered Tasks (supporte 10 000+ tâches sans les tronquer)
  const filteredTasks = useMemo(() => {
    const q = filterSearch.trim().toLowerCase();
    const filtreClient = filterCaMin !== '' || filterCaMax !== '' || filterFid !== '';

    return scopedTasks.filter((t) => {
      if (filterChefs.length > 0 && !filterChefs.includes(t.chef)) return false;
      if (filterSuperviseurs.length > 0 && !filterSuperviseurs.includes(String(t.superviseur || '').trim())) return false;
      if (filterCdrs.length > 0 && !filterCdrs.includes(t.cdr)) return false;
      if (filterTitres.length > 0 && !filterTitres.includes(t.titre)) return false;
      if (filterEtats.length > 0 && !filterEtats.includes(t.etat || '')) return false;
      if (filterDemandeurs.length > 0 && !filterDemandeurs.includes(String(t.demandeur || '').trim())) return false;
      if (filterFrom && !(t.echeance && t.echeance >= filterFrom)) return false;
      if (filterTo && !(t.echeance && t.echeance <= filterTo)) return false;

      if (filtreClient) {
        if (!t.trouve) return false;
        if (filterCaMin !== '' && !(t.ca26 >= +filterCaMin)) return false;
        if (filterCaMax !== '' && !(t.ca26 <= +filterCaMax)) return false;
        if (filterFid === 'oui' && !t.inscrit) return false;
        if (filterFid === 'non' && t.inscrit) return false;
      }

      if (
        q &&
        ![t.code, t.clientNom, t.titre, t.chef, t.cdr, t.repr, t.demandeur, t.realisePar, t.desc, t.id]
          .join(' ')
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }

      return true;
    });
  }, [
    scopedTasks,
    filterChefs,
    filterSuperviseurs,
    filterCdrs,
    filterTitres,
    filterEtats,
    filterDemandeurs,
    filterFrom,
    filterTo,
    filterCaMin,
    filterCaMax,
    filterFid,
    filterSearch
  ]);

  // Active filters count badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeTab === 'pOverview') {
      count += filterChefs.length;
      count += filterSuperviseurs.length;
      count += filterCdrs.length;
      count += filterTitres.length;
      count += filterEtats.length;
      count += filterDemandeurs.length;
      if (filterFid) count++;
      if (filterFrom) count++;
      if (filterTo) count++;
      if (filterCaMin) count++;
      if (filterCaMax) count++;
      if (filterSearch) count++;
    } else if (activeTab === 'pFrigos') {
      if (zSerial) count++;
      count += zStatuts.length;
      count += zAnnees.length;
      count += zContrats.length;
      count += zReps.length;
      count += zSups.length;
      count += zChefs.length;
      count += zRisques.length;
      count += zActions.length;
    }
    return count;
  }, [
    activeTab, filterChefs, filterSuperviseurs, filterCdrs, filterTitres, filterEtats, filterDemandeurs, filterFid,
    filterFrom, filterTo, filterCaMin, filterCaMax, filterSearch,
    zSerial, zStatuts, zAnnees, zContrats, zReps, zSups, zChefs, zRisques, zActions
  ]);

  // Consultation modal handler
  const handleConsultTask = (task: TaskItem) => {
    setViewingTask(task);
    setIsTaskModalOpen(true);
  };

  const [isSyncingDrive, setIsSyncingDrive] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const updateLastMaj = () => {
    const now = new Date();
    const z = (n: number) => ('0' + n).slice(-2);
    const dateStr = `${z(now.getDate())}/${z(now.getMonth() + 1)}/${now.getFullYear()} ${z(now.getHours())}:${z(now.getMinutes())}`;
    setLastMaj(dateStr);
    storageService.saveLastMaj(dateStr);
  };

  const handleRefresh = async () => {
    setIsSyncingDrive(true);
    setSyncFeedback(null);
    try {
      let endpoint = '/api/sync-drive?type=frigos';

      if (activeTab === 'pOverview') {
        const storedTasksId = storageService.loadTasksFileId();
        endpoint = storedTasksId
          ? `/api/sync-drive?type=overview&tasksFileId=${encodeURIComponent(storedTasksId)}`
          : '/api/sync-drive?type=overview';
      }

      const res = await fetch(endpoint);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la lecture des données.');
      }

      if (data.type === 'tasks' && data.tasks) {
        const computed = computeTaskFields(data.tasks);
        setTasks(computed);
        await storageService.saveTasks(computed);
        setSyncFeedback({
          type: 'success',
          message: `Synchronisation réussie : ${data.tasks.length.toLocaleString('fr-FR')} tâches chargées.`
        });
      } else if (data.type === 'frigos' && data.frigos) {
        const newFrzData = { frigos: data.frigos, maj: data.maj };
        setFrigoData(newFrzData);
        await storageService.saveFrigos(newFrzData);
        setSyncFeedback({
          type: 'success',
          message: `Synchronisation réussie : ${data.frigos.length.toLocaleString('fr-FR')} frigos chargés.`
        });
      }

      if (data.maj) {
        setLastMaj(data.maj);
        storageService.saveLastMaj(data.maj);
      }

      setTimeout(() => setSyncFeedback(null), 8000);
    } catch (err: any) {
      updateLastMaj();
      setSyncFeedback({
        type: 'error',
        message: `Mise à jour : ${err.message}`
      });
      setTimeout(() => setSyncFeedback(null), 10000);
    } finally {
      setIsSyncingDrive(false);
    }
  };

  // Export handler
  const handleExport = () => {
    if (activeTab === 'pOverview') {
      exportTasksExcel(filteredTasks);
    } else if (activeTab === 'pFrigos') {
      const q = zSerial.trim().toLowerCase();
      const filtered = scopedFrigos.filter((f) => {
        if (q && !String(f.serial).toLowerCase().includes(q)) return false;
        if (zStatuts.length > 0 && !zStatuts.includes(f.statutFrz)) return false;
        if (zAnnees.length > 0 && !zAnnees.includes(f.annee)) return false;
        if (zContrats.length > 0 && !zContrats.includes(f.contrat)) return false;
        if (zReps.length > 0 && !zReps.includes(f.nomRep)) return false;
        if (zSups.length > 0 && !zSups.includes(f.superviseur)) return false;
        if (zChefs.length > 0 && !zChefs.includes(f.chefZone)) return false;
        if (zRisques.length > 0 && !zRisques.includes(f.risque)) return false;
        if (zActions.length > 0 && !zActions.includes(f.actions)) return false;
        return true;
      });
      exportFrigosExcel(filtered);
    }
  };

  // --- ÉCRAN DE LOGIN : si aucun email saisi ---
  const handleLogin = (email: string) => {
    handleAccessModeChange(email);
  };

  const checkIsKnownEmail = (email: string): boolean => {
    const lower = (email || '').toLowerCase().trim();
    if (!lower) return false;
    if (ADMIN_EMAILS.includes(lower)) return true;
    if ((managersList || []).some((m) => m?.email && m.email.toLowerCase() === lower)) return true;
    if (CDZ_LIST.some((c) => c?.email && c.email.toLowerCase() === lower)) return true;
    if (cdzPermissions && cdzPermissions[lower]) return true;
    if (ALL_COLLABORATORS.some((c) => c?.email && c.email.toLowerCase() === lower)) return true;
    return lower.includes('@');
  };

  if (!accessMode) {
    return (
      <LoginScreen
        onLoginSuccess={handleLogin}
        checkIsKnownEmail={checkIsKnownEmail}
      />
    );
  }

  // --- ACCÈS REFUSÉ (très rare, seulement si format invalide) ---
  if (!isAuthorized) {
    return (
      <AccessDeniedScreen
        currentEmail={accessMode}
        onSwitchEmail={() => {
          storageService.saveAccessMode('');
          setAccessMode('');
        }}
        managersList={managersList}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/70 to-indigo-50/50 text-[#14213D] font-sans antialiased p-2.5 sm:p-5 pb-24 md:pb-8">
      {/* Notification de mise à jour */}
      <UpdateNotificationBanner
        hasUpdate={hasUpdate}
        onApplyUpdate={applyUpdate}
        onDismiss={dismissUpdate}
      />

      <div className="max-w-[1600px] mx-auto">
        {/* Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          accessMode={accessMode}
          onAccessModeChange={handleAccessModeChange}
          managersList={managersList}
          allowedModules={
            (() => {
              if (isAdmin) return undefined;
              const em = (accessMode || '').trim().toLowerCase();
              const perm = cdzPermissions[em] || DEFAULT_CDZ_PERMISSIONS[em];
              if (perm && Array.isArray(perm.allowedModules)) {
                return perm.allowedModules;
              }
              if (isGlobalUser) return undefined;
              return ['pOverview', 'pFrigos'];
            })()
          }
          lastMaj={lastMaj}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onOpenInstallModal={isAdmin ? () => setIsInstallModalOpen(true) : undefined}
          onOpenAccessControl={isAdmin ? () => setIsAccessModalOpen(true) : undefined}
          onOpenAppSheetLinks={isAdmin ? () => setIsAppSheetLinksOpen(true) : undefined}
          isAutonome={true}
          isRefreshing={isSyncingDrive}
          hasUpdate={hasUpdate}
          onApplyUpdate={applyUpdate}
          isAdmin={isAdmin}
          canExport={canExport}
          onLogout={() => {
            storageService.saveAccessMode('');
            setAccessMode('');
          }}
        />

        {/* Feedback notification */}
        {syncFeedback && (
          <div
            className={`mb-3 p-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs ${
              syncFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold shrink-0">{syncFeedback.type === 'success' ? 'Synchronisation :' : 'Information :'}</span>
              <span className="truncate">{syncFeedback.message}</span>
            </div>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-slate-400 hover:text-slate-700 font-bold px-1 text-sm cursor-pointer shrink-0"
            >
              ×
            </button>
          </div>
        )}

        {/* Mobile Filter Toggle Drawer */}
        <div className="lg:hidden mb-3">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-xs text-xs font-semibold text-slate-800 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold">Filtres de recherche</span>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs">
              <span>{isMobileFiltersOpen ? 'Masquer' : 'Modifier les filtres'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileFiltersOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {isMobileFiltersOpen && (
            <div className="mt-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <Sidebar
                activeTab={activeTab}
                filterChefs={filterChefs}
                setFilterChefs={setFilterChefs}
                uniqueChefs={uniqueChefs}
                filterSuperviseurs={filterSuperviseurs}
                setFilterSuperviseurs={setFilterSuperviseurs}
                uniqueSuperviseurs={uniqueSuperviseurs}
                filterCdrs={filterCdrs}
                setFilterCdrs={setFilterCdrs}
                uniqueCdrs={uniqueCdrs}
                filterTitres={filterTitres}
                setFilterTitres={setFilterTitres}
                uniqueTitres={uniqueTitres}
                filterEtats={filterEtats}
                setFilterEtats={setFilterEtats}
                filterDemandeurs={filterDemandeurs}
                setFilterDemandeurs={setFilterDemandeurs}
                uniqueDemandeurs={uniqueDemandeurs}
                filterFid={filterFid}
                setFilterFid={setFilterFid}
                filterFrom={filterFrom}
                setFilterFrom={setFilterFrom}
                filterTo={filterTo}
                setFilterTo={setFilterTo}
                filterCaMin={filterCaMin}
                setFilterCaMin={setFilterCaMin}
                filterCaMax={filterCaMax}
                setFilterCaMax={setFilterCaMax}
                filterSearch={filterSearch}
                setFilterSearch={setFilterSearch}
                onResetOverview={handleResetOverview}
                zSerial={zSerial}
                setZSerial={setZSerial}
                zStatuts={zStatuts}
                setZStatuts={setZStatuts}
                uniqueFrzStatuts={uniqueFrzStatuts}
                zAnnees={zAnnees}
                setZAnnees={setZAnnees}
                uniqueFrzAnnees={uniqueFrzAnnees}
                zContrats={zContrats}
                setZContrats={setZContrats}
                uniqueFrzContrats={uniqueFrzContrats}
                zReps={zReps}
                setZReps={setZReps}
                uniqueFrzReps={uniqueFrzReps}
                zSups={zSups}
                setZSups={setZSups}
                uniqueFrzSups={uniqueFrzSups}
                zChefs={zChefs}
                setZChefs={setZChefs}
                uniqueFrzChefs={uniqueFrzChefs}
                zRisques={zRisques}
                setZRisques={setZRisques}
                uniqueFrzRisques={uniqueFrzRisques}
                zActions={zActions}
                setZActions={setZActions}
                uniqueFrzActions={uniqueFrzActions}
                onResetFrigos={handleResetFrigos}
              />
            </div>
          )}
        </div>

        {/* Layout: Sidebar + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar
              activeTab={activeTab}
              filterChefs={filterChefs}
              setFilterChefs={setFilterChefs}
              uniqueChefs={uniqueChefs}
              filterSuperviseurs={filterSuperviseurs}
              setFilterSuperviseurs={setFilterSuperviseurs}
              uniqueSuperviseurs={uniqueSuperviseurs}
              filterCdrs={filterCdrs}
              setFilterCdrs={setFilterCdrs}
              uniqueCdrs={uniqueCdrs}
              filterTitres={filterTitres}
              setFilterTitres={setFilterTitres}
              uniqueTitres={uniqueTitres}
              filterEtats={filterEtats}
              setFilterEtats={setFilterEtats}
              filterDemandeurs={filterDemandeurs}
              setFilterDemandeurs={setFilterDemandeurs}
              uniqueDemandeurs={uniqueDemandeurs}
              filterFid={filterFid}
              setFilterFid={setFilterFid}
              filterFrom={filterFrom}
              setFilterFrom={setFilterFrom}
              filterTo={filterTo}
              setFilterTo={setFilterTo}
              filterCaMin={filterCaMin}
              setFilterCaMin={setFilterCaMin}
              filterCaMax={filterCaMax}
              setFilterCaMax={setFilterCaMax}
              filterSearch={filterSearch}
              setFilterSearch={setFilterSearch}
              onResetOverview={handleResetOverview}
              zSerial={zSerial}
              setZSerial={setZSerial}
              zStatuts={zStatuts}
              setZStatuts={setZStatuts}
              uniqueFrzStatuts={uniqueFrzStatuts}
              zAnnees={zAnnees}
              setZAnnees={setZAnnees}
              uniqueFrzAnnees={uniqueFrzAnnees}
              zContrats={zContrats}
              setZContrats={setZContrats}
              uniqueFrzContrats={uniqueFrzContrats}
              zReps={zReps}
              setZReps={setZReps}
              uniqueFrzReps={uniqueFrzReps}
              zSups={zSups}
              setZSups={setZSups}
              uniqueFrzSups={uniqueFrzSups}
              zChefs={zChefs}
              setZChefs={setZChefs}
              uniqueFrzChefs={uniqueFrzChefs}
              zRisques={zRisques}
              setZRisques={setZRisques}
              uniqueFrzRisques={uniqueFrzRisques}
              zActions={zActions}
              setZActions={setZActions}
              uniqueFrzActions={uniqueFrzActions}
              onResetFrigos={handleResetFrigos}
            />
          </div>

          {/* Main Content Area */}
          <main className="min-w-0">
            {activeTab === 'pOverview' && (
              <OverviewTab
                tasks={filteredTasks}
                allTasksCount={scopedTasks.length}
                onConsultTask={handleConsultTask}
              />
            )}

            {activeTab === 'pFrigos' && (
              <FrigosTab
                frigoData={scopedFrigoData}
                zSerial={zSerial}
                zStatuts={zStatuts}
                zAnnees={zAnnees}
                zContrats={zContrats}
                zReps={zReps}
                zSups={zSups}
                zChefs={zChefs}
                zRisques={zRisques}
                zActions={zActions}
              />
            )}
          </main>
        </div>

        {/* Modals */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setViewingTask(null);
          }}
          task={viewingTask}
        />

        {/* Liens d'Intégration AppSheet */}
        <AppSheetLinksModal
          isOpen={isAppSheetLinksOpen}
          onClose={() => setIsAppSheetLinksOpen(false)}
        />

        {/* PWA / Mobile Install Modal */}
        <PWAInstallModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />

        {/* Modal de Gestion des Accès et Permissions par CDZ */}
        <AccessControlModal
          isOpen={isAccessModalOpen}
          onClose={() => setIsAccessModalOpen(false)}
          permissions={cdzPermissions}
          onSavePermissions={handleSaveCdzPermissions}
          currentAccessMode={accessMode}
          onSelectAccessMode={handleAccessModeChange}
          managersList={managersList}
          onSaveManagersList={handleSaveManagersList}
        />
      </div>
    </div>
  );
}
