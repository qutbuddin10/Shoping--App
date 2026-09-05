import { useEffect, useRef, useState } from "react";

import {
    Search,
    Bell,
    Menu,
    ChevronDown,
    Settings,
    LogOut,
    Package,
    Users,
    ShoppingBag,
    Tags,
    Star,
    X,
    Clock3,
    RotateCcw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import axios from "axios";

import Swal from "sweetalert2";

import api_base from "../apibase";

export default function AdminNavbar({ setSidebarOpen }) {

    const [profileOpen, setProfileOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    const [searchResults, setSearchResults] = useState(null);

    const [searchLoading, setSearchLoading] = useState(false);

    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationLoading, setNotificationLoading] = useState(false);

    const searchRef = useRef(null);

    const navigate = useNavigate();

    // =====================================================
    // LOGOUT
    // =====================================================

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

                setProfileOpen(false);

                await Swal.fire({
                    title: "Logged Out",
                    text: response.data.msg,
                    icon: "success",
                    timer: 1200,
                    showConfirmButton: false,
                });

                navigate("/login", {
                    replace: true,
                });
            }

        } catch (error) {

            console.log(error);

            Swal.fire({
                title: "Error",
                text:
                    error.response?.data?.msg ||
                    "Logout failed",
                icon: "error",
            });
        }
    };

    // =====================================================
    // GLOBAL SEARCH
    // =====================================================

    useEffect(() => {

        const query = searchQuery.trim();

        if (query.length < 2) {

            setSearchResults(null);
            setSearchLoading(false);

            return;
        }

        const timer = setTimeout(async () => {

            try {

                setSearchLoading(true);

                const response = await axios.get(
                    `${api_base}admin/search/`,
                    {
                        params: {
                            q: query,
                        },
                        withCredentials: true,
                    }
                );

                setSearchResults(
                    response.data
                );

            } catch (error) {

                console.log(
                    "Admin Search Error:",
                    error
                );

                setSearchResults(null);

            } finally {

                setSearchLoading(false);
            }

        }, 300);

        return () => clearTimeout(timer);

    }, [searchQuery]);

    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    const fetchNotifications = async () => {

        try {

            setNotificationLoading(true);

            const response = await axios.get(
                `${api_base}admin/notifications/`,
                {
                    withCredentials: true,
                }
            );

            if (response.data?.status) {

                setNotifications(
                    response.data.notifications || []
                );

                setUnreadCount(
                    response.data.unread_count || 0
                );

            }

        } catch (error) {

            console.log(
                "Admin Notification Error:",
                error
            );

        } finally {

            setNotificationLoading(false);

        }
    };

    useEffect(() => {

        fetchNotifications();

        const interval = setInterval(
            fetchNotifications,
            10000
        );

        return () => clearInterval(interval);

    }, []);

    const getNotificationIcon = (type) => {

        if (type === "ORDER") {
            return ShoppingBag;
        }

        if (type === "CANCELLED_ORDER") {
            return X;
        }

        if (type === "REVIEW") {
            return Star;
        }

        if (type === "RETURN") {
            return RotateCcw;
        }

        if (type === "CONTACT") {
            return Users;
        }

        return Bell;
    };

    const getNotificationIconClass = (type) => {

        if (type === "ORDER") {
            return "bg-blue-500/10 text-blue-400";
        }

        if (type === "CANCELLED_ORDER") {
            return "bg-red-500/10 text-red-400";
        }

        if (type === "REVIEW") {
            return "bg-yellow-500/10 text-yellow-400";
        }

        if (type === "RETURN") {
            return "bg-orange-500/10 text-orange-400";
        }

        if (type === "CONTACT") {
            return "bg-purple-500/10 text-purple-400";
        }

        return "bg-[#F5A524]/10 text-[#F5A524]";
    };

    const getNotificationTime = (date) => {

        if (!date) {
            return "";
        }

        const notificationDate = new Date(date);
        const now = new Date();

        const difference = Math.max(
            0,
            Math.floor(
                (now.getTime() - notificationDate.getTime()) / 1000
            )
        );

        if (difference < 60) {
            return "Just now";
        }

        if (difference < 3600) {
            return `${Math.floor(difference / 60)} min ago`;
        }

        if (difference < 86400) {
            return `${Math.floor(difference / 3600)} hr ago`;
        }

        if (difference < 604800) {
            return `${Math.floor(difference / 86400)} day ago`;
        }

        return notificationDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const handleNotificationClick = async (notification) => {

        try {

            if (!notification.is_read) {

                await axios.patch(
                    `${api_base}admin/notifications/${notification.id}/read/`,
                    {},
                    {
                        withCredentials: true,
                    }
                );

            }

        } catch (error) {

            console.log(
                "Notification Read Error:",
                error
            );

        } finally {

            setNotificationOpen(false);

            const targetUrl =
                notification.type === "RETURN"
                    ? "/admin/orders"
                    : notification.target_url;

            if (targetUrl) {
                navigate(targetUrl);
            }

            fetchNotifications();

        }
    };

    const handleMarkAllNotificationsRead = async () => {

        try {

            await axios.patch(
                `${api_base}admin/notifications/read-all/`,
                {},
                {
                    withCredentials: true,
                }
            );

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    is_read: true,
                }))
            );

            setUnreadCount(0);

        } catch (error) {

            console.log(
                "Mark All Notifications Error:",
                error
            );

        }
    };

    // =====================================================
    // NOTIFICATION DROPDOWN
    // =====================================================

    const NotificationDropdown = () => {

        if (!notificationOpen) {
            return null;
        }

        return (
            <>
                <div
                    className="fixed inset-0 z-40"
                    onClick={() =>
                        setNotificationOpen(false)
                    }
                />

                <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-white/10 bg-[#181E2A] shadow-2xl shadow-black/40">

                    <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">

                        <div>
                            <div className="flex items-center gap-2">

                                <h3 className="text-sm font-bold text-white">
                                    Notifications
                                </h3>

                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-[#F5A524]/15 px-2 py-0.5 text-[10px] font-bold text-[#F5A524]">
                                        {unreadCount} New
                                    </span>
                                )}

                            </div>

                            <p className="mt-0.5 text-[10px] text-gray-500">
                                Stay updated with your store activity
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllNotificationsRead}
                                className="text-[10px] font-semibold text-[#F5A524] transition-colors hover:text-[#FFC15A]"
                            >
                                Mark all read
                            </button>
                        )}

                    </div>

                    <div className="max-h-[430px] overflow-y-auto">

                        {notificationLoading && notifications.length === 0 ? (

                            <div className="flex items-center justify-center gap-3 px-5 py-10">

                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#F5A524]/30 border-t-[#F5A524]" />

                                <span className="text-xs text-gray-500">
                                    Loading notifications...
                                </span>

                            </div>

                        ) : notifications.length === 0 ? (

                            <div className="px-5 py-12 text-center">

                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04]">
                                    <Bell
                                        size={20}
                                        className="text-gray-600"
                                    />
                                </div>

                                <p className="mt-3 text-sm font-semibold text-gray-300">
                                    No notifications
                                </p>

                                <p className="mt-1 text-xs text-gray-600">
                                    New orders, reviews and messages will appear here.
                                </p>

                            </div>

                        ) : (

                            notifications.map((notification) => {

                                const NotificationIcon =
                                    getNotificationIcon(
                                        notification.type
                                    );

                                return (
                                    <button
                                        type="button"
                                        key={notification.id}
                                        onClick={() =>
                                            handleNotificationClick(
                                                notification
                                            )
                                        }
                                        className={`flex w-full items-start gap-3 border-b border-white/[0.05] px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04] ${
                                            notification.is_read
                                                ? ""
                                                : "bg-[#F5A524]/[0.035]"
                                        }`}
                                    >

                                        <div
                                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${getNotificationIconClass(
                                                notification.type
                                            )}`}
                                        >
                                            <NotificationIcon
                                                size={16}
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">

                                            <div className="flex items-start justify-between gap-2">

                                                <p className="truncate text-xs font-semibold text-gray-200">
                                                    {notification.title}
                                                </p>

                                                {!notification.is_read && (
                                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5A524]" />
                                                )}

                                            </div>

                                            <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-gray-500">
                                                {notification.message}
                                            </p>

                                            <div className="mt-1.5 flex items-center gap-1 text-[9px] text-gray-600">

                                                <Clock3 size={10} />

                                                {getNotificationTime(
                                                    notification.created_at
                                                )}

                                            </div>

                                        </div>

                                    </button>
                                );

                            })

                        )}

                    </div>

                </div>
            </>
        );
    };

    // =====================================================
    // CLOSE SEARCH WHEN CLICKING OUTSIDE
    // =====================================================

    useEffect(() => {

        const handleOutsideClick = (event) => {

            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setSearchResults(null);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };

    }, []);

    // =====================================================
    // CLEAR SEARCH
    // =====================================================

    const clearSearch = () => {

        setSearchQuery("");
        setSearchResults(null);
    };

    // =====================================================
    // NAVIGATION
    // =====================================================

    const handleSearchNavigate = (path) => {

        clearSearch();

        setMobileSearchOpen(false);

        navigate(path);
    };

    // =====================================================
    // SEARCH RESULT SECTION
    // =====================================================

    const SearchSection = ({
        title,
        icon: Icon,
        children,
        count,
    }) => {

        if (!children || children.length === 0) {
            return null;
        }

        return (
            <div className="border-b border-white/[0.06] last:border-b-0">

                <div className="flex items-center justify-between px-4 py-2.5">

                    <div className="flex items-center gap-2">

                        <Icon
                            size={14}
                            className="text-[#F5A524]"
                        />

                        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-gray-500">
                            {title}
                        </span>

                    </div>

                    <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-gray-500">
                        {count}
                    </span>

                </div>

                {children}

            </div>
        );
    };

    // =====================================================
    // SEARCH DROPDOWN
    // =====================================================

    const SearchDropdown = () => {

        if (!searchQuery.trim()) {
            return null;
        }

        if (searchLoading) {

            return (
                <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[100] overflow-hidden rounded-2xl border border-white/10 bg-[#181E2A] shadow-2xl shadow-black/40">

                    <div className="flex items-center justify-center gap-3 px-5 py-8">

                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#F5A524]/30 border-t-[#F5A524]" />

                        <span className="text-sm text-gray-400">
                            Searching...
                        </span>

                    </div>

                </div>
            );
        }

        if (!searchResults) {
            return null;
        }

        if (searchResults.total === 0) {

            return (
                <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[100] overflow-hidden rounded-2xl border border-white/10 bg-[#181E2A] shadow-2xl shadow-black/40">

                    <div className="px-5 py-9 text-center">

                        <Search
                            size={28}
                            className="mx-auto mb-3 text-gray-600"
                        />

                        <p className="text-sm font-semibold text-gray-300">
                            No results found
                        </p>

                        <p className="mt-1 text-xs text-gray-600">
                            Try a product, customer or order name
                        </p>

                    </div>

                </div>
            );
        }

        return (
            <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[100] max-h-[520px] overflow-y-auto rounded-2xl border border-white/10 bg-[#181E2A] shadow-2xl shadow-black/40">

                {/* PRODUCTS */}

                <SearchSection
                    title="Products"
                    icon={Package}
                    count={searchResults.products.length}
                >

                    {searchResults.products.map(
                        (product) => (

                            <button
                                key={`product-${product.id}`}
                                onClick={() =>
                                    handleSearchNavigate(
                                        `/adminproducts?product=${product.id}`
                                    )
                                }
                                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
                            >

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/[0.05]">

                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Package
                                            size={16}
                                            className="text-gray-500"
                                        />
                                    )}

                                </div>

                                <div className="min-w-0 flex-1">

                                    <p className="truncate text-sm font-medium text-gray-200">
                                        {product.name}
                                    </p>

                                    <p className="mt-0.5 text-xs text-gray-600">
                                        {product.category || "Product"}
                                        {" • "}
                                        ₹{product.price}
                                    </p>

                                </div>

                            </button>

                        )
                    )}

                </SearchSection>

                {/* CUSTOMERS */}

                <SearchSection
                    title="Customers"
                    icon={Users}
                    count={searchResults.customers.length}
                >

                    {searchResults.customers.map(
                        (customer) => (

                            <button
                                key={`customer-${customer.id}`}
                                onClick={() =>
                                    handleSearchNavigate(
                                        `/admin/customers?customer=${customer.id}`
                                    )
                                }
                                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
                            >

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5A524]/10 text-sm font-bold text-[#F5A524]">
                                    {customer.name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "U"}
                                </div>

                                <div className="min-w-0 flex-1">

                                    <p className="truncate text-sm font-medium text-gray-200">
                                        {customer.name}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-gray-600">
                                        {customer.email}
                                        {" • "}
                                        {customer.mobile}
                                    </p>

                                </div>

                            </button>

                        )
                    )}

                </SearchSection>

                {/* ORDERS */}

                <SearchSection
                    title="Orders"
                    icon={ShoppingBag}
                    count={searchResults.orders.length}
                >

                    {searchResults.orders.map(
                        (order) => (

                            <button
                                key={`order-${order.id}`}
                                onClick={() =>
                                    handleSearchNavigate(
                                        `/admin/orders?order=${order.id}`
                                    )
                                }
                                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
                            >

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">

                                    <ShoppingBag
                                        size={16}
                                        className="text-blue-400"
                                    />

                                </div>

                                <div className="min-w-0 flex-1">

                                    <p className="truncate text-sm font-medium text-gray-200">
                                        {order.order_number}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-gray-600">
                                        {order.customer}
                                        {" • "}
                                        ₹{order.total_amount}
                                    </p>

                                </div>

                                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-semibold text-emerald-400">
                                    {order.status}
                                </span>

                            </button>

                        )
                    )}

                </SearchSection>

                {/* CATEGORIES */}

                <SearchSection
                    title="Categories"
                    icon={Tags}
                    count={searchResults.categories.length}
                >

                    {searchResults.categories.map(
                        (category) => (

                            <button
                                key={`category-${category.id}`}
                                onClick={() =>
                                    handleSearchNavigate(
                                        "/categories"
                                    )
                                }
                                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
                            >

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">

                                    <Tags
                                        size={16}
                                        className="text-purple-400"
                                    />

                                </div>

                                <div className="min-w-0 flex-1">

                                    <p className="truncate text-sm font-medium text-gray-200">
                                        {category.name}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-gray-600">
                                        {category.description ||
                                            category.slug}
                                    </p>

                                </div>

                            </button>

                        )
                    )}

                </SearchSection>

                {/* REVIEWS */}

                <SearchSection
                    title="Reviews"
                    icon={Star}
                    count={searchResults.reviews.length}
                >

                    {searchResults.reviews.map(
                        (review) => (

                            <button
                                key={`review-${review.id}`}
                                onClick={() =>
                                    handleSearchNavigate(
                                        "/admin/reviews"
                                    )
                                }
                                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
                            >

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">

                                    <Star
                                        size={16}
                                        className="text-yellow-400"
                                    />

                                </div>

                                <div className="min-w-0 flex-1">

                                    <p className="truncate text-sm font-medium text-gray-200">
                                        {review.product_name}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-gray-600">
                                        {review.user_name}
                                        {" • "}
                                        {review.rating}/5
                                    </p>

                                </div>

                            </button>

                        )
                    )}

                </SearchSection>

            </div>
        );
    };

    return (
        <>
            <nav className="fixed right-0 top-0 z-40 h-[72px] w-full border-b border-white/[0.06] bg-[#151A24] text-white shadow-sm shadow-black/10 lg:w-[calc(100%-260px)]">

                <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

                    {/* ================= LEFT ================= */}

                    <div className="flex min-w-0 items-center gap-3">

                        <button
                            onClick={() =>
                                setSidebarOpen(true)
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-gray-300 transition-colors hover:bg-white/[0.09] hover:text-white lg:hidden"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5A524] to-[#E08E0B] shadow-lg shadow-[#F5A524]/20">

                                <span className="text-sm font-black tracking-tight text-black">
                                    EC
                                </span>

                            </div>

                            <div className="hidden sm:block">

                                <h1 className="text-[16px] font-bold leading-tight tracking-tight text-white">
                                    E-Commerce
                                </h1>

                                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[1.8px] text-gray-500">
                                    Admin Panel
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* ================= DESKTOP SEARCH ================= */}

                    <div
                        ref={searchRef}
                        className="relative mx-4 hidden max-w-[540px] flex-1 md:flex"
                    >

                        <div className="flex h-10 w-full items-center rounded-xl border border-white/[0.07] bg-white/[0.04] px-3.5 transition-colors focus-within:border-[#F5A524]/40">

                            <Search
                                size={17}
                                className="shrink-0 text-gray-500"
                            />

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(
                                        event.target.value
                                    )
                                }
                                onFocus={() => {

                                    if (
                                        searchQuery.trim().length >= 2
                                    ) {
                                        setSearchResults(
                                            searchResults
                                        );
                                    }

                                }}
                                placeholder="Search products, customers, orders..."
                                className="w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-gray-500"
                            />

                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="mr-2 text-gray-500 transition-colors hover:text-white"
                                >
                                    <X size={15} />
                                </button>
                            )}

                            <span className="hidden rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium text-gray-500 lg:block">
                                Ctrl K
                            </span>

                        </div>

                        <SearchDropdown />

                    </div>

                    {/* ================= RIGHT ================= */}

                    <div className="flex shrink-0 items-center gap-2">

                        {/* MOBILE SEARCH */}

                        <button
                            onClick={() =>
                                setMobileSearchOpen(true)
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-gray-300 transition-colors hover:bg-white/[0.08] hover:text-white md:hidden"
                        >
                            <Search size={17} />
                        </button>

                        {/* NOTIFICATION */}

                        <div className="relative">

                            <button
                                type="button"
                                onClick={() =>
                                    setNotificationOpen(
                                        (prev) => !prev
                                    )
                                }
                                className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-gray-300 transition-colors hover:bg-white/[0.08] hover:text-white ${
                                    notificationOpen
                                        ? "bg-white/[0.08] text-white"
                                        : ""
                                }`}
                            >

                                <Bell
                                    size={18}
                                    className={
                                        unreadCount > 0
                                            ? "animate-[wiggle_0.8s_ease-in-out]"
                                            : ""
                                    }
                                />

                                {unreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-[#F5A524] px-1 text-[9px] font-black leading-none text-black ring-2 ring-[#151A24]">
                                        {unreadCount > 99
                                            ? "99+"
                                            : unreadCount}
                                    </span>
                                )}

                            </button>

                            <NotificationDropdown />

                        </div>

                        <div className="mx-1 hidden h-7 w-px bg-white/10 sm:block" />

                        {/* PROFILE */}

                        <div className="relative">

                            <button
                                onClick={() =>
                                    setProfileOpen(
                                        (prev) => !prev
                                    )
                                }
                                className="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-white/[0.05]"
                            >

                                <div className="relative">

                                    <img
                                        src="https://i.pravatar.cc/100?img=12"
                                        alt="Admin"
                                        className="h-9 w-9 rounded-xl object-cover ring-2 ring-[#F5A524]/40"
                                    />

                                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#151A24] bg-emerald-400" />

                                </div>

                                <div className="hidden text-left sm:block">

                                    <p className="text-sm font-semibold leading-tight text-white">
                                        Admin
                                    </p>

                                    <p className="text-[11px] text-gray-500">
                                        Administrator
                                    </p>

                                </div>

                                <ChevronDown
                                    size={15}
                                    className={`hidden text-gray-400 transition-transform duration-200 sm:block ${profileOpen ? "rotate-180" : ""}`}
                                />

                            </button>

                            {/* PROFILE DROPDOWN */}

                            {profileOpen && (
                                <>

                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() =>
                                            setProfileOpen(false)
                                        }
                                    />

                                    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#181E2A] shadow-2xl shadow-black/30">

                                        <div className="flex items-center gap-3 p-3.5">

                                            <img
                                                src="https://i.pravatar.cc/100?img=12"
                                                alt="Admin"
                                                className="h-10 w-10 rounded-xl object-cover ring-2 ring-[#F5A524]/40"
                                            />

                                            <div>

                                                <p className="text-sm font-semibold text-white">
                                                    Admin Account
                                                </p>

                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    Administrator
                                                </p>

                                            </div>

                                        </div>

                                        <div className="border-t border-white/10" />

                                        <div className="p-1.5">

                                            <button
                                                onClick={() =>
                                                    setProfileOpen(
                                                        false
                                                    )
                                                }
                                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/[0.05] hover:text-white"
                                            >

                                                <Settings size={16} />

                                                <span>
                                                    Profile Settings
                                                </span>

                                            </button>

                                            <button
                                                onClick={
                                                    handleLogout
                                                }
                                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                                            >

                                                <LogOut size={16} />

                                                <span>
                                                    Logout
                                                </span>

                                            </button>

                                        </div>

                                    </div>

                                </>
                            )}

                        </div>

                    </div>

                </div>

            </nav>

            {/* =================================================
                MOBILE SEARCH OVERLAY
            ================================================= */}

            {mobileSearchOpen && (

                <div className="fixed inset-0 z-[200] bg-[#0B0F17] md:hidden">

                    <div className="flex h-[72px] items-center gap-3 border-b border-white/[0.06] bg-[#151A24] px-4">

                        <button
                            onClick={() => {
                                setMobileSearchOpen(false);
                                clearSearch();
                            }}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-gray-300"
                        >
                            <X size={20} />
                        </button>

                        <div
                            ref={searchRef}
                            className="relative flex-1"
                        >

                            <div className="flex h-10 items-center rounded-xl border border-white/[0.07] bg-white/[0.04] px-3">

                                <Search
                                    size={17}
                                    className="shrink-0 text-gray-500"
                                />

                                <input
                                    autoFocus
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) =>
                                        setSearchQuery(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search anything..."
                                    className="w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-gray-500"
                                />

                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="text-gray-500 hover:text-white"
                                    >
                                        <X size={15} />
                                    </button>
                                )}

                            </div>

                            <SearchDropdown />

                        </div>

                    </div>

                </div>

            )}

        </>
    );
}