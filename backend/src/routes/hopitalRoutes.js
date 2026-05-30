import { Router } from "express";
import { body } from "express-validator";
import {
  rechercherDonneurs,
  verifierDonneur,
  statsHopital,
} from "../controllers/hopitalController.js";
import {
  creerDemande,
  listDemandesHopital,
  traiterCandidature,
} from "../controllers/demandeController.js";
import { protect, authorize, requireHopitalValide } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  ROLES,
  ORGANES,
  GROUPES_SANGUINS,
  URGENCE,
  STATUT_CANDIDATURE,
} from "../config/constants.js";

const router = Router();
router.use(protect, authorize(ROLES.HOPITAL, ROLES.ADMIN), requireHopitalValide);

router.get("/donneurs", rechercherDonneurs);
router.get("/verifier/:identifiant", verifierDonneur);
router.get("/stats", statsHopital);

// Demandes
router.post(
  "/demandes",
  [
    body("organe").isIn(ORGANES).withMessage("Organe invalide"),
    body("groupeSanguinReceveur").isIn(GROUPES_SANGUINS).withMessage("Groupe sanguin invalide"),
    body("referencePatient").trim().notEmpty().withMessage("Référence patient requise"),
    body("urgence").optional().isIn(URGENCE),
  ],
  validate,
  creerDemande
);
router.get("/demandes", listDemandesHopital);
router.patch(
  "/demandes/:id/candidatures/:candId",
  [body("statut").isIn(Object.values(STATUT_CANDIDATURE))],
  validate,
  traiterCandidature
);

export default router;
