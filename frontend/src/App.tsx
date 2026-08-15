import { useState } from "react";
import { useAuth } from "./context/AuthContext";

import Dashboard from "./pages/Dashboard";
import Nutrition from "./pages/Nutrition";
import Workout from "./pages/Workout";
import Activity from "./pages/Activity";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "nutrition", label: "Nutrition", icon: "🥗" },
  { id: "workout", label: "Workout", icon: "🏋️" },
  { id: "activity", label: "Activity", icon: "⚡" },
  { id: "progress", label: "Progress", icon: "📈" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

function App() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [authPage, setAuthPage] = useState<"login" | "signup">("login");

  const changePage = (newPage: string) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#7a8580",
          fontFamily: "'Inter', sans-serif",
          fontSize: 15,
          gap: 10,
        }}
      >
        <span style={{ fontSize: 24 }}>⚡</span> Loading FitOS...
      </div>
    );
  }

  if (!user) {
    return authPage === "login" ? (
      <Login onSwitchToSignup={() => setAuthPage("signup")} />
    ) : (
      <Signup onSwitchToLogin={() => setAuthPage("login")} />
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>FitOS</h2>
        </div>

        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? "active" : ""}
              onClick={() => changePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button onClick={logout}>
            <span className="nav-icon">🚪</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        {page === "dashboard" && <Dashboard />}
        {page === "nutrition" && <Nutrition />}
        {page === "workout" && <Workout />}
        {page === "activity" && <Activity />}
        {page === "progress" && <Progress />}
        {page === "settings" && <Settings />}
      </main>
    </div>
  );
}

export default App;
