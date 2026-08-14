import { useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

interface LoginProps {
  onSwitchToSignup: () => void;
}

function Login({ onSwitchToSignup }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 400, margin: "80px auto" }}>
      <div className="page-header">
        <h1>Welcome back</h1>
        <p>Log in to FitOS</p>
      </div>

      <form className="page-card" onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 10, marginTop: 6, borderRadius: 8 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 10, marginTop: 6, borderRadius: 8 }}
          />
        </div>

        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        <button className="primary-button" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p style={{ marginTop: 16, textAlign: "center" }}>
          Don't have an account?{" "}
          <a onClick={onSwitchToSignup} style={{ cursor: "pointer", color: "#4ade80" }}>
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}

export default Login;
