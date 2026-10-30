import React, { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { verifyPassword } from '../services/authService';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailLower = email.trim().toLowerCase();
    if (!emailLower || !password) {
      setError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Vérifier si l'email est connu dans le système
      if (!checkIsKnownEmail(emailLower)) {
        setError('Accès refusé. Cet email n\'est pas autorisé dans l\'application. Contactez l\'administrateur.');
        setIsLoading(false);
        return;
      }

      // 2. Vérifier le mot de passe
      const isValid = await verifyPassword(emailLower, password);
      if (!isValid) {
        setError('Mot de passe incorrect. Contactez l\'administrateur si vous avez oublié votre mot de passe.');
        setIsLoading(false);
        return;
      }

      // 3. Connexion réussie
      onLoginSuccess(emailLower);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
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
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="prenom.nom@vilavi.tn"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 transition text-sm"
                  autoComplete="email"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-blue-200/80 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/70" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="••••••••••"
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
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/20 border border-red-400/30">
                <span className="text-red-200 text-xs leading-relaxed">{error}</span>
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
              Contactez votre administrateur pour toute demande d'accès.
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
