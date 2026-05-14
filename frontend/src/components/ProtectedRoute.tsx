import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAppPreferences } from "../context/AppPreferences";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: Array<"admin" | "barber" | "user">;
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { theme } = useAppPreferences();
  const dark = theme === "dark";

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: dark ? "#0a0a0f" : "#f8fafc",
      }}>
        <div style={{
          width: 36, height: 36,
          border: `3px solid ${dark ? "#1f2937" : "#e5e7eb"}`,
          borderTopColor: "#6366f1",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "barber") return <Navigate to="/barber" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
