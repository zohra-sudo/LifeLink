import { Router } from "express";
import { statsPubliques } from "../controllers/statsController.js";
import { demandesPubliques } from "../controllers/demandeController.js";

const router = Router();

// Espace visiteur — données publiques.
router.get("/", statsPubliques);
router.get("/demandes", demandesPubliques);

export default router;
