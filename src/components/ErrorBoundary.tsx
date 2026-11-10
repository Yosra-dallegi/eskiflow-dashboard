import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EskiFlow Runtime Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      // Nettoyer les caches locaux qui pourraient être corrompus
      localStorage.removeItem('eskimo_paname_managers_list');
      localStorage.removeItem('eskimo_paname_cdz_permissions');
    } catch {}
    window.location.reload();
  };

  private handleHardReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">Une erreur d'affichage est survenue</h2>
              <p className="text-xs text-blue-200/80 mt-1.5 leading-relaxed">
                Le tableau de bord a rencontré une exception. Vos données sont protégées. Cliquez ci-dessous pour recharger l'application en toute sécurité.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-left overflow-x-auto max-h-32 text-[11px] font-mono text-rose-300">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <RotateCcw className="w-4 h-4" />
                Recharger l'application
              </button>

              <button
                type="button"
                onClick={this.handleHardReset}
                className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-blue-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                title="Efface les données locales de session et recharge"
              >
                Réinitialiser la session
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
