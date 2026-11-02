/**
 * authService.ts — Service d'authentification EskiFlow
 * =====================================================
 * - Synchronisation bidirectionnelle avec le serveur (/api/auth/*)
 * - Mots de passe partagés entre tous les appareils et utilisateurs
 * - Hashage SHA-256 via Web Crypto API (sécurisé, natif)
 * - Mot de passe par défaut : vilavi2026
 * - Mode hors-ligne / fallback automatique sur localStorage
 */

const PASSWORDS_KEY = 'eskiflow_user_passwords'; // Cache local : { email: sha256hash }
export const DEFAULT_PASSWORD_HINT = 'vilavi2026';

let inMemoryPasswords: Record<string, string> | null = null;

// Hash SHA-256 via Web Crypto (async, natif navigateur)
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

let DEFAULT_PASSWORD_HASH: string | null = null;
async function getDefaultHash(): Promise<string> {
  if (!DEFAULT_PASSWORD_HASH) {
    DEFAULT_PASSWORD_HASH = await sha256(DEFAULT_PASSWORD_HINT);
  }
  return DEFAULT_PASSWORD_HASH;
}

// Charger la table locale
export function loadLocalPasswords(): Record<string, string> {
  if (inMemoryPasswords) return inMemoryPasswords;
  try {
    const data = localStorage.getItem(PASSWORDS_KEY);
    inMemoryPasswords = data ? JSON.parse(data) : {};
    return inMemoryPasswords || {};
  } catch {
    return {};
  }
}

// Sauvegarder la table locale
export function saveLocalPasswords(passwords: Record<string, string>): void {
  inMemoryPasswords = passwords;
  try {
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
  } catch {}
}

/**
 * Récupère les mots de passe enregistrés sur le serveur
 */
export async function syncPasswordsFromServer(): Promise<Record<string, string>> {
  try {
    const res = await fetch('/api/auth/passwords', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.passwords && typeof data.passwords === 'object') {
        saveLocalPasswords(data.passwords);
        return data.passwords;
      }
    }
  } catch {
    // Mode hors-ligne ou fallback
  }
  return loadLocalPasswords();
}

/**
 * Vérifier email + mot de passe
 * Récupère le hash à jour sur le serveur pour garantir la validité immédiate sur tous les appareils
 */
export async function verifyPassword(email: string, password: string): Promise<boolean> {
  const emailLower = email.toLowerCase().trim();
  const inputHash = await sha256(password);

  // Essayer de synchroniser avec le serveur
  let passwords = loadLocalPasswords();
  try {
    const fresh = await syncPasswordsFromServer();
    if (fresh) passwords = fresh;
  } catch {
    // utilise le cache local
  }

  if (passwords[emailLower]) {
    // Mot de passe personnalisé défini par l'admin
    return passwords[emailLower] === inputHash;
  } else {
    // Pas de mot de passe personnalisé → mot de passe par défaut (vilavi2026)
    const defHash = await getDefaultHash();
    return inputHash === defHash;
  }
}

/**
 * Définir ou changer le mot de passe d'un utilisateur (Admin)
 * Envoie la mise à jour au serveur pour que TOUS les appareils soient immédiatement synchronisés
 */
export async function setUserPassword(email: string, newPassword: string): Promise<boolean> {
  const emailLower = email.toLowerCase().trim();
  const hash = await sha256(newPassword);

  // 1. Sauvegarde locale immédiate
  const local = loadLocalPasswords();
  local[emailLower] = hash;
  saveLocalPasswords(local);

  // 2. Envoi au serveur
  try {
    const res = await fetch('/api/auth/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailLower, passwordHash: hash })
    });
    return res.ok;
  } catch (e) {
    console.warn('Erreur envoi mot de passe au serveur:', e);
    return false;
  }
}

/**
 * Réinitialiser le mot de passe d'un utilisateur (retour au mot de passe par défaut vilavi2026)
 * Supprime le mot de passe personnalisé sur le serveur et en local
 */
export async function resetUserPassword(email: string): Promise<boolean> {
  const emailLower = email.toLowerCase().trim();

  // 1. Suppression locale
  const local = loadLocalPasswords();
  delete local[emailLower];
  saveLocalPasswords(local);

  // 2. Envoi de la réinitialisation au serveur
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailLower })
    });
    return res.ok;
  } catch (e) {
    console.warn('Erreur réinitialisation mot de passe sur le serveur:', e);
    return false;
  }
}

/**
 * Vérifier si un utilisateur a un mot de passe personnalisé
 */
export function hasCustomPassword(email: string): boolean {
  const emailLower = email.toLowerCase().trim();
  const passwords = loadLocalPasswords();
  return !!passwords[emailLower];
}
