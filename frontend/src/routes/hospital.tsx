import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Radio,
  Droplet,
  MapPin,
  Plus,
  Send,
  ChevronDown,
  Users,
  HeartPulse,
  ClipboardList,
  Check,
  X,
  Phone,
} from "lucide-react";
import { RequireAuth } from "../components/RequireAuth";
import { reveal, cn } from "../lib/utils";
import { useAuth } from "../lib/auth";
import {
  api,
  type DonneurResultat,
  type Demande,
} from "../lib/api";
import {
  GROUPES_SANGUINS,
  ORGANES,
  ORGANES_ICONS,
  URGENCES,
  URGENCE_LABEL,
  URGENCE_TONE,
} from "../lib/domain";

export const Route = createFileRoute("/hospital")({
  head: () => ({
    meta: [
      { title: "Espace Hôpital — LifeLink" },
      { name: "description", content: "Registre des donneurs consentants et gestion des demandes d'organes." },
    ],
  }),
  component: () => (
    <RequireAuth roles={["hopital", "admin"]}>
      <Hospital />
    </RequireAuth>
  ),
});

interface Stats {
  total: number;
  consentants: number;
  parOrgane: { _id: string; count: number }[];
  parGroupe: { _id: string; count: number }[];
}

function Hospital() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"registre" | "demandes">("registre");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.statsHopital().then(setStats).catch(() => {});
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-32">
      {/* En-tête */}
      <motion.div {...reveal} className="relative overflow-hidden rounded-3xl glass-strong p-8">
        <div className="absolute inset-0 grid-mesh opacity-20" />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-glow/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-glow">Espace Hôpital</p>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
              {user?.nomEtablissement || "Centre de transplantation"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{user?.ville || "—"}</p>
          </div>
          <div className="glass flex items-center gap-2 rounded-full px-4 py-2 font-mono text-xs">
            <Radio className="h-3.5 w-3.5 text-emerald-life" />
            <span className="text-emerald-life">EN LIGNE</span>
          </div>
        </div>

        {/* Stats inline */}
        <div className="relative mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MiniStat icon={Users} label="Donneurs" value={stats?.total} />
          <MiniStat icon={HeartPulse} label="Consentants" value={stats?.consentants} tone="emerald-life" />
          <MiniStat icon={Droplet} label="Groupes" value={stats?.parGroupe.length} tone="organic-red" />
          <MiniStat icon={ClipboardList} label="Organes dispo." value={stats?.parOrgane.length} tone="bio-purple" />
        </div>
      </motion.div>

      {/* Onglets */}
      <div className="mt-8 flex gap-2">
        <TabButton active={tab === "registre"} onClick={() => setTab("registre")} icon={Search} label="Registre des donneurs" />
        <TabButton active={tab === "demandes"} onClick={() => setTab("demandes")} icon={ClipboardList} label="Mes demandes" />
      </div>

      <AnimatePresence mode="wait">
        {tab === "registre" ? (
          <motion.div key="registre" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6">
            <Registre stats={stats} />
          </motion.div>
        ) : (
          <motion.div key="demandes" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6">
            <Demandes />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ----------------------------- Registre ----------------------------- */
function Registre({ stats }: { stats: Stats | null }) {
  const [groupeSanguin, setGroupe] = useState<string | null>(null);
  const [organe, setOrgane] = useState("");
  const [region, setRegion] = useState("");
  const [donneurs, setDonneurs] = useState<DonneurResultat[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const r = await api.rechercherDonneurs({
        groupeSanguin: groupeSanguin || undefined,
        organe: organe || undefined,
        region: region || undefined,
      });
      setDonneurs(r.donneurs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupeSanguin, organe]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Filtres + résultats */}
      <div className="lg:col-span-2 space-y-4">
        <div className="glass rounded-2xl p-5">
          <form onSubmit={(e) => { e.preventDefault(); search(); }} className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-2.5 focus-within:border-cyan-glow/60">
            <MapPin className="h-4 w-4 text-cyan-glow" />
            <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Rechercher par région…" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-gradient-glow px-4 py-1.5 text-xs font-semibold text-primary-foreground"><Search className="h-3.5 w-3.5" /> Chercher</button>
          </form>
          <div className="mt-4 space-y-2">
            <ChipRow label="Groupe">
              <Chip label="Tous" active={groupeSanguin === null} onClick={() => setGroupe(null)} />
              {GROUPES_SANGUINS.map((g) => <Chip key={g} label={g} active={groupeSanguin === g} onClick={() => setGroupe(groupeSanguin === g ? null : g)} />)}
            </ChipRow>
            <ChipRow label="Organe">
              <Chip label="Tous" active={organe === ""} onClick={() => setOrgane("")} />
              {ORGANES.map((o) => <Chip key={o} label={ORGANES_ICONS.find((x) => x.name === o)?.label || o} active={organe === o} onClick={() => setOrgane(organe === o ? "" : o)} />)}
            </ChipRow>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Donneurs consentants</h2>
            <span className="font-mono text-xs text-emerald-life">{loading ? "…" : `${donneurs.length} résultats`}</span>
          </div>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {donneurs.map((d) => (
              <li key={d._id} className="rounded-xl border border-border p-4 transition-colors hover:border-cyan-glow/40">
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-semibold">{d.nomComplet}</p>
                  <span className="flex items-center gap-1 text-xs text-organic-red"><Droplet className="h-3 w-3" /> {d.groupeSanguin}</span>
                </div>
                <p className="mt-1 flex items-center gap-1 font-mono text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {d.region} · <Phone className="h-3 w-3" /> {d.telephone}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {d.organes.map((o) => <span key={o} className="rounded-full border border-emerald-life/30 px-2 py-0.5 text-[10px] text-emerald-life">{ORGANES_ICONS.find((x) => x.name === o)?.label || o}</span>)}
                </div>
                {d.identifiantCarte && <p className="mt-2 font-mono text-[10px] text-cyan-glow">{d.identifiantCarte}</p>}
              </li>
            ))}
            {!loading && donneurs.length === 0 && <li className="col-span-2 py-10 text-center text-xs text-muted-foreground">AUCUN DONNEUR CONSENTANT POUR CES FILTRES</li>}
          </ul>
        </div>
      </div>

      {/* Disponibilités */}
      <div className="space-y-4">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">Disponibilité par organe</h2>
          <ul className="mt-4 space-y-2.5">
            {stats?.parOrgane.length ? stats.parOrgane.map((o) => (
              <li key={o._id}>
                <div className="flex items-center justify-between text-xs"><span>{ORGANES_ICONS.find((x) => x.name === o._id)?.label || o._id}</span><span className="text-cyan-glow">{o.count}</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foreground/10"><div className="h-full rounded-full bg-gradient-glow" style={{ width: `${(o.count / (stats.parOrgane[0]?.count || 1)) * 100}%` }} /></div>
              </li>
            )) : <li className="text-xs text-muted-foreground">Aucune donnée.</li>}
          </ul>
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">Par groupe sanguin</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {stats?.parGroupe.length ? stats.parGroupe.map((b) => (
              <div key={b._id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs"><span className="text-organic-red">{b._id}</span><span>{b.count}</span></div>
            )) : <p className="col-span-2 text-xs text-muted-foreground">Aucune donnée.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Demandes ----------------------------- */
function Demandes() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState<{
    organe: string;
    groupeSanguinReceveur: string;
    referencePatient: string;
    urgence: string;
    notes: string;
  }>({ organe: ORGANES[0], groupeSanguinReceveur: "O+", referencePatient: "", urgence: "moyenne", notes: "" });
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const load = async () => setDemandes((await api.listDemandesHopital()).demandes);
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setFlash(null);
    try {
      await api.creerDemande(form);
      setFlash("Demande créée et publiée auprès des donneurs.");
      setForm((f) => ({ ...f, referencePatient: "", notes: "" }));
      await load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Erreur");
    } finally { setBusy(false); }
  };

  const traiter = async (demandeId: string, candId: string, statut: string) => {
    await api.traiterCandidature(demandeId, candId, statut).catch(() => {});
    await load();
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Mes demandes d'organes</h2>
        <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-full bg-gradient-glow px-5 py-2 text-xs font-semibold text-primary-foreground shadow-neon"><Plus className="h-4 w-4" /> Nouvelle demande</button>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-5 grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select value={form.organe} onChange={(v) => setForm({ ...form, organe: v })} options={ORGANES.map((o) => [o, ORGANES_ICONS.find((x) => x.name === o)?.label || o])} />
          <Select value={form.groupeSanguinReceveur} onChange={(v) => setForm({ ...form, groupeSanguinReceveur: v })} options={GROUPES_SANGUINS.map((g) => [g, g])} />
          <Select value={form.urgence} onChange={(v) => setForm({ ...form, urgence: v })} options={URGENCES.map((u) => [u, URGENCE_LABEL[u]])} />
          <input required value={form.referencePatient} onChange={(e) => setForm({ ...form, referencePatient: e.target.value })} placeholder="Référence patient" className="rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm outline-none focus:border-cyan-glow/60" />
          <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optionnel)" className="rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm outline-none focus:border-cyan-glow/60 lg:col-span-1" />
          <button type="submit" disabled={busy} className="flex items-center justify-center gap-2 rounded-lg bg-gradient-glow px-3 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"><Send className="h-4 w-4" /> {busy ? "…" : "Publier"}</button>
          {flash && <p className="text-xs text-emerald-life sm:col-span-2 lg:col-span-3">{flash}</p>}
        </form>
      )}

      <ul className="mt-5 space-y-2.5">
        {demandes.length === 0 && <li className="py-6 text-center text-xs text-muted-foreground">AUCUNE DEMANDE</li>}
        {demandes.map((d) => (
          <li key={d._id} className="rounded-xl border border-border">
            <button onClick={() => setExpanded(expanded === d._id ? null : d._id)} className="flex w-full items-center justify-between gap-4 p-4 text-left">
              <div>
                <p className="font-display text-sm font-semibold">{ORGANES_ICONS.find((x) => x.name === d.organe)?.label || d.organe} · <span className="text-organic-red">{d.groupeSanguinReceveur}</span></p>
                <p className="font-mono text-xs text-muted-foreground">Patient {d.referencePatient}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("rounded-full border px-2.5 py-1 text-[10px] uppercase", URGENCE_TONE[d.urgence])}>{URGENCE_LABEL[d.urgence]}</span>
                <span className="text-xs text-cyan-glow">{d.nbCandidatures ?? d.candidatures?.length ?? 0} candidats</span>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded === d._id && "rotate-180")} />
              </div>
            </button>
            {expanded === d._id && (
              <div className="border-t border-border p-4">
                {(d.candidatures?.length ?? 0) === 0 ? (
                  <p className="text-xs text-muted-foreground">Aucune candidature pour l'instant.</p>
                ) : (
                  <ul className="space-y-2">
                    {d.candidatures!.map((c) => (
                      <li key={c._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-xs">
                        <span>{c.nomDonneur} · {c.groupeSanguin} · <span className="text-emerald-life">{c.compatibilite}%</span></span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-muted-foreground">{c.statut}</span>
                          {c.statut === "enattente" && (
                            <>
                              <button onClick={() => traiter(d._id, c._id, "acceptee")} className="flex items-center gap-1 rounded bg-emerald-life/15 px-2 py-1 text-emerald-life"><Check className="h-3 w-3" /> Accepter</button>
                              <button onClick={() => traiter(d._id, c._id, "refusee")} className="flex items-center gap-1 rounded bg-organic-red/15 px-2 py-1 text-organic-red"><X className="h-3 w-3" /> Refuser</button>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------------- UI ----------------------------- */
function MiniStat({ icon: Icon, label, value, tone = "cyan-glow" }: { icon: typeof Users; label: string; value?: number; tone?: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <span className={`grid h-9 w-9 place-items-center rounded-lg glass text-${tone}`}><Icon className="h-4 w-4" /></span>
      <p className="mt-3 text-2xl font-semibold">{value ?? "—"}</p>
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Users; label: string }) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all", active ? "bg-gradient-glow text-primary-foreground shadow-neon" : "glass text-muted-foreground hover:text-foreground")}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-xs text-muted-foreground">{label} :</span>
      {children}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("rounded-full px-3 py-1.5 text-xs transition-all", active ? "bg-gradient-glow text-primary-foreground shadow-neon" : "glass text-muted-foreground hover:text-foreground")}>{label}</button>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-cyan-glow/60">
      {options.map(([v, l]) => <option key={v} value={v} className="bg-background">{l}</option>)}
    </select>
  );
}
