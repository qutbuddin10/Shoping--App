import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSearchParams } from "react-router-dom";

import {
    Search,
    Users,
    UserCheck,
    UserPlus,
    Mail,
    Phone,
    CalendarDays,
    RefreshCw,
    Eye,
    Trash2,
} from "lucide-react";

import AdminLayout from "./AdminLayout";
import api_base from "../apibase";

export default function CustomersList() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchParams] = useSearchParams();
    const customerId = searchParams.get("customer");

    // =====================================================
    // FETCH CUSTOMERS
    // =====================================================

    const fetchCustomers = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${api_base}admin/customers/`,
                {
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                setCustomers(response.data.customers || []);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                Swal.fire({
                    title: "Session Expired",
                    text: "Please login as admin again.",
                    icon: "warning",
                });
            } else {
                Swal.fire({
                    title: "Error",
                    text:
                        error.response?.data?.msg ||
                        "Unable to load customers.",
                    icon: "error",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchCustomers();
    }, []);

    // =====================================================
    // OPEN CUSTOMER FROM GLOBAL ADMIN SEARCH
    // =====================================================

    useEffect(() => {
        if (!customerId || customers.length === 0) {
            return;
        }

        const customer = customers.find(
            (item) => String(item.id) === String(customerId)
        );

        if (customer) {
            setSelectedCustomer(customer);
        }
    }, [customerId, customers]);

    // =====================================================
    // SEARCH
    // =====================================================

    const filteredCustomers = useMemo(() => {
        const value = search.toLowerCase().trim();

        if (!value) {
            return customers;
        }

        return customers.filter(
            (customer) =>
                customer.full_name
                    ?.toLowerCase()
                    .includes(value) ||
                customer.email
                    ?.toLowerCase()
                    .includes(value) ||
                customer.mobile
                    ?.toLowerCase()
                    .includes(value)
        );
    }, [customers, search]);

    // =====================================================
    // STATISTICS
    // =====================================================

    const totalCustomers = customers.length;

    const newCustomers = customers.filter((customer) => {
        const createdDate = new Date(
            customer.created_at
        );

        return !isNaN(createdDate.getTime());
    }).length;

    // =====================================================
    // DELETE CUSTOMER
    // =====================================================

    const handleDeleteCustomer = async (customer) => {
        const result = await Swal.fire({
            title: "Delete Customer?",
            text: `Are you sure you want to delete ${customer.full_name}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await axios.delete(
                `${api_base}admin/customers/${customer.id}/delete/`,
                {
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                Swal.fire({
                    title: "Deleted!",
                    text:
                        response.data?.msg ||
                        "Customer deleted successfully.",
                    icon: "success",
                    timer: 1800,
                    showConfirmButton: false,
                });

                setSelectedCustomer(null);

                fetchCustomers();
            }
        } catch (error) {
            if (error.response?.status === 401) {
                Swal.fire({
                    title: "Session Expired",
                    text: "Please login as admin again.",
                    icon: "warning",
                });
            } else {
                Swal.fire({
                    title: "Error",
                    text:
                        error.response?.data?.msg ||
                        "Unable to delete customer.",
                    icon: "error",
                });
            }
        }
    };

    // =====================================================
    // CUSTOMER CARD
    // =====================================================

    const renderCustomerCard = (customer) => {
        return (
            <div
                key={customer.id}
                className="w-full min-w-0 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
            >
                {/* =================================================
                    CUSTOMER HEADER
                ================================================= */}

                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-[#F5A524] to-[#E08E0B] flex items-center justify-center text-black font-bold">
                            {customer.full_name
                                ?.charAt(0)
                                ?.toUpperCase()}
                        </div>

                        <div className="min-w-0">
                            <p className="font-semibold text-white truncate">
                                {customer.full_name}
                            </p>

                            <p className="text-xs text-gray-600 mt-0.5">
                                ID #{customer.id}
                            </p>
                        </div>
                    </div>

                    {/* STATUS */}

                    <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Active
                    </span>
                </div>

                {/* =================================================
                    CUSTOMER DETAILS
                ================================================= */}

                <div className="mt-4 space-y-3">
                    {/* EMAIL */}

                    <div className="flex items-center gap-2 min-w-0">
                        <Mail
                            size={15}
                            className="text-gray-500 shrink-0"
                        />

                        <span className="text-sm text-gray-400 truncate">
                            {customer.email}
                        </span>
                    </div>

                    {/* MOBILE */}

                    <div className="flex items-center gap-2 min-w-0">
                        <Phone
                            size={15}
                            className="text-gray-500 shrink-0"
                        />

                        <span className="text-sm text-gray-400 truncate">
                            {customer.mobile ||
                                "Not provided"}
                        </span>
                    </div>

                    {/* REGISTERED DATE */}

                    <div className="flex items-center gap-2 min-w-0">
                        <CalendarDays
                            size={15}
                            className="text-gray-500 shrink-0"
                        />

                        <span className="text-sm text-gray-400 truncate">
                            {customer.created_at}
                        </span>
                    </div>
                </div>

                {/* =================================================
                    MOBILE / TABLET ACTIONS
                ================================================= */}

                <div className="flex gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                    {/* VIEW */}

                    <button
                        type="button"
                        onClick={() =>
                            setSelectedCustomer(customer)
                        }
                        className="flex-1 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:bg-white/[0.08] transition flex items-center justify-center gap-2"
                    >
                        <Eye size={16} />

                        <span className="text-sm">
                            View
                        </span>
                    </button>

                    {/* DELETE */}

                    <button
                        type="button"
                        onClick={() =>
                            handleDeleteCustomer(customer)
                        }
                        className="flex-1 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} />

                        <span className="text-sm">
                            Delete
                        </span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="min-h-screen w-full min-w-0 bg-[#0B0F19] text-white overflow-x-hidden">
                <div className="w-full min-w-0 p-3 sm:p-5 lg:p-8 space-y-5 lg:space-y-6">
                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl bg-[#F5A524]/15 flex items-center justify-center">
                                    <Users
                                        size={20}
                                        className="text-[#F5A524]"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                                        Customers
                                    </h1>

                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                        Manage all registered customers
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* REFRESH */}

                        <button
                            type="button"
                            onClick={fetchCustomers}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition"
                        >
                            <RefreshCw
                                size={16}
                                className={
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Refresh
                        </button>
                    </div>

                    {/* =================================================
                        STATS
                    ================================================= */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {/* TOTAL */}

                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        Total Customers
                                    </p>

                                    <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                                        {totalCustomers}
                                    </h2>
                                </div>

                                <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <Users
                                        size={20}
                                        className="text-blue-400"
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-4">
                                All registered users
                            </p>
                        </div>

                        {/* ACTIVE */}

                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        Active Customers
                                    </p>

                                    <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                                        {totalCustomers}
                                    </h2>
                                </div>

                                <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <UserCheck
                                        size={20}
                                        className="text-emerald-400"
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-emerald-400 mt-4">
                                Currently registered
                            </p>
                        </div>

                        {/* GROWTH */}

                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        Customer Growth
                                    </p>

                                    <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                                        +{newCustomers}
                                    </h2>
                                </div>

                                <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl bg-[#F5A524]/10 flex items-center justify-center">
                                    <UserPlus
                                        size={20}
                                        className="text-[#F5A524]"
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-4">
                                Registered customers
                            </p>
                        </div>
                    </div>

                    {/* =================================================
                        MAIN CARD
                    ================================================= */}

                    <div className="w-full min-w-0 rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
                        {/* =================================================
                            SEARCH HEADER
                        ================================================= */}

                        <div className="p-4 sm:p-5 border-b border-white/[0.06]">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <h2 className="text-base sm:text-lg font-semibold">
                                        Customer List
                                    </h2>

                                    <p className="text-xs text-gray-500 mt-1">
                                        {
                                            filteredCustomers.length
                                        }{" "}
                                        customers found
                                    </p>
                                </div>

                                {/* SEARCH */}

                                <div className="relative w-full lg:w-[320px]">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    />

                                    <input
                                        type="text"
                                        placeholder="Search customers..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-gray-600 outline-none focus:border-[#F5A524]/50 transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            MOBILE + TABLET
                            < 1024px
                        ================================================= */}

                        <div className="block lg:hidden">
                            {loading ? (
                                <div className="py-16 text-center">
                                    <RefreshCw
                                        size={25}
                                        className="animate-spin mx-auto text-[#F5A524]"
                                    />

                                    <p className="text-sm text-gray-500 mt-3">
                                        Loading customers...
                                    </p>
                                </div>
                            ) : filteredCustomers.length ===
                              0 ? (
                                <div className="py-16 text-center px-5">
                                    <Users
                                        size={35}
                                        className="mx-auto text-gray-700"
                                    />

                                    <p className="text-gray-400 mt-3">
                                        No customers found
                                    </p>

                                    <p className="text-xs text-gray-600 mt-1">
                                        Registered users will
                                        appear here
                                    </p>
                                </div>
                            ) : (
                                <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    {filteredCustomers.map(
                                        (customer) =>
                                            renderCustomerCard(
                                                customer
                                            )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* =================================================
                            DESKTOP TABLE
                            >= 1024px
                        ================================================= */}

                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/[0.06]">
                                        <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                                            Customer
                                        </th>

                                        <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                                            Email
                                        </th>

                                        <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                                            Mobile
                                        </th>

                                        <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                                            Registered
                                        </th>

                                        <th className="text-center px-6 py-4 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                                            Status
                                        </th>

                                        <th className="text-right px-6 py-4 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="text-center py-16"
                                            >
                                                <RefreshCw
                                                    size={25}
                                                    className="animate-spin mx-auto text-[#F5A524]"
                                                />

                                                <p className="text-sm text-gray-500 mt-3">
                                                    Loading customers...
                                                </p>
                                            </td>
                                        </tr>
                                    ) : filteredCustomers.length ===
                                      0 ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="text-center py-16"
                                            >
                                                <Users
                                                    size={35}
                                                    className="mx-auto text-gray-700"
                                                />

                                                <p className="text-gray-400 mt-3">
                                                    No customers found
                                                </p>

                                                <p className="text-xs text-gray-600 mt-1">
                                                    Registered users
                                                    will appear here
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCustomers.map(
                                            (customer) => (
                                                <tr
                                                    key={
                                                        customer.id
                                                    }
                                                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition"
                                                >
                                                    {/* CUSTOMER */}

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#F5A524] to-[#E08E0B] flex items-center justify-center text-black font-bold">
                                                                {customer.full_name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    ?.toUpperCase()}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="font-medium text-white truncate max-w-[180px]">
                                                                    {
                                                                        customer.full_name
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-gray-600">
                                                                    ID #
                                                                    {
                                                                        customer.id
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* EMAIL */}

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-400 max-w-[240px]">
                                                            <Mail
                                                                size={
                                                                    15
                                                                }
                                                                className="shrink-0"
                                                            />

                                                            <span className="truncate">
                                                                {
                                                                    customer.email
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* MOBILE */}

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-400">
                                                            <Phone
                                                                size={
                                                                    15
                                                                }
                                                            />

                                                            <span>
                                                                {customer.mobile ||
                                                                    "Not provided"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* DATE */}

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-400">
                                                            <CalendarDays
                                                                size={
                                                                    15
                                                                }
                                                            />

                                                            <span>
                                                                {
                                                                    customer.created_at
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* STATUS */}

                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                                                            Active
                                                        </span>
                                                    </td>

                                                    {/* ACTION */}

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* VIEW */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setSelectedCustomer(
                                                                        customer
                                                                    )
                                                                }
                                                                title="View Customer"
                                                                className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition"
                                                            >
                                                                <Eye
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </button>

                                                            {/* DELETE */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteCustomer(
                                                                        customer
                                                                    )
                                                                }
                                                                title="Delete Customer"
                                                                className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                                                            >
                                                                <Trash2
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    CUSTOMER MODAL
                ================================================= */}

                {selectedCustomer && (
                    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
                        <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#111722] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
                            {/* MODAL HEADER */}

                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg sm:text-xl font-semibold">
                                    Customer Details
                                </h2>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedCustomer(
                                            null
                                        )
                                    }
                                    className="w-8 h-8 shrink-0 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
                                >
                                    ×
                                </button>
                            </div>

                            {/* CUSTOMER */}

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-[#F5A524] to-[#E08E0B] flex items-center justify-center text-black text-xl font-bold">
                                    {selectedCustomer.full_name
                                        ?.charAt(0)
                                        ?.toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-semibold text-lg truncate">
                                        {
                                            selectedCustomer.full_name
                                        }
                                    </h3>

                                    <p className="text-xs text-gray-500 mt-1">
                                        Customer ID #
                                        {
                                            selectedCustomer.id
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* DETAILS */}

                            <div className="space-y-3">
                                {/* EMAIL */}

                                <div className="p-3 rounded-xl bg-white/[0.03]">
                                    <p className="text-xs text-gray-600">
                                        Email
                                    </p>

                                    <p className="text-sm text-gray-300 mt-1 break-all">
                                        {
                                            selectedCustomer.email
                                        }
                                    </p>
                                </div>

                                {/* MOBILE */}

                                <div className="p-3 rounded-xl bg-white/[0.03]">
                                    <p className="text-xs text-gray-600">
                                        Mobile
                                    </p>

                                    <p className="text-sm text-gray-300 mt-1">
                                        {selectedCustomer.mobile ||
                                            "Not provided"}
                                    </p>
                                </div>

                                {/* REGISTERED */}

                                <div className="p-3 rounded-xl bg-white/[0.03]">
                                    <p className="text-xs text-gray-600">
                                        Registered On
                                    </p>

                                    <p className="text-sm text-gray-300 mt-1">
                                        {
                                            selectedCustomer.created_at
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* CLOSE */}

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedCustomer(
                                        null
                                    )
                                }
                                className="w-full mt-6 h-11 rounded-xl bg-[#F5A524] text-black font-semibold hover:bg-[#e99a18] transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}