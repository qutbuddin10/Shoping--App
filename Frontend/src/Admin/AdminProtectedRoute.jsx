import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
    const admin = sessionStorage.getItem("admin");

    if (!admin) {
        return <Navigate to="/login" replace />;
    }

    return children;
}