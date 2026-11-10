import { TaskItem, RealisationData, FrigoData, VisiteItem } from '../types/task';

// IndexedDB Helper for high-volume data (e.g. 7,122+ frigos, tens of thousands of rows)
const DB_NAME = 'EskimoPanameDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_data';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbSet(key: string, value: any): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    // Fallback to localStorage if small enough
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
}

async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    // Fallback to localStorage
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}

async function idbClear(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {}
}

const TASKS_KEY = 'eskimo_paname_tasks';
const REAL_KEY = 'eskimo_paname_realisation';
const FRZ_KEY = 'eskimo_paname_frigos';
const VISITES_KEY = 'eskimo_paname_visites';
const MAJ_KEY = 'eskimo_paname_last_maj';
const ACCESS_MODE_KEY = 'eskimo_paname_access_mode';

export const storageService = {
  async saveTasks(tasks: TaskItem[]) {
    await idbSet(TASKS_KEY, tasks);
    try {
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      }).catch(() => {});
    } catch {}
  },

  async loadTasks(): Promise<TaskItem[] | null> {
    return await idbGet<TaskItem[]>(TASKS_KEY);
  },

  async saveRealisation(real: RealisationData) {
    await idbSet(REAL_KEY, real);
  },

  async loadRealisation(): Promise<RealisationData | null> {
    return await idbGet<RealisationData>(REAL_KEY);
  },

  async saveFrigos(frz: FrigoData) {
    await idbSet(FRZ_KEY, frz);
  },

  async loadFrigos(): Promise<FrigoData | null> {
    return await idbGet<FrigoData>(FRZ_KEY);
  },

  async saveVisites(visites: VisiteItem[]) {
    await idbSet(VISITES_KEY, visites);
  },

  async loadVisites(): Promise<VisiteItem[] | null> {
    return await idbGet<VisiteItem[]>(VISITES_KEY);
  },

  saveAccessMode(mode: string) {
    try {
      localStorage.setItem(ACCESS_MODE_KEY, mode);
    } catch {}
  },

  loadAccessMode(): string {
    try {
      const stored = localStorage.getItem(ACCESS_MODE_KEY);
      // 'MANAGER' était l'ancienne valeur par défaut : on exige désormais une vraie connexion
      if (!stored || stored === 'MANAGER') return '';
      return stored;
    } catch {
      return '';
    }
  },

  saveCdzPermissions(perms: Record<string, any>) {
    try {
      localStorage.setItem('eskimo_paname_cdz_permissions', JSON.stringify(perms));
    } catch {}
    // Synchronisation serveur
    try {
      fetch('/api/auth/cdz-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: perms })
      }).catch(() => {});
    } catch {}
  },

  async fetchCdzPermissions(): Promise<Record<string, any> | null> {
    try {
      const res = await fetch('/api/auth/cdz-permissions', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.permissions && typeof data.permissions === 'object' && Object.keys(data.permissions).length > 0) {
          localStorage.setItem('eskimo_paname_cdz_permissions', JSON.stringify(data.permissions));
          return data.permissions;
        }
      }
    } catch {}
    const local = storageService.loadCdzPermissions();
    if (local && Object.keys(local).length > 0) {
      try {
        fetch('/api/auth/cdz-permissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions: local })
        }).catch(() => {});
      } catch {}
    }
    return local;
  },

  loadCdzPermissions(): Record<string, any> | null {
    try {
      const data = localStorage.getItem('eskimo_paname_cdz_permissions');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveManagersList(managers: any[]) {
    try {
      localStorage.setItem('eskimo_paname_managers_list', JSON.stringify(managers));
    } catch {}
    // Synchronisation serveur
    try {
      fetch('/api/auth/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managers })
      }).catch(() => {});
    } catch {}
  },

  async fetchManagersList(): Promise<any[] | null> {
    try {
      const res = await fetch('/api/auth/managers', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.managers) && data.managers.length > 0) {
          localStorage.setItem('eskimo_paname_managers_list', JSON.stringify(data.managers));
          return data.managers;
        }
      }
    } catch {}
    const local = storageService.loadManagersList();
    if (local && local.length > 0) {
      try {
        fetch('/api/auth/managers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ managers: local })
        }).catch(() => {});
      } catch {}
    }
    return local;
  },

  loadManagersList(): any[] | null {
    try {
      const data = localStorage.getItem('eskimo_paname_managers_list');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveLastMaj(maj: string) {
    try {
      localStorage.setItem(MAJ_KEY, maj);
    } catch (e) {}
  },

  loadLastMaj(): string | null {
    try {
      return localStorage.getItem(MAJ_KEY);
    } catch (e) {
      return null;
    }
  },

  loadTasksFileId(): string {
    try {
      return localStorage.getItem('eski_paname_tasks_file_id') || '';
    } catch {
      return '';
    }
  },

  saveTasksFileId(id: string) {
    try {
      localStorage.setItem('eski_paname_tasks_file_id', id);
    } catch {}
    try {
      fetch('/api/config/tasks-file-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasksFileId: id })
      }).catch(() => {});
    } catch {}
  },

  async clearAll() {
    await idbClear();
    try {
      localStorage.removeItem(TASKS_KEY);
      localStorage.removeItem(REAL_KEY);
      localStorage.removeItem(FRZ_KEY);
      localStorage.removeItem(MAJ_KEY);
    } catch (e) {}
  }
};
