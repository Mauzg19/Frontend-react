import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SuperAdminSidebar from "./SuperAdminSideBar";
import SuperAdminCustomerTable from "./SuperAdminCustomerTable/SuperAdminCustomerTable";
import Customers from "./SuperAdminCustomerTable/Customers";
import RestaurantTable from "./Restaurants/RestaurantTable";
import SuperAdminRestaurant from "./Restaurants/SuperAdminRestaurant";
import RestaurantRequest from "./RestaurantRequest/RestaurantRequest";
// import AdminDashboard from "./Dashboard/AdminDashboard";
// import AdminSidebar from "./AdminSidebar";
// import RestaurantDashboard from "./Dashboard/RestaurantDashboard";
// import RestaurantsOrder from "./Orders/RestaurantsOrder";
// import RestaurantsMenu from "./MenuItem/RestaurantsMenu";
// import AddMenuForm from "./AddMenu/AddMenuForm";
// import CreateRestaurantForm from "./AddRestaurants/CreateRestaurantForm";

const SuperAdmin = () => {
  return (
    <div className="lg:flex justify-between">
      <div className="">
       
        <SuperAdminSidebar />
      </div>

      <div className="w-[80vw]">
        <Routes>
          <Route index element={<Navigate replace to="/super-admin/restaurants" />} />
          <Route path="/customers" element={<Customers/>}></Route>
          <Route path="/restaurants" element={<SuperAdminRestaurant/>}></Route>
        </Routes>
      </div>
    </div>
  );
};

export default SuperAdmin;
