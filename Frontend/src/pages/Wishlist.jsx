import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Heart,
    ShoppingCart,
    Trash2,
    ArrowRight,
    PackageOpen,
} from "lucide-react";

import Swal from "sweetalert2";

import Navbar from "../components/Navbar";
import api_base from "../apibase";





const Wishlist = () => {
    const navigate = useNavigate();

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const [addingCartId, setAddingCartId] = useState(null);


    // =========================================================
    // FETCH WISHLIST
    // =========================================================

    const fetchWishlist = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${api_base}wishlist/`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            // =================================================
            // LOGIN REQUIRED
            // =================================================

            if (response.status === 401) {
                Swal.fire({
                    icon: "warning",
                    title: "Login Required",
                    text: "Please login to view your wishlist.",
                    confirmButtonColor: "#F5A524",
                }).then(() => {
                    navigate("/login");
                });

                return;
            }

            // =================================================
            // ERROR
            // =================================================

            if (!response.ok) {
                throw new Error(
                    data.msg ||
                    "Unable to load wishlist."
                );
            }

            // =================================================
            // BACKEND RESPONSE
            //
            // {
            //     wishlist: [
            //         {
            //             wishlist_id: 1,
            //             product_id: 4,
            //             name: "...",
            //             price: "...",
            //             image: "...",
            //             stock: 10
            //         }
            //     ]
            // }
            // =================================================

            setWishlist(
                Array.isArray(data.wishlist)
                    ? data.wishlist
                    : []
            );

        } catch (error) {
            console.error(
                "Wishlist Error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Unable to Load Wishlist",
                text:
                    error.message ||
                    "Something went wrong.",
            });

        } finally {
            setLoading(false);
        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        fetchWishlist();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // =========================================================
    // REMOVE FROM WISHLIST
    // =========================================================

    const removeFromWishlist = async (
        productId
    ) => {
        if (!productId) {
            return;
        }

        if (removingId) {
            return;
        }

        setRemovingId(productId);

        try {
            const response = await fetch(
                `${api_base}wishlist/${productId}/remove/`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            // =================================================
            // LOGIN REQUIRED
            // =================================================

            if (response.status === 401) {
                Swal.fire({
                    icon: "warning",
                    title: "Login Required",
                    text: "Please login first.",
                    confirmButtonColor: "#F5A524",
                }).then(() => {
                    navigate("/login");
                });

                return;
            }

            // =================================================
            // ERROR
            // =================================================

            if (!response.ok) {
                throw new Error(
                    data.msg ||
                    "Unable to remove product."
                );
            }

            // =================================================
            // UPDATE UI
            // =================================================

            setWishlist((previousWishlist) =>
                previousWishlist.filter(
                    (item) =>
                        Number(item.product_id) !==
                        Number(productId)
                )
            );

            // =================================================
            // CART / NAVBAR UPDATE EVENT
            // =================================================

            window.dispatchEvent(
                new CustomEvent(
                    "wishlistUpdated"
                )
            );

            // =================================================
            // SUCCESS
            // =================================================

            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Removed from wishlist",
                showConfirmButton: false,
                timer: 1500,
            });

        } catch (error) {
            console.error(
                "Remove Wishlist Error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Unable to Remove",
                text:
                    error.message ||
                    "Something went wrong.",
            });

        } finally {
            setRemovingId(null);
        }
    };


    // =========================================================
    // ADD TO CART
    // =========================================================

    const addToCart = async (
        item
    ) => {
        const productId =
            item.product_id;

        // =================================================
        // PRODUCT ID CHECK
        // =================================================

        if (!productId) {
            Swal.fire({
                icon: "error",
                title: "Unable to Add",
                text: "Product ID is missing.",
            });

            return;
        }

        if (addingCartId) {
            return;
        }

        setAddingCartId(productId);

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
                            productId,
                    }),
                }
            );

            const data =
                await response.json();

            // =================================================
            // LOGIN REQUIRED
            // =================================================

            if (response.status === 401) {
                Swal.fire({
                    icon: "warning",
                    title: "Login Required",
                    text: "Please login first to add products to cart.",
                    confirmButtonColor: "#F5A524",
                }).then(() => {
                    navigate("/login");
                });

                return;
            }

            // =================================================
            // ERROR
            // =================================================

            if (!response.ok) {
                Swal.fire({
                    icon: "warning",
                    title: "Unable to Add",
                    text:
                        data.msg ||
                        "Something went wrong.",
                });

                return;
            }

            // =================================================
            // UPDATE NAVBAR CART
            // =================================================

            window.dispatchEvent(
                new CustomEvent(
                    "cartUpdated"
                )
            );

            // =================================================
            // SUCCESS
            // =================================================

            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Added to Cart",
                text: `${item.name} added successfully.`,
                showConfirmButton: false,
                timer: 1700,
            });

        } catch (error) {
            console.error(
                "Add To Cart Error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Something went wrong",
                text: "Unable to add product to cart.",
            });

        } finally {
            setAddingCartId(null);
        }
    };


    // =========================================================
    // IMAGE FALLBACK
    // =========================================================

    const handleImageError = (
        event
    ) => {
        event.currentTarget.style.display =
            "none";

        event.currentTarget.parentElement.classList.add(
            "flex",
            "items-center",
            "justify-center"
        );

        const fallback =
            document.createElement(
                "div"
            );

        fallback.innerHTML =
            `<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m3 16 5-5c.94-.94 2.06-.94 3 0l5 5"/><path d="m14 14 1-1c.94-.94 2.06-.94 3 0l3 3"/></svg>`;

        fallback.className =
            "text-gray-600";

        event.currentTarget.parentElement.appendChild(
            fallback
        );
    };


    // =========================================================
    // LOADING SCREEN
    // =========================================================

    if (loading) {
        return (
            <div className="relative min-h-screen overflow-hidden bg-[#060B18]">

                <div className="h-[74px] w-full shrink-0" aria-hidden="true" />
                <div className="fixed left-0 top-0 z-[100] w-full border-b border-white/10 bg-gradient-to-r from-[#080D18]/98 via-[#0B1424]/96 to-[#0A1220]/98 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                    <Navbar />
                </div>

                <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">

                    <div className="animate-pulse">

                        <div className="h-8 w-52 rounded-lg bg-white/10" />

                        <div className="mt-3 h-4 w-72 rounded bg-white/10" />

                    </div>


                    <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {[1, 2, 3, 4].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D1628]/90"
                                >

                                    <div className="aspect-square animate-pulse bg-white/10" />

                                    <div className="space-y-3 p-5">

                                        <div className="h-3 w-24 rounded bg-white/10" />

                                        <div className="h-5 w-40 rounded bg-white/10" />

                                        <div className="h-6 w-28 rounded bg-white/10" />

                                        <div className="h-10 rounded-xl bg-white/10" />

                                    </div>

                                </div>
                            )
                        )}

                    </div>

                </main>

            </div>
        );
    }


    // =========================================================
    // EMPTY WISHLIST
    // =========================================================

    if (wishlist.length === 0) {
        return (
            <div className="min-h-screen bg-[#060B18]">

                <div className="h-[74px] w-full shrink-0" aria-hidden="true" />
                <div className="fixed left-0 top-0 z-[100] w-full border-b border-white/10 bg-gradient-to-r from-[#080D18]/98 via-[#0B1424]/96 to-[#0A1220]/98 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                    <Navbar />
                </div>

                <main className="flex min-h-[75vh] items-center justify-center px-5 py-16">

                    <div className="w-full max-w-lg text-center">

                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 shadow-[0_0_35px_rgba(239,68,68,0.08)]">

                            <PackageOpen
                                size={44}
                                className="text-red-400"
                            />

                        </div>


                        <h1 className="mt-7 text-3xl font-black text-white sm:text-4xl">
                            Your Wishlist is Empty
                        </h1>


                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500 sm:text-base">
                            Save your favorite products
                            here and come back whenever
                            you are ready to shop.
                        </p>


                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/products"
                                )
                            }
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#F5A524] px-6 py-3.5 text-sm font-bold text-black transition-all duration-300 hover:bg-[#FFB84D] hover:shadow-lg hover:shadow-[#F5A524]/20"
                        >
                            Continue Shopping

                            <ArrowRight
                                size={18}
                            />

                        </button>

                    </div>

                </main>

            </div>
        );
    }


    // =========================================================
    // MAIN WISHLIST
    // =========================================================

    return (
        <div className="min-h-screen bg-[#060B18] text-[#111827]">

            <Navbar />


            <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">


                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                    <div>

                        <div className="flex items-center gap-2">

                            <Heart
                                size={22}
                                className="text-red-400"
                                fill="currentColor"
                            />

                            <p className="text-xs font-bold uppercase tracking-[3px] text-[#F5A524]">
                                My Collection
                            </p>

                        </div>


                        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                            My Wishlist
                        </h1>


                        <p className="mt-2 text-sm text-gray-500">
                            {wishlist.length}{" "}
                            {wishlist.length === 1
                                ? "product"
                                : "products"}{" "}
                            saved for later.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/products"
                            )
                        }
                        className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-[#111C31]/90 px-5 py-3 text-sm font-bold text-gray-600 transition-all duration-300 hover:border-[#F5A524] hover:text-[#F5A524]"
                    >
                        Continue Shopping

                        <ArrowRight
                            size={17}
                        />

                    </button>

                </div>


                {/* =================================================
                    WISHLIST PRODUCTS
                ================================================= */}

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                    {wishlist.map(
                        (item) => {

                            // =================================================
                            // IMPORTANT
                            //
                            // Backend returns:
                            //
                            // item.product_id
                            // item.name
                            // item.price
                            // item.old_price
                            // item.image
                            // item.stock
                            //
                            // There is NO item.product object.
                            // =================================================

                            const productId =
                                item.product_id;


                            return (
                                <article
                                    key={
                                        item.wishlist_id ||
                                        productId
                                    }
                                    className="group overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#0D1628]/90 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60"
                                >


                                    {/* =================================================
                                        PRODUCT IMAGE
                                    ================================================= */}

                                    <div
                                        className="relative aspect-square cursor-pointer overflow-hidden bg-[#080F1C]"
                                        onClick={() =>
                                            navigate(
                                                `/product/${productId}`
                                            )
                                        }
                                    >

                                        {item.image ? (

                                            <img
                                                src={
                                                    item.image
                                                }
                                                alt={
                                                    item.name ||
                                                    "Product"
                                                }
                                                onError={
                                                    handleImageError
                                                }
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />

                                        ) : (

                                            <div className="flex h-full w-full items-center justify-center text-gray-600">

                                                <PackageOpen
                                                    size={
                                                        48
                                                    }
                                                />

                                            </div>

                                        )}


                                        {/* =================================================
                                            REMOVE ICON
                                        ================================================= */}

                                        <button
                                            type="button"
                                            onClick={(
                                                event
                                            ) => {
                                                event.stopPropagation();

                                                removeFromWishlist(
                                                    productId
                                                );
                                            }}
                                            disabled={
                                                removingId ===
                                                productId
                                            }
                                            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#111C31]/95 text-red-400 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-red-500/100/100 hover:text-white disabled:cursor-wait disabled:opacity-60"
                                            title="Remove from wishlist"
                                        >

                                            {removingId ===
                                            productId ? (

                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />

                                            ) : (

                                                <Trash2
                                                    size={
                                                        17
                                                    }
                                                />

                                            )}

                                        </button>

                                    </div>


                                    {/* =================================================
                                        PRODUCT CONTENT
                                    ================================================= */}

                                    <div className="p-5">


                                        {/* CATEGORY */}

                                        <p className="truncate text-[10px] font-bold uppercase tracking-[1.5px] text-[#F5A524]">

                                            {item.category?.name ||
                                                "Product"}

                                        </p>


                                        {/* PRODUCT NAME */}

                                        <h2
                                            onClick={() =>
                                                navigate(
                                                    `/product/${productId}`
                                                )
                                            }
                                            className="mt-1.5 min-h-[42px] cursor-pointer line-clamp-2 text-base font-bold text-white transition-colors duration-200 hover:text-[#F5A524]"
                                        >

                                            {
                                                item.name
                                            }

                                        </h2>


                                        {/* =================================================
                                            PRICE
                                        ================================================= */}

                                        <div className="mt-3 flex items-center gap-2">

                                            <span className="text-xl font-black text-white">

                                                ₹
                                                {
                                                    item.price
                                                }

                                            </span>


                                            {item.old_price && (

                                                <span className="text-xs font-medium text-gray-500 line-through">

                                                    ₹
                                                    {
                                                        item.old_price
                                                    }

                                                </span>

                                            )}

                                        </div>


                                        {/* =================================================
                                            STOCK
                                        ================================================= */}

                                        <div className="mt-3">

                                            {Number(
                                                item.stock ||
                                                0
                                            ) > 0 ? (

                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">

                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/100" />

                                                    In Stock

                                                </span>

                                            ) : (

                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400">

                                                    <span className="h-1.5 w-1.5 rounded-full border border-red-400/20 bg-red-500/10 shadow-[0_0_35px_rgba(239,68,68,0.08)]0" />

                                                    Out of Stock

                                                </span>

                                            )}

                                        </div>


                                        {/* =================================================
                                            ACTION BUTTONS
                                        ================================================= */}

                                        <div className="mt-4 grid grid-cols-2 gap-2">


                                            {/* VIEW PRODUCT */}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/product/${productId}`
                                                    )
                                                }
                                                className="rounded-xl border border-white/10 bg-[#111C31]/90 px-2 py-2.5 text-xs font-bold text-gray-600 transition-all duration-300 hover:border-[#F5A524] hover:text-[#F5A524]"
                                            >
                                                View Product
                                            </button>


                                            {/* ADD TO CART */}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    addToCart(
                                                        item
                                                    )
                                                }
                                                disabled={
                                                    Number(
                                                        item.stock ||
                                                        0
                                                    ) <=
                                                        0 ||
                                                    addingCartId ===
                                                        productId
                                                }
                                                className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-bold transition-all duration-300 ${
                                                    Number(
                                                        item.stock ||
                                                        0
                                                    ) <=
                                                    0
                                                        ? "cursor-not-allowed bg-[#0A1220] text-gray-500"
                                                        : "bg-[#0B1220] text-white hover:bg-[#F5A524] hover:text-black"
                                                }`}
                                            >

                                                {addingCartId ===
                                                productId ? (

                                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                                                ) : (

                                                    <ShoppingCart
                                                        size={
                                                            15
                                                        }
                                                    />

                                                )}

                                                {addingCartId ===
                                                productId
                                                    ? "Adding..."
                                                    : "Add to Cart"}

                                            </button>

                                        </div>


                                        {/* =================================================
                                            REMOVE BUTTON
                                        ================================================= */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeFromWishlist(
                                                    productId
                                                )
                                            }
                                            disabled={
                                                removingId ===
                                                productId
                                            }
                                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-red-400 transition-all duration-300 hover:bg-red-500/100/10 disabled:cursor-wait disabled:opacity-60"
                                        >

                                            <Trash2
                                                size={14}
                                            />

                                            {removingId ===
                                            productId
                                                ? "Removing..."
                                                : "Remove from Wishlist"}

                                        </button>

                                    </div>

                                </article>
                            );
                        }
                    )}

                </div>

            </main>

        </div>
    );
};


export default Wishlist;