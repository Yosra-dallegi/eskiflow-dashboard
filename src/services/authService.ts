/**
 * authService.ts — Service d'authentification EskiFlow
 * =====================================================
 * - Hashage SHA-256 via Web Crypto API (navigateur natif)
 * - Mots de passe stockés hashés dans localStorage
 * - Mot de passe par défaut : vilavi2026
 * - Admin (Yosra) peut gérer les mots de passe via l'AccessControlModal
 */

const PASSWORDS_KEY = 'eskiflow_user_passwords'; // { email: sha256hash }

// Hash SHA-256 via Web Crypto (async, natif navigateur)
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Mot de passe par défaut pour les nouveaux utilisateurs
const DEFAULT_PASSWORD = 'vilavi2026';
let DEFAULT_PASSWORD_HASH: string | null = null;

async function getDefaultHash(): Promise<string> {
  if (!DEFAULT_PASSWORD_HASH) {
    DEFAULT_PASSWORD_HASH = await sha256(DEFAULT_PASSWORD);
  }
  return DEFAULT_PASSWORD_HASH;
}

// Charger la table des mots de passe
export function loadPasswords(): Record<string, string> {
  try {
    const data = localStorage.getItem(PASSWORDS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// Sauvegarder la table des mots de passe
export function savePasswords(passwords: Record<string, string>): void {
  try {
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
  } catch {}
}

/**
 * Vérifier email + mot de passe
 * - Si un hash est stocké pour cet email, on compare
 * - Si aucun hash n'est stocké → mot de passe par défaut "vilavi2026"
 */
export async function verifyPassword(email: string, password: string): Promise<boolean> {
  const emailLower = email.toLowerCase().trim();
  const inputHash = await sha256(password);
  const passwords = loadPasswords();

  if (passwords[emailLower]) {
    // Mot de passe personnalisé défini par l'admin
    return passwords[emailLower] === inputHash;
  } else {
    // Pas encore de mot de passe → mot de passe par défaut
    const defHash = await getDefaultHash();
    return inputHash === defHash;
  }
}

/**
 * Définir ou changer le mot de passe d'un utilisateur (admin uniquement)
 */
export async function setUserPassword(email: string, newPassword: string): Promise<void> {
  const emailLower = email.toLowerCase().trim();
  const hash = await sha256(newPassword);
  const passwords = loadPasswords();
  passwords[emailLower] = hash;
  savePasswords(passwords);
}

/**
 * Réinitialiser le mot de passe d'un utilisateur (retour au mot de passe par défaut)
 */
export function resetUserPassword(email: string): void {
  const emailLower = email.toLowerCase().trim();
  const passwords = loadPasswords();
  delete passwords[emailLower];
  savePasswords(passwords);
}

/**
 * Vérifier si un utilisateur a un mot de passe personnalisé
 */
export function hasCustomPassword(email: string): boolean {
  const emailLower = email.toLowerCase().trim();
  const passwords = loadPasswords();
  return !!passwords[emailLower];
}

export const DEFAULT_PASSWORD_HINT = 'vilavi2026';
