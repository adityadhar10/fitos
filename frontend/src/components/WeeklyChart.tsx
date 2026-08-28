function WeeklyChart() {
  const data = [
    { day: "Mon", steps: 7200 },
    { day: "Tue", steps: 8500 },
    { day: "Wed", steps: 6800 },
    { day: "Thu", steps: 9200 },
    { day: "Fri", steps: 7800 },
    { day: "Sat", steps: 10500 },
    { day: "Sun", steps: 8420 },
  ];

  const maxSteps = 12000;

  return (
    <div className="weekly-chart">

      <div className="weekly-chart-header">
        <h2>Weekly Activity</h2>
        <p>Steps over the last 7 days</p>
      </div>

      <div className="chart-area">

        {/* Y AXIS */}
        <div className="chart-y-axis">
          <span>12k</span>
          <span>9k</span>
          <span>6k</span>
          <span>3k</span>
          <span>0</span>
        </div>

        {/* CHART */}
        <div className="chart-content">

          {/* GRID */}
          <div className="chart-grid">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>

          {/* BARS */}
          <div className="bars">

            {data.map((item) => (
              <div className="bar-column" key={item.day}>

                <div
                  className="activity-bar"
                  style={{
                    height: `${(item.steps / maxSteps) * 100}%`,
                  }}
                />

                <span>{item.day}</span>

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default WeeklyChart;