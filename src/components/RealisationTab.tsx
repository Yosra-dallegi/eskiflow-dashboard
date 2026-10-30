import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { RealisationData } from '../types/task';
import { TrendingUp, Users, Calendar, Search } from 'lucide-react';

ChartJS.register(...registerables);

interface RealisationTabProps {
  realisation: RealisationData;
  rMoisList?: string[];
  rPrefs?: string[];
  rMois?: string;
  rPref?: string;
  rSearch: string;
}

const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const fmt3 = (n?: number) => (n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export const RealisationTab: React.FC<RealisationTabProps> = ({
  realisation,
  rMoisList,
  rPrefs,
  rMois,
  rPref,
  rSearch
}) => {
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartJS | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(150);

  // Filter rows avec useMemo
  const { base, rows, rList, totalHT, avgClient } = useMemo(() => {
    const q = rSearch.trim().toLowerCase();
    const filteredBase = realisation.rows.filter((r) => {
      const code = r[0];
      const nom = realisation.noms[code] || '';
      const pref = r[2] || '-';
      if (rPrefs && rPrefs.length > 0) {
        if (!rPrefs.includes(pref)) return false;
      } else if (rPref && pref !== rPref) return false;

      if (q && !(code + ' ' + nom).toLowerCase().includes(q)) return false;
      return true;
    });

    const filteredRows = (rMoisList && rMoisList.length > 0)
      ? filteredBase.filter((r) => rMoisList.includes(String(r[1])))
      : rMois
      ? filteredBase.filter((r) => String(r[1]) === rMois)
      : filteredBase;

    const m: Record<string, number> = {};
    for (let i = 0; i < filteredRows.length; i++) {
      const r = filteredRows[i];
      m[r[0]] = (m[r[0]] || 0) + r[3];
    }

    const list = Object.keys(m)
      .map((c) => ({
        code: c,
        nom: realisation.noms[c] || '',
        ht: m[c]
      }))
      .sort((a, b) => b.ht - a.ht);

    const tot = list.reduce((s, x) => s + x.ht, 0);
    const avg = list.length ? tot / list.length : 0;

    return {
      base: filteredBase,
      rows: filteredRows,
      rList: list,
      totalHT: tot,
      avgClient: avg
    };
  }, [realisation, rMois, rPref, rSearch]);

  // Chart aggregation by month
  useEffect(() => {
    if (!chartCanvasRef.current) return;

    const bm = Array(13).fill(0);
    for (let i = 0; i < base.length; i++) {
      const r = base[i];
      const monthNum = r[1];
      if (monthNum >= 0 && monthNum <= 12) {
        bm[monthNum] += r[3];
      }
    }

    const labels: string[] = [];
    const vals: number[] = [];

    for (let i = 1; i <= 12; i++) {
      labels.push(MOIS[i - 1]);
      vals.push(Math.round(bm[i] * 1000) / 1000);
    }

    if (bm[0]) {
      labels.push('Sans mois');
      vals.push(Math.round(bm[0] * 1000) / 1000);
    }

    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new ChartJS(chartCanvasRef.current, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total HT (DT)',
            data: vals,
            backgroundColor: '#2557D6',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 250 },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (v) => fmt3(Number(v)) + ' DT'
            }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });

    return () => {
      chartInstance.current?.destroy();
    };
  }, [base]);

  return (
    <div className="space-y-4">
      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total HT Ventes</span>
            <b className="text-lg font-bold text-slate-900">{fmt3(totalHT)} DT</b>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Clients acheteurs</span>
            <b className="text-lg font-bold text-slate-900">{rList.length}</b>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Moyenne / client</span>
            <b className="text-lg font-bold text-slate-900">{fmt3(avgClient)} DT</b>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Monthly Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">Ventes mensuelles globales (2026)</h2>
            <span className="text-xs text-slate-400">Total par mois en DT</span>
          </div>
          <div className="h-[360px] flex-1">
            <canvas ref={chartCanvasRef}></canvas>
          </div>
        </div>

        {/* Clients Table (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">Clients — Total HT</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {rList.length} client{rList.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto max-h-[360px] flex-1">
            {rList.length ? (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 sticky top-0">
                    <th className="py-2 px-2.5 font-semibold">Code client</th>
                    <th className="py-2 px-3 font-semibold">Nom client</th>
                    <th className="py-2 px-3 text-right font-semibold">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rList.slice(0, displayLimit).map((x) => (
                    <tr key={x.code} className="hover:bg-slate-50/70">
                      <td className="py-2 px-2.5 font-mono text-slate-600 whitespace-nowrap">{x.code}</td>
                      <td className="py-2 px-3 font-medium text-slate-900 whitespace-nowrap">{x.nom || '—'}</td>
                      <td className="py-2 px-3 text-right font-mono font-medium text-slate-900 whitespace-nowrap">
                        {fmt3(x.ht)}
                      </td>
                    </tr>
                  ))}
                  {/* Total summary row */}
                  <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                    <td className="py-2.5 px-2.5">Total</td>
                    <td className="py-2.5 px-3 text-slate-600">{rList.length} client(s)</td>
                    <td className="py-2.5 px-3 text-right font-mono text-blue-700">{fmt3(totalHT)} DT</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">Aucune donnée avec ces filtres.</p>
            )}
          </div>

          {rList.length > displayLimit && (
            <button
              type="button"
              onClick={() => setDisplayLimit((l) => l + 150)}
              className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 text-center py-1 transition cursor-pointer"
            >
              Afficher plus de clients ({displayLimit} sur {rList.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
