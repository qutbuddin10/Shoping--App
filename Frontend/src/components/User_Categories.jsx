// import React, { useState, useEffect } from "react";
// import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

// // ================= Images =================

// import mobile from "../assets/hero/categories/mobile.jpg";
// import laptop from "../assets/hero/categories/laptop.jpg";
// import fashion from "../assets/hero/categories/fashion.jpg";
// import shoes from "../assets/hero/categories/shoes.jpg";
// import watch from "../assets/hero/categories/watch.jpg";
// import furniture from "../assets/hero/categories/furniture.jpg";
// import gaming from "../assets/hero/categories/gaming.jpg";
// import beauty from "../assets/hero/categories/beauty.jpg";

// // ================= Categories =================

// const categories = [
//   {
//     id: 1,
//     title: "Smartphones",
//     subtitle: "UP TO 50% OFF",
//     desc: "Latest flagship smartphones with exclusive launch offers.",
//     image: mobile,
//     button: "Shop Now",
//   },

//   {
//     id: 2,
//     title: "Laptops",
//     subtitle: "BEST DEALS",
//     desc: "Powerful laptops for work, gaming and creativity.",
//     image: laptop,
//     button: "Shop Now",
//   },

//   {
//     id: 3,
//     title: "Fashion",
//     subtitle: "NEW ARRIVALS",
//     desc: "Trending fashion collection for men and women.",
//     image: fashion,
//     button: "Shop Now",
//   },

//   {
//     id: 4,
//     title: "Shoes",
//     subtitle: "STARTING ₹499",
//     desc: "Premium sneakers and sports shoes for every occasion.",
//     image: shoes,
//     button: "Shop Now",
//   },

//   {
//     id: 5,
//     title: "Luxury Watches",
//     subtitle: "PREMIUM",
//     desc: "Luxury watches crafted with timeless elegance.",
//     image: watch,
//     button: "Shop Now",
//   },

//   {
//     id: 6,
//     title: "Furniture",
//     subtitle: "NEW COLLECTION",
//     desc: "Modern furniture for your dream home.",
//     image: furniture,
//     button: "Shop Now",
//   },

//   {
//     id: 7,
//     title: "Gaming",
//     subtitle: "TOP SELLING",
//     desc: "Gaming accessories for an immersive experience.",
//     image: gaming,
//     button: "Shop Now",
//   },

//   {
//     id: 8,
//     title: "Beauty",
//     subtitle: "BUY 1 GET 1",
//     desc: "Beauty essentials with exciting offers.",
//     image: beauty,
//     button: "Shop Now",
//   },
// ];

// // ================= React Logic =================

// export default function U_Categories() {
//   const [current, setCurrent] = useState(0);

//   // Desktop માં એક સાથે 3 Cards દેખાશે
//   const visibleCards = 3;

//   // Next Button
//   const next = () => {
//     if (current < categories.length - visibleCards) {
//       setCurrent(current + 1);
//     } else {
//       setCurrent(0);
//     }
//   };

//   // Previous Button
//   const prev = () => {
//     if (current > 0) {
//       setCurrent(current - 1);
//     } else {
//       setCurrent(categories.length - visibleCards);
//     }
//   };

//   // Auto Slide
//   useEffect(() => {
//     const slider = setInterval(() => {
//       next();
//     }, 3500);

//     return () => clearInterval(slider);
//   }, [current]);

//   return (
//     <section className="py-20 bg-gradient-to-b from-[#23376d] to-[#314a83] overflow-hidden">

//   <div className="max-w-7xl mx-auto px-5">

//     {/* Heading */}
//     <div className="text-center mb-10">

//       <p className="uppercase tracking-[8px] text-[#F5A524] font-semibold text-sm">
//         Shop By Category
//       </p>

//       <h2 className="mt-3 text-5xl font-bold text-white">
//         Featured Categories
//       </h2>

//       <p className="mt-4 text-gray-300 max-w-2xl mx-auto text-lg">
//         Explore premium collections carefully selected for your lifestyle.
//       </p>

//       {/* Buttons */}
//       <div className="flex justify-center gap-5 mt-8">

//         <button
//           onClick={prev}
//           className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-[#F5A524] hover:text-black duration-300"
//         >
//           <ChevronLeft size={26} />
//         </button>

//         <button
//           onClick={next}
//           className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-[#F5A524] hover:text-black duration-300"
//         >
//           <ChevronRight size={26} />
//         </button>

//       </div>

//     </div>

//     {/* Slider */}
//     <div className="overflow-hidden">

//       <div
//         className="flex gap-8 transition-all duration-700"
//         style={{
//           transform: `translateX(-${current * 348}px)`,
//         }}
//       >        {categories.map((item) => (
//           <div
//             key={item.id}
//             className="min-w-[320px] md:min-w-[330px] bg-white rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-2 duration-500"
//           >
//             {/* Image */}
//             <div className="relative h-[250px] overflow-hidden">

//               <img
//                 src={item.image}
//                 alt={item.title}
//                 className="w-full h-full object-cover hover:scale-110 duration-700"
//               />

//               {/* Badge */}
//               <div className="absolute top-4 left-4 bg-[#F5A524] text-black font-semibold px-4 py-1 rounded-full text-xs">
//                 {item.subtitle}
//               </div>

//             </div>

//             {/* Content */}
//             <div className="p-6">

//               <h3 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900">
//                 {item.title}
//               </h3>

//               <p className="mt-3 text-gray-500 leading-relaxed">
//                 {item.desc}
//               </p>

//               <button
//                 className="mt-6 w-full py-3 rounded-xl bg-[#0B0F19] text-white font-semibold flex justify-center items-center gap-2 hover:bg-[#F5A524] hover:text-black duration-300"
//               >
//                 {item.button}
//                 <ArrowRight size={18} />
//               </button>

//             </div>

//           </div>
//         ))}

//       </div>
//     </div>

//   </div>

// </section>

//   );
// }


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
      setVisibleCards(window.innerWidth < 1024 ? 2 : 3);
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
              width: `${(categories.length / visibleCards) * 100}%`,
              transform: `translateX(-${
                current * (100 / categories.length)
              }%)`,
            }}
          >

            {categories.map(
              (category) => (

                <div
                  key={category.id}
                  className="shrink-0 w-1/2 px-1.5 sm:px-2 lg:w-1/3 lg:px-3 bg-transparent"
                >
                  <div className="h-full bg-white rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-2 transition duration-500">

                    {/* IMAGE */}

                  <div className="relative h-[145px] sm:h-[175px] md:h-[230px] overflow-hidden">

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

                  <div className="p-3 sm:p-4 md:p-6">

                    <h3 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900">

                      {category.name}

                    </h3>


                    <p className="mt-2 md:mt-3 text-xs sm:text-sm md:text-base text-gray-500 line-clamp-2">

                      {category.description ||
                        `Explore our ${category.name} collection.`}

                    </p>


                    <button
                      onClick={() =>
                        navigate(
                          `/products?category=${category.slug}`
                        )
                      }
                      className="mt-3 md:mt-6 w-full py-2 sm:py-2.5 md:py-3 rounded-lg md:rounded-xl bg-[#0B0F19] text-white text-xs sm:text-sm md:text-base font-semibold flex justify-center items-center gap-1.5 md:gap-2 hover:bg-[#F5A524] hover:text-black transition"
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