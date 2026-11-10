import * as XLSX from 'xlsx';
import { TaskItem, RealisationData, FrigoData, FrigoItem } from '../types/task';

// --- Normalisation & Utilitaires ---

export function norm(h: any): string {
  return String(h == null ? '' : h)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s\.\,\-\/\\]+/g, '_')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function cleCode(v: any): string {
  const t = String(v == null ? '' : v).trim();
  if (t === '') return '';
  const n = Number(t.replace(/\s/g, '').replace(',', '.'));
  return isNaN(n) ? t : String(n);
}

export function num(v: any): number {
  if (typeof v === 'number') return v;
  const n = parseFloat(String(v || '').replace(/\s/g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

export function isoDate(v: any): string {
  if (!v) return '';
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = ('0' + (v.getMonth() + 1)).slice(-2);
    const d = ('0' + v.getDate()).slice(-2);
    return `${y}-${m}-${d}`;
  }
  // Excel numeric date check (e.g. 45000)
  if (typeof v === 'number' && v > 20000 && v < 60000) {
    const date = new Date(Math.round((v - 25569) * 86400 * 1000));
    const y = date.getFullYear();
    const m = ('0' + (date.getMonth() + 1)).slice(-2);
    const d = ('0' + date.getDate()).slice(-2);
    return `${y}-${m}-${d}`;
  }
  const s = String(v).trim();
  const m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m1) return `${m1[3]}-${('0' + m1[2]).slice(-2)}-${('0' + m1[1]).slice(-2)}`;
  const m2 = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m2) return `${m2[1]}-${('0' + m2[2]).slice(-2)}-${('0' + m2[3]).slice(-2)}`;
  return s;
}

function findCol(keys: string[], ...candidates: string[]): string | null {
  // 1. Exact match
  for (const c of candidates) {
    if (keys.includes(c)) return c;
  }
  // 2. Starts with / Ends with
  for (const c of candidates) {
    const found = keys.find((k) => k === c || k.startsWith(c + '_') || k.endsWith('_' + c));
    if (found) return found;
  }
  // 3. Contains
  for (const c of candidates) {
    const found = keys.find((k) => k.includes(c));
    if (found) return found;
  }
  return null;
}

import { CDZ_LIST, getCdzByZoneOrEmail } from '../data/cdzData';

// --- 1. Parser pour Tâches & Clients ---

export function parseTasksExcel(workbook: XLSX.WorkBook): TaskItem[] {
  const sheetNames = workbook.SheetNames;
  // Détection prioritaire de la feuille nommée 'tache' ou 'taches'
  const taskSheetName =
    sheetNames.find((s) => s.toLowerCase().trim() === 'tache') ||
    sheetNames.find((s) => s.toLowerCase().trim() === 'taches') ||
    sheetNames.find((s) => s.toLowerCase().includes('tach')) ||
    sheetNames[0];
  const taskSheet = workbook.Sheets[taskSheetName];
  if (!taskSheet) throw new Error("Onglet des tâches ('tache') introuvable dans le fichier Excel.");

  const rawTaskData: any[][] = XLSX.utils.sheet_to_json(taskSheet, { header: 1 });
  if (rawTaskData.length < 2) return [];

  const taskHeaders = (rawTaskData[0] || []).map(norm);
  const taskRows = rawTaskData.slice(1).map((r) => {
    const o: Record<string, any> = {};
    taskHeaders.forEach((h, i) => {
      if (h) o[h] = r[i];
    });
    return o;
  });

  let clientsIndex: Record<string, any> = {};
  const clientSheetName = sheetNames.find(
    (s) => s.toLowerCase().includes('client') || s.toLowerCase().includes('base')
  );

  if (clientSheetName && clientSheetName !== taskSheetName) {
    const clientSheet = workbook.Sheets[clientSheetName];
    const rawClientData: any[][] = XLSX.utils.sheet_to_json(clientSheet, { header: 1 });
    if (rawClientData.length >= 2) {
      const clientHeaders = (rawClientData[0] || []).map(norm);
      const kCode = findCol(clientHeaders, 'code_client', 'client_code', 'code');
      const kChef = findCol(clientHeaders, 'nom_chef_zone', 'chef_zone', 'chef');
      const kCdr = findCol(clientHeaders, 'des_delegation', 'cdr', 'delegation');
      const kRepr = findCol(clientHeaders, 'nom_rep', 'repr_nom', 'representant');
      const kNom = findCol(clientHeaders, 'raison_social', 'client_nom', 'nom');
      const kCa25 = findCol(clientHeaders, 'ca_2025', 'ca_ttc_sell_out_2025');
      const kCa26 = findCol(clientHeaders, 'ca_2026', 'ca_ttc_sell_out_2026');
      const kStatut = findCol(clientHeaders, 'statut');
      const kDins = findCol(clientHeaders, 'date_inscription', 'date_insc');
      const kLat = findCol(clientHeaders, 'latitude', 'lat');
      const kLng = findCol(clientHeaders, 'longitude', 'lng');
      const kHabillage = findCol(clientHeaders, 'etat_d_avancement_habillage', 'habillage');

      rawClientData.slice(1).forEach((r) => {
        const o: Record<string, any> = {};
        clientHeaders.forEach((h, i) => {
          if (h) o[h] = r[i];
        });
        const code = cleCode(kCode ? o[kCode] : '');
        if (code) {
          const entry = {
            chef: String(kChef ? o[kChef] || '' : '').trim(),
            cdr: String(kCdr ? o[kCdr] || '' : '').trim(),
            repr: String(kRepr ? o[kRepr] || '' : '').trim(),
            nom: String(kNom ? o[kNom] || '' : '').trim(),
            ca25: kCa25 ? num(o[kCa25]) : 0,
            ca26: kCa26 ? num(o[kCa26]) : 0,
            statut: String(kStatut ? o[kStatut] || '' : '').trim(),
            dateInsc: kDins ? isoDate(o[kDins]) : '',
            inscrit: kDins ? String(o[kDins] || '').trim() !== '' : false,
            lat: kLat ? num(o[kLat]) : 0,
            lng: kLng ? num(o[kLng]) : 0,
            habillage: String(kHabillage ? o[kHabillage] || '' : '').trim()
          };
          clientsIndex[code] = entry;
          const unpadded = code.replace(/^0+/, '');
          if (unpadded && unpadded !== code) {
            clientsIndex[unpadded] = entry;
          }
        }
      });
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const kId = findCol(taskHeaders, 'id_tache', 'id');
  const kClientCode = findCol(taskHeaders, 'code_client', 'client_code', 'code');
  const kTitre = findCol(taskHeaders, 'titre_tache', 'titre', 'tache');
  const kDesc = findCol(taskHeaders, 'description', 'desc');
  const kEcheance = findCol(taskHeaders, 'date_echeance', 'echeance');
  const kStatut = findCol(taskHeaders, 'statut', 'etat');
  const kDemandeur = findCol(taskHeaders, 'demandeur');
  const kDateReal = findCol(taskHeaders, 'date_realisation', 'realisee_le');
  const kRealPar = findCol(taskHeaders, 'realise_par', 'par');
  const kDateCrea = findCol(taskHeaders, 'date_creation', 'creation');

  return taskRows
    .filter((t) => (kId && t[kId]) || (kClientCode && t[kClientCode]))
    .map((t, idx) => {
      const code = cleCode(kClientCode ? t[kClientCode] : '');
      const unpadded = code.replace(/^0+/, '');
      const c = clientsIndex[code] || clientsIndex[unpadded] || {};
      const isMatched = !!(clientsIndex[code] || clientsIndex[unpadded]);
      const statutStr = String((kStatut ? t[kStatut] : '') || '').trim();
      const isDone = /^termin/i.test(statutStr);
      const echeanceIso = isoDate(kEcheance ? t[kEcheance] : '');
      const dateRealIso = isoDate(kDateReal ? t[kDateReal] : '');

      let echeanceDate: Date | null = null;
      if (echeanceIso) {
        const parts = echeanceIso.split('-');
        echeanceDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      }

      const isLate = !isDone && !!echeanceDate && echeanceDate < today;
      const etat: 'Terminée' | 'En attente' | 'En retard' = isDone
        ? 'Terminée'
        : isLate
        ? 'En retard'
        : 'En attente';

      const chef = c.chef || String(t['chef'] || t['nom_chef_zone'] || '— Non rattaché —').trim();
      const ecart =
        isDone && dateRealIso && echeanceDate
          ? Math.round((new Date(dateRealIso).getTime() - echeanceDate.getTime()) / 864e5)
          : null;

      return {
        id: String((kId ? t[kId] : '') || `TK-${100 + idx}`),
        code: code,
        titre: String((kTitre ? t[kTitre] : '') || 'Tâche commerciale').trim(),
        desc: String((kDesc ? t[kDesc] : '') || ''),
        echeance: echeanceIso,
        statut: statutStr || etat,
        demandeur: String((kDemandeur ? t[kDemandeur] : '') || ''),
        dateReal: dateRealIso,
        realisePar: String((kRealPar ? t[kRealPar] : '') || ''),
        dateCreation: isoDate(kDateCrea ? t[kDateCrea] : ''),
        trouve: !!clientsIndex[code],
        chef: chef || '— Non rattaché —',
        cdr: c.cdr || String(t['cdr'] || t['des_delegation'] || ''),
        repr: c.repr || String(t['repr'] || t['nom_rep'] || ''),
        clientNom: c.nom || String(t['client_nom'] || t['raison_social'] || code),
        ca25: c.ca25 || num(t['ca_2025'] || 0),
        ca26: c.ca26 || num(t['ca_2026'] || 0),
        dateInsc: c.dateInsc || '',
        inscrit: !!c.inscrit,
        lat: c.lat || num(t['latitude'] || t['lat'] || 0),
        lng: c.lng || num(t['longitude'] || t['lng'] || 0),
        clientStatut: c.statut || String(t['client_statut'] || ''),
        habillage: c.habillage || String(t['habillage'] || ''),
        done: isDone,
        late: isLate,
        etat,
        ecart
      };
    });
}

// --- 2. Parser pour Réalisation Ventes ---

export function parseRealisationExcel(workbook: XLSX.WorkBook): RealisationData {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error("Onglet de réalisation introuvable.");

  const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  if (rawData.length < 2) return { rows: [], noms: {}, maj: new Date().toLocaleTimeString('fr-FR') };

  const headers = (rawData[0] || []).map(norm);
  const kAnnee = findCol(headers, 'annee', 'exercice');
  const kCode = findCol(headers, 'code_client', 'client_code', 'code');
  const kNom = findCol(headers, 'nom_client', 'raison_social', 'nom');
  const kHt = findCol(headers, 'total_ht', 'montant_ht', 'ht', 'chiffre_d_affaires');
  const kFac = findCol(headers, 'num_facture', 'facture', 'num_piece', 'piece');
  const kMois = findCol(headers, 'mois');
  const kDate = findCol(headers, 'date_facture', 'date');

  const agg: Record<string, number> = {};
  const noms: Record<string, string> = {};

  rawData.slice(1).forEach((r) => {
    const o: Record<string, any> = {};
    headers.forEach((h, i) => {
      if (h) o[h] = r[i];
    });

    if (kAnnee && o[kAnnee] != null) {
      const vA = String(o[kAnnee]).trim();
      if (vA && vA !== '2026' && vA !== '26') return;
    }

    const code = cleCode(kCode ? o[kCode] : '');
    if (!code) return;

    const nom = String(kNom ? o[kNom] || '' : '').trim();
    if (nom) noms[code] = nom;

    let mois = 0;
    if (kMois && o[kMois] != null) {
      mois = num(o[kMois]);
    } else if (kDate && o[kDate]) {
      const iso = isoDate(o[kDate]);
      if (iso) mois = parseInt(iso.split('-')[1], 10) || 0;
    }

    const fac = String(kFac ? o[kFac] || '' : '').trim().toUpperCase();
    const pref = fac.slice(0, 3) || 'FAC';
    const amount = kHt ? num(o[kHt]) : 0;

    const key = `${code}|${mois}|${pref}`;
    agg[key] = (agg[key] || 0) + amount;
  });

  const rows: [string, number, string, number][] = Object.keys(agg).map((k) => {
    const p = k.split('|');
    return [p[0], +p[1], p[2], Math.round(agg[k] * 1000) / 1000];
  });

  const now = new Date();
  const z = (n: number) => ('0' + n).slice(-2);
  const majStr = `${z(now.getDate())}/${z(now.getMonth() + 1)}/${now.getFullYear()} ${z(now.getHours())}:${z(now.getMinutes())}`;

  return {
    rows,
    noms,
    maj: majStr
  };
}

// --- 3. Parser pour Suivi Frigos (supporte 7 122+ lignes) ---

const FRZ_CHAMPS: Record<string, string[]> = {
  serial: ['serialnumber', 'serial_number', 'serial', 'n_serie', 'no_serie', 'num_serie', 'matricule', 'appareil', 'materiel', 'code_materiel'],
  codeClient: ['code_client', 'client_code', 'code_clt', 'clt_code', 'code'],
  nomClient: ['nom_client', 'client_nom', 'raison_sociale', 'raison_social', 'nom', 'client', 'libelle_client'],
  habillage: ['habilliage', 'habillage', 'marque', 'plv'],
  usage: ['usage', 'type_usage'],
  statutFrz: ['statut_frz', 'statut_frigo', 'statut', 'etat_frz', 'etat'],
  annee: ['annee', 'year', 'annee_mise_en_place', 'annee_mep'],
  map: ['map', 'coordonnees', 'coords', 'gps', 'position'],
  nbFrz: ['nb_frz', 'nombre_frz', 'nombre', 'qte', 'quantite'],
  datePremFact: ['date_premiere_facture', 'date_1ere_facture', 'date_premiere_fact', 'date_1er_achat', 'date_prem_fac'],
  dateDerFact: ['date_derniere_facture', 'date_derniere_fact', 'date_dernier_achat', 'date_der_fac'],
  nbScan: ['nb_scan', 'nb_scans', 'nombre_scans', 'scans', 'total_scans'],
  dateDernScan: ['date_dernier_scan', 'date_dern_scan', 'dernier_scan', 'last_scan'],
  confFrzGps: ['conf_frz_gps', 'conf_gps'],
  gpsVisit: ['gps_visit', 'gps_visite'],
  confClt: ['conf_clt', 'conf_client'],
  contrat: ['contrat', 'type_contrat', 'num_contrat'],
  date: ['date', 'date_contrat', 'date_signature'],
  statut: ['statut_contrat', 'statut'],
  classe: ['classe', 'classification', 'segment'],
  codeRep: ['code_rep', 'rep_code', 'code_commercial'],
  nomRep: ['nom_rep', 'rep_nom', 'representant', 'commercial'],
  superviseur: ['superviseur', 'sup', 'nom_sup'],
  chefZone: ['chef_de_zone', 'chef_zone', 'nom_chef_zone', 'nom_chef'],
  score: ['score', 'note', 'scoring'],
  risque: ['statut_risque_et', 'statut_risque', 'risque', 'niveau_risque', 'risk'],
  actions: ['actions', 'action', 'action_a_mener', 'consigne'],
  impactScan: ['impact_scan'],
  impactActivation: ['impact_activation'],
  impactRythmeVente: ['impact_rythme_vente'],
  impactStatut: ['impact_statut'],
  impactDetection: ['impact_detection'],
  impactGps: ['impact_gps'],
  impactContrat: ['impact_contrat']
};

export interface SheetInfo {
  name: string;
  rowCount: number;
  isRecommended: boolean;
}

export function inspectFrigosWorkbook(workbook: XLSX.WorkBook): SheetInfo[] {
  return workbook.SheetNames.map((name) => {
    const sh = workbook.Sheets[name];
    let rowCount = 0;
    if (sh && sh['!ref']) {
      try {
        const range = XLSX.utils.decode_range(sh['!ref']);
        rowCount = Math.max(0, range.e.r - range.s.r);
      } catch (e) {
        rowCount = 0;
      }
    }
    const clean = name.toLowerCase().trim();
    const isRecommended =
      clean === 'freezer_listing' ||
      clean === 'freezer' ||
      clean.includes('freezer') ||
      clean.includes('listing') ||
      clean.includes('frigo');

    return {
      name,
      rowCount,
      isRecommended
    };
  });
}

export function parseFrigosExcel(workbook: XLSX.WorkBook, specificSheetName?: string): FrigoData {
  const sheetNames = workbook.SheetNames;
  
  // 1. Si une feuille précise a été spécifiée (ex: 'FREEZER_LISTING')
  let targetSheetName = specificSheetName;

  if (targetSheetName && !workbook.Sheets[targetSheetName]) {
    targetSheetName = sheetNames.find(
      (s) => s.toLowerCase().trim() === specificSheetName?.toLowerCase().trim()
    );
  }

  // 2. Sinon, chercher prioritairement la feuille configurée 'FREEZER_LISTING'
  if (!targetSheetName) {
    targetSheetName = sheetNames.find(
      (s) => s.toLowerCase().trim() === 'freezer_listing'
    );
  }

  // 3. Sinon, chercher toute feuille contenant freezer, listing ou frigo
  if (!targetSheetName) {
    targetSheetName = sheetNames.find(
      (s) => s.toLowerCase().includes('freezer') || s.toLowerCase().includes('listing') || s.toLowerCase().includes('frigo')
    );
  }

  // 4. Secours : tester la présence de la colonne serial dans les feuilles
  if (!targetSheetName) {
    for (const name of sheetNames) {
      const sh = workbook.Sheets[name];
      const data: any[][] = XLSX.utils.sheet_to_json(sh, { header: 1 });
      if (data && data.length >= 2) {
        const heads = (data[0] || []).map(norm);
        if (findCol(heads, ...FRZ_CHAMPS.serial)) {
          targetSheetName = name;
          break;
        }
      }
    }
  }

  // 5. Dernier recours : première feuille
  if (!targetSheetName) {
    targetSheetName = sheetNames[0];
  }

  const targetSheet = workbook.Sheets[targetSheetName];
  if (!targetSheet) {
    throw new Error(`La feuille '${targetSheetName || 'spécifiée'}' est introuvable dans le fichier Excel.`);
  }

  // Lecture UNIQUE de cette feuille
  const rawData: any[][] = XLSX.utils.sheet_to_json(targetSheet, { header: 1 });

  if (!rawData || rawData.length < 2) {
    throw new Error(`La feuille '${targetSheetName}' ne contient aucune ligne de données exploitable.`);
  }

  const headers = (rawData[0] || []).map(norm);
  const idx: Record<string, string | null> = {};
  Object.keys(FRZ_CHAMPS).forEach((k) => {
    idx[k] = findCol(headers, ...FRZ_CHAMPS[k]);
  });

  const frigos: FrigoItem[] = [];

  for (let r = 1; r < rawData.length; r++) {
    const row = rawData[r];
    if (!row || row.length === 0) continue;

    const o: Record<string, any> = {};
    headers.forEach((h, i) => {
      if (h) o[h] = row[i];
    });

    const serialRaw = idx.serial ? o[idx.serial] : row[0];
    const serial = String(serialRaw == null ? '' : serialRaw).trim();
    if (!serial) continue;

    const item: Record<string, any> = { serial };
    Object.keys(FRZ_CHAMPS).forEach((k) => {
      const colName = idx[k];
      const val = colName ? o[colName] : '';
      if (k.toLowerCase().includes('date')) {
        item[k] = isoDate(val);
      } else if (k === 'codeClient') {
        item[k] = cleCode(val);
      } else {
        item[k] = val == null ? '' : String(val).trim();
      }
    });

    // Score & Scans
    item.score = item.score !== '' ? item.score : '—';
    item.nbScan = item.nbScan !== '' ? num(item.nbScan) : 0;

    // GPS coordinates
    let lat: number | undefined;
    let lng: number | undefined;

    const colLat = findCol(headers, 'latitude', 'lat');
    const colLng = findCol(headers, 'longitude', 'lng');

    if (colLat && colLng && o[colLat] && o[colLng]) {
      lat = num(o[colLat]);
      lng = num(o[colLng]);
    } else if (item.map) {
      const m = String(item.map).match(/(-?\d{1,3}[.,]\d+)\D+(-?\d{1,3}[.,]\d+)/);
      if (m) {
        lat = parseFloat(m[1].replace(',', '.'));
        lng = parseFloat(m[2].replace(',', '.'));
      }
    }

    if (lat && lng && lat !== 0 && lng !== 0 && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      item.lat = lat;
      item.lng = lng;
    }

    frigos.push(item as FrigoItem);
  }

  // Tri naturel
  frigos.sort((a, b) => a.serial.localeCompare(b.serial, 'fr', { numeric: true }));

  const now = new Date();
  const z = (n: number) => ('0' + n).slice(-2);
  const majStr = `${z(now.getDate())}/${z(now.getMonth() + 1)}/${now.getFullYear()} ${z(now.getHours())}:${z(now.getMinutes())}`;

  return {
    frigos,
    maj: majStr
  };
}
