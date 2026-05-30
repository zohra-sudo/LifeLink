import { Demande } from "../models/Demande.js";
import { journaliser } from "../models/JournalActivite.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";
import { compatibilityScore } from "../utils/matching.js";
import {
  ROLES,
  STATUT_DEMANDE,
  STATUT_CANDIDATURE,
} from "../config/constants.js";

/* ---------------- Hôpital ---------------- */

/** POST /api/demandes — un hôpital crée une demande d'organe. */
export const creerDemande = asyncHandler(async (req, res) => {
  const { organe, groupeSanguinReceveur, referencePatient, urgence, notes } =
    req.body;
  const h = req.compte;
  const demande = await Demande.create({
    hopital: h._id,
    nomEtablissement: h.nomEtablissement,
    ville: h.ville,
    organe,
    groupeSanguinReceveur,
    referencePatient,
    urgence,
    notes,
  });
  await journaliser(
    h._id,
    ROLES.HOPITAL,
    "demande.creee",
    `${organe} · ${groupeSanguinReceveur}`
  );
  res.status(201).json({ demande });
});

/** GET /api/demandes/hopital — demandes de l'hôpital (admin : toutes). */
export const listDemandesHopital = asyncHandler(async (req, res) => {
  const filtre = req.role === ROLES.ADMIN ? {} : { hopital: req.compte._id };
  const demandes = await Demande.find(filtre)
    .sort({ dateCreation: -1 })
    .limit(100)
    .lean();
  res.json({
    count: demandes.length,
    demandes: demandes.map((d) => ({
      ...d,
      nbCandidatures: d.candidatures?.length || 0,
    })),
  });
});

/** PATCH /api/demandes/:id/candidatures/:candId — accepter/refuser une candidature. */
export const traiterCandidature = asyncHandler(async (req, res) => {
  const { statut } = req.body; // acceptee | refusee
  const demande = await Demande.findById(req.params.id);
  if (!demande) throw new ApiError(404, "Demande introuvable");
  if (
    req.role !== ROLES.ADMIN &&
    demande.hopital.toString() !== req.compte._id.toString()
  ) {
    throw new ApiError(403, "Ce n'est pas votre demande");
  }
  const cand = demande.candidatures.id(req.params.candId);
  if (!cand) throw new ApiError(404, "Candidature introuvable");
  cand.statut = statut;
  if (statut === STATUT_CANDIDATURE.ACCEPTEE) demande.statut = STATUT_DEMANDE.SATISFAITE;
  await demande.save();
  res.json({ demande });
});

/* ---------------- Donneur ---------------- */

/** GET /api/demandes/ouvertes — demandes ouvertes visibles par un donneur. */
export const listDemandesOuvertes = asyncHandler(async (req, res) => {
  const demandes = await Demande.find({ statut: STATUT_DEMANDE.OUVERTE })
    .sort({ dateCreation: -1 })
    .limit(50)
    .lean();

  const monId = req.compte._id.toString();
  const monGroupe = req.compte.groupeSanguin;
  res.json({
    count: demandes.length,
    demandes: demandes.map((d) => ({
      _id: d._id,
      organe: d.organe,
      groupeSanguinReceveur: d.groupeSanguinReceveur,
      urgence: d.urgence,
      ville: d.ville,
      nomEtablissement: d.nomEtablissement,
      dateCreation: d.dateCreation,
      compatibilite: monGroupe
        ? compatibilityScore(monGroupe, d.groupeSanguinReceveur)
        : null,
      dejaPostule: (d.candidatures || []).some(
        (c) => c.donneur?.toString() === monId
      ),
    })),
  });
});

/** POST /api/demandes/:id/postuler — un donneur postule pour donner. */
export const postuler = asyncHandler(async (req, res) => {
  const d = req.compte;
  const demande = await Demande.findById(req.params.id);
  if (!demande) throw new ApiError(404, "Demande introuvable");
  if (
    demande.statut === STATUT_DEMANDE.SATISFAITE ||
    demande.statut === STATUT_DEMANDE.ANNULEE
  ) {
    throw new ApiError(400, "Cette demande n'accepte plus de candidatures");
  }
  if (demande.candidatures.some((c) => c.donneur.toString() === d._id.toString())) {
    throw new ApiError(409, "Vous avez déjà postulé à cette demande");
  }
  const compatibilite = d.groupeSanguin
    ? compatibilityScore(d.groupeSanguin, demande.groupeSanguinReceveur)
    : 0;

  demande.candidatures.push({
    donneur: d._id,
    nomDonneur: `${d.prenom} ${d.nom}`,
    groupeSanguin: d.groupeSanguin,
    compatibilite,
    message: (req.body.message || "").slice(0, 500),
  });
  await demande.save();
  await journaliser(d._id, ROLES.DONNEUR, "demande.candidature", demande.organe);
  res.status(201).json({ ok: true, compatibilite });
});

/** GET /api/demandes/mes-candidatures — demandes où le donneur a postulé. */
export const mesCandidatures = asyncHandler(async (req, res) => {
  const id = req.compte._id;
  const demandes = await Demande.find({ "candidatures.donneur": id })
    .sort({ dateCreation: -1 })
    .lean();
  res.json({
    count: demandes.length,
    candidatures: demandes.map((d) => {
      const c = d.candidatures.find((x) => x.donneur.toString() === id.toString());
      return {
        demandeId: d._id,
        organe: d.organe,
        nomEtablissement: d.nomEtablissement,
        ville: d.ville,
        urgence: d.urgence,
        statutDemande: d.statut,
        compatibilite: c?.compatibilite ?? 0,
        statutCandidature: c?.statut,
        date: c?.date,
      };
    }),
  });
});

/* ---------------- Public (visiteur) ---------------- */

/** GET /api/demandes/publiques — aperçu anonymisé pour la landing. */
export const demandesPubliques = asyncHandler(async (_req, res) => {
  const demandes = await Demande.find({ statut: STATUT_DEMANDE.OUVERTE })
    .sort({ urgence: -1, dateCreation: -1 })
    .limit(8)
    .lean();
  res.json({
    count: demandes.length,
    demandes: demandes.map((d) => ({
      _id: d._id,
      organe: d.organe,
      groupeSanguinReceveur: d.groupeSanguinReceveur,
      urgence: d.urgence,
      ville: d.ville,
    })),
  });
});
