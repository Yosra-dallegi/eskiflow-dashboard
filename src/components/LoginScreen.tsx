import React, { useState } from 'react';
import { LogIn, Mail, Shield, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string) => void;
  errorMessage?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, errorMessage }) => {
  const [email, setEmail] = useState('');
  const [showHelper, setShowHelper] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (trimmed) {
      onLogin(trimmed);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-sky-400 shadow-2xl shadow-blue-500/40 mb-4">
            <span className="text-white font-bold text-2xl">🧊</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">EskiFlow</h1>
          <p className="text-blue-300/80 text-sm mt-1">Suivi des tâches · Eskimo / Paname</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-semibold text-lg">Connexion sécurisée</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">
                Adresse email professionnelle
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom.nom@vilavi.tn"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 transition text-sm"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/20 border border-red-400/30">
                <span className="text-red-300 text-xs leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!email.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Accéder au tableau de bord
            </button>
          </form>

          {/* Helper toggle */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowHelper(!showHelper)}
              className="flex items-center gap-1.5 text-blue-300/70 hover:text-blue-200 text-xs transition cursor-pointer"
            >
              {showHelper ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showHelper ? 'Masquer les informations' : 'Comment me connecter ?'}
            </button>

            {showHelper && (
              <div className="mt-3 space-y-2 text-xs text-blue-200/70 leading-relaxed">
                <p>• Saisissez votre adresse email <strong className="text-blue-200">@vilavi.tn</strong></p>
                <p>• Votre rôle (Admin / Manager / CDZ) sera détecté automatiquement</p>
                <p>• Contactez l'administrateur si vous n'avez pas encore accès</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-blue-400/40 text-xs mt-6">
          © 2026 Vilavi · EskiFlow Dashboard
        </p>
      </div>
    </div>
  );
};
