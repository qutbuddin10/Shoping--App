import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import {
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
} from "lucide-react";

import registerImg from "../assets/hero/user_auth/register_bg.jpg";
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

export default function Register() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setformData] = useState({
        fn: "",
        em: "",
        mb: "",
        pw: "",
        pw1: "",
    });

    const handleChange = (e) => {
        setformData({
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
                `${api_base}register-page/`,
                formData
            );

            const remainingTime = Math.max(
                0,
                2000 - (Date.now() - loadingStartedAt)
            );

            await new Promise((resolve) => setTimeout(resolve, remainingTime));

            if (response.status === 200) {
                // Mark this browser as having a registered account.
                // This flag is used only for the Add to Cart UX.
                localStorage.setItem("registered", "true");

                setIsLoading(false);

                await Swal.fire({
                    title: "Registration",
                    icon: "success",
                    text: response.data.msg,
                    timer: 1500,
                    showConfirmButton: false,
                });

                navigate("/login");
            }
        } catch (error) {
            const remainingTime = Math.max(
                0,
                2000 - (Date.now() - loadingStartedAt)
            );

            await new Promise((resolve) => setTimeout(resolve, remainingTime));

            setIsLoading(false);

            Swal.fire({
                title: "Registration Failed!",
                icon: "error",
                text:
                    error.response?.data?.msg ||
                    "Something went wrong",
                timer: 3000,
            });

            console.log(error.response);
            console.log(error.response?.data);
        }
    };

    return (
        <>
            {isLoading && <LoadingCube />}

            <section className="min-h-screen bg-gradient-to-br from-[#081229] via-[#0F1E44] to-[#162D63] flex items-center justify-center px-4 py-6 lg:py-4">
                <div className="w-full max-w-6xl bg-white/10 backdrop-blur-2xl border border-white/10 rounded-[30px] overflow-hidden shadow-2xl grid lg:grid-cols-2">
                    {/* LEFT SIDE */}

                    <div className="relative hidden lg:block">
                        <img
                            src={registerImg}
                            alt="Register"
                            className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

                        <div className="absolute bottom-14 left-14 text-white max-w-md">
                            <span className="inline-block px-5 py-2 rounded-full bg-[#F5A524] text-black font-semibold text-sm mb-6">
                                Premium Shopping
                            </span>

                            <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
                                Join The Future Of Shopping
                            </h1>

                            <p className="mt-5 text-base leading-7 text-gray-300">
                                Discover premium products, exclusive deals and fast delivery
                                with ShopNest.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}

                    <div className="flex items-center justify-center p-6 lg:p-10">
                        <div className="w-full max-w-md">
                            <p className="text-[#F5A524] font-semibold tracking-[4px] uppercase">
                                Welcome
                            </p>

                            <h2 className="text-3xl lg:text-4xl font-bold text-white mt-2">
                                Create Account
                            </h2>

                            <p className="text-gray-300 mt-3">
                                Register now and start your premium shopping experience.
                            </p>

                            {/* FORM START */}

                            <form
                                onSubmit={handleSubmit}
                                className="mt-10 space-y-5"
                            >
                                {/* Full Name */}

                                <div className="relative">
                                    <User
                                        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                                        size={20}
                                    />

                                    <input
                                        type="text"
                                        name="fn"
                                        placeholder="Full Name"
                                        value={formData.fn}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className="w-full h-12 rounded-xl bg-white/10 border border-white/20 pl-14 pr-5 text-white placeholder-gray-400 focus:border-[#F5A524] focus:outline-none duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Email */}

                                <div className="relative">
                                    <Mail
                                        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                                        size={20}
                                    />

                                    <input
                                        type="email"
                                        name="em"
                                        placeholder="Email Address"
                                        value={formData.em}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className="w-full h-12 rounded-xl bg-white/10 border border-white/20 pl-14 pr-5 text-white placeholder-gray-400 focus:border-[#F5A524] focus:outline-none duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Mobile */}

                                <div className="relative">
                                    <Phone
                                        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                                        size={20}
                                    />

                                    <input
                                        type="tel"
                                        name="mb"
                                        placeholder="Mobile Number"
                                        value={formData.mb}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className="w-full h-12 rounded-xl bg-white/10 border border-white/20 pl-14 pr-5 text-white placeholder-gray-400 focus:border-[#F5A524] focus:outline-none duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Password */}

                                <div className="relative">
                                    <Lock
                                        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                                        size={20}
                                    />

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="pw"
                                        placeholder="Password"
                                        value={formData.pw}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className="w-full h-12 rounded-xl bg-white/10 border border-white/20 pl-14 pr-14 text-white placeholder-gray-400 focus:border-[#F5A524] focus:outline-none duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white disabled:opacity-50"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                    </button>
                                </div>

                                {/* Confirm Password */}

                                <div className="relative">
                                    <Lock
                                        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                                        size={20}
                                    />

                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="pw1"
                                        placeholder="Confirm Password"
                                        value={formData.pw1}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className="w-full h-12 rounded-xl bg-white/10 border border-white/20 pl-14 pr-14 text-white placeholder-gray-400 focus:border-[#F5A524] focus:outline-none duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                        disabled={isLoading}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white disabled:opacity-50"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={20} />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                    </button>
                                </div>

                                {/* Terms & Conditions */}

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        disabled={isLoading}
                                        className="w-4 h-4 accent-[#F5A524]"
                                    />

                                    <label
                                        htmlFor="terms"
                                        className="text-gray-300 text-sm"
                                    >
                                        I agree to the{" "}
                                        <span className="text-[#F5A524] cursor-pointer hover:underline">
                                            Terms & Conditions
                                        </span>
                                    </label>
                                </div>

                                {/* Register Button */}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group w-full h-12 rounded-xl bg-[#F5A524] text-black font-semibold text-lg flex items-center justify-center gap-3 hover:bg-yellow-400 duration-300 shadow-lg hover:shadow-[#F5A524]/40 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Create Account

                                    <ArrowRight
                                        size={20}
                                        className="group-hover:translate-x-1 duration-300"
                                    />
                                </button>

                                <div className="flex items-center my-8">
                                    <div className="flex-1 h-px bg-white/20" />

                                    <span className="px-4 text-gray-400 text-sm">
                                        OR
                                    </span>

                                    <div className="flex-1 h-px bg-white/20" />
                                </div>

                                <button
                                    type="button"
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-medium transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Continue with Google
                                </button>
                            </form>

                            {/* FORM END */}

                            <div className="mt-8 text-center">
                                <span className="text-gray-300">
                                    Already have an account?
                                </span>

                                <Link
                                    to="/login"
                                    className="text-[#F5A524] font-semibold ml-2 hover:underline"
                                >
                                    Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
