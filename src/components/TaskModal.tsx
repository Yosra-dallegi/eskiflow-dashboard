import React, { useEffect } from 'react';
import { TaskItem } from '../types/task';
import { X, Eye, Calendar, User, MapPin, Building, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: TaskItem | null;
}

const frDate = (s?: any) => {
  if (!s) return '—';
  const str = String(s).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str.split('-').reverse().join('/');
  }
  return str;
};

const fmtMoney = (n?: number) => {
  if (!n) return '0 DT';
  return Math.round(n).toLocaleString('fr-FR') + ' DT';
};

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative border border-slate-200"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pb-4 border-b border-slate-200 pr-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-blue-50 text-blue-700">
              <Eye className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Mode Consultation
            </span>
            <span
              className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${
                task.etat === 'Terminée'
                  ? 'bg-emerald-600'
                  : task.etat === 'En retard'
                  ? 'bg-rose-600'
                  : 'bg-amber-500'
              }`}
            >
              {task.etat || task.statut || 'En attente'}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 line-clamp-2">
            {task.titre || 'Tâche sans titre'}
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
              ID : {task.id}
            </span>
            <span>•</span>
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
              Code client : {task.code}
            </span>
            <span>•</span>
            <span className="font-medium text-slate-700">
              {task.clientNom || '— Non rattaché —'}
            </span>
          </div>
        </div>

        {/* Consultation details grid */}
        <div className="space-y-4">
          {/* Section 1 : Client & Rapprochement */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              <span>Informations Client (Base Rapprochée)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Raison sociale / Nom</span>
                <span className="font-semibold text-slate-800">{task.clientNom || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Code client</span>
                <span className="font-mono font-semibold text-slate-800">{task.code || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Statut client</span>
                <span className="font-medium text-slate-700">{task.clientStatut || 'Actif'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Localisation (GPS)</span>
                <span className="font-mono text-slate-700">
                  {task.lat && task.lng ? `${task.lat.toFixed(4)}, ${task.lng.toFixed(4)}` : 'Non géolocalisé'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2 : Équipe Commerciale & Périmètre */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Périmètre Commercial & Supervision</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Chef de zone</span>
                <span className="font-semibold text-slate-800">{task.chef || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Délégation / CDR</span>
                <span className="font-semibold text-slate-800">{task.cdr || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Représentant terrain</span>
                <span className="font-semibold text-slate-800">{task.repr || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Demandeur</span>
                <span className="font-medium text-slate-700">{task.demandeur || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">CA Prévisionnel 2025</span>
                <span className="font-mono font-medium text-slate-700">{fmtMoney(task.ca25)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">CA Prévisionnel 2026</span>
                <span className="font-mono font-medium text-slate-700">{fmtMoney(task.ca26)}</span>
              </div>
            </div>
          </div>

          {/* Section 3 : Suivi & Calendrier */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Suivi & Exécution</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Date d'échéance</span>
                <span className="font-mono font-semibold text-slate-800">{frDate(task.echeance)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Date de réalisation</span>
                <span className="font-mono font-semibold text-slate-800">{frDate(task.dateReal)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Réalisé par</span>
                <span className="font-semibold text-slate-800">{task.realisePar || '—'}</span>
              </div>
            </div>
          </div>

          {/* Section 4 : Description / Consignes */}
          {task.desc && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block text-[11px] mb-1 font-semibold uppercase">Description / Consignes</span>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {task.desc}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer : Pure consultation */}
        <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-200">
          <span className="text-[11px] text-slate-400">
            Espace de consultation uniquement • Aucune modification enregistrée
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
