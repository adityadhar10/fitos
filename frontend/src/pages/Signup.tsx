import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

interface SignupProps {
  onSwitchToLogin: () => void;
}

function Signup({ onSwitchToLogin }: SignupProps) {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 400, margin: "80px auto" }}>
      <div className="page-header">
        <h1>Create account</h1>
        <p>Get started with FitOS</p>
      </div>

      <form className="page-card" onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: 10, marginTop: 6, borderRadius: 8 }}
          />
        </div>

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
            minLength={6}
            style={{ width: "100%", padding: 10, marginTop: 6, borderRadius: 8 }}
          />
        </div>

        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        <button className="primary-button" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p style={{ marginTop: 16, textAlign: "center" }}>
          Already have an account?{" "}
          <a onClick={onSwitchToLogin} style={{ cursor: "pointer", color: "#4ade80" }}>
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}

export default Signup;
