import { Donneur } from "../models/Donneur.js";
import { Hopital } from "../models/Hopital.js";
import { journaliser } from "../models/JournalActivite.js";
import { signToken } from "../utils/token.js";
import { trouverParEmail, emailExiste } from "../utils/account.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";
import { ROLES, STATUT_HOPITAL } from "../config/constants.js";

function tokenPour(compte, role) {
  return signToken({ id: compte._id, role });
}

/**
 * POST /api/auth/register
 * Un donneur est actif immédiatement. Un hôpital est créé « en attente » et
 * doit être validé par un administrateur.
 */
export const register = asyncHandler(async (req, res) => {
  const { role, email } = req.body;

  if (await emailExiste(email)) {
    throw new ApiError(409, "Cet email est déjà utilisé");
  }

  if (role === ROLES.HOPITAL) {
    const { nomEtablissement, motDePasse, ville, telephone, adresse } = req.body;
    const hopital = await Hopital.create({
      nomEtablissement,
      email,
      motDePasse,
      ville,
      telephone,
      adresse,
      estActif: false,
      statut: STATUT_HOPITAL.EN_ATTENTE,
    });
    await journaliser(hopital._id, ROLES.HOPITAL, "compte.cree", "hopital");
    return res.status(201).json({
      token: tokenPour(hopital, ROLES.HOPITAL),
      role: ROLES.HOPITAL,
      utilisateur: hopital.toSafeJSON(),
    });
  }

  // Donneur par défaut
  const { nom, prenom, motDePasse } = req.body;
  const donneur = await Donneur.create({ nom, prenom, email, motDePasse });
  await journaliser(donneur._id, ROLES.DONNEUR, "compte.cree", "donneur");
  res.status(201).json({
    token: tokenPour(donneur, ROLES.DONNEUR),
    role: ROLES.DONNEUR,
    utilisateur: donneur.toSafeJSON(),
  });
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, motDePasse } = req.body;
  const found = await trouverParEmail(email);
  if (!found || !(await found.compte.verifierMotDePasse(motDePasse))) {
    throw new ApiError(401, "Email ou mot de passe incorrect");
  }
  const { compte, role } = found;

  if (role === ROLES.HOPITAL && compte.statut === STATUT_HOPITAL.REFUSE) {
    throw new ApiError(403, "Ce compte hôpital a été refusé");
  }
  if (role === ROLES.ADMIN) {
    compte.derniereConnexion = new Date();
    await compte.save();
  }
  await journaliser(compte._id, role, "compte.connexion");

  res.json({ token: tokenPour(compte, role), role, utilisateur: compte.toSafeJSON() });
});

/** GET /api/auth/me */
export const me = asyncHandler(async (req, res) => {
  res.json({ role: req.role, utilisateur: req.compte.toSafeJSON() });
});
