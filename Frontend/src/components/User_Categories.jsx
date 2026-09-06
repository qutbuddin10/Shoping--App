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

        const response = await axios.get(
          `${api_base}categories/`
        );

        const activeCategories =
          response.data.filter(
            (category) => category.status
          );

        setCategories(activeCategories);

      } catch (error) {

        console.log(
          "Category Error:",
          error
        );

      }

    };

    fetchCategories();

  }, []);


  // ==========================
  // RESPONSIVE VISIBLE CARDS
  // ==========================

  useEffect(() => {
    const updateVisibleCards = () => {
      setVisibleCards(window.innerWidth < 768 ? 2 : 3);
      setCurrent(0);
    };

    updateVisibleCards();
    window.addEventListener("resize", updateVisibleCards);

    return () =>
      window.removeEventListener("resize", updateVisibleCards);
  }, []);


  const next = () => {

    if (categories.length <= visibleCards) {
      return;
    }

    setCurrent((prev) => {

      if (
        prev >=
        categories.length - visibleCards
      ) {
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

        return (
          categories.length -
          visibleCards
        );

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

    const timer = setInterval(
      next,
      3500
    );

    return () =>
      clearInterval(timer);

  }, [categories.length, current, visibleCards]);


  if (categories.length === 0) {

    return null;

  }


  return (

    <section className="py-20 bg-gradient-to-b from-[#23376d] to-[#314a83] overflow-hidden">

      <div className="max-w-7xl mx-auto px-5">


        {/* HEADING */}

        <div className="text-center mb-10">

          <p className="uppercase tracking-[6px] text-[#F5A524] font-semibold text-sm">

            Shop By Category

          </p>


          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-white">

            Featured Categories

          </h2>


          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">

            Explore our latest collections.

          </p>


          {/* BUTTONS */}

          <div className="flex justify-center gap-4 mt-8">

            <button
              onClick={prev}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-[#F5A524] hover:text-black transition"
            >

              <ChevronLeft size={24} />

            </button>


            <button
              onClick={next}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-[#F5A524] hover:text-black transition"
            >

              <ChevronRight size={24} />

            </button>

          </div>

        </div>


        {/* SLIDER */}

        <div className="overflow-hidden">

          <div
            className="flex transition-transform duration-700 ease-out"
            style={{
              transform: `translateX(-${
                current * (100 / visibleCards)
              }%)`,
            }}
          >

            {categories.map(
              (category) => (

                <div
                  key={category.id}
                  className="shrink-0 basis-1/2 px-2 md:basis-1/3 md:px-3 bg-transparent"
                >
                  <div className="h-full bg-white rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-2 transition duration-500">

                    {/* IMAGE */}

                  <div className="relative h-[190px] sm:h-[220px] md:h-[230px] overflow-hidden">

                    {category.image ? (

                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover hover:scale-110 transition duration-700"
                      />

                    ) : (

                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">

                        <Package
                          size={45}
                          className="text-gray-400"
                        />

                      </div>

                    )}


                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />


                    <div className="absolute top-4 left-4 bg-[#F5A524] text-black font-semibold px-4 py-1 rounded-full text-xs">

                      FEATURED

                    </div>

                  </div>


                  {/* CONTENT */}

                  <div className="p-4 sm:p-5 md:p-6">

                    <h3 className="text-2xl font-bold text-gray-900">

                      {category.name}

                    </h3>


                    <p className="mt-3 text-gray-500">

                      {category.description ||
                        `Explore our ${category.name} collection.`}

                    </p>


                    <button
                      onClick={() =>
                        navigate(
                          `/products?category=${category.slug}`
                        )
                      }
                      className="mt-6 w-full py-3 rounded-xl bg-[#0B0F19] text-white font-semibold flex justify-center items-center gap-2 hover:bg-[#F5A524] hover:text-black transition"
                    >

                      Shop Now

                      <ArrowRight size={18} />

                    </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </div>

    </section>

  );
}