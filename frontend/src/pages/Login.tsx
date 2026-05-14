import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Scissors, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAppPreferences } from "../context/AppPreferences";
import { t } from "../i18n/translations";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { language } = useAppPreferences();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      const user = await api.getMe(data.access_token);
      login(data.access_token, user);
      toast.success("Welcome back!");
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "barber") navigate("/barber");
      else navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #fdf4ff 100%)",
      padding: "24px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: "absolute", top: "-15%", right: "-10%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", left: "-10%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          width: "100%", maxWidth: 440,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(24px)",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.04)",
          padding: "40px",
          position: "relative"
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px rgba(99,102,241,0.35)"
          }}>
            <Scissors size={24} color="white" />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", marginBottom: 6 }}>
            {t(language, "signIn")}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
            Sign in to your BarberBook account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: 6 }}>
              Email address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="premium-input"
                style={{ paddingLeft: 42 }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="premium-input"
                style={{ paddingLeft: 42, paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex" }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className="btn-primary"
            whileTap={{ scale: 0.98 }}
            style={{ width: "100%", marginTop: 8, height: 48, fontSize: "1rem" }}
          >
            {loading ? (
              <div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            ) : (
              <>{t(language, "signIn")} <ArrowRight size={18} /></>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
          <div style={{ flexGrow: 1, height: 1, background: "#f3f4f6" }} />
          <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>or</span>
          <div style={{ flexGrow: 1, height: 1, background: "#f3f4f6" }} />
        </div>

        <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.9rem" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#6366f1", fontWeight: 600 }}>
            Create one
          </Link>
        </p>

        {/* Demo hint */}
        <div style={{
          marginTop: 20, padding: "12px 16px", borderRadius: 12,
          background: "#f0f9ff", border: "1px solid #bae6fd"
        }}>
          <p style={{ fontSize: "0.78rem", color: "#0369a1", margin: 0, textAlign: "center" }}>
            <strong>Demo:</strong> user@gmail.com / user123 &nbsp;|&nbsp; barber@gmail.com / barber123 &nbsp;|&nbsp; admin@gmail.com / admin123
          </p>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
