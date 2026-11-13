import FAQSection from "../../../FAQSection";
import FeaturesSection from "../../../FeaturesSection";
import React from "react";
import "./HomePage.css";
import MultipleItemsCarousel from "../../components/MultiItemCarousel/MultiItemCarousel";
import RestaurantCard from "../../components/RestarentCard/RestaurantCard";
import { useSelector } from "react-redux";

const HomePage = () => {
  const { restaurant } = useSelector((store) => store);
  return (
    <div className="">
      <section className="-z-50 banner relative flex flex-col justify-center items-center">
        <div className="w-[50vw] z-10 text-center">
          <p className="text-2xl lg:text-7xl font-bold z-10 py-5">Restaurante</p>
          <p className="z-10   text-gray-300 text-xl lg:text-4xl">
            Prueba la comodidad: comida rápida y entregada.
          </p>
        </div>

        <div className="cover absolute top-0 left-0 right-0"></div>
        <div className="fadout"></div>
      </section>

      <section className="p-10 lg:py-10 lg:px-20">
        <div className="">
          <p className="text-2xl font-semibold text-gray-400 py-3 pb-10">
            Platos Destacados
          </p>
          <MultipleItemsCarousel />
        </div>
      </section>
      <FeaturesSection />
      <section className="px-5 lg:px-20">
        <div className="">
          <h1 className="text-2xl font-semibold text-gray-400 py-3 ">
            Ordena de nuestros favoritos seleccionados
          </h1>
          <div className="flex flex-wrap items-center justify-around ">
            {restaurant.restaurants.map((item, i) => (
              <RestaurantCard key={item.id} data={item} index={i} />
            ))}
          </div>
        </div>
      </section>
      <FAQSection />
    </div>
  );
};

export default HomePage;
