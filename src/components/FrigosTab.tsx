import React, { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import L from 'leaflet';
import { FrigoData, FrigoItem } from '../types/task';
import { FrigoModal } from './FrigoModal';
import { SheetSelectModal } from './SheetSelectModal';
import { MapPin, Upload, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { parseFrigosExcel, inspectFrigosWorkbook, SheetInfo } from '../services/excelReaderService';

ChartJS.register(...registerables);

interface FrigosTabProps {
  frigoData: FrigoData;
  zSerial: string;
  zStatuts?: string[];
  zAnnees?: string[];
  zContrats?: string[];
  zReps?: string[];
  zSups?: string[];
  zChefs?: string[];
  zRisques?: string[];
  zActions?: string[];
  zStatut?: string;
  zAnnee?: string;
  zContrat?: string;
  zRep?: string;
  zSup?: string;
  zChef?: string;
  zRisque?: string;
  zAction?: string;
  onUpdateFrigos: (data: FrigoData) => void;
  onOpenExcelSync?: () => void;
}

const PALETTE_F = ['#2557D6', '#2E9E6B', '#E0A526', '#D6455D', '#0E7C9B', '#4338CA', '#8B5CF6', '#64748B'];

const frDate = (s?: any) => {
  if (!s) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(s))) {
    return String(s).split('-').reverse().join('/');
  }
  return String(s);
};

export const FrigosTab: React.FC<FrigosTabProps> = ({
  frigoData,
  zSerial,
  zStatuts,
  zAnnees,
  zContrats,
  zReps,
  zSups,
  zChefs,
  zRisques,
  zActions,
  zStatut,
  zAnnee,
  zContrat,
  zRep,
  zSup,
  zChef,
  zRisque,
  zAction,
  onUpdateFrigos,
  onOpenExcelSync
}) => {
  const [selectedFrigo, setSelectedFrigo] = useState<FrigoItem | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const chartStatutRef = useRef<HTMLCanvasElement | null>(null);
  const chartRisqueRef = useRef<HTMLCanvasElement | null>(null);
  const chartStatutInstance = useRef<ChartJS | null>(null);
  const chartRisqueInstance = useRef<ChartJS | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerGroup = useRef<L.LayerGroup | null>(null);

  // Filter list
  const q = zSerial.trim().toLowerCase();
  const filteredFrigos = frigoData.frigos.filter((f) => {
    if (q && !String(f.serial).toLowerCase().includes(q)) return false;

    if (zStatuts && zStatuts.length > 0) {
      if (!zStatuts.includes(f.statutFrz)) return false;
    } else if (zStatut && f.statutFrz !== zStatut) return false;

    if (zAnnees && zAnnees.length > 0) {
      if (!zAnnees.includes(f.annee)) return false;
    } else if (zAnnee && f.annee !== zAnnee) return false;

    if (zContrats && zContrats.length > 0) {
      if (!zContrats.includes(f.contrat)) return false;
    } else if (zContrat && f.contrat !== zContrat) return false;

    if (zReps && zReps.length > 0) {
      if (!zReps.includes(f.nomRep)) return false;
    } else if (zRep && f.nomRep !== zRep) return false;

    if (zSups && zSups.length > 0) {
      if (!zSups.includes(f.superviseur)) return false;
    } else if (zSup && f.superviseur !== zSup) return false;

    if (zChefs && zChefs.length > 0) {
      if (!zChefs.includes(f.chefZone)) return false;
    } else if (zChef && f.chefZone !== zChef) return false;

    if (zRisques && zRisques.length > 0) {
      if (!zRisques.includes(f.risque)) return false;
    } else if (zRisque && f.risque !== zRisque) return false;

    if (zActions && zActions.length > 0) {
      if (!zActions.includes(f.actions)) return false;
    } else if (zAction && f.actions !== zAction) return false;

    return true;
  });

  const distinctClients = new Set(filteredFrigos.map((f) => f.codeClient).filter(Boolean)).size;
  const scannes = filteredFrigos.filter((f) => {
    const num = parseFloat(String(f.nbScan).replace(',', '.')) || 0;
    return num > 0;
  }).length;

  const helperColors = (key: keyof FrigoItem) => {
    const m: Record<string, number> = {};
    filteredFrigos.forEach((f) => {
      const v = (f[key] as string) || '(vide)';
      m[v] = (m[v] || 0) + 1;
    });
    const labels = Object.keys(m).sort((a, b) => m[b] - m[a]);
    const couleurs: Record<string, string> = {};
    labels.forEach((l, i) => {
      couleurs[l] = PALETTE_F[i % PALETTE_F.length];
    });
    return { labels, counts: m, couleurs };
  };

  const { labels: statutLabels, counts: statutCounts, couleurs: statutColors } = helperColors('statutFrz');
  const { labels: risqueLabels, counts: risqueCounts, couleurs: risqueColors } = helperColors('risque');

  // Chart rendering effect
  useEffect(() => {
    if (chartStatutRef.current) {
      if (chartStatutInstance.current) chartStatutInstance.current.destroy();
      chartStatutInstance.current = new ChartJS(chartStatutRef.current, {
        type: 'doughnut',
        data: {
          labels: statutLabels,
          datasets: [
            {
              data: statutLabels.map((l) => statutCounts[l]),
              backgroundColor: statutLabels.map((l) => statutColors[l])
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

    if (chartRisqueRef.current) {
      if (chartRisqueInstance.current) chartRisqueInstance.current.destroy();
      chartRisqueInstance.current = new ChartJS(chartRisqueRef.current, {
        type: 'doughnut',
        data: {
          labels: risqueLabels,
          datasets: [
            {
              data: risqueLabels.map((l) => risqueCounts[l]),
              backgroundColor: risqueLabels.map((l) => risqueColors[l])
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
      chartStatutInstance.current?.destroy();
      chartRisqueInstance.current?.destroy();
    };
  }, [filteredFrigos]);

  // Leaflet map initialization (handles large datasets smoothly by limiting markers rendered if > 1500)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstance.current) {
      const map = L.map(mapContainerRef.current).setView([34.5, 9.5], 6.5);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);

      layerGroup.current = L.layerGroup().addTo(map);
      mapInstance.current = map;
    }

    if (layerGroup.current && mapInstance.current) {
      layerGroup.current.clearLayers();

      const pos = filteredFrigos.filter((f) => f.lat && f.lng);
      // Pour une performance fluide même avec 7122 points :
      const renderPoints = pos.slice(0, 1500);

      renderPoints.forEach((f) => {
        const col =
          f.risque === 'Critique'
            ? '#991B1B'
            : f.risque === 'Élevé'
            ? '#D6455D'
            : f.risque === 'Moyen'
            ? '#E0A526'
            : '#2E9E6B';

        const marker = L.circleMarker([f.lat!, f.lng!], {
          radius: 6,
          color: '#ffffff',
          weight: 1,
          fillColor: col,
          fillOpacity: 0.9
        });

        marker.bindTooltip(
          `<b>${f.serial}</b><br>${f.nomClient || ''}<br>${f.statutFrz || ''} · ${f.risque || ''}`
        );

        marker.on('click', () => setSelectedFrigo(f));
        layerGroup.current?.addLayer(marker);
      });

      if (renderPoints.length) {
        mapInstance.current.fitBounds(
          renderPoints.map((f) => [f.lat!, f.lng!]),
          { padding: [35, 35], maxZoom: 13 }
        );
      }

      setTimeout(() => mapInstance.current?.invalidateSize(), 200);
    }
  }, [filteredFrigos]);

  // Multi-sheet selection state
  const [pendingWorkbook, setPendingWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>('');
  const [sheetsList, setSheetsList] = useState<SheetInfo[]>([]);
  const [selectedSheetName, setSelectedSheetName] = useState<string>('');
  const [isSheetModalOpen, setIsSheetModalOpen] = useState<boolean>(false);

  // Direct Excel upload handler right from the banner
  const handleDirectExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadFeedback(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheets = inspectFrigosWorkbook(workbook);

        // Si le fichier contient plusieurs feuilles, demander confirmation ou choix
        if (sheets.length > 1) {
          const rec = sheets.find((s) => s.isRecommended) || sheets[0];
          setPendingWorkbook(workbook);
          setPendingFileName(file.name);
          setSheetsList(sheets);
          setSelectedSheetName(rec.name);
          setIsSheetModalOpen(true);
          setIsProcessing(false);
          return;
        }

        // Sinon, feuille unique : lecture directe
        const parsed = parseFrigosExcel(workbook, sheets[0]?.name);
        if (parsed.frigos.length === 0) {
          throw new Error("Aucun frigo trouvé avec un numéro de série dans cette feuille.");
        }

        onUpdateFrigos(parsed);
        setUploadFeedback(`Succès : ${parsed.frigos.length.toLocaleString('fr-FR')} frigos chargés depuis la feuille "${sheets[0]?.name || 'principale'}" (${file.name}) !`);
      } catch (err: any) {
        setUploadFeedback(`Erreur de lecture : ${err.message}`);
      } finally {
        setIsProcessing(false);
        e.target.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleConfirmSheet = () => {
    if (!pendingWorkbook || !selectedSheetName) return;
    setIsProcessing(true);
    try {
      const parsed = parseFrigosExcel(pendingWorkbook, selectedSheetName);
      if (parsed.frigos.length === 0) {
        throw new Error(`Aucun frigo trouvé dans la feuille "${selectedSheetName}".`);
      }
      onUpdateFrigos(parsed);
      setUploadFeedback(`Succès : ${parsed.frigos.length.toLocaleString('fr-FR')} frigos extraits de la feuille "${selectedSheetName}" (${pendingFileName}) !`);
      setIsSheetModalOpen(false);
    } catch (err: any) {
      setUploadFeedback(`Erreur : ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const locatedCount = filteredFrigos.filter((f) => f.lat && f.lng).length;

  return (
    <div className="space-y-4">
      
      {/* Prominent Banner when demo data or upload prompt */}
      {frigoData.frigos.length <= 8 ? (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-blue-600/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                Données de démonstration actuelles (8 frigos)
              </div>
              <h3 className="text-lg font-extrabold text-white">
                Chargez votre vrai fichier Excel de 7 122 frigos
              </h3>
              <p className="text-xs text-blue-200 leading-relaxed">
                Les 8 frigos affichés ci-dessous sont un exemple de test. Déposez simplement votre fichier <strong>FREEZER_LISTING (.xlsx)</strong> pour afficher instantanément vos <strong>7 122 frigos réels</strong>, leurs statuts et géolocalisations.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <label
                htmlFor="directFrigoUpload"
                className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition cursor-pointer flex items-center gap-2 ${
                  isProcessing
                    ? 'bg-slate-400 text-white cursor-wait'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-600/30'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>{isProcessing ? 'Lecture des 7 122 frigos...' : 'Charger mon fichier Excel (.xlsx)'}</span>
                <input
                  type="file"
                  id="directFrigoUpload"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleDirectExcelUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      ) : (
        /* If 7122+ rows loaded, display success banner with reload button */
        <div className="bg-emerald-900/40 border border-emerald-600/40 text-emerald-200 rounded-2xl p-3.5 px-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Fichier réel actif :</strong> {frigoData.frigos.length.toLocaleString('fr-FR')} frigos analysés et enregistrés localement.
            </span>
          </div>
          <label
            htmlFor="reloadFrigoUpload"
            className="text-xs font-semibold text-emerald-300 hover:text-white underline cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Recharger un nouveau fichier Excel</span>
            <input
              type="file"
              id="reloadFrigoUpload"
              accept=".xlsx, .xls, .csv"
              onChange={handleDirectExcelUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Upload feedback */}
      {uploadFeedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
            uploadFeedback.includes('Succès')
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {uploadFeedback.includes('Succès') ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{uploadFeedback}</span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl p-4 text-white shadow-sm bg-gradient-to-br from-blue-600 to-indigo-600">
          <b className="block text-2xl lg:text-3xl font-extrabold tracking-tight">
            {filteredFrigos.length.toLocaleString('fr-FR')}
          </b>
          <span className="text-xs text-blue-100 font-medium">Frigos</span>
        </div>

        <div className="rounded-2xl p-4 text-white shadow-sm bg-gradient-to-br from-sky-600 to-cyan-500">
          <b className="block text-2xl lg:text-3xl font-extrabold tracking-tight">
            {distinctClients.toLocaleString('fr-FR')}
          </b>
          <span className="text-xs text-sky-100 font-medium">Clients distincts</span>
        </div>

        <div className="rounded-2xl p-4 text-white shadow-sm bg-gradient-to-br from-emerald-600 to-teal-500">
          <b className="block text-2xl lg:text-3xl font-extrabold tracking-tight">
            {scannes.toLocaleString('fr-FR')}
          </b>
          <span className="text-xs text-emerald-100 font-medium">Frigos scannés</span>
        </div>

        <div className="rounded-2xl p-4 text-white shadow-sm bg-gradient-to-br from-amber-600 to-amber-500">
          <b className="block text-2xl lg:text-3xl font-extrabold tracking-tight">
            {(filteredFrigos.length - scannes).toLocaleString('fr-FR')}
          </b>
          <span className="text-xs text-amber-100 font-medium">Non scannés</span>
        </div>
      </div>

      {/* Charts: Statut FRZ & Statut Risque */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Statut FRZ</h2>
          <div className="h-[260px] flex-1">
            <canvas ref={chartStatutRef}></canvas>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Statut risque</h2>
          <div className="h-[260px] flex-1">
            <canvas ref={chartRisqueRef}></canvas>
          </div>
        </div>
      </div>

      {/* Carte des frigos */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Carte des frigos
            <span className="text-xs font-normal text-slate-500">
              ({locatedCount.toLocaleString('fr-FR')} frigos localisés sur {filteredFrigos.length.toLocaleString('fr-FR')})
            </span>
          </h2>
        </div>
        <div ref={mapContainerRef} className="h-[400px] w-full rounded-xl z-0 overflow-hidden border border-slate-200" />
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E9E6B]"></span>
            <span>Faible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E0A526]"></span>
            <span>Moyen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D6455D]"></span>
            <span>Élevé</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#991B1B]"></span>
            <span>Critique</span>
          </div>
        </div>
      </div>

      {/* Table Frigos */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Liste des frigos</span>
              <span className="text-xs font-normal text-slate-500">
                ({filteredFrigos.length > 500 ? `500 premiers affichés sur ${filteredFrigos.length.toLocaleString('fr-FR')}` : filteredFrigos.length})
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cliquez sur n'importe quel frigo pour ouvrir sa fiche détaillée d'inspection.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[520px]">
          {filteredFrigos.length ? (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 sticky top-0 z-10">
                  <th className="py-2.5 px-3 font-semibold">N° de série</th>
                  <th className="py-2.5 px-2.5 font-semibold">Code client</th>
                  <th className="py-2.5 px-3 font-semibold">Nom client</th>
                  <th className="py-2.5 px-2.5 font-semibold">Statut FRZ</th>
                  <th className="py-2.5 px-2 font-semibold">Année</th>
                  <th className="py-2.5 px-2.5 font-semibold">Chef de zone</th>
                  <th className="py-2.5 px-2.5 font-semibold">Représentant</th>
                  <th className="py-2.5 px-2.5 font-semibold">Statut risque</th>
                  <th className="py-2.5 px-2 text-right font-semibold">Score</th>
                  <th className="py-2.5 px-2 text-right font-semibold">Nb scan</th>
                  <th className="py-2.5 px-2.5 font-semibold">Dernier scan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredFrigos.slice(0, 500).map((f) => (
                  <tr
                    key={f.serial}
                    onClick={() => setSelectedFrigo(f)}
                    className="hover:bg-blue-50/60 cursor-pointer transition"
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-blue-700 whitespace-nowrap">
                      {f.serial}
                    </td>
                    <td className="py-2.5 px-2.5 font-mono text-slate-600 whitespace-nowrap">
                      {f.codeClient}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                      {f.nomClient || '—'}
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {f.statutFrz || '—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-mono whitespace-nowrap">{f.annee || '—'}</td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap">{f.chefZone || '—'}</td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap">{f.nomRep || '—'}</td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          f.risque === 'Critique' || f.risque === 'Élevé'
                            ? 'bg-rose-100 text-rose-800'
                            : f.risque === 'Moyen'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {f.risque || '—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-semibold whitespace-nowrap">
                      {f.score}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-semibold text-blue-700 whitespace-nowrap">
                      {f.nbScan}
                    </td>
                    <td className="py-2.5 px-2.5 font-mono text-slate-600 whitespace-nowrap">
                      {frDate(f.dateDernScan)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">Aucun frigo avec ces filtres.</p>
          )}
        </div>
      </div>

      {/* Fiche Frigo Modal */}
      <FrigoModal frigo={selectedFrigo} onClose={() => setSelectedFrigo(null)} />

      {/* Modal choix de feuille si plusieurs feuilles */}
      <SheetSelectModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        sheets={sheetsList}
        selectedSheet={selectedSheetName}
        setSelectedSheet={setSelectedSheetName}
        onConfirm={handleConfirmSheet}
        fileName={pendingFileName}
      />
    </div>
  );
};
