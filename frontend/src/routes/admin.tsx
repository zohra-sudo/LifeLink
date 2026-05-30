import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Building2,
  Check,
  X,
  Users,
  Hospital as HospitalIcon,
  Clock,
  ClipboardList,
  GitMerge,
  ScrollText,
} from "lucide-react";
import { RequireAuth } from "../components/RequireAuth";
import { reveal, cn } from "../lib/utils";
import { api, type HopitalAdmin, type Demande, type JournalItem } from "../lib/api";
import { URGENCE_LABEL, URGENCE_TONE } from "../lib/domain";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration — LifeLink" },
      { name: "description", content: "Administration de la plateforme LifeLink." },
    ],
  }),
  component: () => (
    <RequireAuth roles={["admin"]}>
      <Admin />
    </RequireAuth>
  ),
});

interface AdminStats {
  donneurs: number;
  hopitauxValides: number;
  hopitauxEnAttente: number;
  demandes: number;
  candidatures: number;
}

const FILTERS: { label: string; value: string }[] = [
  { label: "En attente", value: "enattente" },
  { label: "Validés", value: "valide" },
  { label: "Refusés", value: "refuse" },
  { label: "Tous", value: "" },
];

function Admin() {
  const [filter, setFilter] = useState("enattente");
  const [hopitaux, setHopitaux] = useState<HopitalAdmin[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [journaux, setJournaux] = useState<(JournalItem & { role: string })[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadHopitaux = async () => {
    const h = await api.listHopitaux(filter || undefined);
    setHopitaux(h.hopitaux);
  };
  const loadRest = async () => {
    const [s, d, j] = await Promise.all([api.statsAdmin(), api.listDemandesAdmin(), api.listJournaux()]);
    setStats(s);
    setDemandes(d.demandes);
    setJournaux(j.journaux);
  };

  useEffect(() => { loadHopitaux(); /* eslint-disable-next-line */ }, [filter]);
  useEffect(() => { loadRest(); }, []);

  const act = async (id: string, action: "valider" | "refuser") => {
    setBusyId(id);
    try {
      if (action === "valider") await api.validerHopital(id);
      else await api.refuserHopital(id);
      await Promise.all([loadHopitaux(), loadRest()]);
    } finally { setBusyId(null); }
  };

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-32">
      <motion.div {...reveal}>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-glow">Administration</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Pilotage de la <span className="gradient-text">plateforme</span></h1>
      </motion.div>

      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <Stat icon={Users} label="Donneurs" value={stats?.donneurs} tone="emerald-life" />
        <Stat icon={HospitalIcon} label="Hôpitaux validés" value={stats?.hopitauxValides} tone="cyan-glow" />
        <Stat icon={Clock} label="En attente" value={stats?.hopitauxEnAttente} tone="organic-red" />
        <Stat icon={ClipboardList} label="Demandes" value={stats?.demandes} tone="turquoise" />
        <Stat icon={GitMerge} label="Candidatures" value={stats?.candidatures} tone="neon-pink" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Hôpitaux */}
        <motion.section {...reveal} className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Comptes hôpitaux</h2>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button key={f.value} onClick={() => setFilter(f.value)} className={cn("rounded-full px-3.5 py-1.5 font-mono text-xs transition-all", filter === f.value ? "bg-gradient-glow text-primary-foreground shadow-neon" : "glass text-muted-foreground hover:text-foreground")}>{f.label}</button>
              ))}
            </div>
          </div>
          <ul className="mt-6 space-y-3">
            {hopitaux.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">Aucun compte dans cette catégorie.</li>}
            {hopitaux.map((h) => (
              <li key={h._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl glass text-cyan-glow"><Building2 className="h-5 w-5" /></span>
                  <div>
                    <p className="font-semibold">{h.nomEtablissement}</p>
                    <p className="font-mono text-xs text-muted-foreground">{h.email} · {h.ville || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge statut={h.statut} />
                  {h.statut === "enattente" && (
                    <div className="flex gap-2">
                      <button disabled={busyId === h._id} onClick={() => act(h._id, "valider")} className="flex items-center gap-1 rounded-lg bg-emerald-life/15 px-3 py-1.5 text-xs font-semibold text-emerald-life hover:bg-emerald-life/25 disabled:opacity-50"><Check className="h-3.5 w-3.5" /> Valider</button>
                      <button disabled={busyId === h._id} onClick={() => act(h._id, "refuser")} className="flex items-center gap-1 rounded-lg bg-organic-red/15 px-3 py-1.5 text-xs font-semibold text-organic-red hover:bg-organic-red/25 disabled:opacity-50"><X className="h-3.5 w-3.5" /> Refuser</button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Journaux */}
        <motion.section {...reveal} className="glass rounded-2xl p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><ScrollText className="h-5 w-5 text-cyan-glow" /> Journal d'activité</h2>
          <ul className="mt-5 max-h-[420px] space-y-2 overflow-auto pr-1">
            {journaux.length === 0 && <li className="text-sm text-muted-foreground">Aucune activité.</li>}
            {journaux.map((j) => (
              <li key={j._id} className="rounded-lg border border-border p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{j.action}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{new Date(j.dateAction).toLocaleDateString("fr-FR")}</span>
                </div>
                <p className="mt-0.5 font-mono text-[10px] text-cyan-glow">{j.role}{j.details ? ` · ${j.details}` : ""}</p>
              </li>
            ))}
          </ul>
        </motion.section>
      </div>

      {/* Demandes (toutes) */}
      <motion.section {...reveal} className="mt-8 glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold">Demandes d'organes (toutes)</h2>
        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {demandes.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground sm:col-span-2">Aucune demande.</li>}
          {demandes.map((d) => (
            <li key={d._id} className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="text-sm font-medium">{d.organe} · <span className="text-organic-red">{d.groupeSanguinReceveur}</span></p>
                <p className="font-mono text-xs text-muted-foreground">{d.nomEtablissement || "—"} · {d.ville || "—"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("rounded-full border px-2.5 py-1 text-[10px] uppercase", URGENCE_TONE[d.urgence])}>{URGENCE_LABEL[d.urgence]}</span>
                <span className="text-xs text-cyan-glow">{d.nbCandidatures ?? 0} cand.</span>
              </div>
            </li>
          ))}
        </ul>
      </motion.section>
    </main>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value?: number; tone: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <span className={`grid h-10 w-10 place-items-center rounded-xl glass text-${tone}`}><Icon className="h-5 w-5" /></span>
      <p className="mt-4 text-3xl font-semibold">{value ?? "—"}</p>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

function StatusBadge({ statut }: { statut: "enattente" | "valide" | "refuse" }) {
  const map = {
    valide: { label: "Validé", cls: "text-emerald-life border-emerald-life/40" },
    enattente: { label: "En attente", cls: "text-cyan-glow border-cyan-glow/40" },
    refuse: { label: "Refusé", cls: "text-organic-red border-organic-red/40" },
  } as const;
  const s = map[statut];
  return <span className={cn("rounded-full border px-3 py-1 font-mono text-[10px] uppercase", s.cls)}>{s.label}</span>;
}
