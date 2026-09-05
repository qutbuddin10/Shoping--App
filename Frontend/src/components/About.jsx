import React from "react";
import {
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Truck,
    Headphones,
    PackageCheck,
    ShoppingBag,
    Star,
    Smartphone,
    Shirt,
    Watch,
    Home,
    Laptop,
    Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import Navbar from "./Navbar";
import Footer from "./Footer";

const About = () => {
    const navigate = useNavigate();

    // =====================================================
    // GET LOGGED-IN USER
    // =====================================================

    const getUser = () => {
        try {
            const storedUser = sessionStorage.getItem("user");

            if (storedUser) {
                return JSON.parse(storedUser);
            }

            return null;
        } catch (error) {
            console.error("User session error:", error);
            return null;
        }
    };

    // =====================================================
    // SHOP BUTTON
    // =====================================================

    const handleShop = () => {
        const user = getUser();

        if (!user) {
            Swal.fire({
                title: "Login Required",
                text: "Please login first to view products.",
                icon: "warning",
                confirmButtonColor: "#F5A524",
                confirmButtonText: "Login",
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/login");
                }
            });

            return;
        }

        navigate("/products");
    };

    // =====================================================
    // PRODUCT CATEGORIES
    // =====================================================

    const productCategories = [
        {
            icon: Shirt,
            title: "Fashion & Clothing",
            description:
                "Discover stylish clothing for everyday wear, casual occasions, work, parties and seasonal collections.",
        },
        {
            icon: Smartphone,
            title: "Electronics & Gadgets",
            description:
                "Shop smartphones, laptops, headphones, smart devices and useful technology for modern lifestyles.",
        },
        {
            icon: Watch,
            title: "Watches & Accessories",
            description:
                "Complete your look with premium watches, bags, wallets, fashion accessories and everyday essentials.",
        },
        {
            icon: Home,
            title: "Home & Lifestyle",
            description:
                "Find practical and stylish products for your home, workspace and daily lifestyle needs.",
        },
    ];

    // =====================================================
    // SHOPPING FEATURES
    // =====================================================

    const features = [
        {
            icon: ShieldCheck,
            title: "Secure Payments",
            description:
                "Shop confidently with secure payment options and protected transactions designed to keep your information safe.",
        },
        {
            icon: PackageCheck,
            title: "Quality Products",
            description:
                "We focus on products that offer reliable quality, useful features, attractive designs and genuine value.",
        },
        {
            icon: Truck,
            title: "Reliable Delivery",
            description:
                "Your products are carefully prepared and delivered through trusted logistics partners.",
        },
        {
            icon: Headphones,
            title: "Customer Support",
            description:
                "Need help with an order, product or delivery? Our support experience is designed around your needs.",
        },
    ];

    // =====================================================
    // PRODUCT BENEFITS
    // =====================================================

    const benefits = [
        "Wide range of products across multiple categories",
        "Fashion, electronics, footwear and lifestyle products",
        "Simple product discovery and easy navigation",
        "Secure checkout and convenient payment experience",
        "Order tracking and reliable delivery support",
        "Customer reviews to help you make better decisions",
    ];

    return (
        <>
            <Navbar />

            <main className="relative min-h-screen overflow-hidden bg-[#060B18] text-white">
                {/* Premium About Background */}
                <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.14]" style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
                        backgroundSize: "64px 64px"
                    }} />
                    <div className="absolute -top-44 left-[15%] h-[500px] w-[500px] rounded-full bg-[#2196FF]/[0.09] blur-[130px]" />
                    <div className="absolute top-[35%] -right-48 h-[500px] w-[500px] rounded-full bg-[#F5A524]/[0.055] blur-[130px]" />
                    <div className="absolute bottom-[10%] left-[35%] h-[420px] w-[420px] rounded-full bg-[#1769E0]/[0.07] blur-[130px]" />
                </div>

                {/* =====================================================
                    HERO
                ===================================================== */}

                <section className="relative overflow-hidden py-16 sm:py-20 lg:py-28">
                    <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-[#2196FF]/[0.10] blur-[130px]" />
                    <div className="absolute -right-40 top-20 h-[450px] w-[450px] rounded-full bg-[#1769E0]/[0.08] blur-[130px]" />

                    <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

                            {/* LEFT */}

                            <div>
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.045] backdrop-blur-xl px-4 py-2 text-xs font-bold text-slate-300 shadow-[0_18px_55px_rgba(0,0,0,0.18)] sm:text-sm">
                                    <ShoppingBag size={15} className="text-[#F5A524]" />
                                    YOUR MODERN SHOPPING DESTINATION
                                </div>

                                <h1 className="text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[70px]">
                                    Everything you need.
                                    <span className="mt-2 block bg-gradient-to-r from-[#55B0FF] via-[#8BCBFF] to-[#F5A524] bg-clip-text text-transparent">
                                        All in one place.
                                    </span>
                                </h1>

                                <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                                    We are building a modern e-commerce experience where
                                    customers can discover fashion, electronics, footwear,
                                    accessories, home products and everyday essentials from
                                    one convenient online store.
                                </p>

                                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                                    From the latest smartphone and laptop to stylish shoes,
                                    watches, clothing and lifestyle products, our goal is to
                                    make online shopping simple, reliable and enjoyable.
                                </p>

                                <div className="mt-8 flex flex-wrap gap-4">
                                    <button
                                        onClick={handleShop}
                                        className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F5A524] to-[#E08E0B] px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-[#F5A524]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[#F5A524]/40"
                                    >
                                        Explore Products
                                        <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                                    </button>

                                    <button
                                        onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                                        className="rounded-xl border border-white/[0.12] bg-white/[0.045] backdrop-blur-xl px-6 py-3.5 text-sm font-semibold text-slate-200 transition-all duration-300 hover:border-[#55B0FF]/35 hover:bg-white/[0.08]"
                                    >
                                        Explore Categories
                                    </button>
                                </div>

                                <div className="mt-9 flex flex-wrap gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10">
                                            <ShieldCheck size={18} className="text-emerald-300" />
                                        </div>

                                        <span className="text-xs font-bold text-slate-300">
                                            Secure Shopping
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5A524]/10">
                                            <Truck size={18} className="text-[#F5A524]" />
                                        </div>

                                        <span className="text-xs font-bold text-slate-300">
                                            Fast Delivery
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* IMAGE 1 */}

                            <div className="relative">
                                <div className="relative overflow-hidden rounded-[30px] border-[8px] border-white/[0.10] bg-[#0D1730] shadow-[0_30px_90px_rgba(0,0,0,0.34)]">
                                    <img
                                        src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85"
                                        alt="Modern online shopping experience"
                                        className="h-[420px] w-full object-cover sm:h-[500px] lg:h-[570px]"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                                    <div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-white/30 bg-white/90 p-5 shadow-[0_25px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:left-7 sm:right-7">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-medium text-slate-300">
                                                    Shop with confidence
                                                </p>

                                                <p className="mt-1 text-xl font-black text-white">
                                                    Fashion • Tech • Lifestyle
                                                </p>
                                            </div>

                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5A524] text-black shadow-lg shadow-[#F5A524]/20">
                                                <ShoppingBag size={23} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -bottom-8 -right-8 h-36 w-36 rounded-full bg-[#F5A524]/20 blur-[70px]" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    STATS
                ===================================================== */}

                <section className="border-y border-white/[0.08] bg-[#0A1326]/85 backdrop-blur-xl">
                    <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
                        {[
                            ["10K+", "Products"],
                            ["6+", "Product Categories"],
                            ["99%", "Shopping Satisfaction"],
                            ["24/7", "Customer Support"],
                        ].map(([value, label], index) => (
                            <div
                                key={label}
                                className={`px-4 py-8 text-center sm:px-6 sm:py-10 ${index !== 0 ? "border-l border-white/[0.08]" : ""}`}
                            >
                                <p className="bg-gradient-to-r from-[#F5A524] to-[#E08E0B] bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
                                    {value}
                                </p>

                                <p className="mt-2 text-xs font-medium text-slate-300 sm:text-sm">
                                    {label}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* =====================================================
                    PRODUCTS
                ===================================================== */}

                <section id="products" className="py-20 sm:py-24 lg:py-28">
                    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

                        <div className="mx-auto max-w-3xl text-center">
                            <p className="text-xs font-bold uppercase tracking-[3px] text-[#F5A524] sm:text-sm">
                                What You Can Shop
                            </p>

                            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                                Products for every part of your lifestyle.
                            </h2>

                            <p className="mt-5 text-sm leading-7 text-slate-300 sm:text-base">
                                Explore a growing collection of products carefully organized
                                into categories so you can find what you need quickly and
                                make confident buying decisions.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {productCategories.map((category) => {
                                const Icon = category.icon;

                                return (
                                    <div
                                        key={category.title}
                                        className="group rounded-2xl border border-white/[0.10] bg-white/[0.045] backdrop-blur-xl p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-[#55B0FF]/35 hover:shadow-[0_25px_70px_rgba(0,0,0,0.25)] hover:shadow-[#2196FF]/10 sm:p-7"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5A524]/10 text-[#F5A524] transition-all duration-300 group-hover:bg-[#2196FF] group-hover:text-black">
                                            <Icon size={23} />
                                        </div>

                                        <h3 className="mt-6 text-lg font-bold text-white">
                                            {category.title}
                                        </h3>

                                        <p className="mt-3 text-sm leading-6 text-slate-300">
                                            {category.description}
                                        </p>

                                        <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#F5A524]">
                                            Explore Collection
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    E-COMMERCE EXPERIENCE
                ===================================================== */}

                <section className="bg-[#0B1428] py-20 sm:py-24 lg:py-28">
                    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

                            <div>
                                <p className="text-xs font-bold uppercase tracking-[3px] text-[#F5A524] sm:text-sm">
                                    The Shopping Experience
                                </p>

                                <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                                    Designed to make shopping easier.
                                </h2>

                                <p className="mt-6 text-sm leading-7 text-slate-300 sm:text-base">
                                    A good e-commerce website should do more than display
                                    products. It should help customers discover, compare,
                                    choose and purchase products with confidence.
                                </p>

                                <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                                    That is why our platform focuses on simple navigation,
                                    detailed product information, customer reviews, secure
                                    checkout, order management and reliable delivery.
                                </p>

                                <div className="mt-8 space-y-4">
                                    {benefits.map((benefit) => (
                                        <div key={benefit} className="flex items-start gap-3">
                                            <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-emerald-300" />
                                            <span className="text-sm font-semibold text-slate-300">
                                                {benefit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PRODUCT INFORMATION CARD */}

                            <div className="rounded-[28px] border border-white/[0.10] bg-white/[0.045] backdrop-blur-xl p-6 shadow-[0_25px_70px_rgba(0,0,0,0.25)] sm:p-8">
                                <div className="flex items-center gap-4 border-b border-white/[0.09] pb-6">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5A524]/10 text-[#F5A524]">
                                        <Laptop size={27} />
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[2px] text-slate-400">
                                            Product Discovery
                                        </p>

                                        <h3 className="mt-1 text-xl font-black text-white">
                                            Find the right product
                                        </h3>
                                    </div>
                                </div>

                                <div className="mt-7 space-y-5">
                                    {[
                                        {
                                            icon: ShoppingBag,
                                            title: "Product Variety",
                                            text: "Choose from fashion, electronics, footwear, accessories and lifestyle products.",
                                        },
                                        {
                                            icon: Star,
                                            title: "Customer Reviews",
                                            text: "Read ratings and reviews from customers before making your purchase.",
                                        },
                                        {
                                            icon: Heart,
                                            title: "Wishlist & Cart",
                                            text: "Save products you love and easily move them to your shopping cart.",
                                        },
                                        {
                                            icon: PackageCheck,
                                            title: "Order Management",
                                            text: "Place orders, follow delivery progress and manage your purchases easily.",
                                        },
                                    ].map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <div key={item.title} className="flex gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                                                    <Icon size={19} />
                                                </div>

                                                <div>
                                                    <h4 className="font-bold text-white">
                                                        {item.title}
                                                    </h4>

                                                    <p className="mt-1 text-sm leading-6 text-slate-300">
                                                        {item.text}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    WHY CHOOSE US
                ===================================================== */}

                <section className="relative z-10 py-20 sm:py-24 lg:py-28">
                    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

                        <div className="max-w-3xl">
                            <p className="text-xs font-bold uppercase tracking-[3px] text-[#F5A524] sm:text-sm">
                                Why Choose Us
                            </p>

                            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                                More than products.
                                <span className="block text-slate-300">
                                    A complete shopping experience.
                                </span>
                            </h2>
                        </div>

                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature) => {
                                const Icon = feature.icon;

                                return (
                                    <div
                                        key={feature.title}
                                        className="group rounded-2xl border border-white/[0.10] bg-white/[0.045] backdrop-blur-xl p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-[#55B0FF]/35 hover:shadow-[0_25px_70px_rgba(0,0,0,0.25)] hover:shadow-[#2196FF]/10 sm:p-7"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5A524]/10 text-[#F5A524] transition-all duration-300 group-hover:bg-[#2196FF] group-hover:text-black">
                                            <Icon size={22} />
                                        </div>

                                        <h3 className="mt-6 text-lg font-bold text-white">
                                            {feature.title}
                                        </h3>

                                        <p className="mt-3 text-sm leading-6 text-slate-300">
                                            {feature.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    IMAGE 2 + CUSTOMER MESSAGE
                ===================================================== */}

                <section className="relative z-10 pb-20 sm:pb-28">
                    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                        <div className="relative min-h-[420px] overflow-hidden rounded-[30px] shadow-[0_30px_90px_rgba(0,0,0,0.34)]">
                            <img
                                src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1600&q=85"
                                alt="Customer shopping online"
                                className="absolute inset-0 h-full w-full object-cover"
                            />

                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

                            <div className="relative z-10 flex min-h-[420px] items-center px-6 py-14 sm:px-12 lg:px-20">
                                <div className="max-w-3xl">
                                    <div className="flex gap-1 text-[#F5A524]">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} size={18} fill="currentColor" />
                                        ))}
                                    </div>

                                    <h2 className="mt-6 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                                        Your shopping journey should feel simple,
                                        secure and worth coming back to.
                                    </h2>

                                    <p className="mt-6 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base">
                                        Whether you are looking for your next pair of
                                        shoes, a new smartphone, a laptop, a watch,
                                        clothing or something for your home, we want
                                        every purchase to be a smooth experience.
                                    </p>

                                    <button
                                        onClick={handleShop}
                                        className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-[#F5A524] px-6 py-3.5 text-sm font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFB84D]"
                                    >
                                        Start Shopping
                                        <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    FINAL CTA
                ===================================================== */}

                <section className="relative z-10 pb-20 sm:pb-28">
                    <div className="mx-auto max-w-5xl px-5 sm:px-8">
                        <div className="relative overflow-hidden rounded-[30px] border border-white/[0.10] bg-gradient-to-br from-[#12213E] via-[#0D1730] to-[#0A1429] px-6 py-14 text-center shadow-[0_25px_70px_rgba(0,0,0,0.25)] sm:px-12 sm:py-20">

                            <div className="pointer-events-none absolute left-1/2 top-[-100px] h-72 w-72 -translate-x-1/2 rounded-full bg-[#F5A524]/20 blur-[100px]" />

                            <div className="relative">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5A524] text-black shadow-lg shadow-[#F5A524]/25">
                                    <ShoppingBag size={25} />
                                </div>

                                <h2 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                                    Ready to discover
                                    <span className="block text-[#F5A524]">
                                        something you love?
                                    </span>
                                </h2>

                                <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                                    Browse our collections, discover new products and
                                    enjoy a simple online shopping experience designed
                                    for modern customers.
                                </p>

                                <button
                                    onClick={handleShop}
                                    className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F5A524] to-[#E08E0B] px-7 py-3.5 text-sm font-bold text-black shadow-lg shadow-[#F5A524]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[#F5A524]/40"
                                >
                                    Explore Products
                                    <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </>
    );
};

export default About;