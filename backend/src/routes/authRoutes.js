import { Router } from "express";
import { body } from "express-validator";
import { register, login, me } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { ROLES } from "../config/constants.js";

const router = Router();

router.post(
  "/register",
  authLimiter,
  [
    body("email").isEmail().withMessage("Email valide requis"),
    body("motDePasse").isLength({ min: 8 }).withMessage("Mot de passe : 8 caractères minimum"),
    body("role").optional().isIn([ROLES.DONNEUR, ROLES.HOPITAL]).withMessage("Rôle invalide"),
    body("nom").if(body("role").not().equals(ROLES.HOPITAL)).trim().notEmpty().withMessage("Nom requis"),
    body("prenom").if(body("role").not().equals(ROLES.HOPITAL)).trim().notEmpty().withMessage("Prénom requis"),
    body("nomEtablissement").if(body("role").equals(ROLES.HOPITAL)).trim().notEmpty().withMessage("Nom de l'établissement requis"),
  ],
  validate,
  register
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("Email valide requis"),
    body("motDePasse").notEmpty().withMessage("Mot de passe requis"),
  ],
  validate,
  login
);

router.get("/me", protect, me);

export default router;
