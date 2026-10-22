import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Volume2,
  Sparkles,
  Check,
  X,
  AlertCircle,
  Search,
  SlidersHorizontal,
  ChevronRight,
  MessageSquare,
  Globe,
  Zap
} from 'lucide-react';
import {
  parseVoiceQuery,
  VoiceParsedResult,
  playVoiceFeedbackSound,
  speakConfirmation
} from '../services/voiceParser';
import { TaskItem } from '../types/task';

interface VoiceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (result: VoiceParsedResult) => void;
  uniqueChefs: string[];
  uniqueCdrs: string[];
  uniqueTitres: string[];
  tasks: TaskItem[];
}

export const VoiceFilterModal: React.FC<VoiceFilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  uniqueChefs,
  uniqueCdrs,
  uniqueTitres,
  tasks
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<'fr-FR' | 'ar-TN'>('fr-FR');
  const [autoApply, setAutoApply] = useState<boolean>(true);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [parsed, setParsed] = useState<VoiceParsedResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [manualText, setManualText] = useState<string>('');

  const recognitionRef = useRef<any>(null);

  // Suggestions bilingues Franco-Arabe (Derja) & Français
  const exampleQueries = [
    'Nheb nchouf el khedma mtaa Ahmed',
    'Warini les taches elli kemlou',
    'Warini les taches elli mazelou',
    'Warini elli mouakhrin',
    'المهام المنتهية متاع احمد',
    'المهام المتأخرة الكل',
    uniqueCdrs.length > 0 ? `Nheb nchouf ${uniqueCdrs[0]}` : 'Nheb nchouf Tunis',
    uniqueChefs.length > 0 ? `Taches mtaa ${uniqueChefs[0]}` : 'Taches du chef de zone',
    'Riguel kol chay (فسخ الفلاتر)'
  ];

  // Calcul instantané optimisé du nombre de résultats
  const matchedCount = React.useMemo(() => {
    if (!parsed) return null;
    if (parsed.isReset) return tasks.length;

    let count = 0;
    const q = parsed.search ? parsed.search.toLowerCase() : '';

    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      if (parsed.etat && t.etat !== parsed.etat) continue;
      if (parsed.chef && t.chef !== parsed.chef) continue;
      if (parsed.cdr && t.cdr !== parsed.cdr) continue;
      if (parsed.titre && t.titre !== parsed.titre) continue;
      if (parsed.fid === 'oui' && !t.inscrit) continue;
      if (parsed.fid === 'non' && t.inscrit) continue;
      if (q) {
        const str = `${t.code} ${t.clientNom} ${t.repr} ${t.demandeur} ${t.realisePar} ${t.titre} ${t.chef} ${t.cdr}`.toLowerCase();
        if (!str.includes(q)) continue;
      }
      count++;
    }
    return count;
  }, [parsed, tasks]);

  // Initialisation du Web Speech API avec sélection de langue dynamique
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
        playVoiceFeedbackSound('start');
      };

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTrans += item[0].transcript;
          } else {
            interimTrans += item[0].transcript;
          }
        }

        if (finalTrans) {
          setTranscript(finalTrans);
          setInterimTranscript('');
          const result = parseVoiceQuery(finalTrans, {
            uniqueChefs,
            uniqueCdrs,
            uniqueTitres
          });
          setParsed(result);
          playVoiceFeedbackSound('success');

          // Confirmation vocale immédiate
          speakConfirmation(result.derjaConfirmation, selectedLang);

          // Si l'application automatique est activée, applique après un court instant
          if (autoApply) {
            setTimeout(() => {
              onApplyFilters(result);
              onClose();
            }, 1200);
          }
        } else if (interimTrans) {
          setInterimTranscript(interimTrans);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg("L'accès au micro a été refusé. Veuillez autoriser le micro dans votre navigateur.");
        } else if (event.error === 'no-speech') {
          setErrorMsg("Aucune voix détectée. Aawed marra okhra.");
        } else {
          setErrorMsg(`Information : ${event.error}`);
        }
        playVoiceFeedbackSound('error');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e: any) {
      setIsSupported(false);
      setErrorMsg(e.message);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [selectedLang, autoApply, uniqueChefs, uniqueCdrs, uniqueTitres, onApplyFilters, onClose]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setErrorMsg(null);
    setTranscript('');
    setInterimTranscript('');
    setParsed(null);
    try {
      recognitionRef.current.start();
    } catch {
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current?.start(), 120);
      } catch {
        // ignore
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  const handleSimulateVoice = (phrase: string) => {
    setTranscript(phrase);
    setInterimTranscript('');
    const result = parseVoiceQuery(phrase, {
      uniqueChefs,
      uniqueCdrs,
      uniqueTitres
    });
    setParsed(result);
    playVoiceFeedbackSound('success');
    speakConfirmation(result.derjaConfirmation, selectedLang);

    if (autoApply) {
      setTimeout(() => {
        onApplyFilters(result);
        onClose();
      }, 1000);
    }
  };

  const handleApply = () => {
    if (parsed) {
      speakConfirmation(parsed.derjaConfirmation, selectedLang);
      onApplyFilters(parsed);
      onClose();
    }
  };

  // Auto démarrer l'écoute à l'ouverture si supporté
  useEffect(() => {
    if (isOpen && isSupported) {
      const timer = setTimeout(() => {
        startListening();
      }, 250);
      return () => clearTimeout(timer);
    } else if (!isOpen) {
      stopListening();
      setTranscript('');
      setInterimTranscript('');
      setParsed(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
              <Mic className="w-5 h-5 text-sky-200 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Assistant Vocal Intelligent</span>
                <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full text-sky-100">
                  Derja & Français
                </span>
              </h3>
              <p className="text-[11px] text-sky-100/90">
                Ahki m3aya en derja walla français bech nriguel el filtres
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar: Langue & Auto-Apply */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          {/* Sélecteur de langue */}
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Langue du micro :</span>
            <div className="inline-flex rounded-lg bg-slate-200/70 p-0.5">
              <button
                type="button"
                onClick={() => setSelectedLang('fr-FR')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  selectedLang === 'fr-FR' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇫🇷 Français / Franco-Arabe
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('ar-TN')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  selectedLang === 'ar-TN' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇹🇳 Arabe / Derja
              </button>
            </div>
          </div>

          {/* Option application automatique */}
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-700 select-none">
            <input
              type="checkbox"
              checked={autoApply}
              onChange={(e) => setAutoApply(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
            />
            <Zap className={`w-3 h-3 ${autoApply ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>Application instantanée</span>
          </label>
        </div>

        {/* Corps du modal */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Zone interactive du Microphone */}
          <div className="flex flex-col items-center justify-center text-center py-4 bg-slate-50/80 rounded-2xl border border-slate-100 relative overflow-hidden">
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="w-28 h-28 rounded-full bg-blue-500/10 animate-ping" />
                <span className="w-44 h-44 rounded-full bg-indigo-500/10 animate-pulse" />
              </div>
            )}

            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg cursor-pointer ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-500 to-red-600 text-white scale-105 shadow-rose-500/30 ring-4 ring-rose-200 animate-pulse'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:scale-105 shadow-blue-500/30'
              }`}
              title={isListening ? 'Cliquez pour arrêter' : 'Cliquez pour parler'}
            >
              {isListening ? (
                <div className="flex flex-col items-center">
                  <Mic className="w-7 h-7" />
                  <span className="text-[9px] font-bold mt-0.5 uppercase tracking-wider">Arrêter</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Mic className="w-7 h-7" />
                  <span className="text-[9px] font-bold mt-0.5 uppercase tracking-wider">Parler</span>
                </div>
              )}
            </button>

            <div className="mt-3 z-10">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isListening
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {isListening ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    Hani nasmaa fik... Etkallem tawa
                  </>
                ) : (
                  <>Touchez le micro pour parler</>
                )}
              </span>
            </div>

            {/* Transcription en direct */}
            {(transcript || interimTranscript) && (
              <div className="mt-3 px-4 py-2 max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-xs z-10">
                <p className="text-[10px] text-slate-400 font-medium mb-0.5">Ce qui a été capté :</p>
                <p className="text-xs font-semibold text-slate-800 italic">
                  « {transcript || interimTranscript} »
                  {interimTranscript && !transcript && (
                    <span className="inline-block w-1.5 h-3 bg-blue-500 ml-1 animate-pulse" />
                  )}
                </p>
              </div>
            )}

            {/* Message d'erreur */}
            {errorMsg && (
              <div className="mt-2.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2 max-w-md z-10">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Résultat analysé / Interprétation */}
          {parsed && (
            <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-sky-50/80 rounded-2xl p-3.5 border border-blue-200 shadow-xs space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Résultat de l'analyse
                </span>
                {matchedCount !== null && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                    {matchedCount} tâche{matchedCount > 1 ? 's' : ''} trouvée{matchedCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Dialogue Assistant */}
              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-blue-100 shadow-xs">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Assistant Derja</span>
                    <button
                      type="button"
                      onClick={() => speakConfirmation(parsed.derjaConfirmation, selectedLang)}
                      className="text-slate-400 hover:text-blue-600 transition flex items-center gap-1 text-[10px] cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Répéter</span>
                    </button>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    « {parsed.derjaConfirmation} »
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {parsed.explanation}
                  </p>
                </div>
              </div>

              {/* Badges filtres */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {parsed.badges.map((b, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${b.color}`}
                  >
                    <span className="opacity-70 font-normal">{b.label} :</span>
                    <span>{b.value}</span>
                  </span>
                ))}
              </div>

              {/* Bouton Appliquer */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {autoApply ? '⚡ Application automatique active...' : 'Cliquez pour valider :'}
                </span>
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Appliquer au tableau</span>
                </button>
              </div>
            </div>
          )}

          {/* Suggestions en 1 clic */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              Exemples rapides à tester en 1 clic :
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {exampleQueries.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSimulateVoice(ex)}
                  className="text-left px-2.5 py-1.5 rounded-xl text-[11px] bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200/80 text-slate-700 hover:text-blue-900 transition flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate pr-1">« {ex} »</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Saisie manuelle de secours */}
          <div className="pt-2 border-t border-slate-100 flex gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
              <input
                type="text"
                placeholder="Ou tapez en texte : ex: Taches kemlou mtaa Ahmed"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && manualText.trim()) {
                    handleSimulateVoice(manualText.trim());
                  }
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (manualText.trim()) handleSimulateVoice(manualText.trim());
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Tester
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-blue-500" />
            <span>Filtre instantané sur les 3 onglets</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-200/80 hover:bg-slate-300 rounded-xl transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
