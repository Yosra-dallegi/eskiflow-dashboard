/**
 * aiAgentService.ts — Moteur d'Intelligence Artificielle d'EskiFlow
 * =================================================================
 * Comprend TOUTES les données du dashboard :
 * 1. Tâches (Tasks) : volumes, retards, réalisations, CDZ, types, délais
 * 2. Ventes / Réalisation : CA total HT, par mois, par préfecture
 * 3. Parc Frigos : total frigos, risques, actions requises, scans, GPS
 * 4. Visites Clients : volume, conformité Sur site vs Hors zone, par équipe
 *
 * Fonctionne :
 * - En Français, Derja tunisien (phonétique & arabe) et Anglais
 * - 100% en local et autonome (analyse statistique poussée & NLP)
 * - Avec support optionnel de l'API Gemini si disponible sur le serveur
 */

import { TaskItem, RealisationData, FrigoItem, VisiteItem } from '../types/task';
import { CDZ_LIST } from '../data/cdzHierarchy';

export interface DashboardContext {
  tasks: TaskItem[];
  realisation?: RealisationData;
  frigos?: FrigoItem[];
  visites?: VisiteItem[];
  activeTab?: string;
  accessMode?: string;
}

export interface AIAction {
  type: 'FILTER_TASKS' | 'CHANGE_TAB' | 'RESET_FILTERS';
  label: string;
  payload: {
    tab?: 'pOverview' | 'pFrigos';
    etat?: 'Terminée' | 'En attente' | 'En retard' | '';
    chef?: string;
    cdr?: string;
    titre?: string;
    search?: string;
  };
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  badges?: { label: string; value: string; color: string }[];
  action?: AIAction;
  derjaVoiceText?: string;
}

// Normalisation du texte pour compréhension NLP bilingue
function cleanQuery(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/3/g, 'a')
    .replace(/7/g, 'h')
    .replace(/5/g, 'kh')
    .replace(/9/g, 'q')
    .replace(/['’]/g, ' ')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calcule tous les agrégats analytiques du dashboard en direct
 */
export function computeDashboardMetrics(context: DashboardContext) {
  const { tasks = [], realisation, frigos = [], visites = [] } = context;

  // --- 1. METRIQUES TÂCHES ---
  const totalTasks = tasks.length;
  let doneTasks = 0;
  let waitTasks = 0;
  let lateTasks = 0;
  let totalEcartLate = 0;
  let lateWithEcart = 0;

  const tasksByChef: Record<string, { total: number; done: number; wait: number; late: number }> = {};
  const tasksByType: Record<string, { total: number; done: number; wait: number; late: number }> = {};
  const tasksByCdr: Record<string, number> = {};

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    if (t.etat === 'Terminée') doneTasks++;
    else if (t.etat === 'En retard') {
      lateTasks++;
      if (typeof t.ecart === 'number') {
        totalEcartLate += t.ecart;
        lateWithEcart++;
      }
    } else waitTasks++;

    // Par chef
    const chefName = t.chef || 'Non rattaché';
    if (!tasksByChef[chefName]) {
      tasksByChef[chefName] = { total: 0, done: 0, wait: 0, late: 0 };
    }
    tasksByChef[chefName].total++;
    if (t.etat === 'Terminée') tasksByChef[chefName].done++;
    else if (t.etat === 'En retard') tasksByChef[chefName].late++;
    else tasksByChef[chefName].wait++;

    // Par type de tâche
    const typeName = t.titre || 'Autre';
    if (!tasksByType[typeName]) {
      tasksByType[typeName] = { total: 0, done: 0, wait: 0, late: 0 };
    }
    tasksByType[typeName].total++;
    if (t.etat === 'Terminée') tasksByType[typeName].done++;
    else if (t.etat === 'En retard') tasksByType[typeName].late++;
    else tasksByType[typeName].wait++;

    // Par délégation
    if (t.cdr) {
      tasksByCdr[t.cdr] = (tasksByCdr[t.cdr] || 0) + 1;
    }
  }

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const avgLateEcart = lateWithEcart > 0 ? Math.round(totalEcartLate / lateWithEcart) : 0;

  // Chefs triés par volume de retard
  const sortedChefsByLate = Object.entries(tasksByChef)
    .sort((a, b) => b[1].late - a[1].late)
    .map(([nom, s]) => ({
      nom,
      ...s,
      rate: s.total > 0 ? Math.round((s.done / s.total) * 100) : 0
    }));

  // Chefs triés par meilleur taux de réalisation
  const sortedChefsByRate = Object.entries(tasksByChef)
    .filter(([, s]) => s.total >= 5)
    .sort((a, b) => (b[1].done / b[1].total) - (a[1].done / a[1].total))
    .map(([nom, s]) => ({
      nom,
      ...s,
      rate: s.total > 0 ? Math.round((s.done / s.total) * 100) : 0
    }));

  // Types de tâches les plus fréquents
  const sortedTypes = Object.entries(tasksByType)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([type, s]) => ({ type, ...s }));

  // --- 2. METRIQUES VENTES / REALISATION ---
  let totalCaHt = 0;
  const caByMonth: Record<number, number> = {};
  const caByPref: Record<string, number> = {};

  if (realisation && Array.isArray(realisation.rows)) {
    for (let i = 0; i < realisation.rows.length; i++) {
      const row = realisation.rows[i];
      const mois = row[1];
      const pref = row[2];
      const ht = Number(row[3]) || 0;
      totalCaHt += ht;
      caByMonth[mois] = (caByMonth[mois] || 0) + ht;
      if (pref) caByPref[pref] = (caByPref[pref] || 0) + ht;
    }
  }

  const sortedPrefs = Object.entries(caByPref)
    .sort((a, b) => b[1] - a[1])
    .map(([pref, ca]) => ({ pref, ca: Math.round(ca) }));

  // --- 3. METRIQUES FRIGOS ---
  const totalFrigos = frigos.length;
  let frigosRisqueEleve = 0;
  let frigosRisqueMoyen = 0;
  let frigosRisqueFaible = 0;
  const actionsCount: Record<string, number> = {};
  const frigosByChef: Record<string, number> = {};

  for (let i = 0; i < frigos.length; i++) {
    const f = frigos[i];
    const r = (f.risque || '').toLowerCase();
    if (r.includes('eleve') || r.includes('élevé') || r.includes('high')) frigosRisqueEleve++;
    else if (r.includes('moyen') || r.includes('med')) frigosRisqueMoyen++;
    else if (r.includes('faible') || r.includes('low')) frigosRisqueFaible++;

    if (f.actions) {
      actionsCount[f.actions] = (actionsCount[f.actions] || 0) + 1;
    }
    if (f.chefZone) {
      frigosByChef[f.chefZone] = (frigosByChef[f.chefZone] || 0) + 1;
    }
  }

  const totalFrigosAtRisk = frigosRisqueEleve + frigosRisqueMoyen;
  const sortedActions = Object.entries(actionsCount)
    .sort((a, b) => b[1] - a[1])
    .map(([action, count]) => ({ action, count }));

  // --- 4. METRIQUES VISITES ---
  const totalVisites = visites.length;
  let visitesSurSite = 0;
  let visitesHorsZone = 0;
  const visitesByVisiteur: Record<string, { total: number; surSite: number; horsZone: number }> = {};

  for (let i = 0; i < visites.length; i++) {
    const v = visites[i];
    if (v.statutGps === 'Sur site') visitesSurSite++;
    else if (v.statutGps === 'Hors zone') visitesHorsZone++;

    const nom = v.visiteurNom || v.visiteurEmail || 'Inconnu';
    if (!visitesByVisiteur[nom]) {
      visitesByVisiteur[nom] = { total: 0, surSite: 0, horsZone: 0 };
    }
    visitesByVisiteur[nom].total++;
    if (v.statutGps === 'Sur site') visitesByVisiteur[nom].surSite++;
    else if (v.statutGps === 'Hors zone') visitesByVisiteur[nom].horsZone++;
  }

  const tauxConformiteGps = totalVisites > 0 ? Math.round((visitesSurSite / totalVisites) * 100) : 0;
  const sortedVisiteurs = Object.entries(visitesByVisiteur)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([nom, s]) => ({ nom, ...s }));

  return {
    totalTasks,
    doneTasks,
    waitTasks,
    lateTasks,
    completionRate,
    avgLateEcart,
    sortedChefsByLate,
    sortedChefsByRate,
    sortedTypes,
    tasksByChef,
    tasksByType,
    tasksByCdr,
    totalCaHt: Math.round(totalCaHt),
    caByMonth,
    sortedPrefs,
    totalFrigos,
    totalFrigosAtRisk,
    frigosRisqueEleve,
    frigosRisqueMoyen,
    frigosRisqueFaible,
    sortedActions,
    frigosByChef,
    totalVisites,
    visitesSurSite,
    visitesHorsZone,
    tauxConformiteGps,
    sortedVisiteurs
  };
}

/**
 * Moteur de raisonnement et de génération de réponse en langage naturel
 */
export async function askDashboardAgent(
  question: string,
  context: DashboardContext
): Promise<AIMessage> {
  const norm = cleanQuery(question);
  const metrics = computeDashboardMetrics(context);

  // Essayer d'interroger le serveur si un endpoint AI existe
  try {
    const serverPromise = fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        metricsSummary: {
          totalTasks: metrics.totalTasks,
          doneTasks: metrics.doneTasks,
          lateTasks: metrics.lateTasks,
          completionRate: metrics.completionRate,
          totalCaHt: metrics.totalCaHt,
          totalFrigos: metrics.totalFrigos,
          totalFrigosAtRisk: metrics.totalFrigosAtRisk,
          totalVisites: metrics.totalVisites,
          tauxConformiteGps: metrics.tauxConformiteGps
        }
      })
    });

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
    const response: any = await Promise.race([serverPromise, timeoutPromise]);

    if (response && response.ok) {
      const data = await response.json();
      if (data && data.text) {
        return {
          id: `msg_${Date.now()}`,
          sender: 'agent',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          badges: data.badges || [
            { label: 'IA Connectée', value: 'Gemini Live', color: 'bg-emerald-100 text-emerald-800' }
          ]
        };
      }
    }
  } catch {
    // Fallback immédiat vers le moteur local
  }

  // =========================================================================
  // MOTEUR LOCAL D'INTELLIGENCE ANALYTIQUE (100% Hors-Ligne & Précis)
  // =========================================================================

  // 1. REQUÊTE : BILAN GÉNÉRAL / RÉSUMÉ / SYNTHÈSE GLOBALE
  if (
    norm.includes('bilan') ||
    norm.includes('resume') ||
    norm.includes('synthese') ||
    norm.includes('situation') ||
    norm.includes('global') ||
    norm.includes('rapport') ||
    norm.includes('donne moi') && norm.includes('tout') ||
    norm.includes('ملخص') ||
    norm.includes('وضعيه') ||
    norm.includes('koll chay') ||
    norm.includes('omour')
  ) {
    const topLateChef = metrics.sortedChefsByLate[0];
    const topPerformer = metrics.sortedChefsByRate[0];

    const text = `📊 **Bilan Général du Tableau de Bord EskiFlow :**

• **Tâches Opérationnelles :**
  - **${metrics.totalTasks.toLocaleString()}** tâches enregistrées au total.
  - **${metrics.doneTasks.toLocaleString()}** terminées (${metrics.completionRate}% de taux de réalisation).
  - **${metrics.lateTasks.toLocaleString()}** en retard (${Math.round((metrics.lateTasks / metrics.totalTasks) * 100)}%) avec un retard moyen de **${Math.abs(metrics.avgLateEcart)} jours**.
  - Chef le plus performant : **${topPerformer ? topPerformer.nom : 'N/A'}** (${topPerformer ? topPerformer.rate : 0}% de succès).
  - Plus fort volume de retard : **${topLateChef ? topLateChef.nom : 'N/A'}** (${topLateChef ? topLateChef.late : 0} tâches en retard).

• **Ventes & Chiffre d'Affaires :**
  - Total Réalisé HT : **${metrics.totalCaHt.toLocaleString()} DT**.

• **Parc Frigos :**
  - **${metrics.totalFrigos.toLocaleString()}** frigos suivis, dont **${metrics.totalFrigosAtRisk.toLocaleString()} à risque** (${metrics.frigosRisqueEleve} en risque élevé).

• **Visites Terrain :**
  - **${metrics.totalVisites.toLocaleString()}** visites réalisées avec un taux de conformité GPS de **${metrics.tauxConformiteGps}%** sur site (${metrics.visitesHorsZone} hors zone).`;

    return {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badges: [
        { label: 'Tâches', value: `${metrics.completionRate}% Réalisées`, color: 'bg-blue-100 text-blue-800' },
        { label: 'Retards', value: `${metrics.lateTasks}`, color: 'bg-red-100 text-red-800' },
        { label: 'Frigos Risque', value: `${metrics.totalFrigosAtRisk}`, color: 'bg-amber-100 text-amber-800' },
        { label: 'GPS Conforme', value: `${metrics.tauxConformiteGps}%`, color: 'bg-emerald-100 text-emerald-800' }
      ],
      derjaVoiceText: `El bilan kemel: aandna ${metrics.totalTasks} khedma, el taux ${metrics.completionRate} pourcent, w ${metrics.lateTasks} mouakhrin.`
    };
  }

  // 2. REQUÊTE SUR UN CHEF DE ZONE SPÉCIFIQUE
  for (const chef of metrics.sortedChefsByLate) {
    const chefNorm = cleanQuery(chef.nom);
    const parts = chefNorm.split(' ').filter((p) => p.length >= 3);
    const isMatched = parts.some((part) => norm.includes(part));

    if (isMatched) {
      const text = `👤 **Détail des performances pour ${chef.nom} :**

• **Volume total :** ${chef.total} tâche(s)
• **Terminées :** ${chef.done} (${chef.rate}% de taux de réalisation)
• **En attente :** ${chef.wait}
• **En retard :** ${chef.late} (${Math.round((chef.late / (chef.total || 1)) * 100)}% de retard)

${chef.late > 20 ? '⚠️ **Attention :** Ce volume de retard nécessite une action prioritaire de suivi avec le superviseur.' : '✅ Situation opérationnelle sous contrôle.'}`;

      return {
        id: `msg_${Date.now()}`,
        sender: 'agent',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        badges: [
          { label: 'Chef', value: chef.nom, color: 'bg-blue-100 text-blue-800' },
          { label: 'Terminées', value: `${chef.done}`, color: 'bg-emerald-100 text-emerald-800' },
          { label: 'En retard', value: `${chef.late}`, color: 'bg-rose-100 text-rose-800' },
          { label: 'Taux', value: `${chef.rate}%`, color: 'bg-indigo-100 text-indigo-800' }
        ],
        action: {
          type: 'FILTER_TASKS',
          label: `Filtrer sur ${chef.nom}`,
          payload: { chef: chef.nom }
        },
        derjaVoiceText: `${chef.nom} aando ${chef.total} khedma, ${chef.done} kemlou w ${chef.late} mouakhrin.`
      };
    }
  }

  // 3. REQUÊTE : RETARDS & QUI EST LE PLUS EN RETARD
  if (
    norm.includes('retard') ||
    norm.includes('mouakher') ||
    norm.includes('mouakhrin') ||
    norm.includes('en retard') ||
    norm.includes('retards') ||
    norm.includes('متاخر') ||
    norm.includes('متاخرين') ||
    norm.includes('plus de retard') ||
    norm.includes('akther')
  ) {
    const topLate = metrics.sortedChefsByLate.slice(0, 5);
    const listChefs = topLate
      .map((c, idx) => `${idx + 1}. **${c.nom}** : **${c.late}** tâches en retard (${c.total} au total - Taux : ${c.rate}%)`)
      .join('\n');

    const text = `⚠️ **Analyse des retards opérationnels :**

Il y a actuellement **${metrics.lateTasks.toLocaleString()} tâches en retard** sur le réseau (${Math.round((metrics.lateTasks / metrics.totalTasks) * 100)}% de l'ensemble).
L'écart moyen par rapport à l'échéance est de **${Math.abs(metrics.avgLateEcart)} jours**.

**Top des Chefs de Zone ayant le plus de tâches en retard :**
${listChefs}`;

    return {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badges: [
        { label: 'Total Retard', value: `${metrics.lateTasks}`, color: 'bg-rose-100 text-rose-800' },
        { label: 'Écart moyen', value: `-${Math.abs(metrics.avgLateEcart)}j`, color: 'bg-amber-100 text-amber-800' },
        { label: 'Top 1 Retard', value: topLate[0] ? topLate[0].nom : 'N/A', color: 'bg-red-100 text-red-800' }
      ],
      action: {
        type: 'FILTER_TASKS',
        label: 'Afficher uniquement les tâches en retard',
        payload: { etat: 'En retard' }
      },
      derjaVoiceText: `Famma ${metrics.lateTasks} khedma mouakhra. Akther wehed mouakher howa ${topLate[0]?.nom} b ${topLate[0]?.late} khedma.`
    };
  }

  // 4. REQUÊTE : FRIGOS & DIAGNOSTIC PARC
  if (
    norm.includes('frigo') ||
    norm.includes('frigos') ||
    norm.includes('freezer') ||
    norm.includes('congelateur') ||
    norm.includes('frigidaire') ||
    norm.includes('فريجيدار') ||
    norm.includes('ثلاجه') ||
    norm.includes('ثلاجات') ||
    norm.includes('parc')
  ) {
    const topActions = metrics.sortedActions.slice(0, 4)
      .map((a) => `  - **${a.action}** : ${a.count} frigo(s)`)
      .join('\n');

    const text = `🧊 **État du Parc Frigos :**

• **Nombre total de frigos répertoriés :** **${metrics.totalFrigos.toLocaleString()}**
• **Frigos à risque :** **${metrics.totalFrigosAtRisk.toLocaleString()}**
  - 🔴 **Risque Élevé :** ${metrics.frigosRisqueEleve}
  - 🟡 **Risque Moyen :** ${metrics.frigosRisqueMoyen}
  - 🟢 **Risque Faible / Sain :** ${metrics.frigosRisqueFaible}

**Principales actions recommandées :**
${topActions || '  - Aucun plan d\'action spécifique requis pour le moment.'}`;

    return {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badges: [
        { label: 'Parc Total', value: `${metrics.totalFrigos}`, color: 'bg-blue-100 text-blue-800' },
        { label: 'À Risque', value: `${metrics.totalFrigosAtRisk}`, color: 'bg-rose-100 text-rose-800' },
        { label: 'Risque Élevé', value: `${metrics.frigosRisqueEleve}`, color: 'bg-red-100 text-red-800' }
      ],
      action: {
        type: 'CHANGE_TAB',
        label: 'Ouvrir l\'onglet Suivi Frigos',
        payload: { tab: 'pFrigos' }
      },
      derjaVoiceText: `Aandna ${metrics.totalFrigos} frigo fel parc, menhom ${metrics.totalFrigosAtRisk} fi risque.`
    };
  }

  // 5. REQUÊTE : VISITES CLIENTS & GPS
  if (
    norm.includes('visite') ||
    norm.includes('visites') ||
    norm.includes('gps') ||
    norm.includes('sur site') ||
    norm.includes('hors zone') ||
    norm.includes('conformite') ||
    norm.includes('visiteur') ||
    norm.includes('زياره') ||
    norm.includes('زيارات')
  ) {
    const text = `📍 **Bilan des Visites Terrain & Géolocalisation GPS :**

• **Total des visites effectuées :** **${metrics.totalVisites.toLocaleString()}**
• **Visites conformes (Sur site) :** **${metrics.visitesSurSite.toLocaleString()}** (${metrics.tauxConformiteGps}%)
• **Visites non conformes (Hors zone) :** **${metrics.visitesHorsZone.toLocaleString()}** (${100 - metrics.tauxConformiteGps}%)

${metrics.visitesHorsZone > 0 ? `⚠️ **Point d'attention :** ${metrics.visitesHorsZone} visite(s) ont été enregistrées à plus de 500m de l'adresse officielle du point de vente.` : '✅ Excellente rigueur : 100% des visites sont sur site.'}`;

    return {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badges: [
        { label: 'Total Visites', value: `${metrics.totalVisites}`, color: 'bg-blue-100 text-blue-800' },
        { label: 'Sur site', value: `${metrics.visitesSurSite} (${metrics.tauxConformiteGps}%)`, color: 'bg-emerald-100 text-emerald-800' },
        { label: 'Hors zone', value: `${metrics.visitesHorsZone}`, color: 'bg-rose-100 text-rose-800' }
      ],
      action: {
        type: 'CHANGE_TAB',
        label: 'Consulter le Suivi des Tâches',
        payload: { tab: 'pOverview' }
      },
      derjaVoiceText: `Aandna ${metrics.totalVisites} visite, ${metrics.visitesSurSite} sur site b taux ${metrics.tauxConformiteGps} pourcent, w ${metrics.visitesHorsZone} hors zone.`
    };
  }

  // 6. REQUÊTE : VENTES / CHIFFRE D'AFFAIRES / REALISATION
  if (
    norm.includes('vente') ||
    norm.includes('ventes') ||
    norm.includes('ca') ||
    norm.includes('chiffre') ||
    norm.includes('affaires') ||
    norm.includes('realisation') ||
    norm.includes('ht') ||
    norm.includes('dinars') ||
    norm.includes('combien a vendu') ||
    norm.includes('فلوس') ||
    norm.includes('مبيعات')
  ) {
    const topPrefs = metrics.sortedPrefs.slice(0, 4)
      .map((p) => `  - **${p.pref}** : ${p.ca.toLocaleString()} DT HT`)
      .join('\n');

    const text = `💰 **Point sur les Ventes & la Réalisation :**

• **Chiffre d'Affaires Total Réalisé :** **${metrics.totalCaHt.toLocaleString()} DT HT**
• **Nombre de lignes de vente enregistrées :** ${context.realisation?.rows?.length || 0}

**Top Régions / Préfectures contributrices :**
${topPrefs || '  - Détail par préfecture en cours de consolidation.'}`;

    return {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badges: [
        { label: 'CA Réalisé HT', value: `${metrics.totalCaHt.toLocaleString()} DT`, color: 'bg-emerald-100 text-emerald-800' },
        { label: 'Top Région', value: metrics.sortedPrefs[0]?.pref || 'N/A', color: 'bg-blue-100 text-blue-800' }
      ],
      action: {
        type: 'CHANGE_TAB',
        label: 'Consulter le Suivi des Tâches',
        payload: { tab: 'pOverview' }
      },
      derjaVoiceText: `Le chiffre d'affaires total houwa ${metrics.totalCaHt.toLocaleString()} dinars hors taxe.`
    };
  }

  // 7. REQUÊTE : TYPES DE TÂCHES / ACTIVITÉS
  if (
    norm.includes('type') ||
    norm.includes('types') ||
    norm.includes('scanner') ||
    norm.includes('habillage') ||
    norm.includes('whatsapp') ||
    norm.includes('nature') ||
    norm.includes('anwa3')
  ) {
    const topTypes = metrics.sortedTypes.slice(0, 5)
      .map((t, idx) => `${idx + 1}. **${t.type}** : ${t.total} tâche(s) (${t.done} faites, ${t.late} en retard)`)
      .join('\n');

    const text = `📋 **Répartition par Type de Tâche :**

Voici les tâches les plus fréquentes sur le terrain :
${topTypes}`;

    return {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badges: [
        { label: 'Top Tâche', value: metrics.sortedTypes[0]?.type || 'N/A', color: 'bg-blue-100 text-blue-800' },
        { label: 'Volume', value: `${metrics.sortedTypes[0]?.total || 0}`, color: 'bg-indigo-100 text-indigo-800' }
      ],
      derjaVoiceText: `Akther khedma mawjouda hiya ${metrics.sortedTypes[0]?.type} b ${metrics.sortedTypes[0]?.total} khedma.`
    };
  }

  // 8. RÉINITIALISATION DES FILTRES
  if (
    norm.includes('faskh') ||
    norm.includes('nahhi') ||
    norm.includes('rajjaa') ||
    norm.includes('effacer') ||
    norm.includes('reinitialiser') ||
    norm.includes('tout voir') ||
    norm.includes('tous')
  ) {
    return {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      text: '🔄 **Filtres réinitialisés.** Vous visualisez désormais l\'ensemble du périmètre autorisé.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: {
        type: 'RESET_FILTERS',
        label: 'Réinitialiser tous les filtres',
        payload: {}
      },
      derjaVoiceText: 'Sayé, faskht el filtres el koll w rajaat el tableau kemel.'
    };
  }

  // 9. RÉPONSE UNIVERSELLE CONTEXTUALISÉE (Si question libre)
  return {
    id: `msg_${Date.now()}`,
    sender: 'agent',
    text: `🤖 **Analyse EskiFlow :**

J'ai analysé votre demande « *${question}* » en croisant les données du dashboard :

• **Tâches :** ${metrics.totalTasks.toLocaleString()} au total (${metrics.doneTasks} faites, ${metrics.lateTasks} en retard, ${metrics.completionRate}% de réalisation).
• **Ventes :** ${metrics.totalCaHt.toLocaleString()} DT HT réalisés.
• **Frigos :** ${metrics.totalFrigos} frigos suivis (${metrics.totalFrigosAtRisk} à risque).
• **Visites :** ${metrics.totalVisites} visites (${metrics.tauxConformiteGps}% conformes sur site).

💡 *Astuce : Vous pouvez me demander un chef précis (ex: « Tâches de Maher Ayeb »), les retards (« Qui a le plus de retard ? »), les frigos à risque, ou les ventes !*`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    badges: [
      { label: 'IA Active', value: 'Analyse 360°', color: 'bg-blue-100 text-blue-800' },
      { label: 'Tâches', value: `${metrics.completionRate}% Réussite`, color: 'bg-indigo-100 text-indigo-800' },
      { label: 'Retards', value: `${metrics.lateTasks}`, color: 'bg-rose-100 text-rose-800' }
    ],
    derjaVoiceText: `Fhemt souelek. Aandna ${metrics.totalTasks} khedma, ${metrics.lateTasks} mouakhrin, w ${metrics.totalFrigosAtRisk} frigo fi risque.`
  };
}
