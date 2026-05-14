import { useState, useEffect } from "react";
import { api, Booking, Barber, Portfolio } from "../services/api";
import { t } from "../i18n/translations";
import { useAuth } from "../context/AuthContext";
import { useAppPreferences } from "../context/AppPreferences";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, User, Image as ImageIcon, Settings,
  Check, X, Plus, Trash2, Camera, MapPin, Clock, DollarSign,
  CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";

const TIME_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00",
];

function StatusBadge({ status }: { status: string }) {
  const { language } = useAppPreferences();
  const conf = {
    pending:   { cls: "badge badge-pending",   Icon: AlertCircle,  key: "pending" },
    confirmed: { cls: "badge badge-confirmed", Icon: CheckCircle2, key: "confirmed" },
    cancelled: { cls: "badge badge-cancelled", Icon: XCircle,      key: "cancelled" },
  }[status] ?? { cls: "badge", Icon: AlertCircle, key: status };
  return <span className={conf.cls}><conf.Icon size={10} />{t(language, conf.key)}</span>;
}

export default function BarberDashboard() {
  const { user, token } = useAuth();
  const { theme, language } = useAppPreferences();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"bookings"|"portfolio"|"profile"|"settings">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Barber | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  // Profile edit
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editPrice, setEditPrice] = useState(25);
  const [editAvatar, setEditAvatar] = useState("");
  // Portfolio add
  const [newPortImage, setNewPortImage] = useState("");
  const [newPortDesc, setNewPortDesc] = useState("");

  const dark = theme === "dark";
  const bg = dark ? "#0a0a0f" : "#f8fafc";
  const sideBg = dark ? "#111827" : "#ffffff";
  const cardBg = dark ? "#111827" : "#ffffff";
  const cardBorder = dark ? "#1f2937" : "#f3f4f6";
  const textPrimary = dark ? "#f9fafb" : "#111827";
  const textMuted = dark ? "#6b7280" : "#6b7280";

  useEffect(() => {
    if (!user || user.role !== "barber") { navigate("/"); return; }
    init();
    const iv = setInterval(fetchBookings, 5000);
    return () => clearInterval(iv);
  }, [user, token]);

  const init = async () => {
    setLoading(true);
    await Promise.allSettled([fetchBookings(), fetchProfile()]);
    setLoading(false);
  };

  const fetchBookings = async () => {
    if (!token) return;
    try { const d = await api.getBookings(token); setBookings(d); } catch {}
  };

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const d = await api.getMyBarberProfile(token);
      setProfile(d);
      setEditName(d.name); setEditLocation(d.location);
      setEditHours(d.working_hours); setEditPrice(d.price);
      setEditAvatar(d.avatar || d.image);
      const p = await api.getPortfolio(d.id);
      setPortfolio(p);
    } catch {}
  };

  const handleConfirm = async (id: number) => {
    if (!token) return;
    try { await api.confirmBooking(id, token); toast.success("Booking confirmed!"); fetchBookings(); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleCancel = async () => {
    if (!token || !cancelModal || !cancelReason) { toast.error("Please provide a reason"); return; }
    try {
      await api.cancelBooking(cancelModal, cancelReason, token);
      toast.success("Booking cancelled");
      setCancelModal(null); setCancelReason(""); fetchBookings();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await api.updateMyBarberProfile({ name: editName, location: editLocation, working_hours: editHours, price: editPrice, avatar: editAvatar }, token);
      toast.success("Profile updated!"); fetchProfile();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await api.addPortfolioItem({ image: newPortImage, description: newPortDesc }, token);
      toast.success("Photo added!"); setNewPortImage(""); setNewPortDesc(""); fetchProfile();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeletePortfolio = async (id: number) => {
    if (!token || !confirm("Delete this photo?")) return;
    try { await api.deletePortfolioItem(id, token); toast.success("Removed"); fetchProfile(); }
    catch (e: any) { toast.error(e.message); }
  };

  const toggleSlot = async (slot: string) => {
    if (!token || !profile) return;
    let cur: string[] = [];
    try { cur = JSON.parse(profile.availability || "[]"); } catch {}
    const next = cur.includes(slot) ? cur.filter(s => s !== slot) : [...cur, slot];
    try {
      await api.updateMyBarberProfile({ availability: JSON.stringify(next) }, token);
      toast.success(`Slot ${slot} ${cur.includes(slot) ? "enabled" : "disabled"}`);
      fetchProfile();
    } catch { toast.error("Failed to update"); }
  };

  const navItems = [
    { id: "bookings", label: "myBookings", icon: Calendar },
    { id: "portfolio", label: "portfolio", icon: ImageIcon },
    { id: "profile", label: "user", icon: User },
    { id: "settings", label: "availability", icon: Settings },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 16px", borderRadius: 12,
    border: `1.5px solid ${dark ? "#374151" : "#e5e7eb"}`,
    background: dark ? "#1f2937" : "#f9fafb",
    color: textPrimary, fontSize: "0.9rem", outline: "none",
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
      <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: bg, paddingTop: 72 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 80px", display: "flex", gap: 24 }}>

        {/* Sidebar */}
        <aside style={{ width: 240, flexShrink: 0 }}>
          <div style={{ background: sideBg, borderRadius: 20, border: `1px solid ${cardBorder}`, padding: 20, boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.05)", position: "sticky", top: 88 }}>
            {/* Avatar */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <img src={profile?.avatar || profile?.image} alt={profile?.name}
                  style={{ width: 80, height: 80, borderRadius: 20, objectFit: "cover", border: "3px solid", borderColor: dark ? "#374151" : "#e5e7eb" }}
                />
                <div style={{ position: "absolute", bottom: -4, right: -4, width: 24, height: 24, borderRadius: 8, background: "#10b981", border: "2px solid", borderColor: sideBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />
                </div>
              </div>
              <h3 style={{ fontWeight: 700, color: textPrimary, marginTop: 12, marginBottom: 2, fontSize: "0.95rem" }}>{profile?.name}</h3>
              <p style={{ color: "#6366f1", fontSize: "0.78rem", fontWeight: 500 }}>{profile?.specialization}</p>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {navItems.map(item => {
                const active = tab === item.id;
                return (
                  <button key={item.id} onClick={() => setTab(item.id as any)} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 12, border: "none",
                    background: active ? (dark ? "rgba(99,102,241,0.15)" : "#f0f0ff") : "transparent",
                    color: active ? "#6366f1" : textMuted,
                    cursor: "pointer", fontWeight: active ? 600 : 400,
                    fontSize: "0.88rem", transition: "all 0.15s", width: "100%", textAlign: "left",
                  }}>
                    <item.icon size={17} />
                    {t(language, item.label)}
                  </button>
                );
              })}
            </nav>

            {/* Stats */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${cardBorder}` }}>
              {[
                { label: "pending", val: bookings.filter(b => b.status === "pending").length, color: "#f59e0b" },
                { label: "confirmed", val: bookings.filter(b => b.status === "confirmed").length, color: "#10b981" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.78rem", color: textMuted }}>{t(language, s.label)}</span>
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: s.color }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Content */}
        <main style={{ flexGrow: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

              {/* BOOKINGS */}
              {tab === "bookings" && (
                <div>
                  <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: textPrimary, letterSpacing: "-0.03em", marginBottom: 20 }}>{t(language, "upcomingSchedule")}</h2>
                  {bookings.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px", background: cardBg, borderRadius: 20, border: `1px solid ${cardBorder}` }}>
                      <Calendar size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
                      <p style={{ color: textMuted, fontWeight: 500 }}>{t(language, "noBookings")}</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {bookings.map((b, i) => (
                        <motion.div key={b.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          style={{ background: cardBg, padding: "20px 24px", borderRadius: 18, border: `1px solid ${cardBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.04)" }}>
                          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                            <div style={{ width: 4, height: 52, borderRadius: 4, background: b.status === "confirmed" ? "#10b981" : b.status === "pending" ? "#f59e0b" : "#ef4444", flexShrink: 0 }} />
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                <span style={{ fontWeight: 700, fontSize: "1rem", color: textPrimary }}>{b.customer_name}</span>
                                <StatusBadge status={b.status} />
                              </div>
                              <p style={{ fontSize: "0.83rem", color: textMuted }}>
                                {b.service_name === "Haircut" ? t(language, "haircut") :
                                 b.service_name === "Beard Trim" ? t(language, "beardTrim") :
                                 b.service_name === "Hair Coloring" ? t(language, "hairColoring") :
                                 b.service_name === "Hair Styling" ? t(language, "hairStyling") :
                                 b.service_name === "Head Massage" ? t(language, "headMassage") :
                                 b.service_name === "Full Service" ? t(language, "fullService") :
                                 b.service_name} · {b.date} at {b.time}
                              </p>
                              <p style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: 2 }}>📞 {b.phone}</p>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            {b.status === "pending" && (
                              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleConfirm(b.id)} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.82rem" }}>
                                <Check size={14} /> {t(language, "confirm")}
                              </motion.button>
                            )}
                            {b.status !== "cancelled" && (
                              <button onClick={() => { setCancelModal(b.id); setCancelReason(""); }}
                                style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid #fee2e2", background: "#fff5f5", color: "#dc2626", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                                <X size={14} /> {t(language, "cancel")}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PORTFOLIO */}
              {tab === "portfolio" && (
                <div>
                   <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: textPrimary, letterSpacing: "-0.03em", marginBottom: 20 }}>{t(language, "portfolio")}</h2>
                  <form onSubmit={handleAddPortfolio} style={{ background: cardBg, padding: 24, borderRadius: 20, border: `1px solid ${cardBorder}`, marginBottom: 24, boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.04)" }}>
                    <h3 style={{ fontWeight: 700, color: textPrimary, marginBottom: 14, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}><Plus size={16} color="#6366f1" /> {t(language, "addPhoto")}</h3>
                    <div style={{ display: "flex", gap: 12 }}>
                      <input type="text" placeholder="Image URL" value={newPortImage} onChange={e => setNewPortImage(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
                      <input type="text" placeholder="Short description..." value={newPortDesc} onChange={e => setNewPortDesc(e.target.value)} style={{ ...inputStyle, flex: 2 }} />
                       <button type="submit" className="btn-primary" style={{ flexShrink: 0, padding: "11px 20px" }}>{t(language, "add")}</button>
                    </div>
                  </form>

                  {portfolio.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px", background: cardBg, borderRadius: 20, border: `1px solid ${cardBorder}` }}>
                      <ImageIcon size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
                      <p style={{ color: textMuted }}>{t(language, "noPortfolio")}</p>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
                      {portfolio.map(item => (
                        <div key={item.id} style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "1", position: "relative", background: "#f3f4f6" }}>
                          <img src={item.image} alt={item.description} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 12, opacity: 0, transition: "opacity 0.2s" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0"}>
                            <p style={{ color: "white", fontSize: "0.78rem", marginBottom: 8 }}>{item.description}</p>
                            <button onClick={() => handleDeletePortfolio(item.id)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#ef4444", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PROFILE */}
              {tab === "profile" && (
                <div>
                  <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: textPrimary, letterSpacing: "-0.03em", marginBottom: 20 }}>{t(language, "editProfile")}</h2>
                  <form onSubmit={handleUpdateProfile} style={{ background: cardBg, padding: 32, borderRadius: 20, border: `1px solid ${cardBorder}`, display: "flex", flexDirection: "column", gap: 20, boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.04)" }}>

                    {/* Avatar */}
                    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <img src={editAvatar} alt="Preview" style={{ width: 100, height: 100, borderRadius: 20, objectFit: "cover", border: `2px solid ${cardBorder}` }} />
                        <div style={{ position: "absolute", bottom: -6, right: -6, width: 28, height: 28, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Camera size={14} color="white" />
                        </div>
                      </div>
                      <div style={{ flexGrow: 1 }}>
                         <label style={{ fontSize: "0.82rem", fontWeight: 500, color: textMuted, display: "block", marginBottom: 6 }}>{t(language, "avatarUrl")}</label>
                         <input type="text" value={editAvatar} onChange={e => setEditAvatar(e.target.value)} style={inputStyle} />
                       </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                       {[
                         { label: "fullName", val: editName, set: setEditName, Icon: User },
                         { label: "location", val: editLocation, set: setEditLocation, Icon: MapPin },
                         { label: "workingHours", val: editHours, set: setEditHours, Icon: Clock },
                       ].map(({ label, val, set, Icon }) => (
                         <div key={label}>
                           <label style={{ fontSize: "0.82rem", fontWeight: 500, color: textMuted, display: "block", marginBottom: 6 }}>{t(language, label)}</label>
                          <div style={{ position: "relative" }}>
                            <Icon size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                            <input type="text" value={val} onChange={e => set(e.target.value)} style={{ ...inputStyle, paddingLeft: 36 }} />
                          </div>
                        </div>
                      ))}
                       <div>
                         <label style={{ fontSize: "0.82rem", fontWeight: 500, color: textMuted, display: "block", marginBottom: 6 }}>{t(language, "fromPrice")} ($)</label>
                         <div style={{ position: "relative" }}>
                           <DollarSign size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                           <input type="number" value={editPrice} onChange={e => setEditPrice(Number(e.target.value))} style={{ ...inputStyle, paddingLeft: 36 }} />
                         </div>
                       </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start", padding: "12px 32px" }}>
                      {t(language, "saveChanges")}
                    </button>
                  </form>
                </div>
              )}

              {/* AVAILABILITY */}
              {tab === "settings" && (
                <div>
                  <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: textPrimary, letterSpacing: "-0.03em", marginBottom: 6 }}>{t(language, "availability")}</h2>
                  <p style={{ color: textMuted, marginBottom: 24 }}>Click a slot to block or unblock it for bookings.</p>
                  <div style={{ background: cardBg, padding: 28, borderRadius: 20, border: `1px solid ${cardBorder}`, boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
                      {TIME_SLOTS.map(slot => {
                        let disabled = false;
                        try { disabled = JSON.parse(profile?.availability || "[]").includes(slot); } catch {}
                        return (
                          <motion.button key={slot} whileTap={{ scale: 0.93 }} onClick={() => toggleSlot(slot)}
                            style={{
                              padding: "14px 8px", borderRadius: 14, border: "1.5px solid",
                              borderColor: disabled ? "transparent" : (dark ? "#374151" : "#e5e7eb"),
                              background: disabled ? (dark ? "rgba(239,68,68,0.1)" : "#fff5f5") : (dark ? "#1f2937" : "#f9fafb"),
                              color: disabled ? "#ef4444" : textPrimary,
                              cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
                              display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.15s",
                            }}>
                            {slot}
                            <span style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.05em", color: disabled ? "#ef4444" : "#9ca3af", fontWeight: 500 }}>
                              {disabled ? t(language, "blocked") : t(language, "open")}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCancelModal(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
              style={{ position: "relative", background: "#fff", borderRadius: 24, padding: 32, width: "100%", maxWidth: 420, boxShadow: "0 32px 64px rgba(0,0,0,0.2)" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#111827", marginBottom: 6 }}>{t(language, "cancelBooking")}</h2>
              <p style={{ color: "#6b7280", fontSize: "0.88rem", marginBottom: 20 }}>Provide a reason for the customer.</p>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Reason for cancellation..." rows={3}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#f9fafb", outline: "none", resize: "none", fontFamily: "inherit", marginBottom: 16, color: "#111827" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setCancelModal(null)} className="btn-secondary" style={{ flex: 1 }}>{t(language, "keepBooking")}</button>
                <button onClick={handleCancel} disabled={!cancelReason.trim()} className="btn-primary" style={{ flex: 1, background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 14px rgba(239,68,68,0.3)" }}>{t(language, "cancelBooking")}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
