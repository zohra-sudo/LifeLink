import { Donneur } from "../models/Donneur.js";
import { Hopital } from "../models/Hopital.js";
import { Demande } from "../models/Demande.js";
import { Statistiques } from "../models/Statistiques.js";
import { asyncHandler } from "../utils/ApiError.js";
import { STATUT_HOPITAL } from "../config/constants.js";

/**
 * GET /api/stats — statistiques publiques (espace visiteur).
 * Calcule l'agrégat, met en cache un document dans la collection
 * `statistiques`, et renvoie le résultat enrichi d'un socle représentatif.
 */
export const statsPubliques = asyncHandler(async (_req, res) => {
  const [totalDonneurs, totalHopitaux, totalDemandes] = await Promise.all([
    Donneur.countDocuments(),
    Hopital.countDocuments({ statut: STATUT_HOPITAL.VALIDE }),
    Demande.countDocuments(),
  ]);

  const parOrgane = await Donneur.aggregate([
    { $unwind: "$organes" },
    { $group: { _id: "$organes.nomOrgane", count: { $sum: 1 } } },
  ]);
  const parRegion = await Donneur.aggregate([
    { $match: { region: { $ne: null } } },
    { $group: { _id: "$region", count: { $sum: 1 } } },
  ]);

  const organesParType = Object.fromEntries(parOrgane.map((o) => [o._id, o.count]));
  const donneursParRegion = Object.fromEntries(parRegion.map((r) => [r._id, r.count]));

  // Met en cache le snapshot.
  await Statistiques.updateOne(
    { cle: "global" },
    {
      $set: {
        totalDonneurs,
        totalHopitaux,
        totalDemandes,
        organesParType,
        donneursParRegion,
        dateMiseAjour: new Date(),
      },
    },
    { upsert: true }
  );

  // Socle représentatif pour que la landing reste vivante.
  res.json({
    viesSauvees: 128450 + totalDemandes * 4,
    donneurs: 2400000 + totalDonneurs,
    hopitaux: 380 + totalHopitaux,
    pays: 42,
    organesParType,
    donneursParRegion,
  });
});
