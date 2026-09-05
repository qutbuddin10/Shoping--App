import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Package,
  ShoppingBag,
  Clock3,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  ChevronRight,
  X,
  MapPin,
  CreditCard,
  CalendarDays,
  Hash,
  Box,
  LogOut,
  ChevronLeft,
  RotateCcw,
  RefreshCcw,
  MessageSquare,
  Send,
} from "lucide-react";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import api_base from "../apibase";



/* ---------------------------- helpers ---------------------------- */

const formatPrice = (value) => {
  const number = Number(value || 0);

  return `₹${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusStyle = (status) => {
  switch (status) {
    case "Pending":
      return {
        wrapper: "bg-amber-400/10 text-amber-300 border-amber-400/25",
        icon: Clock3,
      };

    case "Confirmed":
      return {
        wrapper: "bg-cyan-400/10 text-cyan-300 border-cyan-400/25",
        icon: CheckCircle2,
      };

    case "Shipped":
      return {
        wrapper: "bg-blue-400/10 text-blue-300 border-blue-400/25",
        icon: Truck,
      };

    case "Delivered":
      return {
        wrapper: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
        icon: PackageCheck,
      };

    case "Cancelled":
      return {
        wrapper: "bg-red-400/10 text-red-300 border-red-400/25",
        icon: XCircle,
      };

    default:
      return {
        wrapper: "bg-[#111C31] text-gray-500 border-white/10",
        icon: Clock3,
      };
  }
};

const getReturnStatusStyle = (status) => {
  switch (status) {
    case "Requested":
      return {
        wrapper: "bg-amber-400/10 text-amber-300 border-amber-400/25",
        icon: Clock3,
      };

    case "Approved":
      return {
        wrapper: "bg-cyan-400/10 text-cyan-300 border-cyan-400/25",
        icon: CheckCircle2,
      };

    case "Rejected":
      return {
        wrapper: "bg-red-400/10 text-red-300 border-red-400/25",
        icon: XCircle,
      };

    case "Product Received":
      return {
        wrapper: "bg-blue-400/10 text-blue-300 border-blue-400/25",
        icon: PackageCheck,
      };

    case "Refund Processing":
      return {
        wrapper: "bg-purple-400/10 text-purple-300 border-purple-400/25",
        icon: RefreshCcw,
      };

    case "Refunded":
      return {
        wrapper: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
        icon: CheckCircle2,
      };

    default:
      return {
        wrapper: "bg-[#111C31] text-gray-500 border-white/10",
        icon: Clock3,
      };
  }
};

const getContactStatusStyle = (status) => {
  const normalized = String(status || "New").trim().toLowerCase();

  if (normalized === "resolved") {
    return {
      wrapper: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.08)]",
      icon: CheckCircle2,
    };
  }

  if (normalized === "in progress") {
    return {
      wrapper: "border-blue-400/25 bg-blue-400/10 text-blue-300",
      icon: RefreshCcw,
    };
  }

  if (normalized === "read") {
    return {
      wrapper: "border-purple-400/25 bg-purple-400/10 text-purple-300",
      icon: CheckCircle2,
    };
  }

  return {
    wrapper: "border-amber-400/25 bg-amber-400/10 text-amber-300",
    icon: Clock3,
  };
};

function ContactStatusBadge({ status }) {
  const style = getContactStatusStyle(status);
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold whitespace-nowrap ${style.wrapper}`}
    >
      <Icon size={13} />
      {status || "New"}
    </span>
  );
}

const getContactResponse = (message) =>
  message?.admin_response ||
  message?.response ||
  message?.reply ||
  message?.admin_reply ||
  "";

const getContactDate = (message) =>
  message?.created_at ||
  message?.submitted_at ||
  message?.date ||
  message?.updated_at ||
  null;

const TRACKING_STEPS = [
  { key: "Pending", label: "Order Placed", icon: ShoppingBag },
  { key: "Confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "Shipped", label: "Shipped", icon: Truck },
  { key: "Out for Delivery", label: "Out for Delivery", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: PackageCheck },
];

const getTrackingIndex = (status) => {
  const normalized = String(status || "Pending").trim().toLowerCase();

  if (normalized === "cancelled") return -1;
  if (normalized === "out for delivery") return 3;
  if (normalized === "delivered") return 4;
  if (normalized === "shipped") return 2;
  if (normalized === "confirmed") return 1;
  return 0;
};

const getTrackingDate = (order, stepKey) => {
  const history = Array.isArray(order?.tracking_history)
    ? order.tracking_history
    : [];

  const historyItem = history.find((item) => {
    const value = String(
      item.status || item.order_status || item.step || ""
    ).trim().toLowerCase();

    return value === stepKey.toLowerCase();
  });

  if (historyItem) {
    return (
      historyItem.created_at ||
      historyItem.timestamp ||
      historyItem.date ||
      historyItem.updated_at ||
      null
    );
  }

  if (stepKey === "Pending") return order?.created_at || null;
  return null;
};

function TrackingTimeline({ order }) {
  const status = order?.order_status || "Pending";
  const currentIndex = getTrackingIndex(status);
  const cancelled = String(status).toLowerCase() === "cancelled";

  if (!order?.tracking_number && !cancelled) return null;

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0D1628]/90 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D58A00]">
            Shipment Tracking
          </p>
          <h3 className="mt-1 text-lg font-black text-gray-100">
            Track your order
          </h3>
        </div>

        {order.tracking_number && (
          <div className="rounded-2xl border border-white/10 bg-[#060B18] px-4 py-3 sm:min-w-[230px]">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">
              Tracking ID
            </p>
            <p className="mt-1 break-all text-sm font-black tracking-wide text-gray-200">
              {order.tracking_number}
            </p>
          </div>
        )}
      </div>

      {cancelled ? (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4 text-red-300">
          <XCircle size={20} className="shrink-0" />
          <div>
            <p className="text-sm font-black">Order Cancelled</p>
            <p className="mt-0.5 text-xs text-red-500">
              This shipment is no longer active.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-7">
          <div className="hidden items-start md:flex">
            {TRACKING_STEPS.map((step, index) => {
              const Icon = step.icon;
              const completed = index <= currentIndex;
              const active = index === currentIndex;
              const date = getTrackingDate(order, step.key);

              return (
                <div key={step.key} className="relative flex flex-1 flex-col items-center text-center">
                  {index < TRACKING_STEPS.length - 1 && (
                    <div className={`absolute left-1/2 top-5 h-0.5 w-full ${index < currentIndex ? "bg-[#111827]" : "bg-[#16233A]"}`} />
                  )}
                  <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${completed ? "border-[#111827] bg-[#111827] text-white" : "border-white/10 bg-[#0D1628]/90 text-gray-300"} ${active ? "ring-4 ring-[#F5A524]/15" : ""}`}>
                    <Icon size={16} />
                  </div>
                  <p className={`mt-3 text-xs font-black ${completed ? "text-gray-100" : "text-gray-500"}`}>
                    {step.label}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-500">
                    {date ? formatDate(date) : completed ? "Completed" : "Pending"}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="space-y-1 md:hidden">
            {TRACKING_STEPS.map((step, index) => {
              const Icon = step.icon;
              const completed = index <= currentIndex;
              const active = index === currentIndex;
              const date = getTrackingDate(order, step.key);

              return (
                <div key={step.key} className="relative flex gap-4">
                  {index < TRACKING_STEPS.length - 1 && (
                    <div className={`absolute left-5 top-10 h-[calc(100%-4px)] w-0.5 ${index < currentIndex ? "bg-[#111827]" : "bg-[#16233A]"}`} />
                  )}
                  <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${completed ? "border-[#111827] bg-[#111827] text-white" : "border-white/10 bg-[#0D1628]/90 text-gray-300"} ${active ? "ring-4 ring-[#F5A524]/15" : ""}`}>
                    <Icon size={16} />
                  </div>
                  <div className="pb-6 pt-0.5">
                    <p className={`text-sm font-black ${completed ? "text-gray-100" : "text-gray-500"}`}>
                      {step.label}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {date ? formatDate(date) : completed ? "Completed" : "Awaiting update"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const style = getStatusStyle(status);
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold whitespace-nowrap ${style.wrapper}`}
    >
      <Icon size={13} />
      {status || "Unknown"}
    </span>
  );
}

function ReturnStatusBadge({ status }) {
  const style = getReturnStatusStyle(status);
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold whitespace-nowrap ${style.wrapper}`}
    >
      <Icon size={13} />
      {status || "Unknown"}
    </span>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("orders");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [contactMessages, setContactMessages] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactRefreshing, setContactRefreshing] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const [returnOrderData, setReturnOrderData] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  /* -------------------- modal scroll lock -------------------- */
  useEffect(() => {
    const modalOpen = Boolean(
      selectedContact ||
      selectedOrder ||
      returnOrderData
    );

    if (!modalOpen) return undefined;

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyPaddingRight: body.style.paddingRight,
    };

    const scrollbarWidth =
      window.innerWidth - html.clientWidth;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.width = previous.bodyWidth;
      body.style.paddingRight = previous.bodyPaddingRight;

      window.scrollTo(0, scrollY);
    };
  }, [
    Boolean(selectedContact || selectedOrder || returnOrderData),
  ]);

  /* -------------------- auth check -------------------- */

  useEffect(() => {
    const stored = sessionStorage.getItem("user");

    if (!stored) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to view your profile.",
        icon: "warning",
        confirmButtonColor: "#F5A524",
        confirmButtonText: "Login",
      }).then(() => navigate("/login"));

      return;
    }

    try {
      setUser(JSON.parse(stored));
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  /* -------------------- fetch orders -------------------- */

  const fetchOrders = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await fetch(`${api_base}orders/`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          return;
        }

        throw new Error(
          data.msg || "Unable to load orders"
        );
      }

      const latestOrders = Array.isArray(data.orders)
        ? data.orders
        : [];

      setOrders(latestOrders);

      setSelectedOrder((currentOrder) => {
        if (!currentOrder) {
          return currentOrder;
        }

        const latestOrder = latestOrders.find(
          (order) => order.id === currentOrder.id
        );

        return latestOrder || currentOrder;
      });
    } catch (error) {
      console.error(
        "Profile orders error:",
        error
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    fetchOrders(true);

    const orderRefreshInterval = setInterval(() => {
      fetchOrders(false);
    }, 5000);

    return () => {
      clearInterval(orderRefreshInterval);
    };
  }, [user]);

  const fetchContactMessages = async (showLoader = true) => {
    try {
      if (showLoader) {
        setContactLoading(true);
      } else {
        setContactRefreshing(true);
      }

      const response = await fetch(`${api_base}contact/`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.msg || "Unable to load your contact messages."
        );
      }

      const messages =
        data.messages ||
        data.contacts ||
        data.contact_messages ||
        (Array.isArray(data) ? data : []);

      setContactMessages(Array.isArray(messages) ? messages : []);
    } catch (error) {
      console.error("Profile contact messages error:", error);

      Swal.fire({
        title: "Unable to Load Messages",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#F5A524",
      });
    } finally {
      setContactLoading(false);
      setContactRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && tab === "contact") {
      fetchContactMessages();
    }
  }, [user, tab]);

  /* -------------------- cancel order -------------------- */

  const cancelOrder = async (order) => {
    const result = await Swal.fire({
      title: "Cancel this order?",
      text: `${
        order.order_number || `ORD-${order.id}`
      } will be cancelled. This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel Order",
      cancelButtonText: "Keep Order",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#0B1220",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${api_base}orders/${order.id}/cancel/`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.msg || "Unable to cancel order"
        );
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
                ...o,
                order_status: "Cancelled",
              }
            : o
        )
      );

      setSelectedOrder((prev) =>
        prev && prev.id === order.id
          ? {
              ...prev,
              order_status: "Cancelled",
            }
          : prev
      );

      Swal.fire({
        title: "Order Cancelled",
        text: data.msg,
        icon: "success",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
    }
  };

  const isCancellable = (status) =>
    status === "Pending" ||
    status === "Confirmed";

  /* -------------------- return helpers -------------------- */

  const isReturnable = (order) =>
    order.order_status === "Delivered" &&
    !order.return;

  const openReturnModal = (order) => {
    setReturnOrderData(order);
    setReturnReason("");
    setReturnDescription("");
  };

  const closeReturnModal = () => {
    if (returnSubmitting) return;

    setReturnOrderData(null);
    setReturnReason("");
    setReturnDescription("");
  };

  /* -------------------- return order -------------------- */

  const submitReturnRequest = async () => {
    if (!returnOrderData) return;

    if (!returnReason) {
      Swal.fire({
        title: "Reason Required",
        text: "Please select a return reason.",
        icon: "warning",
        confirmButtonColor: "#F5A524",
      });

      return;
    }

    if (
      returnDescription.trim().length > 1000
    ) {
      Swal.fire({
        title: "Description Too Long",
        text: "Description cannot exceed 1000 characters.",
        icon: "warning",
        confirmButtonColor: "#F5A524",
      });

      return;
    }

    try {
      setReturnSubmitting(true);

      const response = await fetch(
        `${api_base}orders/${returnOrderData.id}/return/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: returnReason,
            description:
              returnDescription.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.msg ||
            "Unable to submit return request"
        );
      }

      const updatedReturn =
        data.return || {
          id: null,
          reason: returnReason,
          description:
            returnDescription.trim(),
          status: "Requested",
          requested_at: new Date().toISOString(),
          approved_at: null,
          rejected_at: null,
          product_received_at: null,
          refund: null,
        };

      setOrders((prev) =>
        prev.map((order) =>
          order.id === returnOrderData.id
            ? {
                ...order,
                return: updatedReturn,
              }
            : order
        )
      );

      setSelectedOrder((prev) =>
        prev &&
        prev.id === returnOrderData.id
          ? {
              ...prev,
              return: updatedReturn,
            }
          : prev
      );

      closeReturnModal();

      await Swal.fire({
        title: "Return Requested",
        text:
          data.msg ||
          "Your return request has been submitted successfully.",
        icon: "success",
        confirmButtonColor: "#F5A524",
      });
    } catch (error) {
      Swal.fire({
        title: "Return Request Failed",
        text: error.message,
        icon: "error",
      });
    } finally {
      setReturnSubmitting(false);
    }
  };

  /* -------------------- logout -------------------- */

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#F5A524",
      cancelButtonColor: "#0B1220",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem("user");
        navigate("/");
      }
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#060B18]">
        <div className="h-[74px] w-full shrink-0" aria-hidden="true" />
        <div className="fixed left-0 top-0 z-[100] w-full border-b border-white/10 bg-gradient-to-r from-[#080D18]/98 via-[#0B1424]/96 to-[#0A1220]/98 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <Navbar />
        </div>
      </div>
    );
  }

  const initial = (
    user.name ||
    user.full_name ||
    "U"
  )
    .charAt(0)
    .toUpperCase();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#060B18] text-gray-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none fixed -right-32 top-20 -z-10 h-[520px] w-[520px] rounded-full bg-[#F5A524]/[0.07] blur-[140px]" />
      <div className="pointer-events-none fixed -left-40 bottom-0 -z-10 h-[480px] w-[480px] rounded-full bg-[#0B1220]/[0.55] blur-[130px]" />
      <div className="h-[74px] w-full shrink-0" aria-hidden="true" />
      <div className="fixed left-0 top-0 z-[100] w-full border-b border-white/10 bg-gradient-to-r from-[#080D18]/98 via-[#0B1424]/96 to-[#0A1220]/98 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <Navbar />
      </div>

      {/* =========================================
          HEADER
      ========================================= */}

      <section className="relative overflow-hidden border-b border-white/10 bg-[#0D1628]/90">
        <div className="absolute -right-32 -top-40 h-[450px] w-[450px] rounded-full bg-[#F5A524]/[0.09] blur-[130px]" />

        <div className="absolute -left-24 bottom-0 h-[300px] w-[300px] rounded-full bg-[#0B1220]/[0.03] blur-[110px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 transition-colors hover:text-[#F5A524]"
          >
            <ChevronLeft size={14} />
            Back to home
          </button>

          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F5A524] to-[#E08E0B] text-2xl font-black text-black shadow-lg shadow-[#F5A524]/20">
                {initial}
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[3px] text-[#D58A00]">
                  My Account
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                  {user.name ||
                    user.full_name ||
                    "User"}
                </h1>

                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail size={13} />
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-white/10 bg-[#0D1628]/90 px-5 py-3 text-sm font-bold text-gray-500 transition-all duration-200 hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300 sm:self-auto"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </section>

      {/* =========================================
          CONTENT
      ========================================= */}

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-4">

          {/* =====================================
              SIDEBAR
          ===================================== */}

          <div className="lg:col-span-1">
            <div className="rounded-[28px] border border-white/10 bg-[#0D1628]/90 p-3 shadow-sm lg:sticky lg:top-24">
              <button
                onClick={() => setTab("profile")}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-colors duration-150 ${
                  tab === "profile"
                    ? "bg-[#111C31] text-white"
                    : "text-gray-500 hover:bg-[#111C31]"
                }`}
              >
                <User size={17} />
                My Profile
              </button>

              <button
                onClick={() => setTab("contact")}
                className={`mt-1.5 flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-colors duration-150 ${
                  tab === "contact"
                    ? "bg-[#111C31] text-white"
                    : "text-gray-500 hover:bg-[#111C31]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <MessageSquare size={17} />
                  Contact Messages
                </span>

                {contactMessages.length > 0 && (
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-black ${
                      tab === "contact"
                        ? "bg-[#F5A524] text-black"
                        : "bg-[#111C31] text-gray-500"
                    }`}
                  >
                    {contactMessages.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setTab("orders")}
                className={`mt-1.5 flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-colors duration-150 ${
                  tab === "orders"
                    ? "bg-[#111C31] text-white"
                    : "text-gray-500 hover:bg-[#111C31]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Package size={17} />
                  My Orders
                </span>

                {orders.length > 0 && (
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-black ${
                      tab === "orders"
                        ? "bg-[#F5A524] text-black"
                        : "bg-[#111C31] text-gray-500"
                    }`}
                  >
                    {orders.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* =====================================
              MAIN PANEL
          ===================================== */}

          <div className="lg:col-span-3">

            {/* -------- PROFILE TAB -------- */}

            {tab === "profile" && (
              <div className="rounded-[28px] border border-white/10 bg-[#0D1628]/90 p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-black">
                  Account Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your personal account information.
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#060B18] p-5">
                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      <User size={13} />
                      Full Name
                    </p>

                    <p className="mt-2 text-base font-bold">
                      {user.name ||
                        user.full_name ||
                        "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#060B18] p-5">
                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      <Mail size={13} />
                      Email Address
                    </p>

                    <p className="mt-2 text-base font-bold">
                      {user.email || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#060B18] p-5">
                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      <Hash size={13} />
                      Account ID
                    </p>

                    <p className="mt-2 text-base font-bold">
                      #{user.id || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#060B18] p-5">
                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      <Package size={13} />
                      Total Orders
                    </p>

                    <p className="mt-2 text-base font-bold">
                      {orders.length}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate("/checkout")
                  }
                  className="mt-7 inline-flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-gray-500 transition-colors hover:border-[#F5A524]/40 hover:text-[#F5A524]"
                >
                  <MapPin size={16} />
                  Manage delivery addresses
                </button>
              </div>
            )}

            {/* -------- ORDERS TAB -------- */}

            {tab === "contact" && (
              <div>
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D58A00]">
                      Customer Support
                    </p>

                    <h2 className="mt-1 text-2xl font-black tracking-tight">
                      My Contact Messages
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Track your messages and see replies from our support team.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchContactMessages(false)}
                    disabled={contactRefreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0D1628]/90 px-4 py-3 text-sm font-bold text-gray-500 transition hover:border-[#F5A524]/40 hover:text-[#F5A524] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCcw
                      size={15}
                      className={contactRefreshing ? "animate-spin" : ""}
                    />
                    Refresh
                  </button>
                </div>

                {contactLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((item) => (
                      <div
                        key={item}
                        className="h-44 animate-pulse rounded-[28px] bg-[#16233A]"
                      />
                    ))}
                  </div>
                ) : contactMessages.length === 0 ? (
                  <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0D1628]/90 p-10 text-center shadow-sm sm:p-14">
                    <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5A524]/[0.06] blur-[90px]" />

                    <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4DE] text-[#F5A524]">
                      <MessageSquare size={28} />
                    </div>

                    <h3 className="relative mt-5 text-lg font-black">
                      No contact messages yet
                    </h3>

                    <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                      Messages you send through Contact Us will appear here,
                      along with their current status and admin response.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate("/contact")}
                      className="relative mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#F5A524] px-6 py-3.5 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-[#FFB84D]"
                    >
                      Contact Support
                      <Send size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contactMessages.map((message) => {
                      const adminResponse = getContactResponse(message);

                      return (
                        <div
                          key={message.id}
                          className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0D1628]/90 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#F5A524]/35 hover:shadow-[0_20px_50px_rgba(15,23,42,0.10)] sm:p-6"
                        >
                          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#F5A524] via-[#FFD27A] to-transparent opacity-80" />

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="flex min-w-0 items-center gap-3">
                                  <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#111C31] text-white sm:flex">
                                    <MessageSquare size={15} />
                                  </span>

                                  <h3 className="truncate text-base font-black text-gray-100 sm:text-lg">
                                    {message.subject || "Contact Support"}
                                  </h3>
                                </div>

                                <ContactStatusBadge
                                  status={message.status || "New"}
                                />
                              </div>

                              <p className="mt-1 text-xs text-gray-500">
                                {getContactDate(message)
                                  ? formatDate(getContactDate(message))
                                  : "Recently submitted"}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedContact(message)}
                              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0D1628] px-4 py-2.5 text-xs font-black text-gray-400 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#F5A524]/60 hover:bg-[#111C31] hover:text-[#F5A524]"
                            >
                              View Details
                              <ChevronRight size={14} />
                            </button>
                          </div>

                          <div className="mt-5 rounded-2xl border border-white/10 bg-[#060B18] p-5 shadow-inner shadow-black/[0.015]">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                              Your Message
                            </p>

                            <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-gray-300">
                              {message.message || "—"}
                            </p>
                          </div>

                          <div
                            className={`mt-4 rounded-2xl border p-5 transition-colors ${
                              adminResponse
                                ? "border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.10] via-[#0D1628] to-[#0B1424] shadow-[0_0_30px_rgba(16,185,129,0.04)]"
                                : "border-white/10 bg-[#0D1628]/90"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MessageSquare
                                size={15}
                                className={
                                  adminResponse
                                    ? "text-emerald-400"
                                    : "text-gray-500"
                                }
                              />

                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                                Admin Response
                              </p>
                            </div>

                            <p
                              className={`mt-2 whitespace-pre-wrap text-sm leading-6 ${
                                adminResponse
                                  ? "font-medium text-gray-300"
                                  : "text-gray-500"
                              }`}
                            >
                              {adminResponse ||
                                "Our support team has not replied yet."}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === "orders" && (
              <div>
                {loading && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-32 animate-pulse rounded-[28px] bg-[#16233A]"
                      />
                    ))}
                  </div>
                )}

                {!loading &&
                  orders.length === 0 && (
                    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0D1628]/90 p-12 text-center shadow-sm">
                      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5A524]/[0.06] blur-[90px]" />

                      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4DE]">
                        <ShoppingBag
                          size={28}
                          className="text-[#F5A524]"
                        />
                      </div>

                      <h3 className="relative mt-5 text-lg font-black">
                        No orders yet
                      </h3>

                      <p className="relative mt-2 text-sm text-gray-500">
                        When you place an order,
                        it will show up here.
                      </p>

                      <button
                        onClick={() =>
                          navigate("/products")
                        }
                        className="relative mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#F5A524] px-6 py-3.5 text-sm font-black text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFB84D]"
                      >
                        Start Shopping
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}

                {!loading &&
                  orders.length > 0 && (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const itemCount =
                          order.items?.reduce(
                            (sum, item) =>
                              sum +
                              Number(
                                item.quantity || 0
                              ),
                            0
                          ) || 0;

                        const hasReturn =
                          Boolean(order.return);

                        return (
                          <div
                            key={order.id}
                            className="group rounded-[28px] border border-white/10 bg-[#0D1628]/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-200/60 sm:p-6"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4DE] text-[#F5A524]">
                                  <Box size={20} />
                                </div>

                                <div>
                                  <p className="font-black">
                                    {order.order_number ||
                                      `ORD-${order.id}`}
                                  </p>

                                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                                    <CalendarDays size={12} />

                                    {formatDate(
                                      order.created_at
                                    )}

                                    <span className="text-gray-300">
                                      •
                                    </span>

                                    {itemCount} item
                                    {itemCount !== 1
                                      ? "s"
                                      : ""}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <StatusBadge
                                  status={
                                    order.order_status
                                  }
                                />

                                <p className="text-lg font-black">
                                  {formatPrice(
                                    order.total_amount
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Return Status */}

                            {hasReturn && (
                              <div className="mt-4 rounded-2xl border border-white/10 bg-[#060B18] p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <p className="text-[11px] font-black uppercase tracking-wide text-gray-500">
                                      Return Status
                                    </p>

                                    <div className="mt-2">
                                      <ReturnStatusBadge
                                        status={
                                          order.return
                                            .status
                                        }
                                      />
                                    </div>
                                  </div>

                                  {order.return
                                    .refund && (
                                    <div className="text-left sm:text-right">
                                      <p className="text-[11px] font-black uppercase tracking-wide text-gray-500">
                                        Refund
                                      </p>

                                      <p className="mt-1 text-sm font-black text-emerald-400">
                                        {formatPrice(
                                          order.return
                                            .refund
                                            .amount
                                        )}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* item thumbnails */}

                            {order.items?.length >
                              0 && (
                              <div className="mt-4 flex items-center gap-2">
                                {order.items
                                  .slice(0, 4)
                                  .map((item) => (
                                    <div
                                      key={item.id}
                                      className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#111C31]"
                                    >
                                      {item.image ? (
                                        <img
                                          src={
                                            item.image
                                          }
                                          alt={
                                            item.product_name
                                          }
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                                          <Box
                                            size={16}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))}

                                {order.items.length >
                                  4 && (
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#060B18] text-xs font-bold text-gray-500">
                                    +
                                    {order.items.length -
                                      4}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* buttons */}

                            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                              <button
                                onClick={() =>
                                  setSelectedOrder(
                                    order
                                  )
                                }
                                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 py-3 text-sm font-bold text-gray-500 transition-colors duration-150 hover:border-[#F5A524]/40 hover:bg-[#FFF4DE]/50 hover:text-[#F5A524]"
                              >
                                View Order Details
                                <ChevronRight
                                  size={15}
                                />
                              </button>

                              {isReturnable(
                                order
                              ) && (
                                <button
                                  onClick={() =>
                                    openReturnModal(
                                      order
                                    )
                                  }
                                  className="flex items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-5 py-3 text-sm font-bold text-orange-600 transition-colors duration-150 hover:border-orange-200 hover:bg-orange-100"
                                >
                                  <RotateCcw
                                    size={15}
                                  />
                                  Return Order
                                </button>
                              )}

                              {isCancellable(
                                order.order_status
                              ) && (
                                <button
                                  onClick={() =>
                                    cancelOrder(
                                      order
                                    )
                                  }
                                  className="flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/[0.07] px-5 py-3 text-sm font-bold text-red-300 transition-colors duration-150 hover:border-red-400/30 hover:bg-red-400/10"
                                >
                                  <XCircle
                                    size={15}
                                  />
                                  Cancel Order
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedContact && (
        <div
          className="fixed inset-0 z-[110] flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-slate-950/65 p-3 backdrop-blur-md sm:p-5"
          onClick={() => setSelectedContact(null)}
        >
          <div
            className="flex max-h-[min(90dvh,760px)] w-full max-w-2xl flex-col overflow-hidden rounded-[30px] border border-white/80 bg-[#0D1628]/90 shadow-[0_30px_90px_rgba(0,0,0,0.30)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative shrink-0 flex items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-[#0D1628] via-[#0B1424] to-[#101A2D] px-5 py-5 shadow-[0_12px_35px_rgba(0,0,0,0.18)] sm:px-7">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[3px] text-[#D58A00]">
                  Contact Support
                </p>

                <h2 className="mt-1 truncate text-xl font-black text-gray-100">
                  {selectedContact.subject || "Contact Message"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {getContactDate(selectedContact)
                    ? formatDate(getContactDate(selectedContact))
                    : "Recently submitted"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0D1628]/90 text-gray-500 shadow-sm transition-all hover:border-white/10 hover:bg-[#111C31] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 [scrollbar-gutter:stable] sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0B1424]/90 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl">
                <ContactStatusBadge
                  status={selectedContact.status || "New"}
                />

                {selectedContact.email && (
                  <span className="text-xs font-semibold text-gray-400">
                    {selectedContact.email}
                  </span>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0D1628]/90 p-5 shadow-[0_8px_25px_rgba(15,23,42,0.04)]">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                  Your Message
                </p>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-300">
                  {selectedContact.message || "—"}
                </p>
              </div>

              <div
                className={`rounded-2xl border p-5 shadow-sm ${
                  getContactResponse(selectedContact)
                    ? "border-emerald-400/20 bg-emerald-400/[0.07] shadow-[0_0_35px_rgba(16,185,129,0.05)]"
                    : "border-white/10 bg-[#060B18]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare
                    size={17}
                    className={
                      getContactResponse(selectedContact)
                        ? "text-emerald-400"
                        : "text-gray-500"
                    }
                  />

                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                    Admin Response
                  </p>
                </div>

                <p
                  className={`mt-3 whitespace-pre-wrap text-sm leading-7 ${
                    getContactResponse(selectedContact)
                      ? "font-medium text-gray-300"
                      : "text-gray-500"
                  }`}
                >
                  {getContactResponse(selectedContact) ||
                    "Our support team has not replied yet."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          ORDER DETAILS MODAL
      ========================================= */}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-[100] flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-slate-950/65 p-3 backdrop-blur-md sm:p-5"
          onClick={() =>
            setSelectedOrder(null)
          }
        >
          <div
            className="flex max-h-[min(92dvh,820px)] w-full max-w-2xl flex-col overflow-hidden rounded-[30px] border border-white/70 bg-[#0D1628]/90 shadow-[0_30px_90px_rgba(0,0,0,0.28)]"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* header */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[3px] text-[#D58A00]">
                  Order Details
                </p>

                <h2 className="mt-1 text-xl font-black">
                  {selectedOrder.order_number ||
                    `ORD-${selectedOrder.id}`}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111C31] text-gray-500 transition-colors hover:bg-[#111C31]"
              >
                <X size={18} />
              </button>
            </div>

            {/* body */}

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 [scrollbar-gutter:stable] sm:p-6">
              <TrackingTimeline order={selectedOrder} />
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#060B18] p-4">
                <StatusBadge
                  status={
                    selectedOrder.order_status
                  }
                />

                <p className="text-xs text-gray-500">
                  Placed on{" "}
                  {formatDate(
                    selectedOrder.created_at
                  )}
                </p>
              </div>

              {/* return status */}

              {selectedOrder.return && (
                <div className="rounded-2xl border border-white/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wide text-gray-500">
                        Return Request
                      </p>

                      <div className="mt-2">
                        <ReturnStatusBadge
                          status={
                            selectedOrder.return
                              .status
                          }
                        />
                      </div>
                    </div>

                    <RotateCcw
                      size={22}
                      className="text-[#F5A524]"
                    />
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">
                        Reason
                      </span>

                      <span className="text-right font-bold text-gray-200">
                        {
                          selectedOrder.return
                            .reason
                        }
                      </span>
                    </div>

                    {selectedOrder.return
                      .description && (
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-500">
                          Description
                        </span>

                        <p className="rounded-xl bg-[#060B18] p-3 text-sm text-gray-300">
                          {
                            selectedOrder.return
                              .description
                          }
                        </p>
                      </div>
                    )}

                    {selectedOrder.return
                      .refund && (
                      <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4">
                        <p className="text-[11px] font-black uppercase tracking-wide text-emerald-400">
                          Refund Information
                        </p>

                        <div className="mt-3 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">
                              Amount
                            </span>

                            <span className="font-black text-emerald-700">
                              {formatPrice(
                                selectedOrder
                                  .return
                                  .refund
                                  .amount
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-500">
                              Method
                            </span>

                            <span className="font-bold">
                              {
                                selectedOrder
                                  .return
                                  .refund
                                  .method
                              }
                            </span>
                          </div>

                          <div className="flex justify-between gap-4">
                            <span className="text-gray-500">
                              Status
                            </span>

                            <span className="font-bold text-emerald-400">
                              {
                                selectedOrder
                                  .return
                                  .refund
                                  .status
                              }
                            </span>
                          </div>

                          {selectedOrder.return
                            .refund
                            .refund_reference && (
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">
                                Reference
                              </span>

                              <span className="break-all text-right font-bold">
                                {
                                  selectedOrder
                                    .return
                                    .refund
                                    .refund_reference
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* address */}

              <div className="rounded-2xl border border-white/10 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <MapPin
                    size={16}
                    className="text-[#F5A524]"
                  />

                  <h3 className="text-sm font-black">
                    Delivery Address
                  </h3>
                </div>

                <p className="text-sm font-bold">
                  {
                    selectedOrder.address
                      ?.full_name
                  }
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {
                    selectedOrder.address
                      ?.house
                  }
                  ,{" "}
                  {
                    selectedOrder.address
                      ?.area
                  }
                </p>

                <p className="text-sm text-gray-500">
                  {
                    selectedOrder.address
                      ?.city
                  }
                  ,{" "}
                  {
                    selectedOrder.address
                      ?.state
                  }{" "}
                  -{" "}
                  {
                    selectedOrder.address
                      ?.pincode
                  }
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-300">
                  +91{" "}
                  {
                    selectedOrder.address
                      ?.mobile
                  }
                </p>
              </div>

              {/* items */}

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="border-b border-white/10 bg-[#060B18] px-5 py-3">
                  <h3 className="text-sm font-black">
                    Order Items
                  </h3>
                </div>

                {selectedOrder.items?.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 border-b border-gray-50 p-4 last:border-b-0"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#111C31]">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={
                              item.product_name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300">
                            <Box size={20} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          {item.product_name}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          {item.size && (
                            <span>
                              Size:{" "}
                              {item.size}
                            </span>
                          )}

                          <span>
                            Qty:{" "}
                            {item.quantity}
                          </span>

                          <span>
                            {formatPrice(
                              item.price
                            )}{" "}
                            each
                          </span>
                        </div>
                      </div>

                      <p className="text-sm font-black">
                        {formatPrice(
                          item.total
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* payment */}

              <div className="rounded-2xl border border-white/10 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <CreditCard
                    size={16}
                    className="text-[#F5A524]"
                  />

                  <h3 className="text-sm font-black">
                    Payment Summary
                  </h3>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>
                      Payment Method
                    </span>

                    <span className="font-bold text-gray-200">
                      {
                        selectedOrder.payment_method
                      }
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-500">
                    <span>
                      Payment Status
                    </span>

                    <span
                      className={`font-bold ${
                        selectedOrder.payment_status ===
                        "Paid"
                          ? "text-emerald-400"
                          : "text-amber-600"
                      }`}
                    >
                      {
                        selectedOrder.payment_status
                      }
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-500">
                    <span>
                      Subtotal
                    </span>

                    <span className="font-bold text-gray-200">
                      {formatPrice(
                        selectedOrder.subtotal
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-500">
                    <span>
                      Shipping
                    </span>

                    <span className="font-bold text-emerald-400">
                      {Number(
                        selectedOrder.shipping_charge
                      ) === 0
                        ? "FREE"
                        : formatPrice(
                            selectedOrder.shipping_charge
                          )}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-white/10 pt-3">
                    <span className="font-bold">
                      Total Paid
                    </span>

                    <span className="text-lg font-black text-[#D58A00]">
                      {formatPrice(
                        selectedOrder.total_amount
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* return button */}

              {isReturnable(
                selectedOrder
              ) && (
                <button
                  onClick={() =>
                    openReturnModal(
                      selectedOrder
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 py-3.5 text-sm font-bold text-orange-600 transition-colors duration-150 hover:border-orange-200 hover:bg-orange-100"
                >
                  <RotateCcw size={16} />
                  Return This Order
                </button>
              )}

              {/* cancel button */}

              {isCancellable(
                selectedOrder.order_status
              ) && (
                <button
                  onClick={() =>
                    cancelOrder(
                      selectedOrder
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/[0.07] py-3.5 text-sm font-bold text-red-300 transition-colors duration-150 hover:border-red-400/30 hover:bg-red-400/10"
                >
                  <XCircle size={16} />
                  Cancel This Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          RETURN REQUEST MODAL
      ========================================= */}

      {returnOrderData && (
        <div
          className="fixed inset-0 z-[120] flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-slate-950/65 p-3 backdrop-blur-md sm:p-5"
          onClick={closeReturnModal}
        >
          <div
            className="flex max-h-[min(90dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-[30px] border border-white/70 bg-[#0D1628]/90 shadow-[0_30px_90px_rgba(0,0,0,0.28)]"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* header */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[3px] text-[#D58A00]">
                  Return Order
                </p>

                <h2 className="mt-1 text-xl font-black">
                  {returnOrderData.order_number ||
                    `ORD-${returnOrderData.id}`}
                </h2>
              </div>

              <button
                onClick={closeReturnModal}
                disabled={returnSubmitting}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111C31] text-gray-500 transition-colors hover:bg-[#111C31] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* body */}

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 [scrollbar-gutter:stable] sm:p-6">
              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                <div className="flex items-start gap-3">
                  <RotateCcw
                    size={20}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />

                  <div>
                    <p className="text-sm font-black text-orange-700">
                      Return Request
                    </p>

                    <p className="mt-1 text-xs leading-5 text-orange-600">
                      Please select the reason for
                      returning this order. Our team
                      will review your request.
                    </p>
                  </div>
                </div>
              </div>

              {/* reason */}

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-300">
                  Return Reason
                </label>

                <select
                  value={returnReason}
                  onChange={(e) =>
                    setReturnReason(
                      e.target.value
                    )
                  }
                  disabled={returnSubmitting}
                  className="w-full rounded-2xl border border-white/10 bg-[#0D1628]/90 px-4 py-3.5 text-sm font-medium text-gray-300 outline-none transition focus:border-[#F5A524] focus:ring-4 focus:ring-[#F5A524]/10 disabled:bg-[#111C31]"
                >
                  <option value="">
                    Select a reason
                  </option>

                  <option value="Defective Product">
                    Defective Product
                  </option>

                  <option value="Wrong Product">
                    Wrong Product
                  </option>

                  <option value="Damaged Product">
                    Damaged Product
                  </option>

                  <option value="Size Issue">
                    Size Issue
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* description */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-bold text-gray-300">
                    Description
                  </label>

                  <span className="text-xs text-gray-500">
                    {returnDescription.length}/1000
                  </span>
                </div>

                <textarea
                  value={returnDescription}
                  onChange={(e) =>
                    setReturnDescription(
                      e.target.value
                    )
                  }
                  disabled={returnSubmitting}
                  maxLength={1000}
                  rows={5}
                  placeholder="Please describe the issue with the product..."
                  className="w-full resize-none rounded-2xl border border-white/10 px-4 py-3.5 text-sm text-gray-300 outline-none transition placeholder:text-gray-500 focus:border-[#F5A524] focus:ring-4 focus:ring-[#F5A524]/10 disabled:bg-[#111C31]"
                />
              </div>

              {/* actions */}

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  onClick={closeReturnModal}
                  disabled={returnSubmitting}
                  className="flex-1 rounded-2xl border border-white/10 py-3.5 text-sm font-bold text-gray-500 transition-colors hover:bg-[#111C31] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={submitReturnRequest}
                  disabled={returnSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#F5A524] py-3.5 text-sm font-black text-black transition-all hover:bg-[#FFB84D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {returnSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <RotateCcw size={16} />
                      Submit Return
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}