import mongoose from "mongoose";
import {
  ORGANES,
  GROUPES_SANGUINS,
  URGENCE,
  STATUT_DEMANDE,
  STATUT_CANDIDATURE,
} from "../config/constants.js";

/**
 * Demande — un hôpital demande un organe pour un patient. Les donneurs peuvent
 * « postuler » : leurs candidatures sont embarquées dans la demande.
 * Surfacée dans les espaces hôpital, admin, donneur et visiteur.
 */
const candidatureSchema = new mongoose.Schema(
  {
    donneur: { type: mongoose.Schema.Types.ObjectId, ref: "Donneur", required: true },
    nomDonneur: { type: String },
    groupeSanguin: { type: String },
    compatibilite: { type: Number, default: 0 },
    message: { type: String, trim: true, maxlength: 500 },
    statut: {
      type: String,
      enum: Object.values(STATUT_CANDIDATURE),
      default: STATUT_CANDIDATURE.EN_ATTENTE,
    },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const demandeSchema = new mongoose.Schema(
  {
    hopital: { type: mongoose.Schema.Types.ObjectId, ref: "Hopital", required: true, index: true },
    nomEtablissement: { type: String },
    ville: { type: String },
    organe: { type: String, enum: ORGANES, required: true },
    groupeSanguinReceveur: { type: String, enum: GROUPES_SANGUINS, required: true },
    referencePatient: { type: String, required: true, trim: true },
    urgence: { type: String, enum: URGENCE, default: "moyenne" },
    statut: {
      type: String,
      enum: Object.values(STATUT_DEMANDE),
      default: STATUT_DEMANDE.OUVERTE,
      index: true,
    },
    notes: { type: String, trim: true, maxlength: 500 },
    candidatures: { type: [candidatureSchema], default: [] },
    dateCreation: { type: Date, default: Date.now },
  },
  { collection: "demandes" }
);

export const Demande = mongoose.model("Demande", demandeSchema);
