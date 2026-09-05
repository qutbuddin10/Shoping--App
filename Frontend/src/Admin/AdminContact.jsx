import { useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Mail,
    MessageSquare,
    Send,
    Phone,
    RefreshCw,
    Search,
    Trash2,
    User,
    X,
} from "lucide-react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import api_base from "../apibase";

const STATUS_OPTIONS = ["New", "Read", "In Progress", "Resolved"];

function getStatusClass(status) {
    switch (status) {
        case "Resolved":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "In Progress":
            return "bg-blue-50 text-blue-700 border-blue-200";
        case "Read":
            return "bg-purple-50 text-purple-700 border-purple-200";
        default:
            return "bg-amber-50 text-amber-700 border-amber-200";
    }
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function StatCard({ label, value, icon: Icon, tone }) {
    return (
        <div className="rounded-[22px] border border-white/10 bg-[#111722] p-5 shadow-sm shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-md">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-medium text-gray-400">{label}</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-white">
                        {value}
                    </p>
                </div>

                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
                    <Icon size={19} />
                </div>
            </div>
        </div>
    );
}

function MessageModal({ message, onClose, onStatusChange, onDelete, onReply, updating, replying, deleting }) {
    const [response, setResponse] = useState(message?.admin_response || "");

    useEffect(() => {
        setResponse(message?.admin_response || "");
    }, [message]);

    if (!message) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-[#111722] shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-7">
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#C58A22]">
                            Contact Query
                        </p>

                        <h2 className="mt-1 truncate text-xl font-bold text-white sm:text-2xl">
                            {message.subject || "No Subject"}
                        </h2>

                        <p className="mt-1 text-xs text-gray-400">
                            {formatDate(message.created_at)}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white/10 hover:text-white"
                    >
                        <X size={19} />
                    </button>
                </div>

                <div className="max-h-[calc(92vh-90px)] overflow-y-auto px-5 py-5 sm:px-7 sm:py-7">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-[#171D29] p-4">
                            <div className="flex items-center gap-2 text-gray-400">
                                <User size={15} />
                                <span className="text-[10px] font-semibold uppercase tracking-wide">
                                    Customer
                                </span>
                            </div>
                            <p className="mt-2 truncate text-sm font-semibold text-white">
                                {message.name || "Unknown"}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#171D29] p-4">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Mail size={15} />
                                <span className="text-[10px] font-semibold uppercase tracking-wide">
                                    Email
                                </span>
                            </div>
                            <p className="mt-2 break-all text-sm font-semibold text-white">
                                {message.email || "—"}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#171D29] p-4">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Phone size={15} />
                                <span className="text-[10px] font-semibold uppercase tracking-wide">
                                    Phone
                                </span>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-white">
                                {message.phone || "—"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-[#171D29] p-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-gray-400">
                            Customer Message
                        </p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-300">
                            {message.message || "No message provided."}
                        </p>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-[#171D29] p-5">
                        <div className="flex items-center gap-2">
                            <MessageSquare size={16} className="text-[#F5A524]" />
                            <div>
                                <p className="text-xs font-semibold text-white">
                                    Admin Response
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                    Send a response to this customer. It will appear in their My Profile.
                                </p>
                            </div>
                        </div>

                        <textarea
                            value={response}
                            onChange={(event) => setResponse(event.target.value)}
                            placeholder="Write your response to the customer..."
                            rows={5}
                            disabled={replying}
                            className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-[#111722] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-gray-500 focus:border-[#D6A23A] focus:ring-4 focus:ring-[#D6A23A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <div className="mt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={() => onReply(message.id, response)}
                                disabled={replying || !response.trim()}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#F5A524] px-5 text-sm font-semibold text-black transition hover:bg-[#FFB52E] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Send size={16} />
                                {replying ? "Sending..." : "Send Response"}
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-[#111722] p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold text-white">
                                    Query Status
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                    Update the status after reviewing the customer request.
                                </p>
                            </div>

                            <div className="relative">
                                <select
                                    value={message.status || "New"}
                                    disabled={updating}
                                    onChange={(event) =>
                                        onStatusChange(message.id, event.target.value)
                                    }
                                    className="h-11 min-w-[165px] appearance-none rounded-xl border border-white/10 bg-[#171D29] px-4 pr-10 text-sm font-medium text-white outline-none transition focus:border-[#D6A23A] focus:ring-4 focus:ring-[#D6A23A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>

                                <ChevronDown
                                    size={15}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <span className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold ${getStatusClass(message.status)}`}>
                                {updating ? "Updating..." : message.status || "New"}
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="button"
                            onClick={() => onDelete(message.id)}
                            disabled={deleting}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Trash2 size={16} />
                            {deleting ? "Deleting..." : "Delete Query"}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="h-11 rounded-xl bg-[#F5A524] px-6 text-sm font-semibold text-black transition hover:bg-[#FFB52E]"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminContact({ darkMode = false }) {
    const [messages, setMessages] = useState([]);
    const [summary, setSummary] = useState({
        total: 0,
        new: 0,
        read: 0,
        in_progress: 0,
        resolved: 0,
    });

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [replying, setReplying] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const fetchMessages = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            else setRefreshing(true);

            setError("");

            const response = await axios.get(
                `${api_base}admin/contact-messages/`,
                { withCredentials: true }
            );

            setMessages(response.data?.messages || []);
            setSummary(
                response.data?.summary || {
                    total: 0,
                    new: 0,
                    read: 0,
                    in_progress: 0,
                    resolved: 0,
                }
            );
        } catch (err) {
            console.error("Admin contact messages error:", err);
            setError(
                err.response?.data?.msg ||
                    "Failed to load contact messages."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const filteredMessages = useMemo(() => {
        const query = search.trim().toLowerCase();

        return messages.filter((message) => {
            const matchesStatus =
                statusFilter === "All" ||
                message.status === statusFilter;

            if (!matchesStatus) return false;
            if (!query) return true;

            return [
                message.name,
                message.email,
                message.phone,
                message.subject,
                message.message,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(query)
                );
        });
    }, [messages, search, statusFilter]);

    const handleStatusChange = async (id, status) => {
        const previousMessage = messages.find(
            (message) => message.id === id
        );

        try {
            setUpdating(true);

            const response = await axios.patch(
                `${api_base}admin/contact-messages/${id}/status/`,
                { status },
                { withCredentials: true }
            );

            const updatedStatus =
                response.data?.contact?.status || status;

            setMessages((previous) =>
                previous.map((message) =>
                    message.id === id
                        ? {
                              ...message,
                              status: updatedStatus,
                              updated_at:
                                  response.data?.contact?.updated_at ||
                                  message.updated_at,
                          }
                        : message
                )
            );

            setSelectedMessage((previous) =>
                previous?.id === id
                    ? {
                          ...previous,
                          status: updatedStatus,
                          updated_at:
                              response.data?.contact?.updated_at ||
                              previous.updated_at,
                      }
                    : previous
            );

            if (
                previousMessage &&
                previousMessage.status !== updatedStatus
            ) {
                setSummary((previous) => {
                    const oldKey =
                        previousMessage.status === "In Progress"
                            ? "in_progress"
                            : previousMessage.status.toLowerCase();

                    const newKey =
                        updatedStatus === "In Progress"
                            ? "in_progress"
                            : updatedStatus.toLowerCase();

                    const next = { ...previous };

                    if (typeof next[oldKey] === "number") {
                        next[oldKey] = Math.max(
                            0,
                            next[oldKey] - 1
                        );
                    }

                    if (typeof next[newKey] === "number") {
                        next[newKey] += 1;
                    }

                    return next;
                });
            }
        } catch (err) {
            console.error("Status update error:", err);
            window.alert(
                err.response?.data?.msg ||
                    "Failed to update contact status."
            );
        } finally {
            setUpdating(false);
        }
    };

    const handleReply = async (id, admin_response) => {
        try {
            setReplying(true);

            const response = await axios.patch(
                `${api_base}admin/contact-messages/${id}/reply/`,
                { admin_response },
                { withCredentials: true }
            );

            const updatedContact = response.data?.contact;

            setMessages((previous) =>
                previous.map((message) =>
                    message.id === id
                        ? {
                              ...message,
                              admin_response:
                                  updatedContact?.admin_response ||
                                  admin_response,
                              admin_response_at:
                                  updatedContact?.admin_response_at ||
                                  message.admin_response_at,
                              status:
                                  updatedContact?.status ||
                                  message.status,
                          }
                        : message
                )
            );

            setSelectedMessage((previous) =>
                previous?.id === id
                    ? {
                          ...previous,
                          admin_response:
                              updatedContact?.admin_response ||
                              admin_response,
                          admin_response_at:
                              updatedContact?.admin_response_at ||
                              previous.admin_response_at,
                          status:
                              updatedContact?.status ||
                              previous.status,
                      }
                    : previous
            );

            await fetchMessages(false);

            window.alert(
                response.data?.msg ||
                    "Response sent successfully."
            );
        } catch (err) {
            console.error("Admin response error:", err);

            window.alert(
                err.response?.data?.msg ||
                    "Failed to send response."
            );
        } finally {
            setReplying(false);
        }
    };

    const handleDelete = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this contact query?"
            )
        ) {
            return;
        }

        try {
            setDeleting(true);

            await axios.delete(
                `${api_base}admin/contact-messages/${id}/delete/`,
                { withCredentials: true }
            );

            setSelectedMessage(null);
            await fetchMessages(false);
        } catch (err) {
            console.error("Delete contact message error:", err);
            window.alert(
                err.response?.data?.msg ||
                    "Failed to delete contact query."
            );
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout darkMode={darkMode}>
                <div className="flex min-h-screen items-center justify-center bg-[#090D16]">
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                        <RefreshCw size={17} className="animate-spin" />
                        Loading contact queries...
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout darkMode={darkMode}>
            <div className="min-h-screen bg-[#090D16] px-1 py-1 text-white">
                <div className="mx-auto max-w-[1600px] space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-[#F5A524]" />
                                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#B68122]">
                                    Customer Support
                                </p>
                            </div>

                            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                Contact Queries
                            </h1>

                            <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                                Manage customer messages and support requests.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => fetchMessages(false)}
                            disabled={refreshing}
                            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-[#111722] px-4 text-sm font-semibold text-gray-200 shadow-sm transition hover:border-[#D6A23A]/50 hover:text-[#F5A524] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
                        >
                            <RefreshCw
                                size={16}
                                className={refreshing ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                        <StatCard
                            label="Total Queries"
                            value={summary.total}
                            icon={MessageSquare}
                            tone="bg-white/5 text-gray-300 border border-white/10"
                        />
                        <StatCard
                            label="New"
                            value={summary.new}
                            icon={AlertCircle}
                            tone="bg-amber-400/10 text-amber-300 border border-amber-400/10"
                        />
                        <StatCard
                            label="Read"
                            value={summary.read}
                            icon={Mail}
                            tone="bg-purple-400/10 text-purple-300 border border-purple-400/10"
                        />
                        <StatCard
                            label="In Progress"
                            value={summary.in_progress}
                            icon={Clock3}
                            tone="bg-blue-400/10 text-blue-300 border border-blue-400/10"
                        />
                        <StatCard
                            label="Resolved"
                            value={summary.resolved}
                            icon={CheckCircle2}
                            tone="bg-emerald-400/10 text-emerald-300 border border-emerald-400/10"
                        />
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-[#111722] p-4 shadow-sm shadow-black/20 sm:p-5">
                        <div className="flex flex-col gap-3 lg:flex-row">
                            <div className="relative flex-1">
                                <Search
                                    size={17}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search by customer, email, subject or message..."
                                    className="h-12 w-full rounded-xl border border-white/10 bg-[#171D29] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#D6A23A] focus:bg-[#171D29] focus:ring-4 focus:ring-[#D6A23A]/10"
                                />
                            </div>

                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(event.target.value)
                                    }
                                    className="h-12 w-full min-w-[180px] appearance-none rounded-xl border border-white/10 bg-[#171D29] px-4 pr-10 text-sm font-medium text-white outline-none transition focus:border-[#D6A23A] focus:bg-[#171D29] focus:ring-4 focus:ring-[#D6A23A]/10"
                                >
                                    <option value="All">All Status</option>
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>

                                <ChevronDown
                                    size={15}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#111722] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                            <div>
                                <h2 className="text-sm font-semibold text-white">
                                    Customer Messages
                                </h2>
                                <p className="mt-1 text-[11px] text-gray-400">
                                    Showing {filteredMessages.length} of{" "}
                                    {messages.length} queries
                                </p>
                            </div>
                        </div>

                        {filteredMessages.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171D29] text-gray-500">
                                    <MessageSquare size={23} />
                                </div>
                                <h3 className="mt-4 text-sm font-semibold text-white">
                                    No contact queries found
                                </h3>
                                <p className="mt-1 text-xs text-gray-400">
                                    Try changing your search or status filter.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full min-w-[900px]">
                                        <thead>
                                            <tr className="border-b border-white/10 bg-[#151B27]">
                                                <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                                    Customer
                                                </th>
                                                <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                                    Subject
                                                </th>
                                                <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                                    Message
                                                </th>
                                                <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredMessages.map((message) => (
                                                <tr
                                                    key={message.id}
                                                    className="border-b border-white/5 transition hover:bg-[#171D29]"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5C451] to-[#C98620] text-xs font-bold text-[#17130A] shadow-[0_6px_18px_rgba(245,165,36,0.15)]">
                                                                {(message.name || "U").charAt(0).toUpperCase()}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="max-w-[170px] truncate text-sm font-semibold text-white">
                                                                    {message.name || "Unknown"}
                                                                </p>
                                                                <p className="mt-1 max-w-[190px] truncate text-[11px] text-gray-400">
                                                                    {message.email || "—"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <p className="max-w-[190px] truncate text-sm font-medium text-gray-200">
                                                            {message.subject || "No Subject"}
                                                        </p>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <p className="max-w-[280px] truncate text-xs text-gray-400">
                                                            {message.message || "—"}
                                                        </p>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(
                                                                message.status
                                                            )}`}
                                                        >
                                                            {message.status || "New"}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4 text-xs text-gray-400">
                                                        {formatDate(message.created_at)}
                                                    </td>

                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedMessage(message)
                                                            }
                                                            className="rounded-lg border border-white/10 bg-[#171D29] px-3 py-2 text-xs font-semibold text-gray-300 transition hover:border-[#D6A23A]/60 hover:bg-[#1C2330] hover:text-[#F5A524]"
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="divide-y divide-white/10 lg:hidden">
                                    {filteredMessages.map((message) => (
                                        <button
                                            type="button"
                                            key={message.id}
                                            onClick={() =>
                                                setSelectedMessage(message)
                                            }
                                            className="block w-full p-4 text-left transition hover:bg-[#FCFAF6] sm:p-5"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-white">
                                                        {message.name || "Unknown"}
                                                    </p>
                                                    <p className="mt-1 truncate text-[11px] text-gray-400">
                                                        {message.email || "—"}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-semibold ${getStatusClass(
                                                        message.status
                                                    )}`}
                                                >
                                                    {message.status || "New"}
                                                </span>
                                            </div>

                                            <p className="mt-4 truncate text-sm font-medium text-gray-200">
                                                {message.subject || "No Subject"}
                                            </p>

                                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400">
                                                {message.message || "No message provided."}
                                            </p>

                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="text-[10px] text-gray-400">
                                                    {formatDate(message.created_at)}
                                                </span>
                                                <span className="text-[10px] font-semibold text-[#B68122]">
                                                    View Details →
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <MessageModal
                message={selectedMessage}
                onClose={() => setSelectedMessage(null)}
                onStatusChange={handleStatusChange}
                onReply={handleReply}
                onDelete={handleDelete}
                updating={updating}
                replying={replying}
                deleting={deleting}
            />
        </AdminLayout>
    );
}