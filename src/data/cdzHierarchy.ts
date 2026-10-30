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
  teamEmails: string[];
  members: CdzMember[];
}

export const CDZ_LIST: CdzProfile[] = [
  {
    "email": "mohamed.jouini@vilavi.tn",
    "name": "JOUINI MOHAMED",
    "teamEmails": [
      "ahmed.trabelsi@vilavi.tn",
      "aymen.amdouni@vilavi.tn",
      "chokri.zghidi@vilavi.tn",
      "dhia.manai@vilavi.tn",
      "issam.saidi@vilavi.tn",
      "mohamed.jouini@vilavi.tn",
      "sami.mezzi@vilavi.tn",
      "seif.ayari@vilavi.tn"
    ],
    "members": [
      {
        "email": "mohamed.jouini@vilavi.tn",
        "nom": "JOUINI MOHAMED",
        "role": "CDZ",
        "codePrv": ""
      },
      {
        "email": "ahmed.trabelsi@vilavi.tn",
        "nom": "AHMED TRABELSI",
        "role": "SUP",
        "codePrv": ""
      },
      {
        "email": "dhia.manai@vilavi.tn",
        "nom": "DHIA MANAI",
        "role": "PRV",
        "codePrv": "PRV03"
      },
      {
        "email": "aymen.amdouni@vilavi.tn",
        "nom": "aymen Amdouni",
        "role": "SUP",
        "codePrv": ""
      },
      {
        "email": "seif.ayari@vilavi.tn",
        "nom": "SAIF AYARI",
        "role": "SUP",
        "codePrv": ""
      },
      {
        "email": "issam.saidi@vilavi.tn",
        "nom": "ISSAM SAIDI_BIS",
        "role": "SUP",
        "codePrv": ""
      },
      {
        "email": "chokri.zghidi@vilavi.tn",
        "nom": "ZGHIDI CHOKRI",
        "role": "SUP",
        "codePrv": ""
      },
      {
        "email": "sami.mezzi@vilavi.tn",
        "nom": "SAMI MEZZI",
        "role": "SUP",
        "codePrv": ""
      }
    ]
  },
  {
    "email": "mourad.hasnaoui@vilavi.tn",
    "name": "MOURAD HASNAOUI",
    "teamEmails": [
      "chokri.zghidi@vilavi.tn",
      "issam.saidi@vilavi.tn",
      "mourad.hasnaoui@vilavi.tn",
      "sami.mezzi@vilavi.tn"
    ],
    "members": [
      {
        "email": "mourad.hasnaoui@vilavi.tn",
        "nom": "MOURAD HASNAOUI",
        "role": "CDZ",
        "codePrv": ""
      },
      {
        "email": "issam.saidi@vilavi.tn",
        "nom": "ISSAM SAIDI",
        "role": "SUP",
        "codePrv": ""
      },
      {
        "email": "chokri.zghidi@vilavi.tn",
        "nom": "ZGHIDI CHOKRI_BIS",
        "role": "SUP",
        "codePrv": ""
      },
      {
        "email": "sami.mezzi@vilavi.tn",
        "nom": "MEZZI SAMI_BIS",
        "role": "SUP",
        "codePrv": ""
      }
    ]
  },
  {
    "email": "fahmi.soudani@vilavi.tn",
    "name": "SOUDANI FAHMI",
    "teamEmails": [
      "ahmed.trabelsi@vilavi.tn",
      "fahmi.soudani@vilavi.tn",
      "seif.ayari@vilavi.tn",
      "wajdi.kalaii@vilavi.tn"
    ],
    "members": [
      {
        "email": "fahmi.soudani@vilavi.tn",
        "nom": "SOUDANI FAHMI",
        "role": "CDZ",
        "codePrv": ""
      },
      {
        "email": "seif.ayari@vilavi.tn",
        "nom": "SAIF AYARI_BIS",
        "role": "SUP",
        "codePrv": ""
      },
      {
        "email": "wajdi.kalaii@vilavi.tn",
        "nom": "WAJDI KALAII",
        "role": "SUP",
        "codePrv": ""
      },
      {
        "email": "ahmed.trabelsi@vilavi.tn",
        "nom": "AHMED TRABELSI_BIS",
        "role": "SUP",
        "codePrv": ""
      }
    ]
  },
  {
    "email": "tarak.boukottaya@vilavi.tn",
    "name": "BOUKOTTAYA TAREK",
    "teamEmails": [
      "omar.hrichi@vilavi.tn",
      "tarak.boukottaya@vilavi.tn",
      "wajih.arwa@vilavi.tn"
    ],
    "members": [
      {
        "email": "tarak.boukottaya@vilavi.tn",
        "nom": "BOUKOTTAYA TAREK",
        "role": "CDZ",
        "codePrv": ""
      },
      {
        "email": "wajih.arwa@vilavi.tn",
        "nom": "wajih Aroua",
        "role": "SUP",
        "codePrv": ""
      },
      {
        "email": "omar.hrichi@vilavi.tn",
        "nom": "HRICHI OMAR",
        "role": "SUP",
        "codePrv": ""
      }
    ]
  },
  {
    "email": "sami.ez@vilavi.tn",
    "name": "EZZAR SAMI",
    "teamEmails": [
      "ahmed.amara@vilavi.tn",
      "hamza.miled@vilavi.tn",
      "maher.ayeb@vilavi.tn",
      "sami.ez@vilavi.tn"
    ],
    "members": [
      {
        "email": "sami.ez@vilavi.tn",
        "nom": "EZZAR SAMI",
        "role": "CDZ",
        "codePrv": ""
      },
      {
        "email": "maher.ayeb@vilavi.tn",
        "nom": "Maher Ayeb",
        "role": "SUP",
        "codePrv": ""
      },
      {
        "email": "ahmed.amara@vilavi.tn",
        "nom": "AMARA MOHAMED AHMED",
        "role": "SUP",
        "codePrv": ""
      },
      {
        "email": "hamza.miled@vilavi.tn",
        "nom": "hamza Miled",
        "role": "SUP",
        "codePrv": ""
      }
    ]
  },
  {
    "email": "debeghi.lotfi@vilavi.tn",
    "name": "Dabeghi lotfi",
    "teamEmails": [
      "debeghi.lotfi@vilavi.tn",
      "maher.benmansour@vilavi.tn",
      "mohamed.rebah@vilavi.tn"
    ],
    "members": [
      {
        "email": "debeghi.lotfi@vilavi.tn",
        "nom": "Dabeghi lotfi",
        "role": "CDZ",
        "codePrv": ""
      },
      {
        "email": "mohamed.rebah@vilavi.tn",
        "nom": "Rabeh mohamed",
        "role": "SUP",
        "codePrv": ""
      },
      {
        "email": "maher.benmansour@vilavi.tn",
        "nom": "Ben Mansour Maher",
        "role": "SUP",
        "codePrv": ""
      }
    ]
  },
  {
    "email": "abdelmajid.chouchene@vilavi.tn",
    "name": "CHOUCHENE ABDELMAJID",
    "teamEmails": [
      "abdelmajid.chouchene@vilavi.tn",
      "anis.kouki@vilavi.tn",
      "aymen.amdouni@vilavi.tn",
      "wajih.arwa@vilavi.tn"
    ],
    "members": [
      {
        "email": "abdelmajid.chouchene@vilavi.tn",
        "nom": "CHOUCHENE ABDELMAJID",
        "role": "CDZ",
        "codePrv": ""
      },
      {
        "email": "anis.kouki@vilavi.tn",
        "nom": "KOUKI ANIS",
        "role": "SUP",
        "codePrv": ""
      },
      {
        "email": "aymen.amdouni@vilavi.tn",
        "nom": "AMDOUNI AYMEN_BIS",
        "role": "SUP",
        "codePrv": ""
      },
      {
        "email": "wajih.arwa@vilavi.tn",
        "nom": "HRICHI OMAR_BIS",
        "role": "SUP",
        "codePrv": ""
      }
    ]
  }
];

export const EMAIL_TO_NAME: Record<string, string> = {
  "yosra.dallegi@vilavi.tn": "Yosra Dallegi",
  "rafik.khefifi@vilavi.tn": "Rafik Khefifi",
  "oubaiedallah.woissoissi@vilavi.tn": "Oubaiedallah Woissoissi",
  "mohamed.jouini@vilavi.tn": "JOUINI MOHAMED",
  "ahmed.trabelsi@vilavi.tn": "AHMED TRABELSI_BIS",
  "dhia.manai@vilavi.tn": "DHIA MANAI",
  "aymen.amdouni@vilavi.tn": "AMDOUNI AYMEN_BIS",
  "mourad.hasnaoui@vilavi.tn": "MOURAD HASNAOUI",
  "issam.saidi@vilavi.tn": "ISSAM SAIDI_BIS",
  "chokri.zghidi@vilavi.tn": "ZGHIDI CHOKRI",
  "sami.mezzi@vilavi.tn": "SAMI MEZZI",
  "seif.ayari@vilavi.tn": "SAIF AYARI_BIS",
  "fahmi.soudani@vilavi.tn": "SOUDANI FAHMI",
  "wajdi.kalaii@vilavi.tn": "WAJDI KALAII",
  "tarak.boukottaya@vilavi.tn": "BOUKOTTAYA TAREK",
  "wajih.arwa@vilavi.tn": "HRICHI OMAR_BIS",
  "omar.hrichi@vilavi.tn": "HRICHI OMAR",
  "sami.ez@vilavi.tn": "EZZAR SAMI",
  "maher.ayeb@vilavi.tn": "Maher Ayeb",
  "ahmed.amara@vilavi.tn": "AMARA MOHAMED AHMED",
  "hamza.miled@vilavi.tn": "hamza Miled",
  "debeghi.lotfi@vilavi.tn": "Dabeghi lotfi",
  "mohamed.rebah@vilavi.tn": "Rabeh mohamed",
  "maher.benmansour@vilavi.tn": "Ben Mansour Maher",
  "abdelmajid.chouchene@vilavi.tn": "CHOUCHENE ABDELMAJID",
  "anis.kouki@vilavi.tn": "KOUKI ANIS"
};

export const VISITOR_TO_CDZ: Record<string, string> = {
  "ahmed.trabelsi@vilavi.tn": "mohamed.jouini@vilavi.tn",
  "aymen.amdouni@vilavi.tn": "mohamed.jouini@vilavi.tn",
  "chokri.zghidi@vilavi.tn": "mohamed.jouini@vilavi.tn",
  "dhia.manai@vilavi.tn": "mohamed.jouini@vilavi.tn",
  "issam.saidi@vilavi.tn": "mohamed.jouini@vilavi.tn",
  "mohamed.jouini@vilavi.tn": "mohamed.jouini@vilavi.tn",
  "sami.mezzi@vilavi.tn": "mohamed.jouini@vilavi.tn",
  "seif.ayari@vilavi.tn": "mohamed.jouini@vilavi.tn",
  "mourad.hasnaoui@vilavi.tn": "mourad.hasnaoui@vilavi.tn",
  "fahmi.soudani@vilavi.tn": "fahmi.soudani@vilavi.tn",
  "wajdi.kalaii@vilavi.tn": "fahmi.soudani@vilavi.tn",
  "omar.hrichi@vilavi.tn": "tarak.boukottaya@vilavi.tn",
  "tarak.boukottaya@vilavi.tn": "tarak.boukottaya@vilavi.tn",
  "wajih.arwa@vilavi.tn": "tarak.boukottaya@vilavi.tn",
  "ahmed.amara@vilavi.tn": "sami.ez@vilavi.tn",
  "hamza.miled@vilavi.tn": "sami.ez@vilavi.tn",
  "maher.ayeb@vilavi.tn": "sami.ez@vilavi.tn",
  "sami.ez@vilavi.tn": "sami.ez@vilavi.tn",
  "debeghi.lotfi@vilavi.tn": "debeghi.lotfi@vilavi.tn",
  "maher.benmansour@vilavi.tn": "debeghi.lotfi@vilavi.tn",
  "mohamed.rebah@vilavi.tn": "debeghi.lotfi@vilavi.tn",
  "abdelmajid.chouchene@vilavi.tn": "abdelmajid.chouchene@vilavi.tn",
  "anis.kouki@vilavi.tn": "abdelmajid.chouchene@vilavi.tn"
};

export type ModuleKey = 'pOverview' | 'pVisites' | 'pMonth' | 'pFrigos';

export interface CdzPermissions {
  allowedModules: ModuleKey[];
  allowedTeamEmails: string[];
}

export interface Collaborateur {
  email: string;
  nom: string;
  role: 'CDZ' | 'SUP' | 'PRV' | 'Direction';
}

export const ALL_COLLABORATORS: Collaborateur[] = [
  { email: 'mohamed.jouini@vilavi.tn', nom: 'JOUINI MOHAMED', role: 'CDZ' },
  { email: 'ahmed.trabelsi@vilavi.tn', nom: 'AHMED TRABELSI', role: 'SUP' },
  { email: 'aymen.amdouni@vilavi.tn', nom: 'AMDOUNI AYMEN', role: 'SUP' },
  { email: 'dhia.manai@vilavi.tn', nom: 'DHIA MANAI (PRV03)', role: 'PRV' },
  { email: 'chokri.zghidi@vilavi.tn', nom: 'ZGHIDI CHOKRI', role: 'SUP' },
  { email: 'issam.saidi@vilavi.tn', nom: 'ISSAM SAIDI', role: 'SUP' },
  { email: 'sami.mezzi@vilavi.tn', nom: 'SAMI MEZZI', role: 'SUP' },
  { email: 'seif.ayari@vilavi.tn', nom: 'SAIF AYARI', role: 'SUP' },
  { email: 'mourad.hasnaoui@vilavi.tn', nom: 'MOURAD HASNAOUI', role: 'CDZ' },
  { email: 'fahmi.soudani@vilavi.tn', nom: 'SOUDANI FAHMI', role: 'CDZ' },
  { email: 'wajdi.kalaii@vilavi.tn', nom: 'WAJDI KALAII', role: 'SUP' },
  { email: 'tarak.boukottaya@vilavi.tn', nom: 'BOUKOTTAYA TAREK', role: 'CDZ' },
  { email: 'omar.hrichi@vilavi.tn', nom: 'HRICHI OMAR', role: 'SUP' },
  { email: 'wajih.arwa@vilavi.tn', nom: 'ARWA WAJIH', role: 'SUP' },
  { email: 'sami.ez@vilavi.tn', nom: 'EZZAR SAMI', role: 'CDZ' },
  { email: 'maher.ayeb@vilavi.tn', nom: 'Maher Ayeb', role: 'SUP' },
  { email: 'ahmed.amara@vilavi.tn', nom: 'AMARA MOHAMED AHMED', role: 'SUP' },
  { email: 'hamza.miled@vilavi.tn', nom: 'hamza Miled', role: 'SUP' },
  { email: 'debeghi.lotfi@vilavi.tn', nom: 'Dabeghi lotfi', role: 'CDZ' },
  { email: 'mohamed.rebah@vilavi.tn', nom: 'Rabeh mohamed', role: 'SUP' },
  { email: 'maher.benmansour@vilavi.tn', nom: 'Ben Mansour Maher (PRV13)', role: 'PRV' },
  { email: 'abdelmajid.chouchene@vilavi.tn', nom: 'CHOUCHENE ABDELMAJID', role: 'CDZ' },
  { email: 'anis.kouki@vilavi.tn', nom: 'KOUKI ANIS', role: 'SUP' },
  { email: 'yosra.dallegi@vilavi.tn', nom: 'Yosra Dallegi', role: 'Direction' },
  { email: 'rafik.khefifi@vilavi.tn', nom: 'Rafik Khefifi', role: 'SUP' },
  { email: 'oubaiedallah.woissoissi@vilavi.tn', nom: 'Oubaiedallah Woissoissi', role: 'SUP' }
];

export const ALL_MODULES: { key: ModuleKey; label: string; desc: string }[] = [
  { key: 'pOverview', label: "Vue d'ensemble (Tâches)", desc: "Tâches commerciales, réconciliation clients et KPIs" },
  { key: 'pVisites', label: "Visites Clients (Terrain & GPS)", desc: "Pointages géolocalisés, respect Sur site vs Hors zone" },
  { key: 'pMonth', label: "Ventes Sell-Out (Réalisation)", desc: "Facturations et chiffre d'affaires mensuel 2026" },
  { key: 'pFrigos', label: "Parc Frigos (FREEZER_LISTING)", desc: "Scoring risque, carte et conformité des congélateurs" }
];

export const DEFAULT_CDZ_PERMISSIONS: Record<string, CdzPermissions> = {
  "mohamed.jouini@vilavi.tn": {
    allowedModules: ['pOverview', 'pVisites', 'pMonth', 'pFrigos'],
    allowedTeamEmails: [
      "ahmed.trabelsi@vilavi.tn",
      "aymen.amdouni@vilavi.tn",
      "chokri.zghidi@vilavi.tn",
      "dhia.manai@vilavi.tn",
      "issam.saidi@vilavi.tn",
      "mohamed.jouini@vilavi.tn",
      "sami.mezzi@vilavi.tn",
      "seif.ayari@vilavi.tn"
    ]
  },
  "mourad.hasnaoui@vilavi.tn": {
    allowedModules: ['pOverview', 'pVisites', 'pMonth', 'pFrigos'],
    allowedTeamEmails: [
      "chokri.zghidi@vilavi.tn",
      "issam.saidi@vilavi.tn",
      "mourad.hasnaoui@vilavi.tn",
      "sami.mezzi@vilavi.tn"
    ]
  },
  "fahmi.soudani@vilavi.tn": {
    allowedModules: ['pOverview', 'pVisites', 'pMonth', 'pFrigos'],
    allowedTeamEmails: [
      "ahmed.trabelsi@vilavi.tn",
      "fahmi.soudani@vilavi.tn",
      "seif.ayari@vilavi.tn",
      "wajdi.kalaii@vilavi.tn"
    ]
  },
  "tarak.boukottaya@vilavi.tn": {
    allowedModules: ['pOverview', 'pVisites', 'pMonth', 'pFrigos'],
    allowedTeamEmails: [
      "omar.hrichi@vilavi.tn",
      "tarak.boukottaya@vilavi.tn",
      "wajih.arwa@vilavi.tn"
    ]
  },
  "sami.ez@vilavi.tn": {
    allowedModules: ['pOverview', 'pVisites', 'pMonth', 'pFrigos'],
    allowedTeamEmails: [
      "ahmed.amara@vilavi.tn",
      "hamza.miled@vilavi.tn",
      "maher.ayeb@vilavi.tn",
      "sami.ez@vilavi.tn"
    ]
  },
  "debeghi.lotfi@vilavi.tn": {
    allowedModules: ['pOverview', 'pVisites', 'pMonth', 'pFrigos'],
    allowedTeamEmails: [
      "debeghi.lotfi@vilavi.tn",
      "maher.benmansour@vilavi.tn",
      "mohamed.rebah@vilavi.tn"
    ]
  },
  "abdelmajid.chouchene@vilavi.tn": {
    allowedModules: ['pOverview', 'pVisites', 'pMonth', 'pFrigos'],
    allowedTeamEmails: [
      "abdelmajid.chouchene@vilavi.tn",
      "anis.kouki@vilavi.tn",
      "aymen.amdouni@vilavi.tn",
      "wajih.arwa@vilavi.tn"
    ]
  }
};

/**
 * Retourne la liste des emails de l'équipe autorisée selon le mode d'accès et les permissions actives
 */
export function getAuthorizedTeamEmails(
  accessMode: string,
  customPermissions?: Record<string, CdzPermissions>
): string[] | null {
  if (!accessMode || accessMode === 'MANAGER') return null;
  const email = accessMode.toLowerCase();
  
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
 * Vérifie si un module est autorisé pour un CDZ donné
 */
export function isModuleAllowed(
  moduleKey: ModuleKey,
  accessMode: string,
  customPermissions?: Record<string, CdzPermissions>
): boolean {
  if (!accessMode || accessMode === 'MANAGER') return true;
  const email = accessMode.toLowerCase();
  const perms = (customPermissions && customPermissions[email]) || DEFAULT_CDZ_PERMISSIONS[email];
  if (!perms) return true;
  return perms.allowedModules.includes(moduleKey);
}

/**
 * Vérifie si un visiteur / commercial est visible selon le mode d'accès
 */
export function isVisitorVisible(
  visitorEmail: string, 
  accessMode: string,
  customPermissions?: Record<string, CdzPermissions>
): boolean {
  if (!accessMode || accessMode === 'MANAGER') return true;
  const authorized = getAuthorizedTeamEmails(accessMode, customPermissions);
  if (!authorized) return true;
  return authorized.map((e) => e.toLowerCase()).includes(visitorEmail.trim().toLowerCase());
}
