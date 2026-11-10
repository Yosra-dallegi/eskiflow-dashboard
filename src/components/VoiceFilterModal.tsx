import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  X,
  RotateCcw,
  Bot,
  User,
  ArrowRight,
  TrendingUp,
  Snowflake,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Loader2
} from 'lucide-react';
import { TaskItem, RealisationData, FrigoItem, VisiteItem } from '../types/task';
import { VoiceParsedResult, playVoiceFeedbackSound, speakConfirmation } from '../services/voiceParser';
import {
  askDashboardAgent,
  AIMessage,
  DashboardContext,
  computeDashboardMetrics
} from '../services/aiAgentService';

export interface VoiceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (result: VoiceParsedResult) => void;
  uniqueChefs: string[];
  uniqueCdrs: string[];
  uniqueTitres: string[];
  tasks: TaskItem[];
  realisation?: RealisationData;
  frigos?: FrigoItem[];
  visites?: VisiteItem[];
  activeTab?: string;
  onSwitchTab?: (tab: 'pOverview' | 'pMonth' | 'pFrigos' | 'pVisites') => void;
  accessMode?: string;
}

export const VoiceFilterModal: React.FC<VoiceFilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  uniqueChefs,
  uniqueCdrs,
  uniqueTitres,
  tasks,
  realisation,
  frigos = [],
  visites = [],
  activeTab,
  onSwitchTab,
  accessMode
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<'fr-FR' | 'ar-TN'>('fr-FR');
  const [interimTranscript, setInterimTranscript] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Préparation du contexte
  const dashboardContext: DashboardContext = {
    tasks,
    realisation,
    frigos,
    visites,
    activeTab,
    accessMode
  };

  // Initialisation du premier message d'accueil de l'Agent IA
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const metrics = computeDashboardMetrics(dashboardContext);
      const welcomeMsg: AIMessage = {
        id: 'welcome',
        sender: 'agent',
        text: `👋 Bonjour ! Je suis votre **Agent IA EskiFlow**.

J'ai une vision complète sur l'ensemble de vos données en direct :
• **${metrics.totalTasks.toLocaleString()}** tâches (${metrics.completionRate}% de réalisation, **${metrics.lateTasks}** en retard)
• **${metrics.totalCaHt.toLocaleString()} DT** de chiffre d'affaires
• **${metrics.totalFrigos.toLocaleString()}** frigos (${metrics.totalFrigosAtRisk} à risque)
• **${metrics.totalVisites.toLocaleString()}** visites terrain (${metrics.tauxConformiteGps}% conformes sur site)

💬 *Posez-moi n'importe quelle question à la voix ou à l'écrit (en Français ou en Derja) !*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        badges: [
          { label: 'Tâches', value: `${metrics.totalTasks}`, color: 'bg-blue-100 text-blue-800' },
          { label: 'Retards', value: `${metrics.lateTasks}`, color: 'bg-rose-100 text-rose-800' },
          { label: 'Frigos Risque', value: `${metrics.totalFrigosAtRisk}`, color: 'bg-amber-100 text-amber-800' }
        ]
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, tasks.length]);

  // Scroll automatique vers le bas à chaque nouveau message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing]);

  // Reconnaissance vocale Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
        playVoiceFeedbackSound('start');
      };

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) finalTrans += item[0].transcript;
          else interimTrans += item[0].transcript;
        }

        if (finalTrans) {
          setInterimTranscript('');
          handleUserQuery(finalTrans);
        } else {
          setInterimTranscript(interimTrans);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setInterimTranscript('');
        playVoiceFeedbackSound('error');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      // ignore
    }
  }, [selectedLang, tasks, realisation, frigos, visites]);

  // Traitement d'une question posée par l'utilisateur
  const handleUserQuery = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    setInputText('');
    setInterimTranscript('');

    // Ajout du message utilisateur
    const userMsg: AIMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsAnalyzing(true);

    try {
      // Analyse et réponse par le Moteur IA
      const agentMsg = await askDashboardAgent(q, dashboardContext);
      setIsAnalyzing(false);
      setMessages((prev) => [...prev, agentMsg]);
      playVoiceFeedbackSound('success');

      // Synthèse vocale si activée
      if (isSpeakingEnabled) {
        const textToSpeak = agentMsg.derjaVoiceText || agentMsg.text.replace(/[*#•-]/g, '');
        speakConfirmation(textToSpeak, selectedLang);
      }

      // Si l'action suggérée est un reset ou un filtre direct
      if (agentMsg.action && agentMsg.action.type === 'RESET_FILTERS') {
        onApplyFilters({
          rawTranscript: q,
          cleanedTranscript: q,
          isReset: true,
          explanation: 'Filtres réinitialisés',
          derjaConfirmation: 'Filtres effacés',
          badges: []
        });
      }
    } catch {
      setIsAnalyzing(false);
      const fallbackMsg: AIMessage = {
        id: `err_${Date.now()}`,
        sender: 'agent',
        text: 'Désolé, une erreur est survenue lors de l\'analyse des données. Veuillez reformuler votre question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }
  };

  // Exécution d'une action suggérée par l'IA
  const executeAction = (action: any) => {
    if (!action) return;

    if (action.type === 'CHANGE_TAB' && action.payload?.tab && onSwitchTab) {
      onSwitchTab(action.payload.tab);
      onClose();
    } else if (action.type === 'FILTER_TASKS') {
      onApplyFilters({
        rawTranscript: action.label,
        cleanedTranscript: action.label,
        etat: action.payload.etat,
        chef: action.payload.chef,
        cdr: action.payload.cdr,
        titre: action.payload.titre,
        search: action.payload.search,
        explanation: `Filtre appliqué : ${action.label}`,
        derjaConfirmation: 'Filtre appliqué',
        badges: []
      });
      if (onSwitchTab) onSwitchTab('pOverview');
      onClose();
    } else if (action.type === 'RESET_FILTERS') {
      onApplyFilters({
        rawTranscript: 'Tout voir',
        cleanedTranscript: 'tout voir',
        isReset: true,
        explanation: 'Tous les filtres sont effacés',
        derjaConfirmation: 'Filtres réinitialisés',
        badges: []
      });
      onClose();
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('La reconnaissance vocale n\'est pas supportée sur ce navigateur. Vous pouvez utiliser le champ texte.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 200);
      }
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    { label: '📊 Bilan Global 360°', query: 'Donne-moi un bilan global du dashboard' },
    { label: '⚠️ Qui a le plus de retard ?', query: 'Quel est le chef de zone avec le plus de retard ?' },
    { label: '🧊 Diagnostic Frigos à Risque', query: 'Combien de frigos sont à risque et quelles actions ?' },
    { label: '📍 Audit Visites & GPS', query: 'Combien de visites sont sur site vs hors zone ?' },
    { label: '💰 Ventes & Chiffre d\'Affaires', query: 'Quel est le total des ventes et du chiffre d\'affaires ?' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner shrink-0">
              <Bot className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white leading-none truncate">
                  Agent IA EskiFlow
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Direct Data
                </span>
              </div>
              <p className="text-xs text-sky-100/80 mt-1 truncate">
                Comprend et analyse toutes vos données (Tâches, Ventes, Frigos, Visites)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Lang toggle */}
            <div className="flex items-center bg-white/15 rounded-xl p-0.5 border border-white/20 text-xs">
              <button
                type="button"
                onClick={() => setSelectedLang('fr-FR')}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                  selectedLang === 'fr-FR' ? 'bg-white text-blue-800 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
                title="Français"
              >
                🇫🇷 FR
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('ar-TN')}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                  selectedLang === 'ar-TN' ? 'bg-white text-blue-800 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
                title="Derja Tunisien"
              >
                🇹🇳 Derja
              </button>
            </div>

            {/* Vocal speaker toggle */}
            <button
              type="button"
              onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
              title={isSpeakingEnabled ? 'Voix activée (cliquer pour couper)' : 'Voix coupée (cliquer pour activer)'}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isSpeakingEnabled ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50 hover:text-white'
              }`}
            >
              {isSpeakingEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Questions rapides :
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleUserQuery(p.query)}
              className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-full transition shrink-0 cursor-pointer shadow-2xs hover:border-blue-300"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-600'
                    : 'bg-gradient-to-br from-indigo-600 to-blue-600'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-2 min-w-0">
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Badges de métriques */}
                {msg.badges && msg.badges.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {msg.badges.map((b, bIdx) => (
                      <span
                        key={bIdx}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200/60 ${b.color}`}
                      >
                        {b.label} : <strong>{b.value}</strong>
                      </span>
                    ))}
                  </div>
                )}

                {/* Bouton d'action contextuelle */}
                {msg.action && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => executeAction(msg.action)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl transition cursor-pointer shadow-2xs group"
                    >
                      <span>{msg.action.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 px-1">{msg.timestamp}</div>
              </div>
            </div>
          ))}

          {isAnalyzing && (
            <div className="flex items-center gap-2 text-slate-500 text-xs py-2 px-3 bg-white rounded-xl border border-slate-200/80 w-fit animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>L'Agent IA analyse les données du dashboard...</span>
            </div>
          )}

          {isListening && interimTranscript && (
            <div className="flex items-center gap-2 text-blue-700 text-xs py-2 px-3 bg-blue-50 rounded-xl border border-blue-200 w-fit animate-pulse">
              <Mic className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
              <span>« {interimTranscript} »</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUserQuery(inputText);
            }}
            className="flex items-center gap-2"
          >
            {/* Mic button */}
            <button
              type="button"
              onClick={toggleMic}
              title={isListening ? 'Arrêter l\'écoute vocale' : 'Parler à l\'assistant vocal'}
              className={`p-3 rounded-2xl transition cursor-pointer shrink-0 shadow-sm ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-400/40'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:scale-105'
              }`}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
            </button>

            {/* Text input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isListening
                    ? 'Écoute en cours... Parlez maintenant'
                    : 'Posez n\'importe quelle question sur vos données (ou cliquez sur le micro)...'
                }
                className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition"
                disabled={isAnalyzing}
              />
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isAnalyzing}
              className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl shadow-sm transition cursor-pointer shrink-0"
              title="Envoyer la question"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>💡 Parlez ou tapez en <strong>Français</strong> ou en <strong>Derja</strong> tunisien</span>
            {messages.length > 1 && (
              <button
                type="button"
                onClick={() => setMessages([])}
                className="hover:text-slate-600 transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Effacer la conversation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
