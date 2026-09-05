import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CreditCard,
    MapPin,
    Smartphone,
    Truck,
    ShieldCheck,
    Lock,
} from "lucide-react";
import Swal from "sweetalert2";
import api_base from "../apibase";
import Navbar from "../components/Navbar";



const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const addressId = location.state?.addressId;

    const [cart, setCart] = useState([]);
    const [address, setAddress] = useState(null);

    const [selectedPayment, setSelectedPayment] = useState("COD");

    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);

    // =========================================================
    // LOAD RAZORPAY CHECKOUT SCRIPT
    // =========================================================

    useEffect(() => {
        const existingScript = document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

        if (existingScript) {
            return;
        }

        const script = document.createElement("script");

        script.src =
            "https://checkout.razorpay.com/v1/checkout.js";

        script.async = true;

        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // =========================================================
    // LOAD CART + ADDRESS
    // =========================================================

    useEffect(() => {
        const loadPaymentData = async () => {
            try {
                setLoading(true);

                const cartResponse = await fetch(
                    `${api_base}cart/`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const cartData = await cartResponse.json();

                if (!cartResponse.ok) {
                    throw new Error(
                        cartData.msg ||
                            "Unable to load cart"
                    );
                }

                setCart(
                    cartData.cart_items ||
                        cartData.items ||
                        cartData.cart ||
                        []
                );

                if (!addressId) {
                    throw new Error(
                        "Delivery address not selected"
                    );
                }

                const addressResponse = await fetch(
                    `${api_base}addresses/${addressId}/`,
                    {
                        credentials: "include",
                    }
                );

                const addressData =
                    await addressResponse.json();

                if (!addressResponse.ok) {
                    throw new Error(
                        addressData.msg ||
                            "Unable to load address"
                    );
                }

                setAddress(
                    addressData.address ||
                        addressData
                );
            } catch (error) {
                console.error(error);

                Swal.fire({
                    icon: "error",
                    title: "Unable to continue",
                    text:
                        error.message ||
                        "Something went wrong",
                }).then(() => {
                    navigate("/checkout");
                });
            } finally {
                setLoading(false);
            }
        };

        loadPaymentData();
    }, [addressId, navigate]);

    // =========================================================
    // CART TOTAL
    // =========================================================

    const getItemPrice = (item) => {
        return Number(
            item.price ??
                item.product_price ??
                item.product?.price ??
                0
        );
    };

    const getItemQuantity = (item) => {
        return Number(
            item.quantity ??
                item.qty ??
                1
        );
    };

    const subtotal = cart.reduce(
        (total, item) => {
            return (
                total +
                getItemPrice(item) *
                    getItemQuantity(item)
            );
        },
        0
    );

    const shippingCharge = 0;

    const totalAmount =
        subtotal + shippingCharge;

    // =========================================================
    // PLACE COD ORDER
    // =========================================================

    const handleCODOrder = async () => {
        if (!addressId) {
            Swal.fire({
                icon: "warning",
                title: "Address Required",
                text:
                    "Please select a delivery address.",
            });

            navigate("/checkout");

            return;
        }

        if (!cart.length) {
            Swal.fire({
                icon: "warning",
                title: "Cart is Empty",
                text:
                    "Please add products to your cart.",
            });

            navigate("/cart");

            return;
        }

        try {
            setPlacingOrder(true);

            const response = await fetch(
                `${api_base}order/place/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        address_id: addressId,
                        payment_method: "COD",
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.msg ||
                        "Unable to place order"
                );
            }

            await Swal.fire({
                icon: "success",
                title: "Order Placed",
                text:
                    data.msg ||
                    "Your order has been placed successfully.",
                timer: 1800,
                showConfirmButton: false,
            });

            navigate("/profile");
        } catch (error) {
            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Order Failed",
                text:
                    error.message ||
                    "Unable to place order.",
            });
        } finally {
            setPlacingOrder(false);
        }
    };

    // =========================================================
    // CREATE REAL RAZORPAY ORDER
    // =========================================================

    const createRazorpayOrder = async () => {
        const response = await fetch(
            `${api_base}razorpay/create-order/`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    amount: totalAmount,
                    address_id: addressId,
                    payment_method:
                        selectedPayment,
                }),
            }
        );

        const data =
            await response.json();

        if (!response.ok || !data.status) {
            throw new Error(
                data.message ||
                    data.msg ||
                    "Unable to create Razorpay order"
            );
        }

        return data;
    };

    // =========================================================
    // VERIFY RAZORPAY PAYMENT
    // =========================================================

    const verifyRazorpayPayment = async (
        paymentResponse
    ) => {
        const response = await fetch(
            `${api_base}razorpay/verify-payment/`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    razorpay_order_id:
                        paymentResponse.razorpay_order_id,

                    razorpay_payment_id:
                        paymentResponse.razorpay_payment_id,

                    razorpay_signature:
                        paymentResponse.razorpay_signature,

                    address_id: addressId,

                    payment_method:
                        selectedPayment,
                }),
            }
        );

        const data =
            await response.json();

        if (!response.ok || !data.status) {
            throw new Error(
                data.message ||
                    data.msg ||
                    "Payment verification failed"
            );
        }

        return data;
    };

    // =========================================================
    // RAZORPAY PAYMENT
    // =========================================================

    const handleRazorpayPayment = async () => {
        if (!addressId) {
            Swal.fire({
                icon: "warning",
                title: "Address Required",
                text:
                    "Please select a delivery address.",
            });

            navigate("/checkout");

            return;
        }

        if (!cart.length) {
            Swal.fire({
                icon: "warning",
                title: "Cart is Empty",
                text:
                    "Please add products to your cart.",
            });

            navigate("/cart");

            return;
        }

        if (totalAmount <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Amount",
                text:
                    "Order amount must be greater than zero.",
            });

            return;
        }

        if (!window.Razorpay) {
            Swal.fire({
                icon: "error",
                title: "Razorpay Not Loaded",
                text:
                    "Please wait a moment and try again.",
            });

            return;
        }

        try {
            setPlacingOrder(true);

            // =================================================
            // CREATE RAZORPAY ORDER
            // =================================================

            const razorpayData =
                await createRazorpayOrder();

            const razorpayOrder =
                razorpayData.order;

            // =================================================
            // RAZORPAY CHECKOUT OPTIONS
            // =================================================

            const options = {
                key:
                    razorpayData.key_id,

                amount:
                    razorpayOrder.amount,

                currency:
                    razorpayOrder.currency,

                name: "ShopNest",

                description:
                    "ShopNest Order Payment",

                order_id:
                    razorpayOrder.id,

                handler: async function (
                    paymentResponse
                ) {
                    try {
                        // =====================================
                        // PAYMENT SUCCESS
                        // =====================================

                        console.log(
                            "Razorpay Payment Successful:",
                            paymentResponse
                        );

                        // =====================================
                        // VERIFY PAYMENT ON BACKEND
                        // =====================================

                        const verificationData =
                            await verifyRazorpayPayment(
                                paymentResponse
                            );

                        // =====================================
                        // PAYMENT + ORDER SUCCESS
                        // =====================================

                        await Swal.fire({
                            icon: "success",
                            title: "Order Placed",
                            text:
                                verificationData.message ||
                                "Payment verified and order placed successfully.",
                            timer: 1800,
                            showConfirmButton: false,
                        });

                        navigate("/profile");
                    } catch (error) {
                        console.error(
                            "Payment Verification Error:",
                            error
                        );

                        Swal.fire({
                            icon: "error",
                            title: "Payment Verification Failed",
                            text:
                                error.message ||
                                "Payment was received but could not be verified.",
                        });
                    } finally {
                        setPlacingOrder(false);
                    }
                },

                prefill: {
                    name:
                        address?.full_name ||
                        "",

                    contact:
                        address?.mobile ||
                        "",
                },

                notes: {
                    address_id:
                        String(addressId),

                    payment_method:
                        selectedPayment,
                },

                theme: {
                    color: "#F5A524",
                },

                modal: {
                    ondismiss: function () {
                        setPlacingOrder(false);
                    },
                },
            };

            // =================================================
            // CREATE RAZORPAY INSTANCE
            // =================================================

            const razorpay =
                new window.Razorpay(
                    options
                );

            // =================================================
            // PAYMENT FAILED
            // =================================================

            razorpay.on(
                "payment.failed",
                function (response) {
                    console.error(
                        "Razorpay Payment Failed:",
                        response.error
                    );

                    setPlacingOrder(false);

                    Swal.fire({
                        icon: "error",
                        title: "Payment Failed",
                        text:
                            response.error
                                ?.description ||
                            "Payment could not be completed.",
                    });
                }
            );

            // =================================================
            // OPEN RAZORPAY
            // =================================================

            razorpay.open();
        } catch (error) {
            console.error(error);

            setPlacingOrder(false);

            Swal.fire({
                icon: "error",
                title: "Payment Error",
                text:
                    error.message ||
                    "Unable to start Razorpay payment.",
            });
        }
    };

    // =========================================================
    // MAIN PAYMENT HANDLER
    // =========================================================

    const handlePayment = () => {
        if (selectedPayment === "COD") {
            handleCODOrder();

            return;
        }

        handleRazorpayPayment();
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="relative min-h-screen bg-[#060B18] flex items-center justify-center overflow-hidden">
                <div className="h-[74px] w-full shrink-0 absolute top-0" aria-hidden="true" />
                <div className="fixed left-0 top-0 z-[100] w-full border-b border-white/10 bg-gradient-to-r from-[#080D18]/98 via-[#0B1424]/96 to-[#0A1220]/98 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                    <Navbar />
                </div>
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-40 top-24 h-[520px] w-[520px] rounded-full bg-[#0B73FF]/[0.06] blur-[140px]" />
                    <div className="absolute -left-32 bottom-0 h-[420px] w-[420px] rounded-full bg-[#F5A524]/[0.04] blur-[130px]" />
                    <div className="absolute inset-0 opacity-[0.22]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
                </div>
                <div className="relative z-10 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full border-4 border-white/10 border-t-[#F5A524] animate-spin"></div>

                    <p className="mt-4 text-gray-400 font-medium">
                        Loading payment details...
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div className="min-h-screen bg-[#060B18]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-48 top-20 h-[560px] w-[560px] rounded-full bg-[#0B73FF]/[0.06] blur-[150px]" />
                <div className="absolute -left-40 top-[42%] h-[460px] w-[460px] rounded-full bg-[#F5A524]/[0.04] blur-[140px]" />
                <div className="absolute inset-0 opacity-[0.22]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
            </div>

<div className="h-[74px] w-full shrink-0" aria-hidden="true" />
            <div className="fixed left-0 top-0 z-[100] w-full border-b border-white/10 bg-gradient-to-r from-[#080D18]/98 via-[#0B1424]/96 to-[#0A1220]/98 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                <Navbar />
            </div>

            {/* =================================================
                HEADER
            ================================================= */

            <div className="border-b border-white/10 bg-[#0A1220]/80 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

                    <button
                        onClick={() =>
                            navigate("/checkout")
                        }
                        className="flex items-center gap-2 text-gray-400 transition hover:text-white"
                    >
                        <ArrowLeft size={18} />

                        <span className="font-medium">
                            Back to Checkout
                        </span>
                    </button>

                </div>
            </div>

            /* =================================================
                MAIN
            ================================================= */}

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-[3px] text-[#F5A524]">
                        Secure Checkout
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                        Payment
                    </h1>

                    <p className="mt-2 text-gray-400">
                        Choose your preferred payment method.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

                    {/* =================================================
                        LEFT
                    ================================================= */}

                    <div className="space-y-6">

                        {/* DELIVERY ADDRESS */}

                        <div className="rounded-[1.5rem] border border-white/10 bg-[#0D1628]/90 p-6 shadow-[0_25px_70px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl">

                            <div className="flex items-center justify-between">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5A524]/10 text-[#F5A524]">
                                        <MapPin size={19} />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-white">
                                            Delivery Address
                                        </h2>

                                        <p className="text-sm text-gray-400">
                                            Your order will be delivered here
                                        </p>
                                    </div>

                                </div>

                                <button
                                    onClick={() =>
                                        navigate("/checkout")
                                    }
                                    className="text-sm font-semibold text-[#F5A524] hover:underline"
                                >
                                    Change
                                </button>

                            </div>

                            {address && (
                                <div className="mt-5 rounded-xl border border-white/10 bg-[#080F1C]/90 p-4 shadow-inner shadow-black/20">

                                    <p className="font-semibold text-white">
                                        {address.full_name}
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-gray-400">
                                        {address.house},{" "}
                                        {address.area},{" "}
                                        {address.city},{" "}
                                        {address.state} -{" "}
                                        {address.pincode}
                                    </p>

                                    <p className="mt-2 text-sm text-gray-400">
                                        Mobile:{" "}
                                        {address.mobile}
                                    </p>

                                </div>
                            )}

                        </div>

                        {/* PAYMENT METHODS */}

                        <div className="rounded-[1.5rem] border border-white/10 bg-[#0D1628]/90 p-6 shadow-[0_25px_70px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl">

                            <div className="mb-6">

                                <h2 className="text-xl font-bold text-white">
                                    Select Payment Method
                                </h2>

                                <p className="mt-1 text-sm text-gray-400">
                                    Online payments are securely processed by Razorpay.
                                </p>

                            </div>

                            <div className="space-y-3">

                                {/* COD */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedPayment(
                                            "COD"
                                        )
                                    }
                                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                                        selectedPayment ===
                                        "COD"
                                            ? "border-[#F5A524]/70 bg-[#F5A524]/[0.08] shadow-[0_0_35px_rgba(245,165,36,0.08)]"
                                            : "border-white/10 hover:border-white/15"
                                    }`}
                                >

                                    <div className="flex items-center gap-4">

                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                                            <Truck size={22} />
                                        </div>

                                        <div className="flex-1">

                                            <div className="flex items-center justify-between">

                                                <h3 className="font-semibold text-white">
                                                    Cash on Delivery
                                                </h3>

                                                <span
                                                    className={`h-5 w-5 rounded-full border-2 ${
                                                        selectedPayment ===
                                                        "COD"
                                                            ? "border-[#F5A524] bg-[#F5A524] ring-4 ring-[#F5A524]/10"
                                                            : "border-white/15"
                                                    }`}
                                                />

                                            </div>

                                            <p className="mt-1 text-sm text-gray-400">
                                                Pay when your order arrives.
                                            </p>

                                        </div>

                                    </div>

                                </button>

                                {/* UPI */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedPayment(
                                            "UPI"
                                        )
                                    }
                                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                                        selectedPayment ===
                                        "UPI"
                                            ? "border-[#F5A524]/70 bg-[#F5A524]/[0.08] shadow-[0_0_35px_rgba(245,165,36,0.08)]"
                                            : "border-white/10 hover:border-white/15"
                                    }`}
                                >

                                    <div className="flex items-center gap-4">

                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                                            <Smartphone size={22} />
                                        </div>

                                        <div className="flex-1">

                                            <div className="flex items-center justify-between">

                                                <h3 className="font-semibold text-white">
                                                    UPI
                                                </h3>

                                                <span
                                                    className={`h-5 w-5 rounded-full border-2 ${
                                                        selectedPayment ===
                                                        "UPI"
                                                            ? "border-[#F5A524] bg-[#F5A524] ring-4 ring-[#F5A524]/10"
                                                            : "border-white/15"
                                                    }`}
                                                />

                                            </div>

                                            <p className="mt-1 text-sm text-gray-400">
                                                Pay securely using UPI through Razorpay.
                                            </p>

                                        </div>

                                    </div>

                                </button>

                                {/* CARD */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedPayment(
                                            "CARD"
                                        )
                                    }
                                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                                        selectedPayment ===
                                        "CARD"
                                            ? "border-[#F5A524]/70 bg-[#F5A524]/[0.08] shadow-[0_0_35px_rgba(245,165,36,0.08)]"
                                            : "border-white/10 hover:border-white/15"
                                    }`}
                                >

                                    <div className="flex items-center gap-4">

                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                                            <CreditCard size={22} />
                                        </div>

                                        <div className="flex-1">

                                            <div className="flex items-center justify-between">

                                                <h3 className="font-semibold text-white">
                                                    Credit / Debit Card
                                                </h3>

                                                <span
                                                    className={`h-5 w-5 rounded-full border-2 ${
                                                        selectedPayment ===
                                                        "CARD"
                                                            ? "border-[#F5A524] bg-[#F5A524] ring-4 ring-[#F5A524]/10"
                                                            : "border-white/15"
                                                    }`}
                                                />

                                            </div>

                                            <p className="mt-1 text-sm text-gray-400">
                                                Pay securely with your card through Razorpay.
                                            </p>

                                        </div>

                                    </div>

                                </button>

                            </div>

                            {/* SECURITY */}

                            <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-[#0A1220]/80 p-4">

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                                    <ShieldCheck size={18} />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-200">
                                        Secure Payment
                                    </p>

                                    <p className="text-xs text-gray-400">
                                        Your online payment is protected by Razorpay.
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        RIGHT - ORDER SUMMARY
                    ================================================= */}

                    <div className="h-fit rounded-[1.5rem] border border-white/10 bg-[#0D1628]/90 p-6 shadow-[0_25px_70px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:sticky lg:top-6">

                        <h2 className="text-xl font-bold text-white">
                            Order Summary
                        </h2>

                        <div className="mt-6 space-y-4">

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">
                                    Items
                                </span>

                                <span className="font-medium text-white">
                                    {cart.length}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">
                                    Subtotal
                                </span>

                                <span className="font-medium text-white">
                                    ₹
                                    {subtotal.toFixed(
                                        2
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">
                                    Shipping
                                </span>

                                <span className="font-medium text-emerald-400">
                                    {shippingCharge ===
                                    0
                                        ? "FREE"
                                        : `₹${shippingCharge.toFixed(
                                              2
                                          )}`}
                                </span>
                            </div>

                            <div className="border-t border-dashed border-white/10 pt-4">

                                <div className="flex items-center justify-between">

                                    <span className="font-semibold text-white">
                                        Total
                                    </span>

                                    <span className="text-2xl font-black text-white">
                                        ₹
                                        {totalAmount.toFixed(
                                            2
                                        )}
                                    </span>

                                </div>

                            </div>

                        </div>

                        {/* PAYMENT BUTTON */}

                        <button
                            type="button"
                            onClick={handlePayment}
                            disabled={placingOrder}
                            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#F5A524] px-5 font-bold text-black shadow-lg shadow-[#F5A524]/20 transition-all hover:bg-[#E99A0C] disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {placingOrder ? (
                                <>
                                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" />

                                    Processing...
                                </>
                            ) : selectedPayment ===
                              "COD" ? (
                                <>
                                    <Truck size={19} />

                                    Place Order
                                </>
                            ) : (
                                <>
                                    <Lock size={18} />

                                    Pay Securely
                                </>
                            )}

                        </button>

                        <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                            By continuing, you agree to our terms
                            and conditions.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Payment;