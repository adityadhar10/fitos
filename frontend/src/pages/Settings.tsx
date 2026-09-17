import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  exportWorkoutCSV,
  exportNutritionCSV,
  exportWeightCSV,
} from "../services/api";
import { APP_VERSION } from "../constants/version";
import {
  User,
  ShieldCheck,
  Utensils,
  Bell,
  Palette,
  Lock,
  Database,
  LogOut,
  Download,
  Dumbbell,
  Footprints,
  Scale,
  Check,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  Trash2,
  Edit3,
  X,
  Calculator,
  Moon,
  Sun,
  Monitor,
  KeyRound,
  Volume2,
  VolumeX,
} from "lucide-react";
import "./Settings.css";

type SettingsSection =
  | "account"
  | "profile"
  | "nutrition"
  | "notifications"
  | "appearance"
  | "security"
  | "privacy";

interface NotificationPreferences {
  workoutReminders: boolean;
  nutritionReminders: boolean;
  stepReminders: boolean;
  progressUpdates: boolean;
  aiCoachInsights: boolean;
}

const ACCENT_COLORS = [
  { id: "emerald", name: "Emerald", color: "#22c55e" },
  { id: "cyan",    name: "Cyber Cyan", color: "#0ea5e9" },
  { id: "amber",   name: "Solar Gold", color: "#f59e0b" },
  { id: "rose",    name: "Crimson", color: "#f43f5e" },
  { id: "violet",  name: "Amethyst", color: "#a855f7" },
];

export default function Settings() {
  const { user, updateGoals, logout } = useAuth();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<SettingsSection>("account");

  // Modals
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Profile State
  const [profName, setProfName] = useState(user?.name || "Aditya Dhar");
  const [profEmail, setProfEmail] = useState(user?.email || "aditya@fitos.ai");
  const [profAge, setProfAge] = useState<number>(() => {
    return Number(localStorage.getItem("fitos_prof_age")) || 24;
  });
  const [profGender, setProfGender] = useState<string>(() => {
    return localStorage.getItem("fitos_prof_gender") || "Male";
  });
  const [profHeight, setProfHeight] = useState<number>(() => {
    return Number(localStorage.getItem("fitos_prof_height")) || 178;
  });
  const [profWeight, setProfWeight] = useState<number>(() => {
    return Number(localStorage.getItem("fitos_prof_weight")) || 75.0;
  });
  const [profGoal, setProfGoal] = useState<string>(() => {
    return localStorage.getItem("fitos_prof_goal") || "Build Muscle";
  });
  const [profStepGoal, setProfStepGoal] = useState<number>(() => {
    return Number(localStorage.getItem("fitos_prof_step_goal")) || 10000;
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Nutrition Targets State
  const [calorieGoal, setCalorieGoal] = useState(String(user?.calorieGoal || 2400));
  const [proteinGoal, setProteinGoal] = useState(String(user?.proteinGoal || 160));
  const [carbGoal, setCarbGoal] = useState(String(user?.carbGoal || 260));
  const [fatGoal, setFatGoal] = useState(String(user?.fatGoal || 70));
  const [savingGoals, setSavingGoals] = useState(false);
  const [goalsMessage, setGoalsMessage] = useState<string | null>(null);
  const [goalsError, setGoalsError] = useState<string | null>(null);

  // TDEE Calculator State
  const [calcSex, setCalcSex] = useState<"male" | "female">("male");
  const [calcAge, setCalcAge] = useState<number>(profAge || 24);
  const [calcWeight, setCalcWeight] = useState<number>(profWeight || 75);
  const [calcHeight, setCalcHeight] = useState<number>(profHeight || 178);
  const [calcActivity, setCalcActivity] = useState<number>(1.55);
  const [calcGoalOffset, setCalcGoalOffset] = useState<number>(-300);
  const [savingTDEE, setSavingTDEE] = useState(false);
  const [tdeeAppliedMsg, setTdeeAppliedMsg] = useState<string | null>(null);

  // Notification Preferences State
  const [notifs, setNotifs] = useState<NotificationPreferences>(() => {
    const saved = localStorage.getItem("fitos_notifications");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      workoutReminders: true,
      nutritionReminders: true,
      stepReminders: true,
      progressUpdates: true,
      aiCoachInsights: true,
    };
  });
  const [notifSavedToast, setNotifSavedToast] = useState(false);

  // Appearance State
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">(() => {
    return (localStorage.getItem("fitos_theme_mode") as any) || "dark";
  });
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem("fitos_accent_color") || "emerald";
  });
  const [compactMode, setCompactMode] = useState<boolean>(() => {
    return localStorage.getItem("fitos_compact_mode") === "true";
  });
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem("fitos_animations_enabled") !== "false";
  });
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem("fitos_reduced_motion") === "true";
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem("fitos_sound_enabled") !== "false";
  });

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Data Export State
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Sync user changes
  useEffect(() => {
    if (user) {
      if (user.name) setProfName(user.name);
      if (user.email) setProfEmail(user.email);
      setCalorieGoal(String(user.calorieGoal ?? 2400));
      setProteinGoal(String(user.proteinGoal ?? 160));
      setCarbGoal(String(user.carbGoal ?? 260));
      setFatGoal(String(user.fatGoal ?? 70));
    }
  }, [user]);

  // Mifflin-St Jeor TDEE Calculation
  const tdeeCalc = useMemo(() => {
    const w = Number(calcWeight) || 75;
    const h = Number(calcHeight) || 178;
    const a = Number(calcAge) || 24;

    const bmr =
      calcSex === "male"
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161;

    const tdee = Math.round(bmr * calcActivity);
    const targetCalories = Math.max(1200, tdee + calcGoalOffset);

    // Protein: 2.2g/kg on deficit, 2.0g/kg on bulk/maintenance
    const proteinFactor = calcGoalOffset < 0 ? 2.2 : 2.0;
    const targetProtein = Math.round(w * proteinFactor);

    // Fat: 25% of calories (9 kcal/g)
    const targetFats = Math.round((targetCalories * 0.25) / 9);

    // Carbs: remainder (4 kcal/g)
    const calFromProteinAndFat = targetProtein * 4 + targetFats * 9;
    const remainingCal = Math.max(0, targetCalories - calFromProteinAndFat);
    const targetCarbs = Math.round(remainingCal / 4);

    return {
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats,
    };
  }, [calcSex, calcAge, calcWeight, calcHeight, calcActivity, calcGoalOffset]);

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg(null);

    localStorage.setItem("fitos_prof_age", String(profAge));
    localStorage.setItem("fitos_prof_gender", profGender);
    localStorage.setItem("fitos_prof_height", String(profHeight));
    localStorage.setItem("fitos_prof_weight", String(profWeight));
    localStorage.setItem("fitos_prof_goal", profGoal);
    localStorage.setItem("fitos_prof_step_goal", String(profStepGoal));

    setTimeout(() => {
      setSavingProfile(false);
      setProfileSuccessMsg("Profile information saved successfully.");
      setShowEditProfileModal(false);
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    }, 400);
  };

  // Handle Save Nutrition Goals
  const handleSaveNutritionGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoals(true);
    setGoalsMessage(null);
    setGoalsError(null);
    try {
      await updateGoals({
        calorieGoal: Number(calorieGoal) || 2400,
        proteinGoal: Number(proteinGoal) || 160,
        carbGoal: Number(carbGoal) || 260,
        fatGoal: Number(fatGoal) || 70,
      });
      setGoalsMessage("Nutrition targets updated successfully.");
      setTimeout(() => setGoalsMessage(null), 3000);
    } catch {
      setGoalsError("Could not save goals. Please verify positive numbers.");
    } finally {
      setSavingGoals(false);
    }
  };

  // Handle Apply TDEE Calculator Targets
  const handleApplyTDEETargets = async () => {
    setSavingTDEE(true);
    setTdeeAppliedMsg(null);
    setCalorieGoal(String(tdeeCalc.targetCalories));
    setProteinGoal(String(tdeeCalc.targetProtein));
    setCarbGoal(String(tdeeCalc.targetCarbs));
    setFatGoal(String(tdeeCalc.targetFats));

    try {
      await updateGoals({
        calorieGoal: tdeeCalc.targetCalories,
        proteinGoal: tdeeCalc.targetProtein,
        carbGoal: tdeeCalc.targetCarbs,
        fatGoal: tdeeCalc.targetFats,
      });
      setTdeeAppliedMsg("Calculated targets applied and saved to profile!");
      setTimeout(() => setTdeeAppliedMsg(null), 3500);
    } catch {
      setTdeeAppliedMsg("Calculated targets set in form. Click Save Targets to persist.");
    } finally {
      setSavingTDEE(false);
    }
  };

  // Handle Notification Toggle
  const handleToggleNotif = (key: keyof NotificationPreferences) => {
    const updated = { ...notifs, [key]: !notifs[key] };
    setNotifs(updated);
    localStorage.setItem("fitos_notifications", JSON.stringify(updated));
    setNotifSavedToast(true);
    setTimeout(() => setNotifSavedToast(false), 2000);
  };

  // Handle Theme Mode
  const handleThemeModeChange = (mode: "dark" | "light" | "system") => {
    setThemeMode(mode);
    localStorage.setItem("fitos_theme_mode", mode);
  };

  const handleAccentChange = (acc: string) => {
    setAccentColor(acc);
    localStorage.setItem("fitos_accent_color", acc);
  };

  const toggleCompactMode = () => {
    const next = !compactMode;
    setCompactMode(next);
    localStorage.setItem("fitos_compact_mode", String(next));
  };

  const toggleAnimations = () => {
    const next = !animationsEnabled;
    setAnimationsEnabled(next);
    localStorage.setItem("fitos_animations_enabled", String(next));
  };

  const toggleReducedMotion = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    localStorage.setItem("fitos_reduced_motion", String(next));
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("fitos_sound_enabled", String(next));
  };

  // Handle Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (!currentPassword) {
      setPwError("Current password is required.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    setTimeout(() => {
      setChangingPassword(false);
      setPwSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setPwSuccess(null);
      }, 1500);
    }, 600);
  };

  // Handle Data Exports
  const handleExport = async (type: string, fn: () => Promise<void>) => {
    setExporting(type);
    setExportError(null);
    setExportSuccess(null);
    try {
      await fn();
      setExportSuccess(`Exported ${type} successfully.`);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch {
      setExportError(`Failed to export ${type}. Ensure you have logged data.`);
    } finally {
      setExporting(null);
    }
  };

  const handleExportJSON = () => {
    setExporting("json");
    try {
      const backupData = {
        app: "FitOS",
        version: APP_VERSION,
        exportedAt: new Date().toISOString(),
        user: {
          name: profName,
          email: profEmail,
          age: profAge,
          gender: profGender,
          height: profHeight,
          weight: profWeight,
          goals: {
            calorieGoal,
            proteinGoal,
            carbGoal,
            fatGoal,
            stepGoal: profStepGoal,
          },
        },
        preferences: {
          notifications: notifs,
          themeMode,
          accentColor,
          compactMode,
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fitos-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportSuccess("Exported Full JSON backup successfully.");
      setTimeout(() => setExportSuccess(null), 3000);
    } catch {
      setExportError("Failed to generate JSON backup.");
    } finally {
      setExporting(null);
    }
  };

  // Handle Sign Out confirmation
  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
    logout();
    window.location.href = "/";
  };

  // Handle Delete Account confirmation
  const handleConfirmDeleteAccount = () => {
    if (deleteConfirmText.trim() !== "DELETE") return;
    localStorage.clear();
    logout();
    window.location.href = "/";
  };

  const NAV_ITEMS = [
    { id: "account" as SettingsSection,       label: "Account",              icon: User },
    { id: "profile" as SettingsSection,       label: "Profile",              icon: ShieldCheck },
    { id: "nutrition" as SettingsSection,     label: "Nutrition & Fitness",  icon: Utensils },
    { id: "notifications" as SettingsSection, label: "Notifications",        icon: Bell },
    { id: "appearance" as SettingsSection,    label: "Appearance",           icon: Palette },
    { id: "security" as SettingsSection,      label: "Security",             icon: Lock },
    { id: "privacy" as SettingsSection,       label: "Privacy & Data",       icon: Database },
  ];

  return (
    <div className="page-container page-enter settings-container">
      {/* ── Page Header ── */}
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account, preferences, fitness targets and privacy.</p>
      </div>

      {/* ── Mobile Tab Pills ── */}
      <div className="settings-mobile-tabs">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`settings-tab-pill ${isActive ? "active" : ""}`}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setShowSignOutModal(true)}
          className="settings-tab-pill"
          style={{ color: "#f87171", borderColor: "rgba(239, 68, 68, 0.3)" }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* ── Main Two-Column Grid ── */}
      <div className="settings-grid">
        {/* LEFT: Settings Navigation */}
        <aside className="settings-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`settings-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="settings-nav-divider" />

          <button
            onClick={() => setShowSignOutModal(true)}
            className="settings-nav-item danger"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* RIGHT: Active Content Area */}
        <main className="settings-content">
          {/* =========================================================
              SECTION 1: ACCOUNT
          ========================================================= */}
          {activeTab === "account" && (
            <>
              {/* Profile Summary Card */}
              <div className="profile-summary-card">
                <div className="profile-identity-group">
                  <div className="profile-avatar-circle">
                    {profName
                      ? profName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "AD"}
                  </div>
                  <div>
                    <h2 className="profile-name-text">{profName}</h2>
                    <div className="profile-email-text">{profEmail}</div>
                    <span className="profile-badge-pill">
                      Personal FitOS Account
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(true)}
                  className="btn-primary"
                >
                  <Edit3 size={14} /> Edit Profile
                </button>
              </div>

              {/* Account Details Box */}
              <div className="settings-box">
                <div className="settings-box-title">Account Details</div>
                <div className="settings-box-desc">Overview of your registered FitOS athlete credentials.</div>

                <div className="settings-kv-table">
                  <div className="settings-kv-row">
                    <span className="settings-kv-label">Full Name</span>
                    <span className="settings-kv-value">{profName}</span>
                  </div>
                  <div className="settings-kv-row">
                    <span className="settings-kv-label">Email Address</span>
                    <span className="settings-kv-value">{profEmail}</span>
                  </div>
                  <div className="settings-kv-row">
                    <span className="settings-kv-label">Account Status</span>
                    <span className="settings-kv-value" style={{ color: "#4ade80" }}>Active</span>
                  </div>
                  <div className="settings-kv-row">
                    <span className="settings-kv-label">Client Build</span>
                    <span className="settings-kv-value">FitOS v{APP_VERSION}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =========================================================
              SECTION 2: PROFILE
          ========================================================= */}
          {activeTab === "profile" && (
            <div className="settings-box">
              <div className="settings-box-title">Athlete Profile</div>
              <div className="settings-box-desc">Configure your physical parameters and primary athletic objectives.</div>

              {profileSuccessMsg && (
                <div className="alert-banner-success" style={{ marginBottom: 18 }}>
                  <CheckCircle2 size={16} /> {profileSuccessMsg}
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                <div className="field-grid-3" style={{ marginBottom: 18 }}>
                  <div className="field-group">
                    <label className="field-label">Full Name</label>
                    <input
                      type="text"
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      required
                      className="field-input"
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Age (years)</label>
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={profAge}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setProfAge(val);
                        setCalcAge(val);
                      }}
                      required
                      className="field-input"
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Gender / Biological Sex</label>
                    <select
                      value={profGender}
                      onChange={(e) => {
                        setProfGender(e.target.value);
                        if (e.target.value.toLowerCase() === "female") setCalcSex("female");
                        else setCalcSex("male");
                      }}
                      className="field-input"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other / Non-Binary</option>
                    </select>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Height (cm)</label>
                    <input
                      type="number"
                      min={50}
                      max={260}
                      value={profHeight}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setProfHeight(val);
                        setCalcHeight(val);
                      }}
                      required
                      className="field-input"
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min={20}
                      max={350}
                      value={profWeight}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setProfWeight(val);
                        setCalcWeight(val);
                      }}
                      required
                      className="field-input"
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Daily Step Goal</label>
                    <input
                      type="number"
                      step={500}
                      min={1000}
                      max={60000}
                      value={profStepGoal}
                      onChange={(e) => setProfStepGoal(Number(e.target.value))}
                      required
                      className="field-input"
                    />
                  </div>
                </div>

                {/* Primary Fitness Goal Cards */}
                <div style={{ marginBottom: 22 }}>
                  <label className="field-label" style={{ marginBottom: 10, display: "block" }}>
                    Primary Fitness Goal
                  </label>
                  <div className="goal-cards-grid">
                    {[
                      { id: "Build Muscle", label: "Build Muscle", desc: "Hypertrophy & progressive overload" },
                      { id: "Fat Loss", label: "Fat Loss", desc: "Caloric deficit & metabolic conditioning" },
                      { id: "Maintain Weight", label: "Maintain Weight", desc: "Energy balance & steady fitness" },
                      { id: "Improve Fitness", label: "Improve Fitness", desc: "Cardio stamina & mobility" },
                    ].map((g) => {
                      const isSelected = profGoal === g.id;
                      return (
                        <div
                          key={g.id}
                          onClick={() => setProfGoal(g.id)}
                          className={`goal-card-option ${isSelected ? "selected" : ""}`}
                        >
                          <div className="goal-card-header">
                            <span className="goal-card-title">{g.label}</span>
                            {isSelected && <Check size={14} color="#22c55e" />}
                          </div>
                          <span className="goal-card-desc">{g.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={savingProfile}
                  >
                    {savingProfile ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================
              SECTION 3: NUTRITION & FITNESS
          ========================================================= */}
          {activeTab === "nutrition" && (
            <>
              {/* Active Nutrition Targets Card */}
              <div className="settings-box">
                <div className="settings-box-title">Daily Nutrition Targets</div>
                <div className="settings-box-desc">Customize your active baseline macro targets. Dashboards sync automatically.</div>

                <div className="macro-kpi-grid">
                  <div className="macro-kpi-pill" style={{ borderLeft: "3px solid #4ade80" }}>
                    <span className="kpi-label">Calories</span>
                    <span className="kpi-val" style={{ color: "#4ade80" }}>{calorieGoal} kcal</span>
                  </div>
                  <div className="macro-kpi-pill" style={{ borderLeft: "3px solid #38bdf8" }}>
                    <span className="kpi-label">Protein</span>
                    <span className="kpi-val" style={{ color: "#38bdf8" }}>{proteinGoal}g</span>
                  </div>
                  <div className="macro-kpi-pill" style={{ borderLeft: "3px solid #f59e0b" }}>
                    <span className="kpi-label">Carbs</span>
                    <span className="kpi-val" style={{ color: "#f59e0b" }}>{carbGoal}g</span>
                  </div>
                  <div className="macro-kpi-pill" style={{ borderLeft: "3px solid #f43f5e" }}>
                    <span className="kpi-label">Fats</span>
                    <span className="kpi-val" style={{ color: "#f43f5e" }}>{fatGoal}g</span>
                  </div>
                </div>

                {goalsError && (
                  <div className="alert-banner-error" style={{ marginBottom: 16 }}>
                    <AlertTriangle size={15} /> {goalsError}
                  </div>
                )}

                {goalsMessage && (
                  <div className="alert-banner-success" style={{ marginBottom: 16 }}>
                    <CheckCircle2 size={15} /> {goalsMessage}
                  </div>
                )}

                <form onSubmit={handleSaveNutritionGoals}>
                  <div className="field-grid-3" style={{ marginBottom: 18 }}>
                    <div className="field-group">
                      <label className="field-label">Calories (kcal)</label>
                      <input
                        type="number"
                        min={500}
                        value={calorieGoal}
                        onChange={(e) => setCalorieGoal(e.target.value)}
                        required
                        className="field-input"
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Protein (g)</label>
                      <input
                        type="number"
                        min={10}
                        value={proteinGoal}
                        onChange={(e) => setProteinGoal(e.target.value)}
                        required
                        className="field-input"
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Carbs (g)</label>
                      <input
                        type="number"
                        min={10}
                        value={carbGoal}
                        onChange={(e) => setCarbGoal(e.target.value)}
                        required
                        className="field-input"
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Fats (g)</label>
                      <input
                        type="number"
                        min={5}
                        value={fatGoal}
                        onChange={(e) => setFatGoal(e.target.value)}
                        required
                        className="field-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={savingGoals}
                    >
                      {savingGoals ? "Saving..." : "Save Nutrition Targets"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Science-Based TDEE Calculator Card */}
              <div className="settings-box">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: "rgba(34, 197, 94, 0.12)",
                      color: "#4ade80",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Calculator size={16} />
                  </div>
                  <div className="settings-box-title" style={{ margin: 0 }}>
                    Science-Based TDEE &amp; Macro Calculator
                  </div>
                </div>
                <div className="settings-box-desc">Mifflin-St Jeor metabolic equations with dynamic macronutrient partitioning.</div>

                {tdeeAppliedMsg && (
                  <div className="alert-banner-success" style={{ marginBottom: 16 }}>
                    <CheckCircle2 size={15} /> {tdeeAppliedMsg}
                  </div>
                )}

                <div className="field-grid-3" style={{ marginBottom: 16 }}>
                  <div className="field-group">
                    <label className="field-label">Biological Sex</label>
                    <select
                      value={calcSex}
                      onChange={(e) => setCalcSex(e.target.value as any)}
                      className="field-input"
                    >
                      <option value="male">Male (+5 kcal)</option>
                      <option value="female">Female (-161 kcal)</option>
                    </select>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Age (years)</label>
                    <input
                      type="number"
                      value={calcAge}
                      onChange={(e) => setCalcAge(Number(e.target.value))}
                      className="field-input"
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(Number(e.target.value))}
                      className="field-input"
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Height (cm)</label>
                    <input
                      type="number"
                      value={calcHeight}
                      onChange={(e) => setCalcHeight(Number(e.target.value))}
                      className="field-input"
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Activity Level</label>
                    <select
                      value={calcActivity}
                      onChange={(e) => setCalcActivity(Number(e.target.value))}
                      className="field-input"
                    >
                      <option value={1.2}>Sedentary (1.2x)</option>
                      <option value={1.375}>Lightly Active (1.375x)</option>
                      <option value={1.55}>Moderately Active (1.55x)</option>
                      <option value={1.725}>Very Active (1.725x)</option>
                      <option value={1.9}>Extra Active (1.9x)</option>
                    </select>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Caloric Strategy</label>
                    <select
                      value={calcGoalOffset}
                      onChange={(e) => setCalcGoalOffset(Number(e.target.value))}
                      className="field-input"
                    >
                      <option value={-500}>Aggressive Cut (-500 kcal)</option>
                      <option value={-300}>Moderate Cut (-300 kcal)</option>
                      <option value={0}>Maintenance (0 kcal)</option>
                      <option value={250}>Lean Muscle (+250 kcal)</option>
                      <option value={500}>Hypertrophy (+500 kcal)</option>
                    </select>
                  </div>
                </div>

                <div
                  style={{
                    background: "#0c120e",
                    borderRadius: 10,
                    border: "1px solid #1a231d",
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 12, marginBottom: 12 }}>
                    <div>
                      <span className="field-label">Basal BMR</span>
                      <strong style={{ fontSize: 13, color: "#f1f5f9" }}>{tdeeCalc.bmr} kcal</strong>
                    </div>
                    <div>
                      <span className="field-label">Maintenance</span>
                      <strong style={{ fontSize: 13, color: "#f1f5f9" }}>{tdeeCalc.tdee} kcal</strong>
                    </div>
                    <div>
                      <span className="field-label">Target Calories</span>
                      <strong style={{ fontSize: 15, color: "#4ade80" }}>{tdeeCalc.targetCalories} kcal</strong>
                    </div>
                    <div>
                      <span className="field-label">Protein (2g/kg)</span>
                      <strong style={{ fontSize: 13, color: "#38bdf8" }}>{tdeeCalc.targetProtein}g</strong>
                    </div>
                    <div>
                      <span className="field-label">Carbs</span>
                      <strong style={{ fontSize: 13, color: "#f59e0b" }}>{tdeeCalc.targetCarbs}g</strong>
                    </div>
                    <div>
                      <span className="field-label">Fats</span>
                      <strong style={{ fontSize: 13, color: "#f43f5e" }}>{tdeeCalc.targetFats}g</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={handleApplyTDEETargets}
                      disabled={savingTDEE}
                      className="btn-primary"
                    >
                      <Check size={14} /> {savingTDEE ? "Applying..." : "Apply Targets"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =========================================================
              SECTION 4: NOTIFICATIONS
          ========================================================= */}
          {activeTab === "notifications" && (
            <div className="settings-box">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div className="settings-box-title">Notification Preferences</div>
                  <div className="settings-box-desc" style={{ margin: 0 }}>
                    Manage workout cues, nutrition logging alerts, and automated coach insights.
                  </div>
                </div>
                {notifSavedToast && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 9999,
                      background: "rgba(34, 197, 94, 0.12)",
                      color: "#4ade80",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Check size={12} /> Saved
                  </span>
                )}
              </div>

              <div className="settings-switch-row">
                <div className="settings-switch-info">
                  <span className="settings-switch-title">Workout Reminders</span>
                  <span className="settings-switch-desc">
                    Get reminded about scheduled workouts, routine milestones, and rest timer intervals
                  </span>
                </div>
                <div
                  className={`toggle-switch ${notifs.workoutReminders ? "active" : ""}`}
                  onClick={() => handleToggleNotif("workoutReminders")}
                >
                  <div className="toggle-thumb" />
                </div>
              </div>

              <div className="settings-switch-row">
                <div className="settings-switch-info">
                  <span className="settings-switch-title">Nutrition Reminders</span>
                  <span className="settings-switch-desc">
                    Get reminders to log meals, hit daily protein targets, and track hydration
                  </span>
                </div>
                <div
                  className={`toggle-switch ${notifs.nutritionReminders ? "active" : ""}`}
                  onClick={() => handleToggleNotif("nutritionReminders")}
                >
                  <div className="toggle-thumb" />
                </div>
              </div>

              <div className="settings-switch-row">
                <div className="settings-switch-info">
                  <span className="settings-switch-title">Step Reminders</span>
                  <span className="settings-switch-desc">
                    Hourly movement nudges to maintain activity levels and reach your step goal
                  </span>
                </div>
                <div
                  className={`toggle-switch ${notifs.stepReminders ? "active" : ""}`}
                  onClick={() => handleToggleNotif("stepReminders")}
                >
                  <div className="toggle-thumb" />
                </div>
              </div>

              <div className="settings-switch-row">
                <div className="settings-switch-info">
                  <span className="settings-switch-title">Progress Updates</span>
                  <span className="settings-switch-desc">
                    Weekly performance summaries, PR notifications, and body composition trends
                  </span>
                </div>
                <div
                  className={`toggle-switch ${notifs.progressUpdates ? "active" : ""}`}
                  onClick={() => handleToggleNotif("progressUpdates")}
                >
                  <div className="toggle-thumb" />
                </div>
              </div>

              <div className="settings-switch-row">
                <div className="settings-switch-info">
                  <span className="settings-switch-title">AI Coach Insights</span>
                  <span className="settings-switch-desc">
                    Receive automated proactive coaching recommendations and recovery tips
                  </span>
                </div>
                <div
                  className={`toggle-switch ${notifs.aiCoachInsights ? "active" : ""}`}
                  onClick={() => handleToggleNotif("aiCoachInsights")}
                >
                  <div className="toggle-thumb" />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              SECTION 5: APPEARANCE
          ========================================================= */}
          {activeTab === "appearance" && (
            <>
              <div className="settings-box">
                <div className="settings-box-title">Theme &amp; Visual Style</div>
                <div className="settings-box-desc">Customize interface theme, accent hues, and application ergonomics.</div>

                <div style={{ marginBottom: 20 }}>
                  <label className="field-label" style={{ marginBottom: 8, display: "block" }}>
                    Interface Theme
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                    {[
                      { id: "dark" as const, label: "Dark Mode", desc: "FitOS Obsidian", icon: Moon },
                      { id: "light" as const, label: "Light Mode", desc: "Daylight Slate", icon: Sun },
                      { id: "system" as const, label: "System", desc: "Follow OS", icon: Monitor },
                    ].map((t) => {
                      const Icon = t.icon;
                      const isSelected = themeMode === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => handleThemeModeChange(t.id)}
                          style={{
                            padding: "12px 14px",
                            borderRadius: 10,
                            background: isSelected ? "rgba(34, 197, 94, 0.08)" : "#0c120e",
                            border: isSelected ? "2px solid #22c55e" : "1px solid #1a231d",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <Icon size={16} color={isSelected ? "#4ade80" : "#8a968f"} />
                          <div>
                            <strong style={{ fontSize: 13, color: "#ffffff", display: "block" }}>{t.label}</strong>
                            <span style={{ fontSize: 11, color: "#8a968f" }}>{t.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="field-label" style={{ marginBottom: 8, display: "block" }}>
                    Accent Color
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
                    {ACCENT_COLORS.map((acc) => {
                      const isSelected = accentColor === acc.id;
                      return (
                        <div
                          key={acc.id}
                          onClick={() => handleAccentChange(acc.id)}
                          style={{
                            padding: "9px 12px",
                            background: isSelected ? "rgba(255, 255, 255, 0.05)" : "#0c120e",
                            border: isSelected ? `2px solid ${acc.color}` : "1px solid #1a231d",
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: acc.color,
                            }}
                          />
                          <strong style={{ fontSize: 12.5, color: "#ffffff" }}>{acc.name}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="settings-switch-row">
                  <div className="settings-switch-info">
                    <span className="settings-switch-title">Compact Mode</span>
                    <span className="settings-switch-desc">Condense spacing and card dimensions for maximum information density</span>
                  </div>
                  <div
                    className={`toggle-switch ${compactMode ? "active" : ""}`}
                    onClick={toggleCompactMode}
                  >
                    <div className="toggle-thumb" />
                  </div>
                </div>

                <div className="settings-switch-row">
                  <div className="settings-switch-info">
                    <span className="settings-switch-title">UI Animations</span>
                    <span className="settings-switch-desc">Enable smooth page transitions and celebratory particle effects</span>
                  </div>
                  <div
                    className={`toggle-switch ${animationsEnabled ? "active" : ""}`}
                    onClick={toggleAnimations}
                  >
                    <div className="toggle-thumb" />
                  </div>
                </div>

                <div className="settings-switch-row">
                  <div className="settings-switch-info">
                    <span className="settings-switch-title">Reduced Motion</span>
                    <span className="settings-switch-desc">Turn off rapid interface animations for accessibility</span>
                  </div>
                  <div
                    className={`toggle-switch ${reducedMotion ? "active" : ""}`}
                    onClick={toggleReducedMotion}
                  >
                    <div className="toggle-thumb" />
                  </div>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="settings-box">
                <div className="settings-box-title">Audio FX &amp; Voice Synthesis</div>
                <div className="settings-box-desc">Rest timer countdown beeps, PR celebration fanfares, and audio cues.</div>

                <div className="settings-switch-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: soundEnabled ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
                        color: soundEnabled ? "#4ade80" : "#f87171",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </div>
                    <div className="settings-switch-info">
                      <span className="settings-switch-title">Workout Sound Effects</span>
                      <span className="settings-switch-desc">Enable audio beeps during rest intervals and timer ticks</span>
                    </div>
                  </div>
                  <div
                    className={`toggle-switch ${soundEnabled ? "active" : ""}`}
                    onClick={toggleSound}
                  >
                    <div className="toggle-thumb" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =========================================================
              SECTION 6: SECURITY
          ========================================================= */}
          {activeTab === "security" && (
            <>
              <div className="settings-box">
                <div className="settings-box-title">Password &amp; Security</div>
                <div className="settings-box-desc">Manage your authentication credentials and session access.</div>

                <div className="settings-switch-row">
                  <div className="settings-switch-info">
                    <span className="settings-switch-title">Account Password</span>
                    <span className="settings-switch-desc">Manage your password to protect access to FitOS metrics</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPwError(null);
                      setPwSuccess(null);
                      setShowChangePasswordModal(true);
                    }}
                    className="btn-secondary"
                  >
                    <KeyRound size={14} /> Change Password
                  </button>
                </div>
              </div>

              {/* Active Session Card */}
              <div className="settings-box">
                <div className="settings-box-title">Active Sessions</div>
                <div className="settings-box-desc">Devices currently authenticated to your FitOS profile.</div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 14px",
                    background: "#0c120e",
                    borderRadius: 10,
                    border: "1px solid #1a231d",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 6,
                        background: "rgba(34, 197, 94, 0.12)",
                        color: "#4ade80",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Laptop size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: 13, color: "#ffffff", display: "block" }}>
                        Your account is currently signed in on this device.
                      </strong>
                      <span style={{ fontSize: 11, color: "#8a968f" }}>
                        Current Browser Session • Active Local Client
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 9999,
                      background: "rgba(34, 197, 94, 0.12)",
                      color: "#4ade80",
                      border: "1px solid rgba(34, 197, 94, 0.25)",
                    }}
                  >
                    Active Now
                  </span>
                </div>
              </div>
            </>
          )}

          {/* =========================================================
              SECTION 7: PRIVACY & DATA (+ DANGER ZONE)
          ========================================================= */}
          {activeTab === "privacy" && (
            <>
              <div className="settings-box">
                <div className="settings-box-title">Your Data &amp; Exports</div>
                <div className="settings-box-desc">Download your complete training logs, nutrition history, and metrics in open formats.</div>

                {exportError && (
                  <div className="alert-banner-error" style={{ marginBottom: 16 }}>
                    <AlertTriangle size={15} /> {exportError}
                  </div>
                )}

                {exportSuccess && (
                  <div className="alert-banner-success" style={{ marginBottom: 16 }}>
                    <CheckCircle2 size={15} /> {exportSuccess}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    {
                      id: "workout",
                      label: "Workout History CSV",
                      desc: "All exercises, sets, reps and volume in spreadsheet format",
                      icon: Dumbbell,
                      fn: exportWorkoutCSV,
                    },
                    {
                      id: "nutrition",
                      label: "Nutrition Log CSV",
                      desc: "Every meal with calories and macros logged",
                      icon: Footprints,
                      fn: exportNutritionCSV,
                    },
                    {
                      id: "weight",
                      label: "Weight History CSV",
                      desc: "All body-weight weigh-ins over time",
                      icon: Scale,
                      fn: exportWeightCSV,
                    },
                  ].map((btn) => {
                    const Icon = btn.icon;
                    const isBusy = exporting === btn.id;
                    return (
                      <div
                        key={btn.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 14px",
                          background: "#0c120e",
                          borderRadius: 8,
                          border: "1px solid #1a231d",
                          flexWrap: "wrap",
                          gap: 12,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 6,
                              background: "rgba(34, 197, 94, 0.12)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#4ade80",
                            }}
                          >
                            <Icon size={15} />
                          </div>
                          <div>
                            <strong style={{ fontSize: 13, color: "#ffffff", display: "block" }}>
                              {btn.label}
                            </strong>
                            <span style={{ fontSize: 11, color: "#8a968f" }}>{btn.desc}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleExport(btn.label, btn.fn)}
                          disabled={isBusy}
                          style={{ padding: "6px 12px", fontSize: 12 }}
                        >
                          <Download size={13} /> {isBusy ? "Exporting..." : "Export CSV"}
                        </button>
                      </div>
                    );
                  })}

                  {/* JSON Backup */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      background: "#0c120e",
                      borderRadius: 8,
                      border: "1px solid #1a231d",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 6,
                          background: "rgba(14, 165, 233, 0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#38bdf8",
                        }}
                      >
                        <Database size={15} />
                      </div>
                      <div>
                        <strong style={{ fontSize: 13, color: "#ffffff", display: "block" }}>
                          Full FitOS JSON Backup
                        </strong>
                        <span style={{ fontSize: 11, color: "#8a968f" }}>
                          Complete archive of profile metrics, goals, and system configurations
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleExportJSON}
                      disabled={exporting === "json"}
                      style={{ padding: "6px 12px", fontSize: 12 }}
                    >
                      <Download size={13} /> {exporting === "json" ? "Exporting..." : "Export JSON"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="danger-zone-box">
                <div className="danger-zone-head">
                  <Trash2 size={16} /> Danger Zone
                </div>
                <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#8a968f", lineHeight: 1.4 }}>
                  Irreversible account operations. Deleting your account will permanently wipe your workout records, nutrition entries, and personal records.
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                    paddingTop: 12,
                    borderTop: "1px solid rgba(239, 68, 68, 0.15)",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 13, color: "#ef4444", display: "block" }}>
                      Delete FitOS Account
                    </strong>
                    <span style={{ fontSize: 11, color: "#8a968f" }}>
                      Permanently remove all profile data and credentials
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmText("");
                      setShowDeleteAccountModal(true);
                    }}
                    className="btn-danger"
                  >
                    <Trash2 size={14} /> Delete Account
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* =========================================================
          MODAL 1: EDIT PROFILE MODAL
      ========================================================= */}
      {showEditProfileModal && (
        <div className="modal-backdrop" onClick={() => setShowEditProfileModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#ffffff" }}>
                Edit Profile Information
              </h2>
              <button
                onClick={() => setShowEditProfileModal(false)}
                style={{ background: "transparent", border: "none", color: "#8a968f", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
                <div className="field-group">
                  <label className="field-label">Display Name</label>
                  <input
                    type="text"
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    required
                    className="field-input"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Email Address</label>
                  <input
                    type="email"
                    value={profEmail}
                    onChange={(e) => setProfEmail(e.target.value)}
                    required
                    className="field-input"
                  />
                </div>

                <div className="field-grid-2">
                  <div className="field-group">
                    <label className="field-label">Age (years)</label>
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={profAge}
                      onChange={(e) => setProfAge(Number(e.target.value))}
                      required
                      className="field-input"
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Gender</label>
                    <select
                      value={profGender}
                      onChange={(e) => setProfGender(e.target.value)}
                      className="field-input"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="field-grid-2">
                  <div className="field-group">
                    <label className="field-label">Height (cm)</label>
                    <input
                      type="number"
                      min={50}
                      max={260}
                      value={profHeight}
                      onChange={(e) => setProfHeight(Number(e.target.value))}
                      required
                      className="field-input"
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min={20}
                      max={350}
                      value={profWeight}
                      onChange={(e) => setProfWeight(Number(e.target.value))}
                      required
                      className="field-input"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary"
                >
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: CHANGE PASSWORD MODAL
      ========================================================= */}
      {showChangePasswordModal && (
        <div className="modal-backdrop" onClick={() => setShowChangePasswordModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#ffffff" }}>
                Update Account Password
              </h2>
              <button
                onClick={() => setShowChangePasswordModal(false)}
                style={{ background: "transparent", border: "none", color: "#8a968f", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            {pwError && (
              <div className="alert-banner-error" style={{ marginBottom: 14 }}>
                <AlertTriangle size={15} /> {pwError}
              </div>
            )}

            {pwSuccess && (
              <div className="alert-banner-success" style={{ marginBottom: 14 }}>
                <CheckCircle2 size={15} /> {pwSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
                <div className="field-group">
                  <label className="field-label">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="field-input"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="field-input"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="field-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="btn-primary"
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: SIGN OUT CONFIRMATION
      ========================================================= */}
      {showSignOutModal && (
        <div className="modal-backdrop" onClick={() => setShowSignOutModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "rgba(239, 68, 68, 0.12)",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LogOut size={18} />
              </div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#ffffff" }}>
                Sign out of FitOS?
              </h2>
            </div>

            <p style={{ margin: "0 0 18px", fontSize: 13, color: "#8a968f", lineHeight: 1.4 }}>
              You will need to sign back in to access your workout metrics, nutrition history, and AI insights. You can sign back in anytime.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSignOut}
                className="btn-danger"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: DELETE ACCOUNT CONFIRMATION
      ========================================================= */}
      {showDeleteAccountModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteAccountModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "rgba(239, 68, 68, 0.12)",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trash2 size={18} />
              </div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#ef4444" }}>
                Delete FitOS Account?
              </h2>
            </div>

            <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#8a968f", lineHeight: 1.4 }}>
              This action <strong>cannot be undone</strong>. All your workout history, nutrition logs, personal records, and telemetry will be permanently deleted.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label className="field-label" style={{ color: "#ef4444" }}>
                Type DELETE to confirm:
              </label>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="field-input"
                style={{ borderColor: deleteConfirmText === "DELETE" ? "#ef4444" : undefined }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAccount}
                disabled={deleteConfirmText.trim() !== "DELETE"}
                className="btn-danger"
                style={{
                  opacity: deleteConfirmText.trim() !== "DELETE" ? 0.4 : 1,
                  cursor: deleteConfirmText.trim() !== "DELETE" ? "not-allowed" : "pointer",
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
