import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import registerImg from "../assets/hero/user_auth/register_bg.jpg";

import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
} from "lucide-react";

import axios from "axios";
import Swal from "sweetalert2";
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


const LoginPage = () => {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        em: "",
        pw: "",
    });


    // ================= Input Change =================

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };


    // ================= Login =================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLoading) {
            return;
        }

        const email = formData.em.trim();
        const password = formData.pw;

        if (!email) {
            Swal.fire({
                title: "Login Failed",
                icon: "error",
                text: "Please enter your email address.",
                timer: 2500,
                showConfirmButton: false,
            });

            return;
        }

        if (!password) {
            Swal.fire({
                title: "Login Failed",
                icon: "error",
                text: "Please enter your password.",
                timer: 2500,
                showConfirmButton: false,
            });

            return;
        }

        const loadingStartedAt = Date.now();

        setIsLoading(true);

        try {
            // =====================================================
            // ONE LOGIN API FOR BOTH USER AND ADMIN
            // =====================================================

            const response = await axios.post(
                `${api_base}login-page/`,
                {
                    em: email,
                    pw: password,
                },
                {
                    withCredentials: true,
                }
            );

            const remainingTime = Math.max(
                0,
                2000 - (Date.now() - loadingStartedAt)
            );

            await new Promise(
                (resolve) => setTimeout(resolve, remainingTime)
            );


            // =====================================================
            // ADMIN LOGIN
            // =====================================================

            if (response.data.role === "admin") {
                sessionStorage.setItem(
                    "admin",
                    JSON.stringify(response.data.user.id)
                );

                // Admin should not have normal user session data.
                sessionStorage.removeItem("user");

                // userid is no longer used for admin protection.
                sessionStorage.removeItem("userid");

                setIsLoading(false);

                await Swal.fire({
                    title: "Login Successful",
                    icon: "success",
                    text: "Welcome Admin. Opening dashboard...",
                    timer: 1500,
                    showConfirmButton: false,
                });

                navigate("/dashboard", {
                    replace: true,
                });

                return;
            }


            // =====================================================
            // NORMAL USER LOGIN
            // =====================================================

            if (response.data.role === "user") {
                sessionStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );

                // User should not have admin session data.
                sessionStorage.removeItem("admin");

                // userid is not used anymore.
                sessionStorage.removeItem("userid");

                setIsLoading(false);

                await Swal.fire({
                    title: "Login Successful",
                    icon: "success",
                    text: response.data.msg || "Welcome back!",
                    timer: 1500,
                    showConfirmButton: false,
                });

                navigate("/", {
                    replace: true,
                });

                return;
            }


            // =====================================================
            // UNKNOWN ROLE
            // =====================================================

            setIsLoading(false);

            Swal.fire({
                title: "Login Failed",
                icon: "error",
                text: "Invalid login response from server.",
                timer: 3000,
                showConfirmButton: false,
            });

        } catch (error) {
            const remainingTime = Math.max(
                0,
                2000 - (Date.now() - loadingStartedAt)
            );

            await new Promise(
                (resolve) => setTimeout(resolve, remainingTime)
            );

            setIsLoading(false);

            Swal.fire({
                title: "Login Failed",
                icon: "error",
                text:
                    error.response?.data?.msg ||
                    "Invalid Email or Password.",
                timer: 3000,
                showConfirmButton: false,
            });
        }
    };


    return (
        <>
            {isLoading && <LoadingCube />}

            <section className="min-h-screen bg-gradient-to-br from-[#081229] via-[#0F1E44] to-[#162D63] flex items-center justify-center px-4 py-8">

                <div className="w-full max-w-6xl bg-white/10 backdrop-blur-2xl border border-white/10 rounded-[30px] overflow-hidden shadow-2xl grid lg:grid-cols-2">

                    {/* =====================================================
                        LEFT SIDE
                    ===================================================== */}

                    <div className="relative hidden lg:block overflow-hidden">

                        <img
                            src={registerImg}
                            alt="Login"
                            className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent"></div>

                        <div className="absolute bottom-16 left-12 right-12">

                            <span className="inline-block px-5 py-2 rounded-full bg-[#F5A524] text-black font-semibold text-sm mb-6 shadow-lg">
                                Welcome Back
                            </span>

                            <h1 className="text-5xl font-bold text-white leading-tight">
                                Continue Your
                                <br />
                                Shopping Journey
                            </h1>

                            <p className="mt-6 text-gray-200 text-lg leading-8 max-w-md">
                                Access your orders, wishlist, exclusive offers and enjoy
                                a seamless premium shopping experience.
                            </p>

                        </div>

                    </div>


                    {/* =====================================================
                        RIGHT SIDE
                    ===================================================== */}

                    <div className="flex items-center justify-center p-8 lg:p-12">

                        <div className="w-full max-w-md">

                            <p className="text-[#F5A524] font-semibold tracking-[5px] uppercase">
                                Welcome Back
                            </p>

                            <h2 className="mt-3 text-4xl font-bold text-white">
                                Login
                            </h2>

                            <p className="mt-3 text-gray-300">
                                Login to continue shopping with ShopNest.
                            </p>


                            {/* =================================================
                                FORM
                            ================================================= */}

                            <form
                                onSubmit={handleSubmit}
                                className="mt-10 space-y-6"
                            >

                                {/* =================================================
                                    EMAIL
                                ================================================= */}

                                <div className="relative">

                                    <Mail
                                        size={20}
                                        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="email"
                                        name="em"
                                        value={formData.em}
                                        onChange={handleChange}
                                        placeholder="Email Address"
                                        className="w-full h-14 rounded-xl bg-white/10 border border-white/20 pl-14 pr-5 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#F5A524] duration-300"
                                    />

                                </div>


                                {/* =================================================
                                    PASSWORD
                                ================================================= */}

                                <div className="relative">

                                    <Lock
                                        size={20}
                                        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="pw"
                                        value={formData.pw}
                                        onChange={handleChange}
                                        placeholder="Password"
                                        className="w-full h-14 rounded-xl bg-white/10 border border-white/20 pl-14 pr-14 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#F5A524] duration-300"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white duration-300"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                    </button>

                                </div>


                                {/* =================================================
                                    REMEMBER + FORGOT
                                ================================================= */}

                                <div className="flex items-center justify-between">

                                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">

                                        <input
                                            type="checkbox"
                                            className="accent-[#F5A524]"
                                        />

                                        Remember Me

                                    </label>

                                    <Link
                                        to="/forget"
                                        className="text-sm text-[#F5A524] hover:underline"
                                    >
                                        Forgot Password?
                                    </Link>

                                </div>


                                {/* =================================================
                                    LOGIN BUTTON
                                ================================================= */}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group w-full h-14 rounded-xl bg-[#F5A524] text-black font-semibold text-lg flex items-center justify-center gap-3 hover:bg-yellow-400 duration-300 shadow-lg hover:shadow-[#F5A524]/40 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    Login

                                    <ArrowRight
                                        size={20}
                                        className="group-hover:translate-x-1 duration-300"
                                    />

                                </button>


                                {/* =================================================
                                    DIVIDER
                                ================================================= */}

                                <div className="flex items-center">

                                    <div className="flex-1 h-px bg-white/20"></div>

                                    <span className="px-4 text-sm text-gray-400">
                                        OR
                                    </span>

                                    <div className="flex-1 h-px bg-white/20"></div>

                                </div>


                                {/* =================================================
                                    GOOGLE LOGIN
                                ================================================= */}

                                <div className="flex justify-center">

                                    <GoogleLogin
                                        onSuccess={async (credentialResponse) => {

                                            try {

                                                const res = await axios.post(
                                                    `${api_base}google-auth/`,
                                                    {
                                                        token: credentialResponse.credential,
                                                    },
                                                    {
                                                        withCredentials: true,
                                                    }
                                                );


                                                // ================= Save Google User =================

                                                sessionStorage.setItem(
                                                    "user",
                                                    JSON.stringify(res.data.user)
                                                );

                                                sessionStorage.removeItem(
                                                    "admin"
                                                );

                                                sessionStorage.removeItem(
                                                    "userid"
                                                );


                                                await Swal.fire({
                                                    icon: "success",
                                                    title: "Login Successful",
                                                    text: res.data.msg,
                                                    timer: 1500,
                                                    showConfirmButton: false,
                                                });

                                                navigate("/");

                                            } catch (err) {

                                                Swal.fire({
                                                    icon: "error",
                                                    title: "Login Failed",
                                                    text:
                                                        err.response?.data?.msg ||
                                                        "Google Login Failed",
                                                });

                                            }

                                        }}

                                        onError={() => {

                                            Swal.fire({
                                                icon: "error",
                                                title: "Google Login Failed",
                                            });

                                        }}
                                    />

                                </div>


                                {/* =================================================
                                    REGISTER
                                ================================================= */}

                                <div className="text-center">

                                    <span className="text-gray-300">
                                        Don't have an account?
                                    </span>

                                    <Link
                                        to="/register"
                                        className="ml-2 font-semibold text-[#F5A524] hover:underline transition"
                                    >
                                        Create Account
                                    </Link>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

            </section>
        </>
    );
};


export default LoginPage;