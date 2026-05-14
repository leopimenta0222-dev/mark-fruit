import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function PrivateRoute({ children, producerOnly = false }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return <div className="p-8 text-center text-stone-500">Carregando...</div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }
  if (producerOnly && user.role !== "PRODUCER") {
    return <Navigate to="/" replace />;
  }
  return children;
}
