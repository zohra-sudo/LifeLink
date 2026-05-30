import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { startTestDB, stopTestDB, clearDB } from "./setup.js";
import { createApp } from "../src/app.js";
import { Administrateur } from "../src/models/Administrateur.js";
import { Hopital } from "../src/models/Hopital.js";

const app = createApp();
before(startTestDB);
after(stopTestDB);
beforeEach(clearDB);

async function adminToken() {
  await Administrateur.create({
    nom: "Admin",
    prenom: "Test",
    email: "admin@test.com",
    motDePasse: "supersecret",
  });
  const r = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.com", motDePasse: "supersecret" });
  return r.body.token;
}

async function donneurToken(extra = {}) {
  const r = await request(app).post("/api/auth/register").send({
    nom: "D",
    prenom: "Test",
    email: `d${Math.random().toString(36).slice(2)}@test.com`,
    motDePasse: "supersecret",
  });
  const tok = r.body.token;
  if (Object.keys(extra).length) {
    await request(app)
      .put("/api/donneur/profil")
      .set("Authorization", `Bearer ${tok}`)
      .send(extra);
  }
  return tok;
}

test("déclaration de consentement + génération de carte (QR)", async () => {
  const tok = await donneurToken({ groupeSanguin: "O-", region: "Rabat" });
  const res = await request(app)
    .put("/api/donneur/consentement")
    .set("Authorization", `Bearer ${tok}`)
    .send({ declare: true, organes: ["Coeur", "Foie"] });
  assert.equal(res.status, 200);
  assert.equal(res.body.profil.consentement.statut, "declare");
  assert.equal(res.body.profil.statutDonneur, true);

  const carte = await request(app)
    .get("/api/donneur/carte")
    .set("Authorization", `Bearer ${tok}`);
  assert.match(carte.body.carte.codeQR, /^data:image\/png;base64,/);
  assert.ok(carte.body.carte.identifiantUnique.startsWith("LL-"));
});

test("historique tracé dans journaux_activite", async () => {
  const tok = await donneurToken();
  await request(app)
    .put("/api/donneur/consentement")
    .set("Authorization", `Bearer ${tok}`)
    .send({ declare: true, organes: ["Reins"] });
  const h = await request(app)
    .get("/api/donneur/historique")
    .set("Authorization", `Bearer ${tok}`);
  assert.ok(h.body.historique.length >= 2);
});

test("hôpital en attente bloqué, validé puis recherche un donneur consentant", async () => {
  // donneur consentant O-
  const dTok = await donneurToken({ groupeSanguin: "O-", region: "Rabat" });
  await request(app)
    .put("/api/donneur/consentement")
    .set("Authorization", `Bearer ${dTok}`)
    .send({ declare: true, organes: ["Foie"] });

  // hôpital inscrit (en attente)
  const reg = await request(app).post("/api/auth/register").send({
    nomEtablissement: "CHU",
    email: "h@test.com",
    motDePasse: "supersecret",
    role: "hopital",
  });
  const bloque = await request(app)
    .get("/api/hopital/donneurs")
    .set("Authorization", `Bearer ${reg.body.token}`);
  assert.equal(bloque.status, 403);

  // admin valide
  const aTok = await adminToken();
  const hop = await Hopital.findOne({ email: "h@test.com" });
  const val = await request(app)
    .patch(`/api/admin/hopitaux/${hop._id}/valider`)
    .set("Authorization", `Bearer ${aTok}`);
  assert.equal(val.status, 200);
  assert.equal(val.body.hopital.estActif, true);

  // reconnexion + recherche
  const relog = await request(app)
    .post("/api/auth/login")
    .send({ email: "h@test.com", motDePasse: "supersecret" });
  const search = await request(app)
    .get("/api/hopital/donneurs?groupeSanguin=O-")
    .set("Authorization", `Bearer ${relog.body.token}`);
  assert.equal(search.status, 200);
  assert.equal(search.body.count, 1);
});

test("un donneur ne peut pas accéder aux routes admin", async () => {
  const tok = await donneurToken();
  const res = await request(app)
    .get("/api/admin/stats")
    .set("Authorization", `Bearer ${tok}`);
  assert.equal(res.status, 403);
});
