import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { startTestDB, stopTestDB, clearDB } from "./setup.js";
import { createApp } from "../src/app.js";
import { Hopital } from "../src/models/Hopital.js";
import { STATUT_HOPITAL } from "../src/config/constants.js";

const app = createApp();
before(startTestDB);
after(stopTestDB);
beforeEach(clearDB);

async function hopitalValideToken() {
  const reg = await request(app).post("/api/auth/register").send({
    nomEtablissement: "CHU",
    email: "h@test.com",
    motDePasse: "supersecret",
    role: "hopital",
    ville: "Rabat",
  });
  await Hopital.updateOne(
    { _id: reg.body.utilisateur._id },
    { estActif: true, statut: STATUT_HOPITAL.VALIDE }
  );
  const r = await request(app)
    .post("/api/auth/login")
    .send({ email: "h@test.com", motDePasse: "supersecret" });
  return r.body.token;
}

async function donneurConsentant(groupe) {
  const reg = await request(app).post("/api/auth/register").send({
    nom: "D",
    prenom: "Test",
    email: `d${Math.random().toString(36).slice(2)}@test.com`,
    motDePasse: "supersecret",
  });
  const tok = reg.body.token;
  await request(app)
    .put("/api/donneur/profil")
    .set("Authorization", `Bearer ${tok}`)
    .send({ groupeSanguin: groupe });
  await request(app)
    .put("/api/donneur/consentement")
    .set("Authorization", `Bearer ${tok}`)
    .send({ declare: true, organes: ["Coeur"] });
  return tok;
}

test("hôpital crée une demande puis un donneur postule (compatibilité calculée)", async () => {
  const hTok = await hopitalValideToken();
  const dTok = await donneurConsentant("O-"); // O- compatible avec A+

  const demande = await request(app)
    .post("/api/hopital/demandes")
    .set("Authorization", `Bearer ${hTok}`)
    .send({
      organe: "Coeur",
      groupeSanguinReceveur: "A+",
      referencePatient: "PT-1",
      urgence: "elevee",
    });
  assert.equal(demande.status, 201);
  const demandeId = demande.body.demande._id;

  // le donneur voit la demande ouverte
  const ouvertes = await request(app)
    .get("/api/donneur/demandes")
    .set("Authorization", `Bearer ${dTok}`);
  assert.equal(ouvertes.body.count, 1);
  assert.ok(ouvertes.body.demandes[0].compatibilite > 0);

  // il postule
  const post = await request(app)
    .post(`/api/donneur/demandes/${demandeId}/postuler`)
    .set("Authorization", `Bearer ${dTok}`)
    .send({ message: "Je souhaite aider." });
  assert.equal(post.status, 201);

  // l'hôpital voit la candidature
  const list = await request(app)
    .get("/api/hopital/demandes")
    .set("Authorization", `Bearer ${hTok}`);
  assert.equal(list.body.demandes[0].nbCandidatures, 1);
});

test("double candidature refusée", async () => {
  const hTok = await hopitalValideToken();
  const dTok = await donneurConsentant("O+");
  const demande = await request(app)
    .post("/api/hopital/demandes")
    .set("Authorization", `Bearer ${hTok}`)
    .send({ organe: "Coeur", groupeSanguinReceveur: "O+", referencePatient: "PT-2" });
  const id = demande.body.demande._id;
  await request(app)
    .post(`/api/donneur/demandes/${id}/postuler`)
    .set("Authorization", `Bearer ${dTok}`)
    .send({});
  const second = await request(app)
    .post(`/api/donneur/demandes/${id}/postuler`)
    .set("Authorization", `Bearer ${dTok}`)
    .send({});
  assert.equal(second.status, 409);
});

test("demandes publiques visibles sans authentification", async () => {
  const hTok = await hopitalValideToken();
  await request(app)
    .post("/api/hopital/demandes")
    .set("Authorization", `Bearer ${hTok}`)
    .send({ organe: "Reins", groupeSanguinReceveur: "B+", referencePatient: "PT-3" });
  const pub = await request(app).get("/api/stats/demandes");
  assert.equal(pub.status, 200);
  assert.equal(pub.body.count, 1);
  assert.equal(pub.body.demandes[0].referencePatient, undefined); // anonymisé
});
