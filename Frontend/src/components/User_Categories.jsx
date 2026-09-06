import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Package
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api_base from "../apibase";


export default function U_Categories() {

  const [categories, setCategories] = useState([]);
  const [current, setCurrent] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);

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
  // 1 card  -> phones   (<640px)
  // 2 cards -> tablets  (640px - 1023px)
  // 3 cards -> desktop  (>=1024px)
  // ==========================

  useEffect(() => {

    const updateVisibleCards = () => {

      const width = window.innerWidth;

      if (width < 640) {
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


  // Keep `current` inside valid bounds whenever the data or the
  // number of visible cards changes (e.g. category count updated,
  // or the viewport crossed a breakpoint).
  useEffect(() => {

    const maxIndex = Math.max(categories.length - visibleCards, 0);

    setCurrent((prev) => Math.min(prev, maxIndex));

  }, [categories.length, visibleCards]);


  const next = () => {

    setCurrent((prev) => {

      const maxIndex = categories.length - visibleCards;

      if (maxIndex <= 0) return 0;

      return prev >= maxIndex ? 0 : prev + 1;

    });

  };


  const prev = () => {

    setCurrent((prev) => {

      const maxIndex = categories.length - visibleCards;

      if (maxIndex <= 0) return 0;

      return prev <= 0 ? maxIndex : prev - 1;

    });

  };


  // ==========================
  // AUTO SLIDE
  // ==========================

  useEffect(() => {

    if (categories.length <= visibleCards) return;

    const timer = setInterval(next, 3500);

    return () => clearInterval(timer);

  }, [categories.length, visibleCards]);


  if (categories.length === 0) {
    return null;
  }

  const canSlide = categories.length > visibleCards;

  // Every card takes an equal share of the track: 100 / visibleCards.
  // The track is translated in the SAME units, so one click always
  // moves exactly one full card - no matter the screen size or
  // how many categories exist.
  const cardWidthPercent = 100 / visibleCards;


  return (

    <section className="py-14 sm:py-20 bg-gradient-to-b from-[#23376d] to-[#314a83] overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-5">

        {/* HEADING */}

        <div className="text-center mb-8 sm:mb-10">

          <p className="uppercase tracking-[4px] sm:tracking-[6px] text-[#F5A524] font-semibold text-xs sm:text-sm">
            Shop By Category
          </p>

          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Featured Categories
          </h2>

          <p className="mt-3 sm:mt-4 text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
            Explore our latest collections.
          </p>

          {/* BUTTONS */}

          {canSlide && (

            <div className="flex justify-center gap-4 mt-6 sm:mt-8">

              <button
                onClick={prev}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-[#F5A524] hover:text-black transition"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                onClick={next}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-[#F5A524] hover:text-black transition"
              >
                <ChevronRight size={22} />
              </button>

            </div>

          )}

        </div>


        {/* SLIDER */}

        <div className="overflow-hidden">

          <div
            className="flex transition-transform duration-700 ease-out"
            style={{
              transform: `translateX(-${current * cardWidthPercent}%)`,
            }}
          >

            {categories.map((category) => (

              <div
                key={category.id}
                className="shrink-0 px-1.5 sm:px-2 lg:px-3"
                style={{ width: `${cardWidthPercent}%` }}
              >

                <div className="h-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-2 transition duration-500">

                  {/* IMAGE */}

                  <div className="relative h-[140px] sm:h-[175px] md:h-[230px] overflow-hidden">

                    {category.image ? (

                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover hover:scale-110 transition duration-700"
                      />

                    ) : (

                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Package size={40} className="text-gray-400" />
                      </div>

                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#F5A524] text-black font-semibold px-3 py-1 sm:px-4 rounded-full text-[10px] sm:text-xs">
                      FEATURED
                    </div>

                  </div>

                  {/* CONTENT */}

                  <div className="p-3 sm:p-4 md:p-6">

                    <h3 className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900 truncate">
                      {category.name}
                    </h3>

                    <p className="mt-2 md:mt-3 text-xs sm:text-sm md:text-base text-gray-500 line-clamp-2">
                      {category.description || `Explore our ${category.name} collection.`}
                    </p>

                    <button
                      onClick={() => navigate(`/products?category=${category.slug}`)}
                      className="mt-3 md:mt-6 w-full py-2 sm:py-2.5 md:py-3 rounded-lg md:rounded-xl bg-[#0B0F19] text-white text-xs sm:text-sm md:text-base font-semibold flex justify-center items-center gap-1.5 md:gap-2 hover:bg-[#F5A524] hover:text-black transition"
                    >
                      Shop Now
                      <ArrowRight size={16} />
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