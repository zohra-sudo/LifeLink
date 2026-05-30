import { Donneur } from "../models/Donneur.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";
import { STATUT_CONSENTEMENT } from "../config/constants.js";

const PROJECTION =
  "nom prenom groupeSanguin region organes consentement carteNumerique telephone updatedAt";

function donneurPublic(d) {
  return {
    _id: d._id,
    nomComplet: `${d.prenom} ${d.nom}`,
    groupeSanguin: d.groupeSanguin || "—",
    region: d.region || "—",
    organes: (d.organes || []).map((o) => o.nomOrgane),
    identifiantCarte: d.carteNumerique?.identifiantUnique || null,
    statutConsentement: d.consentement?.statut || STATUT_CONSENTEMENT.AUCUN,
    telephone: d.telephone || "—",
  };
}

/** GET /api/hopital/donneurs — recherche de donneurs consentants. */
export const rechercherDonneurs = asyncHandler(async (req, res) => {
  const { groupeSanguin, organe, region } = req.query;
  const filtre = { "consentement.statut": STATUT_CONSENTEMENT.DECLARE };
  if (groupeSanguin) filtre.groupeSanguin = groupeSanguin;
  if (organe) filtre["organes.nomOrgane"] = organe;
  if (region) filtre.region = new RegExp(`^${escapeRegex(region)}`, "i");

  const donneurs = await Donneur.find(filtre)
    .select(PROJECTION)
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean();

  res.json({ count: donneurs.length, donneurs: donneurs.map(donneurPublic) });
});

/** GET /api/hopital/verifier/:identifiant — vérifie un consentement via la carte/QR. */
export const verifierDonneur = asyncHandler(async (req, res) => {
  const d = await Donneur.findOne({
    "carteNumerique.identifiantUnique": req.params.identifiant,
  })
    .select(PROJECTION)
    .lean();
  if (!d) throw new ApiError(404, "Aucun donneur pour cet identifiant");
  res.json({
    donneur: donneurPublic(d),
    consentementValide: d.consentement?.statut === STATUT_CONSENTEMENT.DECLARE,
  });
});

/** GET /api/hopital/stats — statistiques opérationnelles. */
export const statsHopital = asyncHandler(async (_req, res) => {
  const consentants = await Donneur.countDocuments({
    "consentement.statut": STATUT_CONSENTEMENT.DECLARE,
  });
  const total = await Donneur.countDocuments();

  const parOrgane = await Donneur.aggregate([
    { $match: { "consentement.statut": STATUT_CONSENTEMENT.DECLARE } },
    { $unwind: "$organes" },
    { $group: { _id: "$organes.nomOrgane", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const parGroupe = await Donneur.aggregate([
    {
      $match: {
        "consentement.statut": STATUT_CONSENTEMENT.DECLARE,
        groupeSanguin: { $ne: null },
      },
    },
    { $group: { _id: "$groupeSanguin", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json({ total, consentants, parOrgane, parGroupe });
});

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
