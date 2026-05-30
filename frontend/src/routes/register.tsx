import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  HeartHandshake,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { EASE_CINEMATIC, cn } from "../lib/utils";
import { useAuth, homeForRole } from "../lib/auth";
import type { Role } from "../lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Créer un compte — LifeLink" },
      { name: "description", content: "Inscrivez-vous comme donneur ou hôpital partenaire sur LifeLink." },
    ],
  }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState<Role>("donneur");
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    nomEtablissement: "",
    ville: "",
    telephone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const body =
        role === "hopital"
          ? {
              role,
              email: form.email,
              motDePasse: form.motDePasse,
              nomEtablissement: form.nomEtablissement,
              ville: form.ville,
              telephone: form.telephone,
            }
          : {
              role,
              nom: form.nom,
              prenom: form.prenom,
              email: form.email,
              motDePasse: form.motDePasse,
            };
      const user = await register(body);
      navigate({ to: homeForRole(user.role) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'inscription");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-5 py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE_CINEMATIC }}
        className="glass-strong w-full max-w-lg rounded-3xl p-8"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-glow">Rejoindre LifeLink</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">Créer un compte</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choisissez votre profil.</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <RoleCard active={role === "donneur"} onClick={() => setRole("donneur")} icon={HeartHandshake} title="Donneur" subtitle="Déclarer mon consentement" />
          <RoleCard active={role === "hopital"} onClick={() => setRole("hopital")} icon={Building2} title="Hôpital" subtitle="Soumis à validation admin" />
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {role === "donneur" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={UserIcon} label="Nom" value={form.nom} onChange={set("nom")} placeholder="Votre nom" />
              <Field icon={UserIcon} label="Prénom" value={form.prenom} onChange={set("prenom")} placeholder="Votre prénom" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={Building2} label="Établissement" value={form.nomEtablissement} onChange={set("nomEtablissement")} placeholder="CHU…" />
              <Field icon={Building2} label="Ville" value={form.ville} onChange={set("ville")} placeholder="Rabat" />
            </div>
          )}
          {role === "hopital" && (
            <Field icon={UserIcon} label="Téléphone" value={form.telephone} onChange={set("telephone")} placeholder="+212…" />
          )}
          <Field icon={Mail} type="email" label="Email" value={form.email} onChange={set("email")} placeholder="vous@exemple.com" />
          <Field icon={Lock} type="password" label="Mot de passe" value={form.motDePasse} onChange={set("motDePasse")} placeholder="8 caractères minimum" />

          {error && (
            <p className="flex items-center gap-2 rounded-lg border border-organic-red/40 bg-organic-red/10 px-3 py-2 text-sm text-organic-red">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </p>
          )}
          {role === "hopital" && (
            <p className="rounded-lg border border-border bg-foreground/5 px-3 py-2 text-xs text-muted-foreground">
              Les comptes hôpitaux sont vérifiés par un administrateur avant d'accéder au registre.
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-glow px-6 py-3.5 font-semibold text-primary-foreground shadow-neon transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {busy ? "Création…" : "Créer mon compte"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link to="/login" className="text-cyan-glow hover:underline">Se connecter</Link>
        </p>
      </motion.div>
    </main>
  );
}

function RoleCard({ active, onClick, icon: Icon, title, subtitle }: { active: boolean; onClick: () => void; icon: typeof Mail; title: string; subtitle: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("rounded-2xl border p-4 text-left transition-all", active ? "border-cyan-glow/40 glass shadow-glow" : "border-border opacity-70 hover:opacity-100")}
    >
      <Icon className={cn("h-6 w-6", active ? "text-cyan-glow" : "text-muted-foreground")} />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </button>
  );
}

function Field({ icon: Icon, type = "text", label, value, onChange, placeholder }: { icon: typeof Mail; type?: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-3 transition-colors focus-within:border-cyan-glow/60 focus-within:ring-2 focus-within:ring-ring">
        <Icon className="h-4 w-4 text-cyan-glow" />
        <input required type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
      </div>
    </label>
  );
}
