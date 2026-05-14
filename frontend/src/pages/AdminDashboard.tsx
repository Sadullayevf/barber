import { useState, useEffect } from "react";
import { t } from "../i18n/translations";
import { api, User } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useAppPreferences } from "../context/AppPreferences";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, Trash2, ChevronDown, Search, LayoutDashboard, Crown, Scissors, User as UserIcon } from "lucide-react";

const ROLE_CONFIG = {
  admin:  { color: "#7c3aed", bg: "rgba(124,58,237,0.1)",  label: "Admin",  Icon: Crown },
  barber: { color: "#6366f1", bg: "rgba(99,102,241,0.1)",  label: "Barber", Icon: Scissors },
  user:   { color: "#059669", bg: "rgba(5,150,105,0.1)",   label: "User",   Icon: UserIcon },
};

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] ?? { color: "#6b7280", bg: "#f3f4f6", label: role, Icon: UserIcon };
  const { language } = useAppPreferences();
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 99, background: cfg.bg, color: cfg.color, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      <cfg.Icon size={10} /> {t(language, role === "user" ? "customer" : role)}
    </span>
  );
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const { theme, language } = useAppPreferences();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const dark = theme === "dark";
  const bg = dark ? "#0a0a0f" : "#f8fafc";
  const cardBg = dark ? "#111827" : "#ffffff";
  const cardBorder = dark ? "#1f2937" : "#f3f4f6";
  const textPrimary = dark ? "#f9fafb" : "#111827";
  const textMuted = dark ? "#6b7280" : "#6b7280";

  useEffect(() => {
    if (!user || user.role !== "admin") { navigate("/"); return; }
    fetchUsers();
  }, [user, navigate, token]);

  const fetchUsers = async () => {
    if (!token) return;
    try { const d = await api.getUsers(token); setUsers(d); }
    catch (e: any) { toast.error(e.message || "Failed to load users"); }
    finally { setLoading(false); }
  };

  const handleRoleChange = async (userId: number, cur: string, next: string) => {
    if (!token || next === cur) return;
    if (!confirm(`${t(language, "role")} ${cur} → ${next}?`)) return;
    try { await api.updateRole(userId, next, token); toast.success("Role updated!"); fetchUsers(); }
    catch (e: any) { toast.error(e.message || "Failed"); }
  };

  const handleDelete = async (userId: number) => {
    if (!token) return;
    try { await api.deleteUser(userId, token); toast.success("User deleted"); setDeleteConfirm(null); fetchUsers(); }
    catch (e: any) { toast.error(e.message || "Failed"); }
  };

  const filtered = users.filter(u =>
    (roleFilter === "all" || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = [
    { label: "totalUsers", value: users.length, icon: Users, color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    { label: "admins", value: users.filter(u => u.role === "admin").length, icon: Shield, color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
    { label: "barbers", value: users.filter(u => u.role === "barber").length, icon: Scissors, color: "#0891b2", bg: "rgba(8,145,178,0.1)" },
    { label: "customers", value: users.filter(u => u.role === "user").length, icon: UserIcon, color: "#059669", bg: "rgba(5,150,105,0.1)" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: bg, paddingTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LayoutDashboard size={20} color="white" />
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: textPrimary, letterSpacing: "-0.04em" }}>{t(language, "navAdmin")}</h1>
          </div>
          <p style={{ color: textMuted }}>{t(language, "adminSubtitle")}</p>
        </motion.div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ background: cardBg, borderRadius: 20, border: `1px solid ${cardBorder}`, padding: "20px 22px", display: "flex", alignItems: "center", gap: 14, boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.25)" : "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <s.icon size={20} color={s.color} />
              </div>
              <div>
                <p style={{ fontSize: "0.78rem", color: textMuted, fontWeight: 500, marginBottom: 2 }}>{t(language, s.label)}</p>
                <p style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{loading ? "—" : s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Users Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: cardBg, borderRadius: 24, border: `1px solid ${cardBorder}`, boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>

          {/* Table Header */}
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${cardBorder}`, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: textPrimary, flexGrow: 1 }}>{t(language, "totalUsers")}</h2>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input type="text" placeholder={t(language, "searchUsers")} value={search} onChange={e => setSearch(e.target.value)}
                style={{ padding: "9px 14px 9px 34px", borderRadius: 10, border: `1.5px solid ${cardBorder}`, background: dark ? "#1f2937" : "#f9fafb", color: textPrimary, outline: "none", fontSize: "0.85rem", width: 200 }} />
            </div>

            {/* Role Filter */}
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              style={{ padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${cardBorder}`, background: dark ? "#1f2937" : "#f9fafb", color: textPrimary, outline: "none", fontSize: "0.85rem" }}>
              <option value="all">{t(language, "allRoles")}</option>
              <option value="user">{t(language, "customers")}</option>
              <option value="barber">{t(language, "barbers")}</option>
              <option value="admin">{t(language, "admins")}</option>
            </select>
          </div>

          {loading ? (
            <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 12 }}>
              {[1,2,3,4].map(i => <div key={i} style={{ height: 52, borderRadius: 12, background: dark ? "#1f2937" : "#f3f4f6", animation: "shimmer 1.5s infinite" }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
               <p style={{ color: textMuted }}>{t(language, "noUsersFound")}</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                    {[t(language, "user"), t(language, "email"), t(language, "role"), t(language, "actions")].map(h => (
                      <th key={h} style={{ padding: "14px 24px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: `1px solid ${cardBorder}`, transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = dark ? "rgba(255,255,255,0.02)" : "#f9fafb"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.85rem", fontWeight: 700, color: "white" }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: textPrimary, fontSize: "0.9rem" }}>{u.name}</p>
                            <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>ID #{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", color: textMuted, fontSize: "0.87rem" }}>{u.email}</td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <select
                            value={u.role}
                            onChange={e => handleRoleChange(u.id, u.role, e.target.value)}
                            disabled={u.id === user?.id}
                            style={{
                              padding: "6px 28px 6px 10px", borderRadius: 8,
                              border: `1.5px solid ${ROLE_CONFIG[u.role as keyof typeof ROLE_CONFIG]?.color || "#e5e7eb"}`,
                              background: ROLE_CONFIG[u.role as keyof typeof ROLE_CONFIG]?.bg || "#f3f4f6",
                              color: ROLE_CONFIG[u.role as keyof typeof ROLE_CONFIG]?.color || "#6b7280",
                              fontWeight: 700, fontSize: "0.75rem", cursor: u.id === user?.id ? "default" : "pointer",
                              outline: "none", appearance: "none", WebkitAppearance: "none",
                              textTransform: "uppercase", letterSpacing: "0.05em",
                            }}
                          >
                            <option value="user">{t(language, "customer")}</option>
                            <option value="barber">{t(language, "barber")}</option>
                            <option value="admin">{t(language, "admin")}</option>
                          </select>
                          <ChevronDown size={12} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: ROLE_CONFIG[u.role as keyof typeof ROLE_CONFIG]?.color || "#6b7280" }} />
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <button
                          onClick={() => setDeleteConfirm(u.id)}
                          disabled={u.id === user?.id || u.email === "admin@gmail.com"}
                          style={{
                            padding: "7px 14px", borderRadius: 8, border: "1.5px solid", cursor: "pointer",
                            borderColor: (u.id === user?.id || u.email === "admin@gmail.com") ? "#e5e7eb" : "#fee2e2",
                            background: (u.id === user?.id || u.email === "admin@gmail.com") ? "#f9fafb" : "#fff5f5",
                            color: (u.id === user?.id || u.email === "admin@gmail.com") ? "#9ca3af" : "#dc2626",
                            fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s"
                          }}>
                          <Trash2 size={13} /> {t(language, "delete")}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
              style={{ position: "relative", background: "#fff", borderRadius: 24, padding: 32, width: "100%", maxWidth: 380, boxShadow: "0 32px 64px rgba(0,0,0,0.2)", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Trash2 size={24} color="#dc2626" />
              </div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111827", marginBottom: 8 }}>{t(language, "confirmDelete")}</h2>
              <p style={{ color: "#6b7280", fontSize: "0.88rem", marginBottom: 24 }}>{t(language, "deleteWarning")}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary" style={{ flex: 1 }}>{t(language, "cancel")}</button>
                <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "white", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(239,68,68,0.35)" }}>
                  {t(language, "delete")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}
