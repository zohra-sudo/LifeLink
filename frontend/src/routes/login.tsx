import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { HeroHeart } from "../components/HeroHeart";
import { EASE_CINEMATIC } from "../lib/utils";
import { useAuth, homeForRole } from "../lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — LifeLink" },
      { name: "description", content: "Connectez-vous à votre espace LifeLink." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login(email, motDePasse);
      navigate({ to: homeForRole(user.role) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la connexion");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden items-center justify-center overflow-hidden p-12 lg:flex">
        <div className="absolute inset-0 grid-mesh opacity-40" />
        <div className="relative text-center">
          <HeroHeart />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: EASE_CINEMATIC }}
            className="mt-8 font-display text-2xl font-semibold"
          >
            Prolongez un <span className="gradient-text">battement</span>.
          </motion.p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_CINEMATIC }}
          className="glass-strong w-full max-w-md rounded-3xl p-8"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-glow">Accès sécurisé</p>
          <h1 className="mt-3 font-display text-3xl font-semibold">Bon retour</h1>
          <p className="mt-2 text-sm text-muted-foreground">Connectez-vous pour gérer votre espace.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Field icon={Mail} type="email" placeholder="vous@exemple.com" label="Email" value={email} onChange={setEmail} />
            <Field icon={Lock} type="password" placeholder="••••••••••" label="Mot de passe" value={motDePasse} onChange={setMotDePasse} />

            {error && (
              <p className="flex items-center gap-2 rounded-lg border border-organic-red/40 bg-organic-red/10 px-3 py-2 text-sm text-organic-red">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-glow px-6 py-3.5 font-semibold text-primary-foreground shadow-neon transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {busy ? "Connexion…" : "Se connecter"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Nouveau sur LifeLink ?{" "}
            <Link to="/register" className="text-cyan-glow hover:underline">Créer un compte</Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
}

function Field({ icon: Icon, type, placeholder, label, value, onChange }: { icon: typeof Mail; type: string; placeholder: string; label: string; value: string; onChange: (v: string) => void }) {
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
