import { journaliser, JournalActivite } from "../models/JournalActivite.js";
import { asyncHandler } from "../utils/ApiError.js";
import { genererCarte } from "../utils/carte.js";
import { ROLES, STATUT_CONSENTEMENT } from "../config/constants.js";

/** GET /api/donneur/profil */
export const getProfil = asyncHandler(async (req, res) => {
  res.json({ profil: req.compte.toSafeJSON() });
});

/** PUT /api/donneur/profil — informations personnelles + médicales. */
export const updateProfil = asyncHandler(async (req, res) => {
  const champs = [
    "nom",
    "prenom",
    "dateNaissance",
    "cin",
    "telephone",
    "adresse",
    "groupeSanguin",
    "region",
    "infosMedicales",
  ];
  const modifies = [];
  for (const c of champs) {
    if (req.body[c] !== undefined) {
      req.compte[c] = req.body[c];
      modifies.push(c);
    }
  }
  await req.compte.save();
  await journaliser(req.compte._id, ROLES.DONNEUR, "profil.maj", modifies.join(", "));
  res.json({ profil: req.compte.toSafeJSON() });
});

/**
 * PUT /api/donneur/consentement
 * body: { declare: boolean, organes: [nomOrgane], remarque }
 * Déclare/révoque le consentement, met à jour les organes autorisés et
 * (re)génère la carte numérique.
 */
export const declarerConsentement = asyncHandler(async (req, res) => {
  const { declare, organes, remarque } = req.body;
  const d = req.compte;
  const maintenant = new Date();

  if (Array.isArray(organes)) {
    d.organes = organes.map((nom) => ({ nomOrgane: nom, estAutorise: true }));
  }

  if (declare) {
    d.consentement = {
      statut: STATUT_CONSENTEMENT.DECLARE,
      dateDeclaration: d.consentement?.dateDeclaration || maintenant,
      dateModification: maintenant,
      remarque: remarque ?? d.consentement?.remarque ?? "",
    };
    d.statutDonneur = true;
    await genererCarte(d); // génère la carte une fois le consentement déclaré
  } else {
    d.consentement = {
      ...d.consentement?.toObject?.() ?? d.consentement,
      statut: STATUT_CONSENTEMENT.REVOQUE,
      dateModification: maintenant,
      remarque: remarque ?? d.consentement?.remarque ?? "",
    };
    d.statutDonneur = false;
  }

  await d.save();
  await journaliser(
    d._id,
    ROLES.DONNEUR,
    declare ? "consentement.declare" : "consentement.revoque",
    `organes: ${(d.organes || []).map((o) => o.nomOrgane).join(", ") || "aucun"}`
  );
  res.json({ profil: d.toSafeJSON() });
});

/** GET /api/donneur/carte — carte numérique (génère si absente). */
export const getCarte = asyncHandler(async (req, res) => {
  const d = req.compte;
  if (!d.carteNumerique?.codeQR) {
    await genererCarte(d);
    await d.save();
  }
  res.json({
    carte: {
      nomComplet: `${d.prenom} ${d.nom}`,
      identifiantUnique: d.carteNumerique.identifiantUnique,
      groupeSanguin: d.groupeSanguin || "—",
      organes: (d.organes || []).map((o) => o.nomOrgane),
      statut: d.consentement?.statut || STATUT_CONSENTEMENT.AUCUN,
      codeQR: d.carteNumerique.codeQR,
      dateGeneration: d.carteNumerique.dateGeneration,
    },
  });
});

/** GET /api/donneur/historique */
export const getHistorique = asyncHandler(async (req, res) => {
  const items = await JournalActivite.find({ utilisateurId: req.compte._id })
    .sort({ dateAction: -1 })
    .limit(50)
    .lean();
  res.json({ historique: items });
});
