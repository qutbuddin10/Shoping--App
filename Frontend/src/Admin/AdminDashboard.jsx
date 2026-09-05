import { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingBag,
  UserPlus,
  Repeat2,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  ChevronDown,
  Clock3,
  CreditCard,
  PackageCheck,
  Star,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import axios from "axios";
import AdminLayout from "./AdminLayout";
import api_base from "../apibase";

/* ---------------------------------- STATIC DATA --------------------------------- */
/*
  Order API હજુ બનાવેલ નથી.
  એટલે Sales Report અને Recent Orders હાલ static છે.
  Order system બનાવ્યા પછી આ પણ APIમાંથી આવશે.
*/

const salesData = [
  { day: "Sun", value: 22 },
  { day: "Mon", value: 28 },
  { day: "Tue", value: 21 },
  { day: "Wed", value: 42 },
  { day: "Thu", value: 30 },
  { day: "Fri", value: 33 },
  { day: "Sat", value: 47 },
];



/* ---------------------------------- STATUS STYLES --------------------------------- */


/* ---------------------------------- HELPERS --------------------------------- */

function formatActivityTime(value) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getActivityIcon(activityType) {
  if (activityType === "payment") {
    return CreditCard;
  }

  if (activityType === "shipping") {
    return PackageCheck;
  }

  if (activityType === "review") {
    return Star;
  }

  return ShoppingBag;
}


function Card({
  darkMode,
  className = "",
  children,
}) {
  return (
    <div
      className={`rounded-[22px] border shadow-sm transition-all duration-300 ${
        darkMode
          ? "bg-[#101722]/90 border-white/[0.07] shadow-black/10 hover:border-white/[0.10]"
          : "bg-white border-gray-100 shadow-sm shadow-gray-200/60"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  darkMode,
  children,
}) {
  return (
    <h3
      className={`text-[15px] sm:text-base font-semibold ${
        darkMode
          ? "text-white"
          : "text-gray-900"
      }`}
    >
      {children}
    </h3>
  );
}

/* ---------------------------------- STAT CARD --------------------------------- */

function StatCard({
  darkMode,
  data,
}) {
  const Icon = data.icon;

  const isUp = data.trend === "up";

  const sparkData = data.spark.map(
    (value, index) => ({
      i: index,
      v: value,
    })
  );

  return (
    <Card
      darkMode={darkMode}
      className="p-5 sm:p-6 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">

        {/* Icon */}

        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ring-1 ring-white/[0.05]"
          style={{
            backgroundColor: `${data.accent}1F`,
            color: data.accent,
          }}
        >
          <Icon
            size={18}
            strokeWidth={2.2}
          />
        </div>

        {/* Change */}

        <span
          className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border ${
            isUp
              ? darkMode
                ? "bg-[#F5A524]/10 text-[#F5A524] border-emerald-500/20"
                : "bg-emerald-50 text-emerald-600 border-emerald-200"
              : darkMode
              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
              : "bg-rose-50 text-rose-600 border-rose-200"
          }`}
        >
          {isUp ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingDown size={12} />
          )}

          {data.change}
        </span>
      </div>

      {/* Value */}

      <p
        className={`text-2xl sm:text-[26px] font-bold mt-4 tracking-tight ${
          darkMode
            ? "text-white"
            : "text-gray-900"
        }`}
      >
        {data.value}
      </p>

      {/* Label */}

      <p
        className={`text-xs sm:text-[13px] mt-1 ${
          darkMode
            ? "text-gray-500"
            : "text-gray-400"
        }`}
      >
        {data.label}

        {" · "}

        <span className="opacity-80">
          {data.note}
        </span>
      </p>

      {/* Sparkline */}

      <div className="h-10 mt-4 -mx-1 opacity-90">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={sparkData}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>

              <linearGradient
                id={`spark-${data.label}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={data.accent}
                  stopOpacity={0.35}
                />

                <stop
                  offset="100%"
                  stopColor={data.accent}
                  stopOpacity={0}
                />
              </linearGradient>

            </defs>

            <Area
              type="monotone"
              dataKey="v"
              stroke={data.accent}
              strokeWidth={2}
              fill={`url(#spark-${data.label})`}
              isAnimationActive={false}
            />

          </AreaChart>
        </ResponsiveContainer>

      </div>
    </Card>
  );
}

/* ---------------------------------- MAIN PAGE --------------------------------- */

export default function AdminDashboard({
  darkMode = true,
}) {

  /* ---------------------------------- STATE --------------------------------- */

  const [range, setRange] =
    useState("This week");

  const [customers, setCustomers] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ---------------------------------- FETCH DATA --------------------------------- */

  useEffect(() => {

    const fetchDashboardData =
      async () => {

        try {

          setLoading(true);

          setError("");

          /*
            Three APIs simultaneously call થશે.
          */

          const [
            customerRes,
            productRes,
            categoryRes,
            orderRes,
          ] = await Promise.all([

            axios.get(
              `${api_base}admin/customers/`,
              {
                withCredentials: true,
              }
            ),

            axios.get(
              `${api_base}products/`,
              {
                withCredentials: true,
              }
            ),

            axios.get(
              `${api_base}categories/`,
              {
                withCredentials: true,
              }
            ),

            axios.get(
              `${api_base}admin-orders/`,
              {
                withCredentials: true,
              }
            ),
          ]);

          /* Customers */

          setCustomers(
            customerRes.data.customers || []
          );

          /* Products */

          setProducts(
            productRes.data || []
          );

          /* Categories */

          setCategories(
            categoryRes.data || []
          );

          /* Orders */

          setOrders(
            orderRes.data?.orders ||
            orderRes.data?.data ||
            (Array.isArray(orderRes.data) ? orderRes.data : [])
          );

        } catch (err) {

          console.log(
            "Dashboard Error:",
            err
          );

          setError(
            err.response?.data?.msg ||
              "Failed to fetch dashboard data"
          );

        } finally {

          setLoading(false);

        }

      };

    fetchDashboardData();

  }, []);

  /* ---------------------------------- CALCULATIONS --------------------------------- */

  const totalCustomers =
    customers.length;

  const totalProducts =
    products.length;

  const totalCategories =
    categories.length;

  const activeProducts =
    products.filter(
      (product) =>
        product.status === true
    ).length;

  const outOfStockProducts =
    products.filter(
      (product) =>
        Number(product.stock) === 0
    ).length;

  /* ---------------------------------- STAT CARDS --------------------------------- */

  const statCards = [

    {
      label: "Total Customers",

      value:
        totalCustomers.toLocaleString(),

      change: "+",

      trend: "up",

      note: "Registered customers",

      icon: UserPlus,

      accent: "#FB7185",

      spark: [
        10,
        15,
        18,
        22,
        25,
        30,
        35,
        40,
      ],
    },

    {
      label: "Total Products",

      value:
        totalProducts.toLocaleString(),

      change: "+",

      trend: "up",

      note: "Products available",

      icon: ShoppingBag,

      accent: "#3B82F6",

      spark: [
        15,
        20,
        18,
        25,
        28,
        30,
        35,
        40,
      ],
    },

    {
      label: "Total Categories",

      value:
        totalCategories.toLocaleString(),

      change: "+",

      trend: "up",

      note: "Product categories",

      icon: DollarSign,

      accent: "#F5A524",

      spark: [
        12,
        16,
        20,
        19,
        25,
        28,
        32,
        36,
      ],
    },

    {
      label: "Out Of Stock",

      value:
        outOfStockProducts.toLocaleString(),

      change: "-",

      trend: "down",

      note: "Products unavailable",

      icon: Repeat2,

      accent: "#34D399",

      spark: [
        30,
        28,
        25,
        22,
        20,
        18,
        15,
        12,
      ],
    },

  ];

  /* ---------------------------------- TOP PRODUCTS --------------------------------- */

  /*
    Order system હજુ નથી.
    એટલે હાલ products ને stock પ્રમાણે sort કરીએ છીએ.
  */

  const topProducts = [
    ...products,
  ]
    .sort(
      (a, b) =>
        Number(b.stock) -
        Number(a.stock)
    )
    .slice(0, 4);

  /* ---------------------------------- ORDER DATA --------------------------------- */

  const totalOrders = orders.length;

  const completedOrders = orders.filter(
    (order) =>
      String(order.order_status || "").toLowerCase() === "completed" ||
      String(order.order_status || "").toLowerCase() === "delivered"
  ).length;

  const pendingOrders = orders.filter(
    (order) =>
      String(order.order_status || "").toLowerCase() === "pending"
  ).length;

  const newOrders = Math.max(
    totalOrders - completedOrders - pendingOrders,
    0
  );

  const dynamicOrderSummary = [
    {
      name: "Completed",
      value: totalOrders
        ? Math.round((completedOrders / totalOrders) * 100)
        : 0,
      color: "#34D399",
    },
    {
      name: "New Order",
      value: totalOrders
        ? Math.round((newOrders / totalOrders) * 100)
        : 0,
      color: "#F5A524",
    },
    {
      name: "Pending",
      value: totalOrders
        ? Math.round((pendingOrders / totalOrders) * 100)
        : 0,
      color: "#3B82F6",
    },
  ];

  const recentActivities = orders
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
    )
    .slice(0, 6)
    .map((order) => {
      const orderStatus = String(
        order.order_status || "Pending"
      ).toLowerCase();

      const paymentStatus = String(
        order.payment_status || "Pending"
      ).toLowerCase();

      let activityType = "order";

      if (
        ["shipped", "delivered"].includes(orderStatus)
      ) {
        activityType = "shipping";
      } else if (paymentStatus === "paid") {
        activityType = "payment";
      }

      return {
        id: `order-${order.id}`,
        type: activityType,
        customer:
          order.customer_name ||
          "Customer",
        orderNumber:
          order.order_number ||
          `Order #${order.id}`,
        orderStatus:
          order.order_status ||
          "Pending",
        paymentStatus:
          order.payment_status ||
          "Pending",
        amount:
          Number(order.total_amount || 0),
        time: order.created_at,
      };
    });



  /* ---------------------------------- TOOLTIP --------------------------------- */


  const tooltipStyle = darkMode
    ? {
        background: "#151B2B",
        border:
          "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12,
        color: "#fff",
        fontSize: 12,
      }
    : {
        background: "#fff",
        border:
          "1px solid #e5e7eb",
        borderRadius: 12,
        color: "#111827",
        fontSize: 12,
      };

  /* ---------------------------------- LOADING --------------------------------- */

  if (loading) {

    return (
      <AdminLayout
        darkMode={darkMode}
      >

        <div
          className={`min-h-screen flex items-center justify-center ${
            darkMode
              ? "bg-[#0B0F19] text-white"
              : "bg-gray-50 text-gray-900"
          }`}
        >

          <div className="text-sm">
            Loading dashboard...
          </div>

        </div>

      </AdminLayout>
    );
  }

  /* ---------------------------------- ERROR --------------------------------- */

  if (error) {

    return (
      <AdminLayout
        darkMode={darkMode}
      >

        <div
          className={`min-h-screen flex items-center justify-center ${
            darkMode
              ? "bg-[#0B0F19] text-white"
              : "bg-gray-50 text-gray-900"
          }`}
        >

          <div className="text-center">

            <p className="text-red-400 text-sm">
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-3 px-4 py-2 rounded-lg bg-[#F5A524] text-black text-sm font-medium"
            >
              Retry
            </button>

          </div>

        </div>

      </AdminLayout>
    );
  }

  /* ---------------------------------- UI --------------------------------- */

  return (

    <AdminLayout
      darkMode={darkMode}
    >

      <div
        className={`min-h-screen transition-colors duration-300 ${
          darkMode
            ? "bg-[#080D16]"
            : "bg-gray-50"
        }`}
      >

        <div className="space-y-6 sm:space-y-7 max-w-[1600px] mx-auto">

          {/* ================= PAGE HEADING ================= */}

          <div className="flex items-center justify-between">

            <div>

              <h1
                className={`text-xl sm:text-2xl font-bold tracking-tight ${
                  darkMode
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                Dashboard
              </h1>

              <p
                className={`text-xs sm:text-sm mt-0.5 ${
                  darkMode
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                Welcome back, here&apos;s what&apos;s
                happening today.
              </p>

            </div>

          </div>

          {/* ================= STAT CARDS ================= */}

          <div className="grid grid-cols-1 min-[520px]:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">

            {statCards.map(
              (card) => (

                <StatCard
                  key={card.label}
                  darkMode={darkMode}
                  data={card}
                />

              )
            )}

          </div>

          {/* ================= EXTRA INFO ================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

            <Card
              darkMode={darkMode}
              className="px-5 py-4"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p
                    className={`text-xs ${
                      darkMode
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    Active Products
                  </p>

                  <p
                    className={`text-xl font-bold mt-1 ${
                      darkMode
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {activeProducts}
                  </p>

                </div>

                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">

                  <TrendingUp size={18} />

                </div>

              </div>

            </Card>

            <Card
              darkMode={darkMode}
              className="px-5 py-4"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p
                    className={`text-xs ${
                      darkMode
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    Total Categories
                  </p>

                  <p
                    className={`text-xl font-bold mt-1 ${
                      darkMode
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {totalCategories}
                  </p>

                </div>

                <div className="w-10 h-10 rounded-xl bg-[#F5A524]/10 text-[#F5A524] flex items-center justify-center">

                  <ShoppingBag size={18} />

                </div>

              </div>

            </Card>

          </div>

          {/* ================= CHART + PRODUCTS + SUMMARY ================= */}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

            {/* ================= SALES REPORT ================= */}

            <Card
              darkMode={darkMode}
              className="xl:col-span-6 p-5 sm:p-6 overflow-hidden bg-gradient-to-br from-[#111925] to-[#0D131E]"
            >

              <div className="flex items-center justify-between mb-2">

                <SectionTitle
                  darkMode={darkMode}
                >
                  <div>
                    <SectionTitle darkMode={darkMode}>
                      Sales Report
                    </SectionTitle>

                    <p
                      className={`text-[11px] mt-1 ${
                        darkMode
                          ? "text-gray-500"
                          : "text-gray-400"
                      }`}
                    >
                      Weekly sales performance
                    </p>
                  </div>
                </SectionTitle>

                <button
                  onClick={() =>
                    setRange(
                      range === "This week"
                        ? "This month"
                        : "This week"
                    )
                  }
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                    darkMode
                      ? "border-white/10 text-gray-300 hover:bg-white/5"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >

                  {range}

                  <ChevronDown
                    size={13}
                  />

                </button>

              </div>

              <div
                className={`flex items-end justify-between rounded-xl px-4 py-3 mb-1 ${
                  darkMode
                    ? "bg-white/[0.025] border border-white/[0.05]"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                <div>
                  <p
                    className={`text-[10px] uppercase tracking-[1.5px] ${
                      darkMode
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}
                  >
                    Sales trend
                  </p>

                  <p
                    className={`text-lg font-bold mt-0.5 ${
                      darkMode
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    ₹{salesData.reduce((sum, item) => sum + item.value, 0)}k
                  </p>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    darkMode
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  +12.8%
                </span>
              </div>

              <div className="h-[230px] sm:h-[280px] mt-5 -ml-3">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <AreaChart
                    data={salesData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 0,
                    }}
                  >

                    <defs>

                      <linearGradient
                        id="salesGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="0%"
                          stopColor="#F5A524"
                          stopOpacity={0.35}
                        />

                        <stop
                          offset="100%"
                          stopColor="#F5A524"
                          stopOpacity={0}
                        />

                      </linearGradient>

                    </defs>

                    <CartesianGrid
                      vertical={false}
                      stroke={
                        darkMode
                          ? "rgba(255,255,255,0.06)"
                          : "#f0f0f0"
                      }
                    />

                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: darkMode
                          ? "#6B7280"
                          : "#9CA3AF",
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: darkMode
                          ? "#6B7280"
                          : "#9CA3AF",
                        fontSize: 12,
                      }}
                      tickFormatter={(value) =>
                        `${value}k`
                      }
                      width={34}
                    />

                    <Tooltip
                      contentStyle={
                        tooltipStyle
                      }
                      cursor={{
                        stroke: "#F5A524",
                        strokeWidth: 1,
                        strokeDasharray:
                          "4 4",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#F5A524"
                      strokeWidth={3}
                      fill="url(#salesGradient)"
                      activeDot={{
                        r: 5,
                        strokeWidth: 2,
                        stroke: darkMode
                          ? "#0B0F19"
                          : "#fff",
                      }}
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            </Card>

            {/* ================= TOP PRODUCTS ================= */}

            <Card
              darkMode={darkMode}
              className="xl:col-span-3 p-5 sm:p-6"
            >

              <div className="flex items-center justify-between mb-4">

                <SectionTitle
                  darkMode={darkMode}
                >
                  Top Products
                </SectionTitle>

                <button
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    darkMode
                      ? "hover:bg-white/5 text-gray-500"
                      : "hover:bg-gray-100 text-gray-400"
                  }`}
                >
                  <MoreHorizontal
                    size={16}
                  />
                </button>

              </div>

              <div className="space-y-4">

                {topProducts.length === 0 ? (

                  <p
                    className={`text-sm ${
                      darkMode
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    No products found.
                  </p>

                ) : (

                  topProducts.map(
                    (product, index) => (

                      <div
                        key={product.id}
                        className="flex items-center gap-3"
                      >

                        {/* Rank */}

                        <span
                          className={`text-[11px] font-semibold w-5 shrink-0 ${
                            darkMode
                              ? "text-gray-600"
                              : "text-gray-300"
                          }`}
                        >
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        {/* Image */}

                        {product.image ? (

                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.name
                            }
                            className="w-9 h-9 rounded-xl object-cover shrink-0 ring-1 ring-white/10"
                          />

                        ) : (

                          <div className="w-9 h-9 rounded-xl bg-gray-700 flex items-center justify-center shrink-0">

                            <ShoppingBag
                              size={16}
                            />

                          </div>

                        )}

                        {/* Product Info */}

                        <div className="min-w-0 flex-1">

                          <p
                            className={`text-sm font-medium truncate ${
                              darkMode
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {product.name}
                          </p>

                          <p
                            className={`text-[11px] ${
                              darkMode
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            Stock:{" "}
                            {product.stock}
                          </p>

                        </div>

                        {/* Price */}

                        <span
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border shrink-0 ${
                            darkMode
                              ? "border-white/10 text-gray-400"
                              : "border-gray-200 text-gray-500"
                          }`}
                        >
                          ₹
                          {product.price}
                        </span>

                      </div>

                    )
                  )

                )}

              </div>

            </Card>

            {/* ================= ORDER SUMMARY ================= */}

            <Card
              darkMode={darkMode}
              className="xl:col-span-3 p-5 sm:p-6"
            >

              <div className="flex items-center justify-between mb-2">

                <SectionTitle
                  darkMode={darkMode}
                >
                  Order Summary
                </SectionTitle>

              </div>

              <div className="relative h-[150px] flex items-center justify-center">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={dynamicOrderSummary}
                      dataKey="value"
                      innerRadius="68%"
                      outerRadius="100%"
                      paddingAngle={3}
                      stroke="none"
                    >

                      {dynamicOrderSummary.map(
                        (entry) => (

                          <Cell
                            key={entry.name}
                            fill={entry.color}
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip
                      contentStyle={
                        tooltipStyle
                      }
                    />

                  </PieChart>

                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

                  <span
                    className={`text-xl font-bold ${
                      darkMode
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {totalOrders}%
                  </span>

                  <span
                    className={`text-[10px] ${
                      darkMode
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    Total
                  </span>

                </div>

              </div>

              <div className="mt-4 space-y-2.5">

                {dynamicOrderSummary.map(
                  (summary) => (

                    <div
                      key={summary.name}
                      className="flex items-center justify-between text-xs"
                    >

                      <span className="flex items-center gap-2">

                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              summary.color,
                          }}
                        />

                        <span
                          className={
                            darkMode
                              ? "text-gray-400"
                              : "text-gray-500"
                          }
                        >
                          {summary.name}
                        </span>

                      </span>

                      <span
                        className={`font-semibold ${
                          darkMode
                            ? "text-white"
                            : "text-gray-900"
                        }`}
                      >
                        {summary.value}%
                      </span>

                    </div>

                  )
                )}

              </div>

            </Card>

          </div>

          {/* ================= RECENT ACTIVITY ================= */}

          <Card
            darkMode={darkMode}
            className="p-5 sm:p-6 bg-gradient-to-br from-[#101722] to-[#0D131D]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <SectionTitle darkMode={darkMode}>
                  Recent Activity
                </SectionTitle>

                <p
                  className={`text-[11px] mt-1 ${
                    darkMode
                      ? "text-gray-500"
                      : "text-gray-400"
                  }`}
                >
                  Latest order activity from your store
                </p>
              </div>

              <div
                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold self-start sm:self-auto ${
                  darkMode
                    ? "bg-[#F5A524]/10 text-[#F5A524]"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {recentActivities.length} latest orders
              </div>
            </div>

            {recentActivities.length === 0 ? (
              <div
                className={`py-10 text-center text-sm ${
                  darkMode
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                No recent activity found.
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivities.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(
                    activity.type
                  );

                  const status = String(
                    activity.orderStatus || ""
                  ).toLowerCase();

                  const payment = String(
                    activity.paymentStatus || ""
                  ).toLowerCase();

                  const statusClass =
                    status === "delivered"
                      ? darkMode
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : status === "shipped"
                      ? darkMode
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-blue-50 text-blue-600 border-blue-100"
                      : status === "cancelled"
                      ? darkMode
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-red-50 text-red-600 border-red-100"
                      : darkMode
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-amber-50 text-amber-600 border-amber-100";

                  return (
                    <div
                      key={`${activity.id}-${index}`}
                      className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border transition-all hover:-translate-y-0.5 ${
                        darkMode
                          ? "bg-white/[0.025] border-white/[0.06] hover:bg-white/[0.045] hover:border-[#F5A524]/20"
                          : "bg-gray-50/70 border-gray-100 hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0 flex items-center justify-center ${
                          activity.type === "payment"
                            ? darkMode
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-emerald-50 text-emerald-600"
                            : activity.type === "shipping"
                            ? darkMode
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-blue-50 text-blue-600"
                            : darkMode
                            ? "bg-[#F5A524]/10 text-[#F5A524]"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        <ActivityIcon size={18} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={`text-sm font-semibold truncate ${
                              darkMode
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {activity.orderNumber}
                          </p>

                          <span
                            className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold capitalize ${statusClass}`}
                          >
                            {activity.orderStatus || "Pending"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <p
                            className={`text-[11px] truncate max-w-[180px] sm:max-w-[260px] ${
                              darkMode
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            {activity.customer}
                          </p>

                          <span
                            className={`text-[10px] ${
                              payment === "paid"
                                ? "text-emerald-400"
                                : darkMode
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            Payment: {activity.paymentStatus || "Pending"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`text-sm font-bold ${
                            darkMode
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          ₹{activity.amount.toLocaleString("en-IN")}
                        </p>

                        <p
                          className={`text-[10px] mt-1 ${
                            darkMode
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          {formatActivityTime(activity.time)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>


        </div>

      </div>

    </AdminLayout>
  );
}