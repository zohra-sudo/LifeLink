import { Router } from "express";
import { param } from "express-validator";
import {
  listHopitaux,
  validerHopital,
  refuserHopital,
  statsAdmin,
  listJournaux,
} from "../controllers/adminController.js";
import { listDemandesHopital } from "../controllers/demandeController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { ROLES } from "../config/constants.js";

const router = Router();
router.use(protect, authorize(ROLES.ADMIN));

router.get("/hopitaux", listHopitaux);
router.patch(
  "/hopitaux/:id/valider",
  [param("id").isMongoId()],
  validate,
  validerHopital
);
router.patch(
  "/hopitaux/:id/refuser",
  [param("id").isMongoId()],
  validate,
  refuserHopital
);
router.get("/stats", statsAdmin);
router.get("/journaux", listJournaux);
router.get("/demandes", listDemandesHopital); // admin voit toutes les demandes

export default router;
