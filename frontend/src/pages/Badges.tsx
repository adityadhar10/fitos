import { useEffect, useState } from "react";
import "../index.css";
import { getBadges } from "../services/api";

interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt: string | null;
}

interface BadgesResponse {
  badges: Badge[];
  totalEarned: number;
  totalAvailable: number;
}

export default function Badges() {
  const [data, setData] = useState<BadgesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBadges()
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load badges:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const progressPct = data
    ? Math.round((data.totalEarned / data.totalAvailable) * 100)
    : 0;

  return (
    <div className="page-container page-enter">
      <div className="page-header">
        <h1>Badges &amp; Achievements 🏅</h1>
        <p>Earn badges by hitting milestones in your fitness journey.</p>
      </div>

      {/* Progress summary card */}
      <div className="section-card badges-summary-card">
        <div className="badges-summary-left">
          <div className="badges-summary-count">
            {loading ? (
              <div className="skeleton skeleton-number" />
            ) : (
              <>
                <strong>{data?.totalEarned ?? 0}</strong>
                <span>/ {data?.totalAvailable ?? 0}</span>
              </>
            )}
          </div>
          <p className="badges-summary-label">Badges Earned</p>
        </div>

        <div className="badges-summary-right">
          <div className="badges-progress-track">
            <div
              className="badges-progress-fill"
              style={{ width: loading ? "0%" : `${progressPct}%` }}
            />
          </div>
          <span className="badges-progress-pct">{loading ? "" : `${progressPct}% complete`}</span>
        </div>
      </div>

      {/* Badge grid */}
      <div className="section-card">
        <div className="section-header">
          <h2>All Achievements</h2>
        </div>

        {loading ? (
          <div className="badges-grid">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="badge-card skeleton-card" />
            ))}
          </div>
        ) : (
          <div className="badges-grid">
            {data?.badges.map((badge) => (
              <div
                key={badge.id}
                className={`badge-card ${badge.earned ? "earned" : "locked"}`}
              >
                <div className="badge-emoji">{badge.emoji}</div>
                <div className="badge-name">{badge.name}</div>
                <div className="badge-desc">{badge.description}</div>
                {badge.earned && badge.earnedAt ? (
                  <div className="badge-earned-date">
                    ✅ {formatDate(badge.earnedAt)}
                  </div>
                ) : (
                  <div className="badge-locked-label">🔒 Not yet earned</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
