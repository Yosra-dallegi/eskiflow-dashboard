import { CdzBudget } from '../types/task';

export const CDZ_LIST: CdzBudget[] = [
  {
    cdzEmail: 'abdelmajid.chouchene@vilavi.tn',
    nom: 'Abdelmajid Chouchene',
    aliases: ['CHOUCHENE ABDELMAJID', 'ABDELMAJID CHOUCHENE', 'CHOUCHENE'],
    zone: 'KEF - SILIANA - KASSERINE - SIDI BOUZID - GAFSA',
    budgetHabillageHt: 15000,
    budgetCadeauTtc: 20000
  },
  {
    cdzEmail: 'debeghi.lotfi@vilavi.tn',
    nom: 'Lotfi Debeghi',
    aliases: ['DABEGHI LOTFI', 'LOTFI DABEGHI', 'DEBEGHI LOTFI', 'LOTFI DEBEGHI'],
    zone: 'GABÈS - KÉBILI - TATAOUINE - MÉDENINE',
    budgetHabillageHt: 35000,
    budgetCadeauTtc: 40000
  },
  {
    cdzEmail: 'sami.ez@vilavi.tn',
    nom: 'Sami Ezzar',
    aliases: ['SAMI EZZAR', 'EZZAR SAMI', 'SAMI EZ'],
    zone: 'SAHEL',
    budgetHabillageHt: 50000,
    budgetCadeauTtc: 60000
  },
  {
    cdzEmail: 'tarak.boukottaya@vilavi.tn',
    nom: 'Tarak Boukottaya',
    aliases: ['BOUKOTTAYA TARAK', 'TARAK BOUKOTTAYA', 'BOUKOTTAYA'],
    zone: 'SFAX',
    budgetHabillageHt: 20000,
    budgetCadeauTtc: 25000
  },
  {
    cdzEmail: 'fahmi.soudani@vilavi.tn',
    nom: 'Fahmi Soudani',
    aliases: ['SOUDANI FAHMI', 'FAHMI SOUDANI', 'SOUDANI'],
    zone: 'CAP BON',
    budgetHabillageHt: 30000,
    budgetCadeauTtc: 40000
  },
  {
    cdzEmail: 'mohamed.jouini@vilavi.tn',
    nom: 'Mohamed Jouini',
    aliases: ['JOUINI MOHAMED', 'MOHAMED JOUINI', 'JOUINI'],
    zone: 'Jendouba - Béja - Tunis - Ben Arous',
    budgetHabillageHt: 40000,
    budgetCadeauTtc: 60000
  },
  {
    cdzEmail: 'mourad.hasnaoui@vilavi.tn',
    nom: 'Mourad Hasnaoui',
    aliases: ['MOURAD HASNAOUI', 'HASNAOUI MOURAD', 'HASNAOUI'],
    zone: 'Bizerte - Ariana - Manouba',
    budgetHabillageHt: 40000,
    budgetCadeauTtc: 55000
  }
];

export function findCdzBudget(chefName?: string): CdzBudget | undefined {
  if (!chefName) return undefined;
  const normChef = chefName.trim().toUpperCase();
  return CDZ_LIST.find((c) =>
    c.nom.toUpperCase() === normChef ||
    c.aliases.some((a) => normChef.includes(a.toUpperCase()) || a.toUpperCase().includes(normChef))
  );
}

export function getCdzByZoneOrEmail(str?: string): CdzBudget | undefined {
  if (!str) return undefined;
  const s = str.trim().toLowerCase();
  return CDZ_LIST.find((c) =>
    c.cdzEmail.toLowerCase() === s ||
    c.nom.toLowerCase() === s ||
    c.aliases.some((a) => a.toLowerCase() === s) ||
    c.zone.toLowerCase().includes(s) ||
    s.includes(c.zone.toLowerCase())
  );
}
