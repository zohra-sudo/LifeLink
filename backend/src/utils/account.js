import { Donneur } from "../models/Donneur.js";
import { Hopital } from "../models/Hopital.js";
import { Administrateur } from "../models/Administrateur.js";
import { ROLES } from "../config/constants.js";

/** Renvoie le modèle Mongoose correspondant à un rôle. */
export function modelePourRole(role) {
  if (role === ROLES.ADMIN) return Administrateur;
  if (role === ROLES.HOPITAL) return Hopital;
  if (role === ROLES.DONNEUR) return Donneur;
  return null;
}

/**
 * Recherche un compte par email dans les trois collections.
 * Renvoie { compte, role } ou null. Inclut le mot de passe (pour le login).
 */
export async function trouverParEmail(email) {
  const e = email.toLowerCase();
  const donneur = await Donneur.findOne({ email: e }).select("+motDePasse");
  if (donneur) return { compte: donneur, role: ROLES.DONNEUR };
  const hopital = await Hopital.findOne({ email: e }).select("+motDePasse");
  if (hopital) return { compte: hopital, role: ROLES.HOPITAL };
  const admin = await Administrateur.findOne({ email: e }).select("+motDePasse");
  if (admin) return { compte: admin, role: ROLES.ADMIN };
  return null;
}

/** Récupère un compte par rôle + id (sans le mot de passe). */
export async function trouverParId(role, id) {
  const Model = modelePourRole(role);
  if (!Model) return null;
  return Model.findById(id);
}

/** Vrai si l'email est déjà pris dans l'une des collections. */
export async function emailExiste(email) {
  return (await trouverParEmail(email)) !== null;
}
