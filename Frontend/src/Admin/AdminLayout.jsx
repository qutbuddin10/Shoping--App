import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0B0F17] text-white">
            {/* ================= SIDEBAR ================= */}

            <AdminSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* ================= MAIN AREA ================= */}

            <div className="min-h-screen lg:ml-[260px]">
                {/* ================= NAVBAR ================= */}

                <AdminNavbar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                {/* ================= DASHBOARD CONTENT ================= */}

                <main className="min-h-screen bg-[#0B0F17] pt-[72px]">
                    <div className="min-h-[calc(100vh-72px)] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}