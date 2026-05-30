import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  GROUPES_SANGUINS,
  ORGANES,
  STATUT_CONSENTEMENT,
} from "../config/constants.js";

/**
 * Donneur — hérite conceptuellement de « Utilisateur ».
 * Sous-documents embarqués (selon le schéma) : consentement, organes[],
 * carteNumerique. Le mot de passe est haché et jamais sélectionné par défaut.
 */

const consentementSchema = new mongoose.Schema(
  {
    statut: {
      type: String,
      enum: Object.values(STATUT_CONSENTEMENT),
      default: STATUT_CONSENTEMENT.AUCUN,
    },
    dateDeclaration: { type: Date },
    dateModification: { type: Date },
    remarque: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const organeAutoriseSchema = new mongoose.Schema(
  {
    nomOrgane: { type: String, enum: ORGANES, required: true },
    estAutorise: { type: Boolean, default: true },
  },
  { _id: false }
);

const carteNumeriqueSchema = new mongoose.Schema(
  {
    codeQR: { type: String },
    identifiantUnique: { type: String },
    dateGeneration: { type: Date },
  },
  { _id: false }
);

const donneurSchema = new mongoose.Schema(
  {
    // ----- Hérité de Utilisateur -----
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    motDePasse: { type: String, required: true, minlength: 8, select: false },
    dateCreation: { type: Date, default: Date.now },

    // ----- Propre au Donneur -----
    dateNaissance: { type: Date },
    cin: { type: String, trim: true },
    telephone: { type: String, trim: true },
    adresse: { type: String, trim: true },
    groupeSanguin: { type: String, enum: GROUPES_SANGUINS },
    statutDonneur: { type: Boolean, default: false },
    infosMedicales: { type: String, trim: true, maxlength: 1000 },
    region: { type: String, trim: true },

    // ----- Sous-documents embarqués -----
    consentement: { type: consentementSchema, default: () => ({}) },
    organes: { type: [organeAutoriseSchema], default: [] },
    carteNumerique: { type: carteNumeriqueSchema, default: () => ({}) },
  },
  { collection: "donneurs" }
);

donneurSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("motDePasse")) return next();
  const salt = await bcrypt.genSalt(12);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
  next();
});

donneurSchema.methods.verifierMotDePasse = function verifierMotDePasse(plain) {
  return bcrypt.compare(plain, this.motDePasse);
};

donneurSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.motDePasse;
  obj.role = "donneur";
  return obj;
};

export const Donneur = mongoose.model("Donneur", donneurSchema);
