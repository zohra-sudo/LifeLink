import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, getToken, setToken, type Utilisateur, type Role } from "./api";

interface AuthState {
  user: Utilisateur | null;
  loading: boolean;
  login: (email: string, motDePasse: string) => Promise<Utilisateur>;
  register: (body: Record<string, unknown>) => Promise<Utilisateur>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((r) => setUser(r.utilisateur))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, motDePasse: string) => {
    const { token, utilisateur } = await api.login(email, motDePasse);
    setToken(token);
    setUser(utilisateur);
    return utilisateur;
  };

  const register = async (body: Record<string, unknown>) => {
    const { token, utilisateur } = await api.register(body);
    setToken(token);
    setUser(utilisateur);
    return utilisateur;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const refresh = async () => {
    try {
      const r = await api.me();
      setUser(r.utilisateur);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}

/** Route d'accueil par défaut selon le rôle. */
export function homeForRole(role: Role): string {
  if (role === "admin") return "/admin";
  if (role === "hopital") return "/hospital";
  return "/dashboard";
}
