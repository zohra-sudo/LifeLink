// Constantes du domaine — partagées par les modèles, validateurs et contrôleurs.

export const ROLES = Object.freeze({
  ADMIN: "admin",
  DONNEUR: "donneur",
  HOPITAL: "hopital",
});

// Statut de validation d'un compte hôpital (workflow d'approbation admin).
export const STATUT_HOPITAL = Object.freeze({
  EN_ATTENTE: "enattente",
  VALIDE: "valide",
  REFUSE: "refuse",
});

// Statut du consentement d'un donneur.
export const STATUT_CONSENTEMENT = Object.freeze({
  AUCUN: "aucun",
  DECLARE: "declare",
  REVOQUE: "revoque",
});

// Statut d'une demande d'organe émise par un hôpital.
export const STATUT_DEMANDE = Object.freeze({
  OUVERTE: "ouverte",
  EN_COURS: "encours",
  SATISFAITE: "satisfaite",
  ANNULEE: "annulee",
});

export const URGENCE = Object.freeze(["faible", "moyenne", "elevee", "critique"]);

// Statut d'une candidature (un donneur postule à une demande).
export const STATUT_CANDIDATURE = Object.freeze({
  EN_ATTENTE: "enattente",
  ACCEPTEE: "acceptee",
  REFUSEE: "refusee",
});

export const GROUPES_SANGUINS = Object.freeze([
  "O+",
  "O-",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
]);

export const ORGANES = Object.freeze([
  "Coeur",
  "Poumons",
  "Foie",
  "Reins",
  "Pancreas",
  "Intestin",
  "Cornees",
  "Tissus",
]);
