import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { BioBackground } from "../components/BioBackground";
import { Navbar } from "../components/Navbar";

/**
 * Root route. Renders the persistent living background + navbar shell and the
 * active route via <Outlet />. Fonts are loaded in index.html. A styled
 * not-found fallback keeps the cinematic tone even on dead links.
 */
export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <>
      <BioBackground />
      <Navbar />
      <Outlet />
    </>
  );
}

function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="glass-strong max-w-md rounded-3xl p-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-glow">
          Signal lost
        </p>
        <h1 className="mt-4 font-display text-7xl font-semibold gradient-text">
          404
        </h1>
        <p className="mt-4 text-muted-foreground">
          This heartbeat could not be found. The page may have moved or never
          existed.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-full bg-gradient-glow px-7 py-3 font-semibold text-primary-foreground shadow-neon transition-transform hover:scale-[1.03]"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
