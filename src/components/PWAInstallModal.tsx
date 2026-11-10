import React from 'react';
import { Smartphone, Download, X, CheckCircle2, Share2, PlusSquare, ExternalLink, ArrowRight } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-7txf63r52tnth46mebpruh-689355535357.europe-west1.run.app';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Smartphone className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Installation sur Smartphone</span>
                <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full text-sky-100">
                  Android & iPhone
                </span>
              </h3>
              <p className="text-xs text-sky-100/90">
                Installez l'application directement comme une application mobile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Status déjà installé */}
          {isInstalled && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-medium">
                L'application Eskiflow est déjà installée sur cet appareil en mode autonome.
              </span>
            </div>
          )}

          {/* Option 1: Bouton 1-clic direct (PWA / Chrome) */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                <Download className="w-4 h-4 text-blue-600" />
                Méthode 1 : Installation directe (Recommandée)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px]">
                Plus rapide qu'un APK
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Pas besoin de télécharger un gros fichier .APK ni d'autoriser les sources inconnues. En ouvrant le lien sur votre navigateur mobile (Chrome sur Android ou Safari sur iPhone) :
            </p>

            {isInstallable ? (
              <button
                onClick={async () => {
                  const ok = await install();
                  if (ok) onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Installer maintenant sur cet appareil</span>
              </button>
            ) : isIOS ? (
              <div className="bg-white p-3 rounded-xl border border-blue-200 space-y-2">
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  Sur iPhone / iPad (Safari) :
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                  <li>Appuyez sur le bouton <strong>Partager</strong> (icône carré avec flèche).</li>
                  <li>Faites défiler vers le bas et touchez <strong>« Sur l'écran d'accueil »</strong>.</li>
                </ol>
              </div>
            ) : (
              <div className="bg-white p-3 rounded-xl border border-blue-200 space-y-2">
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  Sur Android (Google Chrome) :
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                  <li>Ouvrez le lien dans Google Chrome sur votre téléphone.</li>
                  <li>Touchez les <strong>3 points en haut à droite</strong>.</li>
                  <li>Sélectionnez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Option 2: Générer un package APK officiel */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-slate-600" />
                Méthode 2 : Vous voulez un vrai fichier .APK ?
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Pour empaqueter cette application web sous forme de fichier d'installation <strong>.APK Android</strong> officiel ou pour le publier sur le Google Play Store :
            </p>
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
              <p className="font-medium text-slate-800">
                Utilisez l'outil officiel Microsoft / Google <strong>PWABuilder</strong> :
              </p>
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-slate-500 truncate font-mono bg-slate-100 px-2 py-1 rounded">
                  pwabuilder.com
                </span>
                <a
                  href={`https://www.pwabuilder.com/?url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs transition shrink-0"
                >
                  <span>Générer APK</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-[11px] text-slate-500">
                Entrez le lien de votre application partagée, cliquez sur « Build APK » et téléchargez directement votre fichier APK prêt à installer.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Compatible Android (Chrome, Samsung Internet) et iOS (Safari)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200/80 hover:bg-slate-300 rounded-xl transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
