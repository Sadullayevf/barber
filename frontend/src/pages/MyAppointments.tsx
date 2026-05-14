import { useEffect, useState } from "react";
import { t } from "../i18n/translations";
import { useAuth } from "../context/AuthContext";
import { useAppPreferences } from "../context/AppPreferences";
import { api, Booking } from "../services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle2, XCircle, CalendarX, AlertCircle, Scissors } from "lucide-react";

const CANCEL_REASONS = [
  "conflict",
  "anotherBarber",
  "plansChanged",
  "notSuitable",
  "other",
];

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending:   { key: "pending",   icon: Clock,         cls: "badge badge-pending" },
    confirmed: { key: "confirmed", icon: CheckCircle2,  cls: "badge badge-confirmed" },
    cancelled: { key: "cancelled", icon: XCircle,       cls: "badge badge-cancelled" },
  }[status] ?? { key: status, icon: AlertCircle, cls: "badge" };

  const { language } = useAppPreferences();

  const Icon = config.icon;
  return (
    <span className={config.cls}>
      <Icon size={10} />
      {t(language, config.key)}
    </span>
  );
}

export default function MyAppointments() {
  const { token } = useAuth();
  const { theme, language } = useAppPreferences();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const dark = theme === "dark";
  const bg = dark ? "#0a0a0f" : "#f8fafc";
  const cardBg = dark ? "#111827" : "#ffffff";
  const cardBorder = dark ? "#1f2937" : "#f3f4f6";
  const textPrimary = dark ? "#f9fafb" : "#111827";
  const textMuted = dark ? "#6b7280" : "#6b7280";

  const load = async () => {
    if (!token) return;
    try {
      const data = await api.getBookings(token);
      setBookings(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [token]);

  const submitCancel = async () => {
    if (!token || !cancelTarget || !cancelReason) { toast.error("Please select a reason"); return; }
    try {
      await api.cancelBooking(cancelTarget, cancelReason, token);
      toast.success("Booking cancelled");
      setCancelTarget(null);
      setCancelReason("");
      load();
    } catch (err: any) { toast.error(err.message || "Failed to cancel"); }
  };

  const upcoming = bookings.filter(b => b.status !== "cancelled");
  const cancelled = bookings.filter(b => b.status === "cancelled");

  return (
    <div style={{ minHeight: "100vh", background: bg, paddingTop: 80 }}>
      <div style={{ maxWidth: 840, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: textPrimary, letterSpacing: "-0.04em", marginBottom: 6 }}>{t(language, "myBookings")}</h1>
          <p style={{ color: textMuted }}>Manage and track all your appointments.</p>
        </motion.div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 100, borderRadius: 20, background: dark ? "#111827" : "#f3f4f6", animation: "shimmer 1.5s infinite" }} />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: "center", padding: "80px 40px", background: cardBg, borderRadius: 24, border: `1px solid ${cardBorder}` }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: dark ? "#1f2937" : "#f0f0ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CalendarX size={32} color="#6366f1" />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: textPrimary, marginBottom: 8 }}>{t(language, "noBookings")}</h3>
            <p style={{ color: textMuted, marginBottom: 24 }}>{t(language, "bookFirst")}</p>
            <a href="/" className="btn-primary" style={{ textDecoration: "none" }}>
              <Scissors size={16} /> {t(language, "findBarber")}
            </a>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                  {t(language, "active")} ({upcoming.length})
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {upcoming.map((b, i) => (
                    <motion.article key={b.id}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      style={{
                        background: cardBg, borderRadius: 20, border: `1px solid ${cardBorder}`,
                        padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
                        boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.25)" : "0 2px 12px rgba(0,0,0,0.04)",
                        transition: "border-color 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        {/* Color accent bar */}
                        <div style={{ width: 4, height: 56, borderRadius: 4, background: b.status === "confirmed" ? "#10b981" : "#f59e0b", flexShrink: 0 }} />
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                            <span style={{ fontSize: "1.05rem", fontWeight: 700, color: textPrimary }}>{b.barber_name}</span>
                            <StatusBadge status={b.status} />
                          </div>
                          <p style={{ fontSize: "0.85rem", color: textMuted, marginBottom: 3 }}>
                            {b.service_name === "Haircut" ? t(language, "haircut") :
                             b.service_name === "Beard Trim" ? t(language, "beardTrim") :
                             b.service_name === "Hair Coloring" ? t(language, "hairColoring") :
                             b.service_name === "Hair Styling" ? t(language, "hairStyling") :
                             b.service_name === "Head Massage" ? t(language, "headMassage") :
                             b.service_name === "Full Service" ? t(language, "fullService") :
                             b.service_name}
                          </p>
                          <p style={{ fontSize: "0.82rem", color: textMuted }}>
                            <Clock size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                            {b.date} at {b.time}
                          </p>
                          {b.status === "pending" && (
                            <p style={{ fontSize: "0.78rem", color: "#d97706", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                              <AlertCircle size={12} /> {t(language, "awaitingConfirmation")}
                            </p>
                          )}
                        </div>
                      </div>
                      <button onClick={() => { setCancelTarget(b.id); setCancelReason(""); }}
                        style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid #fee2e2", background: "#fff5f5", color: "#dc2626", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem", flexShrink: 0, transition: "all 0.2s" }}>
                        {t(language, "cancelBooking")}
                      </button>
                    </motion.article>
                  ))}
                </div>
              </section>
            )}

            {/* Cancelled */}
            {cancelled.length > 0 && (
              <section>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                  {t(language, "cancelled")} ({cancelled.length})
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {cancelled.map((b, i) => (
                    <motion.article key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      style={{ background: cardBg, borderRadius: 20, border: `1px solid ${cardBorder}`, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.7 }}>
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <div style={{ width: 4, height: 48, borderRadius: 4, background: "#ef4444", flexShrink: 0 }} />
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <span style={{ fontSize: "0.95rem", fontWeight: 600, color: textPrimary }}>{b.barber_name}</span>
                            <StatusBadge status="cancelled" />
                          </div>
                          <p style={{ fontSize: "0.82rem", color: textMuted }}>
                            {b.service_name === "Haircut" ? t(language, "haircut") :
                             b.service_name === "Beard Trim" ? t(language, "beardTrim") :
                             b.service_name === "Hair Coloring" ? t(language, "hairColoring") :
                             b.service_name === "Hair Styling" ? t(language, "hairStyling") :
                             b.service_name === "Head Massage" ? t(language, "headMassage") :
                             b.service_name === "Full Service" ? t(language, "fullService") :
                             b.service_name} · {b.date} at {b.time}
                          </p>
                          {b.cancel_reason && <p style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: 4 }}>{t(language, "reason")}: {t(language, b.cancel_reason)}</p>}
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelTarget && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCancelTarget(null)}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
            />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              style={{ position: "relative", background: "#ffffff", borderRadius: 24, padding: "32px", width: "100%", maxWidth: 420, boxShadow: "0 32px 64px rgba(0,0,0,0.2)" }}
            >
              <button onClick={() => setCancelTarget(null)} style={{ position: "absolute", top: 20, right: 20, width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
                <X size={16} />
              </button>

              <div style={{ width: 48, height: 48, borderRadius: 14, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <XCircle size={22} color="#dc2626" />
              </div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: 6 }}>{t(language, "cancelBooking")}?</h2>
              <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: 22 }}>{t(language, "reason")}:</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
                {CANCEL_REASONS.map(r => (
                    <button key={r} onClick={() => setCancelReason(r)}
                      style={{
                        padding: "13px 16px", borderRadius: 12, fontSize: "0.9rem", textAlign: "left", cursor: "pointer",
                        border: `1.5px solid ${cancelReason === r ? "#6366f1" : "#e5e7eb"}`,
                        background: cancelReason === r ? "#f0f0ff" : "#ffffff",
                        color: cancelReason === r ? "#4f46e5" : "#374151",
                        fontWeight: cancelReason === r ? 600 : 400,
                        transition: "all 0.15s",
                      }}
                    >
                      {t(language, r)}
                    </button>
                ))}
              </div>

              <button onClick={submitCancel} disabled={!cancelReason} className="btn-primary" style={{ width: "100%", height: 46 }}>
                {t(language, "confirmCancellation")}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
