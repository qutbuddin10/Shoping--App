import React, {
  useEffect,
  useState,
} from "react";

import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Lock,
  ChevronLeft,
  Package,
  RotateCcw,
  CheckCircle2,
  Ruler,
} from "lucide-react";

import Swal from "sweetalert2";

import Navbar from "../components/Navbar";

import { useNavigate } from "react-router-dom";
import api_base from "../apibase";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] =
    useState(0);

  const navigate =
    useNavigate();

  const [totalItems, setTotalItems] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  // =====================================================
  // FETCH CART
  // =====================================================

  const fetchCart = async () => {
    try {
      const response =
        await fetch(
          `${api_base}cart/`,
          {
            method: "GET",
            credentials: "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          Swal.fire({
            icon: "warning",
            title: "Login Required",
            text: "Please login to view your cart.",
          });

          return;
        }

        throw new Error(
          data.msg ||
            "Unable to fetch cart"
        );
      }

      setCart(
        data.cart || []
      );

      setSubtotal(
        Number(
          data.subtotal || 0
        )
      );

      const count = Number(
        data.total_items || 0
      );

      setTotalItems(count);

      window.dispatchEvent(
        new CustomEvent(
          "cartUpdated",
          {
            detail: {
              count,
            },
          }
        )
      );
    } catch (error) {
      console.error(
        "Cart error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD CART
  // =====================================================

  useEffect(() => {
    fetchCart();
  }, []);

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  const increaseQuantity = async (
    item
  ) => {
    try {
      const response =
        await fetch(
          `${api_base}cart/${item.id}/increase/`,
          {
            method: "PATCH",
            credentials: "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "warning",
          title:
            data.msg ||
            "Unable to increase quantity",
          showConfirmButton: false,
          timer: 1800,
        });

        return;
      }

      fetchCart();
    } catch (error) {
      console.error(
        "Increase quantity error:",
        error
      );
    }
  };

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  const decreaseQuantity = async (
    item
  ) => {
    try {
      const response =
        await fetch(
          `${api_base}cart/${item.id}/decrease/`,
          {
            method: "PATCH",
            credentials: "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "warning",
          title:
            data.msg ||
            "Unable to decrease quantity",
          showConfirmButton: false,
          timer: 1800,
        });

        return;
      }

      fetchCart();
    } catch (error) {
      console.error(
        "Decrease quantity error:",
        error
      );
    }
  };

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  const removeItem = async (
    item
  ) => {
    const result =
      await Swal.fire({
        title:
          "Remove product?",
        text:
          item.size
            ? `Size ${item.size} will be removed from your cart.`
            : "This product will be removed from your cart.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText:
          "Remove",
        cancelButtonText:
          "Cancel",
        confirmButtonColor:
          "#111827",
      });

    if (
      !result.isConfirmed
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `${api_base}cart/${item.id}/remove/`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title:
            "Unable to remove",
          text:
            data.msg ||
            "Unable to remove product.",
        });

        return;
      }

      fetchCart();
    } catch (error) {
      console.error(
        "Remove item error:",
        error
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060B18]">

        <div className="h-[74px] w-full shrink-0" aria-hidden="true" />
        <div className="fixed left-0 top-0 z-[100] w-full border-b border-white/10 bg-gradient-to-r from-[#080D18]/98 via-[#0B1424]/96 to-[#0A1220]/98 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <Navbar />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

          <div className="animate-pulse">

            <div className="mb-10 space-y-3">

              <div className="h-3 w-28 rounded-full bg-white/10" />

              <div className="h-10 w-52 rounded-xl bg-white/10" />

              <div className="h-4 w-64 rounded-full bg-white/10" />

            </div>

            <div className="grid gap-8 lg:grid-cols-12">

              <div className="space-y-4 lg:col-span-8">

                {[1, 2, 3].map(
                  (i) => (
                    <div
                      key={i}
                      className="h-44 rounded-3xl border border-white/10 bg-[#0D1628]/90"
                    />
                  )
                )}

              </div>

              <div className="h-[500px] rounded-3xl border border-white/10 bg-[#0D1628]/90 lg:col-span-4" />

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (cart.length === 0) {
    return (
      <div className="min-h-screen overflow-hidden bg-[#060B18] text-gray-100">

        <div className="h-[74px] w-full shrink-0" aria-hidden="true" />
        <div className="fixed left-0 top-0 z-[100] w-full border-b border-white/10 bg-gradient-to-r from-[#080D18]/98 via-[#0B1424]/96 to-[#0A1220]/98 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <Navbar />
        </div>

        <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4">

          <div className="pointer-events-none absolute inset-0">

            <div className="absolute left-[15%] top-[20%] h-72 w-72 rounded-full bg-amber-300/10 blur-[100px]" />

            <div className="absolute bottom-[10%] right-[10%] h-80 w-80 rounded-full bg-orange-300/10 blur-[120px]" />

          </div>

          <div className="relative w-full max-w-xl text-center">

            <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-[2.5rem] border border-white/10 bg-[#0D1628]/90 shadow-[0_25px_70px_-20px_rgba(0,0,0,0.15)]">

              <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-[#111827] shadow-xl">

                <ShoppingBag
                  size={36}
                  strokeWidth={1.5}
                  className="text-amber-400"
                />

              </div>

            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#F5A524]/25 bg-[#F5A524]/[0.10] px-4 py-2">

              <Sparkles
                size={13}
                className="text-[#F5A524]"
              />

              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#F5A524]">
                Your shopping bag
              </span>

            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-100 sm:text-5xl">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-gray-400 sm:text-base">
              You haven't added anything to your cart yet. Explore our
              collection and find something made for you.
            </p>

            <button
              onClick={() => {
                window.location.href =
                  "/products";
              }}
              className="group mt-9 inline-flex items-center gap-3 rounded-2xl bg-[#111827] px-8 py-4 text-sm font-semibold text-white shadow-[0_15px_35px_-12px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#F5A524]/[0.10]0 hover:text-white hover:shadow-amber-500/30"
            >
              Explore Products

              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-all group-hover:bg-[#111827]/10">

                <ArrowRight
                  size={15}
                />

              </span>

            </button>

          </div>

        </section>

      </div>
    );
  }

  // =====================================================
  // CART PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#060B18] text-gray-100"><div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 top-24 h-[520px] w-[520px] rounded-full bg-[#0B73FF]/[0.06] blur-[140px]" />
        <div className="absolute -left-32 top-[38%] h-[420px] w-[420px] rounded-full bg-[#F5A524]/[0.04] blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.22]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
      </div>

      <div className="h-[74px] w-full shrink-0" aria-hidden="true" />
        <div className="fixed left-0 top-0 z-[100] w-full border-b border-white/10 bg-gradient-to-r from-[#080D18]/98 via-[#0B1424]/96 to-[#0A1220]/98 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <Navbar />
        </div>

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-white/10 bg-[#0D1628]/90">

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          <button
            onClick={() =>
              (window.location.href =
                "/products")
            }
            className="group inline-flex items-center gap-2 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-100"
          >

            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#0D1628]/90 transition-all group-hover:border-white/30">

              <ChevronLeft
                size={14}
              />

            </span>

            Continue shopping

          </button>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <div className="h-1.5 w-1.5 rounded-full bg-[#F5A524]/[0.10]0" />

                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#F5A524]">
                  Shopping Bag
                </p>

              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Your Cart
              </h1>

              <p className="mt-3 text-sm text-gray-400">
                Review your items before completing your purchase.
              </p>

            </div>

            <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-[#0A1220] px-4 py-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D1628]/90 shadow-sm">

                <ShieldCheck
                  size={17}
                  className="text-emerald-500"
                />

              </div>

              <div>

                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Checkout
                </p>

                <p className="text-xs font-semibold text-gray-200">
                  Secure & Protected
                </p>

              </div>

            </div>

          </div>

        </div>

      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="lg:col-span-8">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-gray-100">
                  Cart Items
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {totalItems} item
                  {totalItems !== 1
                    ? "s"
                    : ""}{" "}
                  in your bag
                </p>

              </div>

              <div className="hidden items-center gap-2 rounded-full bg-[#0D1628]/90 px-3 py-2 text-xs font-medium text-gray-400 shadow-sm ring-1 ring-white/10 sm:flex">

                <CheckCircle2
                  size={14}
                  className="text-emerald-500"
                />

                Ready to checkout

              </div>

            </div>

            <div className="space-y-4">

              {cart.map(
                (item) => (
                  <article
                    key={item.id}
                    className="group relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#0D1628]/90 p-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.16)] sm:p-5"
                  >

                    <div className="absolute left-0 top-0 h-full w-1 origin-left scale-y-0 bg-[#F5A524]/[0.10]0 transition-transform duration-300 group-hover:scale-y-100" />

                    <div className="flex gap-4 sm:gap-5">

                      {/* IMAGE */}

                      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-[#0A1220] sm:h-36 sm:w-36">

                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10" />

                        <div className="absolute bottom-2 left-2 hidden items-center gap-1 rounded-full bg-[#0D1628]/90 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-300 shadow-sm backdrop-blur sm:flex">

                          <Sparkles
                            size={9}
                            className="text-[#F5A524]"
                          />

                          Pick

                        </div>

                      </div>

                      {/* DETAILS */}

                      <div className="flex min-w-0 flex-1 flex-col">

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            {item.category?.name && (
                              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#F5A524]">
                                {
                                  item
                                    .category
                                    .name
                                }
                              </p>
                            )}

                            <h2 className="line-clamp-2 text-[15px] font-bold leading-snug text-white sm:text-lg">
                              {item.name}
                            </h2>

                            <div className="mt-2 flex items-center gap-1.5">

                              <CheckCircle2
                                size={12}
                                className="text-emerald-500"
                              />

                              <span className="text-[11px] font-medium text-gray-500">
                                In stock
                              </span>

                            </div>

                          </div>

                          {/* REMOVE */}

                          <button
                            onClick={() =>
                              removeItem(
                                item
                              )
                            }
                            aria-label="Remove item"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-transparent text-gray-600 transition-all duration-200 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
                          >

                            <Trash2
                              size={15}
                            />

                          </button>

                        </div>

                        {/* =================================================
                            SIZE
                        ================================================= */}

                        {item.size && (
                          <div className="mt-3">

                            <div className="inline-flex items-center gap-2 rounded-xl border border-[#F5A524]/20 bg-[#F5A524]/[0.10] px-3 py-2">

                              <Ruler
                                size={14}
                                className="text-[#F5A524]"
                              />

                              <span className="text-[11px] font-semibold text-gray-400">
                                Size
                              </span>

                              <span className="text-sm font-bold text-white">
                                {item.size}
                              </span>

                            </div>

                            {item.size_stock !==
                              null &&
                              item.size_stock !==
                                undefined && (
                                <p className="mt-1.5 text-[10px] text-gray-500">
                                  {
                                    item
                                      .size_stock
                                  }{" "}
                                  left in this size
                                </p>
                              )}

                          </div>
                        )}

                        {/* PRICE */}

                        <div className="mt-3">

                          <div className="flex items-baseline gap-2">

                            <span className="text-xl font-bold tracking-tight text-white">
                              ₹
                              {Number(
                                item.price
                              ).toFixed(
                                2
                              )}
                            </span>

                            <span className="text-[11px] text-gray-500">
                              per unit
                            </span>

                          </div>

                        </div>

                        {/* CONTROLS */}

                        <div className="mt-auto flex items-end justify-between gap-3 pt-4">

                          {/* QUANTITY */}

                          <div>

                            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-500">
                              Quantity
                            </p>

                            <div className="inline-flex items-center overflow-hidden rounded-xl border border-white/10 bg-[#0A1220] p-0.5">

                              <button
                                onClick={() =>
                                  decreaseQuantity(
                                    item
                                  )
                                }
                                aria-label="Decrease quantity"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-white/10 hover:text-white hover:shadow-sm"
                              >

                                <Minus
                                  size={13}
                                />

                              </button>

                              <span className="flex w-9 items-center justify-center text-sm font-bold tabular-nums text-gray-100">
                                {
                                  item.quantity
                                }
                              </span>

                              <button
                                onClick={() =>
                                  increaseQuantity(
                                    item
                                  )
                                }
                                aria-label="Increase quantity"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-white/10 hover:text-white hover:shadow-sm"
                              >

                                <Plus
                                  size={13}
                                />

                              </button>

                            </div>

                          </div>

                          {/* TOTAL */}

                          <div className="text-right">

                            <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-gray-500">
                              Item Total
                            </p>

                            <p className="text-lg font-bold tracking-tight text-white">
                              ₹
                              {(
                                Number(
                                  item.price
                                ) *
                                item.quantity
                              ).toFixed(
                                2
                              )}
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  </article>
                )
              )}

            </div>

            {/* =================================================
                BENEFITS
            ================================================= */}

            <div className="mt-6 grid gap-3 sm:grid-cols-3">

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0D1628]/90 p-4">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5A524]/[0.10]">

                  <Truck
                    size={16}
                    className="text-[#F5A524]"
                  />

                </div>

                <div>

                  <p className="text-xs font-bold text-gray-200">
                    Free Delivery
                  </p>

                  <p className="mt-0.5 text-[10px] text-gray-500">
                    Fast & reliable
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0D1628]/90 p-4">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">

                  <RotateCcw
                    size={16}
                    className="text-emerald-600"
                  />

                </div>

                <div>

                  <p className="text-xs font-bold text-gray-200">
                    Easy Returns
                  </p>

                  <p className="mt-0.5 text-[10px] text-gray-500">
                    Simple & convenient
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0D1628]/90 p-4">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">

                  <ShieldCheck
                    size={16}
                    className="text-purple-600"
                  />

                </div>

                <div>

                  <p className="text-xs font-bold text-gray-200">
                    Secure Payment
                  </p>

                  <p className="mt-0.5 text-[10px] text-gray-500">
                    100% protected
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              RIGHT - SUMMARY
          ================================================= */}

          <div className="lg:col-span-4">

            <div className="sticky top-24 overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0D1628]/90 shadow-[0_25px_70px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl">

              <div className="h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-orange-500" />

              <div className="p-5 sm:p-7">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#080D18] text-white shadow-lg shadow-black/30">

                      <Package
                        size={19}
                      />

                    </div>

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                        Summary
                      </p>

                      <h2 className="mt-0.5 text-lg font-bold text-white">
                        Order Total
                      </h2>

                    </div>

                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5A524]/[0.10]">

                    <ShoppingBag
                      size={15}
                      className="text-[#F5A524]"
                    />

                  </div>

                </div>

                {/* ITEMS */}

                <div className="mt-7 rounded-2xl bg-[#0A1220] p-4">

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-medium text-gray-400">
                      Products
                    </span>

                    <span className="text-xs font-bold text-gray-100">
                      {totalItems} item
                      {totalItems !==
                      1
                        ? "s"
                        : ""}
                    </span>

                  </div>

                  <div className="mt-4 flex items-center justify-between">

                    <span className="text-sm text-gray-400">
                      Subtotal
                    </span>

                    <span className="text-sm font-bold text-white">
                      ₹
                      {subtotal.toFixed(
                        2
                      )}
                    </span>

                  </div>

                  <div className="mt-4 flex items-center justify-between">

                    <span className="flex items-center gap-2 text-sm text-gray-400">

                      <Truck
                        size={14}
                        className="text-emerald-500"
                      />

                      Delivery

                    </span>

                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Free
                    </span>

                  </div>

                </div>

                <div className="my-6 border-t border-dashed border-white/10" />

                {/* GRAND TOTAL */}

                <div className="flex items-end justify-between">

                  <div>

                    <p className="text-xs font-medium text-gray-500">
                      Total amount
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-100">
                      Including delivery
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-3xl font-bold tracking-tight text-white">
                      ₹
                      {subtotal.toFixed(
                        2
                      )}
                    </p>

                  </div>

                </div>

                {/* CHECKOUT */}

                <button
                  onClick={() =>
                    navigate(
                      "/checkout"
                    )
                  }
                  className="group mt-7 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#080D18] py-4 text-sm font-bold text-white shadow-[0_15px_35px_-12px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#F5A524]/[0.10]0 hover:text-white hover:shadow-amber-500/30 active:translate-y-0"
                >

                  <Lock
                    size={14}
                  />

                  Proceed to Checkout

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-all group-hover:bg-[#080D18]/10">

                    <ArrowRight
                      size={14}
                    />

                  </span>

                </button>

                <div className="mt-4 flex items-center justify-center gap-2">

                  <ShieldCheck
                    size={13}
                    className="text-emerald-500"
                  />

                  <span className="text-[10px] font-medium text-gray-500">
                    Secure & encrypted checkout
                  </span>

                </div>

                {/* TRUST */}

                <div className="mt-7 border-t border-white/10 pt-6">

                  <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                    Why shop with us
                  </p>

                  <div className="space-y-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5A524]/[0.10]">

                        <Truck
                          size={15}
                          className="text-[#F5A524]"
                        />

                      </div>

                      <div>

                        <p className="text-xs font-semibold text-gray-200">
                          Fast & reliable delivery
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-500">
                          Delivered safely to your doorstep
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">

                        <ShieldCheck
                          size={15}
                          className="text-emerald-600"
                        />

                      </div>

                      <div>

                        <p className="text-xs font-semibold text-gray-200">
                          Protected payments
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-500">
                          Your payment is securely processed
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">

                        <Sparkles
                          size={15}
                          className="text-purple-600"
                        />

                      </div>

                      <div>

                        <p className="text-xs font-semibold text-gray-200">
                          Premium quality
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-500">
                          Carefully selected products
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-center">

              <Lock
                size={12}
                className="text-gray-500"
              />

              <p className="text-[10px] text-gray-500">
                Your information is safe and protected
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Cart;