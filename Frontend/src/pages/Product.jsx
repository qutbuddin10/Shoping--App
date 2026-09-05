import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import {
    ShoppingCart,
    Heart,
    Star,
    Search,
    SlidersHorizontal,
} from "lucide-react";

import Swal from "sweetalert2";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api_base from "../apibase";


const Products = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "";

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState(urlSearch);
    const [selectedCategory, setSelectedCategory] = useState(
        urlCategory || "All"
    );

    const [wishlist, setWishlist] = useState([]);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const [selectedSizes, setSelectedSizes] = useState({});


    // =====================================================
    // SYNC URL SEARCH / CATEGORY
    // =====================================================

    useEffect(() => {
        setSearch(urlSearch);
        setSelectedCategory(urlCategory || "All");
    }, [urlSearch, urlCategory]);

    // =====================================================
    // FETCH PRODUCTS
    // =====================================================

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(
                    `${api_base}products/`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch products");
                }

                const data = await response.json();

                setProducts(data);
            } catch (error) {
                console.error(
                    "Products error:",
                    error
                );

                Swal.fire({
                    icon: "error",
                    title: "Unable to load products",
                    text: "Please make sure your Django server is running.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);


    // =====================================================
    // FETCH WISHLIST
    // =====================================================

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await fetch(
                    `${api_base}wishlist/`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                if (response.status === 401) {
                    setWishlist([]);
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch wishlist"
                    );
                }

                const data = await response.json();

                setWishlist(
                    data.wishlist || []
                );
            } catch (error) {
                console.error(
                    "Wishlist fetch error:",
                    error
                );

                setWishlist([]);
            }
        };

        fetchWishlist();
    }, []);


    // =====================================================
    // NAVIGATE TO PRODUCT DETAIL
    // =====================================================

    const goToProductDetail = (productId) => {
        navigate(`/product/${productId}`);
    };


    // =====================================================
    // CATEGORIES
    // =====================================================

    const categories = useMemo(() => {
        const categoryNames = products
            .map(
                (product) =>
                    product.category?.name
            )
            .filter(Boolean);

        return [
            "All",
            ...new Set(categoryNames),
        ];
    }, [products]);


    // =====================================================
    // FILTER PRODUCTS
    // =====================================================

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const productName =
                product.name?.toLowerCase() || "";

            const categoryName =
                product.category?.name?.toLowerCase() || "";

            const normalizedSearch =
                search.trim().toLowerCase();

            const matchSearch =
                !normalizedSearch ||
                productName.includes(normalizedSearch) ||
                categoryName.includes(normalizedSearch);

            const matchCategory =
                selectedCategory === "All" ||
                categoryName ===
                    selectedCategory.toLowerCase();

            return (
                matchSearch &&
                matchCategory
            );
        });
    }, [
        products,
        search,
        selectedCategory,
    ]);


    // =====================================================
    // GET PRODUCT SIZES
    // =====================================================

    const getProductSizes = (product) => {
        return (
            product.sizes ||
            product.product_sizes ||
            product.available_sizes ||
            []
        );
    };


    // =====================================================
    // CHECK PRODUCT SIZE
    // =====================================================

    const hasSizes = (product) => {
        return getProductSizes(product).length > 0;
    };


    // =====================================================
    // SIZE CHANGE
    // =====================================================

    const handleSizeChange = (
        productId,
        sizeId
    ) => {
        setSelectedSizes((prev) => ({
            ...prev,
            [productId]: sizeId,
        }));
    };


    // =====================================================
    // TOGGLE WISHLIST
    // =====================================================

    const toggleWishlist = async (product) => {
        const alreadyAdded =
            wishlist.some(
                (item) =>
                    Number(
                        item.product_id ||
                            item.id
                    ) ===
                    Number(product.id)
            );

        setWishlistLoading(true);

        try {
            // =================================================
            // REMOVE FROM WISHLIST
            // =================================================

            if (alreadyAdded) {
                const response = await fetch(
                    `${api_base}wishlist/${product.id}/remove/`,
                    {
                        method: "DELETE",
                        credentials: "include",
                    }
                );

                const data =
                    await response.json();

                if (response.status === 401) {
                    Swal.fire({
                        icon: "warning",
                        title: "Login Required",
                        text: "Please login first to use wishlist.",
                        confirmButtonColor:
                            "#F5A524",
                    }).then(() => {
                        navigate("/login");
                    });

                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        data.msg ||
                            "Unable to remove wishlist"
                    );
                }

                setWishlist((prev) =>
                    prev.filter(
                        (item) =>
                            Number(
                                item.product_id ||
                                    item.id
                            ) !==
                            Number(product.id)
                    )
                );

                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "info",
                    title: "Removed from wishlist",
                    showConfirmButton: false,
                    timer: 1500,
                });

                return;
            }


            // =================================================
            // ADD TO WISHLIST
            // =================================================

            const response = await fetch(
                `${api_base}wishlist/`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        product_id:
                            product.id,
                    }),
                }
            );

            const data =
                await response.json();

            if (response.status === 401) {
                Swal.fire({
                    icon: "warning",
                    title: "Login Required",
                    text: "Please login first to add products to wishlist.",
                    confirmButtonColor:
                        "#F5A524",
                }).then(() => {
                    navigate("/login");
                });

                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.msg ||
                        "Unable to add wishlist"
                );
            }

            setWishlist((prev) => [
                ...prev,
                {
                    product_id:
                        product.id,
                },
            ]);

            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Added to wishlist",
                showConfirmButton: false,
                timer: 1500,
            });
        } catch (error) {
            console.error(
                "Wishlist error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Something went wrong",
                text:
                    error.message ||
                    "Unable to update wishlist.",
            });
        } finally {
            setWishlistLoading(false);
        }
    };


    // =====================================================
    // ADD TO CART
    // =====================================================

    const addToCart = async (
        product,
        event
    ) => {
        // =================================================
        // AUTHENTICATION CHECK
        // =================================================

        const user = sessionStorage.getItem("user");
        const registered = localStorage.getItem("registered");

        if (!user) {
            const isRegistered = registered === "true";

            Swal.fire({
                icon: "info",
                title: isRegistered
                    ? "Login Required"
                    : "Registration Required",
                text: isRegistered
                    ? "Please login first to add products to your cart."
                    : "Please create an account before adding products to your cart.",
                confirmButtonText: isRegistered
                    ? "Login"
                    : "Register",
                confirmButtonColor: "#F5A524",
                showCancelButton: true,
                cancelButtonText: "Continue Shopping",
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate(
                        isRegistered
                            ? "/login"
                            : "/register"
                    );
                }
            });

            return;
        }

        const sizes =
            getProductSizes(product);

        const productHasSizes =
            sizes.length > 0;

        const selectedSizeId =
            selectedSizes[product.id];


        // =================================================
        // SIZE REQUIRED
        // =================================================

        if (
            productHasSizes &&
            !selectedSizeId
        ) {
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "warning",
                title: "Please select a size",
                showConfirmButton: false,
                timer: 1800,
            });

            return;
        }


        let selectedSize = null;


        // =================================================
        // SIZE VALIDATION
        // =================================================

        if (productHasSizes) {
            selectedSize =
                sizes.find(
                    (size) =>
                        String(size.id) ===
                        String(
                            selectedSizeId
                        )
                );

            if (!selectedSize) {
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "warning",
                    title: "Invalid size selected",
                    showConfirmButton: false,
                    timer: 1800,
                });

                return;
            }

            if (
                Number(
                    selectedSize.stock || 0
                ) <= 0
            ) {
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "warning",
                    title: `Size ${selectedSize.size} is out of stock`,
                    showConfirmButton: false,
                    timer: 1800,
                });

                return;
            }
        } else {
            if (product.stock <= 0) {
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "warning",
                    title: "Out of stock",
                    showConfirmButton: false,
                    timer: 1800,
                });

                return;
            }
        }


        // =================================================
        // ADD CART API
        // =================================================

        try {
            const response = await fetch(
                `${api_base}cart/`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        product_id:
                            product.id,

                        size_id:
                            productHasSizes
                                ? Number(
                                      selectedSizeId
                                  )
                                : null,
                    }),
                }
            );

            const data =
                await response.json();


            if (!response.ok) {
                if (response.status === 401) {
                    Swal.fire({
                        icon: "warning",
                        title: "Login Required",
                        text: "Please login first to add products to cart.",
                        confirmButtonColor:
                            "#F5A524",
                    }).then(() => {
                        navigate("/login");
                    });

                    return;
                }

                Swal.fire({
                    icon: "warning",
                    title: "Unable to add",
                    text:
                        data.msg ||
                        "Something went wrong",
                });

                return;
            }


            // =================================================
            // UPDATE PRODUCT STOCK
            // =================================================

            setProducts((prev) =>
                prev.map((item) => {
                    if (
                        item.id !==
                        product.id
                    ) {
                        return item;
                    }


                    if (
                        productHasSizes &&
                        data.size_id
                    ) {
                        const updatedSizes =
                            getProductSizes(
                                item
                            ).map(
                                (size) =>
                                    String(
                                        size.id
                                    ) ===
                                    String(
                                        data.size_id
                                    )
                                        ? {
                                              ...size,
                                              stock:
                                                  data.stock,
                                          }
                                        : size
                            );

                        return {
                            ...item,
                            sizes:
                                updatedSizes,
                        };
                    }


                    return {
                        ...item,
                        stock:
                            data.stock,
                    };
                })
            );


            // =================================================
            // FLY TO CART ANIMATION
            // =================================================

            let startRect = null;

            if (event?.currentTarget) {
                const productCard =
                    event.currentTarget.closest(
                        "[data-product-card]"
                    );

                const productImage =
                    productCard?.querySelector(
                        "[data-product-image]"
                    );

                if (productImage) {
                    startRect =
                        productImage.getBoundingClientRect();
                } else {
                    startRect =
                        event.currentTarget.getBoundingClientRect();
                }
            }


            if (startRect) {
                window.dispatchEvent(
                    new CustomEvent(
                        "flyToCart",
                        {
                            detail: {
                                image:
                                    product.image,

                                startRect: {
                                    left:
                                        startRect.left,

                                    top:
                                        startRect.top,

                                    width:
                                        startRect.width,

                                    height:
                                        startRect.height,
                                },
                            },
                        }
                    )
                );
            }


            // =================================================
            // CART UPDATED EVENT
            // =================================================

            window.dispatchEvent(
                new CustomEvent(
                    "cartUpdated"
                )
            );


            // =================================================
            // SUCCESS MESSAGE
            // =================================================

            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Added to cart",
                text: productHasSizes
                    ? `${product.name} - Size ${
                          data.size ||
                          selectedSize?.size
                      } added successfully`
                    : `${product.name} added successfully`,
                showConfirmButton: false,
                timer: 1800,
            });


            // =================================================
            // CLEAR SELECTED SIZE
            // =================================================

            if (productHasSizes) {
                setSelectedSizes((prev) => {
                    const updated = {
                        ...prev,
                    };

                    delete updated[
                        product.id
                    ];

                    return updated;
                });
            }
        } catch (error) {
            console.error(
                "Add cart error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Something went wrong",
                text: "Unable to add product to cart.",
            });
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#060B18]">
                <div className="h-[74px] w-full shrink-0" aria-hidden="true" />
            <div className="fixed left-0 top-0 z-[100] w-full border-b border-white/10 bg-gradient-to-r from-[#080D18]/98 via-[#0B1424]/96 to-[#0A1220]/98 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                <Navbar />
            </div>

                <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
                    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                        {[
                            1,
                            2,
                            3,
                            4,
                            5,
                            6,
                            7,
                            8,
                        ].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="animate-pulse overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.045]"
                                >
                                    <div className="aspect-square bg-white/[0.045]/10" />

                                    <div className="p-4">
                                        <div className="h-3 w-1/3 rounded bg-white/[0.045]/10" />

                                        <div className="mt-3 h-4 w-3/4 rounded bg-white/[0.045]/10" />

                                        <div className="mt-4 h-4 w-1/2 rounded bg-white/[0.045]/10" />

                                        <div className="mt-5 h-9 rounded-xl bg-white/[0.045]/10" />
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </section>
            </div>
        );
    }


    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#060B18] text-white">
            {/* Premium Products Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.13]" style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
                    backgroundSize: "64px 64px"
                }} />
                <div className="absolute -top-56 left-[8%] h-[520px] w-[520px] rounded-full bg-[#2196FF]/[0.08] blur-[140px]" />
                <div className="absolute top-[32%] -right-52 h-[520px] w-[520px] rounded-full bg-[#F5A524]/[0.055] blur-[140px]" />
                <div className="absolute bottom-[8%] left-[35%] h-[420px] w-[420px] rounded-full bg-[#1769E0]/[0.06] blur-[130px]" />
            </div>

            <div className="sticky top-0 z-[100] w-full">
                    <Navbar />
                </div>


            {/* =================================================
                HERO
            ================================================= */}

            <section className="relative z-10 overflow-hidden bg-gradient-to-br from-[#081225] via-[#0B1730] to-[#111D39]">

                <div className="absolute -right-32 -top-40 h-[500px] w-[500px] rounded-full bg-[#F5A524]/10 blur-[140px]" />

                <div className="absolute -bottom-40 -left-32 h-[450px] w-[450px] rounded-full bg-[#2196FF]/10 blur-[140px]" />

                <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">

                    <div className="max-w-3xl">

                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045]/[0.06] px-4 py-2 shadow-lg backdrop-blur-xl">

                            <ShoppingCart
                                size={15}
                                className="text-[#F5A524]"
                            />

                            <span className="text-sm font-semibold text-slate-300">
                                Shop Collection
                            </span>

                        </div>


                        <h1 className="mt-6 text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">

                            Discover products

                            <span className="block bg-gradient-to-r from-[#55B0FF] via-[#8BCBFF] to-[#F5A524] bg-clip-text text-transparent">
                                you'll love.
                            </span>

                        </h1>


                        <p className="mt-6 max-w-2xl text-sm leading-8 text-slate-400 sm:text-base lg:text-lg">
                            Explore our carefully selected
                            collection of quality products
                            designed to make your everyday
                            shopping experience simple,
                            stylish, and enjoyable.
                        </p>

                    </div>

                </div>

            </section>


            {/* =================================================
                PRODUCTS
            ================================================= */}

            <section className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">


                {/* =================================================
                    SEARCH + CATEGORY
                ================================================= */}

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">


                    {/* SEARCH */}

                    <div className="relative w-full lg:max-w-md">

                        <Search
                            size={19}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    const value =
                                        e.target.value.trim();

                                    const params =
                                        new URLSearchParams(
                                            searchParams
                                        );

                                    if (value) {
                                        params.set(
                                            "search",
                                            value
                                        );
                                    } else {
                                        params.delete("search");
                                    }

                                    navigate(
                                        `/products?${params.toString()}`
                                    );
                                }
                            }}
                            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition-all duration-200 placeholder:text-slate-400 focus:border-[#F5A524] focus:ring-4 focus:ring-[#F5A524]/10"
                        />

                    </div>


                    {/* CATEGORIES */}

                    <div className="flex items-center gap-2 overflow-x-auto pb-1">

                        <SlidersHorizontal
                            size={18}
                            className="shrink-0 text-slate-500"
                        />

                        {categories.map(
                            (category) => (
                                <button
                                    key={category}
                                    onClick={() => {
                                        setSelectedCategory(category);

                                        const params =
                                            new URLSearchParams(
                                                searchParams
                                            );

                                        if (category === "All") {
                                            params.delete("category");
                                        } else {
                                            params.set(
                                                "category",
                                                category
                                            );
                                        }

                                        navigate(
                                            `/products?${params.toString()}`
                                        );
                                    }}
                                    className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                        selectedCategory ===
                                        category
                                            ? "bg-[#F5A524] text-black shadow-md shadow-[#F5A524]/20"
                                            : "border border-white/10 bg-white/[0.045] text-slate-300 hover:border-[#F5A524] hover:text-white"
                                    }`}
                                >
                                    {category}
                                </button>
                            )
                        )}

                    </div>

                </div>


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-7 mt-12">

                    <p className="text-xs font-bold uppercase tracking-[3px] text-[#F5A524]">
                        Collection
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                        Our Products
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        {filteredProducts.length}{" "}
                        products available
                    </p>

                </div>


                {/* =================================================
                    PRODUCT GRID
                ================================================= */}

                {!loading &&
                    filteredProducts.length >
                        0 && (
                        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">

                            {filteredProducts.map(
                                (product) => {

                                    const isWishlisted =
                                        wishlist.some(
                                            (item) =>
                                                Number(
                                                    item.product_id ||
                                                        item.id
                                                ) ===
                                                Number(
                                                    product.id
                                                )
                                        );

                                    const sizes =
                                        getProductSizes(
                                            product
                                        );

                                    const productHasSizes =
                                        sizes.length >
                                        0;

                                    const selectedSizeId =
                                        selectedSizes[
                                            product.id
                                        ];

                                    const selectedSize =
                                        sizes.find(
                                            (size) =>
                                                String(
                                                    size.id
                                                ) ===
                                                String(
                                                    selectedSizeId
                                                )
                                        );


                                    return (
                                        <div
                                            key={
                                                product.id
                                            }
                                            data-product-card
                                            onClick={() =>
                                                goToProductDetail(
                                                    product.id
                                                )
                                            }
                                            className="group cursor-pointer overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.045]/[0.045] shadow-[0_18px_55px_rgba(0,0,0,0.20)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#2196FF]/30 hover:bg-white/[0.045]/[0.065] hover:shadow-[0_24px_70px_rgba(0,0,0,0.32)]"
                                        >


                                            {/* =================================================
                                                IMAGE
                                            ================================================= */}

                                            <div className="relative aspect-square overflow-hidden bg-[#0A1428]">

                                                <img
                                                    src={
                                                        product.image
                                                    }
                                                    alt={
                                                        product.name
                                                    }
                                                    data-product-image
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />


                                                {/* WISHLIST */}

                                                <button
                                                    type="button"
                                                    disabled={
                                                        wishlistLoading
                                                    }
                                                    onClick={(
                                                        e
                                                    ) => {
                                                        e.stopPropagation();

                                                        toggleWishlist(
                                                            product
                                                        );
                                                    }}
                                                    className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all ${
                                                        isWishlisted
                                                            ? "bg-red-500 text-white"
                                                            : "bg-white/[0.045]/90 text-slate-300 hover:text-red-500"
                                                    } ${
                                                        wishlistLoading
                                                            ? "cursor-wait opacity-70"
                                                            : ""
                                                    }`}
                                                >

                                                    <Heart
                                                        size={
                                                            17
                                                        }
                                                        fill={
                                                            isWishlisted
                                                                ? "currentColor"
                                                                : "none"
                                                        }
                                                    />

                                                </button>


                                                {/* SALE */}

                                                {product.old_price && (
                                                    <span className="absolute left-3 top-3 rounded-full bg-[#F5A524] px-2.5 py-1 text-[10px] font-black text-black">
                                                        SALE
                                                    </span>
                                                )}

                                            </div>


                                            {/* =================================================
                                                CONTENT
                                            ================================================= */}

                                            <div className="p-4">

                                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#D58A00] sm:text-xs">
                                                    {product.category?.name ||
                                                        "Product"}
                                                </p>


                                                <h3 className="mt-1.5 min-h-[40px] line-clamp-2 text-sm font-bold text-white sm:text-base">
                                                    {
                                                        product.name
                                                    }
                                                </h3>


                                                {/* RATING */}

                                                <div className="mt-2 flex items-center gap-1">

                                                    <Star
                                                        size={
                                                            14
                                                        }
                                                        fill="currentColor"
                                                        className="text-[#F5A524]"
                                                    />

                                                    <span className="text-xs font-semibold text-slate-300">
                                                        {product.avg_rating ||
                                                            "4.8"}
                                                    </span>

                                                    <span className="text-xs text-slate-500">
                                                        (
                                                        {
                                                            product.review_count ??
                                                            0
                                                        }
                                                        )
                                                    </span>

                                                </div>


                                                {/* PRICE */}

                                                <div className="mt-3">

                                                    <span className="text-lg font-black sm:text-xl">
                                                        ₹
                                                        {
                                                            product.price
                                                        }
                                                    </span>

                                                    {product.old_price && (
                                                        <span className="ml-2 text-xs text-slate-500 line-through">
                                                            ₹
                                                            {
                                                                product.old_price
                                                            }
                                                        </span>
                                                    )}

                                                </div>


                                                {/* =================================================
                                                    SIZE SELECTOR
                                                ================================================= */}

                                                {productHasSizes && (
                                                    <div
                                                        className="mt-4"
                                                        onClick={(
                                                            e
                                                        ) =>
                                                            e.stopPropagation()
                                                        }
                                                    >

                                                        <div className="mb-2 flex items-center justify-between">

                                                            <span className="text-xs font-bold text-slate-300">
                                                                Select
                                                                Size
                                                            </span>

                                                            {selectedSize && (
                                                                <span className="text-[10px] font-semibold text-[#D58A00]">
                                                                    Selected:{" "}
                                                                    {
                                                                        selectedSize.size
                                                                    }
                                                                </span>
                                                            )}

                                                        </div>


                                                        <div className="flex flex-wrap gap-2">

                                                            {sizes.map(
                                                                (
                                                                    size
                                                                ) => {

                                                                    const isSelected =
                                                                        String(
                                                                            selectedSizeId
                                                                        ) ===
                                                                        String(
                                                                            size.id
                                                                        );

                                                                    const isOutOfStock =
                                                                        Number(
                                                                            size.stock ||
                                                                                0
                                                                        ) <=
                                                                        0;


                                                                    return (
                                                                        <button
                                                                            key={
                                                                                size.id
                                                                            }
                                                                            type="button"
                                                                            disabled={
                                                                                isOutOfStock
                                                                            }
                                                                            onClick={() =>
                                                                                handleSizeChange(
                                                                                    product.id,
                                                                                    size.id
                                                                                )
                                                                            }
                                                                            className={`relative min-w-[42px] rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
                                                                                isOutOfStock
                                                                                    ? "cursor-not-allowed border-white/[0.08] bg-[#101A2D] text-slate-600 line-through"
                                                                                    : isSelected
                                                                                    ? "border-[#F5A524] bg-[#F5A524] text-black shadow-sm"
                                                                                    : "border-white/10 bg-white/[0.045] text-slate-300 hover:border-[#F5A524]"
                                                                            }`}
                                                                        >
                                                                            {
                                                                                size.size
                                                                            }
                                                                        </button>
                                                                    );
                                                                }
                                                            )}

                                                        </div>


                                                        {selectedSize && (
                                                            <p className="mt-2 text-[10px] text-slate-500">
                                                                {selectedSize.stock >
                                                                0
                                                                    ? `${selectedSize.stock} available in size ${selectedSize.size}`
                                                                    : "Out of stock"}
                                                            </p>
                                                        )}

                                                    </div>
                                                )}


                                                {/* =================================================
                                                    STOCK
                                                ================================================= */}

                                                <div className="mt-3 flex items-center justify-between">

                                                    <span className="text-xs text-slate-400">
                                                        {productHasSizes
                                                            ? "Product sizes"
                                                            : "Available stock"}
                                                    </span>

                                                    <span
                                                        className={`text-xs font-bold ${
                                                            productHasSizes
                                                                ? "text-emerald-600"
                                                                : product.stock <=
                                                                  0
                                                                ? "text-red-500"
                                                                : product.stock <=
                                                                  3
                                                                ? "text-orange-500"
                                                                : "text-emerald-600"
                                                        }`}
                                                    >
                                                        {productHasSizes
                                                            ? `${sizes.filter(
                                                                  (
                                                                      size
                                                                  ) =>
                                                                      Number(
                                                                          size.stock ||
                                                                              0
                                                                      ) >
                                                                      0
                                                              ).length} sizes available`
                                                            : product.stock <=
                                                              0
                                                            ? "Out of Stock"
                                                            : `${product.stock} available`}
                                                    </span>

                                                </div>


                                                {/* =================================================
                                                    ADD TO CART
                                                ================================================= */}

                                                <button
                                                    type="button"
                                                    onClick={(
                                                        e
                                                    ) => {
                                                        e.stopPropagation();

                                                        addToCart(
                                                            product,
                                                            e
                                                        );
                                                    }}
                                                    disabled={
                                                        productHasSizes
                                                            ? selectedSize &&
                                                              Number(
                                                                  selectedSize.stock ||
                                                                      0
                                                              ) <=
                                                                  0
                                                            : product.stock <=
                                                              0
                                                    }
                                                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 sm:text-sm ${
                                                        (
                                                            productHasSizes
                                                                ? selectedSize &&
                                                                  Number(
                                                                      selectedSize.stock ||
                                                                          0
                                                                  ) <=
                                                                      0
                                                                : product.stock <=
                                                                  0
                                                        )
                                                            ? "cursor-not-allowed bg-white/[0.045]/10 text-slate-500"
                                                            : "bg-[#0B1220] text-white hover:bg-[#F5A524] hover:text-black"
                                                    }`}
                                                >

                                                    <ShoppingCart
                                                        size={
                                                            16
                                                        }
                                                    />

                                                    {productHasSizes
                                                        ? selectedSize
                                                            ? "Add to Cart"
                                                            : "Select Size"
                                                        : product.stock <=
                                                          0
                                                        ? "Out of Stock"
                                                        : "Add to Cart"}

                                                </button>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}


                {/* =================================================
                    NO PRODUCTS
                ================================================= */}

                {!loading &&
                    filteredProducts.length ===
                        0 && (
                        <div className="py-24 text-center">

                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#101A2D]">

                                <ShoppingCart
                                    size={
                                        35
                                    }
                                    className="text-slate-600"
                                />

                            </div>


                            <h3 className="mt-6 text-xl font-black">
                                No products found
                            </h3>


                            <p className="mt-2 text-sm text-slate-400">
                                Try searching for another
                                product or category.
                            </p>


                            <button
                                type="button"
                                onClick={() => {
                                    setSearch(
                                        ""
                                    );

                                    setSelectedCategory(
                                        "All"
                                    );
                                }}
                                className="mt-5 rounded-xl bg-[#F5A524] px-5 py-2.5 text-sm font-bold text-black"
                            >
                                Clear Filters
                            </button>

                        </div>
                    )}

            </section>

            <Footer />

        </div>
    );
};


export default Products;