import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppPreferences, Language } from "../context/AppPreferences";
import { Moon, Sun, Scissors, Calendar, Home, User as UserIcon, LogOut, Settings, LayoutDashboard, Languages, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { t } from "../i18n/translations";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  barber: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  user:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function Navbar() {
  const { theme, toggleTheme, language, setLanguage } = useAppPreferences();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-indigo-50 text-indigo-600"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`;

  const darkLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-indigo-900/30 text-indigo-400"
        : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
    }`;

  const getClass = (isActive: boolean) =>
    theme === "dark" ? darkLinkClass({ isActive }) : linkClass({ isActive });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "0 24px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: theme === "dark" ? "rgba(10,10,15,0.85)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: theme === "dark" ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
        boxShadow: theme === "dark" ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.04)",
      }}
    >
      {/* Brand */}
      <NavLink to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: "linear-gradient(135deg, #6366f1, #4f46e5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(99,102,241,0.35)"
        }}>
          <Scissors size={18} color="white" />
        </div>
        <span style={{
          fontWeight: 700, fontSize: "1.05rem",
          color: theme === "dark" ? "#f9fafb" : "#111827",
          letterSpacing: "-0.02em"
        }}>
          BarberBook
        </span>
      </NavLink>

      {/* Nav Links */}
      <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {user?.role === "user" && (
          <>
            <NavLink to="/" className={({ isActive }) => getClass(isActive)}>
              <Home size={16} /> {t(language, "navHome")}
            </NavLink>
            <NavLink to="/book" className={({ isActive }) => getClass(isActive)}>
              <Scissors size={16} /> {t(language, "bookNow")}
            </NavLink>
            <NavLink to="/appointments" className={({ isActive }) => getClass(isActive)}>
              <Calendar size={16} /> {t(language, "myBookings")}
            </NavLink>
          </>
        )}
        {user?.role === "admin" && (
          <NavLink to="/admin" className={({ isActive }) => getClass(isActive)}>
            <LayoutDashboard size={16} /> {t(language, "navAdmin")}
          </NavLink>
        )}
        {user?.role === "barber" && (
          <NavLink to="/barber" className={({ isActive }) => getClass(isActive)}>
            <LayoutDashboard size={16} /> {t(language, "navBarber")}
          </NavLink>
        )}
      </nav>

      {/* Right Side */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Language Switcher */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            style={{
              height: 36, padding: "0 10px", borderRadius: 10,
              border: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
              background: theme === "dark" ? "rgba(255,255,255,0.05)" : "#f9fafb",
              color: theme === "dark" ? "#9ca3af" : "#6b7280",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase"
            }}
          >
            <Languages size={16} />
            {language}
            <ChevronDown size={12} style={{ transform: langMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>

          <AnimatePresence>
            {langMenuOpen && (
              <>
                <div 
                  style={{ position: "fixed", inset: 0, zIndex: 10 }} 
                  onClick={() => setLangMenuOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 20,
                    minWidth: 120, background: theme === "dark" ? "#1f2937" : "#fff",
                    borderRadius: 12, border: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)", overflow: "hidden", padding: 4
                  }}
                >
                  {(["uz", "ru", "en"] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setLangMenuOpen(false);
                      }}
                      style={{
                        width: "100%", padding: "8px 12px", border: "none",
                        background: language === lang 
                          ? (theme === "dark" ? "rgba(99,102,241,0.2)" : "#e0e7ff")
                          : "transparent",
                        color: language === lang 
                          ? (theme === "dark" ? "#818cf8" : "#4f46e5")
                          : (theme === "dark" ? "#9ca3af" : "#4b5563"),
                        textAlign: "left", cursor: "pointer", borderRadius: 8,
                        fontSize: "0.85rem", fontWeight: language === lang ? 600 : 500,
                        display: "flex", justifyContent: "space-between", alignItems: "center"
                      }}
                    >
                      {lang === "uz" ? "O'zbekcha" : lang === "ru" ? "Русский" : "English"}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
            background: theme === "dark" ? "rgba(255,255,255,0.05)" : "#f9fafb",
            color: theme === "dark" ? "#9ca3af" : "#6b7280",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s"
          }}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* User info */}
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "6px 12px",
              borderRadius: 10,
              background: theme === "dark" ? "rgba(255,255,255,0.04)" : "#f3f4f6",
              border: theme === "dark" ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e5e7eb",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", fontWeight: 700, color: "white"
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.875rem", fontWeight: 500, color: theme === "dark" ? "#d1d5db" : "#374151" }}>
                {user.name.split(" ")[0]}
              </span>
              <span style={{
                fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase",
                padding: "2px 6px", borderRadius: 6,
                background: user.role === "admin" ? "rgba(147,51,234,0.12)" : user.role === "barber" ? "rgba(99,102,241,0.12)" : "rgba(16,185,129,0.12)",
                color: user.role === "admin" ? "#9333ea" : user.role === "barber" ? "#6366f1" : "#059669",
                letterSpacing: "0.05em"
              }}>
                {t(language, user.role === "user" ? "customer" : user.role)}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: 36, height: 36, borderRadius: 10,
                border: "1px solid #fee2e2",
                background: "#fff5f5",
                color: "#dc2626",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s"
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            style={{
              padding: "8px 18px", borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "white", fontWeight: 600, fontSize: "0.875rem",
              boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
              transition: "all 0.2s"
            }}
          >
            {t(language, "signIn")}
          </NavLink>
        )}
      </div>
    </motion.header>
  );
}

export default Navbar;
