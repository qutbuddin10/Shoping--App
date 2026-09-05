import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import api_base from "../apibase";

export default function VerifyOTP() {
    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    // =====================================================
    // HANDLE CHANGE
    // =====================================================

    const handleChange = (e) => {
        const value = e.target.value
            .replace(/\D/g, "")
            .slice(0, 6);

        setOtp(value);
    };

    // =====================================================
    // HANDLE SUBMIT
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!otp) {
            Swal.fire({
                title: "OTP Required",
                text: "Please enter the OTP.",
                icon: "warning",
            });

            return;
        }

        if (otp.length !== 6) {
            Swal.fire({
                title: "Invalid OTP",
                text: "Please enter the 6 digit OTP.",
                icon: "warning",
            });

            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${api_base}verify-otp/`,
                {
                    otp: otp,
                },
                {
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                Swal.fire({
                    title: "Success",
                    text: response.data.msg,
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                });

                navigate("/reset-password");
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text:
                    error.response?.data?.msg ||
                    "Invalid OTP",
                icon: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center px-5 py-10">

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

                {/* =================================================
                    HEADING
                ================================================= */}

                <div className="text-center">

                    <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F5A524]/10 flex items-center justify-center text-[#F5A524]">
                        <ShieldCheck size={28} />
                    </div>

                    <h2 className="text-4xl font-bold text-white text-center mt-5">
                        Verify OTP
                    </h2>

                    <p className="text-gray-300 text-center mt-4 leading-6">
                        Enter the 6 digit OTP sent to your registered email or mobile number.
                    </p>

                </div>

                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-6"
                >

                    <div className="relative">

                        <ShieldCheck
                            size={20}
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            name="otp"
                            value={otp}
                            onChange={handleChange}
                            placeholder="Enter 6 Digit OTP"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            className="w-full h-14 rounded-xl bg-white/10 border border-white/20 pl-14 pr-5 text-white placeholder:text-gray-400 focus:border-[#F5A524] focus:outline-none duration-300 tracking-[5px] font-semibold"
                        />

                    </div>

                    {/* =================================================
                        VERIFY BUTTON
                    ================================================= */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-xl bg-[#F5A524] text-black font-semibold flex items-center justify-center gap-2 hover:bg-yellow-400 duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >

                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />

                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify OTP

                                <ArrowRight size={18} />
                            </>
                        )}

                    </button>

                </form>

                {/* =================================================
                    BACK TO LOGIN
                ================================================= */}

                <div className="text-center mt-6">

                    <Link
                        to="/login"
                        className="text-[#F5A524] hover:underline"
                    >
                        Back to Login
                    </Link>

                </div>

            </div>

        </div>
    );
}