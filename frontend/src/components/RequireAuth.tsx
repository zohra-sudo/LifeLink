import { useEffect, type ReactNode } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { ShieldAlert, Clock } from "lucide-react";
import { useAuth } from "../lib/auth";
import type { Role } from "../lib/api";

/**
 * Garde de route. Redirige les non-authentifiés vers /login, bloque les rôles
 * non autorisés, et affiche un écran d'attente pour les hôpitaux non validés.
 */
export function RequireAuth({
  roles,
  children,
}: {
  roles: Role[];
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="glass rounded-2xl px-6 py-4 font-mono text-sm text-muted-foreground">
          Authentification…
        </div>
      </main>
    );
  }
  if (!user) return null;

  // Hôpital non validé
  if (user.role === "hopital" && !user.estActif) {
    const refuse = user.statut === "refuse";
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <div className="glass-strong max-w-md rounded-3xl p-10 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl glass text-cyan-glow">
            <Clock className="h-6 w-6" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold">
            {refuse ? "Compte refusé" : "En attente de validation"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {refuse
              ? "Votre demande de compte hôpital a été refusée par un administrateur."
              : "Votre compte hôpital est en attente de validation par un administrateur. Vous accéderez au registre une fois validé."}
          </p>
          <Link to="/" className="mt-7 inline-block rounded-full glass px-6 py-2.5 text-sm font-semibold">
            Retour à l'accueil
          </Link>
        </div>
      </main>
    );
  }

  if (!roles.includes(user.role)) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <div className="glass-strong max-w-md rounded-3xl p-10 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl glass text-organic-red">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold">Accès restreint</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Cet espace n'est pas disponible pour votre type de compte.
          </p>
          <Link to="/" className="mt-7 inline-block rounded-full glass px-6 py-2.5 text-sm font-semibold">
            Retour à l'accueil
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
