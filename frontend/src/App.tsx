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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "white" }}>
        Loading...
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
        <h2>FitOS</h2>

        <nav>
          <button className={page === "dashboard" ? "active" : ""} onClick={() => changePage("dashboard")}>
            Dashboard
          </button>
          <button className={page === "nutrition" ? "active" : ""} onClick={() => changePage("nutrition")}>
            Nutrition
          </button>
          <button className={page === "workout" ? "active" : ""} onClick={() => changePage("workout")}>
            Workout
          </button>
          <button className={page === "activity" ? "active" : ""} onClick={() => changePage("activity")}>
            Activity
          </button>
          <button className={page === "progress" ? "active" : ""} onClick={() => changePage("progress")}>
            Progress
          </button>
          <button className={page === "settings" ? "active" : ""} onClick={() => changePage("settings")}>
            Settings
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button onClick={logout}>Log Out</button>
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
