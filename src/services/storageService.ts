import { TaskItem, RealisationData, FrigoData } from '../types/task';

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
const MAJ_KEY = 'eskimo_paname_last_maj';

export const storageService = {
  async saveTasks(tasks: TaskItem[]) {
    await idbSet(TASKS_KEY, tasks);
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
