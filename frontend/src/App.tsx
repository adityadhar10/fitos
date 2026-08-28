import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Bot,
  Apple,
  Dumbbell,
  Zap,
  TrendingUp,
  Award,
  Settings as SettingsIcon,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { APP_VERSION } from "./constants/version";

import Dashboard from "./pages/Dashboard";
import Coach from "./pages/Coach";
import Nutrition from "./pages/Nutrition";
import Workout from "./pages/Workout";
import Activity from "./pages/Activity";
import Progress from "./pages/Progress";
import Badges from "./pages/Badges";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/coach", label: "AI Coach", icon: Bot },
  { to: "/nutrition", label: "Nutrition", icon: Apple },
  { to: "/workout", label: "Workout", icon: Dumbbell },
  { to: "/activity", label: "Activity", icon: Zap },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/badges", label: "Badges", icon: Award },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function AppShell() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="loading-icon" size={24} />
        Loading FitOS...
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/signup" element={<Signup onSwitchToLogin={() => {}} />} />
        <Route path="*" element={<Login onSwitchToSignup={() => {}} />} />
      </Routes>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>FitOS</h2>
          <span className="sidebar-version">v{APP_VERSION}</span>
        </div>

        <nav>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span className="nav-icon">
                  <Icon size={18} />
                </span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button onClick={logout}>
            <span className="nav-icon">
              <LogOut size={18} />
            </span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `bottom-nav-item${isActive ? " active" : ""}`}
            >
              <span className="bottom-nav-icon">
                <Icon size={20} />
              </span>
              <span className="bottom-nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
