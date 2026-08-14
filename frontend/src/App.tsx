import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Nutrition from "./pages/Nutrition";
import Workout from "./pages/Workout";
import Activity from "./pages/Activity";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";

function App() {
  const [page, setPage] = useState("dashboard");

  const changePage = (newPage: string) => {
    setPage(newPage);

    // Move page to top whenever a sidebar item is clicked
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <h2>FitOS</h2>

        <nav>

          <button
            className={page === "dashboard" ? "active" : ""}
            onClick={() => changePage("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={page === "nutrition" ? "active" : ""}
            onClick={() => changePage("nutrition")}
          >
            Nutrition
          </button>

          <button
            className={page === "workout" ? "active" : ""}
            onClick={() => changePage("workout")}
          >
            Workout
          </button>

          <button
            className={page === "activity" ? "active" : ""}
            onClick={() => changePage("activity")}
          >
            Activity
          </button>

          <button
            className={page === "progress" ? "active" : ""}
            onClick={() => changePage("progress")}
          >
            Progress
          </button>

          <button
            className={page === "settings" ? "active" : ""}
            onClick={() => changePage("settings")}
          >
            Settings
          </button>

        </nav>

      </aside>


      {/* MAIN CONTENT */}
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