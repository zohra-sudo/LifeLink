import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, Menu, X, LogOut } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth, homeForRole } from "../lib/auth";

const links = [
  { label: "Mission", to: "/", hash: "mission" },
  { label: "Processus", to: "/", hash: "process" },
  { label: "Besoins", to: "/", hash: "besoins" },
  { label: "Impact", to: "/", hash: "impact" },
  { label: "FAQ", to: "/", hash: "faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const consoleLabel =
    user?.role === "admin"
      ? "Admin"
      : user?.role === "hopital"
        ? "Console"
        : "Mon espace";

  const onLogout = () => {
    logout();
    setOpen(false);
    navigate({ to: "/" });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "glass-strong border-b border-border py-3"
          : "border-b border-transparent py-5"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl glass">
            <Activity
              className="h-5 w-5 text-cyan-glow"
              style={{ animation: "var(--animate-heartbeat)" }}
            />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Life<span className="gradient-text">Link</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              <Link
                to={l.to}
                hash={l.hash}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                to={homeForRole(user.role)}
                className="rounded-full bg-gradient-glow px-5 py-2 text-sm font-semibold text-primary-foreground shadow-neon transition-transform hover:scale-[1.03]"
              >
                {consoleLabel}
              </Link>
              <button
                onClick={onLogout}
                className="grid h-9 w-9 place-items-center rounded-full glass text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gradient-glow px-5 py-2 text-sm font-semibold text-primary-foreground shadow-neon transition-transform hover:scale-[1.03]"
              >
                Devenir donneur
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl glass md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass-strong mx-5 mt-3 overflow-hidden rounded-2xl p-4 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  hash={l.hash}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    to={homeForRole(user.role)}
                    onClick={() => setOpen(false)}
                    className="block rounded-full bg-gradient-glow px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                  >
                    {consoleLabel}
                  </Link>
                  <button
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-semibold"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="block rounded-full glass px-5 py-2.5 text-center text-sm font-semibold"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="block rounded-full bg-gradient-glow px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                  >
                    Devenir donneur
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </motion.div>
      )}
    </motion.header>
  );
}
