import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Scissors, Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAppPreferences } from "../context/AppPreferences";
import { t } from "../i18n/translations";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { language } = useAppPreferences();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.register({ name, email, password });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to register");
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
      background: "linear-gradient(135deg, #fdf4ff 0%, #e0e7ff 50%, #f0fdf4 100%)",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: "-10%", left: "-5%", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          width: "100%", maxWidth: 440,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(24px)",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.04)",
          padding: "40px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px rgba(139,92,246,0.35)",
          }}>
            <Scissors size={24} color="white" />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", marginBottom: 6 }}>
            {t(language, "signUp")}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
            Join BarberBook and book your style
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: 6 }}>Full Name</label>
            <div style={{ position: "relative" }}>
              <UserIcon size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input type="text" placeholder="John Smith" value={name} onChange={(e) => setName(e.target.value)} required className="premium-input" style={{ paddingLeft: 42 }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: 6 }}>Email address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="premium-input" style={{ paddingLeft: 42 }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input type={showPassword ? "text" : "password"} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required className="premium-input" style={{ paddingLeft: 42, paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <motion.button type="submit" disabled={loading} className="btn-primary" whileTap={{ scale: 0.98 }} style={{ width: "100%", marginTop: 8, height: 48, fontSize: "1rem" }}>
            {loading ? (
              <div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            ) : (
              <>{t(language, "signUp")} <ArrowRight size={18} /></>
            )}
          </motion.button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
          <div style={{ flexGrow: 1, height: 1, background: "#f3f4f6" }} />
          <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>or</span>
          <div style={{ flexGrow: 1, height: 1, background: "#f3f4f6" }} />
        </div>

        <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#6366f1", fontWeight: 600 }}>Sign in</Link>
        </p>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
