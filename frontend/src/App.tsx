import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Book from "./pages/Book";
import MyAppointments from "./pages/MyAppointments";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import BarberDashboard from "./pages/BarberDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { useAppPreferences } from "./context/AppPreferences";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";

function App() {
  const location = useLocation();
  const { theme } = useAppPreferences();
  const { user } = useAuth();

  // Apply theme to body
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: 12,
            padding: "12px 18px",
            fontWeight: 500,
            fontSize: "0.9rem",
            background: theme === "dark" ? "#1f2937" : "#fff",
            color: theme === "dark" ? "#f9fafb" : "#111827",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          },
          success: { iconTheme: { primary: "#6366f1", secondary: "#fff" } },
        }}
      />
      {!isAuthPage && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />

            {/* User Only */}
            <Route path="/" element={<ProtectedRoute allowedRoles={["user"]}><Home /></ProtectedRoute>} />
            <Route path="/book" element={<ProtectedRoute allowedRoles={["user"]}><Book /></ProtectedRoute>} />
            <Route path="/book/:barberId" element={<ProtectedRoute allowedRoles={["user"]}><Book /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute allowedRoles={["user"]}><MyAppointments /></ProtectedRoute>} />

            {/* Admin Only */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />

            {/* Barber Only */}
            <Route path="/barber" element={<ProtectedRoute allowedRoles={["barber"]}><BarberDashboard /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
