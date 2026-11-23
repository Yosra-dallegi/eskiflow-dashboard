import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// ============================================================================
// PURGE AUTOMATIQUE DES ANCIENS CACHES & HISTORIQUES NAVIGATEUR
// Garantit que tout utilisateur ouvrant l'application charge la dernière version
// sans modifier ni affecter la version actuelle en production.
// ============================================================================
const CURRENT_APP_VERSION = '2026.11.23.01';

async function purgeLegacyCaches() {
  if (typeof window === 'undefined') return;
  try {
    const savedVersion = localStorage.getItem('eskiflow_app_version');
    if (savedVersion !== CURRENT_APP_VERSION) {
      // 1. Vider tous les caches de l'API CacheStorage (anciens fichiers JS, styles, assets)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // 2. Supprimer les anciens caches de données temporaires obsolètes
      try {
        sessionStorage.clear();
      } catch {}

      // 3. Forcer la mise à jour des Service Workers existants
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          registration.update().catch(() => {});
        }
      }

      // 4. Enregistrer la version active
      localStorage.setItem('eskiflow_app_version', CURRENT_APP_VERSION);
      console.log('[CacheManager] Anciens historiques et caches purgés avec succès. Version active :', CURRENT_APP_VERSION);
    }
  } catch (err) {
    console.warn('[CacheManager] Nettoyage des anciens caches :', err);
  }
}

// Lancement immédiat avant le premier rendu
purgeLegacyCaches();

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
