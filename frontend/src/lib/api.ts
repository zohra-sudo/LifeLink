/**
 * Client API typé pour le backend LifeLink (Express + MongoDB).
 * En dev, /api est proxifié vers http://localhost:4000 (vite.config.ts).
 * Le JWT est lu depuis localStorage et envoyé en Bearer.
 */
const BASE = "/api";
const TOKEN_KEY = "lifelink_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || `Erreur (${res.status})`);
  return data as T;
}

export type Role = "admin" | "donneur" | "hopital";

export interface Consentement {
  statut: "aucun" | "declare" | "revoque";
  dateDeclaration?: string;
  dateModification?: string;
  remarque?: string;
}
export interface OrganeAutorise {
  nomOrgane: string;
  estAutorise: boolean;
}
export interface CarteNumerique {
  codeQR?: string;
  identifiantUnique?: string;
  dateGeneration?: string;
}

export interface Utilisateur {
  _id: string;
  email: string;
  role: Role;
  // Donneur
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  cin?: string;
  telephone?: string;
  adresse?: string;
  groupeSanguin?: string;
  statutDonneur?: boolean;
  infosMedicales?: string;
  region?: string;
  consentement?: Consentement;
  organes?: OrganeAutorise[];
  carteNumerique?: CarteNumerique;
  // Hopital
  nomEtablissement?: string;
  ville?: string;
  estActif?: boolean;
  statut?: "enattente" | "valide" | "refuse";
  dateValidation?: string;
}

export interface AuthResponse {
  token: string;
  role: Role;
  utilisateur: Utilisateur;
}

export interface CarteData {
  nomComplet: string;
  identifiantUnique: string;
  groupeSanguin: string;
  organes: string[];
  statut: string;
  codeQR: string;
  dateGeneration?: string;
}

export interface JournalItem {
  _id: string;
  action: string;
  details: string;
  dateAction: string;
}

export interface DonneurResultat {
  _id: string;
  nomComplet: string;
  groupeSanguin: string;
  region: string;
  organes: string[];
  identifiantCarte: string | null;
  statutConsentement: string;
  telephone: string;
}

export interface Candidature {
  _id: string;
  nomDonneur: string;
  groupeSanguin?: string;
  compatibilite: number;
  message?: string;
  statut: string;
  date: string;
}
export interface Demande {
  _id: string;
  organe: string;
  groupeSanguinReceveur: string;
  referencePatient?: string;
  urgence: string;
  statut: string;
  ville?: string;
  nomEtablissement?: string;
  notes?: string;
  candidatures?: Candidature[];
  nbCandidatures?: number;
  dateCreation: string;
}
export interface DemandeOuverte {
  _id: string;
  organe: string;
  groupeSanguinReceveur: string;
  urgence: string;
  ville?: string;
  nomEtablissement?: string;
  dateCreation: string;
  compatibilite: number | null;
  dejaPostule: boolean;
}
export interface MaCandidature {
  demandeId: string;
  organe: string;
  nomEtablissement?: string;
  ville?: string;
  urgence: string;
  statutDemande: string;
  compatibilite: number;
  statutCandidature: string;
  date: string;
}
export interface HopitalAdmin {
  _id: string;
  nomEtablissement: string;
  email: string;
  ville?: string;
  telephone?: string;
  statut: "enattente" | "valide" | "refuse";
  estActif: boolean;
  dateValidation?: string;
  dateCreation: string;
}

export const api = {
  // auth
  register: (body: Record<string, unknown>) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (email: string, motDePasse: string) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, motDePasse }) }),
  me: () => request<{ role: Role; utilisateur: Utilisateur }>("/auth/me"),

  // donneur
  getProfil: () => request<{ profil: Utilisateur }>("/donneur/profil"),
  updateProfil: (body: Partial<Utilisateur>) =>
    request<{ profil: Utilisateur }>("/donneur/profil", { method: "PUT", body: JSON.stringify(body) }),
  declarerConsentement: (declare: boolean, organes: string[], remarque?: string) =>
    request<{ profil: Utilisateur }>("/donneur/consentement", {
      method: "PUT",
      body: JSON.stringify({ declare, organes, remarque }),
    }),
  getCarte: () => request<{ carte: CarteData }>("/donneur/carte"),
  getHistorique: () => request<{ historique: JournalItem[] }>("/donneur/historique"),
  getDemandesOuvertes: () => request<{ count: number; demandes: DemandeOuverte[] }>("/donneur/demandes"),
  postuler: (id: string, message?: string) =>
    request<{ ok: boolean; compatibilite: number }>(`/donneur/demandes/${id}/postuler`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  mesCandidatures: () => request<{ count: number; candidatures: MaCandidature[] }>("/donneur/mes-candidatures"),

  // hopital
  rechercherDonneurs: (p: { groupeSanguin?: string; organe?: string; region?: string }) => {
    const q = new URLSearchParams(Object.entries(p).filter(([, v]) => v) as [string, string][]).toString();
    return request<{ count: number; donneurs: DonneurResultat[] }>(`/hopital/donneurs${q ? `?${q}` : ""}`);
  },
  statsHopital: () =>
    request<{
      total: number;
      consentants: number;
      parOrgane: { _id: string; count: number }[];
      parGroupe: { _id: string; count: number }[];
    }>("/hopital/stats"),
  creerDemande: (body: Record<string, unknown>) =>
    request<{ demande: Demande }>("/hopital/demandes", { method: "POST", body: JSON.stringify(body) }),
  listDemandesHopital: () => request<{ count: number; demandes: Demande[] }>("/hopital/demandes"),
  traiterCandidature: (demandeId: string, candId: string, statut: string) =>
    request<{ demande: Demande }>(`/hopital/demandes/${demandeId}/candidatures/${candId}`, {
      method: "PATCH",
      body: JSON.stringify({ statut }),
    }),

  // admin
  listHopitaux: (statut?: string) =>
    request<{ count: number; hopitaux: HopitalAdmin[] }>(`/admin/hopitaux${statut ? `?statut=${statut}` : ""}`),
  validerHopital: (id: string) => request<{ hopital: Utilisateur }>(`/admin/hopitaux/${id}/valider`, { method: "PATCH" }),
  refuserHopital: (id: string) => request<{ hopital: Utilisateur }>(`/admin/hopitaux/${id}/refuser`, { method: "PATCH" }),
  statsAdmin: () =>
    request<{
      donneurs: number;
      hopitauxValides: number;
      hopitauxEnAttente: number;
      demandes: number;
      candidatures: number;
    }>("/admin/stats"),
  listJournaux: () => request<{ count: number; journaux: (JournalItem & { role: string })[] }>("/admin/journaux"),
  listDemandesAdmin: () => request<{ count: number; demandes: Demande[] }>("/admin/demandes"),

  // public
  statsPubliques: () =>
    request<{
      viesSauvees: number;
      donneurs: number;
      hopitaux: number;
      pays: number;
      organesParType: Record<string, number>;
      donneursParRegion: Record<string, number>;
    }>("/stats"),
  demandesPubliques: () =>
    request<{ count: number; demandes: { _id: string; organe: string; groupeSanguinReceveur: string; urgence: string; ville?: string }[] }>(
      "/stats/demandes"
    ),
};
