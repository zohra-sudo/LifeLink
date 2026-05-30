import { Router } from "express";
import { body } from "express-validator";
import {
  getProfil,
  updateProfil,
  declarerConsentement,
  getCarte,
  getHistorique,
} from "../controllers/donneurController.js";
import {
  listDemandesOuvertes,
  postuler,
  mesCandidatures,
} from "../controllers/demandeController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { ROLES, GROUPES_SANGUINS, ORGANES } from "../config/constants.js";

const router = Router();
router.use(protect, authorize(ROLES.DONNEUR));

router.get("/profil", getProfil);
router.put(
  "/profil",
  [body("groupeSanguin").optional().isIn(GROUPES_SANGUINS).withMessage("Groupe sanguin invalide")],
  validate,
  updateProfil
);
router.put(
  "/consentement",
  [
    body("declare").isBoolean().withMessage("declare doit être un booléen"),
    body("organes").optional().isArray(),
    body("organes.*").optional().isIn(ORGANES).withMessage("Organe inconnu"),
  ],
  validate,
  declarerConsentement
);
router.get("/carte", getCarte);
router.get("/historique", getHistorique);

// Demandes ouvertes + candidatures (postuler)
router.get("/demandes", listDemandesOuvertes);
router.post("/demandes/:id/postuler", postuler);
router.get("/mes-candidatures", mesCandidatures);

export default router;
