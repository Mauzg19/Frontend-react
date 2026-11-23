import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import CustomerRoutes from "./CustomerRoutes";
import SuperAdmin from "../SuperAdmin/SuperAdmin";
import { useSelector } from "react-redux";
import AdminRouters from "./AdminRouters";

const Routers = () => {
  const { auth } = useSelector((store) => store);
  const role = auth.user?.role;
  const checkingSession = !role && localStorage.getItem("jwt") && !auth.error;
  const restricted = (allowed, page) => {
    if (checkingSession) return <p role="status">Comprobando sesión…</p>;
    if (role === allowed) return page;
    return <Navigate replace to={role ? "/" : "/account/login"} />;
  };

  return (
    <>
   
    <Routes>
      
      <Route
        path="/admin/restaurant/*"
        element={restricted("ROLE_RESTAURANT_OWNER", <AdminRouters />)}
      />
      <Route
        path="/super-admin/*"
        element={restricted("ROLE_ADMIN", <SuperAdmin />)}
      />
      <Route path="/*" element={<CustomerRoutes />} />
    </Routes>
    </>
    
  );
};

export default Routers;
