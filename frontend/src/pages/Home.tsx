import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppPreferences } from "../context/AppPreferences";
import { useAuth } from "../context/AuthContext";
import { api, Barber, Portfolio } from "../services/api";
import { Star, MapPin, Clock, DollarSign, X, ImageIcon, Search, SlidersHorizontal, Scissors } from "lucide-react";
import { t } from "../i18n/translations";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

function SkeletonCard() {
  return (
    <div style={{ background: "#f9fafb", borderRadius: 20, overflow: "hidden", border: "1px solid #f3f4f6" }}>
      <div style={{ height: 220, background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 18, width: "60%", background: "#e5e7eb", borderRadius: 8, animation: "shimmer 1.5s infinite" }} />
        <div style={{ height: 14, width: "40%", background: "#f3f4f6", borderRadius: 8, animation: "shimmer 1.5s infinite" }} />
        <div style={{ height: 40, background: "#f3f4f6", borderRadius: 12, marginTop: 8, animation: "shimmer 1.5s infinite" }} />
      </div>
    </div>
  );
}

function Home() {
  const { theme, language } = useAppPreferences();
  const { token } = useAuth();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [skeletonVisible, setSkeletonVisible] = useState(true);
  const [galleryBarber, setGalleryBarber] = useState<Barber | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const dark = theme === "dark";

  useEffect(() => {
    api.getBarbers(token).then((data) => {
      setBarbers(data);
      setSkeletonVisible(false);
    }).catch(() => setSkeletonVisible(false));
  }, [token]);

  const filtered = useMemo(() => {
    return barbers
      .filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.specialization?.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => sortOrder === "asc" ? a.price - b.price : b.price - a.price);
  }, [barbers, search, sortOrder]);

  const openGallery = async (barber: Barber) => {
    setGalleryBarber(barber);
    setGalleryLoading(true);
    try {
      const data = await api.getPortfolio(barber.id);
      setPortfolio(data);
    } catch { setPortfolio([]); }
    finally { setGalleryLoading(false); }
  };

  const bg = dark ? "#0a0a0f" : "#ffffff";
  const cardBg = dark ? "#111827" : "#ffffff";
  const cardBorder = dark ? "#1f2937" : "#f3f4f6";
  const textPrimary = dark ? "#f9fafb" : "#111827";
  const textMuted = dark ? "#6b7280" : "#6b7280";

  return (
    <div style={{ minHeight: "100vh", background: bg, paddingTop: 64 }}>
      {/* Hero */}
      <div style={{
        padding: "72px 24px 60px",
        textAlign: "center",
        background: dark
          ? "linear-gradient(to bottom, #0f172a, #0a0a0f)"
          : "linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 60%, #fdf4ff 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 99, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", marginBottom: 20 }}>
            <Scissors size={14} color="#6366f1" />
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#6366f1", letterSpacing: "0.05em" }}>{t(language, "premiumBarbershop")}</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 900, color: textPrimary, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}>
            {t(language, "findYourPerfect")}<br />
            <span style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t(language, "barber")}</span>
          </h1>
          <p style={{ fontSize: "1.15rem", color: textMuted, maxWidth: 480, margin: "0 auto" }}>
            {t(language, "homeSubtitle")}
          </p>
        </motion.div>
      </div>

      {/* Filters Bar */}
      <div style={{ maxWidth: 1200, margin: "-28px auto 0", padding: "0 24px", position: "relative", zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{
            background: dark ? "rgba(17,24,39,0.95)" : "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: 18,
            border: `1px solid ${cardBorder}`,
            boxShadow: dark ? "0 20px 40px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.08)",
            padding: "16px 20px",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div style={{ flexGrow: 1, position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input
              type="text"
              placeholder={t(language, "searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="premium-input"
              style={{ paddingLeft: 42, margin: 0 }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <SlidersHorizontal size={16} color="#6b7280" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="premium-input"
              style={{ width: "auto", margin: 0, paddingRight: 32 }}
            >
              <option value="asc">{t(language, "lowToHigh")}</option>
              <option value="desc">{t(language, "highToLow")}</option>
            </select>
          </div>
        </motion.div>
      </div>

      {/* Barber Grid */}
      <div style={{ maxWidth: 1200, margin: "40px auto 80px", padding: "0 24px" }}>
        {skeletonVisible ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Search size={32} color="#9ca3af" />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: textPrimary, marginBottom: 8 }}>{t(language, "noBarbersFound")}</h3>
            <p style={{ color: textMuted }}>{t(language, "tryDifferentSearch")}</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}
          >
            {filtered.map((barber) => (
              <motion.article
                key={barber.id}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  background: cardBg, borderRadius: 20,
                  border: `1px solid ${cardBorder}`,
                  overflow: "hidden",
                  boxShadow: dark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#6366f1";
                  (e.currentTarget as HTMLElement).style.boxShadow = dark
                    ? "0 8px 32px rgba(99,102,241,0.2)"
                    : "0 8px 32px rgba(99,102,241,0.12)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = cardBorder;
                  (e.currentTarget as HTMLElement).style.boxShadow = dark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.04)";
                }}
              >
                {/* Image */}
                <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
                  <img
                    src={barber.avatar || barber.image}
                    alt={barber.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  />
                  {/* Rating badge */}
                  <div style={{
                    position: "absolute", top: 12, right: 12,
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(8px)",
                    padding: "4px 10px", borderRadius: 99,
                    display: "flex", alignItems: "center", gap: 4
                  }}>
                    <Star size={12} fill="#fbbf24" color="#fbbf24" />
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>{barber.rating}</span>
                  </div>
                  {/* Gallery button */}
                  <button
                    onClick={() => openGallery(barber)}
                    style={{
                      position: "absolute", top: 12, left: 12,
                      background: "rgba(0,0,0,0.5)",
                      backdropFilter: "blur(8px)",
                      border: "none", padding: "6px 10px", borderRadius: 8,
                      color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                      fontSize: "0.75rem", fontWeight: 500, transition: "background 0.2s"
                    }}
                  >
                    <ImageIcon size={12} /> {t(language, "portfolio")}
                  </button>
                </div>

                {/* Body */}
                <div style={{ padding: 20 }}>
                  <div style={{ marginBottom: 12 }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: textPrimary, letterSpacing: "-0.02em", marginBottom: 4 }}>
                      {barber.name}
                    </h3>
                    <p style={{ fontSize: "0.82rem", color: "#6366f1", fontWeight: 500 }}>
                      {barber.specialization === "Fade Expert" ? t(language, "fadeExpert") :
                       barber.specialization === "Senior Barber" ? t(language, "seniorBarber") :
                       barber.specialization}
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <MapPin size={13} color="#9ca3af" />
                      <span style={{ fontSize: "0.83rem", color: textMuted }}>
                        {barber.location === "Main Branch" ? t(language, "mainBranch") : barber.location}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Clock size={13} color="#9ca3af" />
                      <span style={{ fontSize: "0.83rem", color: textMuted }}>{barber.working_hours}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <DollarSign size={13} color="#9ca3af" />
                      <span style={{ fontSize: "0.83rem", fontWeight: 600, color: textPrimary }}>{t(language, "fromPrice")} ${barber.price}</span>
                    </div>
                  </div>

                  <Link
                    to={`/book/${barber.id}`}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "11px 20px", borderRadius: 12,
                      background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                      color: "white", fontWeight: 600, fontSize: "0.9rem",
                      textDecoration: "none",
                      boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(99,102,241,0.45)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(99,102,241,0.3)"}
                  >
                    {t(language, "bookNow")}
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>

      {/* Portfolio Modal */}
      <AnimatePresence>
        {galleryBarber && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setGalleryBarber(null)}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              style={{
                position: "relative", width: "100%", maxWidth: 900, maxHeight: "85vh",
                background: "#ffffff", borderRadius: 28,
                boxShadow: "0 40px 80px rgba(0,0,0,0.25)",
                display: "flex", flexDirection: "column", overflow: "hidden"
              }}
            >
              <div style={{ padding: "24px 28px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: 2 }}>{galleryBarber.name}{t(language, "barbersPortfolio")}</h2>
                  <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                    {galleryBarber.specialization === "Fade Expert" ? t(language, "fadeExpert") :
                     galleryBarber.specialization === "Senior Barber" ? t(language, "seniorBarber") :
                     galleryBarber.specialization}
                  </p>
                </div>
                <button onClick={() => setGalleryBarber(null)} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ overflowY: "auto", padding: 28 }}>
                {galleryLoading ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ aspectRatio: "4/5", borderRadius: 16, background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)", animation: "shimmer 1.5s infinite" }} />
                    ))}
                  </div>
                ) : portfolio.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                    {portfolio.map(item => (
                      <div key={item.id} style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "4/5", position: "relative" }}>
                        <img src={item.image} alt={item.description} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                        />
                        {item.description && (
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px", background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)", color: "#fff", fontSize: "0.8rem" }}>
                            {item.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <ImageIcon size={28} color="#d1d5db" />
                    </div>
                    <p style={{ color: "#9ca3af", fontWeight: 500 }}>{t(language, "noPortfolio")}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  );
}

export default Home;
