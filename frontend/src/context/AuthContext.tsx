import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, signup as apiSignup, getMe } from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("fitos_token");
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("fitos_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    localStorage.setItem("fitos_token", res.data.token);
    setUser(res.data.user);
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await apiSignup(name, email, password);
    localStorage.setItem("fitos_token", res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("fitos_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
