import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api_base from "../apibase";

export default function U_Categories() {
  const [categories, setCategories] = useState([]);
  const [current, setCurrent] = useState(0);
  const [visibleCards, setVisibleCards] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${api_base}categories/`);
        const activeCategories = response.data.filter((category) => category.status);
        setCategories(activeCategories);
      } catch (error) {
        console.log("Category Error:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const updateVisibleCards = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setVisibleCards(1);
      } else if (width < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }

      setCurrent(0);
    };

    updateVisibleCards();
    window.addEventListener("resize", updateVisibleCards);

    return () => window.removeEventListener("resize", updateVisibleCards);
  }, []);

  const maxIndex = Math.max(categories.length - visibleCards, 0);

  const next = () => {
    if (categories.length <= visibleCards) {
      return;
    }

    setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prev = () => {
    if (categories.length <= visibleCards) {
      return;
    }

    setCurrent((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  useEffect(() => {
    if (categories.length <= visibleCards) {
      return;
    }

    const timer = setInterval(() => {
      setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3500);

    return () => clearInterval(timer);
  }, [categories.length, visibleCards, maxIndex]);

  if (categories.length === 0) {
    return null;
  }

  const trackWidth = `${(categories.length / visibleCards) * 100}%`;
  const cardWidth = `${(100 / categories.length)}%`;
  const translateAmount = current * (100 / visibleCards);

  return (
    <section className="py-10 sm:py-12 md:py-20 bg-gradient-to-b from-[#23376d] to-[#314a83] overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-5">
        <div className="text-center mb-7 sm:mb-8 md:mb-10">
          <p className="uppercase tracking-[3px] sm:tracking-[4px] md:tracking-[6px] text-[#F5A524] font-semibold text-[10px] sm:text-xs md:text-sm">
            Shop By Category
          </p>

          <h2 className="mt-2 sm:mt-3 text-2xl sm:text-3xl md:text-5xl font-bold text-white">
            Featured Categories
          </h2>

          <p className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base text-gray-300 max-w-2xl mx-auto">
            Explore our latest collections.
          </p>

          <div className="flex justify-center gap-2.5 sm:gap-3 md:gap-4 mt-5 sm:mt-6 md:mt-8">
            <button
              type="button"
              onClick={prev}
              disabled={categories.length <= visibleCards}
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-[#F5A524] hover:text-black transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </button>

            <button
              type="button"
              onClick={next}
              disabled={categories.length <= visibleCards}
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-[#F5A524] hover:text-black transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-out will-change-transform"
            style={{
              width: trackWidth,
              transform: `translateX(-${translateAmount}%)`,
            }}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                style={{ width: cardWidth }}
                className="shrink-0 px-1 sm:px-1.5 md:px-3"
              >
                <div className="h-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-1 md:hover:-translate-y-2 transition duration-500">
                  <div className="relative h-[130px] xs:h-[145px] sm:h-[170px] md:h-[230px] overflow-hidden">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover hover:scale-110 transition duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Package size={38} className="text-gray-400 sm:w-10 sm:h-10 md:w-[45px] md:h-[45px]" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 md:top-4 md:left-4 bg-[#F5A524] text-black font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-4 rounded-full text-[8px] sm:text-[9px] md:text-xs">
                      FEATURED
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 md:p-6">
                    <h3 className="text-sm sm:text-base md:text-2xl font-bold text-gray-900 truncate">
                      {category.name}
                    </h3>

                    <p className="mt-1.5 sm:mt-2 md:mt-3 text-[10px] sm:text-xs md:text-base text-gray-500 line-clamp-2 min-h-[30px] sm:min-h-[34px] md:min-h-[48px]">
                      {category.description || `Explore our ${category.name} collection.`}
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate(`/products?category=${category.slug}`)}
                      className="mt-2.5 sm:mt-3 md:mt-6 w-full py-1.5 sm:py-2 md:py-3 rounded-lg md:rounded-xl bg-[#0B0F19] text-white text-[10px] sm:text-xs md:text-base font-semibold flex justify-center items-center gap-1 sm:gap-1.5 md:gap-2 hover:bg-[#F5A524] hover:text-black transition"
                    >
                      Shop Now
                      <ArrowRight size={13} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />
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
