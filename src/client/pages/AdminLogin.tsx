import React, { useState } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ApiClientError } from "@/lib/api";
import { Droplets, Lock, User, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Already logged in → go to requested URL or admin dashboard
  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.root}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        {/* Brand */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>
            <Droplets size={28} color="#fff" />
          </div>
          <div>
            <div style={styles.brandName}>Shetkari Raja</div>
            <div style={styles.brandSub}>Admin Portal</div>
          </div>
        </div>

        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to manage your shop</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Username */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Email or Username</label>
            <div style={styles.inputWrap}>
              <User size={16} style={styles.inputIcon} />
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@example.com"
                required
                autoFocus
                autoComplete="username"
                style={styles.input}
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                autoComplete="current-password"
                style={{ ...styles.input, paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={styles.eyeBtn}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Submit */}
          <button
            id="admin-login-submit"
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in…" : "Sign In to Admin Panel"}
          </button>
        </form>

        <p style={styles.footer}>
          <a href="/" style={styles.footerLink}>← Back to public website</a>
        </p>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px);} to { opacity:1; transform:translateY(0);} }
        #admin-username:focus, #admin-password:focus {
          outline: none;
          border-color: #16a34a !important;
          box-shadow: 0 0 0 3px rgba(22,163,74,0.2) !important;
        }
        #admin-login-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(22,163,74,0.4) !important;
        }
        #admin-login-submit:active:not(:disabled) { transform: translateY(0); }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a 0%, #1a2e1a 50%, #0f172a 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', 'Outfit', sans-serif",
    padding: "1rem",
  },
  blob1: {
    position: "absolute", top: "-120px", right: "-120px",
    width: "400px", height: "400px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(22,163,74,0.25) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute", bottom: "-100px", left: "-100px",
    width: "350px", height: "350px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "1.5rem",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
    animation: "fadeIn 0.4s ease-out both",
    position: "relative",
    zIndex: 1,
  },
  logoWrap: { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" },
  logoIcon: {
    width: "48px", height: "48px", borderRadius: "12px",
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 12px rgba(22,163,74,0.4)", flexShrink: 0,
  },
  brandName: { color: "#fff", fontWeight: 700, fontSize: "1.1rem", lineHeight: 1.2 },
  brandSub: {
    color: "#86efac", fontSize: "0.72rem", fontWeight: 500,
    letterSpacing: "0.06em", textTransform: "uppercase",
  },
  title: { color: "#fff", fontSize: "1.55rem", fontWeight: 700, margin: "0 0 0.25rem 0" },
  subtitle: { color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", margin: "0 0 2rem 0" },
  form: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  fieldWrap: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { color: "rgba(255,255,255,0.65)", fontSize: "0.84rem", fontWeight: 500 },
  inputWrap: { position: "relative" },
  inputIcon: {
    position: "absolute", left: "0.85rem", top: "50%",
    transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "0.75rem 0.85rem 0.75rem 2.5rem",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "0.75rem",
    color: "#fff",
    fontSize: "0.95rem",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  eyeBtn: {
    position: "absolute", right: "0.85rem", top: "50%",
    transform: "translateY(-50%)",
    background: "none", border: "none",
    color: "rgba(255,255,255,0.4)", cursor: "pointer",
    padding: 0, display: "flex", alignItems: "center",
  },
  errorBox: {
    background: "rgba(239,68,68,0.13)",
    border: "1px solid rgba(239,68,68,0.28)",
    borderRadius: "0.6rem",
    color: "#fca5a5",
    padding: "0.65rem 0.85rem",
    fontSize: "0.875rem",
    display: "flex", gap: "0.5rem", alignItems: "center",
  },
  submitBtn: {
    width: "100%", padding: "0.85rem",
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    color: "#fff", border: "none", borderRadius: "0.75rem",
    fontSize: "0.95rem", fontWeight: 600,
    transition: "transform 0.2s, box-shadow 0.2s, opacity 0.2s",
    boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
    marginTop: "0.25rem",
  },
  footer: { textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem" },
  footerLink: { color: "rgba(255,255,255,0.35)", textDecoration: "none" },
};
