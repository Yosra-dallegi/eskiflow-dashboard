import * as XLSX from 'xlsx';
import { TaskItem, RealisationData, FrigoItem, VisiteItem } from '../types/task';

const fr = (s?: string) => s ? s.split('-').reverse().join('/') : '';
const pct = (a: number, b: number) => b ? Math.round((a * 100) / b) : 0;

export function exportTasksExcel(list: TaskItem[]) {
  if (!list.length) {
    alert('Aucune tâche à exporter avec les filtres actuels.');
    return;
  }

  const detail = list.slice().sort((a, b) => (a.echeance || '').localeCompare(b.echeance || '')).map(t => ({
    'ID tâche': t.id,
    'Code client': t.code,
    'Client': t.clientNom,
    'Chef de zone': t.chef,
    'Délégation': t.cdr,
    'Représentant': t.repr,
    'Tâche': t.titre,
    'Échéance': fr(t.echeance),
    'État': t.etat,
    'Date réalisation': fr(t.dateReal),
    'Réalisé par': t.realisePar,
    'Demandeur': t.demandeur,
    'Écart vs échéance (j)': t.ecart == null ? '' : t.ecart,
    'CA 2026': Math.round(t.ca26 || 0),
    'Inscription FID': t.inscrit ? 'Oui' : 'Non',
    'Date inscription': fr(t.dateInsc),
    'Latitude': t.lat || '',
    'Longitude': t.lng || ''
  }));

  const agg = (keyFn: (t: TaskItem) => string, label: string) => {
    const m: Record<string, { total: number; done: number; wait: number; late: number; ca: number }> = {};
    list.forEach(t => {
      const k = keyFn(t) || '—';
      if (!m[k]) m[k] = { total: 0, done: 0, wait: 0, late: 0, ca: 0 };
      m[k].total++;
      if (t.done) m[k].done++;
      else if (t.late) m[k].late++;
      else m[k].wait++;
      m[k].ca += t.ca26 || 0;
    });

    return Object.keys(m).sort((a, b) => m[b].total - m[a].total).map(k => ({
      [label]: k,
      'Total': m[k].total,
      'Terminées': m[k].done,
      'En attente': m[k].wait,
      'En retard': m[k].late,
      'Taux de réalisation (%)': pct(m[k].done, m[k].total),
      'CA 2026 clients': Math.round(m[k].ca)
    }));
  };

  const wb = XLSX.utils.book_new();
  const add = (rows: any[], name: string) => {
    if (!rows.length) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = Object.keys(rows[0]).map(k => ({ wch: Math.max(12, k.length + 2) }));
    XLSX.utils.book_append_sheet(wb, ws, name);
  };

  add(detail, 'Détail');
  add(agg(t => t.chef, 'Chef de zone'), 'Par chef de zone');
  add(agg(t => t.titre, 'Tâche'), 'Par tâche');

  const d = new Date();
  const z = (n: number) => ('0' + n).slice(-2);
  XLSX.writeFile(wb, `Taches_${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}.xlsx`);
}

export function exportRealisationExcel(rowsList: { code: string; nom: string; ht: number }[]) {
  if (!rowsList.length) {
    alert('Aucune donnée à exporter avec les filtres actuels.');
    return;
  }

  const rows = rowsList.map(x => ({
    'CODE_CLIENT': x.code,
    'NOM_CLIENT': x.nom,
    'TOTAL_HT': Math.round(x.ht * 1000) / 1000
  }));
  const total = rowsList.reduce((s, x) => s + x.ht, 0);
  rows.push({
    'CODE_CLIENT': 'TOTAL',
    'NOM_CLIENT': '',
    'TOTAL_HT': Math.round(total * 1000) / 1000
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 14 }, { wch: 40 }, { wch: 16 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Réalisation');

  const d = new Date();
  const z = (n: number) => ('0' + n).slice(-2);
  XLSX.writeFile(wb, `Realisation_${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}.xlsx`);
}

export const FRZ_LIBELLES: Record<string, string> = {
  serial: 'SERIALNUMBER',
  codeClient: 'Code client',
  nomClient: 'Nom client',
  habillage: 'Habillage',
  usage: 'Usage',
  statutFrz: 'Statut FRZ',
  annee: 'Année',
  map: 'Map',
  nbFrz: 'Nb FRZ',
  datePremFact: 'Date première facture',
  dateDerFact: 'Date dernière facture',
  nbScan: 'Nb scan',
  dateDernScan: 'Date dernier scan',
  confFrzGps: 'Conf. FRZ GPS',
  gpsVisit: 'GPS visite',
  confClt: 'Conf. client',
  contrat: 'Contrat',
  date: 'Date',
  statut: 'Statut',
  classe: 'Classe',
  codeRep: 'Code représentant',
  nomRep: 'Représentant',
  superviseur: 'Superviseur',
  chefZone: 'Chef de zone',
  score: 'Score',
  risque: 'Statut risque',
  actions: 'Actions',
  impactScan: 'Impact Scan',
  impactActivation: 'Impact Activation',
  impactRythmeVente: 'Impact Rythme vente',
  impactStatut: 'Impact Statut',
  impactDetection: 'Impact Détection',
  impactGps: 'Impact GPS',
  impactContrat: 'Impact Contrat'
};

const FRZ_DATES = ['datePremFact', 'dateDerFact', 'dateDernScan', 'date'];

export function exportFrigosExcel(frigoList: FrigoItem[]) {
  if (!frigoList.length) {
    alert('Aucun frigo à exporter avec les filtres actuels.');
    return;
  }

  const cols = Object.keys(FRZ_LIBELLES);
  const rows = frigoList.map(f => {
    const o: Record<string, any> = {};
    cols.forEach(k => {
      const val = (f as any)[k];
      o[FRZ_LIBELLES[k]] = FRZ_DATES.indexOf(k) > -1 ? fr(val) : (val == null ? '' : val);
    });
    return o;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = cols.map(k => ({ wch: Math.max(12, FRZ_LIBELLES[k].length + 2) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Frigos');

  const d = new Date();
  const z = (n: number) => ('0' + n).slice(-2);
  XLSX.writeFile(wb, `Frigos_${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}.xlsx`);
}

export function exportVisitesExcel(visitesList: VisiteItem[]) {
  if (!visitesList.length) {
    alert('Aucune visite à exporter avec les filtres actuels.');
    return;
  }

  const detail = visitesList.map((v) => ({
    'ID Visite': v.id,
    'Date Visite': fr(v.date),
    'Code Client': v.codeClient,
    'Nom Client': v.clientNom,
    'Activité': v.activite || '',
    'Téléphone / GSM': v.gsm || '',
    'Statut GPS': v.statutGps,
    'Pointage Coordonnées': v.positionRaw,
    'Latitude': v.lat != null ? v.lat : '',
    'Longitude': v.lng != null ? v.lng : '',
    'Visiteur (Nom)': v.visiteurNom,
    'Visiteur (Email)': v.visiteurEmail,
    'Rôle': v.role || '',
    'Chef de Zone': v.cdzNom || ''
  }));

  // Aggregation by Visiteur
  const aggVisiteur: Record<string, { total: number; surSite: number; horsZone: number }> = {};
  visitesList.forEach((v) => {
    const k = v.visiteurNom || v.visiteurEmail || 'Inconnu';
    if (!aggVisiteur[k]) aggVisiteur[k] = { total: 0, surSite: 0, horsZone: 0 };
    aggVisiteur[k].total++;
    if (v.statutGps === 'Sur site') aggVisiteur[k].surSite++;
    else aggVisiteur[k].horsZone++;
  });

  const repParVisiteur = Object.keys(aggVisiteur)
    .sort((a, b) => aggVisiteur[b].total - aggVisiteur[a].total)
    .map((k) => ({
      'Visiteur': k,
      'Total Visites': aggVisiteur[k].total,
      'Sur site': aggVisiteur[k].surSite,
      'Hors zone': aggVisiteur[k].horsZone,
      'Taux Respect GPS (%)': pct(aggVisiteur[k].surSite, aggVisiteur[k].total)
    }));

  const wb = XLSX.utils.book_new();
  const wsDetail = XLSX.utils.json_to_sheet(detail);
  wsDetail['!cols'] = Object.keys(detail[0]).map((k) => ({ wch: Math.max(14, k.length + 2) }));
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Visites');

  if (repParVisiteur.length > 0) {
    const wsAgg = XLSX.utils.json_to_sheet(repParVisiteur);
    wsAgg['!cols'] = Object.keys(repParVisiteur[0]).map((k) => ({ wch: Math.max(14, k.length + 2) }));
    XLSX.utils.book_append_sheet(wb, wsAgg, 'Synthèse par Visiteur');
  }

  const d = new Date();
  const z = (n: number) => ('0' + n).slice(-2);
  XLSX.writeFile(wb, `Visites_Clients_${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}.xlsx`);
}

