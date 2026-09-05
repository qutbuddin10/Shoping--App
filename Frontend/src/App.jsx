import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/Home";
import Register from "./Auth/Register";
import LoginPage from "./Auth/Login";
import ForgetPassword from "./Auth/ForgetPassword";
import VerifyOTP from "./Auth/VerifyOtp";
import ResetPassword from "./Auth/ResetPassword";

import AdminHome from "./Admin/AdminHome";
import AdminLogin from "./Admin/AdminLogin";
import AdminProtectedRoute from "./Admin/AdminProtectedRoute";
import Categories from "./Admin/Categories";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminProducts from "./Admin/AdminProducts";
import CustomersList from "./Admin/CustomersList";
import AdminOrders from "./Admin/AdminOrders";
import Reviews from "./Admin/Reviews";
import AdminContact from "./Admin/AdminContact";

import About from "./components/About";
import ScrollToTop from "./components/ScrollToTop";
import InitialLoader from "./components/InitialLoader";

import Products from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/CheckOut";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import ProductDetail from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import ContactUs from "./pages/Contactus";

function App() {
    return (
        <>
            <InitialLoader duration={3000} />

            <ScrollToTop />

            <Routes>

                {/* ================= USER ================= */}

                <Route
                    path="/"
                    element={<HomePage />}
                />

                <Route
                    path="/about"
                    element={<About />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/contact"
                    element={<ContactUs />}
                />

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/forget"
                    element={<ForgetPassword />}
                />

                <Route
                    path="/verify-otp"
                    element={<VerifyOTP />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />

                <Route
                    path="/products"
                    element={<Products />}
                />

                <Route
                    path="/product/:id"
                    element={<ProductDetail />}
                />

                <Route
                    path="/cart"
                    element={<Cart />}
                />

                <Route
                    path="/checkout"
                    element={<Checkout />}
                />

                <Route
                    path="/payment"
                    element={<Payment />}
                />

                <Route
                    path="/profile"
                    element={<Profile />}
                />

                <Route
                    path="/wishlist"
                    element={<Wishlist />}
                />

                {/* ================= ADMIN LOGIN ================= */}

                <Route
                    path="/admin-login"
                    element={<AdminLogin />}
                />

                {/* ================= ADMIN DASHBOARD ================= */}

                <Route
                    path="/dashboard"
                    element={
                        <AdminProtectedRoute>
                            <AdminDashboard />
                        </AdminProtectedRoute>
                    }
                />

                {/* ================= ADMIN HOME ================= */}

                <Route
                    path="/admin"
                    element={
                        <AdminProtectedRoute>
                            <AdminHome />
                        </AdminProtectedRoute>
                    }
                />

                {/* ================= ADMIN CATEGORIES ================= */}

                <Route
                    path="/categories"
                    element={
                        <AdminProtectedRoute>
                            <Categories />
                        </AdminProtectedRoute>
                    }
                />

                {/* ================= ADMIN PRODUCTS ================= */}

                <Route
                    path="/adminproducts"
                    element={
                        <AdminProtectedRoute>
                            <AdminProducts />
                        </AdminProtectedRoute>
                    }
                />

                {/* ================= ADMIN CUSTOMERS ================= */}

                <Route
                    path="/admin/customers"
                    element={
                        <AdminProtectedRoute>
                            <CustomersList />
                        </AdminProtectedRoute>
                    }
                />

                {/* ================= ADMIN CONTACT ================= */}

                <Route
                    path="/admin/contact-queries"
                    element={
                        <AdminProtectedRoute>
                            <AdminContact />
                        </AdminProtectedRoute>
                    }
                />

                {/* ================= ADMIN ORDERS ================= */}

                <Route
                    path="/admin/orders"
                    element={
                        <AdminProtectedRoute>
                            <AdminOrders />
                        </AdminProtectedRoute>
                    }
                />

                {/* ================= ADMIN REVIEWS ================= */}

                <Route
                    path="/admin/reviews"
                    element={
                        <AdminProtectedRoute>
                            <Reviews />
                        </AdminProtectedRoute>
                    }
                />

            </Routes>
        </>
    );
}

export default App;