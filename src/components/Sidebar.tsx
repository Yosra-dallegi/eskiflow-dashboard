import React from 'react';
import { MultiSelectFilter } from './MultiSelectFilter';

interface SidebarProps {
  activeTab: 'pOverview' | 'pFrigos';
  
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
  
  filterDemandeurs: string[];
  setFilterDemandeurs: (v: string[]) => void;
  uniqueDemandeurs: string[];
  
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
  filterDemandeurs,
  setFilterDemandeurs,
  uniqueDemandeurs,
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
    <aside className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-4">
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
            label="Délégation (CDR)"
            placeholder="Toutes les délégations"
            options={uniqueCdrs}
            selectedValues={filterCdrs}
            onChange={setFilterCdrs}
          />

          <MultiSelectFilter
            label="Type de tâche"
            placeholder="Tous les types"
            options={uniqueTitres}
            selectedValues={filterTitres}
            onChange={setFilterTitres}
          />

          <MultiSelectFilter
            label="État d'avancement"
            placeholder="Tous les états"
            options={['Terminée', 'En attente', 'En retard']}
            selectedValues={filterEtats}
            onChange={setFilterEtats}
          />

          <MultiSelectFilter
            label="Demandeur"
            placeholder="Tous les demandeurs"
            options={uniqueDemandeurs}
            selectedValues={filterDemandeurs}
            onChange={setFilterDemandeurs}
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Programme Fidélité</label>
            <select
              value={filterFid}
              onChange={(e) => setFilterFid(e.target.value)}
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
            >
              <option value="">Tous les clients</option>
              <option value="oui">Inscrits au programme fidélité</option>
              <option value="non">Non inscrits</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Échéance du / au</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">CA 2026 min / max (TND)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filterCaMin}
                onChange={(e) => setFilterCaMin(e.target.value)}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <input
                type="number"
                placeholder="Max"
                value={filterCaMax}
                onChange={(e) => setFilterCaMax(e.target.value)}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Recherche libre</label>
            <input
              type="text"
              placeholder="Code, client, mot-clé…"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <button
            onClick={onResetOverview}
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
