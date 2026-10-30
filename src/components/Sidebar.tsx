import React from 'react';
import { MultiSelectFilter } from './MultiSelectFilter';

interface SidebarProps {
  activeTab: 'pOverview' | 'pMonth' | 'pFrigos' | 'pVisites';
  
  // Overview filters (Multi-select)
  filterChefs: string[];
  setFilterChefs: (v: string[]) => void;
  uniqueChefs: string[];
  
  filterCdrs: string[];
  setFilterCdrs: (v: string[]) => void;
  uniqueCdrs: string[];
  
  filterTitres: string[];
  setFilterTitres: (v: string[]) => void;
  uniqueTitres: string[];
  
  filterEtats: string[];
  setFilterEtats: (v: string[]) => void;
  
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

  // Realisation filters (Multi-select)
  rMoisList: string[];
  setRMoisList: (v: string[]) => void;
  uniqueMois: { val: number; label: string }[];
  
  rPrefs: string[];
  setRPrefs: (v: string[]) => void;
  uniquePrefs: string[];
  
  rSearch: string;
  setRSearch: (v: string) => void;
  onResetReal: () => void;

  // Frigos filters (Multi-select)
  zSerial: string;
  setZSerial: (v: string) => void;
  
  zStatuts: string[];
  setZStatuts: (v: string[]) => void;
  uniqueFrzStatuts: string[];
  
  zAnnees: string[];
  setZAnnees: (v: string[]) => void;
  uniqueFrzAnnees: string[];
  
  zContrats: string[];
  setZContrats: (v: string[]) => void;
  uniqueFrzContrats: string[];
  
  zReps: string[];
  setZReps: (v: string[]) => void;
  uniqueFrzReps: string[];
  
  zSups: string[];
  setZSups: (v: string[]) => void;
  uniqueFrzSups: string[];
  
  zChefs: string[];
  setZChefs: (v: string[]) => void;
  uniqueFrzChefs: string[];
  
  zRisques: string[];
  setZRisques: (v: string[]) => void;
  uniqueFrzRisques: string[];
  
  zActions: string[];
  setZActions: (v: string[]) => void;
  uniqueFrzActions: string[];
  
  onResetFrigos: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  filterChefs,
  setFilterChefs,
  uniqueChefs,
  filterCdrs,
  setFilterCdrs,
  uniqueCdrs,
  filterTitres,
  setFilterTitres,
  uniqueTitres,
  filterEtats,
  setFilterEtats,
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

  rMoisList,
  setRMoisList,
  uniqueMois,
  rPrefs,
  setRPrefs,
  uniquePrefs,
  rSearch,
  setRSearch,
  onResetReal,

  zSerial,
  setZSerial,
  zStatuts,
  setZStatuts,
  uniqueFrzStatuts,
  zAnnees,
  setZAnnees,
  uniqueFrzAnnees,
  zContrats,
  setZContrats,
  uniqueFrzContrats,
  zReps,
  setZReps,
  uniqueFrzReps,
  zSups,
  setZSups,
  uniqueFrzSups,
  zChefs,
  setZChefs,
  uniqueFrzChefs,
  zRisques,
  setZRisques,
  uniqueFrzRisques,
  zActions,
  setZActions,
  uniqueFrzActions,
  onResetFrigos
}) => {
  return (
    <aside className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Overview Filters */}
      {activeTab === 'pOverview' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">
              Filtres des tâches
            </h2>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Choix multiple
            </span>
          </div>

          <MultiSelectFilter
            label="Chef de zone"
            placeholder="Tous les chefs autorisés"
            options={uniqueChefs}
            selectedValues={filterChefs}
            onChange={setFilterChefs}
          />

          <MultiSelectFilter
            label="Délégation"
            placeholder="Toutes les délégations"
            options={uniqueCdrs}
            selectedValues={filterCdrs}
            onChange={setFilterCdrs}
          />

          <MultiSelectFilter
            label="Tâche"
            placeholder="Toutes les tâches"
            options={uniqueTitres}
            selectedValues={filterTitres}
            onChange={setFilterTitres}
          />

          <MultiSelectFilter
            label="État"
            placeholder="Tous les états"
            options={['Terminée', 'En attente', 'En retard']}
            selectedValues={filterEtats}
            onChange={setFilterEtats}
          />

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span className="font-semibold text-slate-700">Inscription FID</span>
            <select
              value={filterFid}
              onChange={(e) => setFilterFid(e.target.value)}
              className="text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="">Tous (Inscrits + Non-inscrits)</option>
              <option value="oui">Oui (Inscrits fidélité)</option>
              <option value="non">Non (Non inscrits)</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
              <span className="font-semibold text-slate-700">Échéance du</span>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </label>
            <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
              <span className="font-semibold text-slate-700">au</span>
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
              <span className="font-semibold text-slate-700">CA 2026 min</span>
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
              <span className="font-semibold text-slate-700">CA 2026 max</span>
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
            <span className="font-semibold text-slate-700">Recherche</span>
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
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">
              Filtres de réalisation
            </h2>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Choix multiple
            </span>
          </div>

          <MultiSelectFilter
            label="Mois"
            placeholder="Tous les mois"
            options={uniqueMois.map((m) => ({ value: String(m.val), label: m.label }))}
            selectedValues={rMoisList}
            onChange={setRMoisList}
          />

          <MultiSelectFilter
            label="Type de facture (3 lettres)"
            placeholder="Tous les types"
            options={uniquePrefs.map((p) => ({ value: p, label: p === '-' ? '(sans n° de facture)' : p }))}
            selectedValues={rPrefs}
            onChange={setRPrefs}
          />

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span className="font-semibold text-slate-700">Recherche client</span>
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
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">
              Filtres frigos
            </h2>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Choix multiple
            </span>
          </div>

          <label className="flex flex-col text-xs font-medium text-slate-500 gap-1">
            <span className="font-semibold text-slate-700">SERIALNUMBER</span>
            <input
              type="text"
              placeholder="Rechercher un n° de série…"
              value={zSerial}
              onChange={(e) => setZSerial(e.target.value)}
              className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </label>

          <MultiSelectFilter
            label="Chef de zone"
            placeholder="Tous les chefs autorisés"
            options={uniqueFrzChefs}
            selectedValues={zChefs}
            onChange={setZChefs}
          />

          <MultiSelectFilter
            label="Superviseur"
            placeholder="Tous les superviseurs autorisés"
            options={uniqueFrzSups}
            selectedValues={zSups}
            onChange={setZSups}
          />

          <MultiSelectFilter
            label="Représentant"
            placeholder="Tous les représentants autorisés"
            options={uniqueFrzReps}
            selectedValues={zReps}
            onChange={setZReps}
          />

          <MultiSelectFilter
            label="Statut FRZ"
            placeholder="Tous les statuts"
            options={uniqueFrzStatuts}
            selectedValues={zStatuts}
            onChange={setZStatuts}
          />

          <MultiSelectFilter
            label="Année"
            placeholder="Toutes les années"
            options={uniqueFrzAnnees}
            selectedValues={zAnnees}
            onChange={setZAnnees}
          />

          <MultiSelectFilter
            label="Contrat"
            placeholder="Tous les contrats"
            options={uniqueFrzContrats}
            selectedValues={zContrats}
            onChange={setZContrats}
          />

          <MultiSelectFilter
            label="Statut risque"
            placeholder="Tous les risques"
            options={uniqueFrzRisques}
            selectedValues={zRisques}
            onChange={setZRisques}
          />

          <MultiSelectFilter
            label="Actions requises"
            placeholder="Toutes les actions"
            options={uniqueFrzActions}
            selectedValues={zActions}
            onChange={setZActions}
          />

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
