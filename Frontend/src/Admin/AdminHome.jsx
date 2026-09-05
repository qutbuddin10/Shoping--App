import { Navigate } from "react-router-dom";

function AdminHome() {
    return <Navigate to="/dashboard" replace />;
}

export default AdminHome;