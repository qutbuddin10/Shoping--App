import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    ShoppingCart,
    Heart,
    Star,
    ArrowLeft,
    MessageSquare,
    Truck,
    RotateCcw,
    ShieldCheck,
    Tag,
    Boxes,
    Hash,
    Wallet,
} from "lucide-react";

import Swal from "sweetalert2";

import Navbar from "../components/Navbar";
import api_base from "../apibase";


const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();


    // =====================================================
    // PRODUCT STATE
    // =====================================================

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // =====================================================
    // RELATED PRODUCTS STATE
    // =====================================================

    const [relatedProducts, setRelatedProducts] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);


    // =====================================================
    // SIZE STATE
    // =====================================================

    const [selectedSizeId, setSelectedSizeId] =
        useState(null);


    // =====================================================
    // IMAGE STATE
    // =====================================================

    const [activeImage, setActiveImage] =
        useState(null);


    // =====================================================
    // WISHLIST STATE
    // =====================================================

    const [isWishlisted, setIsWishlisted] =
        useState(false);

    const [wishlistLoading, setWishlistLoading] =
        useState(false);


    // =====================================================
    // REVIEW STATE
    // =====================================================

    const [selectedRating, setSelectedRating] =
        useState(0);

    const [hoverRating, setHoverRating] =
        useState(0);

    const [comment, setComment] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);


    // =====================================================
    // FETCH PRODUCT DETAIL
    // =====================================================

    const fetchProduct = () => {
        setLoading(true);

        fetch(
            `${api_base}products/${id}/`
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch product"
                    );
                }

                return response.json();
            })
            .then((data) => {
                setProduct(data);
                fetchRelatedProducts(data.category?.id);

                setActiveImage((prev) => {
                    return prev || data.image;
                });

                setLoading(false);
            })
            .catch((error) => {
                console.error(
                    "Product detail error:",
                    error
                );

                setLoading(false);

                Swal.fire({
                    icon: "error",
                    title: "Unable to load product",
                    text: "Please make sure your Django server is running.",
                });
            });
    };


    // =====================================================
    // FETCH RELATED PRODUCTS
    // =====================================================

    const fetchRelatedProducts = async (categoryId) => {
        if (!categoryId) {
            setRelatedProducts([]);
            return;
        }

        try {
            setRelatedLoading(true);

            const response = await fetch(
                `${api_base}categories/${categoryId}/products/`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch related products"
                );
            }

            const data = await response.json();

            const products = Array.isArray(data)
                ? data
                : Array.isArray(data.products)
                    ? data.products
                    : Array.isArray(data.data)
                        ? data.data
                        : [];

            const filteredProducts = products
                .filter(
                    (item) =>
                        Number(item.id || item.product_id) !==
                        Number(id)
                )
                .slice(0, 8);

            setRelatedProducts(filteredProducts);
        } catch (error) {
            console.error(
                "Related products error:",
                error
            );

            setRelatedProducts([]);
        } finally {
            setRelatedLoading(false);
        }
    };


    // =====================================================
    // FETCH WISHLIST STATUS
    // =====================================================

    const fetchWishlistStatus = async () => {
        try {
            const response = await fetch(
                `${api_base}wishlist/${id}/check/`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                setIsWishlisted(false);
                return;
            }

            const data =
                await response.json();

            setIsWishlisted(
                Boolean(data.is_wishlisted)
            );
        } catch (error) {
            console.error(
                "Wishlist status error:",
                error
            );

            setIsWishlisted(false);
        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchProduct();
        fetchWishlistStatus();

        setSelectedSizeId(null);
        setActiveImage(null);
        setRelatedProducts([]);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);


    // =====================================================
    // TOGGLE WISHLIST
    // =====================================================

    const toggleWishlist = async () => {
        if (wishlistLoading) {
            return;
        }

        setWishlistLoading(true);

        try {

            // =================================================
            // REMOVE FROM WISHLIST
            // =================================================

            if (isWishlisted) {
                const response = await fetch(
                    `${api_base}wishlist/${id}/remove/`,
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
                        text: "Please login first to manage your wishlist.",
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
                            "Unable to remove from wishlist"
                    );
                }

                setIsWishlisted(false);

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
                            Number(id),
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
                        "Unable to add to wishlist"
                );
            }

            setIsWishlisted(true);

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

    const addToCart = async () => {
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

        const hasSizes =
            product.sizes &&
            product.sizes.length > 0;


        // =================================================
        // SIZE REQUIRED
        // =================================================

        if (
            hasSizes &&
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


        // =================================================
        // NORMAL PRODUCT STOCK
        // =================================================

        if (
            !hasSizes &&
            product.stock <= 0
        ) {
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


        // =================================================
        // SELECTED SIZE STOCK
        // =================================================

        if (hasSizes) {
            const selectedSize =
                product.sizes.find(
                    (size) =>
                        String(size.id) ===
                        String(selectedSizeId)
                );

            if (
                !selectedSize ||
                Number(
                    selectedSize.stock || 0
                ) <= 0
            ) {
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "warning",
                    title: "Selected size is out of stock",
                    showConfirmButton: false,
                    timer: 1800,
                });

                return;
            }
        }


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
                            hasSizes
                                ? Number(
                                      selectedSizeId
                                  )
                                : null,
                    }),
                }
            );

            const data =
                await response.json();


            // =================================================
            // LOGIN CHECK
            // =================================================

            if (
                response.status ===
                401
            ) {
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


            // =================================================
            // API ERROR
            // =================================================

            if (!response.ok) {
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
                text: `${product.name} added successfully`,
                showConfirmButton: false,
                timer: 1800,
            });


            // =================================================
            // REFRESH PRODUCT STOCK
            // =================================================

            fetchProduct();

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
    // SUBMIT REVIEW
    // =====================================================

    const submitReview = async () => {

        if (
            selectedRating === 0
        ) {
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "warning",
                title: "Please select a star rating",
                showConfirmButton: false,
                timer: 1800,
            });

            return;
        }


        setSubmitting(true);

        try {
            const response = await fetch(
                `${api_base}products/${id}/reviews/`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        rating:
                            selectedRating,

                        comment:
                            comment,
                    }),
                }
            );


            const data =
                await response.json();


            // =================================================
            // LOGIN REQUIRED
            // =================================================

            if (
                response.status ===
                401
            ) {
                Swal.fire({
                    icon: "info",
                    title: "Login required",
                    text: "Please login to submit a review.",
                }).then(() => {
                    navigate("/login");
                });

                return;
            }


            // =================================================
            // API ERROR
            // =================================================

            if (!response.ok) {
                Swal.fire({
                    icon: "warning",
                    title: "Unable to submit review",
                    text:
                        data.msg ||
                        "Something went wrong",
                });

                return;
            }


            // =================================================
            // SUCCESS
            // =================================================

            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title:
                    data.msg ||
                    "Review submitted",
                showConfirmButton: false,
                timer: 1800,
            });


            setComment("");
            setSelectedRating(0);

            fetchProduct();

        } catch (error) {
            console.error(
                "Review submit error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Something went wrong",
                text: "Unable to submit review.",
            });
        } finally {
            setSubmitting(false);
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="relative min-h-screen overflow-x-hidden bg-[#060B18] text-white">

                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-[0.13]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
                            backgroundSize: "64px 64px",
                        }}
                    />
                    <div className="absolute -top-56 left-[8%] h-[520px] w-[520px] rounded-full bg-[#2196FF]/[0.08] blur-[140px]" />
                    <div className="absolute top-[32%] -right-52 h-[520px] w-[520px] rounded-full bg-[#F5A524]/[0.055] blur-[140px]" />
                    <div className="absolute bottom-[8%] left-[35%] h-[420px] w-[420px] rounded-full bg-[#1769E0]/[0.06] blur-[130px]" />
                </div>

                <Navbar />

                <div className="mx-auto max-w-6xl animate-pulse px-5 py-16">

                    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">

                        <div className="aspect-square rounded-2xl bg-gray-200" />

                        <div className="space-y-4">

                            <div className="h-4 w-1/4 rounded bg-gray-200" />

                            <div className="h-8 w-3/4 rounded bg-gray-200" />

                            <div className="h-6 w-1/3 rounded bg-gray-200" />

                            <div className="h-24 w-full rounded bg-gray-200" />

                        </div>

                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // PRODUCT NOT FOUND
    // =====================================================

    if (!product) {
        return (
            <div className="relative min-h-screen overflow-x-hidden bg-[#060B18] text-white">

                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-[0.13]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
                            backgroundSize: "64px 64px",
                        }}
                    />
                    <div className="absolute -top-56 left-[8%] h-[520px] w-[520px] rounded-full bg-[#2196FF]/[0.08] blur-[140px]" />
                    <div className="absolute top-[32%] -right-52 h-[520px] w-[520px] rounded-full bg-[#F5A524]/[0.055] blur-[140px]" />
                    <div className="absolute bottom-[8%] left-[35%] h-[420px] w-[420px] rounded-full bg-[#1769E0]/[0.06] blur-[130px]" />
                </div>

                <Navbar />

                <div className="mx-auto max-w-6xl px-5 py-24 text-center">

                    <h2 className="text-xl font-bold">
                        Product not found
                    </h2>

                </div>

            </div>
        );
    }


    // =====================================================
    // PRODUCT HELPERS
    // =====================================================

    const hasSizes =
        product.sizes &&
        product.sizes.length > 0;


    const selectedSize =
        product.sizes?.find(
            (size) =>
                String(size.id) ===
                String(selectedSizeId)
        );


    const isInStock = hasSizes
        ? product.sizes.some(
              (size) =>
                  Number(
                      size.stock || 0
                  ) > 0
          )
        : product.stock > 0;


    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#060B18] text-white">

            {/* Premium Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.13]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
                        backgroundSize: "64px 64px",
                    }}
                />

                <div className="absolute -top-56 left-[8%] h-[520px] w-[520px] rounded-full bg-[#2196FF]/[0.08] blur-[140px]" />

                <div className="absolute top-[32%] -right-52 h-[520px] w-[520px] rounded-full bg-[#F5A524]/[0.055] blur-[140px]" />

                <div className="absolute bottom-[8%] left-[35%] h-[420px] w-[420px] rounded-full bg-[#1769E0]/[0.06] blur-[130px]" />
            </div>

            <Navbar />


            <div className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">


                {/* =================================================
                    BACK
                ================================================= */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(-1)
                    }
                    className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#111827]"
                >
                    <ArrowLeft size={16} />

                    Back
                </button>


                {/* =================================================
                    PRODUCT MAIN SECTION
                ================================================= */}

                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-14">


                    {/* =================================================
                        IMAGE + THUMBNAILS
                    ================================================= */}

                    <div>

                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">

                            <img
                                src={
                                    activeImage ||
                                    product.image
                                }
                                alt={
                                    product.name
                                }
                                className="h-full w-full object-cover"
                            />


                            {/* =========================================
                                WISHLIST BUTTON
                            ========================================= */}

                            <button
                                type="button"
                                onClick={
                                    toggleWishlist
                                }
                                disabled={
                                    wishlistLoading
                                }
                                aria-label={
                                    isWishlisted
                                        ? "Remove from wishlist"
                                        : "Add to wishlist"
                                }
                                className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 shadow-lg backdrop-blur-xl transition-all duration-300 ${
                                    isWishlisted
                                        ? "bg-red-500 text-white hover:bg-red-600"
                                        : "bg-[#0D1628]/95 text-gray-500 hover:bg-[#111C31] hover:text-red-500"
                                } ${
                                    wishlistLoading
                                        ? "cursor-wait opacity-70"
                                        : "hover:scale-105"
                                }`}
                            >

                                <Heart
                                    size={21}
                                    fill={
                                        isWishlisted
                                            ? "currentColor"
                                            : "none"
                                    }
                                />

                            </button>

                        </div>


                        {/* =================================================
                            THUMBNAIL STRIP
                        ================================================= */}

                        {product.images &&
                            product.images
                                .length >
                                0 && (

                                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">

                                    {/* MAIN IMAGE */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveImage(
                                                product.image
                                            )
                                        }
                                        className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                                            activeImage ===
                                            product.image
                                                ? "border-[#F5A524]"
                                                : "border-transparent opacity-70 hover:opacity-100"
                                        }`}
                                    >

                                        <img
                                            src={
                                                product.image
                                            }
                                            alt={
                                                product.name
                                            }
                                            className="h-full w-full object-cover"
                                        />

                                    </button>


                                    {/* GALLERY IMAGES */}

                                    {product.images.map(
                                        (
                                            img
                                        ) => (
                                            <button
                                                key={
                                                    img.id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setActiveImage(
                                                        img.image
                                                    )
                                                }
                                                className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                                                    activeImage ===
                                                    img.image
                                                        ? "border-[#F5A524]"
                                                        : "border-transparent opacity-70 hover:opacity-100"
                                                }`}
                                            >

                                                <img
                                                    src={
                                                        img.image
                                                    }
                                                    alt={
                                                        product.name
                                                    }
                                                    className="h-full w-full object-cover"
                                                />

                                            </button>
                                        )
                                    )}

                                </div>
                            )}

                    </div>


                    {/* =================================================
                        PRODUCT DETAILS
                    ================================================= */}

                    <div>

                        <p className="text-xs font-bold uppercase tracking-wider text-[#D58A00]">
                            {product.category?.name ||
                                "Product"}
                        </p>


                        <h1 className="mt-2 text-2xl font-black sm:text-3xl lg:text-4xl">
                            {product.name}
                        </h1>


                        {/* =================================================
                            RATING
                        ================================================= */}

                        <div className="mt-3 flex flex-wrap items-center gap-2">

                            <div className="flex items-center">

                                {[1, 2, 3, 4, 5].map(
                                    (
                                        star
                                    ) => (
                                        <Star
                                            key={
                                                star
                                            }
                                            size={
                                                18
                                            }
                                            className={
                                                star <=
                                                Math.round(
                                                    product.avg_rating ||
                                                        0
                                                )
                                                    ? "text-[#F5A524]"
                                                    : "text-gray-500"
                                            }
                                            fill="currentColor"
                                        />
                                    )
                                )}

                            </div>

                            <span className="text-sm font-semibold text-gray-500">
                                {product.avg_rating ||
                                    0}
                            </span>

                            <span className="text-sm text-gray-500">
                                (
                                {
                                    product.review_count
                                }{" "}
                                review
                                {product.review_count ===
                                1
                                    ? ""
                                    : "s"}
                                )
                            </span>

                        </div>


                        {/* =================================================
                            PRICE
                        ================================================= */}

                        <div className="mt-5">

                            <span className="text-3xl font-black">
                                ₹
                                {
                                    product.price
                                }
                            </span>

                            {product.old_price && (
                                <span className="ml-3 text-base text-gray-500 line-through">
                                    ₹
                                    {
                                        product.old_price
                                    }
                                </span>
                            )}

                        </div>


                        {/* =================================================
                            DESCRIPTION
                        ================================================= */}

                        {product.description && (
                            <p className="mt-4 text-sm leading-7 text-gray-300">
                                {
                                    product.description
                                }
                            </p>
                        )}


                        {/* =================================================
                            SIZES
                        ================================================= */}

                        {hasSizes && (
                            <div className="mt-6">

                                <div className="flex items-center justify-between">

                                    <span className="text-xs font-bold text-gray-500">
                                        Select Size
                                    </span>

                                    {selectedSize && (
                                        <span className="text-xs font-semibold text-[#D58A00]">
                                            Selected:{" "}
                                            {
                                                selectedSize.size
                                            }
                                        </span>
                                    )}

                                </div>


                                <div className="mt-2 flex flex-wrap gap-2">

                                    {product.sizes.map(
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
                                                        setSelectedSizeId(
                                                            size.id
                                                        )
                                                    }
                                                    className={`min-w-[46px] rounded-lg border px-3 py-2 text-sm font-bold transition-all ${
                                                        isOutOfStock
                                                            ? "cursor-not-allowed border-white/10 bg-gray-100 text-gray-300 line-through"
                                                            : isSelected
                                                            ? "border-[#F5A524] bg-[#F5A524] text-black"
                                                            : "border-white/10 bg-[#0D1628] text-gray-500 hover:border-[#F5A524]"
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
                                    <p className="mt-2 text-xs text-gray-500">
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

                        {!hasSizes && (
                            <p
                                className={`mt-6 text-sm font-bold ${
                                    product.stock <=
                                    0
                                        ? "text-red-500"
                                        : "text-emerald-600"
                                }`}
                            >
                                {product.stock <=
                                0
                                    ? "Out of Stock"
                                    : `${product.stock} available in stock`}
                            </p>
                        )}


                        {/* =================================================
                            ACTION BUTTONS
                        ================================================= */}

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">


                            {/* ADD TO CART */}

                            <button
                                type="button"
                                onClick={
                                    addToCart
                                }
                                disabled={
                                    hasSizes
                                        ? selectedSize &&
                                          Number(
                                              selectedSize.stock ||
                                                  0
                                          ) <=
                                              0
                                        : product.stock <=
                                          0
                                }
                                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all sm:flex-1 ${
                                    (
                                        hasSizes
                                            ? selectedSize &&
                                              Number(
                                                  selectedSize.stock ||
                                                      0
                                              ) <=
                                                  0
                                            : product.stock <=
                                              0
                                    )
                                        ? "cursor-not-allowed bg-gray-200 text-gray-500"
                                        : "bg-[#0B1220] text-white hover:bg-[#F5A524] hover:text-black"
                                }`}
                            >

                                <ShoppingCart
                                    size={
                                        18
                                    }
                                />

                                {hasSizes
                                    ? selectedSize
                                        ? "Add to Cart"
                                        : "Select Size"
                                    : product.stock <=
                                      0
                                    ? "Out of Stock"
                                    : "Add to Cart"}

                            </button>


                            {/* WISHLIST */}

                            <button
                                type="button"
                                onClick={
                                    toggleWishlist
                                }
                                disabled={
                                    wishlistLoading
                                }
                                className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3.5 text-sm font-bold transition-all sm:w-auto sm:px-6 ${
                                    isWishlisted
                                        ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                                        : "border-white/10 bg-[#0D1628] text-gray-500 hover:border-red-300 hover:text-red-500"
                                }`}
                            >

                                <Heart
                                    size={
                                        18
                                    }
                                    fill={
                                        isWishlisted
                                            ? "currentColor"
                                            : "none"
                                    }
                                />

                                {isWishlisted
                                    ? "Remove Wishlist"
                                    : "Add to Wishlist"}

                            </button>

                        </div>


                        {/* =================================================
                            PRODUCT DETAILS
                        ================================================= */}

                        <div className="mt-8 rounded-2xl border border-white/10 bg-[#0D1628]/90 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl p-5">

                            <h3 className="text-sm font-bold text-gray-500">
                                Product Details
                            </h3>


                            <div className="mt-3 divide-y divide-white/10 text-sm">

                                <div className="flex items-center justify-between gap-4 py-2.5">

                                    <span className="flex items-center gap-2 text-gray-500">
                                        <Tag
                                            size={
                                                15
                                            }
                                        />
                                        Category
                                    </span>

                                    <span className="text-right font-semibold">
                                        {product.category?.name ||
                                            "-"}
                                    </span>

                                </div>


                                <div className="flex items-center justify-between gap-4 py-2.5">

                                    <span className="flex items-center gap-2 text-gray-500">
                                        <Hash
                                            size={
                                                15
                                            }
                                        />
                                        Product ID
                                    </span>

                                    <span className="font-semibold">
                                        #
                                        {
                                            product.id
                                        }
                                    </span>

                                </div>


                                <div className="flex items-center justify-between gap-4 py-2.5">

                                    <span className="flex items-center gap-2 text-gray-500">
                                        <Boxes
                                            size={
                                                15
                                            }
                                        />
                                        Availability
                                    </span>

                                    <span
                                        className={`font-semibold ${
                                            isInStock
                                                ? "text-emerald-600"
                                                : "text-red-500"
                                        }`}
                                    >
                                        {isInStock
                                            ? "In Stock"
                                            : "Out of Stock"}
                                    </span>

                                </div>


                                {hasSizes && (
                                    <div className="flex items-center justify-between gap-4 py-2.5">

                                        <span className="text-gray-500">
                                            Available
                                            Sizes
                                        </span>

                                        <span className="text-right font-semibold">
                                            {product.sizes
                                                .map(
                                                    (
                                                        size
                                                    ) =>
                                                        size.size
                                                )
                                                .join(
                                                    ", "
                                                )}
                                        </span>

                                    </div>
                                )}

                            </div>

                        </div>


                        {/* =================================================
                            TRUST BADGES
                        ================================================= */}

                        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

                            {product.free_delivery && (
                                <div className="flex flex-col items-center rounded-xl border border-white/10 bg-[#0D1628]/90 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl p-4 text-center">

                                    <Truck
                                        size={
                                            20
                                        }
                                        className="text-[#F5A524]"
                                    />

                                    <span className="mt-2 text-[11px] font-semibold text-gray-300">
                                        Free Delivery
                                    </span>

                                </div>
                            )}


                            {product.is_returnable && (
                                <div className="flex flex-col items-center rounded-xl border border-white/10 bg-[#0D1628]/90 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl p-4 text-center">

                                    <RotateCcw
                                        size={
                                            20
                                        }
                                        className="text-[#F5A524]"
                                    />

                                    <span className="mt-2 text-[11px] font-semibold text-gray-300">
                                        {
                                            product.return_days
                                        }
                                        -Day
                                        Return
                                    </span>

                                </div>
                            )}


                            {product.cod_available && (
                                <div className="flex flex-col items-center rounded-xl border border-white/10 bg-[#0D1628]/90 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl p-4 text-center">

                                    <Wallet
                                        size={
                                            20
                                        }
                                        className="text-[#F5A524]"
                                    />

                                    <span className="mt-2 text-[11px] font-semibold text-gray-300">
                                        Cash on
                                        Delivery
                                    </span>

                                </div>
                            )}


                            <div className="flex flex-col items-center rounded-xl border border-white/10 bg-[#0D1628]/90 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl p-4 text-center">

                                <ShieldCheck
                                    size={
                                        20
                                    }
                                    className="text-[#F5A524]"
                                />

                                <span className="mt-2 text-[11px] font-semibold text-gray-300">
                                    Secure
                                    Payment
                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    REVIEWS SECTION
                ================================================= */}

                <div className="mt-16 border-t border-white/10 pt-10">

                    <h2 className="flex items-center gap-2 text-xl font-black">

                        <MessageSquare
                            size={
                                20
                            }
                            className="text-[#F5A524]"
                        />

                        Ratings & Reviews

                    </h2>


                    {/* =================================================
                        WRITE REVIEW
                    ================================================= */}

                    <div className="mt-6 rounded-2xl border border-white/10 bg-[#0D1628]/90 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl p-6 shadow-sm">

                        <p className="text-sm font-bold text-gray-500">
                            Write a review
                        </p>


                        {/* STARS */}

                        <div className="mt-3 flex items-center gap-1">

                            {[1, 2, 3, 4, 5].map(
                                (
                                    star
                                ) => (
                                    <button
                                        key={
                                            star
                                        }
                                        type="button"
                                        onClick={() =>
                                            setSelectedRating(
                                                star
                                            )
                                        }
                                        onMouseEnter={() =>
                                            setHoverRating(
                                                star
                                            )
                                        }
                                        onMouseLeave={() =>
                                            setHoverRating(
                                                0
                                            )
                                        }
                                        className="p-0.5"
                                    >

                                        <Star
                                            size={
                                                28
                                            }
                                            className={
                                                star <=
                                                (hoverRating ||
                                                    selectedRating)
                                                    ? "text-[#F5A524]"
                                                    : "text-gray-500"
                                            }
                                            fill="currentColor"
                                        />

                                    </button>
                                )
                            )}

                        </div>


                        {/* COMMENT */}

                        <textarea
                            value={
                                comment
                            }
                            onChange={(
                                e
                            ) =>
                                setComment(
                                    e.target.value
                                )
                            }
                            placeholder="Share your thoughts about this product..."
                            rows={
                                3
                            }
                            className="mt-4 w-full rounded-xl border border-white/10 bg-[#080F1C] p-3 text-sm text-gray-100 outline-none placeholder:text-gray-500 focus:border-[#F5A524] focus:ring-4 focus:ring-[#F5A524]/10"
                        />


                        {/* SUBMIT */}

                        <button
                            type="button"
                            onClick={
                                submitReview
                            }
                            disabled={
                                submitting
                            }
                            className="mt-3 rounded-xl bg-[#F5A524] px-6 py-2.5 text-sm font-bold text-black transition hover:bg-[#FFB84D] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting
                                ? "Submitting..."
                                : "Submit Review"}
                        </button>

                    </div>


                    {/* =================================================
                        REVIEW LIST
                    ================================================= */}

                    <div className="mt-8 space-y-5">

                        {product.reviews &&
                        product.reviews.length >
                            0 ? (

                            product.reviews.map(
                                (
                                    review
                                ) => (
                                    <div
                                        key={
                                            review.id
                                        }
                                        className="rounded-2xl border border-white/10 bg-[#0D1628]/90 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl p-5"
                                    >

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                            <p className="text-sm font-bold">
                                                {
                                                    review.user_name
                                                }
                                            </p>

                                            <span className="text-xs text-gray-500">
                                                {
                                                    review.created_at
                                                }
                                            </span>

                                        </div>


                                        {/* REVIEW STARS */}

                                        <div className="mt-1 flex items-center">

                                            {[1, 2, 3, 4, 5].map(
                                                (
                                                    star
                                                ) => (
                                                    <Star
                                                        key={
                                                            star
                                                        }
                                                        size={
                                                            14
                                                        }
                                                        className={
                                                            star <=
                                                            review.rating
                                                                ? "text-[#F5A524]"
                                                                : "text-gray-500"
                                                        }
                                                        fill="currentColor"
                                                    />
                                                )
                                            )}

                                        </div>


                                        {/* COMMENT */}

                                        {review.comment && (
                                            <p className="mt-2 text-sm leading-6 text-gray-300">
                                                {
                                                    review.comment
                                                }
                                            </p>
                                        )}

                                    </div>
                                )
                            )

                        ) : (

                            <p className="text-sm text-gray-500">
                                No reviews yet.
                                Be the first to
                                review this product!
                            </p>

                        )}

                    </div>


                    {/* =================================================
                        RELATED PRODUCTS
                    ================================================= */}

                    <div className="mt-16 border-t border-white/10 pt-10">

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                            <div>

                                <p className="text-xs font-bold uppercase tracking-[3px] text-[#D58A00]">
                                    More To Explore
                                </p>

                                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                                    You May Also Like
                                </h2>

                                <p className="mt-2 text-sm text-gray-500">
                                    More products from the same category.
                                </p>

                            </div>

                            {product.category?.id && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/products?category=${product.category.id}`
                                        )
                                    }
                                    className="flex w-fit items-center gap-2 text-sm font-bold text-[#D58A00] transition hover:text-[#B87500]"
                                >
                                    View All
                                    <ArrowLeft
                                        size={16}
                                        className="rotate-180"
                                    />
                                </button>
                            )}

                        </div>


                        {relatedLoading ? (

                            <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

                                {[1, 2, 3, 4].map((item) => (
                                    <div
                                        key={item}
                                        className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D1628]/90 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl"
                                    >
                                        <div className="aspect-square animate-pulse bg-gray-200" />
                                        <div className="space-y-3 p-4">
                                            <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                                            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                                            <div className="h-5 w-1/3 animate-pulse rounded bg-gray-200" />
                                        </div>
                                    </div>
                                ))}

                            </div>

                        ) : relatedProducts.length > 0 ? (

                            <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

                                {relatedProducts.map((relatedProduct) => {
                                    const relatedId =
                                        relatedProduct.id ||
                                        relatedProduct.product_id;

                                    const relatedImage =
                                        relatedProduct.image ||
                                        relatedProduct.images?.[0]?.image ||
                                        relatedProduct.images?.[0] ||
                                        null;

                                    return (
                                        <article
                                            key={relatedId}
                                            onClick={() =>
                                                navigate(
                                                    `/product/${relatedId}`
                                                )
                                            }
                                            className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#0D1628]/90 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60"
                                        >

                                            <div className="relative aspect-square overflow-hidden bg-gray-100">

                                                {relatedImage ? (
                                                    <img
                                                        src={relatedImage}
                                                        alt={
                                                            relatedProduct.name ||
                                                            "Product"
                                                        }
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-gray-300">
                                                        <Boxes size={40} />
                                                    </div>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        navigate(
                                                            `/product/${relatedId}`
                                                        );
                                                    }}
                                                    className="absolute bottom-3 left-3 right-3 rounded-xl bg-[#0D1628]/95 py-2.5 text-xs font-bold text-gray-100 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:opacity-100"
                                                >
                                                    View Product
                                                </button>

                                            </div>

                                            <div className="p-4">

                                                <p className="truncate text-[10px] font-bold uppercase tracking-[1.5px] text-[#D58A00]">
                                                    {relatedProduct.category?.name ||
                                                        product.category?.name ||
                                                        "Product"}
                                                </p>

                                                <h3 className="mt-1.5 line-clamp-2 min-h-[40px] text-sm font-bold text-white transition group-hover:text-[#D58A00]">
                                                    {relatedProduct.name ||
                                                        "Product"}
                                                </h3>

                                                <div className="mt-3 flex items-center gap-2">
                                                    <span className="text-lg font-black text-white">
                                                        ₹
                                                        {relatedProduct.price ??
                                                            "0.00"}
                                                    </span>

                                                    {relatedProduct.old_price && (
                                                        <span className="text-xs text-gray-500 line-through">
                                                            ₹
                                                            {relatedProduct.old_price}
                                                        </span>
                                                    )}
                                                </div>

                                            </div>

                                        </article>
                                    );
                                })}

                            </div>

                        ) : (

                            <div className="mt-7 rounded-2xl border border-dashed border-white/10 bg-[#0D1628] p-8 text-center">
                                <Boxes
                                    size={32}
                                    className="mx-auto text-gray-300"
                                />
                                <p className="mt-3 text-sm font-semibold text-gray-500">
                                    No related products available right now.
                                </p>
                            </div>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
};


export default ProductDetail;