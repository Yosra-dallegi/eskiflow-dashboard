import React from 'react';
import { X, Check, FileSpreadsheet, Layers } from 'lucide-react';

export interface SheetInfo {
  name: string;
  rowCount: number;
  isRecommended: boolean;
}

interface SheetSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheets: SheetInfo[];
  selectedSheet: string;
  setSelectedSheet: (name: string) => void;
  onConfirm: () => void;
  fileName: string;
}

export const SheetSelectModal: React.FC<SheetSelectModalProps> = ({
  isOpen,
  onClose,
  sheets,
  selectedSheet,
  setSelectedSheet,
  onConfirm,
  fileName
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Sélectionner la feuille à lire
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-[260px]">
              Fichier : {fileName}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Ce fichier contient <strong>{sheets.length} feuilles</strong>. Choisissez celle qui contient la base des frigos (par défaut : <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">FREEZER_LISTING</code>) :
        </p>

        {/* Sheet Radio List */}
        <div className="space-y-2 max-h-60 overflow-y-auto mb-5 pr-1">
          {sheets.map((s) => (
            <label
              key={s.name}
              onClick={() => setSelectedSheet(s.name)}
              className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                selectedSheet === s.name
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="sheetSelect"
                  checked={selectedSheet === s.name}
                  onChange={() => setSelectedSheet(s.name)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <FileSpreadsheet className={`w-4 h-4 ${selectedSheet === s.name ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="font-mono">{s.name}</span>
              </div>

              <div className="flex items-center gap-2">
                {s.isRecommended && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Recommandée
                  </span>
                )}
                <span className="text-[11px] text-slate-500 font-mono">
                  {s.rowCount > 0 ? `~${s.rowCount.toLocaleString('fr-FR')} lignes` : 'Feuille vide'}
                </span>
              </div>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Lire cette feuille uniquement</span>
          </button>
        </div>
      </div>
    </div>
  );
};
