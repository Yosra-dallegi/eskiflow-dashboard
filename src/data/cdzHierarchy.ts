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

/**
 * Retourne la liste des emails de l'équipe autorisée selon le mode d'accès
 * @param accessMode 'MANAGER' pour tout voir, ou l'email d'un CDZ
 */
export function getAuthorizedTeamEmails(accessMode: string): string[] | null {
  if (!accessMode || accessMode === 'MANAGER') return null; // Accès complet
  const cdz = CDZ_LIST.find((c) => c.email.toLowerCase() === accessMode.toLowerCase());
  return cdz ? cdz.teamEmails : [accessMode.toLowerCase()];
}

/**
 * Vérifie si un visiteur / commercial est visible selon le mode d'accès
 */
export function isVisitorVisible(visitorEmail: string, accessMode: string): boolean {
  if (!accessMode || accessMode === 'MANAGER') return true;
  const authorized = getAuthorizedTeamEmails(accessMode);
  if (!authorized) return true;
  return authorized.includes(visitorEmail.trim().toLowerCase());
}
