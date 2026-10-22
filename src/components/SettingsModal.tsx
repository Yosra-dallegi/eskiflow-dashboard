import React, { useState } from 'react';
import { X, Check, Globe, Database, HelpCircle, Clock, Zap, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  webAppUrl: string;
  setWebAppUrl: (url: string) => void;
  isLive: boolean;
  setIsLive: (live: boolean) => void;
  onResetData: () => void;
  onImportJson: (jsonString: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  webAppUrl,
  setWebAppUrl,
  isLive,
  setIsLive,
  onResetData,
  onImportJson
}) => {
  const [urlInput, setUrlInput] = useState(webAppUrl);
  const [tab, setTab] = useState<'appscript' | 'explication' | 'upload'>('explication');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isTestingUrl, setIsTestingUrl] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setWebAppUrl(urlInput);
    if (urlInput.trim()) {
      setIsLive(true);
    } else {
      setIsLive(false);
    }
    onClose();
  };

  const handleTestUrl = async () => {
    if (!urlInput.trim()) return;
    setIsTestingUrl(true);
    setImportStatus(null);
    try {
      const res = await fetch(urlInput.trim());
      const data = await res.json();
      if (data && (data.taches || data.rows || data.frigos)) {
        setImportStatus('Connexion réussie ! Données reçues du script Apps Script.');
        setIsLive(true);
      } else {
        setImportStatus('Réponse reçue, mais le format de données attendu (taches/frigos) est absent.');
      }
    } catch (e: any) {
      setImportStatus('Impossible de joindre la Web App : vérifiez que le déploiement est accessible ("Tout le monde" ou "Même domaine").');
    } finally {
      setIsTestingUrl(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet);

        setImportStatus(`${jsonRows.length} lignes chargées depuis "${file.name}".`);
      } catch (err: any) {
        setImportStatus('Erreur lors de la lecture du fichier Excel : ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl relative border border-slate-200"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4 pb-3 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Lecture quotidienne des fichiers Excel & Sources
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Découvrez le fonctionnement de la lecture quotidienne ou reliez votre Google Web App.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold mb-5">
          <button
            onClick={() => setTab('explication')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              tab === 'explication' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            Comment ça marche ?
          </button>
          <button
            onClick={() => setTab('appscript')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              tab === 'appscript' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            Lier la Web App Live (/exec)
          </button>
          <button
            onClick={() => setTab('upload')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              tab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            Charger un fichier Excel (.xlsx)
          </button>
        </div>

        {/* Tab 1: Explication détaillée */}
        {tab === 'explication' && (
          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
              <h4 className="font-bold text-blue-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-700" />
                1. L'automatisation quotidienne à 6h00 (Google Triggers)
              </h4>
              <p className="text-slate-700">
                Vos scripts <code>Realisation.gs</code> et <code>Frigos.gs</code> contiennent les fonctions :
              </p>
              <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[11px] space-y-1">
                <div>creerDeclencheurRealisation() // Lance preparerRealisation() chaque matin à 6h</div>
                <div>creerDeclencheurFrigos()      // Lance preparerFrigos() chaque matin à 6h</div>
              </div>
              <p className="text-slate-700 pt-1">
                <strong>Avantage :</strong> Même si le fichier Excel fait des dizaines de mégaoctets et 100 000 lignes, le calcul se fait en tâche de fond le matin. Les utilisateurs n'ont aucune attente lorsqu'ils ouvrent l'application !
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                2. Comment le fichier Excel (.xlsx) est lu par Google Apps Script
              </h4>
              <p>
                Google Apps Script ne peut pas ouvrir nativement un fichier <code>.xlsx</code> par <code>SpreadsheetApp</code> sans le convertir. Vos scripts utilisent deux techniques très performantes :
              </p>
              <ul className="list-disc pl-4 space-y-1 pt-1 text-slate-700">
                <li>
                  <strong>Pour Realisation.gs :</strong> Le fichier est converti automatiquement UNE seule fois via <code>Drive.Files.copy</code> (Drive API v3). Tant que la date de modification du fichier Excel dans Drive n'a pas changé (<code>fichier.getLastUpdated()</code>), la copie en cache est réutilisée instantanément.
                </li>
                <li>
                  <strong>Pour Frigos.gs :</strong> La fonction <code>lireValeursEnregistrees_</code> dézippe directement le fichier Excel (un <code>.xlsx</code> est un conteneur ZIP de fichiers XML) et lit les cellules brutes via <code>Utilities.unzip(blob)</code> en mémoire vive, sans même faire de conversion Google Sheet !
                </li>
              </ul>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                3. Le Cache Drive JSON (Ultra-rapide)
              </h4>
              <p>
                Une fois calculé, le résultat est stocké dans un fichier JSON léger dans votre Google Drive (<code>cacheDriveEcrire_</code>).
                Lorsque la Web App est appelée, elle renvoie ce JSON en <strong>moins de 200 millisecondes</strong> !
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Lier la Web App */}
        {tab === 'appscript' && (
          <form onSubmit={handleSaveUrl} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL de votre Web App déployée (se termine par /exec)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleTestUrl}
                  disabled={isTestingUrl || !urlInput.trim()}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingUrl ? 'animate-spin' : ''}`} />
                  <span>Tester</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Pour obtenir cette URL : dans votre éditeur Google Apps Script, cliquez sur <strong>Déployer &gt; Gérer les déploiements &gt; Copier l'URL de l'application Web</strong>.
              </p>
            </div>

            {importStatus && (
              <div
                className={`p-3 rounded-lg text-xs font-medium ${
                  importStatus.includes('réussie')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {importStatus}
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs text-slate-600">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                Fichiers Google Drive identifiés dans vos codes :
              </span>
              <div className="flex justify-between">
                <span>Base Clients :</span>
                <code className="font-mono text-[11px]">14g_5J2EDKs48CUGGdvHGPOhnuRhmx2mw</code>
              </div>
              <div className="flex justify-between">
                <span>Réalisation Sell-Out :</span>
                <code className="font-mono text-[11px]">1l4kAb0Ef-JCfr8dRIPSVYkEaa2S8Gsh3</code>
              </div>
              <div className="flex justify-between">
                <span>Parc Frigos :</span>
                <code className="font-mono text-[11px]">1L8O1npeycGhvF-Rohc3dK67FbQMoV9oh</code>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setUrlInput('');
                  setIsLive(false);
                  onResetData();
                  onClose();
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
              >
                Réinitialiser sur le jeu de test
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer la Web App</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Upload Excel direct */}
        {tab === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 text-center bg-slate-50/50 transition">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                id="excelUploadInput"
                className="hidden"
              />
              <label
                htmlFor="excelUploadInput"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Database className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  Cliquez pour charger un fichier Excel (.xlsx) ou CSV
                </span>
                <span className="text-xs text-slate-500">
                  Ex: fichier des tâches, fichier frigos ou export sell-out
                </span>
              </label>
            </div>

            {importStatus && (
              <p className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                {importStatus}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
