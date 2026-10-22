import React, { useState } from 'react';
import { X, Check, FileSpreadsheet, Upload, CheckCircle2, AlertCircle, RefreshCw, HardDrive, Sparkles, Link2, Smartphone } from 'lucide-react';
import * as XLSX from 'xlsx';
import { parseTasksExcel, parseRealisationExcel, parseFrigosExcel, inspectFrigosWorkbook, SheetInfo } from '../services/excelReaderService';
import { SheetSelectModal } from './SheetSelectModal';
import { TaskItem, RealisationData, FrigoData } from '../types/task';
import { storageService } from '../services/storageService';

interface ExcelSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateTasks: (tasks: TaskItem[]) => void;
  onUpdateRealisation: (real: RealisationData) => void;
  onUpdateFrigos: (frz: FrigoData) => void;
  onResetToDemo: () => void;
  currentTasksCount: number;
  currentRealisationCount: number;
  currentFrigosCount: number;
}

export const ExcelSyncModal: React.FC<ExcelSyncModalProps> = ({
  isOpen,
  onClose,
  onUpdateTasks,
  onUpdateRealisation,
  onUpdateFrigos,
  onResetToDemo,
  currentTasksCount,
  currentRealisationCount,
  currentFrigosCount
}) => {
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Google Sheets Tasks URL / ID state
  const [tasksUrlInput, setTasksUrlInput] = useState<string>(() => storageService.loadTasksFileId());
  const [tasksIdFeedback, setTasksIdFeedback] = useState<string | null>(null);

  const handleSaveTasksFileId = () => {
    let raw = tasksUrlInput.trim();
    // Extract ID if full Google Sheets URL provided
    const match = raw.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const id = match ? match[1] : raw;
    storageService.saveTasksFileId(id);
    setTasksIdFeedback(`Liaison enregistrée (ID : ${id || 'Aucun'}). Cliquez sur « Actualiser » dans la barre du haut pour synchroniser.`);
    setTimeout(() => setTasksIdFeedback(null), 6000);
  };

  // Multi-sheet selection state
  const [pendingWorkbook, setPendingWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>('');
  const [sheetsList, setSheetsList] = useState<SheetInfo[]>([]);
  const [selectedSheetName, setSelectedSheetName] = useState<string>('');
  const [isSheetModalOpen, setIsSheetModalOpen] = useState<boolean>(false);

  const handleConfirmSheet = () => {
    if (!pendingWorkbook || !selectedSheetName) return;
    try {
      const parsed = parseFrigosExcel(pendingWorkbook, selectedSheetName);
      if (parsed.frigos.length === 0) {
        throw new Error(`Aucun frigo trouvé dans la feuille "${selectedSheetName}".`);
      }
      onUpdateFrigos(parsed);
      setFeedback({
        type: 'success',
        message: `Succès : ${parsed.frigos.length.toLocaleString('fr-FR')} frigos extraits de la feuille "${selectedSheetName}" (${pendingFileName}) !`
      });
      setIsSheetModalOpen(false);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Erreur : ${err.message}`
      });
    }
  };

  if (!isOpen) return null;

  const handleFileProcess = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'tasks' | 'realisation' | 'frigos'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingType(target);
    setFeedback(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });

        if (target === 'tasks') {
          const parsed = parseTasksExcel(workbook);
          if (parsed.length === 0) {
            throw new Error("Aucune ligne de tâche valide trouvée. Vérifiez les en-têtes (id_tache, code_client, etc.).");
          }
          onUpdateTasks(parsed);
          setFeedback({
            type: 'success',
            message: `Succès : ${parsed.length} tâches lues et enrichies depuis "${file.name}".`
          });
        } else if (target === 'realisation') {
          const parsed = parseRealisationExcel(workbook);
          if (parsed.rows.length === 0) {
            throw new Error("Aucune vente trouvée avec les critères ou format attendu.");
          }
          onUpdateRealisation(parsed);
          setFeedback({
            type: 'success',
            message: `Succès : ${parsed.rows.length} lignes mensuelles pour ${Object.keys(parsed.noms).length} clients.`
          });
        } else if (target === 'frigos') {
          const sheets = inspectFrigosWorkbook(workbook);
          if (sheets.length > 1) {
            const rec = sheets.find((s) => s.isRecommended) || sheets[0];
            setPendingWorkbook(workbook);
            setPendingFileName(file.name);
            setSheetsList(sheets);
            setSelectedSheetName(rec.name);
            setIsSheetModalOpen(true);
            setLoadingType(null);
            return;
          }

          const parsed = parseFrigosExcel(workbook, sheets[0]?.name);
          if (parsed.frigos.length === 0) {
            throw new Error("Aucun frigo trouvé avec un SERIALNUMBER.");
          }
          onUpdateFrigos(parsed);
          setFeedback({
            type: 'success',
            message: `Succès : ${parsed.frigos.length.toLocaleString('fr-FR')} frigos extraits de la feuille "${sheets[0]?.name || 'principale'}" (${file.name}).`
          });
        }
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: `Erreur lors de la lecture du fichier : ${err.message}`
        });
      } finally {
        setLoadingType(null);
        e.target.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl relative border border-slate-200"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Head */}
        <div className="mb-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" />
              100% Autonome (Sans Apps Script)
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Gestionnaire des données Excel (.xlsx / .csv)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            L'application lit et analyse vos fichiers Excel localement et stocke vos données de manière sécurisée et persistante dans votre navigateur.
          </p>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 mb-5 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* 3 Upload Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          {/* 1. Tâches & Clients */}
          <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {currentTasksCount} tâches
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">Tâches & Clients</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Fichier Excel des tâches d'équipe avec ou sans onglet "Clients" enrichi.
              </p>
            </div>

            <div>
              <input
                type="file"
                id="tasksFileInput"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => handleFileProcess(e, 'tasks')}
                className="hidden"
              />
              <label
                htmlFor="tasksFileInput"
                className={`w-full py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  loadingType === 'tasks'
                    ? 'bg-slate-200 text-slate-500'
                    : 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{loadingType === 'tasks' ? 'Lecture...' : 'Charger .xlsx'}</span>
              </label>
            </div>
          </div>

          {/* 2. Réalisation Ventes */}
          <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {currentRealisationCount} ventes
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">Réalisation Mensuelle</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Fichier des factures sell-out (HT, date, client, société NTN).
              </p>
            </div>

            <div>
              <input
                type="file"
                id="realFileInput"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => handleFileProcess(e, 'realisation')}
                className="hidden"
              />
              <label
                htmlFor="realFileInput"
                className={`w-full py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  loadingType === 'realisation'
                    ? 'bg-slate-200 text-slate-500'
                    : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{loadingType === 'realisation' ? 'Lecture...' : 'Charger .xlsx'}</span>
              </label>
            </div>
          </div>

          {/* 3. Parc Frigos */}
          <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  {currentFrigosCount} frigos
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">Parc Frigos (Listing)</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Fichier FREEZER_LISTING avec numéros de série, scans et risques.
              </p>
            </div>

            <div>
              <input
                type="file"
                id="frzFileInput"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => handleFileProcess(e, 'frigos')}
                className="hidden"
              />
              <label
                htmlFor="frzFileInput"
                className={`w-full py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  loadingType === 'frigos'
                    ? 'bg-slate-200 text-slate-500'
                    : 'bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 shadow-xs'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{loadingType === 'frigos' ? 'Lecture...' : 'Charger .xlsx'}</span>
              </label>
            </div>
          </div>

        </div>

        {/* Liaison Tâches Google Drive (Onglet Taches) */}
        <div className="bg-indigo-50/80 border border-indigo-200/90 rounded-xl p-4 mb-5 space-y-2.5 text-xs text-slate-700">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-indigo-900 font-bold">
              <Link2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Liaison automatique Google Drive : Tâches ↔ Base Clients</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold font-mono">
              Onglet "Taches" + Base Clients
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Si vos tâches sont dans un classeur Google Sheets séparé, collez ci-dessous son lien ou son identifiant Drive. Le bouton <strong>« 🔄 Actualiser »</strong> de la barre supérieure rapprochera chaque tâche avec son client, son Chef de zone et son chiffre d'affaires.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tasksUrlInput}
              onChange={(e) => setTasksUrlInput(e.target.value)}
              placeholder="Ex: https://docs.google.com/spreadsheets/d/... ou ID de classeur"
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
            />
            <button
              type="button"
              onClick={handleSaveTasksFileId}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition cursor-pointer"
            >
              Enregistrer
            </button>
          </div>
          {tasksIdFeedback && (
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{tasksIdFeedback}</span>
            </p>
          )}
        </div>

        {/* Liaison AppSheet */}
        <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-4 mb-5 space-y-2.5 text-xs text-slate-700">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Liaison avec Google AppSheet (Application Mobile Terrain)</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold font-mono">
              AppSheet ↔ Drive ↔ Eskiflow
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Pour que vos commerciaux et chefs de zone saisissent les tâches sur le terrain via l'application mobile <strong>AppSheet</strong> :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            <div className="bg-white p-2.5 rounded-lg border border-emerald-100 space-y-1">
              <strong className="text-slate-900 block text-[11px] font-bold">1. Source de données partagée (Méthode native)</strong>
              <p className="text-[11px] text-slate-600">
                Dans AppSheet, choisissez comme source le classeur Google Sheets (onglet <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-mono">Taches</code>). Toute saisie sur mobile se synchronise directement sur Drive et s'affiche ici lors de l'actualisation.
              </p>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-100 space-y-1">
              <strong className="text-slate-900 block text-[11px] font-bold">2. Webhook direct temps réel (Automation Bot)</strong>
              <p className="text-[11px] text-slate-600">
                Dans AppSheet &gt; Automation &gt; Bots, configurez une tâche <em>Call a webhook</em> (POST) vers :
              </p>
              <code className="block bg-slate-50 border border-slate-200 rounded p-1 text-[10px] text-slate-700 select-all font-mono">
                {window.location.origin}/api/appsheet/webhook
              </code>
            </div>
          </div>
        </div>

        {/* Daily Update Explanations */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 mb-5 space-y-2.5 text-xs text-slate-700">
          <div className="flex items-center gap-2 text-blue-900 font-bold">
            <RefreshCw className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Comment se fait la mise à jour (MAJ) quotidienne ?</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
              <strong className="text-slate-900 block text-xs">Option A : En 1 clic (Glisser-Déposer quotidien)</strong>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Chaque matin, dès que votre extraction Excel est générée (ex: vos nouveaux 7 122 frigos), cliquez sur <strong>[Charger .xlsx]</strong>. Le nouveau fichier écrase l'ancien en 1 seconde et actualise immédiatement l'horodatage.
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
              <strong className="text-slate-900 block text-xs">Option B : Directement depuis l'onglet « Suivi Frigos »</strong>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Dans l'onglet des frigos, un lien vert <strong>« Recharger un nouveau fichier Excel »</strong> vous permet de sélectionner votre nouveau fichier du jour sans même ouvrir cette boîte de dialogue.
              </p>
            </div>
          </div>
        </div>

        {/* Persistence Info Banner */}
        <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-600 mb-5">
          <HardDrive className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-slate-900 block">Sauvegarde automatique dans le navigateur</strong>
            <p>
              Toutes les données importées sont automatiquement conservées en local. Lorsque vous fermez votre navigateur et revenez demain, vos graphiques, cartes et tableaux sont immédiatement disponibles.
            </p>
          </div>
        </div>

        {/* Modal actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onResetToDemo}
            className="text-xs font-medium text-rose-600 hover:text-rose-700 transition cursor-pointer"
          >
            Rétablir les données d'exemple Eskimo / Paname
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition cursor-pointer"
          >
            Fermer et afficher le Dashboard
          </button>
        </div>

        {/* Modal sélection feuille pour frigos */}
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
    </div>
  );
};
