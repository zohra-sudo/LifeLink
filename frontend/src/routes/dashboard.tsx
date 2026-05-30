import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Heart,
  ShieldCheck,
  Clock,
  Check,
  HeartHandshake,
  Send,
} from "lucide-react";
import { DonorCard } from "../components/DonorCard";
import { RequireAuth } from "../components/RequireAuth";
import { reveal, cn } from "../lib/utils";
import { useAuth } from "../lib/auth";
import {
  api,
  type Utilisateur,
  type CarteData,
  type JournalItem,
  type DemandeOuverte,
  type MaCandidature,
} from "../lib/api";
import { GROUPES_SANGUINS, ORGANES_ICONS } from "../lib/domain";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Espace Donneur — LifeLink" },
      { name: "description", content: "Gérez votre consentement, votre carte de donneur et vos candidatures." },
    ],
  }),
  component: () => (
    <RequireAuth roles={["donneur"]}>
      <Dashboard />
    </RequireAuth>
  ),
});

function Dashboard() {
  const { refresh } = useAuth();
  const [profil, setProfil] = useState<Utilisateur | null>(null);
  const [carte, setCarte] = useState<CarteData | null>(null);
  const [historique, setHistorique] = useState<JournalItem[]>([]);
  const [besoins, setBesoins] = useState<DemandeOuverte[]>([]);
  const [candidatures, setCandidatures] = useState<MaCandidature[]>([]);
  const [selection, setSelection] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    const [p, c, h, b, mc] = await Promise.all([
      api.getProfil(),
      api.getCarte().catch(() => null),
      api.getHistorique().catch(() => ({ historique: [] })),
      api.getDemandesOuvertes().catch(() => ({ count: 0, demandes: [] })),
      api.mesCandidatures().catch(() => ({ count: 0, candidatures: [] })),
    ]);
    setProfil(p.profil);
    setSelection((p.profil.organes || []).map((o) => o.nomOrgane));
    if (c) setCarte(c.carte);
    setHistorique(h.historique);
    setBesoins(b.demandes);
    setCandidatures(mc.candidatures);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!profil) {
    return (
      <main className="grid min-h-screen place-items-center">
        <p className="font-mono text-sm text-muted-foreground">Chargement…</p>
      </main>
    );
  }

  const declare = profil.consentement?.statut === "declare";

  const toggleOrgane = (n: string) =>
    setSelection((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));

  const enregistrerConsentement = async (declarer: boolean) => {
    setBusy(true);
    try {
      const r = await api.declarerConsentement(declarer, selection);
      setProfil(r.profil);
      const c = await api.getCarte();
      setCarte(c.carte);
      const h = await api.getHistorique();
      setHistorique(h.historique);
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setBusy(false);
    }
  };

  const sauverProfil = async (champs: Partial<Utilisateur>) => {
    const r = await api.updateProfil(champs);
    setProfil(r.profil);
  };

  const postuler = async (id: string) => {
    await api.postuler(id).catch(() => {});
    const [b, mc] = await Promise.all([api.getDemandesOuvertes(), api.mesCandidatures()]);
    setBesoins(b.demandes);
    setCandidatures(mc.candidatures);
  };

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-32">
      <motion.div {...reveal} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-glow">Espace Donneur</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
            Bonjour, <span className="gradient-text">{profil.prenom}</span>
          </h1>
          {carte?.identifiantUnique && (
            <p className="mt-2 font-mono text-sm text-muted-foreground">ID {carte.identifiantUnique}</p>
          )}
        </div>
        <div className={cn("glass flex items-center gap-2 rounded-full px-4 py-2 font-mono text-xs", declare ? "text-emerald-life" : "text-muted-foreground")}>
          <span className={cn("h-2 w-2 rounded-full", declare ? "bg-emerald-life" : "bg-muted-foreground")} style={declare ? { animation: "var(--animate-pulse-glow)" } : undefined} />
          {declare ? "CONSENTEMENT DÉCLARÉ" : "AUCUN CONSENTEMENT"}
        </div>
      </motion.div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Consentement + organes */}
          <motion.section {...reveal} className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Mon consentement</h2>
              {saved && (
                <span className="flex items-center gap-1 font-mono text-xs text-emerald-life"><Check className="h-3 w-3" /> Enregistré</span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Sélectionnez les organes que vous acceptez de donner après votre décès, puis déclarez votre consentement. Révocable à tout moment.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ORGANES_ICONS.map((o) => {
                const active = selection.includes(o.name);
                return (
                  <button key={o.name} onClick={() => toggleOrgane(o.name)} className={cn("group relative overflow-hidden rounded-xl border p-4 text-left transition-all", active ? "border-emerald-life/30 glass shadow-glow" : "border-border opacity-55")}>
                    <div className="flex items-center justify-between">
                      <o.icon className={cn("h-5 w-5", active ? "text-foreground" : "text-muted-foreground")} />
                      {active && <span className="h-2.5 w-2.5 rounded-full bg-emerald-life" style={{ animation: "var(--animate-pulse-glow)" }} />}
                    </div>
                    <p className="mt-3 text-sm font-medium">{o.label}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => enregistrerConsentement(true)} disabled={busy || selection.length === 0} className="flex items-center gap-2 rounded-full bg-gradient-glow px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-neon disabled:opacity-50">
                <HeartHandshake className="h-4 w-4" /> {declare ? "Mettre à jour" : "Déclarer mon consentement"}
              </button>
              {declare && (
                <button onClick={() => enregistrerConsentement(false)} disabled={busy} className="rounded-full glass px-6 py-2.5 text-sm font-semibold text-organic-red disabled:opacity-50">
                  Révoquer
                </button>
              )}
            </div>
          </motion.section>

          {/* Profil */}
          <motion.section {...reveal} className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold">Informations</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SelectField label="Groupe sanguin" value={profil.groupeSanguin || ""} options={GROUPES_SANGUINS} onChange={(v) => sauverProfil({ groupeSanguin: v })} />
              <TextField label="Région" value={profil.region || ""} placeholder="ex. Rabat" onSave={(v) => sauverProfil({ region: v })} />
              <TextField label="Téléphone" value={profil.telephone || ""} placeholder="+212…" onSave={(v) => sauverProfil({ telephone: v })} />
              <TextField label="CIN" value={profil.cin || ""} placeholder="Carte d'identité" onSave={(v) => sauverProfil({ cin: v })} />
              <TextField label="Adresse" value={profil.adresse || ""} placeholder="Adresse" onSave={(v) => sauverProfil({ adresse: v })} />
              <TextField label="Infos médicales" value={profil.infosMedicales || ""} placeholder="Antécédents…" onSave={(v) => sauverProfil({ infosMedicales: v })} />
            </div>
          </motion.section>

          {/* Besoins (demandes ouvertes) */}
          <motion.section {...reveal} className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Besoins en attente</h2>
              <span className="font-mono text-xs text-cyan-glow">{besoins.length}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Demandes d'hôpitaux auxquelles vous pouvez postuler.</p>
            <ul className="mt-5 space-y-2.5">
              {besoins.length === 0 && <li className="py-3 text-sm text-muted-foreground">Aucun besoin ouvert pour le moment.</li>}
              {besoins.map((d) => (
                <li key={d._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
                  <div>
                    <p className="text-sm font-medium">{d.organe} · <span className="text-organic-red">{d.groupeSanguinReceveur}</span></p>
                    <p className="font-mono text-xs text-muted-foreground">{d.nomEtablissement || "Hôpital"} · {d.ville || "—"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {d.compatibilite !== null && (
                      <span className={cn("font-mono text-xs", d.compatibilite > 0 ? "text-emerald-life" : "text-muted-foreground")}>{d.compatibilite}% compat.</span>
                    )}
                    {d.dejaPostule ? (
                      <span className="rounded-full border border-emerald-life/40 px-3 py-1 text-xs text-emerald-life">Postulé ✓</span>
                    ) : (
                      <button onClick={() => postuler(d._id)} className="flex items-center gap-1.5 rounded-full bg-gradient-glow px-4 py-1.5 text-xs font-semibold text-primary-foreground"><Send className="h-3.5 w-3.5" /> Postuler</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Historique */}
          <motion.section {...reveal} className="glass rounded-2xl p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold"><Clock className="h-5 w-5 text-cyan-glow" /> Historique</h2>
            <ul className="mt-5 divide-y divide-border">
              {historique.length === 0 && <li className="py-4 text-sm text-muted-foreground">Aucune activité.</li>}
              {historique.map((a) => (
                <li key={a._id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-cyan-glow" />
                    <div>
                      <p className="text-sm font-medium">{a.action}</p>
                      {a.details && <p className="font-mono text-xs text-muted-foreground">{a.details}</p>}
                    </div>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{new Date(a.dateAction).toLocaleDateString("fr-FR")}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          <motion.div {...reveal} className="flex justify-center">
            <DonorCard
              name={carte?.nomComplet || `${profil.prenom} ${profil.nom}`}
              donorId={carte?.identifiantUnique || "—"}
              bloodType={profil.groupeSanguin || "—"}
              organs={selection.length ? selection.join(" · ") : "Aucun"}
              qr={carte?.codeQR}
            />
          </motion.div>

          {/* Mes candidatures */}
          <motion.section {...reveal} className="glass rounded-2xl p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold"><ShieldCheck className="h-4 w-4 text-cyan-glow" /> Mes candidatures</h2>
            <ul className="mt-4 space-y-2">
              {candidatures.length === 0 && <li className="text-sm text-muted-foreground">Aucune candidature.</li>}
              {candidatures.map((c) => (
                <li key={c.demandeId} className="rounded-lg border border-border p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{c.organe} · {c.nomEtablissement}</span>
                    <span className="text-emerald-life">{c.compatibilite}%</span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">statut : {c.statutCandidature}</p>
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.div {...reveal} className="glass relative overflow-hidden rounded-2xl p-6 text-center">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-glow" />
            <Heart className="mx-auto h-8 w-8 fill-organic-red/30 text-organic-red" style={{ animation: "var(--animate-heartbeat)" }} />
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Impact potentiel</p>
            <p className="mt-1 text-2xl font-semibold gradient-text">{declare ? `+ ${Math.max(1, selection.length)} vies` : "Consentement inactif"}</p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground outline-none focus:border-cyan-glow/60 focus:ring-2 focus:ring-ring">
        <option value="">Choisir…</option>
        {options.map((o) => <option key={o} value={o} className="bg-background">{o}</option>)}
      </select>
    </label>
  );
}

function TextField({ label, value, placeholder, onSave }: { label: string; value: string; placeholder?: string; onSave: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const dirty = draft !== value;
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background/40 px-4 py-2.5 focus-within:border-cyan-glow/60 focus-within:ring-2 focus-within:ring-ring">
        <input value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && dirty && onSave(draft)} className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
        {dirty && <button onClick={() => onSave(draft)} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-glow text-primary-foreground"><Check className="h-3.5 w-3.5" /></button>}
      </div>
    </label>
  );
}
