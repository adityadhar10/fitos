function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>FitOS</h2>

      <nav>
        <a>Dashboard</a>
        <a>Nutrition</a>
        <a>Workout</a>
        <a>Activity</a>
        <a>Progress</a>
      </nav>

      <div className="sidebar-bottom">
        <a>Settings</a>
      </div>
    </aside>
  );
}

export default Sidebar;