import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import api_base from "../apibase";

export default function ResetPassword() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        pw: "",
        pw1: "",
    });

    // =====================================================
    // HANDLE CHANGE
    // =====================================================

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // =====================================================
    // HANDLE SUBMIT
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.pw || !formData.pw1) {
            Swal.fire({
                title: "Required",
                text: "Please enter both password fields.",
                icon: "warning",
            });

            return;
        }

        if (formData.pw.length < 6) {
            Swal.fire({
                title: "Weak Password",
                text: "Password must be at least 6 characters.",
                icon: "warning",
            });

            return;
        }

        if (formData.pw !== formData.pw1) {
            Swal.fire({
                title: "Error",
                text: "Password and Confirm Password do not match.",
                icon: "error",
            });

            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${api_base}reset-password/`,
                formData,
                {
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                await Swal.fire({
                    title: "Success",
                    text: response.data.msg,
                    icon: "success",
                    timer: 1800,
                    showConfirmButton: false,
                });

                navigate("/login");
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text:
                    error.response?.data?.msg ||
                    "Something went wrong",
                icon: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] flex justify-center items-center px-5 py-10">

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">

                {/* =================================================
                    HEADING
                ================================================= */}

                <div className="text-center">

                    <p className="text-[#F5A524] uppercase tracking-[4px] font-semibold">
                        Password Recovery
                    </p>

                    <h2 className="text-4xl text-white font-bold text-center mt-3">
                        Reset Password
                    </h2>

                    <p className="text-gray-300 mt-4">
                        Create a new password for your account.
                    </p>

                </div>

                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 mt-8"
                >

                    {/* =================================================
                        NEW PASSWORD
                    ================================================= */}

                    <div className="relative">

                        <Lock
                            size={20}
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            name="pw"
                            value={formData.pw}
                            onChange={handleChange}
                            placeholder="New Password"
                            autoComplete="new-password"
                            className="w-full h-14 rounded-xl bg-white/10 border border-white/20 pl-14 pr-14 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#F5A524] duration-300"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(
                                    !showPassword
                                )
                            }
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>

                    </div>

                    {/* =================================================
                        CONFIRM PASSWORD
                    ================================================= */}

                    <div className="relative">

                        <Lock
                            size={20}
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type={
                                showConfirmPassword
                                    ? "text"
                                    : "password"
                            }
                            name="pw1"
                            value={formData.pw1}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            autoComplete="new-password"
                            className="w-full h-14 rounded-xl bg-white/10 border border-white/20 pl-14 pr-14 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#F5A524] duration-300"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(
                                    !showConfirmPassword
                                )
                            }
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showConfirmPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>

                    </div>

                    {/* =================================================
                        UPDATE BUTTON
                    ================================================= */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-[#F5A524] rounded-xl font-semibold flex justify-center items-center gap-2 hover:bg-yellow-400 duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >

                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />

                                Updating...
                            </>
                        ) : (
                            <>
                                Update Password

                                <ArrowRight size={18} />
                            </>
                        )}

                    </button>

                </form>

            </div>

        </div>
    );
}