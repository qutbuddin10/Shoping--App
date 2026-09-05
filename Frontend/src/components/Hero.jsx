import React, { useEffect, useState } from "react";
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    ShoppingBag,
    Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// ================= Images =================

import hero1 from "../assets/hero/hero1.jpg";
import hero2 from "../assets/hero/hero2.jpg";
import hero4 from "../assets/hero/hero4.jpg";
import hero5 from "../assets/hero/hero5.jpg";

// ================= Slides =================

const slides = [
    {
        image: hero1,
        badge: "NEW ARRIVAL",
        title: "Premium Fashion Collection",
        subtitle:
            "Discover luxury fashion, premium shoes and modern lifestyle essentials.",
        button: "Shop Fashion",
    },
    {
        image: hero2,
        badge: "MEGA SALE",
        title: "Latest Electronics",
        subtitle:
            "Smartphones, laptops, headphones and premium gadgets at best prices.",
        button: "Shop Electronics",
    },
    {
        image: hero4,
        badge: "TRENDING",
        title: "Premium Accessories",
        subtitle:
            "Watches, headphones, bags and fashion accessories for everyone.",
        button: "Explore Now",
    },
    {
        image: hero5,
        badge: "UP TO 70% OFF",
        title: "Mega Shopping Festival",
        subtitle:
            "Thousands of premium products with exciting discounts available today.",
        button: "Shop Now",
    },
];

// ================= Hero =================

export default function Hero() {
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();

    // ================= Check Login =================

    const handleShopNow = () => {
        const user = sessionStorage.getItem("user");

        if (!user) {
            Swal.fire({
                title: "Login Required",
                text: "Please login first to continue shopping.",
                icon: "warning",
                confirmButtonText: "Login",
                confirmButtonColor: "#F5A524",
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/login");
                }
            });

            return;
        }

        navigate("/products");
    };

    // ================= Auto Slider =================

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // ================= Next Slide =================

    const nextSlide = () => {
        setCurrent((prev) => (prev + 1) % slides.length);
    };

    // ================= Previous Slide =================

    const prevSlide = () => {
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <section className="relative w-full overflow-hidden bg-[#050816] lg:h-[calc(100vh-74px)] lg:min-h-[680px]">
            {/* =========================================================
                MOBILE + TABLET HERO IMAGE
                ========================================================= */}

            <div className="relative h-[54vw] min-h-[235px] max-h-[520px] w-full overflow-hidden bg-[#050816] sm:h-[52vw] md:h-[48vw] lg:hidden">
                {slides.map((slide, index) => (
                    <img
                        key={index}
                        src={slide.image}
                        alt={slide.title}
                        draggable="false"
                        className={`absolute inset-0 h-full w-full transition-all duration-1000 ${
                            current === index
                                ? "scale-100 opacity-100"
                                : "scale-105 opacity-0"
                        } ${
                            index === 3
                                ? "object-contain object-center"
                                : "object-cover object-center"
                        }`}
                    />
                ))}

                {/* Image Overlay */}

                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/65" />

                {/* Left Arrow */}

                <button
                    type="button"
                    aria-label="Previous slide"
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-xl transition hover:bg-black/60 sm:left-5 sm:h-11 sm:w-11"
                >
                    <ChevronLeft size={19} />
                </button>

                {/* Right Arrow */}

                <button
                    type="button"
                    aria-label="Next slide"
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-xl transition hover:bg-black/60 sm:right-5 sm:h-11 sm:w-11"
                >
                    <ChevronRight size={19} />
                </button>

                {/* Mobile Badge */}

                <div className="absolute bottom-4 left-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-black/45 px-3 py-1.5 text-[10px] font-bold text-amber-300 backdrop-blur-xl sm:bottom-5 sm:left-6 sm:px-4 sm:py-2 sm:text-xs">
                    <ShoppingBag size={13} />
                    {slides[current].badge}
                </div>
            </div>

            {/* =========================================================
                MOBILE + TABLET CONTENT
                ========================================================= */}

            <div className="relative z-20 bg-gradient-to-b from-[#080a12] via-[#070911] to-[#050816] px-5 pb-20 pt-6 sm:px-8 sm:pb-24 sm:pt-8 lg:hidden">
                {/* Small Glow */}

                <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />

                <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-violet-600/10 blur-[100px]" />

                {/* Heading */}

                <h1 className="relative max-w-2xl text-3xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
                    {slides[current].title}
                </h1>

                {/* Subtitle */}

                <p className="relative mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                    {slides[current].subtitle}
                </p>

                {/* Buttons */}

                <div className="relative mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row">
                    <button
                        type="button"
                        onClick={handleShopNow}
                        className="group flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-amber-400/10 transition-all duration-300 hover:bg-amber-300 sm:w-auto sm:px-7 sm:py-4"
                    >
                        {slides[current].button}

                        <ArrowRight
                            size={18}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </button>

                    <button
                        type="button"
                        onClick={handleShopNow}
                        className="w-full rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/10 sm:w-auto sm:px-7 sm:py-4"
                    >
                        Explore Collection
                    </button>
                </div>

                {/* Stats */}

                <div className="relative mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 sm:mt-9 sm:gap-6 sm:pt-8">
                    <div>
                        <h2 className="text-xl font-bold text-white sm:text-3xl">
                            50K+
                        </h2>

                        <p className="mt-1 text-[10px] leading-4 text-slate-400 sm:text-sm">
                            Happy Customers
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-white sm:text-3xl">
                            15K+
                        </h2>

                        <p className="mt-1 text-[10px] leading-4 text-slate-400 sm:text-sm">
                            Premium Products
                        </p>
                    </div>

                    <div>
                        <div className="flex gap-0.5 text-amber-400">
                            <Star fill="currentColor" size={14} />
                            <Star fill="currentColor" size={14} />
                            <Star fill="currentColor" size={14} />
                            <Star fill="currentColor" size={14} />
                            <Star fill="currentColor" size={14} />
                        </div>

                        <p className="mt-1 text-[10px] leading-4 text-slate-400 sm:text-sm">
                            Rated 4.9/5
                        </p>
                    </div>
                </div>

                {/* Slider Dots */}

                <div className="relative mt-7 flex justify-center gap-2 sm:mt-9">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            aria-label={`Go to slide ${index + 1}`}
                            onClick={() => setCurrent(index)}
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                                current === index
                                    ? "w-8 bg-amber-400"
                                    : "w-2.5 bg-white/30 hover:bg-white/60"
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* =========================================================
                DESKTOP HERO
                ========================================================= */}

            <div className="relative hidden h-full lg:block">
                {/* Background Images */}

                {slides.map((slide, index) => (
                    <img
                        key={index}
                        src={slide.image}
                        alt={slide.title}
                        draggable="false"
                        className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-1000 ${
                            current === index
                                ? "scale-100 opacity-100"
                                : "scale-105 opacity-0"
                        }`}
                    />
                ))}

                {/* Overlay */}

                <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-black/30" />

                {/* Glow */}

                <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[170px]" />

                <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[170px]" />

                <div className="absolute -bottom-[250px] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-[180px]" />

                {/* Grid */}

                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)
                        `,
                        backgroundSize: "60px 60px",
                    }}
                />

                {/* Main Content */}

                <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-12">
                    <div className="max-w-2xl">
                        {/* Badge */}

                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-black/30 px-4 py-2 text-sm font-semibold text-amber-300 backdrop-blur-md">
                            <ShoppingBag size={16} />
                            {slides[current].badge}
                        </div>

                        {/* Heading */}

                        <h1 className="mt-6 text-5xl font-black leading-tight text-white xl:text-7xl">
                            {slides[current].title}
                        </h1>

                        {/* Subtitle */}

                        <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 xl:text-lg">
                            {slides[current].subtitle}
                        </p>

                        {/* Buttons */}

                        <div className="mt-10 flex flex-wrap gap-4">
                            <button
                                type="button"
                                onClick={handleShopNow}
                                className="group flex items-center gap-2 rounded-full bg-amber-400 px-7 py-4 font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-amber-300"
                            >
                                {slides[current].button}

                                <ArrowRight
                                    size={18}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </button>

                            <button
                                type="button"
                                onClick={handleShopNow}
                                className="rounded-full border border-white/20 bg-white/10 px-7 py-4 font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/20"
                            >
                                Explore Collection
                            </button>
                        </div>

                        {/* Stats */}

                        <div className="mt-10 flex flex-wrap items-center gap-8">
                            <div>
                                <h2 className="text-3xl font-bold text-white">
                                    50K+
                                </h2>

                                <p className="text-slate-400">
                                    Happy Customers
                                </p>
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-white">
                                    15K+
                                </h2>

                                <p className="text-slate-400">
                                    Premium Products
                                </p>
                            </div>

                            <div>
                                <div className="flex text-amber-400">
                                    <Star fill="currentColor" size={18} />
                                    <Star fill="currentColor" size={18} />
                                    <Star fill="currentColor" size={18} />
                                    <Star fill="currentColor" size={18} />
                                    <Star fill="currentColor" size={18} />
                                </div>

                                <p className="mt-2 text-slate-300">
                                    Rated 4.9/5
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Left Arrow */}

                <button
                    type="button"
                    aria-label="Previous slide"
                    onClick={prevSlide}
                    className="absolute left-5 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-xl transition hover:bg-white/20 xl:left-8 xl:h-12 xl:w-12"
                >
                    <ChevronLeft size={24} />
                </button>

                {/* Desktop Right Arrow */}

                <button
                    type="button"
                    aria-label="Next slide"
                    onClick={nextSlide}
                    className="absolute right-5 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-xl transition hover:bg-white/20 xl:right-8 xl:h-12 xl:w-12"
                >
                    <ChevronRight size={24} />
                </button>

                {/* Desktop Dots */}

                <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            aria-label={`Go to slide ${index + 1}`}
                            onClick={() => setCurrent(index)}
                            className={`h-3 rounded-full transition-all duration-500 ${
                                current === index
                                    ? "w-10 bg-amber-400"
                                    : "w-3 bg-white/40 hover:bg-white"
                            }`}
                        />
                    ))}
                </div>

                {/* Scroll Indicator */}

                <div className="absolute bottom-8 right-8 z-30 hidden flex-col items-center text-white/60 xl:flex">
                    <span className="mb-2 rotate-90 text-xs tracking-[0.3em]">
                        SCROLL
                    </span>

                    <div className="h-16 w-[2px] overflow-hidden rounded-full bg-white/20">
                        <div className="h-8 w-full animate-bounce rounded-full bg-amber-400" />
                    </div>
                </div>
            </div>
        </section>
    );
}