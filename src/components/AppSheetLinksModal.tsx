import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Link2, Sparkles, Smartphone, ShieldCheck } from 'lucide-react';

interface AppSheetLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl?: string;
}

export const AppSheetLinksModal: React.FC<AppSheetLinksModalProps> = ({
  isOpen,
  onClose,
  baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://eskiflow-dashboard.onrender.com'
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const cleanBase = baseUrl.replace(/\/+$/, '');

  // URLs et Formules AppSheet
  const links = [
    {
      id: 'tasks-appsheet',
      title: '📋 Bouton AppSheet — Suivi des Tâches (Recommandé)',
      subtitle: 'Formule AppSheet pour connecter automatiquement le collaborateur connecté',
      type: 'formula',
      value: `CONCATENATE("${cleanBase}/?view=tasks&user=", ENCODEURL(USEREMAIL()))`,
      instructions: 'Dans AppSheet > Actions > Do this: "Go to a website" > Target:'
    },
    {
      id: 'tasks-direct',
      title: '📋 Lien Web Direct — Suivi des Tâches',
      subtitle: 'Lien direct pour partage WhatsApp, email ou raccourci navigateur',
      type: 'url',
      value: `${cleanBase}/?view=tasks`,
      instructions: 'Ouvre directement le module Tâches'
    },
    {
      id: 'frigos-appsheet',
      title: '❄️ Bouton AppSheet — Suivi des Frigos (Recommandé)',
      subtitle: 'Formule AppSheet pour ouvrir directement les frigos du collaborateur',
      type: 'formula',
      value: `CONCATENATE("${cleanBase}/?view=frigos&user=", ENCODEURL(USEREMAIL()))`,
      instructions: 'Dans AppSheet > Actions > Do this: "Go to a website" > Target:'
    },
    {
      id: 'frigos-direct',
      title: '❄️ Lien Web Direct — Suivi des Frigos',
      subtitle: 'Lien direct pour partage WhatsApp, email ou raccourci navigateur',
      type: 'url',
      value: `${cleanBase}/?view=frigos`,
      instructions: 'Ouvre directement le module Frigos'
    }
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-md">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Liens d'Intégration AppSheet & Web</h2>
              <p className="text-xs text-blue-100">Boutons en 1 clic pour connecter vos équipes sans mot de passe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Astuce */}
          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-blue-950 text-xs">Comment intégrer dans votre application AppSheet :</p>
              <ol className="list-decimal list-inside text-slate-700 text-[11px] space-y-0.5">
                <li>Dans AppSheet, allez dans <strong>Behavior &gt; Actions &gt; Add Action</strong>.</li>
                <li>Choisissez la table (ex. <em>Taches</em> ou <em>Collaborateurs</em>).</li>
                <li>Dans <strong>Do this</strong>, sélectionnez : <code>External: go to a website</code>.</li>
                <li>Dans <strong>Target</strong>, collez la formule recommandée ci-dessous.</li>
              </ol>
            </div>
          </div>

          {/* Cards for each link */}
          <div className="space-y-3">
            {links.map((link) => {
              const isCopied = copiedKey === link.id;
              return (
                <div
                  key={link.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition hover:shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs">{link.title}</h3>
                      <p className="text-[11px] text-slate-500">{link.subtitle}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      link.type === 'formula' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {link.type === 'formula' ? 'Formule AppSheet' : 'Lien Direct'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-300">
                    <code className="text-[11px] font-mono text-slate-800 break-all flex-1 select-all">
                      {link.value}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(link.id, link.value)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                    {link.type === 'url' && (
                      <a
                        href={link.value}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 transition"
                        title="Tester le lien"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sécurité et accès */}
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-relaxed">
              <strong>Zéro friction d'accès :</strong> Lorsqu'un collaborateur clique sur le bouton dans AppSheet, l'application lit son adresse email via le paramètre <code>?user=...</code> et l'authentifie immédiatement sur son périmètre sans lui demander de mot de passe à répétition.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-100/80 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
