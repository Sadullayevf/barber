import { useEffect, useMemo, useState } from "react";
import { t } from "../i18n/translations";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { MapPin, Clock, DollarSign, CheckCircle2, ChevronRight, User, Phone, Calendar } from "lucide-react";
import { api, Barber, Service, Slot } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useAppPreferences } from "../context/AppPreferences";

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function Book() {
  const { barberId } = useParams();
  const navigate = useNavigate();
  const { theme, language } = useAppPreferences();
  const { user, token } = useAuth();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<number | null>(barberId ? Number(barberId) : null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [date, setDate] = useState(getTodayDate());
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: slot select, 2: confirm

  const dark = theme === "dark";
  const bg = dark ? "#0a0a0f" : "#f8fafc";
  const cardBg = dark ? "#111827" : "#ffffff";
  const cardBorder = dark ? "#1f2937" : "#f3f4f6";
  const textPrimary = dark ? "#f9fafb" : "#111827";
  const textMuted = dark ? "#6b7280" : "#6b7280";

  const selectedBarber = useMemo(() => barbers.find((b) => b.id === selectedBarberId), [barbers, selectedBarberId]);
  const selectedServices = useMemo(() => services.filter((s) => selectedServiceIds.includes(s.id)), [services, selectedServiceIds]);
  const totalPrice = useMemo(() => selectedServices.reduce((sum, s) => sum + s.price, 0), [selectedServices]);

  useEffect(() => {
    if (!user) { toast.error("Please login to book"); navigate("/login"); return; }
    api.getBarbers(token).then(setBarbers).catch(() => setBarbers([]));
    api.getServices(token).then(setServices).catch(() => setServices([]));
  }, [user, token, navigate]);

  useEffect(() => {
    if (!selectedBarberId || !date) { setSlots([]); return; }
    let mounted = true;
    const load = async () => {
      try {
        const data = await api.getSlots(selectedBarberId, date);
        if (mounted) {
          setSlots(data);
          if (selectedTime && !data.find(s => s.time === selectedTime && s.available)) setSelectedTime("");
        }
      } catch { if (mounted) setSlots([]); }
    };
    load();
    const iv = setInterval(load, 5000);
    return () => { mounted = false; clearInterval(iv); };
  }, [selectedBarberId, date, selectedTime]);

  const handleSubmit = async () => {
    if (!selectedBarberId) { toast.error("Please select a barber"); return; }
    if (selectedServiceIds.length === 0) { toast.error("Please select at least one service"); return; }
    if (!selectedTime) { toast.error("Please select a time slot"); return; }
    if (!customerName.trim()) { toast.error("Please enter your name"); return; }
    if (!phone.trim()) { toast.error("Please enter your phone number"); return; }
    setLoading(true);
    try {
      await api.createBooking({ customer_name: customerName, phone, barber_id: selectedBarberId, service_id: selectedServiceIds[0], date, time: selectedTime }, token);
      toast.success("Booking confirmed! 🎉");
      setTimeout(() => navigate("/appointments"), 1500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    border: `1.5px solid ${dark ? "#374151" : "#e5e7eb"}`,
    background: dark ? "#1f2937" : "#f9fafb",
    color: textPrimary, fontSize: "0.95rem", outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, paddingTop: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: textPrimary, letterSpacing: "-0.04em", marginBottom: 6 }}>
            {t(language, "bookingTitle")}
          </h1>
          <p style={{ color: textMuted }}>Choose your barber, service and preferred time.</p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 24 }}>

          {/* LEFT PANEL */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Barber Selection */}
            <div style={{ background: cardBg, borderRadius: 20, border: `1px solid ${cardBorder}`, padding: 24, boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.04)" }}>
              {selectedBarber ? (
                <div>
                  <img src={selectedBarber.avatar || selectedBarber.image} alt={selectedBarber.name} style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 14, marginBottom: 16 }} />
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: textPrimary, letterSpacing: "-0.02em", marginBottom: 4 }}>{selectedBarber.name}</h2>
                  <p style={{ fontSize: "0.82rem", color: "#6366f1", fontWeight: 600, marginBottom: 14 }}>
                    {selectedBarber.specialization === "Fade Expert" ? t(language, "fadeExpert") :
                     selectedBarber.specialization === "Senior Barber" ? t(language, "seniorBarber") :
                     selectedBarber.specialization}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { icon: MapPin, label: selectedBarber.location },
                      { icon: Clock, label: selectedBarber.working_hours },
                      { icon: DollarSign, label: `${t(language, "fromPrice")} $${selectedBarber.price}` },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: dark ? "#1f2937" : "#f0f0ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon size={14} color="#6366f1" />
                        </div>
                        <span style={{ fontSize: "0.85rem", color: textMuted }}>
                          {label === selectedBarber.location ? (label === "Main Branch" ? t(language, "mainBranch") : label) : label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setSelectedBarberId(null)} style={{ width: "100%", marginTop: 16, padding: "8px", borderRadius: 10, border: `1px solid ${cardBorder}`, background: "transparent", color: textMuted, cursor: "pointer", fontSize: "0.82rem" }}>
                    {t(language, "changeBarber")}
                  </button>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: textPrimary, marginBottom: 14 }}>{t(language, "chooseBarber")}</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {barbers.map(b => (
                      <button key={b.id} onClick={() => setSelectedBarberId(b.id)} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px", borderRadius: 14,
                        border: `1.5px solid ${selectedBarberId === b.id ? "#6366f1" : cardBorder}`,
                        background: selectedBarberId === b.id ? (dark ? "rgba(99,102,241,0.15)" : "#f0f0ff") : "transparent",
                        cursor: "pointer", width: "100%", textAlign: "left", transition: "all 0.2s"
                      }}>
                        <img src={b.avatar || b.image} alt={b.name} style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }} />
                        <div>
                          <div style={{ fontWeight: 600, color: textPrimary, fontSize: "0.92rem" }}>{b.name}</div>
                          <div style={{ fontSize: "0.77rem", color: "#6366f1" }}>
                            {b.specialization === "Fade Expert" ? t(language, "fadeExpert") :
                             b.specialization === "Senior Barber" ? t(language, "seniorBarber") :
                             b.specialization}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Services */}
            <div style={{ background: cardBg, borderRadius: 20, border: `1px solid ${cardBorder}`, padding: 24, boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: textPrimary, marginBottom: 14 }}>{t(language, "additionalServices")}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {services.map(s => {
                  const active = selectedServiceIds.includes(s.id);
                  return (
                    <button key={s.id} onClick={() => setSelectedServiceIds(prev => active ? prev.filter(id => id !== s.id) : [...prev, s.id])} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "13px 16px", borderRadius: 14,
                      border: `1.5px solid ${active ? "#6366f1" : cardBorder}`,
                      background: active ? (dark ? "rgba(99,102,241,0.15)" : "#f0f0ff") : "transparent",
                      cursor: "pointer", width: "100%", transition: "all 0.2s"
                    }}>
                      <span style={{ fontWeight: 500, color: textPrimary, fontSize: "0.9rem" }}>
                        {s.name === "Haircut" ? t(language, "haircut") :
                         s.name === "Beard Trim" ? t(language, "beardTrim") :
                         s.name === "Hair Coloring" ? t(language, "hairColoring") :
                         s.name === "Hair Styling" ? t(language, "hairStyling") :
                         s.name === "Head Massage" ? t(language, "headMassage") :
                         s.name === "Full Service" ? t(language, "fullService") :
                         s.name}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontWeight: 700, color: active ? "#6366f1" : textMuted, fontSize: "0.9rem" }}>${s.price}</span>
                        <div style={{ width: 20, height: 20, borderRadius: 6, background: active ? "#6366f1" : (dark ? "#374151" : "#e5e7eb"), display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                          {active && <CheckCircle2 size={14} color="white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedServices.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${cardBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: textMuted }}>{t(language, "totalPrice")} ({selectedServices.length} service{selectedServices.length > 1 ? "s" : ""})</span>
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#6366f1" }}>${totalPrice}</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* RIGHT PANEL */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Date & Slots */}
            <div style={{ background: cardBg, borderRadius: 20, border: `1px solid ${cardBorder}`, padding: 24, boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: dark ? "#1f2937" : "#f0f0ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Calendar size={16} color="#6366f1" />
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: textPrimary }}>{t(language, "availableSlots")}</h3>
              </div>

              <input type="date" value={date} min={getTodayDate()} onChange={e => { setDate(e.target.value); setSelectedTime(""); }}
                style={{ ...inputStyle, marginBottom: 20 }} />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {slots.length === 0 && selectedBarberId && (
                  <p style={{ gridColumn: "1/-1", textAlign: "center", color: textMuted, padding: "20px 0", fontSize: "0.9rem" }}>{t(language, "noSlots")}</p>
                )}
                {!selectedBarberId && (
                  <p style={{ gridColumn: "1/-1", textAlign: "center", color: textMuted, padding: "20px 0", fontSize: "0.9rem" }}>{t(language, "tryDifferentSearch")}</p>
                )}
                {slots.map(slot => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <motion.button key={slot.time} disabled={!slot.available} onClick={() => setSelectedTime(slot.time)}
                      whileTap={slot.available ? { scale: 0.95 } : {}}
                      style={{
                        padding: "10px 6px", borderRadius: 12, fontSize: "0.82rem", fontWeight: 600,
                        border: `1.5px solid ${isSelected ? "#6366f1" : (slot.available ? cardBorder : "transparent")}`,
                        background: isSelected ? "linear-gradient(135deg, #6366f1, #4f46e5)" : (slot.available ? "transparent" : (dark ? "#1a1a2e" : "#f9fafb")),
                        color: isSelected ? "white" : (slot.available ? textPrimary : (dark ? "#374151" : "#d1d5db")),
                        cursor: slot.available ? "pointer" : "not-allowed",
                        boxShadow: isSelected ? "0 4px 12px rgba(99,102,241,0.35)" : "none",
                        transition: "all 0.15s",
                      }}
                    >
                      {slot.time}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Customer Info */}
            <div style={{ background: cardBg, borderRadius: 20, border: `1px solid ${cardBorder}`, padding: 24, boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: textPrimary, marginBottom: 16 }}>{t(language, "customerName")}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, color: textMuted, marginBottom: 6 }}>{t(language, "fullName")}</label>
                  <div style={{ position: "relative" }}>
                    <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                    <input type="text" placeholder={t(language, "customerName")} value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ ...inputStyle, paddingLeft: 40 }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, color: textMuted, marginBottom: 6 }}>{t(language, "phoneNumber")}</label>
                  <div style={{ position: "relative" }}>
                    <Phone size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                    <input type="tel" placeholder="+998 XX XXX XXXX" value={phone} onChange={e => setPhone(e.target.value)} style={{ ...inputStyle, paddingLeft: 40 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary + Confirm */}
            <AnimatePresence>
              {selectedTime && selectedServices.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  style={{ background: dark ? "rgba(99,102,241,0.1)" : "#f0f0ff", borderRadius: 20, border: "1.5px solid rgba(99,102,241,0.25)", padding: 20 }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#6366f1", marginBottom: 12 }}>{t(language, "bookingSummary")}</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: textMuted }}>{t(language, "barber")}</span>
                      <span style={{ fontWeight: 600, color: textPrimary }}>{selectedBarber?.name}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: textMuted }}>{t(language, "dateAndTime")}</span>
                      <span style={{ fontWeight: 600, color: textPrimary }}>{date} at {selectedTime}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid rgba(99,102,241,0.2)", marginTop: 4 }}>
                      <span style={{ fontWeight: 600, color: textPrimary }}>{t(language, "totalPrice")}</span>
                      <span style={{ fontWeight: 800, color: "#6366f1", fontSize: "1.1rem" }}>${totalPrice}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="btn-primary"
              style={{ width: "100%", height: 52, fontSize: "1rem" }}
            >
              {loading ? (
                <div style={{ width: 22, height: 22, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              ) : (
                <>{t(language, "confirmBooking")} <ChevronRight size={20} /></>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Book;
