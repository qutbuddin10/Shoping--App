import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Headphones,
    Mail,
    MapPin,
    MessageCircle,
    Package,
    Phone,
    Send,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import axios from "axios";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api_base from "../apibase";

function ContactUs() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });

    const [openFaq, setOpenFaq] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            return;
        }

        try {
            const user = JSON.parse(storedUser);

            setFormData((previous) => ({
                ...previous,
                name: user.name || user.full_name || "",
                email: user.email || "",
            }));
        } catch (err) {
            console.error("User data parsing error:", err);
        }
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await axios.post(
                `${api_base}contact/`,
                formData,
                {
                    withCredentials: true,
                }
            );

            setSuccess(
                response.data?.msg ||
                    "Your message has been sent successfully."
            );

            setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: "",
            });
        } catch (err) {
            console.error("Contact form error:", err);

            setError(
                err.response?.data?.msg ||
                    "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const faqs = [
        {
            question: "How can I track my order?",
            answer:
                "You can track your order from the My Orders section of your account. Open the order to see its current status and tracking updates.",
        },
        {
            question: "How can I return a product?",
            answer:
                "Open your order from My Orders and select the return option for the eligible product. You can then follow the return instructions shown on screen.",
        },
        {
            question: "How long does a refund take?",
            answer:
                "Refund processing time can vary depending on the payment method and the return process. You can check the refund status from your order details.",
        },
        {
            question: "Can I change my delivery address?",
            answer:
                "If your order has not been processed yet, contact our support team as soon as possible. We will check whether the address can still be changed.",
        },
    ];

    return (
        <div className="min-h-screen bg-[#060B18] text-white">
            <Navbar />

            {/* Premium Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-[0.16]" style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
                    backgroundSize: "64px 64px"
                }} />
                <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[760px] h-[520px] rounded-full bg-[#2196FF]/[0.10] blur-[130px]" />
                <div className="absolute top-[35%] -left-48 w-[420px] h-[420px] rounded-full bg-[#F5A524]/[0.055] blur-[120px]" />
                <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] rounded-full bg-[#1769E0]/[0.08] blur-[140px]" />
            </div>

            <main className="relative">
                {/* =====================================================
                    HERO
                ===================================================== */}

                <section className="relative px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-28 pb-12 sm:pb-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#2196FF]/25 bg-[#2196FF]/[0.07] backdrop-blur-xl text-xs sm:text-sm text-slate-200 mb-7 shadow-[0_8px_30px_rgba(33,150,255,0.08)]">
                                <Sparkles
                                    size={15}
                                    className="text-[#55B0FF]"
                                />
                                Premium Customer Support
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] text-white">
                                We're here to{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B9CFF] via-[#5FB1FF] to-[#8BCBFF]">
                                    help.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-2xl text-sm sm:text-base lg:text-lg text-slate-300 leading-7">
                                Have a question about an order, product,
                                return, payment, or anything else? Our
                                support team is ready to help you.
                            </p>
                        </div>

                        {/* Trust Strip */}
                        <div className="mt-10 flex flex-wrap gap-3 sm:gap-4">
                            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-white/[0.09] bg-white/[0.045] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                <ShieldCheck
                                    size={18}
                                    className="text-emerald-400"
                                />
                                <span className="text-xs sm:text-sm text-slate-300">
                                    Secure Support
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-white/[0.09] bg-white/[0.045] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                <Clock3
                                    size={18}
                                    className="text-[#55B0FF]"
                                />
                                <span className="text-xs sm:text-sm text-slate-300">
                                    Quick Response
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-white/[0.09] bg-white/[0.045] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                <Headphones
                                    size={18}
                                    className="text-[#55B0FF]"
                                />
                                <span className="text-xs sm:text-sm text-slate-300">
                                    Customer First
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    QUICK HELP
                ===================================================== */}

                <section className="px-4 sm:px-6 lg:px-8 pb-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-7">
                            <p className="text-xs uppercase tracking-[0.25em] text-[#55B0FF] mb-2 font-semibold">
                                Quick Help
                            </p>

                            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2rem]">
                                What can we help you with?
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Link
                                to="/orders"
                                className="group relative p-5 sm:p-6 rounded-3xl border border-white/[0.09] bg-white/[0.045] hover:bg-white/[0.07] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#2196FF]/35 hover:shadow-[0_20px_50px_rgba(33,150,255,0.10)]"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#F5A524]/10 border border-[#F5A524]/20 flex items-center justify-center mb-5">
                                    <Package
                                        size={23}
                                        className="text-[#55B0FF]"
                                    />
                                </div>

                                <h3 className="text-lg font-medium">
                                    Orders & Returns
                                </h3>

                                <p className="text-sm text-slate-400 mt-2 leading-6">
                                    Need help with your order, delivery, or
                                    return?
                                </p>

                                <div className="flex items-center gap-2 text-sm text-slate-300 mt-5">
                                    View Orders
                                    <ArrowRight
                                        size={15}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </div>
                            </Link>

                            <div className="group relative p-5 sm:p-6 rounded-3xl border border-white/[0.09] bg-white/[0.045] hover:bg-white/[0.07] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#2196FF]/35 hover:shadow-[0_20px_50px_rgba(33,150,255,0.10)]">
                                <div className="w-12 h-12 rounded-2xl bg-[#2196FF]/10 border border-[#2196FF]/20 flex items-center justify-center mb-5">
                                    <MessageCircle
                                        size={23}
                                        className="text-[#55B0FF]"
                                    />
                                </div>

                                <h3 className="text-lg font-medium">
                                    Product Support
                                </h3>

                                <p className="text-sm text-slate-400 mt-2 leading-6">
                                    Questions about products, sizes, stock, or
                                    features?
                                </p>

                                <div className="flex items-center gap-2 text-sm text-slate-300 mt-5">
                                    Send a Message
                                    <ArrowRight
                                        size={15}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </div>
                            </div>

                            <div className="group relative p-5 sm:p-6 rounded-3xl border border-white/[0.09] bg-white/[0.045] hover:bg-white/[0.07] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#2196FF]/35 hover:shadow-[0_20px_50px_rgba(33,150,255,0.10)] sm:col-span-2 lg:col-span-1">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mb-5">
                                    <Headphones
                                        size={23}
                                        className="text-emerald-400"
                                    />
                                </div>

                                <h3 className="text-lg font-medium">
                                    Customer Care
                                </h3>

                                <p className="text-sm text-slate-400 mt-2 leading-6">
                                    Can't find what you're looking for? Talk to
                                    our support team.
                                </p>

                                <div className="flex items-center gap-2 text-sm text-slate-300 mt-5">
                                    Contact Support
                                    <ArrowRight
                                        size={15}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    CONTACT FORM + INFORMATION
                ===================================================== */}

                <section className="px-4 sm:px-6 lg:px-8 pb-20">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-6">
                        {/* Form */}
                        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.10] bg-[#0D1730]/90 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:p-7 lg:p-9">
                            <div className="mb-7">
                                <div className="flex items-center gap-2 text-[#C58A22] text-sm font-medium mb-3">
                                    <Send size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                                    Send a Message
                                </div>

                                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                                    Tell us what you need.
                                </h2>

                                <p className="text-sm text-slate-400 mt-2">
                                    Fill in the details below and our team will
                                    get back to you.
                                </p>
                            </div>

                            {success && (
                                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4 shadow-sm">
                                    <CheckCircle2
                                        size={20}
                                        className="text-emerald-400 mt-0.5 shrink-0"
                                    />

                                    <p className="text-sm text-emerald-300 leading-6">
                                        {success}
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-300 shadow-sm">
                                    {error}
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                            Full Name
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            autoComplete="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Your name"
                                            required
                                            className="h-13 w-full rounded-2xl border border-white/[0.10] bg-white/[0.035] px-4 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-white/[0.18] focus:border-[#3B9CFF] focus:bg-[#2196FF]/[0.045] focus:shadow-[0_8px_30px_rgba(33,150,255,0.10)] focus:ring-4 focus:ring-[#3B9CFF]/10"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                            Email Address
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            autoComplete="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            required
                                            className="h-13 w-full rounded-2xl border border-white/[0.10] bg-white/[0.035] px-4 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-white/[0.18] focus:border-[#3B9CFF] focus:bg-[#2196FF]/[0.045] focus:shadow-[0_8px_30px_rgba(33,150,255,0.10)] focus:ring-4 focus:ring-[#3B9CFF]/10"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                            Phone Number
                                        </label>

                                        <input
                                            type="tel"
                                            name="phone"
                                            autoComplete="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="9876543210"
                                            className="h-13 w-full rounded-2xl border border-white/[0.10] bg-white/[0.035] px-4 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-white/[0.18] focus:border-[#3B9CFF] focus:bg-[#2196FF]/[0.045] focus:shadow-[0_8px_30px_rgba(33,150,255,0.10)] focus:ring-4 focus:ring-[#3B9CFF]/10"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                            Subject
                                        </label>

                                        <input
                                            type="text"
                                            name="subject"
                                            autoComplete="off"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="How can we help?"
                                            required
                                            className="h-13 w-full rounded-2xl border border-white/[0.10] bg-white/[0.035] px-4 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-white/[0.18] focus:border-[#3B9CFF] focus:bg-[#2196FF]/[0.045] focus:shadow-[0_8px_30px_rgba(33,150,255,0.10)] focus:ring-4 focus:ring-[#3B9CFF]/10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                        Message
                                    </label>

                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Tell us more about your question..."
                                        required
                                        rows={6}
                                        className="w-full resize-none rounded-2xl border border-white/[0.10] bg-white/[0.035] px-4 py-3.5 text-sm font-medium leading-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-white/[0.18] focus:border-[#3B9CFF] focus:bg-[#2196FF]/[0.045] focus:shadow-[0_8px_30px_rgba(33,150,255,0.10)] focus:ring-4 focus:ring-[#3B9CFF]/10"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group flex h-12 w-full min-w-[190px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2196FF] via-[#2D8FFF] to-[#4AA7FF] px-6 text-sm font-bold text-white shadow-[0_12px_32px_rgba(33,150,255,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#3BA1FF] hover:via-[#4AA7FF] hover:to-[#65B7FF] hover:shadow-[0_16px_40px_rgba(33,150,255,0.34)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 rounded-full border-2 border-black/20 border-t-white animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Message
                                            <Send size={16} />
                                        </>
                                    )}
                                </button>

                                <p className="pt-1 text-[11px] text-slate-500">
                                    We usually respond within 24 hours. Your details are kept private and secure.
                                </p>
                            </form>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-5">
                            <div className="rounded-[2rem] border border-white/[0.10] bg-[#0D1730]/90 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
                                <p className="text-xs uppercase tracking-[0.2em] text-[#55B0FF] mb-5 font-semibold">
                                    Contact Information
                                </p>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-[#F5A524]/10 border border-[#F5A524]/20 flex items-center justify-center shrink-0">
                                            <Phone
                                                size={19}
                                                className="text-[#55B0FF]"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">
                                                Customer Care
                                            </p>

                                            <p className="text-sm font-semibold text-white">
                                                +91 XXXXX XXXXX
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-[#2196FF]/10 border border-[#2196FF]/20 flex items-center justify-center shrink-0">
                                            <Mail
                                                size={19}
                                                className="text-[#55B0FF]"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">
                                                Email Support
                                            </p>

                                            <p className="text-sm font-semibold text-white break-all">
                                                support@shopnest.com
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                                            <Clock3
                                                size={19}
                                                className="text-emerald-400"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">
                                                Working Hours
                                            </p>

                                            <p className="text-sm font-semibold text-white">
                                                Monday - Saturday
                                            </p>

                                            <p className="text-xs text-slate-500 mt-1">
                                                10:00 AM - 7:00 PM
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center shrink-0">
                                            <MapPin
                                                size={19}
                                                className="text-purple-300"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">
                                                Location
                                            </p>

                                            <p className="text-sm font-semibold text-white">
                                                India
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-[2rem] border border-[#F5A524]/20 bg-gradient-to-br from-[#F5A524]/[0.10] via-[#0D1730]/90 to-[#0D1730]/80 p-6 shadow-[0_20px_60px_rgba(245,165,36,0.08)] sm:p-7">
                                <div className="w-11 h-11 rounded-xl bg-[#F5A524]/10 border border-[#F5A524]/20 flex items-center justify-center mb-5">
                                    <Headphones
                                        size={20}
                                        className="text-[#55B0FF]"
                                    />
                                </div>

                                <h3 className="text-lg font-semibold">
                                    Need urgent help?
                                </h3>

                                <p className="text-sm text-slate-400 leading-6 mt-2">
                                    For an order-related issue, keep your order
                                    number ready. It helps our support team
                                    resolve your request faster.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    FAQ
                ===================================================== */}

                <section className="px-4 sm:px-6 lg:px-8 pb-28 pt-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-10">
                            <p className="text-xs uppercase tracking-[0.25em] text-[#55B0FF] mb-3 font-semibold">
                                Help Center
                            </p>

                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
                                Frequently asked questions
                            </h2>

                            <p className="text-sm text-slate-400 mt-3">
                                Quick answers to some of the most common
                                questions.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {faqs.map((faq, index) => {
                                const isOpen = openFaq === index;

                                return (
                                    <div
                                        key={faq.question}
                                        className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                                            isOpen
                                                ? "border-[#2196FF]/35 bg-[#101D38]/95 shadow-[0_16px_45px_rgba(33,150,255,0.10)]"
                                                : "border-white/[0.10] bg-[#0C172D]/85 hover:border-[#55B0FF]/25 hover:bg-[#101D38]/90"
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenFaq(
                                                    isOpen ? null : index
                                                )
                                            }
                                            className="w-full flex items-center justify-between gap-6 px-6 py-6 sm:px-7 sm:py-6 text-left group transition-colors duration-200"
                                        >
                                            <span className="text-sm sm:text-base font-medium text-white">
                                                {faq.question}
                                            </span>

                                            <ChevronDown
                                                size={19}
                                                className={`text-slate-400 shrink-0 transition-transform duration-300 ${
                                                    isOpen
                                                        ? "rotate-180 text-[#C58A22]"
                                                        : ""
                                                }`}
                                            />
                                        </button>

                                        <div
                                            className={`grid transition-all duration-300 ${
                                                isOpen
                                                    ? "grid-rows-[1fr]"
                                                    : "grid-rows-[0fr]"
                                            }`}
                                        >
                                            <div className="overflow-hidden">
                                                <p className="px-5 pb-5 text-sm text-slate-300 leading-7">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default ContactUs;