import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import L from 'leaflet';
import { TaskItem } from '../types/task';
import { Check, Clock, AlertTriangle, MapPin, Eye, Calendar, User, ChevronRight, LayoutGrid, Table } from 'lucide-react';
import { findCdzBudget } from '../data/cdzData';

ChartJS.register(...registerables);

interface OverviewTabProps {
  tasks: TaskItem[];
  allTasksCount: number;
  onConsultTask: (task: TaskItem) => void;
}

const COL = {
  ok: '#2E9E6B',
  wait: '#E0A526',
  late: '#D6455D'
};

const esc = (s?: any) => String(s == null ? '' : s);
const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR');
const pct = (a: number, b: number) => (b ? Math.round((a * 100) / b) : 0);
const fr = (s?: string) => (s ? s.split('-').reverse().join('/') : '');

export const OverviewTab: React.FC<OverviewTabProps> = ({
  tasks,
  allTasksCount,
  onConsultTask
}) => {
  const [tableViewMode, setTableViewMode] = useState<'cards' | 'table'>('cards');

  // Chart refs
  const chartChefRef = useRef<HTMLCanvasElement | null>(null);
  const chartTitreRef = useRef<HTMLCanvasElement | null>(null);
  const chartEtatRef = useRef<HTMLCanvasElement | null>(null);

  const chartChefInstance = useRef<ChartJS | null>(null);
  const chartTitreInstance = useRef<ChartJS | null>(null);
  const chartEtatInstance = useRef<ChartJS | null>(null);

  // Map ref
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerGroup = useRef<L.LayerGroup | null>(null);

  // Derived counts
  const done = tasks.filter((t) => t.done).length;
  const late = tasks.filter((t) => t.late).length;
  const wait = tasks.length - done - late;
  const ec = tasks.filter((t) => t.ecart != null).map((t) => t.ecart as number);
  const avg = ec.length ? (ec.reduce((a, b) => a + b, 0) / ec.length).toFixed(1) : '–';
  const nonMatch = tasks.filter((t) => !t.trouve).length;

  // Aggregation function
  const agg = (keyFn: (t: TaskItem) => string) => {
    const m: Record<string, { k: string; total: number; done: number; wait: number; late: number; ca: number; ecart: number[] }> = {};
    tasks.forEach((t) => {
      const k = keyFn(t) || '—';
      if (!m[k]) m[k] = { k, total: 0, done: 0, wait: 0, late: 0, ca: 0, ecart: [] };
      m[k].total++;
      if (t.done) m[k].done++;
      else if (t.late) m[k].late++;
      else m[k].wait++;
      m[k].ca += t.ca26 || 0;
      if (t.ecart != null) m[k].ecart.push(t.ecart);
    });
    return Object.values(m).sort((a, b) => b.total - a.total);
  };

  const byChef = agg((t) => t.chef);
  const byTitre = agg((t) => t.titre);

  // Matrix calculation
  const titres = byTitre.map((o) => o.k);
  const mat: Record<string, Record<string, [number, number]>> = {};
  tasks.forEach((t) => {
    const chefKey = t.chef || '— Non rattaché —';
    if (!mat[chefKey]) mat[chefKey] = {};
    if (!mat[chefKey][t.titre]) mat[chefKey][t.titre] = [0, 0];
    mat[chefKey][t.titre][1]++;
    if (t.done) mat[chefKey][t.titre][0]++;
  });

  // Realised by collaborator
  const real = agg((t) => (t.done && t.realisePar ? t.realisePar : ''));
  const realFiltered = real.filter((r) => r.k !== '' && r.k !== '—');

  // Chart rendering effect
  useEffect(() => {
    // 1. Chart Chef
    if (chartChefRef.current) {
      if (chartChefInstance.current) chartChefInstance.current.destroy();
      chartChefInstance.current = new ChartJS(chartChefRef.current, {
        type: 'bar',
        data: {
          labels: byChef.map((o) => o.k),
          datasets: [
            { label: 'Terminées', data: byChef.map((o) => o.done), backgroundColor: COL.ok },
            { label: 'En attente', data: byChef.map((o) => o.wait), backgroundColor: COL.wait },
            { label: 'En retard', data: byChef.map((o) => o.late), backgroundColor: COL.late }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: { x: { stacked: true }, y: { stacked: true } },
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
        }
      });
    }

    // 2. Chart Titre
    if (chartTitreRef.current) {
      if (chartTitreInstance.current) chartTitreInstance.current.destroy();
      chartTitreInstance.current = new ChartJS(chartTitreRef.current, {
        type: 'bar',
        data: {
          labels: byTitre.map((o) => o.k),
          datasets: [
            { label: 'Terminées', data: byTitre.map((o) => o.done), backgroundColor: COL.ok },
            { label: 'En attente', data: byTitre.map((o) => o.wait), backgroundColor: COL.wait },
            { label: 'En retard', data: byTitre.map((o) => o.late), backgroundColor: COL.late }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: { x: { stacked: true }, y: { stacked: true } },
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
        }
      });
    }

    // 3. Chart Etat
    if (chartEtatRef.current) {
      if (chartEtatInstance.current) chartEtatInstance.current.destroy();
      chartEtatInstance.current = new ChartJS(chartEtatRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Terminées', 'En attente', 'En retard'],
          datasets: [
            {
              data: [done, wait, late],
              backgroundColor: [COL.ok, COL.wait, COL.late]
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
        }
      });
    }

    return () => {
      chartChefInstance.current?.destroy();
      chartTitreInstance.current?.destroy();
      chartEtatInstance.current?.destroy();
    };
  }, [tasks]);

  // Leaflet map initialization effect
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstance.current) {
      const map = L.map(mapContainerRef.current, { preferCanvas: true }).setView([34.5, 9.5], 6.5);
      const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);

      const esri = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{x}/{y}',
        { maxZoom: 19, attribution: 'Tiles © Esri' }
      );

      let tileErrors = 0;
      osm.on('tileerror', () => {
        if (++tileErrors === 4 && map.hasLayer(osm)) {
          map.removeLayer(osm);
          esri.addTo(map);
        }
      });

      L.control.layers({ 'Plan (OSM)': osm, 'Plan (Esri)': esri }, undefined, { position: 'topright' }).addTo(map);
      layerGroup.current = L.layerGroup().addTo(map);
      mapInstance.current = map;
    }

    // Update markers
    if (layerGroup.current && mapInstance.current) {
      layerGroup.current.clearLayers();

      const byClient: Record<string, { t: TaskItem; done: number; wait: number; late: number; titres: string[] }> = {};
      tasks.forEach((t) => {
        if (!byClient[t.code]) {
          byClient[t.code] = { t, done: 0, wait: 0, late: 0, titres: [] };
        }
        if (t.done) byClient[t.code].done++;
        else if (t.late) byClient[t.code].late++;
        else byClient[t.code].wait++;
        byClient[t.code].titres.push(`${t.titre} — ${t.etat}`);
      });

      const pts: [number, number][] = [];
      Object.values(byClient).forEach((c) => {
        const la = c.t.lat;
        const lo = c.t.lng;
        if (!la || !lo || Math.abs(la) > 90 || Math.abs(lo) > 180) return;

        const col = c.late ? COL.late : c.wait ? COL.wait : COL.ok;
        const html = `
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
            <b style="font-size: 13px; color: #14213D;">${esc(c.t.clientNom || c.t.code)}</b><br>
            <span style="color: #64748B;">Code : </span><b>${esc(c.t.code)}</b><br>
            <span style="color: #64748B;">Chef de zone : </span><b>${esc(c.t.chef)}</b><br>
            <span style="color: #64748B;">CA 2026 : </span><b>${fmt(c.t.ca26 || 0)} DT</b>
            <hr style="margin: 6px 0; border: 0; border-top: 1px solid #E2E8F0;">
            ${c.titres.map((ti) => `<div style="font-size: 11px;">• ${esc(ti)}</div>`).join('')}
          </div>
        `;

        const marker = L.circleMarker([la, lo], {
          radius: 8,
          color: '#ffffff',
          weight: 2,
          fillColor: col,
          fillOpacity: 0.95
        }).bindPopup(html);

        layerGroup.current?.addLayer(marker);
        pts.push([la, lo]);
      });

      if (pts.length) {
        mapInstance.current.fitBounds(pts, { padding: [35, 35], maxZoom: 13 });
      }

      setTimeout(() => mapInstance.current?.invalidateSize(), 200);
    }
  }, [tasks]);

  const mapLocatedCount = tasks.filter((t) => t.lat && t.lng && t.lat !== 0).length;

  return (
    <div className="space-y-4">
      {/* Drive Sync Banner */}
      {allTasksCount <= 12 && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm border border-blue-600/40 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center font-bold text-lg">
              📊
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Vue d'ensemble connectée à Google Drive</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">ID : 14g_5J2ED...</span>
              </h4>
              <p className="text-xs text-blue-200 mt-0.5">
                Cliquez sur le bouton bleu <strong>« Actualiser »</strong> en haut pour charger directement vos tâches et votre base clients depuis votre fichier Google Drive.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Non-match warning */}
      {nonMatch > 0 && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{nonMatch} tâche(s)</strong> dont le Code_Client est introuvable dans la base client (classées « — Non rattaché — »).
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {/* Total Tasks */}
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white shadow-xs bg-gradient-to-br from-blue-600 to-indigo-600">
          <b className="block text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">{tasks.length}</b>
          <span className="text-[11px] sm:text-xs text-blue-100 font-medium">Tâches</span>
        </div>

        {/* Done */}
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white shadow-xs bg-gradient-to-br from-emerald-600 to-teal-500">
          <b className="block text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">{done}</b>
          <span className="text-[11px] sm:text-xs text-emerald-100 font-medium">Terminées</span>
        </div>

        {/* Wait */}
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white shadow-xs bg-gradient-to-br from-amber-600 to-amber-500">
          <b className="block text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">{wait}</b>
          <span className="text-[11px] sm:text-xs text-amber-100 font-medium">En attente</span>
        </div>

        {/* Late */}
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white shadow-xs bg-gradient-to-br from-rose-600 to-red-500">
          <b className="block text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">{late}</b>
          <span className="text-[11px] sm:text-xs text-rose-100 font-medium">En retard</span>
        </div>

        {/* Completion rate */}
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white shadow-xs bg-gradient-to-br from-sky-600 to-cyan-500">
          <b className="block text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">{pct(done, tasks.length)} %</b>
          <span className="text-[11px] sm:text-xs text-sky-100 font-medium truncate">Taux réalisation</span>
        </div>

        {/* Average difference */}
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white shadow-xs bg-gradient-to-br from-indigo-700 to-indigo-500">
          <b className="block text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">{avg}{ec.length ? ' j' : ''}</b>
          <span className="text-[11px] sm:text-xs text-indigo-100 font-medium truncate">Écart moyen vs éch.</span>
        </div>
      </div>

      {/* Row 1: Charts Avancement par chef de zone & Avancement par type de tâche */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Avancement par chef de zone</h2>
          <div className="h-[280px]">
            <canvas ref={chartChefRef}></canvas>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Avancement par type de tâche</h2>
          <div className="h-[280px]">
            <canvas ref={chartTitreRef}></canvas>
          </div>
        </div>
      </div>

      {/* Row 2: Synthèse par chef de zone & Répartition par état */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Synthèse par chef de zone table */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm overflow-x-auto">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Synthèse par chef de zone</h2>
          <div className="overflow-x-auto max-h-[300px]">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 sticky top-0">
                  <th className="py-2 px-2.5 font-semibold">Chef de zone</th>
                  <th className="py-2 px-2 text-right font-semibold">Total</th>
                  <th className="py-2 px-2 text-right font-semibold text-emerald-700">Terminées</th>
                  <th className="py-2 px-2 text-right font-semibold text-amber-700">En attente</th>
                  <th className="py-2 px-2 text-right font-semibold text-rose-700">En retard</th>
                  <th className="py-2 px-3 font-semibold">Taux</th>
                  <th className="py-2 px-2.5 text-right font-semibold">CA 2026</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {byChef.map((o) => {
                  const p = pct(o.done, o.total);
                  const cdz = findCdzBudget(o.k);
                  return (
                    <tr key={o.k} className="hover:bg-slate-50/70">
                      <td className="py-2 px-2.5 font-medium text-slate-900">
                        <div className="whitespace-nowrap">{o.k}</div>
                        {cdz && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            📍 {cdz.zone.split('-')[0].trim()}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right font-mono">{o.total}</td>
                      <td className="py-2 px-2 text-right font-mono text-emerald-700">{o.done}</td>
                      <td className="py-2 px-2 text-right font-mono text-amber-700">{o.wait}</td>
                      <td className="py-2 px-2 text-right font-mono text-rose-700">{o.late}</td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p}%` }} />
                          </div>
                          <span className="font-mono text-[11px] text-slate-600">{p}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono text-slate-800">{fmt(o.ca)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Répartition par état doughnut */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Répartition par état</h2>
          <div className="h-[280px] flex-1">
            <canvas ref={chartEtatRef}></canvas>
          </div>
        </div>
      </div>

      {/* Carte des clients */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Carte des clients
            <span className="text-xs font-normal text-slate-500">
              ({mapLocatedCount} clients géolocalisés sur {tasks.length})
            </span>
          </h2>
        </div>
        <div ref={mapContainerRef} className="h-[400px] w-full rounded-xl z-0 overflow-hidden border border-slate-200" />
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E9E6B]"></span>
            <span>Tâches terminées</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E0A526]"></span>
            <span>En attente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D6455D]"></span>
            <span>Au moins une tâche en retard</span>
          </div>
        </div>
      </div>

      {/* Matrice Chef de zone x Tâche */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm overflow-x-auto">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Chef de zone × tâche (terminées / total)</h2>
        <div className="overflow-x-auto max-h-[360px]">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50 sticky top-0">
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Chef de zone</th>
                {titres.map((ti) => (
                  <th key={ti} className="py-2.5 px-3 font-semibold whitespace-nowrap max-w-[200px] truncate" title={ti}>
                    {ti}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.keys(mat).sort().map((chefName) => (
                <tr key={chefName} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap bg-slate-50/40">
                    {chefName}
                  </td>
                  {titres.map((ti) => {
                    const c = mat[chefName][ti];
                    if (!c) return <td key={ti} className="py-2 px-3 text-center text-slate-300">—</td>;
                    const prop = c[0] / c[1];
                    const bgAlpha = (0.12 + prop * 0.55).toFixed(2);
                    return (
                      <td key={ti} className="py-2 px-3 whitespace-nowrap">
                        <span
                          className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-800"
                          style={{ backgroundColor: `rgba(46, 158, 107, ${bgAlpha})` }}
                        >
                          {c[0]} / {c[1]}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tâches réalisées par collaborateur */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Tâches réalisées par collaborateur</h2>
        {realFiltered.length ? (
          <div className="overflow-x-auto max-h-[220px]">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 sticky top-0">
                  <th className="py-2 px-3 font-semibold">Réalisé par</th>
                  <th className="py-2 px-3 text-right font-semibold">Tâches terminées</th>
                  <th className="py-2 px-3 text-right font-semibold">Écart moyen (j)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {realFiltered.map((o) => {
                  const dev = o.ecart.length ? (o.ecart.reduce((a, b) => a + b, 0) / o.ecart.length).toFixed(1) : '–';
                  return (
                    <tr key={o.k} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-900">{o.k}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-700">{o.total}</td>
                      <td className="py-2 px-3 text-right font-mono">{dev}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3">Aucune tâche terminée avec un réalisateur renseigné.</p>
        )}
      </div>

      {/* Détail des tâches */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Détail des tâches</span>
            <span className="text-xs font-normal text-slate-500">
              ({tasks.length} tâche{tasks.length > 1 ? 's' : ''}{allTasksCount !== tasks.length ? ` sur ${allTasksCount}` : ''})
            </span>
          </h2>

          {/* Toggle Cartes / Tableau sur mobile & tablette */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs md:hidden">
            <button
              type="button"
              onClick={() => setTableViewMode('cards')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                tableViewMode === 'cards'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Cartes</span>
            </button>
            <button
              type="button"
              onClick={() => setTableViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                tableViewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3 h-3" />
              <span>Tableau</span>
            </button>
          </div>
        </div>

        {/* Mobile View: Cards (Adapté pour smartphone) */}
        <div className={`${tableViewMode === 'cards' ? 'block md:hidden' : 'hidden'} space-y-2.5 max-h-[520px] overflow-y-auto pr-0.5`}>
          {tasks.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
              Aucune tâche ne correspond à vos filtres.
            </div>
          ) : (
            tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onConsultTask(t)}
                className="bg-slate-50/80 hover:bg-blue-50/60 active:bg-blue-100/50 border border-slate-200 rounded-2xl p-3.5 transition cursor-pointer shadow-xs space-y-2"
              >
                {/* Card Top: Client & State */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {t.clientNom || 'Client non rattaché'}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500">
                      Code: {t.code} · ID #{t.id}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs ${
                      t.etat === 'Terminée'
                        ? 'bg-[#2E9E6B]'
                        : t.etat === 'En retard'
                        ? 'bg-[#D6455D]'
                        : 'bg-[#E0A526]'
                    }`}
                  >
                    {t.etat}
                  </span>
                </div>

                {/* Card Middle: Title */}
                <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                  {t.titre}
                </p>

                {/* Card Bottom: Metadata & Action */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-1">
                  <div className="flex items-center gap-3">
                    {t.chef && (
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[120px]">{t.chef}</span>
                      </span>
                    )}
                    {t.echeance && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{fr(t.echeance)}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 font-bold">
                    <span>Fiche</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View & Mobile Table Toggle */}
        <div className={`${tableViewMode === 'table' ? 'block' : 'hidden md:block'} overflow-x-auto max-h-[460px]`}>
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 sticky top-0 z-10">
                <th className="py-2 px-2.5 font-semibold text-center">Fiche</th>
                <th className="py-2 px-2.5 font-semibold">ID</th>
                <th className="py-2 px-2.5 font-semibold">Code</th>
                <th className="py-2 px-3 font-semibold">Client</th>
                <th className="py-2 px-2.5 font-semibold">Chef de zone</th>
                <th className="py-2 px-2.5 font-semibold">Délégation</th>
                <th className="py-2 px-2.5 font-semibold">Représentant</th>
                <th className="py-2 px-3 font-semibold">Tâche</th>
                <th className="py-2 px-2.5 font-semibold">Échéance</th>
                <th className="py-2 px-2.5 font-semibold">État</th>
                <th className="py-2 px-2.5 font-semibold">Réalisée le</th>
                <th className="py-2 px-2.5 font-semibold">Par</th>
                <th className="py-2 px-2.5 font-semibold">Demandeur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tasks.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => onConsultTask(t)}
                  title="Cliquer pour consulter la fiche de la tâche"
                  className="hover:bg-blue-50/60 cursor-pointer transition"
                >
                  {/* Consultation button */}
                  <td className="py-2 px-2.5 whitespace-nowrap text-center" onClick={(e) => { e.stopPropagation(); onConsultTask(t); }}>
                    <button
                      type="button"
                      onClick={() => onConsultTask(t)}
                      title="Consulter la fiche détaillée"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Consulter</span>
                    </button>
                  </td>
                  <td className="py-2 px-2.5 font-mono text-slate-600 whitespace-nowrap">{t.id}</td>
                  <td className="py-2 px-2.5 font-mono font-medium text-slate-900 whitespace-nowrap">{t.code}</td>
                  <td className="py-2 px-3 font-medium text-slate-900 whitespace-nowrap">{t.clientNom || '— Non rattaché —'}</td>
                  <td className="py-2 px-2.5 whitespace-nowrap">{t.chef || '—'}</td>
                  <td className="py-2 px-2.5 whitespace-nowrap">{t.cdr || '—'}</td>
                  <td className="py-2 px-2.5 whitespace-nowrap">{t.repr || '—'}</td>
                  <td className="py-2 px-3 max-w-[240px] truncate font-medium text-slate-800" title={t.titre}>
                    {t.titre}
                  </td>
                  <td className="py-2 px-2.5 font-mono text-slate-600 whitespace-nowrap">{fr(t.echeance)}</td>
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold text-white ${
                        t.etat === 'Terminée'
                          ? 'bg-[#2E9E6B]'
                          : t.etat === 'En retard'
                          ? 'bg-[#D6455D]'
                          : 'bg-[#E0A526]'
                      }`}
                    >
                      {t.etat}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 font-mono text-slate-600 whitespace-nowrap">{fr(t.dateReal) || '—'}</td>
                  <td className="py-2 px-2.5 whitespace-nowrap">{t.realisePar || '—'}</td>
                  <td className="py-2 px-2.5 whitespace-nowrap text-slate-500">{t.demandeur || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
