// Table hiérarchique CDZ / Superviseurs / Prévendeurs Vilavi
export interface CdzMember {
  email: string;
  nom: string;
  role: 'CDZ' | 'SUP' | 'PRV';
  codePrv?: string;
}

export interface CdzProfile {
  email: string;
  name: string;
  aliases: string[];
  teamEmails: string[];
  supervisors: string[];
  prvs: { code: string; nom: string }[];
  members: CdzMember[];
}

export const CDZ_LIST: CdzProfile[] = [
  {
    email: 'mohamed.jouini@vilavi.tn',
    name: 'JOUINI MOHAMED',
    aliases: ['JOUINI MOHAMED', 'MOHAMED JOUINI', 'JOUINI MOHAMED '],
    teamEmails: [
      'mohamed.jouini@vilavi.tn',
      'ahmed.trabelsi@vilavi.tn',
      'dhia.manai@vilavi.tn',
      'aymen.amdouni@vilavi.tn',
      'seif.ayari@vilavi.tn',
      'issam.saidi@vilavi.tn',
      'chokri.zghidi@vilavi.tn',
      'sami.mezzi@vilavi.tn'
    ],
    supervisors: [
      'AHMED TRABELSI',
      'AMDOUNI AYMEN',
      'SAIF AYARI',
      'ISSAM SAIDI_BIS',
      'ZGHIDI CHOKRI',
      'MEZZI SAMI'
    ],
    prvs: [
      { code: 'PRV03', nom: 'DHIA MANAI' },
      { code: 'PRV06', nom: '' },
      { code: 'PRV01', nom: 'CHOKRI ZGHIDI' },
      { code: 'PRV04', nom: 'SLIM OUERGHEMMI' }
    ],
    members: [
      { email: 'mohamed.jouini@vilavi.tn', nom: 'JOUINI MOHAMED', role: 'CDZ', codePrv: '' },
      { email: 'ahmed.trabelsi@vilavi.tn', nom: 'AHMED TRABELSI', role: 'SUP', codePrv: '' },
      { email: 'dhia.manai@vilavi.tn', nom: 'DHIA MANAI', role: 'PRV', codePrv: 'PRV03' },
      { email: 'ahmed.trabelsi@vilavi.tn', nom: 'CHOKRI ZGHIDI', role: 'PRV', codePrv: 'PRV01' },
      { email: 'ahmed.trabelsi@vilavi.tn', nom: 'SLIM OUERGHEMMI', role: 'PRV', codePrv: 'PRV04' },
      { email: 'aymen.amdouni@vilavi.tn', nom: 'AMDOUNI AYMEN', role: 'SUP', codePrv: '' },
      { email: 'seif.ayari@vilavi.tn', nom: 'SAIF AYARI', role: 'SUP', codePrv: '' },
      { email: 'issam.saidi@vilavi.tn', nom: 'ISSAM SAIDI_BIS', role: 'SUP', codePrv: '' },
      { email: 'chokri.zghidi@vilavi.tn', nom: 'ZGHIDI CHOKRI', role: 'SUP', codePrv: '' },
      { email: 'sami.mezzi@vilavi.tn', nom: 'MEZZI SAMI', role: 'SUP', codePrv: '' }
    ]
  },
  {
    email: 'mourad.hasnaoui@vilavi.tn',
    name: 'MOURAD HASNAOUI',
    aliases: ['MOURAD HASNAOUI', 'HASNAOUI MOURAD', 'MOURAD HASNAOUI '],
    teamEmails: [
      'mourad.hasnaoui@vilavi.tn',
      'issam.saidi@vilavi.tn',
      'chokri.zghidi@vilavi.tn',
      'sami.mezzi@vilavi.tn'
    ],
    supervisors: [
      'ISSAM SAIDI',
      'ZGHIDI CHOKRI_BIS',
      'MEZZI SAMI_BIS',
      'MOURAD HASNAOUI'
    ],
    prvs: [
      { code: 'PRV07', nom: 'ISSAM SAIDI' },
      { code: 'PRV02', nom: 'MOURAD HASNAOUI' }
    ],
    members: [
      { email: 'mourad.hasnaoui@vilavi.tn', nom: 'MOURAD HASNAOUI', role: 'CDZ', codePrv: 'PRV02' },
      { email: 'issam.saidi@vilavi.tn', nom: 'ISSAM SAIDI', role: 'SUP', codePrv: 'PRV07' },
      { email: 'chokri.zghidi@vilavi.tn', nom: 'ZGHIDI CHOKRI_BIS', role: 'SUP', codePrv: '' },
      { email: 'sami.mezzi@vilavi.tn', nom: 'MEZZI SAMI_BIS', role: 'SUP', codePrv: '' }
    ]
  },
  {
    email: 'fahmi.soudani@vilavi.tn',
    name: 'SOUDANI FAHMI',
    aliases: ['SOUDANI FAHMI', 'FAHMI SOUDANI', 'SOUDANI FAHMI '],
    teamEmails: [
      'fahmi.soudani@vilavi.tn',
      'seif.ayari@vilavi.tn',
      'wajdi.kalaii@vilavi.tn',
      'ahmed.trabelsi@vilavi.tn'
    ],
    supervisors: [
      'SAIF AYARI_BIS',
      'WAJDI KALAII',
      'AHMED TRABELSI_BIS',
      'SOUDANI FAHMI'
    ],
    prvs: [],
    members: [
      { email: 'fahmi.soudani@vilavi.tn', nom: 'SOUDANI FAHMI', role: 'CDZ', codePrv: '' },
      { email: 'seif.ayari@vilavi.tn', nom: 'SAIF AYARI_BIS', role: 'SUP', codePrv: '' },
      { email: 'wajdi.kalaii@vilavi.tn', nom: 'WAJDI KALAII', role: 'SUP', codePrv: '' },
      { email: 'ahmed.trabelsi@vilavi.tn', nom: 'AHMED TRABELSI_BIS', role: 'SUP', codePrv: '' }
    ]
  },
  {
    email: 'tarak.boukottaya@vilavi.tn',
    name: 'BOUKOTTAYA TAREK',
    aliases: ['BOUKOTTAYA TAREK', 'TAREK BOUKOTTAYA', 'BOUKOTTAYA TAREK '],
    teamEmails: [
      'tarak.boukottaya@vilavi.tn',
      'wajih.arwa@vilavi.tn',
      'omar.hrichi@vilavi.tn'
    ],
    supervisors: [
      'ARWA WAJIH',
      'HRICHI OMAR',
      'BOUKOTTAYA TAREK'
    ],
    prvs: [],
    members: [
      { email: 'tarak.boukottaya@vilavi.tn', nom: 'BOUKOTTAYA TAREK', role: 'CDZ', codePrv: '' },
      { email: 'wajih.arwa@vilavi.tn', nom: 'ARWA WAJIH', role: 'SUP', codePrv: '' },
      { email: 'omar.hrichi@vilavi.tn', nom: 'HRICHI OMAR', role: 'SUP', codePrv: '' }
    ]
  },
  {
    email: 'sami.ez@vilavi.tn',
    name: 'EZZAR SAMI',
    aliases: ['EZZAR SAMI', 'SAMI EZZAR', 'EZZAR SAMI '],
    teamEmails: [
      'sami.ez@vilavi.tn',
      'maher.ayeb@vilavi.tn',
      'ahmed.amara@vilavi.tn',
      'hamza.miled@vilavi.tn',
      'omar.hrichi@vilavi.tn'
    ],
    supervisors: [
      'MAHER AYEB',
      'AMARA MOHAMED AHMED',
      'MILED HAMZA',
      'HRICHI OMAR_BIS',
      'EZZAR SAMI'
    ],
    prvs: [],
    members: [
      { email: 'sami.ez@vilavi.tn', nom: 'EZZAR SAMI', role: 'CDZ', codePrv: '' },
      { email: 'maher.ayeb@vilavi.tn', nom: 'MAHER AYEB', role: 'SUP', codePrv: '' },
      { email: 'ahmed.amara@vilavi.tn', nom: 'AMARA MOHAMED AHMED', role: 'SUP', codePrv: '' },
      { email: 'hamza.miled@vilavi.tn', nom: 'MILED HAMZA', role: 'SUP', codePrv: '' },
      { email: 'omar.hrichi@vilavi.tn', nom: 'HRICHI OMAR_BIS', role: 'SUP', codePrv: '' }
    ]
  },
  {
    email: 'debeghi.lotfi@vilavi.tn',
    name: 'Dabeghi lotfi',
    aliases: ['Dabeghi lotfi', 'DABEGHI LOTFI', 'LOTFI DEBEGHI', 'debeghi lotfi'],
    teamEmails: [
      'debeghi.lotfi@vilavi.tn',
      'mohamed.rebah@vilavi.tn',
      'maher.benmansour@vilavi.tn'
    ],
    supervisors: [
      'REBAH MOHAMED',
      'MAHER BEN MANSOUR',
      'BEN MANSOUR MAHER',
      'DABEGHI LOTFI',
      'LOTFI DEBEGHI'
    ],
    prvs: [
      { code: 'PRV13', nom: 'Ben Mansour Maher' }
    ],
    members: [
      { email: 'debeghi.lotfi@vilavi.tn', nom: 'Dabeghi lotfi', role: 'CDZ', codePrv: '' },
      { email: 'mohamed.rebah@vilavi.tn', nom: 'REBAH MOHAMED', role: 'SUP', codePrv: '' },
      { email: 'maher.benmansour@vilavi.tn', nom: 'BEN MANSOUR MAHER', role: 'SUP', codePrv: 'PRV13' }
    ]
  },
  {
    email: 'abdelmajid.chouchene@vilavi.tn',
    name: 'CHOUCHENE ABDELMAJID',
    aliases: ['CHOUCHENE ABDELMAJID', 'ABDELMAJID CHOUCHENE', 'CHOUCHENE ABDELMAJID '],
    teamEmails: [
      'abdelmajid.chouchene@vilavi.tn',
      'anis.kouki@vilavi.tn',
      'aymen.amdouni@vilavi.tn',
      'wajih.arwa@vilavi.tn'
    ],
    supervisors: [
      'KOUKI ANIS',
      'AMDOUNI AYMEN_BIS',
      'ARWA WAJIH_BIS',
      'CHOUCHENE ABDELMAJID'
    ],
    prvs: [],
    members: [
      { email: 'abdelmajid.chouchene@vilavi.tn', nom: 'CHOUCHENE ABDELMAJID', role: 'CDZ', codePrv: '' },
      { email: 'anis.kouki@vilavi.tn', nom: 'KOUKI ANIS', role: 'SUP', codePrv: '' },
      { email: 'aymen.amdouni@vilavi.tn', nom: 'AMDOUNI AYMEN_BIS', role: 'SUP', codePrv: '' },
      { email: 'wajih.arwa@vilavi.tn', nom: 'ARWA WAJIH_BIS', role: 'SUP', codePrv: '' }
    ]
  }
];

export const EMAIL_TO_NAME: Record<string, string> = {
  'yosra.dallegi@vilavi.tn': 'Yosra Dallegi',
  'rafik.khefifi@vilavi.tn': 'Rafik Khefifi',
  'oubaiedallah.woissoissi@vilavi.tn': 'Oubaiedallah Woissoissi',
  'mohamed.jouini@vilavi.tn': 'JOUINI MOHAMED',
  'ahmed.trabelsi@vilavi.tn': 'AHMED TRABELSI',
  'dhia.manai@vilavi.tn': 'DHIA MANAI',
  'aymen.amdouni@vilavi.tn': 'AMDOUNI AYMEN',
  'mourad.hasnaoui@vilavi.tn': 'MOURAD HASNAOUI',
  'issam.saidi@vilavi.tn': 'ISSAM SAIDI',
  'chokri.zghidi@vilavi.tn': 'ZGHIDI CHOKRI',
  'sami.mezzi@vilavi.tn': 'MEZZI SAMI',
  'seif.ayari@vilavi.tn': 'SAIF AYARI',
  'fahmi.soudani@vilavi.tn': 'SOUDANI FAHMI',
  'wajdi.kalaii@vilavi.tn': 'WAJDI KALAII',
  'tarak.boukottaya@vilavi.tn': 'BOUKOTTAYA TAREK',
  'wajih.arwa@vilavi.tn': 'ARWA WAJIH',
  'omar.hrichi@vilavi.tn': 'HRICHI OMAR',
  'sami.ez@vilavi.tn': 'EZZAR SAMI',
  'maher.ayeb@vilavi.tn': 'MAHER AYEB',
  'ahmed.amara@vilavi.tn': 'AMARA MOHAMED AHMED',
  'hamza.miled@vilavi.tn': 'MILED HAMZA',
  'debeghi.lotfi@vilavi.tn': 'Dabeghi lotfi',
  'mohamed.rebah@vilavi.tn': 'REBAH MOHAMED',
  'maher.benmansour@vilavi.tn': 'BEN MANSOUR MAHER',
  'abdelmajid.chouchene@vilavi.tn': 'CHOUCHENE ABDELMAJID',
  'anis.kouki@vilavi.tn': 'KOUKI ANIS'
};

// =========================================================================
// TABLE OFFICIELLE D'AFFECTATION SUPERVISEURS -> CHEFS DE ZONE (CDZ)
// =========================================================================
export const SUPERVISOR_TO_CDZ: Record<string, { cdzEmail: string; cdzName: string }> = {
  // Mohamed Jouini
  'AHMED TRABELSI': { cdzEmail: 'mohamed.jouini@vilavi.tn', cdzName: 'JOUINI MOHAMED' },
  'AMDOUNI AYMEN': { cdzEmail: 'mohamed.jouini@vilavi.tn', cdzName: 'JOUINI MOHAMED' },
  'AYMEN AMDOUNI': { cdzEmail: 'mohamed.jouini@vilavi.tn', cdzName: 'JOUINI MOHAMED' },
  'SAIF AYARI': { cdzEmail: 'mohamed.jouini@vilavi.tn', cdzName: 'JOUINI MOHAMED' },
  'SEIF AYARI': { cdzEmail: 'mohamed.jouini@vilavi.tn', cdzName: 'JOUINI MOHAMED' },
  'ISSAM SAIDI_BIS': { cdzEmail: 'mohamed.jouini@vilavi.tn', cdzName: 'JOUINI MOHAMED' },
  'ZGHIDI CHOKRI': { cdzEmail: 'mohamed.jouini@vilavi.tn', cdzName: 'JOUINI MOHAMED' },
  'CHOKRI ZGHIDI': { cdzEmail: 'mohamed.jouini@vilavi.tn', cdzName: 'JOUINI MOHAMED' },
  'MEZZI SAMI': { cdzEmail: 'mohamed.jouini@vilavi.tn', cdzName: 'JOUINI MOHAMED' },
  'SAMI MEZZI': { cdzEmail: 'mohamed.jouini@vilavi.tn', cdzName: 'JOUINI MOHAMED' },
  'JOUINI MOHAMED': { cdzEmail: 'mohamed.jouini@vilavi.tn', cdzName: 'JOUINI MOHAMED' },
  'MOHAMED JOUINI': { cdzEmail: 'mohamed.jouini@vilavi.tn', cdzName: 'JOUINI MOHAMED' },

  // Mourad Hasnaoui
  'ISSAM SAIDI': { cdzEmail: 'mourad.hasnaoui@vilavi.tn', cdzName: 'MOURAD HASNAOUI' },
  'ZGHIDI CHOKRI_BIS': { cdzEmail: 'mourad.hasnaoui@vilavi.tn', cdzName: 'MOURAD HASNAOUI' },
  'MEZZI SAMI_BIS': { cdzEmail: 'mourad.hasnaoui@vilavi.tn', cdzName: 'MOURAD HASNAOUI' },
  'MOURAD HASNAOUI': { cdzEmail: 'mourad.hasnaoui@vilavi.tn', cdzName: 'MOURAD HASNAOUI' },
  'HASNAOUI MOURAD': { cdzEmail: 'mourad.hasnaoui@vilavi.tn', cdzName: 'MOURAD HASNAOUI' },

  // Fahmi Soudani
  'SAIF AYARI_BIS': { cdzEmail: 'fahmi.soudani@vilavi.tn', cdzName: 'SOUDANI FAHMI' },
  'WAJDI KALAII': { cdzEmail: 'fahmi.soudani@vilavi.tn', cdzName: 'SOUDANI FAHMI' },
  'AHMED TRABELSI_BIS': { cdzEmail: 'fahmi.soudani@vilavi.tn', cdzName: 'SOUDANI FAHMI' },
  'SOUDANI FAHMI': { cdzEmail: 'fahmi.soudani@vilavi.tn', cdzName: 'SOUDANI FAHMI' },
  'FAHMI SOUDANI': { cdzEmail: 'fahmi.soudani@vilavi.tn', cdzName: 'SOUDANI FAHMI' },

  // Tarek Boukottaya
  'ARWA WAJIH': { cdzEmail: 'tarak.boukottaya@vilavi.tn', cdzName: 'BOUKOTTAYA TAREK' },
  'WAJIH ARWA': { cdzEmail: 'tarak.boukottaya@vilavi.tn', cdzName: 'BOUKOTTAYA TAREK' },
  'HRICHI OMAR': { cdzEmail: 'tarak.boukottaya@vilavi.tn', cdzName: 'BOUKOTTAYA TAREK' },
  'OMAR HRICHI': { cdzEmail: 'tarak.boukottaya@vilavi.tn', cdzName: 'BOUKOTTAYA TAREK' },
  'BOUKOTTAYA TAREK': { cdzEmail: 'tarak.boukottaya@vilavi.tn', cdzName: 'BOUKOTTAYA TAREK' },
  'TARAK BOUKOTTAYA': { cdzEmail: 'tarak.boukottaya@vilavi.tn', cdzName: 'BOUKOTTAYA TAREK' },

  // Sami Ezzar
  'MAHER AYEB': { cdzEmail: 'sami.ez@vilavi.tn', cdzName: 'EZZAR SAMI' },
  'AMARA MOHAMED AHMED': { cdzEmail: 'sami.ez@vilavi.tn', cdzName: 'EZZAR SAMI' },
  'AHMED AMARA': { cdzEmail: 'sami.ez@vilavi.tn', cdzName: 'EZZAR SAMI' },
  'MILED HAMZA': { cdzEmail: 'sami.ez@vilavi.tn', cdzName: 'EZZAR SAMI' },
  'HAMZA MILED': { cdzEmail: 'sami.ez@vilavi.tn', cdzName: 'EZZAR SAMI' },
  'HRICHI OMAR_BIS': { cdzEmail: 'sami.ez@vilavi.tn', cdzName: 'EZZAR SAMI' },
  'EZZAR SAMI': { cdzEmail: 'sami.ez@vilavi.tn', cdzName: 'EZZAR SAMI' },
  'SAMI EZZAR': { cdzEmail: 'sami.ez@vilavi.tn', cdzName: 'EZZAR SAMI' },

  // Lotfi Debeghi
  'REBAH MOHAMED': { cdzEmail: 'debeghi.lotfi@vilavi.tn', cdzName: 'DABEGHI LOTFI' },
  'MOHAMED REBAH': { cdzEmail: 'debeghi.lotfi@vilavi.tn', cdzName: 'DABEGHI LOTFI' },
  'MAHER BEN MANSOUR': { cdzEmail: 'debeghi.lotfi@vilavi.tn', cdzName: 'DABEGHI LOTFI' },
  'BEN MANSOUR MAHER': { cdzEmail: 'debeghi.lotfi@vilavi.tn', cdzName: 'DABEGHI LOTFI' },
  'DABEGHI LOTFI': { cdzEmail: 'debeghi.lotfi@vilavi.tn', cdzName: 'DABEGHI LOTFI' },
  'LOTFI DEBEGHI': { cdzEmail: 'debeghi.lotfi@vilavi.tn', cdzName: 'DABEGHI LOTFI' },

  // Abdelmajid Chouchene
  'KOUKI ANIS': { cdzEmail: 'abdelmajid.chouchene@vilavi.tn', cdzName: 'CHOUCHENE ABDELMAJID' },
  'ANIS KOUKI': { cdzEmail: 'abdelmajid.chouchene@vilavi.tn', cdzName: 'CHOUCHENE ABDELMAJID' },
  'AMDOUNI AYMEN_BIS': { cdzEmail: 'abdelmajid.chouchene@vilavi.tn', cdzName: 'CHOUCHENE ABDELMAJID' },
  'ARWA WAJIH_BIS': { cdzEmail: 'abdelmajid.chouchene@vilavi.tn', cdzName: 'CHOUCHENE ABDELMAJID' },
  'CHOUCHENE ABDELMAJID': { cdzEmail: 'abdelmajid.chouchene@vilavi.tn', cdzName: 'CHOUCHENE ABDELMAJID' },
  'ABDELMAJID CHOUCHENE': { cdzEmail: 'abdelmajid.chouchene@vilavi.tn', cdzName: 'CHOUCHENE ABDELMAJID' }
};

/**
 * Retrouve le CDZ correspondant à un nom de superviseur ou à une zone
 */
export function getCdzForSupervisor(supervisorOrChef?: string): { cdzEmail: string; cdzName: string } | undefined {
  if (!supervisorOrChef) return undefined;
  const s = supervisorOrChef.trim().toUpperCase();
  if (SUPERVISOR_TO_CDZ[s]) return SUPERVISOR_TO_CDZ[s];
  for (const [key, val] of Object.entries(SUPERVISOR_TO_CDZ)) {
    if (s === key || s.includes(key) || key.includes(s)) return val;
  }
  return undefined;
}

export type ModuleKey = 'pOverview' | 'pFrigos';

export const ALL_MODULES: { key: ModuleKey; label: string; icon: string; desc: string }[] = [
  { key: 'pOverview', label: 'Suivi des Tâches', icon: '📋', desc: 'Performance commerciale, avancement et cartographie' },
  { key: 'pFrigos', label: 'Suivi des Frigos', icon: '❄️', desc: 'Parc de matériel, conformité GPS et détection des risques' }
];

export interface CdzPermissions {
  allowedModules: ModuleKey[];
  allowedTeamEmails: string[];
  isGlobalManager?: boolean;
  nom?: string;
  role?: string;
}

export interface Collaborateur {
  email: string;
  nom: string;
  role: 'CDZ' | 'SUP' | 'PRV' | 'Direction';
}

export const ALL_COLLABORATORS: Collaborateur[] = [
  // CDZs
  { email: 'mohamed.jouini@vilavi.tn', nom: 'JOUINI MOHAMED', role: 'CDZ' },
  { email: 'mourad.hasnaoui@vilavi.tn', nom: 'MOURAD HASNAOUI', role: 'CDZ' },
  { email: 'fahmi.soudani@vilavi.tn', nom: 'SOUDANI FAHMI', role: 'CDZ' },
  { email: 'tarak.boukottaya@vilavi.tn', nom: 'BOUKOTTAYA TAREK', role: 'CDZ' },
  { email: 'sami.ez@vilavi.tn', nom: 'EZZAR SAMI', role: 'CDZ' },
  { email: 'debeghi.lotfi@vilavi.tn', nom: 'Dabeghi lotfi', role: 'CDZ' },
  { email: 'abdelmajid.chouchene@vilavi.tn', nom: 'CHOUCHENE ABDELMAJID', role: 'CDZ' },

  // Superviseurs et comptes BIS
  { email: 'ahmed.trabelsi@vilavi.tn', nom: 'AHMED TRABELSI', role: 'SUP' },
  { email: 'ahmed.trabelsi@vilavi.tn', nom: 'AHMED TRABELSI_BIS (Soudani)', role: 'SUP' },
  { email: 'aymen.amdouni@vilavi.tn', nom: 'AMDOUNI AYMEN', role: 'SUP' },
  { email: 'aymen.amdouni@vilavi.tn', nom: 'AMDOUNI AYMEN_BIS (Chouchene)', role: 'SUP' },
  { email: 'seif.ayari@vilavi.tn', nom: 'SAIF AYARI', role: 'SUP' },
  { email: 'seif.ayari@vilavi.tn', nom: 'SAIF AYARI_BIS (Soudani)', role: 'SUP' },
  { email: 'issam.saidi@vilavi.tn', nom: 'ISSAM SAIDI', role: 'SUP' },
  { email: 'issam.saidi@vilavi.tn', nom: 'ISSAM SAIDI_BIS (Jouini)', role: 'SUP' },
  { email: 'chokri.zghidi@vilavi.tn', nom: 'ZGHIDI CHOKRI', role: 'SUP' },
  { email: 'chokri.zghidi@vilavi.tn', nom: 'ZGHIDI CHOKRI_BIS (Hasnaoui)', role: 'SUP' },
  { email: 'sami.mezzi@vilavi.tn', nom: 'MEZZI SAMI', role: 'SUP' },
  { email: 'sami.mezzi@vilavi.tn', nom: 'MEZZI SAMI_BIS (Hasnaoui)', role: 'SUP' },
  { email: 'wajdi.kalaii@vilavi.tn', nom: 'WAJDI KALAII', role: 'SUP' },
  { email: 'wajih.arwa@vilavi.tn', nom: 'ARWA WAJIH', role: 'SUP' },
  { email: 'omar.hrichi@vilavi.tn', nom: 'HRICHI OMAR', role: 'SUP' },
  { email: 'omar.hrichi@vilavi.tn', nom: 'HRICHI OMAR_BIS (Chouchene)', role: 'SUP' },
  { email: 'maher.ayeb@vilavi.tn', nom: 'MAHER AYEB', role: 'SUP' },
  { email: 'ahmed.amara@vilavi.tn', nom: 'AMARA MOHAMED AHMED', role: 'SUP' },
  { email: 'hamza.miled@vilavi.tn', nom: 'MILED HAMZA', role: 'SUP' },
  { email: 'mohamed.rebah@vilavi.tn', nom: 'REBAH MOHAMED', role: 'SUP' },
  { email: 'maher.benmansour@vilavi.tn', nom: 'BEN MANSOUR MAHER (PRV13)', role: 'SUP' },
  { email: 'anis.kouki@vilavi.tn', nom: 'KOUKI ANIS', role: 'SUP' },

  // Prévendeurs
  { email: 'dhia.manai@vilavi.tn', nom: 'DHIA MANAI (PRV03)', role: 'PRV' },
  { email: 'ahmed.trabelsi@vilavi.tn', nom: 'CHOKRI ZGHIDI (PRV01)', role: 'PRV' },
  { email: 'ahmed.trabelsi@vilavi.tn', nom: 'SLIM OUERGHEMMI (PRV04)', role: 'PRV' },

  // Direction & Managers
  { email: 'yosra.dallegi@vilavi.tn', nom: 'Yosra Dallegi', role: 'Direction' },
  { email: 'yosra.dallgi@vilavi.tn', nom: 'Yosra Dallegi', role: 'Direction' },
  { email: 'oubaiedallah.woissoissi@vilavi.tn', nom: 'Oubaiedallah Woissoissi', role: 'Direction' },
  { email: 'rafik.khefifi@vilavi.tn', nom: 'Rafik Khefifi', role: 'Direction' }
];

export const DEFAULT_CDZ_PERMISSIONS: Record<string, CdzPermissions> = {
  'mohamed.jouini@vilavi.tn': {
    allowedModules: ['pOverview', 'pFrigos'],
    allowedTeamEmails: [
      'ahmed.trabelsi@vilavi.tn',
      'aymen.amdouni@vilavi.tn',
      'chokri.zghidi@vilavi.tn',
      'dhia.manai@vilavi.tn',
      'issam.saidi@vilavi.tn',
      'mohamed.jouini@vilavi.tn',
      'sami.mezzi@vilavi.tn',
      'seif.ayari@vilavi.tn'
    ]
  },
  'mourad.hasnaoui@vilavi.tn': {
    allowedModules: ['pOverview', 'pFrigos'],
    allowedTeamEmails: [
      'chokri.zghidi@vilavi.tn',
      'issam.saidi@vilavi.tn',
      'mourad.hasnaoui@vilavi.tn',
      'sami.mezzi@vilavi.tn'
    ]
  },
  'fahmi.soudani@vilavi.tn': {
    allowedModules: ['pOverview', 'pFrigos'],
    allowedTeamEmails: [
      'ahmed.trabelsi@vilavi.tn',
      'fahmi.soudani@vilavi.tn',
      'seif.ayari@vilavi.tn',
      'wajdi.kalaii@vilavi.tn'
    ]
  },
  'tarak.boukottaya@vilavi.tn': {
    allowedModules: ['pOverview', 'pFrigos'],
    allowedTeamEmails: [
      'omar.hrichi@vilavi.tn',
      'tarak.boukottaya@vilavi.tn',
      'wajih.arwa@vilavi.tn'
    ]
  },
  'sami.ez@vilavi.tn': {
    allowedModules: ['pOverview', 'pFrigos'],
    allowedTeamEmails: [
      'ahmed.amara@vilavi.tn',
      'hamza.miled@vilavi.tn',
      'maher.ayeb@vilavi.tn',
      'omar.hrichi@vilavi.tn',
      'sami.ez@vilavi.tn'
    ]
  },
  'debeghi.lotfi@vilavi.tn': {
    allowedModules: ['pOverview', 'pFrigos'],
    allowedTeamEmails: [
      'debeghi.lotfi@vilavi.tn',
      'maher.benmansour@vilavi.tn',
      'mohamed.rebah@vilavi.tn'
    ]
  },
  'abdelmajid.chouchene@vilavi.tn': {
    allowedModules: ['pOverview', 'pFrigos'],
    allowedTeamEmails: [
      'abdelmajid.chouchene@vilavi.tn',
      'anis.kouki@vilavi.tn',
      'aymen.amdouni@vilavi.tn',
      'wajih.arwa@vilavi.tn',
      'omar.hrichi@vilavi.tn'
    ]
  }
};

export interface ManagerUser {
  email: string;
  nom: string;
  role: string;
}

export const DEFAULT_MANAGERS: ManagerUser[] = [
  { email: 'yosra.dallegi@vilavi.tn', nom: 'Yosra Dallegi', role: 'Direction Commerciale' },
  { email: 'yosra.dallgi@vilavi.tn', nom: 'Yosra Dallegi', role: 'Direction Commerciale' },
  { email: 'oubaiedallah.woissoissi@vilavi.tn', nom: 'Oubaiedallah Woissoissi', role: 'Manager Commercial' },
  { email: 'rafik.khefifi@vilavi.tn', nom: 'Rafik Khefifi', role: 'Manager Opérations' }
];

/**
 * Vérifie si une adresse email est formellement autorisée à accéder à l'application
 */
export function isUserAuthorized(email: string, managersList?: ManagerUser[]): boolean {
  if (!email) return false;
  const em = email.trim().toLowerCase();
  if (em === 'manager') return true;
  const managers = (managersList || DEFAULT_MANAGERS).map((m) => m.email.toLowerCase());
  if (managers.includes(em)) return true;
  if (CDZ_LIST.some((c) => c.email.toLowerCase() === em)) return true;
  if (ALL_COLLABORATORS.some((c) => c.email.toLowerCase() === em)) return true;
  // Tout utilisateur arrivant avec un email valide est autorisé (pour les liens magiques AppSheet)
  return em.includes('@');
}

/**
 * Retourne le profil CDZ correspondant si l'email est un Chef de Zone
 */
export function getCdzProfile(accessMode: string): CdzProfile | null {
  if (!accessMode || accessMode === 'MANAGER') return null;
  const em = accessMode.trim().toLowerCase();
  return CDZ_LIST.find((c) => c.email.toLowerCase() === em) || null;
}

/**
 * Retourne la liste des emails de l'équipe autorisée selon le mode d'accès et les permissions actives
 */
export function getAuthorizedTeamEmails(
  accessMode: string,
  customPermissions?: Record<string, CdzPermissions>,
  managerEmails?: string[]
): string[] | null {
  if (!accessMode || accessMode === 'MANAGER') return null;
  const email = accessMode.toLowerCase();

  const effectiveManagers = (managerEmails || DEFAULT_MANAGERS.map((m) => m.email)).map((e) => e.toLowerCase());
  if (effectiveManagers.includes(email)) {
    return null; // Accès total Managers
  }

  if (customPermissions && customPermissions[email]) {
    return customPermissions[email].allowedTeamEmails;
  }

  if (DEFAULT_CDZ_PERMISSIONS[email]) {
    return DEFAULT_CDZ_PERMISSIONS[email].allowedTeamEmails;
  }

  const cdz = CDZ_LIST.find((c) => c.email.toLowerCase() === email);
  return cdz ? cdz.teamEmails : [email];
}

/**
 * Vérifie si un module est autorisé pour un profil donné
 */
export function isModuleAllowed(
  moduleKey: ModuleKey,
  accessMode: string,
  customPermissions?: Record<string, CdzPermissions>,
  managerEmails?: string[]
): boolean {
  if (!accessMode || accessMode === 'MANAGER') return true;
  const email = accessMode.toLowerCase();

  // Admin exclusif
  if (email === 'yosra.dallegi@vilavi.tn' || email === 'yosra.dallgi@vilavi.tn') return true;

  // 1. Permissions personnalisées explicites
  const userPerm = customPermissions?.[email];
  if (userPerm?.allowedModules && Array.isArray(userPerm.allowedModules)) {
    return userPerm.allowedModules.includes(moduleKey);
  }

  // 2. Managers par défaut
  const effectiveManagers = (managerEmails || DEFAULT_MANAGERS.map((m) => m.email)).map((e) => e.toLowerCase());
  if (effectiveManagers.includes(email) && (!userPerm || userPerm.isGlobalManager !== false)) {
    return true;
  }

  // 3. Permissions CDZ par défaut
  const perms = DEFAULT_CDZ_PERMISSIONS[email];
  if (!perms) return true;
  return perms.allowedModules.includes(moduleKey);
}

/**
 * Vérifie si un visiteur / commercial est visible selon le mode d'accès
 */
export function isVisitorVisible(
  visitorEmail: string,
  accessMode: string,
  customPermissions?: Record<string, CdzPermissions>,
  managerEmails?: string[]
): boolean {
  if (!accessMode || accessMode === 'MANAGER') return true;
  const authorized = getAuthorizedTeamEmails(accessMode, customPermissions, managerEmails);
  if (!authorized) return true;
  return authorized.map((e) => e.toLowerCase()).includes(visitorEmail.trim().toLowerCase());
}

/**
 * Filtre de sécurité universel : vérifie si un enregistrement appartient au périmètre autorisé
 * Fonctionne pour les CDZ, Superviseurs, Managers et NOUVEAUX utilisateurs créés.
 */
export function isRecordAuthorizedForCdz(
  record: {
    chefZone?: string;
    superviseur?: string;
    repr?: string;
    realisePar?: string;
    demandeur?: string;
    visiteurEmail?: string;
    visiteurNom?: string;
    codeClient?: string;
  },
  accessMode: string,
  customPermissions?: Record<string, CdzPermissions>,
  managerEmails?: string[]
): boolean {
  if (!accessMode || accessMode === 'MANAGER') return true;
  const em = accessMode.trim().toLowerCase();

  // 1. Admin : visibilité totale à 360°
  if (em === 'yosra.dallegi@vilavi.tn' || em === 'yosra.dallgi@vilavi.tn') return true;

  // 2. Vérifier si l'utilisateur a des permissions explicites avec accès 360°
  const userPerm = customPermissions?.[em];
  if (userPerm?.isGlobalManager === true) {
    return true;
  }

  // 3. Si c'est un manager standard sans restriction explicite
  const effectiveManagers = (managerEmails || DEFAULT_MANAGERS.map((m) => m.email)).map((e) => e.toLowerCase());
  if (effectiveManagers.includes(em) && (!userPerm || userPerm.isGlobalManager !== false)) {
    return true;
  }

  // 4. Déterminer les emails d'équipe / collaborateurs autorisés
  const allowedEmails = userPerm?.allowedTeamEmails || DEFAULT_CDZ_PERMISSIONS[em]?.allowedTeamEmails;
  const cdz = CDZ_LIST.find((c) => c.email.toLowerCase() === em);

  if (!cdz && (!allowedEmails || allowedEmails.length === 0)) {
    // Nouvel utilisateur sans configuration d'équipe -> ne voit rien d'autre que lui-même
    if (record.visiteurEmail && record.visiteurEmail.toLowerCase() === em) return true;
    if (record.realisePar && record.realisePar.toLowerCase() === em) return true;
    if (record.demandeur && record.demandeur.toLowerCase() === em) return true;
    return false;
  }

  const teamEmailsList = (allowedEmails && allowedEmails.length > 0) ? allowedEmails : (cdz ? cdz.teamEmails : [em]);
  const allowedSet = new Set(teamEmailsList.map((e) => e.toLowerCase()));

  // Construire la liste des noms et alias de collaborateurs autorisés
  const allowedNames: string[] = [];
  if (cdz) {
    allowedNames.push(cdz.name.toLowerCase());
    cdz.aliases.forEach((a) => allowedNames.push(a.toLowerCase()));
    cdz.supervisors.forEach((s) => allowedNames.push(s.toLowerCase()));
  }
  ALL_COLLABORATORS.forEach((collab) => {
    if (allowedSet.has(collab.email.toLowerCase())) {
      allowedNames.push(collab.nom.toLowerCase());
      const baseName = collab.nom.replace(/\s*\([^)]*\)/, '').trim().toLowerCase();
      if (baseName) allowedNames.push(baseName);
    }
  });

  // A. Vérification par chef de zone / colonne chef ou affectation superviseur
  if (record.chefZone) {
    const cz = record.chefZone.trim().toLowerCase();
    if (allowedNames.some((n) => cz.includes(n) || n.includes(cz))) return true;
    const match = getCdzForSupervisor(record.chefZone);
    if (match && (match.cdzEmail.toLowerCase() === em || allowedNames.some((n) => match.cdzName.toLowerCase().includes(n)))) return true;
  }

  // B. Vérification par superviseur
  if (record.superviseur) {
    const sup = record.superviseur.trim().toLowerCase();
    if (allowedNames.some((n) => sup.includes(n) || n.includes(sup))) return true;
    const match = getCdzForSupervisor(record.superviseur);
    if (match && (match.cdzEmail.toLowerCase() === em || allowedNames.some((n) => match.cdzName.toLowerCase().includes(n)))) return true;
  }

  // C. Vérification par email direct ou nom (visiteurEmail, realisePar, demandeur)
  if (record.visiteurEmail && (allowedSet.has(record.visiteurEmail.toLowerCase()) || allowedNames.some((n) => record.visiteurEmail!.toLowerCase().includes(n)))) return true;
  if (record.realisePar) {
    const rp = record.realisePar.trim().toLowerCase();
    if (allowedSet.has(rp) || allowedNames.some((n) => rp.includes(n) || n.includes(rp))) return true;
  }
  if (record.demandeur) {
    const dem = record.demandeur.trim().toLowerCase();
    if (allowedSet.has(dem) || allowedNames.some((n) => dem.includes(n) || n.includes(dem))) return true;
  }

  // D. Vérification par nom visiteur
  if (record.visiteurNom) {
    const vn = record.visiteurNom.trim().toLowerCase();
    if (allowedNames.some((n) => vn.includes(n) || n.includes(vn))) return true;
  }

  // E. Vérification par repr / commercial
  if (record.repr) {
    const rep = record.repr.trim().toLowerCase();
    if (allowedNames.some((n) => rep.includes(n) || n.includes(rep))) return true;
  }

  return false;
}
