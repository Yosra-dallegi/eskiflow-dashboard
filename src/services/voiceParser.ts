// Service de parsing et d'interprétation des commandes vocales
// Supporte : Derja Tunisien (écriture arabe et phonétique franco-arabe) + Français

export interface VoiceParsedResult {
  rawTranscript: string;
  cleanedTranscript: string;
  etat?: 'Terminée' | 'En attente' | 'En retard' | '';
  chef?: string;
  cdr?: string;
  titre?: string;
  fid?: 'oui' | 'non' | '';
  search?: string;
  isReset?: boolean;
  explanation: string;
  derjaConfirmation: string;
  spokenText?: string;
  badges: { label: string; value: string; color: string }[];
}

interface ContextOptions {
  uniqueChefs?: string[];
  uniqueCdrs?: string[];
  uniqueTitres?: string[];
}

// Normalise l'arabe standard et derja en supprimant diacritiques et unifiant lettres
function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // tashkeel
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
}

// Nettoyage et normalisation du texte (accepte arabe, français, derja, chiffres phonétiques 3, 7, 5, 9)
export function cleanText(text: string): string {
  const normAr = normalizeArabic(text);
  return normAr
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents français
    .replace(/3/g, 'a')  // 3arbi -> a
    .replace(/7/g, 'h')  // 7a9 -> h
    .replace(/5/g, 'kh') // 5edma -> kh
    .replace(/9/g, 'q')  // 9ahwa -> q
    .replace(/['’]/g, ' ')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Banques de confirmations en Derja & Français
const DERJA_CONFIRMATIONS = [
  'Sayé, riguelt les filtres mtaa e-dashboard.',
  'Mriguel, les données elli tlabthom talou.',
  'Oumourek wadha, chouf l écran mtaak.',
  'C est bon, badalt les filtres kima habit.'
];

const DERJA_RESET_CONFIRMATIONS = [
  'Sayé, faskht el filtres el koll w rajaat e-dashboard kemel.',
  'Mriguel, rajaat el tableau mriguel min ghir hata filtre.',
  'Oumourek wadha, kol chay mriguel aal écran.'
];

function pickConfirmation(isReset: boolean = false): string {
  const pool = isReset ? DERJA_RESET_CONFIRMATIONS : DERJA_CONFIRMATIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Analyse une requête vocale en Derja tunisien (caractères arabes ou phonétique) ou en Français
 */
export function parseVoiceQuery(
  rawTranscript: string,
  options: ContextOptions = {}
): VoiceParsedResult {
  const norm = cleanText(rawTranscript);
  const badges: { label: string; value: string; color: string }[] = [];

  let etat: 'Terminée' | 'En attente' | 'En retard' | '' = '';
  let chef = '';
  let cdr = '';
  let titre = '';
  let fid: 'oui' | 'non' | '' = '';
  let search = '';
  let isReset = false;

  // 1. Détection de réinitialisation / tout voir
  const isResetPhrase =
    // Derja phonétique / Français
    norm.includes('faskh') ||
    norm.includes('nahhi') ||
    norm.includes('rajjaa') ||
    norm.includes('riguel kol') ||
    norm.includes('kol chay') ||
    norm.includes('koll chay') ||
    norm.includes('kollhom') ||
    norm.includes('tout voir') ||
    norm.includes('toutes les taches') ||
    norm.includes('tous les taches') ||
    norm.includes('reinitialiser') ||
    norm.includes('effacer') ||
    norm.includes('aucun filtre') ||
    norm.includes('remettre a zero') ||
    norm === 'tout' ||
    norm === 'tous' ||
    norm === 'kol' ||
    norm === 'el kol' ||
    // Arabe standard / Derja en caractères arabes
    norm.includes('فسخ') ||
    norm.includes('نحي') ||
    norm.includes('الكل') ||
    norm.includes('كل شيء') ||
    norm.includes('كل المهام') ||
    norm.includes('جميع المهام') ||
    norm.includes('اعاده ضبط') ||
    norm.includes('مسح الفلاتر');

  if (isResetPhrase) {
    const hasPerson =
      norm.includes('par ') ||
      norm.includes('pour ') ||
      norm.includes('mtaa ') ||
      norm.includes('khedmet ') ||
      norm.includes('متاع') ||
      norm.includes('خدمه');

    if (!hasPerson && !norm.includes('termine') && !norm.includes('kemlou') && !norm.includes('kamlet') && !norm.includes('attente') && !norm.includes('retard') && !norm.includes('منتهيه') && !norm.includes('متاخره')) {
      return {
        rawTranscript,
        cleanedTranscript: norm,
        isReset: true,
        explanation: 'Filtres effacés : affichage de toutes les tâches.',
        derjaConfirmation: pickConfirmation(true),
        badges: [{ label: 'Filtre', value: 'Koll chay (Toutes les tâches)', color: 'bg-slate-100 text-slate-800' }]
      };
    }
  }

  // 2. Détection de l'état
  // Terminée: "kemlou", "kamlet", "kamlin", "termine", "fait", "منتهية", "تمت", "كاملة"
  const isDoneMatch =
    /\b(kemlou|kamlet|kamlin|khedmet|khalset|salou|termine|terminer|terminee|terminees|fini|finie|finies|cloture|cloturee|fait|realise|realisee)\b/.test(norm) ||
    /منتهيه|منتهي|تمت|كاملين|كاملة|خالصة|وفات/.test(norm);

  const isWaitMatch =
    /\b(mazel|mazelou|mazelt|yetstannaw|baqi|ma kemlouch|attente|en attente|non termine|non terminee|pas termine|en cours|a faire|restant|restante)\b/.test(norm) ||
    /في الانتظار|مازالت|مازالو|قيد الانتظار|غير منتهية|باقي/.test(norm);

  const isLateMatch =
    /\b(mouakher|mouakhrin|fat waqthom|retard|en retard|depasse|depassee|echue|echu)\b/.test(norm) ||
    /متاخرة|متاخر|متاخرين|فات وقتها|فات الاجل|مؤخرة|مؤخرين/.test(norm);

  if (isDoneMatch && !isWaitMatch && !norm.includes('non termine') && !norm.includes('pas termine') && !norm.includes('ma kemlouch')) {
    etat = 'Terminée';
    badges.push({ label: 'État', value: 'Terminée (Kemlou)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' });
  } else if (isWaitMatch) {
    etat = 'En attente';
    badges.push({ label: 'État', value: 'En attente (Mazelou)', color: 'bg-amber-100 text-amber-800 border-amber-300' });
  } else if (isLateMatch) {
    etat = 'En retard';
    badges.push({ label: 'État', value: 'En retard (Mouakhrin)', color: 'bg-rose-100 text-rose-800 border-rose-300' });
  }

  // 3. Détection Fidélité (FID)
  if (norm.includes('fidelite') || norm.includes('fidelise') || norm.includes('fid') || norm.includes('وفاء') || norm.includes('فيدليتي')) {
    if (norm.includes('non') || norm.includes('pas') || norm.includes('mouch') || norm.includes('la') || norm.includes('مش') || norm.includes('غير')) {
      fid = 'non';
      badges.push({ label: 'FID', value: 'Non inscrit (Mouch FID)', color: 'bg-slate-100 text-slate-800 border-slate-300' });
    } else {
      fid = 'oui';
      badges.push({ label: 'FID', value: 'Inscrit FID', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' });
    }
  }

  // 4. Détection Chef de zone dans la liste connue
  if (options.uniqueChefs && options.uniqueChefs.length > 0) {
    for (const c of options.uniqueChefs) {
      if (!c) continue;
      const cNorm = cleanText(c);
      if (cNorm && norm.includes(cNorm)) {
        chef = c;
        badges.push({ label: 'Chef de zone', value: c, color: 'bg-purple-100 text-purple-800 border-purple-300' });
        break;
      }
    }
  }

  // 5. Détection Délégation / CDR dans la liste connue
  if (options.uniqueCdrs && options.uniqueCdrs.length > 0) {
    for (const d of options.uniqueCdrs) {
      if (!d) continue;
      const dNorm = cleanText(d);
      if (dNorm && norm.includes(dNorm)) {
        cdr = d;
        badges.push({ label: 'Délégation / Zone', value: d, color: 'bg-blue-100 text-blue-800 border-blue-300' });
        break;
      }
    }
  }

  // 6. Détection Tâche / Titre dans la liste connue
  if (options.uniqueTitres && options.uniqueTitres.length > 0) {
    for (const t of options.uniqueTitres) {
      if (!t) continue;
      const tNorm = cleanText(t);
      if (tNorm && norm.includes(tNorm)) {
        titre = t;
        badges.push({ label: 'Type de tâche', value: t, color: 'bg-cyan-100 text-cyan-800 border-cyan-300' });
        break;
      }
    }
  }

  if (!titre) {
    if (norm.includes('habillage') || norm.includes('تغليف') || norm.includes('واجهة')) {
      const match = (options.uniqueTitres || []).find((t) => cleanText(t).includes('habillage'));
      if (match) titre = match;
    } else if (norm.includes('cadeau') || norm.includes('هدية') || norm.includes('هدايا')) {
      const match = (options.uniqueTitres || []).find((t) => cleanText(t).includes('cadeau'));
      if (match) titre = match;
    } else if (norm.includes('frigo') || norm.includes('congelateur') || norm.includes('ثلاجة') || norm.includes('فريڨو')) {
      const match = (options.uniqueTitres || []).find((t) => cleanText(t).includes('frigo'));
      if (match) titre = match;
    }
    if (titre && !badges.some((b) => b.label === 'Type de tâche')) {
      badges.push({ label: 'Type de tâche', value: titre, color: 'bg-cyan-100 text-cyan-800 border-cyan-300' });
    }
  }

  // 7. Extraction de la personne (Réalisateur / Agent / Client)
  const personMatch =
    norm.match(/\b(?:mtaa|mta|khedmet|khedmetou|b yedd|aamlo|realise par|fait par|termine par|execute par|par|collaborateur|de|nomme|agent|representant|متاع|خدمة|بيد|عملو)\s+([\u0600-\u06FFa-zA-Z0-9_-]+)/) ||
    norm.match(/\b(?:pour le client|client|حريف|الزبون)\s+([\u0600-\u06FFa-zA-Z0-9_-]+)/);

  if (personMatch && personMatch[1]) {
    const candidate = personMatch[1].trim();
    const stopWords = [
      'exemple', 'zone', 'mois', 'etat', 'statut', 'tache', 'taches',
      'date', 'jour', 'semaine', 'rapport', 'rapports', 'dashboard',
      'ecran', 'chay', 'kol', 'koll', 'délégation', 'statistiques',
      'شكون', 'كل', 'يوم', 'تقرير'
    ];
    if (!stopWords.includes(candidate) && candidate.length > 1) {
      const formattedPerson = candidate.charAt(0).toUpperCase() + candidate.slice(1);
      if (!chef || !cleanText(chef).includes(candidate)) {
        search = formattedPerson;
        badges.push({
          label: 'Agent / Recherche',
          value: formattedPerson,
          color: 'bg-blue-100 text-blue-800 border-blue-300'
        });
      }
    }
  }

  // Si pas de personne trouvée via préfixes mais il reste un mot clé pertinent
  if (!search && !chef && !titre && !cdr) {
    let residual = norm
      .replace(/\b(nheb nchouf|nchouf|warini|farrejni|aatihli|aatini|werini|je veux voir|je veux|montre moi|montre|affiche|afficher|donne moi|recherche|trouve|les|des|toutes|tous|tache|taches|khedma|svp|s il vous plait|نحب نشوف|وريني|اعطيني|مهام|مهمة)\b/g, '')
      .replace(/\b(kemlou|kamlet|kamlin|mazelou|mazel|mouakhrin|mouakher|termine|terminer|terminee|terminees|en attente|attente|en retard|retard|منتهية|في الانتظار|متأخرة)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (residual.length >= 2) {
      search = residual.charAt(0).toUpperCase() + residual.slice(1);
      badges.push({
        label: 'Recherche',
        value: search,
        color: 'bg-slate-100 text-slate-800 border-slate-300'
      });
    }
  }

  // Formulation de l'explication et confirmation
  const parts: string[] = [];
  if (etat) parts.push(`Tâches ${etat.toLowerCase()}s`);
  else parts.push('Tâches');

  if (search) parts.push(`associées à « ${search} »`);
  if (chef) parts.push(`Chef de zone « ${chef} »`);
  if (cdr) parts.push(`Délégation « ${cdr} »`);
  if (titre) parts.push(`Type « ${titre} »`);
  if (fid === 'oui') parts.push('(Inscrits FID)');
  if (fid === 'non') parts.push('(Non FID)');

  const explanation = parts.length > 1 ? parts.join(' · ') : `Filtrage appliqué pour : « ${rawTranscript} »`;
  const derjaConfirmation = pickConfirmation(isReset);

  return {
    rawTranscript,
    cleanedTranscript: norm,
    etat,
    chef,
    cdr,
    titre,
    fid,
    search,
    isReset,
    explanation,
    derjaConfirmation,
    badges
  };
}

/**
 * Synthétiseur vocal avec détection automatique de langue (arabe ou français)
 */
export function speakConfirmation(text: string, lang: 'fr-FR' | 'ar-TN' = 'fr-FR') {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Tente de trouver une voix installée correspondant à la langue
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const match = voices.find((v) => v.lang.startsWith(lang.split('-')[0]));
      if (match) utterance.voice = match;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // ignore
  }
}

export const speakDerjaConfirmation = (text: string) => speakConfirmation(text, 'fr-FR');

/**
 * Rétroaction sonore douce et instantanée (Web Audio API)
 */
export function playVoiceFeedbackSound(type: 'start' | 'success' | 'error') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'start') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === 'success') {
      const t = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.06, t + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.2);
        osc.start(t + idx * 0.07);
        osc.stop(t + idx * 0.07 + 0.2);
      });
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // Ignorer si audio bloqué
  }
}
