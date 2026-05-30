import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { startTestDB, stopTestDB, clearDB } from "./setup.js";
import { createApp } from "../src/app.js";

const app = createApp();
before(startTestDB);
after(stopTestDB);
beforeEach(clearDB);

const donneur = {
  nom: "Test",
  prenom: "Donneur",
  email: "donneur@test.com",
  motDePasse: "supersecret",
};

test("inscription d'un donneur (actif) + jeton", async () => {
  const res = await request(app).post("/api/auth/register").send(donneur);
  assert.equal(res.status, 201);
  assert.ok(res.body.token);
  assert.equal(res.body.role, "donneur");
  assert.equal(res.body.utilisateur.motDePasse, undefined);
});

test("email en double refusé", async () => {
  await request(app).post("/api/auth/register").send(donneur);
  const res = await request(app).post("/api/auth/register").send(donneur);
  assert.equal(res.status, 409);
});

test("mot de passe faible refusé", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ ...donneur, motDePasse: "123" });
  assert.equal(res.status, 400);
});

test("connexion correcte / incorrecte", async () => {
  await request(app).post("/api/auth/register").send(donneur);
  const ok = await request(app)
    .post("/api/auth/login")
    .send({ email: donneur.email, motDePasse: donneur.motDePasse });
  assert.equal(ok.status, 200);
  const bad = await request(app)
    .post("/api/auth/login")
    .send({ email: donneur.email, motDePasse: "faux" });
  assert.equal(bad.status, 401);
});

test("hôpital inscrit est en attente de validation", async () => {
  const res = await request(app).post("/api/auth/register").send({
    nomEtablissement: "CHU Test",
    email: "hopital@test.com",
    motDePasse: "supersecret",
    role: "hopital",
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.role, "hopital");
  assert.equal(res.body.utilisateur.statut, "enattente");
  assert.equal(res.body.utilisateur.estActif, false);
});

test("/me exige un jeton valide", async () => {
  const reg = await request(app).post("/api/auth/register").send(donneur);
  const noTok = await request(app).get("/api/auth/me");
  assert.equal(noTok.status, 401);
  const withTok = await request(app)
    .get("/api/auth/me")
    .set("Authorization", `Bearer ${reg.body.token}`);
  assert.equal(withTok.status, 200);
  assert.equal(withTok.body.utilisateur.email, donneur.email);
});
