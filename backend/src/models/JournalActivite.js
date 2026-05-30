import mongoose from "mongoose";

/**
 * JournalActivite — traçabilité de chaque action (consentement, connexion,
 * validation hôpital…). utilisateurId référence l'id du compte concerné.
 */
const journalActiviteSchema = new mongoose.Schema(
  {
    utilisateurId: { type: mongoose.Schema.Types.ObjectId, index: true },
    role: { type: String }, // donneur | hopital | admin
    action: { type: String, required: true },
    details: { type: String, default: "" },
    dateAction: { type: Date, default: Date.now },
  },
  { collection: "journaux_activite" }
);

export const JournalActivite = mongoose.model(
  "JournalActivite",
  journalActiviteSchema
);

/** Enregistre une action sans bloquer le flux principal. */
export async function journaliser(utilisateurId, role, action, details = "") {
  try {
    await JournalActivite.create({ utilisateurId, role, action, details });
  } catch {
    /* non bloquant */
  }
}
