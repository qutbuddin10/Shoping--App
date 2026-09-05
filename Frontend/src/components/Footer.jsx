import React from "react";

import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Star, CreditCard } from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#060B18] via-[#0A1834] to-[#0B2A5B] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2196FF]/60 to-transparent" />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-32 bg-[#2196FF]/[0.05] blur-3xl" />

      {/* Background Glow */}
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-[#F5A524]/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-[#2196FF]/10 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6 py-20">

        {/* ================= Footer Main ================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* ================= Company ================= */}

          <div className="lg:col-span-2">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5A524] to-[#FFBE4D] flex items-center justify-center shadow-[0_10px_30px_rgba(245,165,36,0.22)] ring-1 ring-[#FFD06A]/20">

                <ShoppingBag size={24} className="text-black" />

              </div>

              <h2 className="text-3xl font-black tracking-tight text-white">

                Shop<span className="text-[#F5A524]">Nest</span>

              </h2>

            </div>

            <p className="mt-6 text-slate-300 leading-7 max-w-md">

              ShopNest is your premium online shopping destination.
              Discover the latest fashion, electronics, footwear,
              furniture and lifestyle products with trusted quality,
              secure payments and fast delivery.

            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.10] text-xs font-semibold text-slate-300 shadow-inner shadow-white/[0.02] backdrop-blur-md">Trusted Shopping</span>
              <span className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.10] text-xs font-semibold text-slate-300 shadow-inner shadow-white/[0.02] backdrop-blur-md">Secure Checkout</span>
            </div>

            {/* Social Icons */}

            <div className="flex items-center gap-4 mt-8">

              <a
                href="#"
                className="w-12 h-12 rounded-full bg-white/[0.045] border border-white/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] flex items-center justify-center text-slate-300 backdrop-blur-md hover:bg-[#1877F2] duration-300"
              >
                <FaFacebookF size={20} />
              </a>

              <a
                href="#"
                className="w-12 h-12 rounded-full bg-white/[0.045] border border-white/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] flex items-center justify-center text-slate-300 backdrop-blur-md hover:bg-gradient-to-r hover:from-pink-500 hover:to-orange-500 duration-300"
              >
                <FaInstagram size={20} />
              </a>

              <a
                href="#"
                className="w-12 h-12 rounded-full bg-white/[0.045] border border-white/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] flex items-center justify-center text-slate-300 backdrop-blur-md hover:bg-sky-500 duration-300"
              >
                <FaTwitter size={20} />

              </a>

              <a
                href="#"
                className="w-12 h-12 rounded-full bg-white/[0.045] border border-white/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] flex items-center justify-center text-slate-300 backdrop-blur-md hover:bg-red-600 duration-300"
              >
                <FaYoutube size={20} />
              </a>

            </div>

          </div>

                    {/* ================= Quick Links ================= */}

          <div>

            <h3 className="text-lg font-bold mb-6 text-white">
              Quick Links
            </h3>

            <ul className="space-y-4">

              {[
                "Home",
                "Shop",
                "Categories",
                "Deals",
                "About Us",
                "Contact Us",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-[#F5A524] hover:translate-x-2 inline-block transition-all duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}

            </ul>

          </div>

          {/* ================= Categories ================= */}

          <div>

            <h3 className="text-lg font-bold mb-6 text-white">
              Categories
            </h3>

            <ul className="space-y-4">

              {[
                "Fashion",
                "Electronics",
                "Footwear",
                "Furniture",
                "Gaming",
                "Beauty",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-[#F5A524] hover:translate-x-2 inline-block transition-all duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}

            </ul>

          </div>

          {/* ================= Customer Care ================= */}

          <div>

            <h3 className="text-lg font-bold mb-6 text-white">
              Customer Care
            </h3>

            <ul className="space-y-4">

              {[
                "My Account",
                "Track Order",
                "Shipping",
                "Returns",
                "Privacy Policy",
                "Terms & Conditions",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-[#F5A524] hover:translate-x-2 inline-block transition-all duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}

            </ul>

          </div>

        </div>

                {/* ================= Divider ================= */}

        <div className="my-14 border-t border-white/[0.09]"></div>

        {/* ================= Trust Badges ================= */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          <div className="bg-white/[0.045] backdrop-blur-xl rounded-2xl border border-white/[0.09] p-6 text-center shadow-[0_14px_45px_rgba(0,0,0,0.20)] hover:shadow-[0_20px_55px_rgba(0,0,0,0.30)] hover:border-[#F5A524]/50 hover:-translate-y-2 transition-all duration-300">
            <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-[#F5A524]/10 text-[#F5A524] flex items-center justify-center"><Truck size={24} /></div>
            <h4 className="font-bold text-lg text-white">Free Shipping</h4>
            <p className="text-slate-400 text-sm mt-2">
              Free delivery on all orders over ₹999.
            </p>
          </div>

          <div className="bg-white/[0.045] backdrop-blur-xl rounded-2xl border border-white/[0.09] p-6 text-center shadow-[0_14px_45px_rgba(0,0,0,0.20)] hover:shadow-[0_20px_55px_rgba(0,0,0,0.30)] hover:border-[#F5A524]/50 hover:-translate-y-2 transition-all duration-300">
            <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-[#2196FF]/10 text-[#55B0FF] flex items-center justify-center"><ShieldCheck size={24} /></div>
            <h4 className="font-bold text-lg text-white">Secure Payment</h4>
            <p className="text-slate-400 text-sm mt-2">
              100% safe and encrypted payment gateway.
            </p>
          </div>

          <div className="bg-white/[0.045] backdrop-blur-xl rounded-2xl border border-white/[0.09] p-6 text-center shadow-[0_14px_45px_rgba(0,0,0,0.20)] hover:shadow-[0_20px_55px_rgba(0,0,0,0.30)] hover:border-[#F5A524]/50 hover:-translate-y-2 transition-all duration-300">
            <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-emerald-400/10 text-emerald-300 flex items-center justify-center"><RotateCcw size={24} /></div>
            <h4 className="font-bold text-lg text-white">Easy Returns</h4>
            <p className="text-slate-400 text-sm mt-2">
              Hassle-free returns within 7 days.
            </p>
          </div>

          <div className="bg-white/[0.045] backdrop-blur-xl rounded-2xl border border-white/[0.09] p-6 text-center shadow-[0_14px_45px_rgba(0,0,0,0.20)] hover:shadow-[0_20px_55px_rgba(0,0,0,0.30)] hover:border-[#F5A524]/50 hover:-translate-y-2 transition-all duration-300">
            <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-300 flex items-center justify-center"><Star size={24} /></div>
            <h4 className="font-bold text-lg text-white">Premium Quality</h4>
            <p className="text-slate-400 text-sm mt-2">
              Carefully selected premium products.
            </p>
          </div>

        </div>

        {/* ================= Payment Methods ================= */}

        <div className="mt-16 flex flex-col items-center">

          <h3 className="text-2xl font-bold mb-8 text-white">
            Secure Payment Methods
          </h3>

          <div className="flex flex-wrap justify-center gap-5">

            {[
              "Visa",
              "MasterCard",
              "PayPal",
              "UPI",
              "Google Pay",
              "Apple Pay",
            ].map((item) => (
              <div
                key={item}
                className="px-6 py-3 rounded-xl bg-white/[0.045] border border-white/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] text-slate-200 font-semibold backdrop-blur-md hover:-translate-y-1 hover:border-[#F5A524]/70 hover:bg-[#F5A524]/[0.06] hover:shadow-[0_12px_30px_rgba(245,165,36,0.10)] transition duration-300"
              >
                {item}
              </div>
            ))}

          </div>

        </div>

        {/* ================= Bottom Footer ================= */}

        <div className="mt-16 border-t border-white/[0.09] pt-8 flex flex-col md:flex-row justify-between items-center gap-5">

          <p className="text-slate-400 text-center md:text-left">
            © 2026 <span className="text-[#F5A524] font-semibold">ShopNest</span>.
            All Rights Reserved.
          </p>

          <div className="flex gap-6 text-slate-400 text-sm">

            <a href="#" className="hover:text-[#F5A524] transition">
              Privacy Policy
            </a>

            <a href="#" className="hover:text-[#F5A524] transition">
              Terms
            </a>

            <a href="#" className="hover:text-[#F5A524] transition">
              Cookies
            </a>

          </div>

        </div>

      </div>
    </footer>
  );
}