import { Donneur } from "../models/Donneur.js";
import { Hopital } from "../models/Hopital.js";
import { Demande } from "../models/Demande.js";
import { JournalActivite, journaliser } from "../models/JournalActivite.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";
import { ROLES, STATUT_HOPITAL } from "../config/constants.js";

/** GET /api/admin/hopitaux?statut=enattente */
export const listHopitaux = asyncHandler(async (req, res) => {
  const filtre = {};
  if (req.query.statut) filtre.statut = req.query.statut;
  const hopitaux = await Hopital.find(filtre)
    .select("nomEtablissement email ville telephone statut estActif dateValidation dateCreation")
    .sort({ dateCreation: -1 })
    .lean();
  res.json({ count: hopitaux.length, hopitaux });
});

async function definirStatutHopital(id, statut, estActif) {
  const h = await Hopital.findById(id);
  if (!h) throw new ApiError(404, "Hôpital introuvable");
  h.statut = statut;
  h.estActif = estActif;
  if (estActif) h.dateValidation = new Date();
  await h.save();
  return h;
}

/** PATCH /api/admin/hopitaux/:id/valider */
export const validerHopital = asyncHandler(async (req, res) => {
  const h = await definirStatutHopital(req.params.id, STATUT_HOPITAL.VALIDE, true);
  await journaliser(h._id, ROLES.HOPITAL, "hopital.valide", "par administrateur");
  res.json({ hopital: h.toSafeJSON() });
});

/** PATCH /api/admin/hopitaux/:id/refuser */
export const refuserHopital = asyncHandler(async (req, res) => {
  const h = await definirStatutHopital(req.params.id, STATUT_HOPITAL.REFUSE, false);
  await journaliser(h._id, ROLES.HOPITAL, "hopital.refuse", "par administrateur");
  res.json({ hopital: h.toSafeJSON() });
});

/** GET /api/admin/stats */
export const statsAdmin = asyncHandler(async (_req, res) => {
  const [donneurs, hopitauxValides, hopitauxEnAttente, demandes] =
    await Promise.all([
      Donneur.countDocuments(),
      Hopital.countDocuments({ statut: STATUT_HOPITAL.VALIDE }),
      Hopital.countDocuments({ statut: STATUT_HOPITAL.EN_ATTENTE }),
      Demande.countDocuments(),
    ]);
  const candAgg = await Demande.aggregate([
    { $project: { n: { $size: "$candidatures" } } },
    { $group: { _id: null, total: { $sum: "$n" } } },
  ]);
  res.json({
    donneurs,
    hopitauxValides,
    hopitauxEnAttente,
    demandes,
    candidatures: candAgg[0]?.total || 0,
  });
});

/** GET /api/admin/journaux — journal d'activité global. */
export const listJournaux = asyncHandler(async (_req, res) => {
  const journaux = await JournalActivite.find()
    .sort({ dateAction: -1 })
    .limit(80)
    .lean();
  res.json({ count: journaux.length, journaux });
});
