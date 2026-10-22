import React from 'react';
import { Mic, X, Sparkles, RotateCcw, Volume2 } from 'lucide-react';
import { VoiceParsedResult, speakDerjaConfirmation } from '../services/voiceParser';

interface VoiceFilterBannerProps {
  activeVoiceFilter: VoiceParsedResult | null;
  onClear: () => void;
  onOpenVoiceModal: () => void;
  totalFiltered: number;
}

export const VoiceFilterBanner: React.FC<VoiceFilterBannerProps> = ({
  activeVoiceFilter,
  onClear,
  onOpenVoiceModal,
  totalFiltered
}) => {
  if (!activeVoiceFilter) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 rounded-2xl p-3.5 text-white shadow-md mb-4 flex items-center justify-between gap-4 flex-wrap animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
          <Mic className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-300" />
              Assistant Vocal :
            </span>
            <span className="text-xs font-semibold text-white italic">
              « {activeVoiceFilter.rawTranscript} »
            </span>
            <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full text-white">
              {totalFiltered} résultat{totalFiltered > 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-[11px] text-sky-100/90 mt-0.5 flex items-center gap-2 flex-wrap">
            {activeVoiceFilter.derjaConfirmation && (
              <span className="font-semibold text-white bg-white/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span>{activeVoiceFilter.derjaConfirmation}</span>
                <button
                  type="button"
                  onClick={() => speakDerjaConfirmation(activeVoiceFilter.derjaConfirmation)}
                  className="hover:text-sky-200 transition cursor-pointer"
                  title="Aawed smaani"
                >
                  <Volume2 className="w-3 h-3 inline" />
                </button>
              </span>
            )}
            <span>· {activeVoiceFilter.explanation}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenVoiceModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold text-white border border-white/20 transition cursor-pointer"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Etkallem marra okhra</span>
        </button>
        <button
          onClick={onClear}
          title="Faskh el filtre"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-800 hover:bg-slate-100 text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
          <span>Faskh el filtre</span>
        </button>
      </div>
    </div>
  );
};
