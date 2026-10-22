export interface TaskItem {
  id: string;
  code: string;
  titre: string;
  desc: string;
  echeance: string; // yyyy-MM-dd
  statut: string;
  demandeur: string;
  dateReal: string;
  realisePar: string;
  dateCreation: string;
  trouve: boolean;
  // Données enrichies client
  chef: string; // Nom Chef de Zone
  cdr: string; // Délégation / CDR
  repr: string; // Nom Représentant
  clientNom: string; // Raison sociale
  ca25: number; // CA TTC 2025
  ca26: number; // CA TTC 2026
  dateInsc: string;
  inscrit: boolean;
  lat: number;
  lng: number;
  clientStatut: string;
  habillage: string;
  // Calculés côté dashboard
  done?: boolean;
  late?: boolean;
  etat?: 'Terminée' | 'En attente' | 'En retard';
  ecart?: number | null;
}

export interface CdzBudget {
  cdzEmail: string;
  nom: string;
  aliases: string[];
  zone: string;
  budgetHabillageHt: number;
  budgetCadeauTtc: number;
}

export interface RealisationRow {
  code: string;
  mois: number;
  pref: string;
  ht: number;
}

export interface RealisationData {
  rows: [string, number, string, number][]; // [code, mois, pref, ht]
  noms: Record<string, string>;
  maj: string;
  stats?: {
    lues: number;
    annee: number;
    site: number;
    cat: number;
    crit: { annee: number; site: string; cat: string };
  };
}

export interface FrigoItem {
  serial: string;
  codeClient: string;
  nomClient: string;
  habillage: string;
  usage: string;
  statutFrz: string;
  annee: string;
  map: string;
  nbFrz: string | number;
  datePremFact: string;
  dateDerFact: string;
  nbScan: string | number;
  dateDernScan: string;
  confFrzGps: string;
  gpsVisit: string;
  confClt: string;
  contrat: string;
  date: string;
  statut: string;
  classe: string;
  codeRep: string;
  nomRep: string;
  superviseur: string;
  chefZone: string;
  score: string | number;
  risque: string;
  actions: string;
  impactScan?: string;
  impactActivation?: string;
  impactRythmeVente?: string;
  impactStatut?: string;
  impactDetection?: string;
  impactGps?: string;
  impactContrat?: string;
  lat?: number;
  lng?: number;
}

export interface FrigoData {
  frigos: FrigoItem[];
  maj: string;
  champsAbsents?: string[];
  formulesEnErreur?: string[];
  note?: string;
  noteCarte?: string;
}
