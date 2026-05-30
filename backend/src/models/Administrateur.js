import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * Administrateur — hérite conceptuellement de « Utilisateur ».
 * Compte unique semé (pas d'inscription publique).
 */
const administrateurSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    motDePasse: { type: String, required: true, minlength: 8, select: false },
    niveauAcces: { type: String, default: "super" },
    derniereConnexion: { type: Date },
    dateCreation: { type: Date, default: Date.now },
  },
  { collection: "administrateurs" }
);

administrateurSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("motDePasse")) return next();
  const salt = await bcrypt.genSalt(12);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
  next();
});

administrateurSchema.methods.verifierMotDePasse = function verifierMotDePasse(
  plain
) {
  return bcrypt.compare(plain, this.motDePasse);
};

administrateurSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.motDePasse;
  obj.role = "admin";
  return obj;
};

export const Administrateur = mongoose.model(
  "Administrateur",
  administrateurSchema
);
