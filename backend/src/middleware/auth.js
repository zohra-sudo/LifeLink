import { verifyToken } from "../utils/token.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";
import { trouverParId } from "../utils/account.js";
import { ROLES } from "../config/constants.js";

/**
 * Exige un JWT valide. Résout le compte dans la bonne collection selon le rôle
 * encodé dans le token et l'attache à req.compte / req.role.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentification requise");
  }
  let decoded;
  try {
    decoded = verifyToken(header.slice(7));
  } catch {
    throw new ApiError(401, "Jeton invalide ou expiré");
  }
  const compte = await trouverParId(decoded.role, decoded.id);
  if (!compte) throw new ApiError(401, "Le compte n'existe plus");
  req.compte = compte;
  req.role = decoded.role;
  next();
});

/** Restreint une route à un ou plusieurs rôles. */
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.role || !roles.includes(req.role)) {
      throw new ApiError(403, "Accès non autorisé à cette ressource");
    }
    next();
  };

/** Hôpitaux : admin passe toujours ; un hôpital doit être validé (actif). */
export const requireHopitalValide = (req, _res, next) => {
  if (req.role === ROLES.ADMIN) return next();
  if (req.role === ROLES.HOPITAL && req.compte.estActif) return next();
  throw new ApiError(403, "Compte hôpital non encore validé par un administrateur");
};
