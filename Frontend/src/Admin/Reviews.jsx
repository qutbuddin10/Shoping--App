import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import {
    Search,
    Star,
    RefreshCw,
    CheckCircle,
    Clock3,
    Trash2,
    MessageSquare,
    User,
    Package,
} from "lucide-react";

import AdminLayout from "./AdminLayout";
import api_base from "../apibase";

export default function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [approvingId, setApprovingId] = useState(null);

    // =====================================================
    // FETCH REVIEWS
    // =====================================================

    const fetchReviews = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${api_base}admin/reviews/`,
                {
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                setReviews(response.data.reviews || []);
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
                        "Unable to load reviews.",
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
        fetchReviews();
    }, []);

    // =====================================================
    // APPROVE REVIEW
    // =====================================================

    const handleApprove = async (review) => {
        const result = await Swal.fire({
            title: "Approve Review?",
            text: "This review will become visible to customers.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Approve",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            setApprovingId(review.id);

            const response = await axios.patch(
                `${api_base}admin/reviews/${review.id}/approve/`,
                {},
                {
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                Swal.fire({
                    title: "Approved!",
                    text:
                        response.data?.msg ||
                        "Review approved successfully.",
                    icon: "success",
                    timer: 1600,
                    showConfirmButton: false,
                });

                fetchReviews();
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text:
                    error.response?.data?.msg ||
                    "Unable to approve review.",
                icon: "error",
            });
        } finally {
            setApprovingId(null);
        }
    };

    // =====================================================
    // DELETE REVIEW
    // =====================================================

    const handleDelete = async (review) => {
        const result = await Swal.fire({
            title: "Delete Review?",
            text: `Delete review by ${review.user_name}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
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
                `${api_base}admin/reviews/${review.id}/delete/`,
                {
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                Swal.fire({
                    title: "Deleted!",
                    text:
                        response.data?.msg ||
                        "Review deleted successfully.",
                    icon: "success",
                    timer: 1600,
                    showConfirmButton: false,
                });

                fetchReviews();
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text:
                    error.response?.data?.msg ||
                    "Unable to delete review.",
                icon: "error",
            });
        }
    };

    // =====================================================
    // FILTER + SEARCH
    // =====================================================

    const filteredReviews = useMemo(() => {
        const value = search.toLowerCase().trim();

        return reviews.filter((review) => {
            const matchesFilter =
                filter === "all" ||
                (filter === "pending" &&
                    !review.is_approved) ||
                (filter === "approved" &&
                    review.is_approved);

            const matchesSearch =
                !value ||
                review.product_name
                    ?.toLowerCase()
                    .includes(value) ||
                review.user_name
                    ?.toLowerCase()
                    .includes(value) ||
                review.user_email
                    ?.toLowerCase()
                    .includes(value) ||
                review.comment
                    ?.toLowerCase()
                    .includes(value);

            return matchesFilter && matchesSearch;
        });
    }, [reviews, filter, search]);

    // =====================================================
    // COUNTS
    // =====================================================

    const totalReviews = reviews.length;

    const pendingReviews = reviews.filter(
        (review) => !review.is_approved
    ).length;

    const approvedReviews = reviews.filter(
        (review) => review.is_approved
    ).length;

    // =====================================================
    // RATING STARS
    // =====================================================

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        className={
                            star <= rating
                                ? "fill-[#F5A524] text-[#F5A524]"
                                : "text-gray-700"
                        }
                    />
                ))}
            </div>
        );
    };

    // =====================================================
    // MOBILE REVIEW CARD
    // =====================================================

    const renderReviewCard = (review) => {
        return (
            <div
                key={review.id}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
            >
                {/* PRODUCT */}

                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-[#F5A524]/10 flex items-center justify-center">
                            <Package
                                size={18}
                                className="text-[#F5A524]"
                            />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                                {review.product_name}
                            </p>

                            <p className="text-[11px] text-gray-600 mt-0.5">
                                Review #{review.id}
                            </p>
                        </div>
                    </div>

                    {/* STATUS */}

                    {review.is_approved ? (
                        <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                            <CheckCircle size={12} />
                            Approved
                        </span>
                    ) : (
                        <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-medium">
                            <Clock3 size={12} />
                            Pending
                        </span>
                    )}
                </div>

                {/* CUSTOMER */}

                <div className="flex items-center gap-2 mt-4">
                    <User
                        size={15}
                        className="text-gray-500 shrink-0"
                    />

                    <div className="min-w-0">
                        <p className="text-sm text-gray-300 truncate">
                            {review.user_name}
                        </p>

                        <p className="text-xs text-gray-600 truncate">
                            {review.user_email}
                        </p>
                    </div>
                </div>

                {/* RATING */}

                <div className="flex items-center gap-3 mt-4">
                    {renderStars(review.rating)}

                    <span className="text-xs text-gray-500">
                        {review.rating}/5
                    </span>
                </div>

                {/* COMMENT */}

                <div className="mt-4 p-3 rounded-xl bg-white/[0.025] border border-white/[0.05]">
                    <div className="flex items-start gap-2">
                        <MessageSquare
                            size={14}
                            className="text-gray-600 mt-0.5 shrink-0"
                        />

                        <p className="text-sm text-gray-400 leading-6 break-words">
                            {review.comment ||
                                "No comment provided."}
                        </p>
                    </div>
                </div>

                {/* DATE */}

                <p className="text-xs text-gray-600 mt-3">
                    {review.created_at}
                </p>

                {/* ACTIONS */}

                <div className="flex gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                    {!review.is_approved && (
                        <button
                            type="button"
                            onClick={() =>
                                handleApprove(review)
                            }
                            disabled={
                                approvingId === review.id
                            }
                            className="flex-1 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {approvingId === review.id ? (
                                <RefreshCw
                                    size={15}
                                    className="animate-spin"
                                />
                            ) : (
                                <CheckCircle size={15} />
                            )}

                            <span className="text-sm">
                                Approve
                            </span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() =>
                            handleDelete(review)
                        }
                        className="flex-1 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition flex items-center justify-center gap-2"
                    >
                        <Trash2 size={15} />

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
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 shrink-0 rounded-xl bg-[#F5A524]/15 flex items-center justify-center">
                                <MessageSquare
                                    size={21}
                                    className="text-[#F5A524]"
                                />
                            </div>

                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                                    Reviews
                                </h1>

                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Manage and approve customer reviews
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={fetchReviews}
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
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        Total Reviews
                                    </p>

                                    <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                                        {totalReviews}
                                    </h2>
                                </div>

                                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <MessageSquare
                                        size={20}
                                        className="text-blue-400"
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-4">
                                All customer reviews
                            </p>
                        </div>

                        {/* PENDING */}

                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        Pending
                                    </p>

                                    <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                                        {pendingReviews}
                                    </h2>
                                </div>

                                <div className="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                                    <Clock3
                                        size={20}
                                        className="text-yellow-400"
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-yellow-400 mt-4">
                                Waiting for approval
                            </p>
                        </div>

                        {/* APPROVED */}

                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        Approved
                                    </p>

                                    <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                                        {approvedReviews}
                                    </h2>
                                </div>

                                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <CheckCircle
                                        size={20}
                                        className="text-emerald-400"
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-emerald-400 mt-4">
                                Visible to customers
                            </p>
                        </div>
                    </div>

                    {/* =================================================
                        MAIN CARD
                    ================================================= */}

                    <div className="w-full min-w-0 rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
                        {/* =================================================
                            SEARCH + FILTER
                        ================================================= */}

                        <div className="p-4 sm:p-5 border-b border-white/[0.06]">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                {/* TITLE */}

                                <div>
                                    <h2 className="text-base sm:text-lg font-semibold">
                                        Review List
                                    </h2>

                                    <p className="text-xs text-gray-500 mt-1">
                                        {
                                            filteredReviews.length
                                        }{" "}
                                        reviews found
                                    </p>
                                </div>

                                {/* SEARCH + FILTER */}

                                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                    <div className="relative w-full sm:w-[300px]">
                                        <Search
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                                        />

                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="Search reviews..."
                                            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-gray-600 outline-none focus:border-[#F5A524]/50 transition"
                                        />
                                    </div>

                                    <select
                                        value={filter}
                                        onChange={(e) =>
                                            setFilter(
                                                e.target.value
                                            )
                                        }
                                        className="w-full sm:w-[150px] h-11 px-3 rounded-xl bg-[#111722] border border-white/10 text-gray-300 outline-none focus:border-[#F5A524]/50"
                                    >
                                        <option value="all">
                                            All Reviews
                                        </option>

                                        <option value="pending">
                                            Pending
                                        </option>

                                        <option value="approved">
                                            Approved
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            MOBILE + TABLET CARDS
                        ================================================= */}

                        <div className="block lg:hidden">
                            {loading ? (
                                <div className="py-16 text-center">
                                    <RefreshCw
                                        size={26}
                                        className="animate-spin mx-auto text-[#F5A524]"
                                    />

                                    <p className="text-sm text-gray-500 mt-3">
                                        Loading reviews...
                                    </p>
                                </div>
                            ) : filteredReviews.length ===
                              0 ? (
                                <div className="py-16 text-center px-5">
                                    <MessageSquare
                                        size={36}
                                        className="mx-auto text-gray-700"
                                    />

                                    <p className="text-gray-400 mt-3">
                                        No reviews found
                                    </p>

                                    <p className="text-xs text-gray-600 mt-1">
                                        Customer reviews will
                                        appear here
                                    </p>
                                </div>
                            ) : (
                                <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    {filteredReviews.map(
                                        (review) =>
                                            renderReviewCard(
                                                review
                                            )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* =================================================
                            DESKTOP TABLE
                        ================================================= */}

                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/[0.06]">
                                        <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                                            Product
                                        </th>

                                        <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                                            Customer
                                        </th>

                                        <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                                            Rating
                                        </th>

                                        <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                                            Review
                                        </th>

                                        <th className="text-center px-6 py-4 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                                            Status
                                        </th>

                                        <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                                            Date
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
                                                colSpan="7"
                                                className="py-16 text-center"
                                            >
                                                <RefreshCw
                                                    size={26}
                                                    className="animate-spin mx-auto text-[#F5A524]"
                                                />

                                                <p className="text-sm text-gray-500 mt-3">
                                                    Loading reviews...
                                                </p>
                                            </td>
                                        </tr>
                                    ) : filteredReviews.length ===
                                      0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="py-16 text-center"
                                            >
                                                <MessageSquare
                                                    size={36}
                                                    className="mx-auto text-gray-700"
                                                />

                                                <p className="text-gray-400 mt-3">
                                                    No reviews found
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredReviews.map(
                                            (review) => (
                                                <tr
                                                    key={
                                                        review.id
                                                    }
                                                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition"
                                                >
                                                    {/* PRODUCT */}

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3 min-w-[180px]">
                                                            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#F5A524]/10 flex items-center justify-center">
                                                                <Package
                                                                    size={
                                                                        17
                                                                    }
                                                                    className="text-[#F5A524]"
                                                                />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="font-medium text-white truncate max-w-[180px]">
                                                                    {
                                                                        review.product_name
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-gray-600 mt-0.5">
                                                                    Review
                                                                    #
                                                                    {
                                                                        review.id
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* CUSTOMER */}

                                                    <td className="px-6 py-4">
                                                        <div className="min-w-[180px]">
                                                            <p className="text-sm text-gray-300 truncate max-w-[180px]">
                                                                {
                                                                    review.user_name
                                                                }
                                                            </p>

                                                            <p className="text-xs text-gray-600 truncate max-w-[180px] mt-1">
                                                                {
                                                                    review.user_email
                                                                }
                                                            </p>
                                                        </div>
                                                    </td>

                                                    {/* RATING */}

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {renderStars(
                                                                review.rating
                                                            )}

                                                            <span className="text-xs text-gray-500">
                                                                {
                                                                    review.rating
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* COMMENT */}

                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-gray-400 max-w-[280px] line-clamp-2">
                                                            {review.comment ||
                                                                "No comment provided."}
                                                        </p>
                                                    </td>

                                                    {/* STATUS */}

                                                    <td className="px-6 py-4 text-center">
                                                        {review.is_approved ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                                                                <CheckCircle
                                                                    size={
                                                                        13
                                                                    }
                                                                />

                                                                Approved
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
                                                                <Clock3
                                                                    size={
                                                                        13
                                                                    }
                                                                />

                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* DATE */}

                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-500 whitespace-nowrap">
                                                            {
                                                                review.created_at
                                                            }
                                                        </span>
                                                    </td>

                                                    {/* ACTION */}

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {!review.is_approved && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleApprove(
                                                                            review
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        approvingId ===
                                                                        review.id
                                                                    }
                                                                    title="Approve Review"
                                                                    className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition disabled:opacity-50"
                                                                >
                                                                    {approvingId ===
                                                                    review.id ? (
                                                                        <RefreshCw
                                                                            size={
                                                                                17
                                                                            }
                                                                            className="animate-spin"
                                                                        />
                                                                    ) : (
                                                                        <CheckCircle
                                                                            size={
                                                                                17
                                                                            }
                                                                        />
                                                                    )}
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        review
                                                                    )
                                                                }
                                                                title="Delete Review"
                                                                className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-red-400 hover:bg-red-500/10 transition"
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
            </div>
        </AdminLayout>
    );
}