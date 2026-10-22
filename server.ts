import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Google Drive File IDs from the user's project
const CONFIG_DRIVE = {
  FRIGOS_FILE_ID: '1L8O1npeycGhvF-Rohc3dK67FbQMoV9oh',
  FRIGOS_SHEET: 'FREEZER_LISTING',
  CLIENTS_FILE_ID: '14g_5J2EDKs48CUGGdvHGPOhnuRhmx2mw',
  TASKS_FILE_ID: process.env.TASKS_FILE_ID || '',
  REALISATION_FILE_ID: '1l4kAb0Ef-JCfr8dRIPSVYkEaa2S8Gsh3'
};

const app = express();
app.use(express.json());

// Helper function to normalize headers
function norm(h: any): string {
  return String(h == null ? '' : h)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s\.\,\-\/\\]+/g, '_')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '');
}

function findCol(keys: string[], ...candidates: string[]): string | null {
  for (const c of candidates) {
    if (keys.includes(c)) return c;
  }
  for (const c of candidates) {
    const found = keys.find((k) => k === c || k.startsWith(c + '_') || k.endsWith('_' + c));
    if (found) return found;
  }
  for (const c of candidates) {
    const found = keys.find((k) => k.includes(c));
    if (found) return found;
  }
  return null;
}

function cleCode(v: any): string {
  const t = String(v == null ? '' : v).trim();
  if (t === '') return '';
  const n = Number(t.replace(/\s/g, '').replace(',', '.'));
  return isNaN(n) ? t : String(n);
}

function num(v: any): number {
  if (typeof v === 'number') return v;
  const n = parseFloat(String(v || '').replace(/\s/g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function isoDate(v: any): string {
  if (!v) return '';
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = ('0' + (v.getMonth() + 1)).slice(-2);
    const d = ('0' + v.getDate()).slice(-2);
    return `${y}-${m}-${d}`;
  }
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

// Function to download file from Google Drive via Node.js
async function downloadDriveFileBuffer(fileId: string, authHeader?: string): Promise<Buffer> {
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  };
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  // 1. Try Google Drive API if token provided
  if (authHeader) {
    const apiRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers });
    if (apiRes.ok) {
      const arr = await apiRes.arrayBuffer();
      return Buffer.from(arr);
    }
  }

  // 2. Try direct download URL with virus scan bypass confirm=t
  const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
  const res = await fetch(directUrl, { headers, redirect: 'follow' });
  
  if (res.ok) {
    const arr = await res.arrayBuffer();
    const buf = Buffer.from(arr);
    const firstChars = buf.subarray(0, 100).toString('utf-8');
    if (firstChars.includes('<!DOCTYPE html>') || firstChars.includes('<html')) {
      // 3. Try Google Sheets export endpoint (if it is a Google Spreadsheet)
      const exportUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;
      const exportRes = await fetch(exportUrl, { headers, redirect: 'follow' });
      if (exportRes.ok) {
        const expArr = await exportRes.arrayBuffer();
        const expBuf = Buffer.from(expArr);
        if (!expBuf.subarray(0, 100).toString('utf-8').includes('<!DOCTYPE html>')) {
          return expBuf;
        }
      }
      throw new Error("Le fichier Google Drive n'est pas configuré en accès partagé ('Tous les utilisateurs disposant du lien'). Veuillez passer le partage du fichier en 'Tous les utilisateurs disposant du lien' dans Google Drive.");
    }
    return buf;
  }

  throw new Error(`Échec du téléchargement Google Drive (Status: ${res.status})`);
}

// API endpoint: Automatic Google Drive synchronisation (supports overview/tasks, frigos, and realisation)
app.get('/api/sync-drive', async (req: Request, res: Response) => {
  const type = (req.query.type as string) || 'frigos';
  const authHeader = req.headers.authorization;

  const now = new Date();
  const z = (n: number) => ('0' + n).slice(-2);
  const majStr = `${z(now.getDate())}/${z(now.getMonth() + 1)}/${now.getFullYear()} ${z(now.getHours())}:${z(now.getMinutes())}`;

  try {
    // -------------------------------------------------------------
    // CAS 1 : VUE D'ENSEMBLE (Tâches & Base Clients)
    // -------------------------------------------------------------
    // CAS 1 : VUE D'ENSEMBLE (Tâches & Base Clients)
    // -------------------------------------------------------------
    if (type === 'overview' || type === 'tasks') {
      const clientsFileId = (req.query.clientsFileId as string) || CONFIG_DRIVE.CLIENTS_FILE_ID;
      const tasksFileId = (req.query.tasksFileId as string) || (req.query.fileId as string) || CONFIG_DRIVE.TASKS_FILE_ID;

      // 1. Download and build Clients Index from CLIENTS_FILE_ID (with cache fallback)
      let clientsIndex: Record<string, any> = {};
      const cacheClientPath = path.resolve(__dirname, 'public/data/clients_base_cache.xlsx');

      let clientBuffer: Buffer | null = null;
      try {
        clientBuffer = await downloadDriveFileBuffer(clientsFileId, authHeader);
        if (clientBuffer && clientBuffer.length > 5000) {
          try {
            fs.mkdirSync(path.dirname(cacheClientPath), { recursive: true });
            fs.writeFileSync(cacheClientPath, clientBuffer);
          } catch {}
        }
      } catch (err: any) {
        console.warn('Erreur téléchargement Drive base clients, essai du cache:', err.message);
        if (fs.existsSync(cacheClientPath)) {
          try {
            clientBuffer = fs.readFileSync(cacheClientPath);
          } catch {}
        }
      }

      if (clientBuffer) {
        try {
          const clWb = XLSX.read(clientBuffer, { type: 'buffer' });
          const clSheetName = clWb.SheetNames.find((s) => s.toLowerCase().includes('client') || s.toLowerCase().includes('base')) || clWb.SheetNames[0];
          const clSheet = clWb.Sheets[clSheetName];
          const rawClData: any[][] = clSheet ? XLSX.utils.sheet_to_json(clSheet, { header: 1 }) : [];
          if (rawClData.length >= 2) {
            const clHeads = (rawClData[0] || []).map(norm);
            const kCode = findCol(clHeads, 'code_client', 'client_code', 'code');
            const kChef = findCol(clHeads, 'nom_chef_zone', 'chef_zone', 'chef');
            const kCdr = findCol(clHeads, 'des_delegation', 'cdr', 'delegation');
            const kRepr = findCol(clHeads, 'nom_rep', 'repr_nom', 'representant');
            const kNom = findCol(clHeads, 'raison_social', 'client_nom', 'nom');
            const kCa25 = findCol(clHeads, 'ca_2025', 'ca_ttc_sell_out_2025');
            const kCa26 = findCol(clHeads, 'ca_2026', 'ca_ttc_sell_out_2026');
            const kStatut = findCol(clHeads, 'statut');
            const kDins = findCol(clHeads, 'date_inscription', 'date_insc');
            const kLat = findCol(clHeads, 'latitude', 'lat');
            const kLng = findCol(clHeads, 'longitude', 'lng');
            const kHab = findCol(clHeads, 'etat_d_avancement_habillage', 'habillage');
            const kNbrFrz = findCol(clHeads, 'nbr_frz', 'nombre_frz', 'frigos');
            const kAct = findCol(clHeads, 'activite', 'activity');
            const kRout = findCol(clHeads, 'routing', 'tournee');
            const kGsm = findCol(clHeads, 'gsm_sys', 'gsm_fid', 'gsm');

            rawClData.slice(1).forEach((r) => {
              const o: Record<string, any> = {};
              clHeads.forEach((h, i) => { if (h) o[h] = r[i]; });
              const code = cleCode(kCode ? o[kCode] : '');
              if (code) {
                const clientEntry = {
                  code,
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
                  habillage: String(kHab ? o[kHab] || '' : '').trim(),
                  nbrFrz: kNbrFrz ? num(o[kNbrFrz]) : 0,
                  activite: String(kAct ? o[kAct] || '' : '').trim(),
                  routing: String(kRout ? o[kRout] || '' : '').trim(),
                  gsm: String(kGsm ? o[kGsm] || '' : '').trim()
                };
                clientsIndex[code] = clientEntry;
                const unpadded = code.replace(/^0+/, '');
                if (unpadded && unpadded !== code) {
                  clientsIndex[unpadded] = clientEntry;
                }
              }
            });
          }
        } catch (err: any) {
          console.warn('Erreur parsing base clients:', err.message);
        }
      }

      // 2. Download Tasks from tasksFileId (if specified) OR load from local Eskiflow file
      let rawTaskData: any[][] = [];
      let taskSourceUsed = '';

      if (tasksFileId) {
        try {
          const taskBuffer = await downloadDriveFileBuffer(tasksFileId, authHeader);
          const taskWb = XLSX.read(taskBuffer, { type: 'buffer' });
          const taskSheetName = taskWb.SheetNames.find((s) => s.toLowerCase().includes('tach')) || taskWb.SheetNames[0];
          const taskSheet = taskWb.Sheets[taskSheetName];
          if (taskSheet) {
            rawTaskData = XLSX.utils.sheet_to_json(taskSheet, { header: 1 });
            taskSourceUsed = `Google Drive (${tasksFileId} - ${taskSheetName})`;
          }
        } catch (err: any) {
          console.warn('Erreur lecture Drive pour tâches, recours au fichier Eskiflow local:', err.message);
        }
      }

      // If no tasks loaded from Drive yet, load the uploaded Eskiflow / Tâches file
      if (rawTaskData.length < 2) {
        const localCandidates = [
          path.resolve(__dirname, 'public/data/eskiflow_taches.csv'),
          path.resolve(__dirname, 'public/assets/aistudio/ESKIFLOW_558524c9'),
          path.resolve(__dirname, 'public/assets/aistudio/ESKIFLOW_02765b79')
        ];
        for (const localPath of localCandidates) {
          if (fs.existsSync(localPath)) {
            try {
              const isCsv = localPath.endsWith('.csv') || !localPath.endsWith('.xlsx');
              const taskWb = isCsv
                ? XLSX.read(fs.readFileSync(localPath, 'utf-8'), { type: 'string' })
                : XLSX.read(fs.readFileSync(localPath), { type: 'buffer' });
              const taskSheetName = taskWb.SheetNames.find((s) => s.toLowerCase().includes('tach')) || taskWb.SheetNames[0];
              const taskSheet = taskWb.Sheets[taskSheetName];
              if (taskSheet) {
                const parsed = XLSX.utils.sheet_to_json(taskSheet, { header: 1 }) as any[][];
                if (parsed.length >= 2) {
                  rawTaskData = parsed;
                  taskSourceUsed = `Fichier Eskiflow (${path.basename(localPath)}) - Feuille ${taskSheetName}`;
                  break;
                }
              }
            } catch (err: any) {
              console.warn(`Erreur lecture ${localPath}:`, err.message);
            }
          }
        }
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let tasks: any[] = [];
      if (rawTaskData.length >= 2) {
        const tHeads = (rawTaskData[0] || []).map(norm);
        const kId = findCol(tHeads, 'id_tache', 'id');
        const kClientCode = findCol(tHeads, 'code_client', 'client_code', 'code');
        const kTitre = findCol(tHeads, 'titre_tache', 'titre', 'tache');
        const kDesc = findCol(tHeads, 'description', 'desc');
        const kEcheance = findCol(tHeads, 'date_echeance', 'echeance');
        const kStatut = findCol(tHeads, 'statut', 'etat');
        const kDemandeur = findCol(tHeads, 'demandeur');
        const kDateReal = findCol(tHeads, 'date_realisation', 'realisee_le');
        const kRealPar = findCol(tHeads, 'realise_par', 'par');
        const kDateCrea = findCol(tHeads, 'date_creation', 'creation');

        tasks = rawTaskData.slice(1).map((r, idx) => {
          const o: Record<string, any> = {};
          tHeads.forEach((h, i) => { if (h) o[h] = r[i]; });
          const rawCode = kClientCode ? o[kClientCode] : '';
          const code = cleCode(rawCode);
          const unpadded = code.replace(/^0+/, '');
          const c = clientsIndex[code] || clientsIndex[unpadded] || {};
          const isMatched = !!(clientsIndex[code] || clientsIndex[unpadded]);

          const rawStatut = String((kStatut ? o[kStatut] : '') || '').trim();
          let statutStr = rawStatut;
          if (/^termin/i.test(rawStatut)) statutStr = 'Terminée';
          else if (/^en att/i.test(rawStatut)) statutStr = 'En attente';
          else if (/^en ret/i.test(rawStatut)) statutStr = 'En retard';
          const isDone = /^termin/i.test(statutStr) || /fait/i.test(statutStr);
          const echeanceIso = isoDate(kEcheance ? o[kEcheance] : '');
          const dateRealIso = isoDate(kDateReal ? o[kDateReal] : '');

          let eDate: Date | null = null;
          if (echeanceIso) {
            const p = echeanceIso.split('-');
            eDate = new Date(+p[0], +p[1] - 1, +p[2]);
          }
          const isLate = !isDone && !!eDate && eDate < today;
          const etat = isDone ? 'Terminée' : isLate ? 'En retard' : 'En attente';
          const chef = c.chef || String(o['chef'] || o['nom_chef_zone'] || '— Non rattaché —').trim();
          const ecart = isDone && dateRealIso && eDate ? Math.round((new Date(dateRealIso).getTime() - eDate.getTime()) / 864e5) : null;

          return {
            id: String((kId ? o[kId] : '') || `TK-${100 + idx}`),
            code: code || String(rawCode || ''),
            titre: String((kTitre ? o[kTitre] : '') || 'Tâche commerciale').trim(),
            desc: String((kDesc ? o[kDesc] : '') || ''),
            echeance: echeanceIso,
            statut: statutStr || etat,
            demandeur: String((kDemandeur ? o[kDemandeur] : '') || ''),
            dateReal: dateRealIso,
            realisePar: String((kRealPar ? o[kRealPar] : '') || ''),
            dateCreation: isoDate(kDateCrea ? o[kDateCrea] : ''),
            trouve: isMatched,
            chef: chef || '— Non rattaché —',
            cdr: c.cdr || String(o['cdr'] || o['des_delegation'] || ''),
            repr: c.repr || String(o['repr'] || o['nom_rep'] || ''),
            clientNom: c.nom || String(o['client_nom'] || o['raison_social'] || code),
            ca25: c.ca25 || num(o['ca_2025'] || 0),
            ca26: c.ca26 || num(o['ca_2026'] || 0),
            dateInsc: c.dateInsc || '',
            inscrit: !!c.inscrit,
            lat: c.lat || num(o['latitude'] || o['lat'] || 0),
            lng: c.lng || num(o['longitude'] || o['lng'] || 0),
            clientStatut: c.statut || String(o['client_statut'] || ''),
            habillage: c.habillage || String(o['habillage'] || ''),
            nbrFrz: c.nbrFrz || 0,
            activite: c.activite || '',
            routing: c.routing || '',
            gsm: c.gsm || '',
            done: isDone,
            late: isLate,
            etat,
            ecart
          };
        });
      }

      const matchedCount = tasks.filter((t) => t.trouve).length;

      return res.json({
        success: true,
        type: 'tasks',
        fileId: tasksFileId || CONFIG_DRIVE.CLIENTS_FILE_ID,
        source: taskSourceUsed,
        total: tasks.length,
        matchedCount,
        clientsCount: Object.keys(clientsIndex).length,
        maj: majStr,
        tasks
      });
    }

    // -------------------------------------------------------------
    // CAS 2 : RÉALISATION (Ventes Sell-Out)
    // -------------------------------------------------------------
    if (type === 'realisation') {
      const fileId = (req.query.fileId as string) || CONFIG_DRIVE.REALISATION_FILE_ID;
      const buffer = await downloadDriveFileBuffer(fileId, authHeader);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const headers = (rawData[0] || []).map(norm);
      const kAnnee = findCol(headers, 'annee', 'exercice');
      const kCode = findCol(headers, 'code_client', 'client_code', 'code');
      const kNom = findCol(headers, 'nom_client', 'raison_social', 'nom');
      const kHt = findCol(headers, 'total_ht', 'montant_ht', 'ht');
      const kFac = findCol(headers, 'num_facture', 'facture', 'num_piece');
      const kMois = findCol(headers, 'mois');
      const kDate = findCol(headers, 'date_facture', 'date');

      const agg: Record<string, number> = {};
      const noms: Record<string, string> = {};

      rawData.slice(1).forEach((r) => {
        const o: Record<string, any> = {};
        headers.forEach((h, i) => { if (h) o[h] = r[i]; });
        if (kAnnee && o[kAnnee] != null) {
          const vA = String(o[kAnnee]).trim();
          if (vA && vA !== '2026' && vA !== '26') return;
        }
        const code = cleCode(kCode ? o[kCode] : '');
        if (!code) return;
        const nom = String(kNom ? o[kNom] || '' : '').trim();
        if (nom) noms[code] = nom;

        let mois = 0;
        if (kMois && o[kMois] != null) mois = num(o[kMois]);
        else if (kDate && o[kDate]) {
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

      return res.json({
        success: true,
        type: 'realisation',
        fileId,
        maj: majStr,
        realisation: { rows, noms, maj: majStr }
      });
    }

    // -------------------------------------------------------------
    // CAS 3 : PARC FRIGOS (FREEZER_LISTING)
    // -------------------------------------------------------------
    const fileId = (req.query.fileId as string) || CONFIG_DRIVE.FRIGOS_FILE_ID;
    const sheetParam = (req.query.sheet as string) || CONFIG_DRIVE.FRIGOS_SHEET;
    const buffer = await downloadDriveFileBuffer(fileId, authHeader);
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const sheetNames = workbook.SheetNames;
    let targetSheetName = sheetNames.find((s) => s.toLowerCase().trim() === sheetParam.toLowerCase().trim());
    if (!targetSheetName) {
      targetSheetName = sheetNames.find((s) => s.toLowerCase().includes('freezer') || s.toLowerCase().includes('listing') || s.toLowerCase().includes('frigo'));
    }
    if (!targetSheetName) targetSheetName = sheetNames[0];

    const sheet = workbook.Sheets[targetSheetName];
    if (!sheet) {
      return res.status(404).json({ error: `Feuille '${sheetParam}' introuvable dans le classeur.` });
    }

    const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (!rawData || rawData.length < 2) {
      return res.status(400).json({ error: "La feuille ne contient aucune ligne." });
    }

    const headers = (rawData[0] || []).map(norm);
    const idx: Record<string, string | null> = {};
    Object.keys(FRZ_CHAMPS).forEach((k) => {
      idx[k] = findCol(headers, ...FRZ_CHAMPS[k]);
    });

    const frigos: any[] = [];
    for (let r = 1; r < rawData.length; r++) {
      const row = rawData[r];
      if (!row || row.length === 0) continue;

      const o: Record<string, any> = {};
      headers.forEach((h, i) => { if (h) o[h] = row[i]; });

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

      item.score = item.score !== '' ? item.score : '—';
      item.nbScan = item.nbScan !== '' ? num(item.nbScan) : 0;

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

      frigos.push(item);
    }

    frigos.sort((a, b) => a.serial.localeCompare(b.serial, 'fr', { numeric: true }));

    return res.json({
      success: true,
      type: 'frigos',
      fileId,
      sheet: targetSheetName,
      total: frigos.length,
      maj: majStr,
      frigos
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Erreur lors de la synchronisation Google Drive'
    });
  }
});

// -------------------------------------------------------------
// APPSHEET INTEGRATION ENDPOINTS
// -------------------------------------------------------------
app.post('/api/appsheet/webhook', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log('[AppSheet Webhook] Données reçues :', JSON.stringify(payload).slice(0, 300));

    // Support des formats de payload AppSheet (objet unique ou { Rows: [...] })
    const rows = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.Rows)
      ? payload.Rows
      : [payload];

    return res.json({
      success: true,
      message: 'Données AppSheet réceptionnées avec succès par Eskiflow',
      timestamp: new Date().toISOString(),
      receivedCount: rows.length,
      sample: rows[0] || null
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Erreur de réception du webhook AppSheet'
    });
  }
});

app.get('/api/appsheet/info', (_req: Request, res: Response) => {
  return res.json({
    app: 'Eskiflow Task Dashboard',
    status: 'ready',
    webhookEndpoint: '/api/appsheet/webhook',
    supportedMethods: ['POST'],
    driveSources: CONFIG_DRIVE,
    help: 'Connectez AppSheet soit en pointant directement sur le Google Sheet Drive, soit via Automation Webhook POST.'
  });
});

// Start Express server with Vite middleware in development or static dist in production
async function startServer() {
  const isDev = process.env.npm_lifecycle_event === 'dev' || process.env.NODE_ENV === 'development';
  const distDir = path.resolve(__dirname, 'dist');
  const distIndex = path.resolve(distDir, 'index.html');
  const isProd = !isDev && (process.env.NODE_ENV === 'production' || process.env.npm_lifecycle_event === 'start' || fs.existsSync(distIndex));

  if (isProd) {
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
    }
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      if (fs.existsSync(distIndex)) {
        res.sendFile(distIndex);
      } else {
        res.status(503).send('Application en cours de génération... Veuillez recharger dans quelques secondes.');
      }
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur prêt sur http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
