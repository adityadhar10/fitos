import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { login as apiLogin, signup as apiSignup, getMe, updateGoals as apiUpdateGoals } from "../services/api";
import {
  DEFAULT_CALORIE_GOAL,
  DEFAULT_PROTEIN_GOAL,
  DEFAULT_CARB_GOAL,
  DEFAULT_FAT_GOAL,
} from "../constants/goals";

export interface User {
  id: string;
  name: string;
  email: string;
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateGoals: (goals: Partial<Pick<User, "calorieGoal" | "proteinGoal" | "carbGoal" | "fatGoal">>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUser(raw: Partial<User> & Pick<User, "id" | "name" | "email">): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    calorieGoal: raw.calorieGoal ?? DEFAULT_CALORIE_GOAL,
    proteinGoal: raw.proteinGoal ?? DEFAULT_PROTEIN_GOAL,
    carbGoal: raw.carbGoal ?? DEFAULT_CARB_GOAL,
    fatGoal: raw.fatGoal ?? DEFAULT_FAT_GOAL,
  };
}

async function fetchProfile(): Promise<User> {
  const res = await getMe();
  return normalizeUser(res.data.user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("fitos_token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetchProfile()
      .then(setUser)
      .catch(() => localStorage.removeItem("fitos_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    localStorage.setItem("fitos_token", res.data.token);
    setUser(await fetchProfile());
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await apiSignup(name, email, password);
    localStorage.setItem("fitos_token", res.data.token);
    setUser(await fetchProfile());
  };

  const logout = () => {
    localStorage.removeItem("fitos_token");
    setUser(null);
  };

  const updateGoals = async (
    goals: Partial<Pick<User, "calorieGoal" | "proteinGoal" | "carbGoal" | "fatGoal">>
  ) => {
    const res = await apiUpdateGoals(goals);
    setUser(normalizeUser(res.data.user));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateGoals }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
