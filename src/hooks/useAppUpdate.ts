import { useState, useEffect, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function useAppUpdate() {
  const [hasFallbackUpdate, setHasFallbackUpdate] = useState<boolean>(false);

  // Hook officiel vite-plugin-pwa
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (registration) {
        // Vérifie immédiatement et toutes les 30 secondes en arrière-plan
        const interval = setInterval(() => {
          registration.update().catch((err) => {
            console.debug('Vérification mise à jour SW :', err);
          });
        }, 30 * 1000);

        // Dès que l'utilisateur revient sur l'onglet, vérifier immédiatement
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
          clearInterval(interval);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
      }
    },
    onRegisterError(error) {
      console.warn('Erreur enregistrement SW :', error);
    }
  });

  // Détection native par navigator.serviceWorker (double sécurité)
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    navigator.serviceWorker.ready.then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setHasFallbackUpdate(true);
          }
        });
      });
    });
  }, []);

  const hasUpdate = Boolean(needRefresh || hasFallbackUpdate);

  const applyUpdate = useCallback(() => {
    try {
      updateServiceWorker(true);
    } catch {
      window.location.reload();
    }
  }, [updateServiceWorker]);

  const dismissUpdate = useCallback(() => {
    setNeedRefresh(false);
    setHasFallbackUpdate(false);
  }, [setNeedRefresh]);

  return {
    hasUpdate,
    applyUpdate,
    dismissUpdate
  };
}
