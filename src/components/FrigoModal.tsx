import React, { useEffect } from 'react';
import { FrigoItem } from '../types/task';
import { FRZ_LIBELLES } from '../services/exportService';
import { X } from 'lucide-react';

interface FrigoModalProps {
  frigo: FrigoItem | null;
  onClose: () => void;
}

const FRZ_FICHE: [string, string[]][] = [
  ['Identification', ['serial', 'map', 'habillage', 'usage', 'statutFrz', 'annee', 'nbFrz']],
  ['Client', ['codeClient', 'nomClient']],
  ['Facturation', ['datePremFact', 'dateDerFact']],
  ['Scan et GPS', ['nbScan', 'dateDernScan', 'confFrzGps', 'gpsVisit', 'confClt']],
  ['Contrat et commercial', ['contrat', 'date', 'statut', 'classe', 'codeRep', 'nomRep', 'superviseur', 'chefZone']],
  ['Risque', ['score', 'risque', 'actions']],
  ['Impacts', ['impactActivation', 'impactScan', 'impactRythmeVente', 'impactStatut', 'impactDetection', 'impactGps', 'impactContrat']]
];

const frDate = (s?: any) => {
  if (!s) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(s))) {
    return String(s).split('-').reverse().join('/');
  }
  return String(s);
};

const FRZ_DATES = ['datePremFact', 'dateDerFact', 'dateDernScan', 'date'];

export const FrigoModal: React.FC<FrigoModalProps> = ({ frigo, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!frigo) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative border border-slate-200"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Head */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 mb-5 border-b border-slate-200 pr-10">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Fiche frigo
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {frigo.serial}
            </h2>
            <div className="text-xs text-slate-500 mt-1">
              <strong className="text-slate-800">{frigo.nomClient || '—'}</strong> · Code :{' '}
              <span className="font-mono">{frigo.codeClient || '—'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              {frigo.statutFrz || 'Statut FRZ —'}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                frigo.risque === 'Critique' || frigo.risque === 'Élevé'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : frigo.risque === 'Moyen'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              Risque : {frigo.risque || '—'}
            </span>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FRZ_FICHE.map(([sectionTitle, fields]) => (
            <div
              key={sectionTitle}
              className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2"
            >
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                {sectionTitle}
              </h3>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                {fields.map((fKey) => {
                  const label = FRZ_LIBELLES[fKey] || fKey;
                  const rawVal = (frigo as any)[fKey];
                  const val =
                    FRZ_DATES.indexOf(fKey) > -1
                      ? frDate(rawVal)
                      : rawVal === '' || rawVal == null
                      ? '—'
                      : String(rawVal);

                  return (
                    <React.Fragment key={fKey}>
                      <dt className="text-slate-500 truncate" title={label}>
                        {label}
                      </dt>
                      <dd className="font-medium text-slate-900 text-right truncate" title={val}>
                        {val}
                      </dd>
                    </React.Fragment>
                  );
                })}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
