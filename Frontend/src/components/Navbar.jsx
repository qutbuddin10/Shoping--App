import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";

import { Link, useNavigate, useLocation } from "react-router-dom";
import api_base from "../apibase";
import Swal from "sweetalert2";

const SearchSuggestions = ({
  query,
  products,
  categories,
  loading,
  onProductClick,
  onCategoryClick,
  onViewAll,
}) => {
  const normalizedQuery = query.trim().toLowerCase();

  const matchedProducts = products
    .filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const category = product.category?.name?.toLowerCase() || "";

      return (
        name.includes(normalizedQuery) ||
        category.includes(normalizedQuery)
      );
    })
    .slice(0, 5);

  const matchedCategories = categories
    .filter((category) =>
      String(category.name || category)
        .toLowerCase()
        .includes(normalizedQuery)
    )
    .slice(0, 4);

  if (loading) {
    return (
      <div className="px-4 py-5 text-center text-sm text-gray-400">
        Searching...
      </div>
    );
  }

  if (!matchedProducts.length && !matchedCategories.length) {
    return (
      <div className="px-4 py-5">
        <p className="text-sm font-semibold text-white">
          No results found
        </p>

        <button
          type="button"
          onClick={onViewAll}
          className="mt-2 text-xs font-semibold text-[#3B9CFF] hover:underline"
        >
          Search for "{query}"
        </button>
      </div>
    );
  }

  return (
    <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
      {matchedProducts.length > 0 && (
        <div className="p-2">
          <p className="px-2 py-2 text-[10px] font-bold uppercase tracking-[2px] text-gray-500">
            Products
          </p>

          {matchedProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => onProductClick(product.id)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-white/5"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-11 w-11 shrink-0 rounded-lg object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {product.name}
                </p>

                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {product.category?.name || "Product"}
                </p>
              </div>

              <span className="text-sm font-bold text-[#3B9CFF]">
                ₹{product.price}
              </span>
            </button>
          ))}
        </div>
      )}

      {matchedCategories.length > 0 && (
        <div className="border-t border-white/10 p-2">
          <p className="px-2 py-2 text-[10px] font-bold uppercase tracking-[2px] text-gray-500">
            Categories
          </p>

          {matchedCategories.map((category) => {
            const categoryName = String(category.name || category);

            return (
              <button
                key={categoryName}
                type="button"
                onClick={() => onCategoryClick(categoryName)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-[#3B9CFF]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5A524]/10 text-[#3B9CFF]">
                  <Search size={15} />
                </span>
                {categoryName}
              </button>
            );
          })}
        </div>
      )}

      <div className="border-t border-white/10 p-2">
        <button
          type="button"
          onClick={onViewAll}
          className="w-full rounded-xl px-3 py-2.5 text-center text-sm font-bold text-[#3B9CFF] transition hover:bg-[#F5A524]/10"
        >
          View all results for "{query}"
        </button>
      </div>
    </div>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchProducts, setSearchProducts] = useState([]);
  const [searchCategories, setSearchCategories] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef(null);

  // ==========================================
  // CART
  // ==========================================

  const [cartCount, setCartCount] = useState(0);
  const [cartPulse, setCartPulse] = useState(false);

  // ==========================================
  // FLYING PRODUCT
  // ==========================================

  const [flyingProduct, setFlyingProduct] = useState(null);

  const cartButtonRef = useRef(null);
  const mobileCartButtonRef = useRef(null);

  // ==========================================
  // CHECK LOGIN USER
  // ==========================================

  const checkUser = () => {
    try {
      const storedUser = sessionStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("User session error:", error);
      setUser(null);
    }
  };

  // ==========================================
  // FETCH CART COUNT
  // ==========================================

  const fetchCartCount = async () => {
    try {
      const response = await fetch(
        `${api_base}cart/`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        setCartCount(0);
        return;
      }

      const data = await response.json();

      const count = Number(data.total_items || 0);

      setCartCount(count);

      // Small cart badge animation
      setCartPulse(true);

      setTimeout(() => {
        setCartPulse(false);
      }, 400);
    } catch (error) {
      console.error("Navbar cart error:", error);
      setCartCount(0);
    }
  };

  // ==========================================
  // PAGE LOAD / LOCATION CHANGE
  // ==========================================

  useEffect(() => {
    checkUser();
  }, [location]);

  // ==========================================
  // LIVE SEARCH
  // ==========================================

  useEffect(() => {
    if (!searchOpen || !searchQuery.trim()) {
      setSearchProducts([]);
      setSearchCategories([]);
      return;
    }

    const controller = new AbortController();

    const loadSearchData = async () => {
      try {
        setSearchLoading(true);

        const [productsResponse, categoriesResponse] =
          await Promise.all([
            fetch(`${api_base}products/`, {
              signal: controller.signal,
            }),
            fetch(`${api_base}categories/`, {
              signal: controller.signal,
            }),
          ]);

        const productsData = productsResponse.ok
          ? await productsResponse.json()
          : [];

        const categoriesData = categoriesResponse.ok
          ? await categoriesResponse.json()
          : [];

        setSearchProducts(
          Array.isArray(productsData)
            ? productsData
            : productsData.products || []
        );

        setSearchCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : categoriesData.categories || []
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Navbar search error:", error);
          setSearchProducts([]);
          setSearchCategories([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    };

    const timer = setTimeout(loadSearchData, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchOpen, searchQuery]);

  // ==========================================
  // LOGIN EVENT
  // ==========================================

  useEffect(() => {
    const handleUserLogin = () => {
      checkUser();
      fetchCartCount();
    };

    window.addEventListener("userLogin", handleUserLogin);

    return () => {
      window.removeEventListener("userLogin", handleUserLogin);
    };
  }, []);

  // ==========================================
  // CART UPDATE EVENT
  // ==========================================

  useEffect(() => {
    fetchCartCount();

    const handleCartUpdate = (event) => {
      // If another component gives us count directly
      if (event.detail?.count !== undefined) {
        const count = Number(event.detail.count);

        setCartCount(count);

        setCartPulse(true);

        setTimeout(() => {
          setCartPulse(false);
        }, 400);
      } else {
        // Otherwise fetch latest count from Django
        fetchCartCount();
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  // ==========================================
  // FIND VISIBLE CART BUTTON
  // ==========================================

  const getVisibleCartButton = () => {
    const desktopCart = cartButtonRef.current;
    const mobileCart = mobileCartButtonRef.current;

    if (desktopCart) {
      const rect = desktopCart.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        return desktopCart;
      }
    }

    if (mobileCart) {
      const rect = mobileCart.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        return mobileCart;
      }
    }

    return null;
  };

  // ==========================================
  // FLY PRODUCT TO CART
  // ==========================================

  useEffect(() => {
    const handleFlyCart = (event) => {
      const { image, startRect } = event.detail || {};

      if (!image || !startRect) {
        return;
      }

      const cartElement = getVisibleCartButton();

      if (!cartElement) {
        return;
      }

      const targetRect =
        cartElement.getBoundingClientRect();

      const targetX =
        targetRect.left +
        targetRect.width / 2 -
        startRect.left -
        30;

      const targetY =
        targetRect.top +
        targetRect.height / 2 -
        startRect.top -
        30;

      setFlyingProduct({
        image: image,
        startX: startRect.left,
        startY: startRect.top,
        targetX: targetX,
        targetY: targetY,
      });

      setTimeout(() => {
        setFlyingProduct(null);
      }, 850);
    };

    window.addEventListener("flyToCart", handleFlyCart);

    return () => {
      window.removeEventListener(
        "flyToCart",
        handleFlyCart
      );
    };
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#F5A524",
      cancelButtonColor: "#0B1220",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem("user");

        setUser(null);
        setUserMenu(false);
        setMobileMenu(false);

        // Reset cart badge
        setCartCount(0);

        Swal.fire({
          title: "Logged Out",
          text: "You have been logged out successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/");
      }
    });
  };

  // ==========================================
  // SHOP BUTTON
  // ==========================================

  const handleShop = () => {
    setMobileMenu(false);
    setUserMenu(false);
    navigate("/products");
  };

  // ==========================================
  // CATEGORIES BUTTON
  // ==========================================

  const handleCategories = () => {
    setMobileMenu(false);
    setUserMenu(false);

    if (location.pathname === "/") {
      const categoriesSection =
        document.getElementById("categories");

      if (categoriesSection) {
        categoriesSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      return;
    }

    navigate("/");

    setTimeout(() => {
      const categoriesSection =
        document.getElementById("categories");

      if (categoriesSection) {
        categoriesSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 300);
  };

  // ==========================================
  // NAVIGATION
  // ==========================================

  const handleNavigation = (path) => {
    setMobileMenu(false);
    setUserMenu(false);

    navigate(path);
  };

  return (
    <>
      {/* ==========================================
          FLYING PRODUCT
      ========================================== */}

      {flyingProduct && (
        <img
          src={flyingProduct.image}
          alt=""
          className="pointer-events-none fixed z-[9999] h-[60px] w-[60px] rounded-xl object-cover shadow-2xl"
          style={{
            left: flyingProduct.startX,
            top: flyingProduct.startY,

            "--fly-x":
              `${flyingProduct.targetX}px`,

            "--fly-y":
              `${flyingProduct.targetY}px`,

            animation:
              "shopNestFlyCart 850ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
          }}
        />
      )}

      {/* ==========================================
          NAVBAR
      ========================================== */}

      <nav className="sticky top-0 z-[100] w-full border-b border-white/[0.07] bg-gradient-to-br from-[#060B18] via-[#0A1834] to-[#0B2A5B]/98 backdrop-blur-2xl shadow-[0_12px_45px_rgba(0,0,0,0.42)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2196FF]/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-[18%] top-0 h-16 bg-[#2196FF]/[0.04] blur-2xl" />

        <div className="relative mx-auto flex h-[64px] sm:h-[72px] lg:h-[82px] max-w-7xl items-center justify-between px-3 sm:px-8 lg:px-10">

          {/* ================= LOGO ================= */}

          <Link
            to="/"
            onClick={() => setMobileMenu(false)}
            className="flex items-center gap-2"
          >
            <motion.div
              whileHover={{ scale: 1.06, rotate: -3 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
              className="relative flex h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F5A524] via-[#FFB83D] to-[#FFD06A] text-[#07111F] shadow-[0_10px_30px_rgba(245,165,36,0.24)]"
            >
              <div className="absolute inset-0 rounded-2xl bg-white/20 blur-md" />
              <ShoppingCart className="relative" size={18} strokeWidth={2.5} />
            </motion.div>

            <div>
              <h1 className="text-base sm:text-lg lg:text-[21px] font-black tracking-tight text-white">
                Shop
                <span className="bg-gradient-to-r from-[#3B9CFF] via-[#63B7FF] to-[#8AC8FF] bg-clip-text text-transparent">
                  Nest
                </span>
              </h1>

              <p className="hidden text-[9px] font-semibold uppercase tracking-[3px] text-blue-200/45 sm:block">
                Premium Shopping
              </p>
            </div>
          </Link>

          {/* ================= DESKTOP NAV ================= */}

          <div className="hidden items-center gap-1 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-1 lg:flex">

            {/* HOME */}

            <Link
              to="/"
              className={`relative rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                location.pathname === "/"
                  ? "bg-[#2196FF]/10 text-[#63B7FF] shadow-[inset_0_0_18px_rgba(33,150,255,0.06)]"
                  : "text-slate-200/85 hover:text-white"
              }`}
            >
              Home
                            {location.pathname === "/" && (
                <span className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full bg-[#39A4FF] shadow-[0_0_12px_rgba(33,150,255,0.85)]" />
              )}
            </Link>

            {/* SHOP */}

            <button
              onClick={handleShop}
              className={`relative rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                location.pathname === "/products"
                  ? "bg-[#2196FF]/10 text-[#63B7FF] shadow-[inset_0_0_18px_rgba(33,150,255,0.06)]"
                  : "text-slate-200/85 hover:text-white"
              }`}
            >
              Shop
              {location.pathname === "/products" && (
                <span className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full bg-[#39A4FF] shadow-[0_0_12px_rgba(33,150,255,0.85)]" />
              )}
            </button>

            {/* CATEGORIES */}

            <button
              onClick={handleCategories}
              className="relative rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-300 hover:bg-white/[0.045] hover:text-white"
            >
              Categories
              {location.pathname === "/" && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#2196FF] shadow-[0_0_12px_rgba(33,150,255,0.65)]" />
              )}
            </button>

            {/* ABOUT */}

            <Link
              to="/about"
              className={`relative rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                location.pathname === "/about"
                  ? "bg-[#2196FF]/10 text-[#63B7FF] shadow-[inset_0_0_18px_rgba(33,150,255,0.06)]"
                  : "text-slate-200/85 hover:text-white"
              }`}
            >
              About
                            {location.pathname === "/about" && (
                <span className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full bg-[#39A4FF] shadow-[0_0_12px_rgba(33,150,255,0.85)]" />
              )}
            </Link>

            {/* CONTACT US */}

            <Link
              to="/contact"
              className={`relative rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                location.pathname === "/contact"
                  ? "bg-[#2196FF]/10 text-[#63B7FF] shadow-[inset_0_0_18px_rgba(33,150,255,0.06)]"
                  : "text-slate-200/85 hover:text-white"
              }`}
            >
              Contact
                            {location.pathname === "/contact" && (
                <span className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full bg-[#39A4FF] shadow-[0_0_12px_rgba(33,150,255,0.85)]" />
              )}
            </Link>

          </div>

          {/* ================= RIGHT SIDE ================= */}

          <div className="hidden items-center gap-2 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-1.5 lg:flex">

            {/* SEARCH */}

            <div className="relative">
              <button
                type="button"
                aria-label="Search products"
                onClick={() => {
                  setSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                className="group flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-300 shadow-inner shadow-white/[0.02] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2196FF]/40 hover:bg-[#2196FF]/10 hover:text-[#63B7FF] hover:shadow-[0_8px_24px_rgba(33,150,255,0.12)]"
              >
                <Search size={19} />
              </button>

              <AnimatePresence>
              {searchOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[80]"
                    onClick={() => setSearchOpen(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-14 z-[90] w-[390px] overflow-hidden rounded-2xl border border-blue-200/10 bg-[#11131E]/98 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                    <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.025] px-3 py-3">
                      <Search size={18} className="shrink-0 text-gray-400" />

                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && searchQuery.trim()) {
                            setSearchOpen(false);
                            navigate(
                              `/products?search=${encodeURIComponent(
                                searchQuery.trim()
                              )}`
                            );
                          }

                          if (e.key === "Escape") {
                            setSearchOpen(false);
                          }
                        }}
                        placeholder="Search products or categories..."
                        className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                      />

                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="text-gray-500 hover:text-white"
                        >
                          <X size={17} />
                        </button>
                      )}
                    </div>

                    {searchQuery.trim() && (
                      <SearchSuggestions
                        query={searchQuery}
                        products={searchProducts}
                        categories={searchCategories}
                        loading={searchLoading}
                        onProductClick={(id) => {
                          setSearchOpen(false);
                          setSearchQuery("");
                          navigate(`/product/${id}`);
                        }}
                        onCategoryClick={(category) => {
                          setSearchOpen(false);
                          setSearchQuery("");
                          navigate(
                            `/products?category=${encodeURIComponent(category)}`
                          );
                        }}
                        onViewAll={() => {
                          setSearchOpen(false);
                          navigate(
                            `/products?search=${encodeURIComponent(
                              searchQuery.trim()
                            )}`
                          );
                        }}
                      />
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            </div>

            {/* WISHLIST */}

            <button
              onClick={() => {
                if (!user) {
                  Swal.fire({
                    title: "Login Required",
                    text: "Please login first to view your wishlist.",
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

                navigate("/wishlist");
              }}
              className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300"
            >
              <Heart size={19} />
            </button>

            {/* CART */}

            <button
              ref={cartButtonRef}
              onClick={() => {
                if (!user) {
                  Swal.fire({
                    title: "Login Required",
                    text: "Please login first to view your cart.",
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

                navigate("/cart");
              }}
              className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F5A524]/45 hover:bg-[#F5A524]/10 hover:text-[#F5A524] hover:shadow-[0_8px_24px_rgba(245,165,36,0.10)]"
            >
              <ShoppingCart size={19} />

              <span
                className={`absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#080A12] bg-[#F5A524] px-1 text-[9px] font-extrabold text-[#071327] ${
                  cartPulse ? "cartBadgePulse" : ""
                }`}
              >
                {cartCount}
              </span>
            </button>

            {/* ================= USER ================= */}

            {user ? (
              <div className="relative">

                <button
                  onClick={() =>
                    setUserMenu(!userMenu)
                  }
                  className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 shadow-inner shadow-white/[0.02] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2196FF]/40 hover:bg-white/[0.075]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#F5A524] to-[#FFBF55] text-sm font-black text-[#071327] shadow-[0_5px_18px_rgba(245,165,36,0.22)]">
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : user.full_name
                      ? user.full_name
                          .charAt(0)
                          .toUpperCase()
                      : "U"}
                  </div>

                  <div className="max-w-[100px] text-left">

                    <p className="truncate text-xs font-bold text-white">
                      {user.name ||
                        user.full_name ||
                        "User"}
                    </p>

                    <p className="text-[10px] font-medium text-slate-500">
                      Account
                    </p>

                  </div>

                  <ChevronDown
                    size={15}
                    className={`text-gray-400 transition ${
                      userMenu ? "rotate-180" : ""
                    }`}
                  />

                </button>

                {/* USER DROPDOWN */}

                {userMenu && (
                  <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#151B2B] p-2 shadow-2xl">

                    <div className="border-b border-white/10 px-3 py-3">

                      <p className="text-sm font-semibold text-white">
                        {user.name ||
                          user.full_name ||
                          "User"}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {user.email}
                      </p>

                    </div>

                    <Link
                      to="/profile"
                      onClick={() => {
                        setUserMenu(false);
                        setMobileMenu(false);
                      }}
                      className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-[#3B9CFF]"
                    >
                      <User size={17} />
                      My Profile
                    </Link>

                    <button
                      onClick={() => {
                        setUserMenu(false);
                        navigate("/wishlist");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-[#3B9CFF]"
                    >
                      <Heart size={17} />
                      Wishlist
                    </button>

                    <button
                      onClick={() => {
                        setUserMenu(false);
                        navigate("/cart");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-[#3B9CFF]"
                    >
                      <ShoppingCart size={17} />
                      My Cart
                    </button>

                    <button
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>

                  </div>
                )}

              </div>
            ) : (

              /* LOGIN BUTTON */

              <button
                onClick={() =>
                  navigate("/login")
                }
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F5A524] to-[#FFB83D] px-5 py-2.5 text-sm font-extrabold text-[#071327] shadow-[0_8px_26px_rgba(245,165,36,0.22)] ring-1 ring-[#FFD06A]/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-[#FFC15A] hover:to-[#FFD17D] hover:shadow-[0_14px_34px_rgba(245,165,36,0.30)]"
              >
                <User size={17} />
                Login
              </button>

            )}

          </div>

          {/* ================= MOBILE RIGHT ================= */}

          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">

            {/* MOBILE CART - made smaller so it doesn't crowd the logo on small screens */}

            <button
              ref={mobileCartButtonRef}
              onClick={() => {
                if (!user) {
                  Swal.fire({
                    title: "Login Required",
                    text: "Please login first to view your cart.",
                    icon: "warning",
                    confirmButtonColor: "#F5A524",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      navigate("/login");
                    }
                  });

                  return;
                }

                navigate("/cart");
              }}
              className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border border-white/10 bg-white/[0.045] text-slate-300 transition-all duration-300 hover:border-[#F5A524]/40 hover:bg-[#F5A524]/10 hover:text-[#3B9CFF]"
            >
              <ShoppingCart size={15} className="sm:hidden" />
              <ShoppingCart size={17} className="hidden sm:block" />

              <span
                className={`absolute -right-1 -top-1 flex h-[14px] min-w-[14px] sm:h-[17px] sm:min-w-[17px] items-center justify-center rounded-full border-2 border-[#080A12] bg-[#F5A524] px-0.5 text-[8px] sm:text-[9px] font-extrabold text-[#071327] ${
                  cartPulse ? "cartBadgePulse" : ""
                }`}
              >
                {cartCount}
              </span>
            </button>

            {/* MOBILE MENU */}

            <button
              onClick={() =>
                setMobileMenu(!mobileMenu)
              }
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border border-white/10 bg-white/[0.045] text-white transition-all duration-300 hover:border-[#F5A524]/40 hover:bg-[#F5A524]/10 hover:text-[#3B9CFF]"
            >
              {mobileMenu ? (
                <>
                  <X size={17} className="sm:hidden" />
                  <X size={19} className="hidden sm:block" />
                </>
              ) : (
                <>
                  <Menu size={17} className="sm:hidden" />
                  <Menu size={19} className="hidden sm:block" />
                </>
              )}
            </button>

          </div>

        </div>

        {/* ================= MOBILE MENU ================= */}

        {mobileMenu && (
          <div className="border-t border-white/10 bg-gradient-to-b from-[#0C0D16] to-[#090A11] px-5 py-5 shadow-2xl lg:hidden">

            <div className="flex flex-col gap-2">

              <button
                type="button"
                onClick={() => {
                  setMobileMenu(false);
                  setSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-left text-sm font-semibold text-slate-300 transition-all duration-300 hover:border-[#F5A524]/40 hover:bg-[#F5A524]/10 hover:text-[#3B9CFF]"
              >
                <Search size={18} />
                Search products & categories
              </button>

              <Link
                to="/"
                onClick={() =>
                  setMobileMenu(false)
                }
                className="rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-[#3B9CFF]"
              >
                Home
              </Link>

              {/* MOBILE SHOP */}

              <button
                onClick={handleShop}
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-[#3B9CFF]"
              >
                Shop
              </button>

              {/* MOBILE CATEGORIES */}

              <button
                onClick={handleCategories}
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-[#3B9CFF]"
              >
                Categories
              </button>

              <Link
                to="/about"
                onClick={() =>
                  setMobileMenu(false)
                }
                className="rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-[#3B9CFF]"
              >
                About
              </Link>

              {/* MOBILE CONTACT US */}

              <Link
                to="/contact"
                onClick={() =>
                  setMobileMenu(false)
                }
                className="rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-[#3B9CFF]"
              >
                Contact
              </Link>

              <div className="my-2 h-px bg-white/10" />

              {user ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5A524] font-bold text-black">
                      {user.name
                        ? user.name
                            .charAt(0)
                            .toUpperCase()
                        : user.full_name
                        ? user.full_name
                            .charAt(0)
                            .toUpperCase()
                        : "U"}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        {user.name ||
                          user.full_name ||
                          "User"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>

                  </div>

                  <Link
                    to="/profile"
                    onClick={() => {
                      setMobileMenu(false);
                      setUserMenu(false);
                    }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-[#3B9CFF]"
                  >
                    <User size={18} />
                    My Profile
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenu(false);
                      navigate("/wishlist");
                    }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-[#3B9CFF]"
                  >
                    <Heart size={18} />
                    Wishlist
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenu(false);
                      navigate("/cart");
                    }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-[#3B9CFF]"
                  >
                    <ShoppingCart size={18} />
                    My Cart
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenu(false);
                    navigate("/login");
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#F5A524] px-5 py-3 font-bold text-black"
                >
                  <User size={18} />
                  Login
                </button>
              )}

            </div>

          </div>
        )}

      </nav>

      {/* ================= MOBILE SEARCH ================= */}

      {searchOpen && (
        <div className="fixed inset-0 z-[200] bg-[#0B0F19] p-4 lg:hidden">
          <div className="mx-auto max-w-xl">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <Search size={19} className="shrink-0 text-gray-400" />

              <input
                ref={searchInputRef}
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setSearchOpen(false);
                    navigate(
                      `/products?search=${encodeURIComponent(
                        searchQuery.trim()
                      )}`
                    );
                  }

                  if (e.key === "Escape") {
                    setSearchOpen(false);
                  }
                }}
                placeholder="Search products or categories..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />

              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {searchQuery.trim() && (
              <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-[#151B2B] shadow-2xl">
                <SearchSuggestions
                  query={searchQuery}
                  products={searchProducts}
                  categories={searchCategories}
                  loading={searchLoading}
                  onProductClick={(id) => {
                    setSearchOpen(false);
                    setSearchQuery("");
                    navigate(`/product/${id}`);
                  }}
                  onCategoryClick={(category) => {
                    setSearchOpen(false);
                    setSearchQuery("");
                    navigate(
                      `/products?category=${encodeURIComponent(category)}`
                    );
                  }}
                  onViewAll={() => {
                    setSearchOpen(false);
                    navigate(
                      `/products?search=${encodeURIComponent(
                        searchQuery.trim()
                      )}`
                    );
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          ANIMATION CSS
      ========================================== */}

      <style>
        {`
          @keyframes shopNestFlyCart {

            0% {
              transform:
                translate3d(0, 0, 0)
                scale(1)
                rotate(0deg);

              opacity: 1;
            }

            35% {
              transform:
                translate3d(
                  calc(var(--fly-x) * 0.35),
                  calc(var(--fly-y) * 0.35 - 80px),
                  0
                )
                scale(0.85)
                rotate(-8deg);

              opacity: 1;
            }

            70% {
              transform:
                translate3d(
                  calc(var(--fly-x) * 0.75),
                  calc(var(--fly-y) * 0.75 - 30px),
                  0
                )
                scale(0.55)
                rotate(8deg);

              opacity: 0.9;
            }

            100% {
              transform:
                translate3d(
                  var(--fly-x),
                  var(--fly-y),
                  0
                )
                scale(0.12)
                rotate(0deg);

              opacity: 0;
            }
          }

          @keyframes cartBadgePulse {

            0% {
              transform: scale(1);
            }

            50% {
              transform: scale(1.35);
            }

            100% {
              transform: scale(1);
            }
          }

          .cartBadgePulse {
            animation: cartBadgePulse 400ms ease;
          }
        `}
      </style>
    </>
  );
};

export default Navbar;