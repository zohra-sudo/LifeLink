import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { STATUT_HOPITAL } from "../config/constants.js";

/**
 * Hopital — hérite conceptuellement de « Utilisateur ».
 * Compte créé via inscription, en attente de validation par un administrateur
 * (estActif = true une fois validé).
 */
const hopitalSchema = new mongoose.Schema(
  {
    nomEtablissement: { type: String, required: true, trim: true },
    adresse: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    motDePasse: { type: String, required: true, minlength: 8, select: false },
    ville: { type: String, trim: true },
    telephone: { type: String, trim: true },
    estActif: { type: Boolean, default: false },
    statut: {
      type: String,
      enum: Object.values(STATUT_HOPITAL),
      default: STATUT_HOPITAL.EN_ATTENTE,
    },
    dateValidation: { type: Date },
    creeParAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "Administrateur" },
    dateCreation: { type: Date, default: Date.now },
  },
  { collection: "hopitaux" }
);

hopitalSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("motDePasse")) return next();
  const salt = await bcrypt.genSalt(12);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
  next();
});

hopitalSchema.methods.verifierMotDePasse = function verifierMotDePasse(plain) {
  return bcrypt.compare(plain, this.motDePasse);
};

hopitalSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.motDePasse;
  obj.role = "hopital";
  return obj;
};

export const Hopital = mongoose.model("Hopital", hopitalSchema);
