import React from 'react';

interface SidebarProps {
  activeTab: 'pOverview' | 'pMonth' | 'pFrigos';
  // Overview filters
  filterChef: string;
  setFilterChef: (v: string) => void;
  uniqueChefs: string[];
  filterCdr: string;
  setFilterCdr: (v: string) => void;
  uniqueCdrs: string[];
  filterTitre: string;
  setFilterTitre: (v: string) => void;
  uniqueTitres: string[];
  filterEtat: string;
  setFilterEtat: (v: string) => void;
  filterFid: string;
  setFilterFid: (v: string) => void;
  filterFrom: string;
  setFilterFrom: (v: string) => void;
  filterTo: string;
  setFilterTo: (v: string) => void;
  filterCaMin: string;
  setFilterCaMin: (v: string) => void;
  filterCaMax: string;
  setFilterCaMax: (v: string) => void;
  filterSearch: string;
  setFilterSearch: (v: string) => void;
  onResetOverview: () => void;

  // Realisation filters
  rMois: string;
  setRMois: (v: string) => void;
  uniqueMois: { val: number; label: string }[];
  rPref: string;
  setRPref: (v: string) => void;
  uniquePrefs: string[];
  rSearch: string;
  setRSearch: (v: string) => void;
  onResetReal: () => void;

  // Frigos filters
  zSerial: string;
  setZSerial: (v: string) => void;
  zStatut: string;
  setZStatut: (v: string) => void;
  uniqueFrzStatuts: string[];
  zAnnee: string;
  setZAnnee: (v: string) => void;
  uniqueFrzAnnees: string[];
  zContrat: string;
  setZContrat: (v: string) => void;
  uniqueFrzContrats: string[];
  zRep: string;
  setZRep: (v: string) => void;
  uniqueFrzReps: string[];
  zSup: string;
  setZSup: (v: string) => void;
  uniqueFrzSups: string[];
  zChef: string;
  setZChef: (v: string) => void;
  uniqueFrzChefs: string[];
  zRisque: string;
  setZRisque: (v: string) => void;
  uniqueFrzRisques: string[];
  zAction: string;
  setZAction: (v: string) => void;
  uniqueFrzActions: string[];
  onResetFrigos: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  filterChef,
  setFilterChef,
  uniqueChefs,
  filterCdr,
  setFilterCdr,
  uniqueCdrs,
  filterTitre,
  setFilterTitre,
  uniqueTitres,
  filterEtat,
  setFilterEtat,
  filterFid,
  setFilterFid,
  filterFrom,
  setFilterFrom,
  filterTo,
  setFilterTo,
  filterCaMin,
  setFilterCaMin,
  filterCaMax,
  setFilterCaMax,
  filterSearch,
  setFilterSearch,
  onResetOverview,

  rMois,
  setRMois,
  uniqueMois,
  rPref,
  setRPref,
  uniquePrefs,
  rSearch,
  setRSearch,
  onResetReal,

  zSerial,
  setZSerial,
  zStatut,
  setZStatut,
  uniqueFrzStatuts,
  zAnnee,
  setZAnnee,
  uniqueFrzAnnees,
  zContrat,
  setZContrat,
  uniqueFrzContrats,
  zRep,
  setZRep,
  uniqueFrzReps,
  zSup,
  setZSup,
  uniqueFrzSups,
  zChef,
  setZChef,
  uniqueFrzChefs,
  zRisque,
  setZRisque,
  uniqueFrzRisques,
  zAction,
  setZAction,
  uniqueFrzActions,
  onResetFrigos
}) => {
  return (
    <aside className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Overview Filters */}
      {activeTab === 'pOverview' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Filtres des tâches
          </h2>



          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>Chef de zone</span>
            <select
              value={filterChef}
              onChange={(e) => setFilterChef(e.target.value)}
              className="text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="">Tous</option>
              {uniqueChefs.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>Délégation</span>
            <select
              value={filterCdr}
              onChange={(e) => setFilterCdr(e.target.value)}
              className="text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="">Tous</option>
              {uniqueCdrs.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>Tâche</span>
            <select
              value={filterTitre}
              onChange={(e) => setFilterTitre(e.target.value)}
              className="text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="">Toutes</option>
              {uniqueTitres.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>État</span>
            <select
              value={filterEtat}
              onChange={(e) => setFilterEtat(e.target.value)}
              className="text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="">Tous</option>
              <option value="Terminée">Terminée</option>
              <option value="En attente">En attente</option>
              <option value="En retard">En retard</option>
            </select>
          </label>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>Inscription FID</span>
            <select
              value={filterFid}
              onChange={(e) => setFilterFid(e.target.value)}
              className="text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="">Tous</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
              <span>Échéance du</span>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </label>
            <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
              <span>au</span>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
              <span>CA 2026 min</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={filterCaMin}
                onChange={(e) => setFilterCaMin(e.target.value)}
                className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </label>
            <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
              <span>CA 2026 max</span>
              <input
                type="number"
                min="0"
                placeholder="illimité"
                value={filterCaMax}
                onChange={(e) => setFilterCaMax(e.target.value)}
                className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </label>
          </div>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>Recherche</span>
            <input
              type="text"
              placeholder="Code, client, représentant, Ahmed…"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </label>

          <button
            onClick={onResetOverview}
            className="w-full mt-2 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Realisation Filters */}
      {activeTab === 'pMonth' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Filtres de réalisation
          </h2>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>Mois</span>
            <select
              value={rMois}
              onChange={(e) => setRMois(e.target.value)}
              className="text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="">Tous les mois</option>
              {uniqueMois.map((m) => (
                <option key={m.val} value={String(m.val)}>{m.label}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>Type de facture (3 lettres)</span>
            <select
              value={rPref}
              onChange={(e) => setRPref(e.target.value)}
              className="text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="">Tous</option>
              {uniquePrefs.map((p) => (
                <option key={p} value={p}>{p === '-' ? '(sans n° de facture)' : p}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>Recherche client</span>
            <input
              type="text"
              placeholder="Code ou nom…"
              value={rSearch}
              onChange={(e) => setRSearch(e.target.value)}
              className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </label>

          <button
            onClick={onResetReal}
            className="w-full mt-2 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Frigos Filters */}
      {activeTab === 'pFrigos' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Filtres frigos
          </h2>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>SERIALNUMBER</span>
            <input
              type="text"
              placeholder="Rechercher un n° de série…"
              value={zSerial}
              onChange={(e) => setZSerial(e.target.value)}
              className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </label>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>Statut FRZ</span>
            <select
              value={zStatut}
              onChange={(e) => setZStatut(e.target.value)}
              className="text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="">Tous</option>
              {uniqueFrzStatuts.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>Année</span>
            <select
              value={zAnnee}
              onChange={(e) => setZAnnee(e.target.value)}
              className="text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="">Toutes</option>
              {uniqueFrzAnnees.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>Contrat</span>
            <select
              value={zContrat}
              onChange={(e) => setZContrat(e.target.value)}
              className="text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="">Tous</option>
              {uniqueFrzContrats.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>Représentant</span>
            <select
              value={zRep}
              onChange={(e) => setZRep(e.target.value)}
              className="text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="">Tous</option>
              {uniqueFrzReps.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>Superviseur</span>
            <select
              value={zSup}
              onChange={(e) => setZSup(e.target.value)}
              className="text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="">Tous</option>
              {uniqueFrzSups.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>Chef de zone</span>
            <select
              value={zChef}
              onChange={(e) => setZChef(e.target.value)}
              className="text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="">Tous</option>
              {uniqueFrzChefs.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>Statut risque</span>
            <select
              value={zRisque}
              onChange={(e) => setZRisque(e.target.value)}
              className="text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="">Tous</option>
              {uniqueFrzRisques.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span>Actions</span>
            <select
              value={zAction}
              onChange={(e) => setZAction(e.target.value)}
              className="text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="">Toutes</option>
              {uniqueFrzActions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </label>

          <button
            onClick={onResetFrigos}
            className="w-full mt-2 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </aside>
  );
};
