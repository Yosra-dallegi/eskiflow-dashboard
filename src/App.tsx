import React, { useState, useMemo, useEffect } from 'react';
import { Mic, SlidersHorizontal, ChevronDown, Filter } from 'lucide-react';
import { TaskItem, RealisationData, FrigoData, VisiteItem } from './types/task';
import { INITIAL_TASKS, INITIAL_REALISATION, INITIAL_FRIGOS } from './data/mockData';
import { INITIAL_VISITES } from './data/visitesData';
import { CDZ_LIST, CdzPermissions, DEFAULT_CDZ_PERMISSIONS, isModuleAllowed, getAuthorizedTeamEmails } from './data/cdzHierarchy';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OverviewTab } from './components/OverviewTab';
import { RealisationTab } from './components/RealisationTab';
import { FrigosTab } from './components/FrigosTab';
import { VisitesTab } from './components/VisitesTab';
import { AccessControlModal } from './components/AccessControlModal';
import { TaskModal } from './components/TaskModal';
import { ExcelSyncModal } from './components/ExcelSyncModal';
import { VoiceFilterModal } from './components/VoiceFilterModal';
import { VoiceFilterBanner } from './components/VoiceFilterBanner';
import { PWAInstallModal } from './components/PWAInstallModal';
import { VoiceParsedResult } from './services/voiceParser';
import { exportTasksExcel, exportRealisationExcel, exportFrigosExcel, exportVisitesExcel } from './services/exportService';
import { storageService } from './services/storageService';
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
    const chef = t.chef ? t.chef.trim() : SANS_CHEF;
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
      ecart
    };
  });
}

export default function App() {
  const { hasUpdate, applyUpdate, dismissUpdate } = useAppUpdate();
  const [activeTab, setActiveTab] = useState<'pOverview' | 'pMonth' | 'pFrigos' | 'pVisites'>('pOverview');

  // Datasets loaded from memory / demo, then hydrated from IndexedDB
  const [tasks, setTasks] = useState<TaskItem[]>(() => computeTaskFields(INITIAL_TASKS));
  const [realisation, setRealisation] = useState<RealisationData>(INITIAL_REALISATION);
  const [frigoData, setFrigoData] = useState<FrigoData>(INITIAL_FRIGOS);
  const [visites, setVisites] = useState<VisiteItem[]>(INITIAL_VISITES);

  // Mode d'accès : 'MANAGER' (tout voir) ou email d'un CDZ (voir son équipe)
  const [accessMode, setAccessMode] = useState<string>(() => storageService.loadAccessMode() || 'MANAGER');
  
  // Permissions par CDZ (modules autorisés & collaborateurs visibles)
  const [cdzPermissions, setCdzPermissions] = useState<Record<string, CdzPermissions>>(() => {
    return storageService.loadCdzPermissions() || DEFAULT_CDZ_PERMISSIONS;
  });

  const [isAccessModalOpen, setIsAccessModalOpen] = useState<boolean>(false);

  const handleSaveCdzPermissions = (updated: Record<string, CdzPermissions>) => {
    setCdzPermissions(updated);
    storageService.saveCdzPermissions(updated);
  };

  const handleAccessModeChange = (mode: string) => {
    setAccessMode(mode);
    storageService.saveAccessMode(mode);
    if (mode !== 'MANAGER') {
      const cdz = CDZ_LIST.find((c) => c.email.toLowerCase() === mode.toLowerCase());
      if (cdz) {
        setFilterChef(cdz.name);
        setZChef(cdz.name);
      }
      // Si l'onglet actuel n'est pas autorisé pour ce CDZ, basculer sur son 1er module autorisé
      const perms = cdzPermissions[mode.toLowerCase()] || DEFAULT_CDZ_PERMISSIONS[mode.toLowerCase()];
      if (perms && !perms.allowedModules.includes(activeTab)) {
        setActiveTab(perms.allowedModules[0] || 'pOverview');
      }
    } else {
      setFilterChef('');
      setZChef('');
    }
  };

  const [lastMaj, setLastMaj] = useState<string>(() => {
    return storageService.loadLastMaj() || '20/10/2026 18:15';
  });

  // Hydrate from IndexedDB on startup & auto-fetch full dataset if empty or mock
  useEffect(() => {
    async function loadSavedData() {
      try {
        let hasTasks = false;
        let hasFrigos = false;

        const savedTasks = await storageService.loadTasks();
        if (savedTasks && savedTasks.length > 20) {
          setTasks(computeTaskFields(savedTasks));
          hasTasks = true;
        }

        const savedReal = await storageService.loadRealisation();
        if (savedReal && savedReal.rows && savedReal.rows.length > 0) {
          setRealisation(savedReal);
        }

        const savedFrigos = await storageService.loadFrigos();
        if (savedFrigos && savedFrigos.frigos && savedFrigos.frigos.length > 20) {
          setFrigoData(savedFrigos);
          hasFrigos = true;
        }

        const savedVisites = await storageService.loadVisites();
        if (savedVisites && savedVisites.length > 0) {
          setVisites(savedVisites);
        }

        const maj = storageService.loadLastMaj();
        if (maj) setLastMaj(maj);

        // Auto-fetch real reconciled datasets if not yet in cache
        if (!hasTasks) {
          fetch('/api/sync-drive?type=overview')
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
        }

        if (!hasFrigos) {
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
        }
      } catch (e) {
        console.warn('Erreur chargement IndexedDB:', e);
      }
    }
    loadSavedData();
  }, []);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [viewingTask, setViewingTask] = useState<TaskItem | null>(null);
  const [isExcelSyncOpen, setIsExcelSyncOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);
  const [activeVoiceFilter, setActiveVoiceFilter] = useState<VoiceParsedResult | null>(null);

  // Overview Filters
  const [filterChef, setFilterChef] = useState<string>('');
  const [filterCdr, setFilterCdr] = useState<string>('');
  const [filterTitre, setFilterTitre] = useState<string>('');
  const [filterEtat, setFilterEtat] = useState<string>('');
  const [filterFid, setFilterFid] = useState<string>('');
  const [filterFrom, setFilterFrom] = useState<string>('');
  const [filterTo, setFilterTo] = useState<string>('');
  const [filterCaMin, setFilterCaMin] = useState<string>('');
  const [filterCaMax, setFilterCaMax] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Realisation Filters
  const [rMois, setRMois] = useState<string>('');
  const [rPref, setRPref] = useState<string>('');
  const [rSearch, setRSearch] = useState<string>('');

  // Frigos Filters
  const [zSerial, setZSerial] = useState<string>('');
  const [zStatut, setZStatut] = useState<string>('');
  const [zAnnee, setZAnnee] = useState<string>('');
  const [zContrat, setZContrat] = useState<string>('');
  const [zRep, setZRep] = useState<string>('');
  const [zSup, setZSup] = useState<string>('');
  const [zChef, setZChef] = useState<string>('');
  const [zRisque, setZRisque] = useState<string>('');
  const [zAction, setZAction] = useState<string>('');

  // Unique options for Overview filters
  const uniqueChefs = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.chef).filter(Boolean))).sort();
  }, [tasks]);

  const uniqueCdrs = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.cdr).filter(Boolean))).sort();
  }, [tasks]);

  const uniqueTitres = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.titre).filter(Boolean))).sort();
  }, [tasks]);

  // Unique options for Realisation
  const MOIS_NAMES = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const uniqueMois = useMemo(() => {
    const rawMois = Array.from(new Set(realisation.rows.map((r) => r[1]))).sort((a, b) => a - b);
    return rawMois.map((m) => ({
      val: m,
      label: m >= 1 && m <= 12 ? MOIS_NAMES[m - 1] : 'Sans mois'
    }));
  }, [realisation]);

  const uniquePrefs = useMemo(() => {
    return Array.from(new Set(realisation.rows.map((r) => r[2] || '-'))).sort();
  }, [realisation]);

  // Unique options for Frigos
  const uniqueFrzProp = (key: keyof typeof frigoData.frigos[0]) => {
    return Array.from(
      new Set(frigoData.frigos.map((f) => String(f[key] || '').trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
  };

  const uniqueFrzStatuts = useMemo(() => uniqueFrzProp('statutFrz'), [frigoData]);
  const uniqueFrzAnnees = useMemo(() => uniqueFrzProp('annee'), [frigoData]);
  const uniqueFrzContrats = useMemo(() => uniqueFrzProp('contrat'), [frigoData]);
  const uniqueFrzReps = useMemo(() => uniqueFrzProp('nomRep'), [frigoData]);
  const uniqueFrzSups = useMemo(() => uniqueFrzProp('superviseur'), [frigoData]);
  const uniqueFrzChefs = useMemo(() => uniqueFrzProp('chefZone'), [frigoData]);
  const uniqueFrzRisques = useMemo(() => uniqueFrzProp('risque'), [frigoData]);
  const uniqueFrzActions = useMemo(() => uniqueFrzProp('actions'), [frigoData]);

  // Client references for task creation
  const existingClients = useMemo(() => {
    const map = new Map<string, { code: string; nom: string; chef: string; cdr: string; repr: string; lat: number; lng: number }>();
    tasks.forEach((t) => {
      if (t.trouve && t.code && !map.has(t.code)) {
        map.set(t.code, {
          code: t.code,
          nom: t.clientNom || t.code,
          chef: t.chef !== SANS_CHEF ? t.chef : '',
          cdr: t.cdr,
          repr: t.repr,
          lat: t.lat,
          lng: t.lng
        });
      }
    });
    return Array.from(map.values());
  }, [tasks]);

  // Filtered tasks for Overview
  const filteredTasks = useMemo(() => {
    const q = filterSearch.trim().toLowerCase();
    const filtreClient = filterCaMin !== '' || filterCaMax !== '' || filterFid !== '';

    return tasks.filter((t) => {
      if (filterChef && t.chef !== filterChef) return false;
      if (filterCdr && t.cdr !== filterCdr) return false;
      if (filterTitre && t.titre !== filterTitre) return false;
      if (filterEtat && t.etat !== filterEtat) return false;
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
    tasks,
    filterChef,
    filterCdr,
    filterTitre,
    filterEtat,
    filterFid,
    filterFrom,
    filterTo,
    filterCaMin,
    filterCaMax,
    filterSearch
  ]);

  // Handlers for Reset
  const handleResetOverview = () => {
    setFilterChef('');
    setFilterCdr('');
    setFilterTitre('');
    setFilterEtat('');
    setFilterFid('');
    setFilterFrom('');
    setFilterTo('');
    setFilterCaMin('');
    setFilterCaMax('');
    setFilterSearch('');
    setActiveVoiceFilter(null);
  };

  // Voice filter handlers
  const handleApplyVoiceFilters = (result: VoiceParsedResult) => {
    setActiveVoiceFilter(result);

    if (result.isReset) {
      handleResetOverview();
      return;
    }

    if (result.etat !== undefined) {
      setFilterEtat(result.etat);
    }
    if (result.chef !== undefined) {
      setFilterChef(result.chef);
    }
    if (result.cdr !== undefined) {
      setFilterCdr(result.cdr);
    }
    if (result.titre !== undefined) {
      setFilterTitre(result.titre);
    }
    if (result.fid !== undefined) {
      setFilterFid(result.fid);
    }
    if (result.search !== undefined) {
      setFilterSearch(result.search);
    }

    if (activeTab !== 'pOverview') {
      setActiveTab('pOverview');
    }
  };

  const handleClearVoiceFilter = () => {
    setActiveVoiceFilter(null);
    handleResetOverview();
  };

  const handleResetReal = () => {
    setRMois('');
    setRPref('');
    setRSearch('');
  };

  const handleResetFrigos = () => {
    setZSerial('');
    setZStatut('');
    setZAnnee('');
    setZContrat('');
    setZRep('');
    setZSup('');
    setZChef('');
    setZRisque('');
    setZAction('');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeTab === 'pOverview') {
      if (filterChef) count++;
      if (filterCdr) count++;
      if (filterTitre) count++;
      if (filterEtat) count++;
      if (filterFid) count++;
      if (filterFrom) count++;
      if (filterTo) count++;
      if (filterCaMin) count++;
      if (filterCaMax) count++;
      if (filterSearch) count++;
    } else if (activeTab === 'pMonth') {
      if (rMois) count++;
      if (rPref) count++;
      if (rSearch) count++;
    } else if (activeTab === 'pFrigos') {
      if (zSerial) count++;
      if (zStatut) count++;
      if (zAnnee) count++;
      if (zContrat) count++;
      if (zRep) count++;
      if (zSup) count++;
      if (zChef) count++;
      if (zRisque) count++;
      if (zAction) count++;
    }
    return count;
  }, [
    activeTab, filterChef, filterCdr, filterTitre, filterEtat, filterFid,
    filterFrom, filterTo, filterCaMin, filterCaMax, filterSearch,
    rMois, rPref, rSearch,
    zSerial, zStatut, zAnnee, zContrat, zRep, zSup, zChef, zRisque, zAction
  ]);

  // Consultation modal handler
  const handleConsultTask = (task: TaskItem) => {
    setViewingTask(task);
    setIsTaskModalOpen(true);
  };

  // Autonomous Excel Updates
  const handleUpdateTasksFromExcel = (newTasks: TaskItem[]) => {
    const computed = computeTaskFields(newTasks);
    setTasks(computed);
    storageService.saveTasks(computed);
    updateLastMaj();
  };

  const handleUpdateRealisationFromExcel = (newReal: RealisationData) => {
    setRealisation(newReal);
    storageService.saveRealisation(newReal);
    updateLastMaj();
  };

  const handleUpdateFrigosFromExcel = (newFrz: FrigoData) => {
    setFrigoData(newFrz);
    storageService.saveFrigos(newFrz);
    updateLastMaj();
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
      let tabLabel = 'Frigos';

      if (activeTab === 'pOverview') {
        const storedTasksId = storageService.loadTasksFileId();
        endpoint = storedTasksId
          ? `/api/sync-drive?type=overview&tasksFileId=${encodeURIComponent(storedTasksId)}`
          : '/api/sync-drive?type=overview';
        tabLabel = 'Tâches & Clients';
      } else if (activeTab === 'pMonth') {
        endpoint = '/api/sync-drive?type=realisation';
        tabLabel = 'Réalisation Ventes';
      }

      const res = await fetch(endpoint);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la lecture du fichier Google Drive.');
      }

      if (data.type === 'tasks' && data.tasks) {
        const computed = computeTaskFields(data.tasks);
        setTasks(computed);
        await storageService.saveTasks(computed);
        setSyncFeedback({
          type: 'success',
          message: `Synchronisation Google Drive réussie : ${data.tasks.length} tâches et ${data.clientsCount} clients chargés en direct depuis Drive.`
        });
      } else if (data.type === 'frigos' && data.frigos) {
        const newFrzData = { frigos: data.frigos, maj: data.maj };
        setFrigoData(newFrzData);
        await storageService.saveFrigos(newFrzData);
        setSyncFeedback({
          type: 'success',
          message: `Synchronisation Google Drive réussie : ${data.frigos.length.toLocaleString('fr-FR')} frigos chargés depuis la feuille "${data.sheet}".`
        });
      } else if (data.type === 'realisation' && data.realisation) {
        setRealisation(data.realisation);
        await storageService.saveRealisation(data.realisation);
        setSyncFeedback({
          type: 'success',
          message: `Synchronisation Google Drive réussie : ${data.realisation.rows.length} lignes de ventes sell-out chargées depuis Drive.`
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
        message: `Mise à jour en direct depuis Google Drive : ${err.message}`
      });
      setTimeout(() => setSyncFeedback(null), 10000);
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const handleResetToDemo = () => {
    storageService.clearAll();
    const initialT = computeTaskFields(INITIAL_TASKS);
    setTasks(initialT);
    setRealisation(INITIAL_REALISATION);
    setFrigoData(INITIAL_FRIGOS);
    const defaultDate = '20/10/2026 18:15';
    setLastMaj(defaultDate);
    storageService.saveLastMaj(defaultDate);
    setIsExcelSyncOpen(false);
  };

  // Export handler
  const handleExport = () => {
    if (activeTab === 'pOverview') {
      exportTasksExcel(filteredTasks);
    } else if (activeTab === 'pVisites') {
      exportVisitesExcel(visites);
    } else if (activeTab === 'pMonth') {
      const q = rSearch.trim().toLowerCase();
      const base = realisation.rows.filter((r) => {
        const code = r[0];
        const nom = realisation.noms[code] || '';
        const pref = r[2] || '-';
        if (rPref && pref !== rPref) return false;
        if (q && !(code + ' ' + nom).toLowerCase().includes(q)) return false;
        return true;
      });
      const rows = rMois ? base.filter((r) => String(r[1]) === rMois) : base;
      const m: Record<string, number> = {};
      rows.forEach((r) => {
        m[r[0]] = (m[r[0]] || 0) + r[3];
      });
      const rList = Object.keys(m)
        .map((c) => ({ code: c, nom: realisation.noms[c] || '', ht: m[c] }))
        .sort((a, b) => b.ht - a.ht);
      exportRealisationExcel(rList);
    } else if (activeTab === 'pFrigos') {
      const q = zSerial.trim().toLowerCase();
      const filtered = frigoData.frigos.filter((f) => {
        if (q && !String(f.serial).toLowerCase().includes(q)) return false;
        if (zStatut && f.statutFrz !== zStatut) return false;
        if (zAnnee && f.annee !== zAnnee) return false;
        if (zContrat && f.contrat !== zContrat) return false;
        if (zRep && f.nomRep !== zRep) return false;
        if (zSup && f.superviseur !== zSup) return false;
        if (zChef && f.chefZone !== zChef) return false;
        if (zRisque && f.risque !== zRisque) return false;
        if (zAction && f.actions !== zAction) return false;
        return true;
      });
      exportFrigosExcel(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8EEF7] text-[#14213D] font-sans antialiased p-2.5 sm:p-5 pb-24 md:pb-8">
      {/* Bannière lumineuse de mise à jour si une nouvelle version est prête */}
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
          allowedModules={
            accessMode !== 'MANAGER'
              ? (cdzPermissions[accessMode.toLowerCase()] || DEFAULT_CDZ_PERMISSIONS[accessMode.toLowerCase()])?.allowedModules
              : undefined
          }
          lastMaj={lastMaj}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onOpenExcelSync={() => setIsExcelSyncOpen(true)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          onOpenAccessControl={() => setIsAccessModalOpen(true)}
          isAutonome={true}
          isRefreshing={isSyncingDrive}
          hasUpdate={hasUpdate}
          onApplyUpdate={applyUpdate}
        />

        {/* Sync feedback notification */}
        {syncFeedback && (
          <div
            className={`mb-3 p-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs ${
              syncFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold shrink-0">{syncFeedback.type === 'success' ? 'Drive :' : 'Information :'}</span>
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

        {/* Mobile Filter Toggle Drawer (évite de devoir scroller 15 menus sur smartphone) */}
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
                filterChef={filterChef}
                setFilterChef={setFilterChef}
                uniqueChefs={uniqueChefs}
                filterCdr={filterCdr}
                setFilterCdr={setFilterCdr}
                uniqueCdrs={uniqueCdrs}
                filterTitre={filterTitre}
                setFilterTitre={setFilterTitre}
                uniqueTitres={uniqueTitres}
                filterEtat={filterEtat}
                setFilterEtat={setFilterEtat}
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
                rMois={rMois}
                setRMois={setRMois}
                uniqueMois={uniqueMois}
                rPref={rPref}
                setRPref={setRPref}
                uniquePrefs={uniquePrefs}
                rSearch={rSearch}
                setRSearch={setRSearch}
                onResetReal={handleResetReal}
                zSerial={zSerial}
                setZSerial={setZSerial}
                zStatut={zStatut}
                setZStatut={setZStatut}
                uniqueFrzStatuts={uniqueFrzStatuts}
                zAnnee={zAnnee}
                setZAnnee={setZAnnee}
                uniqueFrzAnnees={uniqueFrzAnnees}
                zContrat={zContrat}
                setZContrat={setZContrat}
                uniqueFrzContrats={uniqueFrzContrats}
                zRep={zRep}
                setZRep={setZRep}
                uniqueFrzReps={uniqueFrzReps}
                zSup={zSup}
                setZSup={setZSup}
                uniqueFrzSups={uniqueFrzSups}
                zChef={zChef}
                setZChef={setZChef}
                uniqueFrzChefs={uniqueFrzChefs}
                zRisque={zRisque}
                setZRisque={setZRisque}
                uniqueFrzRisques={uniqueFrzRisques}
                zAction={zAction}
                setZAction={setZAction}
                uniqueFrzActions={uniqueFrzActions}
                onResetFrigos={handleResetFrigos}
              />
            </div>
          )}
        </div>

        {/* Layout: Sidebar + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start">
          {/* Desktop Sidebar (visible sur grand écran) */}
          <div className="hidden lg:block">
            <Sidebar
              activeTab={activeTab}
              filterChef={filterChef}
              setFilterChef={setFilterChef}
              uniqueChefs={uniqueChefs}
              filterCdr={filterCdr}
              setFilterCdr={setFilterCdr}
              uniqueCdrs={uniqueCdrs}
              filterTitre={filterTitre}
              setFilterTitre={setFilterTitre}
              uniqueTitres={uniqueTitres}
              filterEtat={filterEtat}
              setFilterEtat={setFilterEtat}
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
              rMois={rMois}
              setRMois={setRMois}
              uniqueMois={uniqueMois}
              rPref={rPref}
              setRPref={setRPref}
              uniquePrefs={uniquePrefs}
              rSearch={rSearch}
              setRSearch={setRSearch}
              onResetReal={handleResetReal}
              zSerial={zSerial}
              setZSerial={setZSerial}
              zStatut={zStatut}
              setZStatut={setZStatut}
              uniqueFrzStatuts={uniqueFrzStatuts}
              zAnnee={zAnnee}
              setZAnnee={setZAnnee}
              uniqueFrzAnnees={uniqueFrzAnnees}
              zContrat={zContrat}
              setZContrat={setZContrat}
              uniqueFrzContrats={uniqueFrzContrats}
              zRep={zRep}
              setZRep={setZRep}
              uniqueFrzReps={uniqueFrzReps}
              zSup={zSup}
              setZSup={setZSup}
              uniqueFrzSups={uniqueFrzSups}
              zChef={zChef}
              setZChef={setZChef}
              uniqueFrzChefs={uniqueFrzChefs}
              zRisque={zRisque}
              setZRisque={setZRisque}
              uniqueFrzRisques={uniqueFrzRisques}
              zAction={zAction}
              setZAction={setZAction}
              uniqueFrzActions={uniqueFrzActions}
              onResetFrigos={handleResetFrigos}
            />
          </div>

          {/* Main Content Area */}
          <main className="min-w-0">
            {activeTab === 'pOverview' && (
              <>
                <VoiceFilterBanner
                  activeVoiceFilter={activeVoiceFilter}
                  onClear={handleClearVoiceFilter}
                  onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                  totalFiltered={filteredTasks.length}
                />
                <OverviewTab
                  tasks={filteredTasks}
                  allTasksCount={tasks.length}
                  onConsultTask={handleConsultTask}
                />
              </>
            )}

            {activeTab === 'pMonth' && (
              <RealisationTab
                realisation={realisation}
                rMois={rMois}
                rPref={rPref}
                rSearch={rSearch}
              />
            )}

            {activeTab === 'pFrigos' && (
              <FrigosTab
                frigoData={frigoData}
                zSerial={zSerial}
                zStatut={zStatut}
                zAnnee={zAnnee}
                zContrat={zContrat}
                zRep={zRep}
                zSup={zSup}
                zChef={zChef}
                zRisque={zRisque}
                zAction={zAction}
                onUpdateFrigos={handleUpdateFrigosFromExcel}
                onOpenExcelSync={() => setIsExcelSyncOpen(true)}
              />
            )}

            {activeTab === 'pVisites' && (
              <VisitesTab
                visites={visites}
                accessMode={accessMode}
                customPermissions={cdzPermissions}
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

        <ExcelSyncModal
          isOpen={isExcelSyncOpen}
          onClose={() => setIsExcelSyncOpen(false)}
          onUpdateTasks={handleUpdateTasksFromExcel}
          onUpdateRealisation={handleUpdateRealisationFromExcel}
          onUpdateFrigos={handleUpdateFrigosFromExcel}
          onResetToDemo={handleResetToDemo}
          currentTasksCount={tasks.length}
          currentRealisationCount={realisation.rows.length}
          currentFrigosCount={frigoData.frigos.length}
        />

        {/* Voice Filter Modal */}
        <VoiceFilterModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onApplyFilters={handleApplyVoiceFilters}
          uniqueChefs={uniqueChefs}
          uniqueCdrs={uniqueCdrs}
          uniqueTitres={uniqueTitres}
          tasks={tasks}
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
        />

        {/* Floating Assistant Vocal Button */}
        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="fixed bottom-20 right-3.5 md:bottom-6 md:right-6 z-40 flex items-center gap-2 md:gap-2.5 px-3 py-2 md:px-4 md:py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20 group"
          title="Assistant Vocal Derja (Etkallem maa l'assistant)"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4 text-white group-hover:animate-pulse" />
          </div>
          <div className="text-left pr-1">
            <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>Assistant Vocal</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[10px] text-sky-100 font-medium">Derja & Français</div>
          </div>
        </button>
      </div>
    </div>
  );
}
