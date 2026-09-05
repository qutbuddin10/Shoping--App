import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, ArrowRight } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import api_base from "../apibase";

export default function ForgetPassword() {
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState("");
    const [loading, setLoading] = useState(false);

    // =====================================================
    // HANDLE CHANGE
    // =====================================================

    const handleChange = (e) => {
        const value = e.target.value;

        setIdentifier(value);
    };

    // =====================================================
    // HANDLE SUBMIT
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        const value = identifier.trim();

        if (!value) {
            Swal.fire({
                title: "Required",
                text: "Please enter your email or mobile number.",
                icon: "warning",
            });

            return;
        }

        // =================================================
        // BASIC EMAIL / MOBILE VALIDATION
        // =================================================

        const isEmail = value.includes("@");

        if (isEmail) {
            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(value)) {
                Swal.fire({
                    title: "Invalid Email",
                    text: "Please enter a valid email address.",
                    icon: "warning",
                });

                return;
            }
        } else {
            const mobile = value.replace(/\D/g, "");

            if (mobile.length !== 10) {
                Swal.fire({
                    title: "Invalid Mobile",
                    text: "Please enter a valid 10 digit mobile number.",
                    icon: "warning",
                });

                return;
            }
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${api_base}forget-password/`,
                {
                    identifier: value,
                },
                {
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                const method = response.data.method;

                Swal.fire({
                    title: "OTP Sent",
                    text:
                        method === "mobile"
                            ? "OTP has been sent to your mobile number."
                            : "OTP has been sent to your email.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                });

                navigate("/verify-otp");
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text:
                    error.response?.data?.msg ||
                    "Something went wrong!",
                icon: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center px-5 py-10">

            <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">

                {/* =================================================
                    HEADING
                ================================================= */}

                <div className="text-center">

                    <p className="text-[#F5A524] uppercase tracking-[4px] font-semibold">
                        Forgot Password
                    </p>

                    <h1 className="text-4xl font-bold text-white mt-3">
                        Reset Password
                    </h1>

                    <p className="text-gray-300 mt-4 leading-7">
                        Enter your registered email or mobile number.
                        We will send you an OTP to reset your password.
                    </p>

                </div>

                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    onSubmit={handleSubmit}
                    className="mt-10 space-y-6"
                >

                    <div className="relative">

                        {identifier.includes("@") ? (
                            <Mail
                                size={20}
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                        ) : (
                            <Phone
                                size={20}
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                        )}

                        <input
                            type="text"
                            placeholder="Email or Mobile Number"
                            name="identifier"
                            onChange={handleChange}
                            value={identifier}
                            autoComplete="username"
                            className="w-full h-14 rounded-xl bg-white/10 border border-white/20 pl-14 pr-5 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#F5A524] duration-300"
                        />

                    </div>

                    {/* =================================================
                        SEND OTP
                    ================================================= */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full h-14 rounded-xl bg-[#F5A524] text-black font-semibold flex items-center justify-center gap-3 hover:bg-yellow-400 duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >

                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />

                                Sending OTP...
                            </>
                        ) : (
                            <>
                                Send OTP

                                <ArrowRight
                                    size={20}
                                    className="group-hover:translate-x-1 duration-300"
                                />
                            </>
                        )}

                    </button>

                </form>

                {/* =================================================
                    BACK TO LOGIN
                ================================================= */}

                <div className="text-center mt-8">

                    <Link
                        to="/login"
                        className="text-[#F5A524] hover:underline"
                    >
                        ← Back to Login
                    </Link>

                </div>

            </div>

        </div>
    );
}