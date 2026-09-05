import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ShieldCheck, Lock, Mail, ArrowRight } from "lucide-react";
import api_base from "../apibase";


const LoadingCube = () => (
    <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-sm"
        role="status"
        aria-live="polite"
        aria-label="Loading"
    >
        <style>{`
            @keyframes shopNestCubeRotate {
                0% {
                    transform: perspective(180px) rotateX(0deg) rotateY(0deg);
                }

                50% {
                    transform: perspective(180px) rotateX(180deg) rotateY(0deg);
                }

                100% {
                    transform: perspective(180px) rotateX(180deg) rotateY(180deg);
                }
            }

            .shop-nest-loader-cube {
                width: 42px;
                height: 42px;
                background: #F5A524;
                animation: shopNestCubeRotate 800ms linear infinite;
                transform-origin: center center;
            }

            @media (prefers-reduced-motion: reduce) {
                .shop-nest-loader-cube {
                    animation-duration: 1800ms;
                }
            }
        `}</style>

        <div className="flex flex-col items-center justify-center gap-5">
            <div className="shop-nest-loader-cube" />
            <span className="text-sm font-semibold tracking-[0.2em] text-white">
                Loading...
            </span>
        </div>
    </div>
);

export default function AdminLogin() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const loadingStartedAt = Date.now();
        setIsLoading(true);

        try {
            const response = await axios.post(
                `${api_base}admin-login/`,
                formData,
                {
                    withCredentials: true,
                }
            );

            const remainingTime = Math.max(
                0,
                2000 - (Date.now() - loadingStartedAt)
            );

            await new Promise((resolve) => setTimeout(resolve, remainingTime));

            if (response.status === 200) {
                sessionStorage.setItem(
                    "userid",
                    response.data.admin.id
                );

                setIsLoading(false);

                await Swal.fire({
                    title: "Success",
                    text: response.data.msg,
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                });

                navigate("/admin");
            }
        } catch (error) {
            const remainingTime = Math.max(
                0,
                2000 - (Date.now() - loadingStartedAt)
            );

            await new Promise((resolve) => setTimeout(resolve, remainingTime));

            setIsLoading(false);

            Swal.fire({
                title: "Error",
                text:
                    error.response?.data?.msg ||
                    "Something went wrong",
                icon: "error",
            });
        }
    };

    return (
        <>
            {isLoading && <LoadingCube />}

            <div className="relative min-h-screen overflow-hidden bg-[#E8EDF5] flex items-center justify-center px-5 py-10">
                {/* ================= BACKGROUND ================= */}

                <div className="absolute inset-0">
                    <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#F5A524]/20 blur-[120px]" />
                    <div className="absolute -bottom-40 -right-32 w-[550px] h-[550px] rounded-full bg-blue-500/15 blur-[140px]" />
                    <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-[100px]" />

                    <div
                        className="absolute inset-0 opacity-[0.35]"
                        style={{
                            backgroundImage: `
                                linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)
                            `,
                            backgroundSize: "45px 45px",
                        }}
                    />
                </div>

                {/* ================= LOGIN CARD ================= */}

                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-white/85 backdrop-blur-2xl border border-white/70 rounded-[28px] p-8 sm:p-10 shadow-[0_25px_70px_rgba(15,23,42,0.15)]">
                        {/* ================= LOGO ================= */}

                        <div className="flex justify-center mb-7">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5A524] to-[#E08E0B] flex items-center justify-center shadow-lg shadow-[#F5A524]/30">
                                    <ShieldCheck
                                        size={32}
                                        className="text-white"
                                        strokeWidth={2.3}
                                    />
                                </div>

                                <div className="absolute -right-2 -bottom-2 w-7 h-7 rounded-full bg-[#111827] border-4 border-white flex items-center justify-center">
                                    <Lock
                                        size={12}
                                        className="text-[#F5A524]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ================= HEADING ================= */}

                        <div className="text-center">
                            <p className="text-[#D98A00] text-xs font-bold uppercase tracking-[3px]">
                                E-Commerce Management
                            </p>

                            <h1 className="text-3xl sm:text-4xl font-black text-[#111827] mt-3">
                                Admin Login
                            </h1>

                            <p className="text-gray-500 text-sm mt-3">
                                Login to access your Admin Panel
                            </p>
                        </div>

                        {/* ================= FORM ================= */}

                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 space-y-5"
                        >
                            {/* EMAIL */}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Admin Email
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={19}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter admin email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                        className="w-full h-14 pl-12 pr-5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-300 focus:bg-white focus:border-[#F5A524] focus:ring-4 focus:ring-[#F5A524]/10 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>

                                <div className="relative">
                                    <Lock
                                        size={19}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                        className="w-full h-14 pl-12 pr-5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-300 focus:bg-white focus:border-[#F5A524] focus:ring-4 focus:ring-[#F5A524]/10 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* ================= LOGIN BUTTON ================= */}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group w-full h-14 rounded-xl bg-gradient-to-r from-[#F5A524] to-[#E99A12] text-black font-bold flex items-center justify-center gap-3 shadow-lg shadow-[#F5A524]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#F5A524]/30 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                <span>
                                    Login to Admin Panel
                                </span>

                                <ArrowRight
                                    size={19}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </button>
                        </form>

                        {/* ================= SECURITY TEXT ================= */}

                        <div className="mt-7 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-center gap-2 text-gray-400">
                                <ShieldCheck size={15} />

                                <span className="text-xs">
                                    Secure Administrator Access
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ================= FOOTER ================= */}

                    <p className="relative z-10 text-center text-gray-500 text-xs mt-6">
                        © 2026 ShopNest Admin Panel
                    </p>
                </div>
            </div>
        </>
    );
}
