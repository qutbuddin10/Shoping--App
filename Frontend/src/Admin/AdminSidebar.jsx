import {
    LayoutDashboard,
    Tags,
    Package,
    Users,
    ClipboardList,
    MessageSquare,
    ShoppingCart,
    ReceiptText,
    LogOut,
    X,
    ChevronRight,
    Store,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import api_base from "../apibase";

export default function AdminSidebar({
    sidebarOpen,
    setSidebarOpen,
}) {
    const navigate = useNavigate();

    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Categories",
            path: "/categories",
            icon: Tags,
        },
        {
            name: "Products",
            path: "/adminproducts",
            icon: Package,
        },
        {
            name: "Customers List",
            path: "/admin/customers",
            icon: Users,
        },
        {
            name: "Orders",
            path: "/admin/orders",
            icon: ClipboardList,
        },
        {
            name: "Reviews",
            path: "/admin/reviews",
            icon: MessageSquare,
        },
        {
            name: "Contact Queries",
            path: "/admin/contact-queries",
            icon: MessageSquare,
        },
        {
            name: "Sales",
            path: "/admin/sales",
            icon: ShoppingCart,
        },
        {
            name: "Transactions",
            path: "/admin/transactions",
            icon: ReceiptText,
        },
    ];

    const handleLogout = async () => {
        try {
            const response = await axios.post(
                `${api_base}admin-logout/`,
                {},
                {
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                navigate("/login", {
                    replace: true,
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            {/* ================= MOBILE OVERLAY ================= */}

            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
                />
            )}

            {/* ================= SIDEBAR ================= */}

            <aside
                className={`
                    fixed
                    left-0
                    top-0
                    z-50
                    flex
                    h-screen
                    w-[260px]
                    flex-col
                    border-r
                    border-white/[0.06]
                    bg-[#0B0F19]
                    text-white
                    transition-transform
                    duration-300
                    ease-in-out
                    ${
                        sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full lg:translate-x-0"
                    }
                `}
            >
                {/* ================= HEADER ================= */}

                <div className="flex h-[80px] shrink-0 items-center justify-between border-b border-white/[0.06] px-5">
                    <div className="flex items-center gap-3">
                        {/* LOGO */}

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5A524] to-[#E08E0B] shadow-lg shadow-[#F5A524]/20">
                            <Store
                                size={21}
                                className="text-black"
                                strokeWidth={2.5}
                            />
                        </div>

                        {/* TITLE */}

                        <div>
                            <h2 className="text-[16px] font-bold leading-tight text-white">
                                ShopNest
                            </h2>

                            <p className="mt-1 text-[9px] font-medium uppercase tracking-[2.5px] text-gray-500">
                                Management
                            </p>
                        </div>
                    </div>

                    {/* MOBILE CLOSE */}

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
                    >
                        <X size={19} />
                    </button>
                </div>

                {/* ================= MENU ================= */}

                <div className="flex-1 overflow-y-auto px-4 py-6">
                    <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[2px] text-gray-500">
                        Main Menu
                    </p>

                    <nav className="space-y-1.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) => `
                                        group
                                        flex
                                        w-full
                                        items-center
                                        justify-between
                                        rounded-xl
                                        px-3
                                        py-3
                                        text-sm
                                        font-medium
                                        transition-all
                                        duration-200
                                        ${
                                            isActive
                                                ? "bg-gradient-to-r from-[#F5A524] to-[#E08E0B] text-black shadow-lg shadow-[#F5A524]/20"
                                                : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
                                        }
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span className="flex min-w-0 items-center gap-3">
                                                <Icon
                                                    size={18}
                                                    strokeWidth={
                                                        isActive ? 2.5 : 2
                                                    }
                                                    className="shrink-0"
                                                />

                                                <span className="truncate">
                                                    {item.name}
                                                </span>
                                            </span>

                                            <ChevronRight
                                                size={15}
                                                className={`
                                                    shrink-0
                                                    transition-all
                                                    duration-200
                                                    ${
                                                        isActive
                                                            ? "opacity-100"
                                                            : "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-50"
                                                    }
                                                `}
                                            />
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                {/* ================= STORE STATUS ================= */}

                <div className="px-4 pb-3">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                                <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-40" />
                            </span>

                            <div>
                                <p className="text-xs font-semibold text-white">
                                    Store Online
                                </p>

                                <p className="mt-0.5 text-[10px] text-gray-500">
                                    All systems normal
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= LOGOUT ================= */}

                <div className="border-t border-white/[0.06] p-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
                    >
                        <LogOut size={18} />

                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}