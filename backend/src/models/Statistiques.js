import mongoose from "mongoose";

/**
 * StatistiquesGlobales — instantané agrégé recalculé et mis en cache.
 * Maps stockées en objets clé→valeur.
 */
const statistiquesSchema = new mongoose.Schema(
  {
    cle: { type: String, default: "global", unique: true },
    totalDonneurs: { type: Number, default: 0 },
    totalHopitaux: { type: Number, default: 0 },
    totalDemandes: { type: Number, default: 0 },
    organesParType: { type: Map, of: Number, default: {} },
    donneursParRegion: { type: Map, of: Number, default: {} },
    dateMiseAjour: { type: Date, default: Date.now },
  },
  { collection: "statistiques" }
);

export const Statistiques = mongoose.model("Statistiques", statistiquesSchema);
