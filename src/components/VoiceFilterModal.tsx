import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Check,
  RotateCcw,
  X,
  AlertCircle,
  HelpCircle,
  Search,
  SlidersHorizontal,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import {
  parseVoiceQuery,
  VoiceParsedResult,
  playVoiceFeedbackSound,
  speakDerjaConfirmation
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
    'Je veux voir tous les taches terminer par Ahmed',
    uniqueCdrs.length > 0 ? `Nheb nchouf ${uniqueCdrs[0]}` : 'Nheb nchouf Tunis',
    uniqueChefs.length > 0 ? `Taches mtaa ${uniqueChefs[0]}` : 'Taches du chef de zone',
    'Riguel kol chay'
  ];

  // Calcul du nombre de résultats correspondant à la commande analysée
  const matchedCount = React.useMemo(() => {
    if (!parsed) return null;
    if (parsed.isReset) return tasks.length;

    return tasks.filter((t) => {
      if (parsed.etat && t.etat !== parsed.etat) return false;
      if (parsed.chef && t.chef !== parsed.chef) return false;
      if (parsed.cdr && t.cdr !== parsed.cdr) return false;
      if (parsed.titre && t.titre !== parsed.titre) return false;
      if (parsed.fid === 'oui' && !t.inscrit) return false;
      if (parsed.fid === 'non' && t.inscrit) return false;
      if (parsed.search) {
        const q = parsed.search.toLowerCase();
        const haystack = [
          t.code,
          t.clientNom,
          t.repr,
          t.demandeur,
          t.realisePar,
          t.titre,
          t.chef,
          t.cdr,
          t.id
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    }).length;
  }, [parsed, tasks]);

  // Initialisation du Web Speech API
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
      recognition.lang = 'fr-FR'; // Reconnaissance vocale

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
          // Annonce vocale immédiate en Derja par l'assistant
          speakDerjaConfirmation(result.derjaConfirmation);
        } else if (interimTrans) {
          setInterimTranscript(interimTrans);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg(
            "L'accès au micro a été refusé. Veuillez autoriser le microphone dans votre navigateur."
          );
        } else if (event.error === 'no-speech') {
          setErrorMsg("Aucune voix détectée. Aawed marra okhra.");
        } else {
          setErrorMsg(`Erreur : ${event.error}`);
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
  }, [uniqueChefs, uniqueCdrs, uniqueTitres]);

  // Démarrer l'enregistrement vocal
  const startListening = () => {
    if (!recognitionRef.current) return;
    setErrorMsg(null);
    setTranscript('');
    setInterimTranscript('');
    setParsed(null);
    try {
      recognitionRef.current.start();
    } catch {
      recognitionRef.current.stop();
      setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch {
          // ignore
        }
      }, 150);
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

  // Traiter un exemple ou une saisie manuelle
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
    speakDerjaConfirmation(result.derjaConfirmation);
  };

  // Appliquer définitivement
  const handleApply = () => {
    if (parsed) {
      speakDerjaConfirmation(parsed.derjaConfirmation);
      onApplyFilters(parsed);
      onClose();
    }
  };

  // Auto démarrer l'écoute à l'ouverture si supporté
  useEffect(() => {
    if (isOpen && isSupported) {
      const timer = setTimeout(() => {
        startListening();
      }, 300);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Mic className="w-5 h-5 text-sky-200 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Assistant Vocal Intelligent</span>
                <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full text-sky-100">
                  Derja & Français
                </span>
              </h3>
              <p className="text-xs text-sky-100/90">
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

        {/* Corps du modal */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Zone interactive du Microphone */}
          <div className="flex flex-col items-center justify-center text-center py-4 bg-slate-50/70 rounded-2xl border border-slate-100 relative overflow-hidden">
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="w-32 h-32 rounded-full bg-blue-500/10 animate-ping" />
                <span className="w-48 h-48 rounded-full bg-indigo-500/10 animate-pulse" />
                <span className="w-64 h-64 rounded-full bg-sky-500/5 animate-pulse" />
              </div>
            )}

            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-500 to-red-600 text-white scale-110 shadow-rose-500/30 ring-4 ring-rose-200 animate-pulse'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:scale-105 shadow-blue-500/30'
              }`}
              title={isListening ? "Habess" : "Etkallem"}
            >
              {isListening ? (
                <div className="flex flex-col items-center">
                  <Mic className="w-8 h-8" />
                  <span className="text-[9px] font-bold mt-0.5 uppercase tracking-wider">Habess</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Mic className="w-8 h-8" />
                  <span className="text-[9px] font-bold mt-0.5 uppercase tracking-wider">Etkallem</span>
                </div>
              )}
            </button>

            <div className="mt-4 z-10">
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
                  <>Kcliki aal micro bech tetkallem</>
                )}
              </span>
            </div>

            {/* Transcription en direct */}
            {(transcript || interimTranscript) && (
              <div className="mt-4 px-4 py-2.5 max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-xs z-10">
                <p className="text-xs text-slate-400 font-medium mb-1">Elli smaaetou :</p>
                <p className="text-sm font-semibold text-slate-800 italic">
                  « {transcript || interimTranscript} »
                  {interimTranscript && !transcript && (
                    <span className="inline-block w-1.5 h-3.5 bg-blue-500 ml-1 animate-pulse" />
                  )}
                </p>
              </div>
            )}

            {/* Message d'erreur */}
            {errorMsg && (
              <div className="mt-3 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2 max-w-md z-10">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Résultat analysé / Interprétation + Confirmation Derja */}
          {parsed && (
            <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-sky-50/70 rounded-2xl p-4 border border-blue-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Rponse de l'assistant
                </span>
                {matchedCount !== null && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                    {matchedCount} tâche{matchedCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Bulle de dialogue Assistant en Derja */}
              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-blue-100 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Assistant Derja</span>
                    <button
                      onClick={() => speakDerjaConfirmation(parsed.derjaConfirmation)}
                      className="text-slate-400 hover:text-blue-600 transition flex items-center gap-1 text-[11px] cursor-pointer"
                      title="Aawed smaani"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Écouter</span>
                    </button>
                  </div>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    « {parsed.derjaConfirmation} »
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {parsed.explanation}
                  </p>
                </div>
              </div>

              {/* Badges des filtres extraits */}
              <div className="flex flex-wrap gap-2 pt-1">
                {parsed.badges.map((b, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${b.color}`}
                  >
                    <span className="opacity-75 font-normal">{b.label} :</span>
                    <span>{b.value}</span>
                  </span>
                ))}
              </div>

              {/* Bouton Appliquer immédiat */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleApply}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Appliquer au tableau</span>
                </button>
              </div>
            </div>
          )}

          {/* Suggestions & Exemples en 1-clic */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                Exemples mjarbine (kcliki bech tjareb) :
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {exampleQueries.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => handleSimulateVoice(ex)}
                  className="text-left px-3 py-2 rounded-xl text-xs bg-slate-50 hover:bg-blue-50/80 hover:border-blue-300 border border-slate-200/80 text-slate-700 hover:text-blue-900 transition flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate pr-2">« {ex} »</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Fallback de saisie manuelle si le micro n'est pas accessible */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Walla ektebha direct lenna :
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Ex : Nheb nchouf el khedma mtaa Ahmed"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualText.trim()) {
                      handleSimulateVoice(manualText.trim());
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (manualText.trim()) handleSimulateVoice(manualText.trim());
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Jareb
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3 h-3 text-blue-500" />
            <span>Mode Consultation pure · El tableau yitbadal automatique</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
            >
              Sekker
            </button>
            {parsed && (
              <button
                onClick={handleApply}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-500/20 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Appliquer el filtre</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
