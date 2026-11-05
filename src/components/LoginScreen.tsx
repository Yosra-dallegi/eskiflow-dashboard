import React, { useState, useEffect } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2, RotateCcw, Check, KeyRound } from 'lucide-react';
import { verifyPassword, syncPasswordsFromServer, resetUserPassword, DEFAULT_PASSWORD_HINT } from '../services/authService';

interface LoginScreenProps {
  onLoginSuccess: (email: string) => void;
  checkIsKnownEmail: (email: string) => boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, checkIsKnownEmail }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Synchronisation des mots de passe depuis le serveur dès l'affichage
  useEffect(() => {
    syncPasswordsFromServer().catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccess(null);

    const emailLower = email.trim().toLowerCase();
    const cleanPwd = password.trim();

    if (!emailLower || !cleanPwd) {
      setError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Vérifier si l'email est connu dans le système
      if (!checkIsKnownEmail(emailLower)) {
        setError(`L'adresse "${emailLower}" n'est pas reconnue comme collaborateur autorisé.`);
        setIsLoading(false);
        return;
      }

      // 2. Vérifier le mot de passe
      const isValid = await verifyPassword(emailLower, cleanPwd);
      if (!isValid) {
        setError('Mot de passe incorrect. Vous pouvez le réinitialiser ci-dessous.');
        setIsLoading(false);
        return;
      }

      // 3. Connexion réussie
      onLoginSuccess(emailLower);
    } catch {
      setError('Une erreur est survenue lors de la vérification. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  const handleQuickReset = async () => {
    setError(null);
    setResetSuccess(null);
    const emailLower = email.trim().toLowerCase();
    if (!emailLower) {
      setError('Veuillez d\'abord saisir votre adresse email ci-dessus.');
      return;
    }
    if (!checkIsKnownEmail(emailLower)) {
      setError(`L'adresse "${emailLower}" n'est pas reconnue comme collaborateur autorisé.`);
      return;
    }

    setIsLoading(true);
    try {
      await resetUserPassword(emailLower);
      setPassword(DEFAULT_PASSWORD_HINT);
      setShowPassword(true);
      setResetSuccess(`Votre mot de passe a été réinitialisé à "${DEFAULT_PASSWORD_HINT}". Vous pouvez maintenant cliquer sur Se connecter.`);
    } catch {
      setError('Impossible de réinitialiser le mot de passe.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/8 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/8 blur-3xl" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 rounded-full bg-sky-500/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-sky-400 shadow-2xl shadow-blue-500/40 mb-4">
            <span className="text-white font-bold text-2xl">🧊</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">EskiFlow</h1>
          <p className="text-blue-300/70 text-sm mt-1">Suivi des tâches · Eskimo / Paname</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-6">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-blue-200/80 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/70" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); setResetSuccess(null); }}
                  placeholder="yosra.dallegi@vilavi.tn"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 transition text-sm"
                  autoComplete="email"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-blue-200/80 text-xs font-semibold uppercase tracking-wide">
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={handleQuickReset}
                  className="text-[11px] text-sky-300 hover:text-sky-200 underline cursor-pointer"
                >
                  Oublié ? Réinitialiser
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/70" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="vilavi2026"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 transition text-sm"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400/60 hover:text-blue-300 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-blue-300/60">
                <span>Défaut : <code className="text-sky-200 font-mono font-bold">{DEFAULT_PASSWORD_HINT}</code></span>
              </div>
            </div>

            {/* Success message */}
            {resetSuccess && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs leading-relaxed animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="space-y-2 p-3 rounded-xl bg-red-500/20 border border-red-400/30">
                <div className="text-red-200 text-xs leading-relaxed">{error}</div>
                <button
                  type="button"
                  onClick={handleQuickReset}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-200 hover:text-amber-100 font-semibold underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Réinitialiser mon mot de passe à « {DEFAULT_PASSWORD_HINT} »
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <p className="text-blue-300/50 text-xs text-center leading-relaxed">
              Accès réservé aux collaborateurs Vilavi.<br />
              Le mot de passe par défaut est <strong className="text-sky-300">vilavi2026</strong>.
            </p>
          </div>
        </div>

        <p className="text-center text-blue-400/30 text-xs mt-6">
          © 2026 Vilavi · EskiFlow Dashboard
        </p>
      </div>
    </div>
  );
};
