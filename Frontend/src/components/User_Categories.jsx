import React, { useEffect, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Package,
  Sparkles,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import axios from "axios";

import api_base from "../apibase";

export default function U_Categories() {
  const [categories, setCategories] = useState([]);
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  // ==========================
  // GET CATEGORIES
  // ==========================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${api_base}categories/`);

        const activeCategories = response.data.filter(
          (category) => category.status
        );

        setCategories(activeCategories);
      } catch (error) {
        console.log("Category Error:", error);
      }
    };

    fetchCategories();
  }, []);

  // ==========================
  // RESPONSIVE VISIBLE CARDS
  // ==========================

  const visibleCards = 3;

  const next = () => {
    if (categories.length <= visibleCards) {
      return;
    }

    setCurrent((prev) => {
      if (prev >= categories.length - visibleCards) {
        return 0;
      }

      return prev + 1;
    });
  };

  const prev = () => {
    if (categories.length <= visibleCards) {
      return;
    }

    setCurrent((prev) => {
      if (prev <= 0) {
        return categories.length - visibleCards;
      }

      return prev - 1;
    });
  };

  // ==========================
  // AUTO SLIDE
  // ==========================

  useEffect(() => {
    if (categories.length <= visibleCards) {
      return;
    }

    const timer = setInterval(next, 3500);

    return () => clearInterval(timer);
  }, [categories.length, current]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden py-20 md:py-24 bg-gradient-to-br from-[#071A3D] via-[#0B2B63] to-[#123E82]">
      {/* ==========================
          BACKGROUND DECORATIONS
      ========================== */}

      <div className="absolute -top-32 -left-24 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

      <div className="absolute top-1/4 -right-28 w-96 h-96 rounded-full bg-[#F5A524]/10 blur-3xl pointer-events-none" />

      <div className="absolute bottom-0 left-1/3 w-[420px] h-48 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

      <div className="absolute top-16 right-[8%] hidden lg:block w-28 h-28 border border-blue-400/20 rounded-full pointer-events-none" />

      <div className="absolute bottom-20 left-[5%] hidden lg:block w-20 h-20 border border-blue-400/20 rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5">
        {/* ==========================
            HEADING
        ========================== */}

        <div className="text-center mb-12 md:mb-14">
          <div className="inline-flex items-center gap-3">
            <span className="w-10 h-px bg-[#F5A524]/80" />

            <p className="uppercase tracking-[5px] text-[#F5A524] font-bold text-xs md:text-sm">
              Shop By Category
            </p>

            <span className="w-10 h-px bg-[#F5A524]/80" />
          </div>

          <div className="relative inline-block">
            <Sparkles
              size={20}
              className="absolute -top-1 -right-7 text-[#F5A524]"
            />

            <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white">
              Featured Categories
            </h2>
          </div>

          <p className="mt-5 text-slate-300 text-base md:text-lg leading-7 max-w-2xl mx-auto">
            Explore our latest collections and discover products that match
            your style and lifestyle.
          </p>

          {/* ==========================
              BUTTONS
          ========================== */}

          <div className="flex justify-center gap-3 mt-9">
            <button
              type="button"
              onClick={prev}
              className="w-12 h-12 rounded-full bg-[#1554D1] border border-blue-300/60 shadow-[0_0_24px_rgba(21,84,209,0.28)] flex items-center justify-center text-white hover:bg-[#F5A524] hover:text-slate-950 hover:border-[#F5A524] hover:shadow-[0_0_28px_rgba(245,165,36,0.30)] hover:-translate-y-1 transition-all duration-300"
              aria-label="Previous categories"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={next}
              className="w-12 h-12 rounded-full bg-[#1554D1] border border-blue-300/60 shadow-[0_0_24px_rgba(21,84,209,0.28)] flex items-center justify-center text-white hover:bg-[#F5A524] hover:text-slate-950 hover:border-[#F5A524] hover:shadow-[0_0_28px_rgba(245,165,36,0.30)] hover:-translate-y-1 transition-all duration-300"
              aria-label="Next categories"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {categories.length > visibleCards && (
            <div className="flex justify-center items-center gap-2 mt-5">
              {Array.from({
                length: categories.length - visibleCards + 1,
              }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrent(index)}
                  aria-label={`Go to category slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    current === index
                      ? "w-8 bg-[#F5A524] shadow-[0_0_12px_rgba(245,165,36,0.45)]"
                      : "w-2 bg-blue-300/40 hover:bg-blue-200/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ==========================
            SLIDER
        ========================== */}

        <div className="relative overflow-hidden rounded-[32px]">
          <div className="absolute -inset-8 bg-blue-500/5 blur-3xl pointer-events-none" />
          <div
            className="relative z-10 flex transition-transform duration-700 ease-out"
            style={{
              transform: `translateX(-${current * (100 / visibleCards)}%)`,
            }}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                className="shrink-0 basis-full md:basis-1/3 px-3 md:px-3.5"
              >
                <div className="h-full bg-[#071B45] rounded-[28px] overflow-hidden border border-blue-400/40 shadow-[0_18px_50px_rgba(0,0,0,0.35)] hover:-translate-y-3 hover:border-blue-300/70 hover:shadow-[0_25px_60px_rgba(0,50,150,0.35)] transition-all duration-500">

                {/* ==========================
                    IMAGE
                ========================== */}

                <div className="relative h-[230px] md:h-[245px] overflow-hidden bg-[#0A2557]"><div className="absolute inset-0 bg-gradient-to-tr from-blue-700/10 via-transparent to-cyan-300/10 pointer-events-none z-[1]" />
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="relative z-[2] w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0A2557] to-[#123D80] flex items-center justify-center">
                      <Package size={45} className="text-slate-400" />
                    </div>
                  )}

                  <div className="absolute inset-0 z-[3] bg-gradient-to-t from-slate-950/70 via-slate-950/5 to-transparent" />

                  <div className="absolute top-4 left-4 z-[4] bg-[#F5A524] text-slate-950 font-bold px-4 py-2 rounded-full text-[11px] tracking-wide shadow-lg shadow-black/25">
                    FEATURED
                  </div>
                </div>

                {/* ==========================
                    CONTENT
                ========================== */}

                <div className="p-6 md:p-7">
                  <h3 className="text-2xl md:text-[26px] font-extrabold tracking-tight text-white">
                    {category.name}
                  </h3>

                  <p className="mt-3 text-slate-300 leading-6 min-h-[48px]">
                    {category.description ||
                      `Explore our ${category.name} collection.`}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/products?category=${category.slug}`)
                    }
                    className="mt-7 w-full py-3.5 rounded-xl bg-[#1554D1] text-white font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-950/30 hover:bg-[#F5A524] hover:text-slate-950 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Shop Now
                    <ArrowRight size={18} />
                  </button>
                </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
