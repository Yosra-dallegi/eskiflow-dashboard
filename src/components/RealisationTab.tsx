import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { RealisationData } from '../types/task';

ChartJS.register(...registerables);

interface RealisationTabProps {
  realisation: RealisationData;
  rMois: string;
  rPref: string;
  rSearch: string;
}

const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const fmt3 = (n?: number) => (n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export const RealisationTab: React.FC<RealisationTabProps> = ({
  realisation,
  rMois,
  rPref,
  rSearch
}) => {
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  // Filter rows
  const q = rSearch.trim().toLowerCase();
  const base = realisation.rows.filter((r) => {
    const code = r[0];
    const nom = realisation.noms[code] || '';
    const pref = r[2] || '-';
    if (rPref && pref !== rPref) return false;
    if (q && !(code + ' ' + nom).toLowerCase().includes(q)) return false;
    return true;
  });

  const rows = rMois ? base.filter((r) => String(r[1]) === rMois) : base;

  // Aggregate by client
  const m: Record<string, number> = {};
  rows.forEach((r) => {
    m[r[0]] = (m[r[0]] || 0) + r[3];
  });

  const rList = Object.keys(m)
    .map((c) => ({
      code: c,
      nom: realisation.noms[c] || '',
      ht: m[c]
    }))
    .sort((a, b) => b.ht - a.ht);

  const totalHT = rList.reduce((s, x) => s + x.ht, 0);
  const avgClient = rList.length ? totalHT / rList.length : 0;

  // Chart aggregation by month (from 1 to 12)
  useEffect(() => {
    if (!chartCanvasRef.current) return;

    const bm = Array(13).fill(0);
    base.forEach((r) => {
      const monthNum = r[1];
      if (monthNum >= 0 && monthNum <= 12) {
        bm[monthNum] += r[3];
      }
    });

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
            label: 'Total HT',
            data: vals,
            backgroundColor: '#2557D6',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            ticks: {
              callback: (value) => `${Number(value).toLocaleString('fr-FR')} DT`
            }
          }
        }
      }
    });

    return () => {
      chartInstance.current?.destroy();
    };
  }, [base]);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl p-4 text-white shadow-sm bg-gradient-to-br from-blue-600 to-indigo-600">
          <b className="block text-2xl lg:text-3xl font-extrabold tracking-tight">{fmt3(totalHT)} DT</b>
          <span className="text-xs text-blue-100 font-medium">Total HT</span>
        </div>

        <div className="rounded-2xl p-4 text-white shadow-sm bg-gradient-to-br from-sky-600 to-cyan-500">
          <b className="block text-2xl lg:text-3xl font-extrabold tracking-tight">{rList.length}</b>
          <span className="text-xs text-sky-100 font-medium">Clients</span>
        </div>

        <div className="rounded-2xl p-4 text-white shadow-sm bg-gradient-to-br from-emerald-600 to-teal-500">
          <b className="block text-2xl lg:text-3xl font-extrabold tracking-tight">{fmt3(avgClient)} DT</b>
          <span className="text-xs text-emerald-100 font-medium">Moyenne par client</span>
        </div>
      </div>

      {/* Grid: Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Total HT par mois
              <span className="text-xs font-normal text-slate-400 ml-2">· données du {realisation.maj}</span>
            </h2>
          </div>
          <div className="h-[360px] flex-1">
            <canvas ref={chartCanvasRef}></canvas>
          </div>
        </div>

        {/* Clients Table (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">Clients — Total HT</h2>
            <span className="text-xs font-medium text-slate-500">{rList.length} client{rList.length > 1 ? 's' : ''}</span>
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
                  {rList.map((x) => (
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
        </div>
      </div>
    </div>
  );
};
