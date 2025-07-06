import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home/Home";
import "./App.css";
import CartPage from "./Pages/Cart/CartPage";
import Layout from "./Components/Layout/Layout";
import HomeMe from "./Pages/HomeMe/HomeMe";
import AdminClientH from "./Pages/Admin/AdminClientH";
import StoreContextWrapper from "./context/StoreContextWrapper";
import AdminLayout from "./Components/Layout/AdminLayout";
import AddProduct from "./Pages/Admin/Add/AddProduct";
import ProductList from "./Pages/Admin/List/ProductList";
import OrdersPage from "./Pages/Admin/Orders/OrdersPage";
import AdminBookings from "./Pages/Admin/BookTable/AdminBookings";
import PayMethod from "./Pages/Admin/PaymentMethod/PayMethod";
import ProtectedAdminRoute from "./Components/ProtectedRoutes/ProtectedRoutes"; // ✅ استدعاء الحماية
import "./index.css";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";



const App = () => {

  const location = useLocation();

  return (

 <AnimatePresence mode="wait">
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<HomeMe />} />

      {/* ✅ تغليف المسارات بمزود السياق حسب slug */}
      <Route
        path="/reverse/:slug"
        element={
          <StoreContextWrapper>
            <Layout />
          </StoreContextWrapper>
        }
      >
        <Route index element={<Home />} />
        <Route path="cart" element={<CartPage />} />
        {/* باقي صفحات العملاء */}
      </Route>

      {/* ✅ مسار المسؤول مع حماية */}
      <Route
        path="/reverse/:slug/adminClientH/*"
        element={
          <StoreContextWrapper>
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          </StoreContextWrapper>
        }
      >
        <Route index element={<AdminClientH />} />
        <Route path="add" element={<AddProduct />} />
        <Route path="list" element={<ProductList />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="booking" element={<AdminBookings />} />
        <Route path="payMethod" element={<PayMethod />} />
      </Route>
    </Routes>
    </AnimatePresence>
  );
};

export default App;
