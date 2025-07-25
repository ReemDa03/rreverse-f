import React, { useEffect } from "react";

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



import StripeRedirectWrapper from "./Pages/StripeRedirectWrapper";
import StripeBookingSuccess from "./Pages/StripeBookingSuccess";
import StripeOrderSuccess from "./Pages/StripeOrderSuccess";

import { useTranslation } from "react-i18next"; // ⬅️ استدعاء الترجمة

const App = () => {

  const location = useLocation();
  const { i18n } = useTranslation(); // ⬅️ استخدام اللغة الحالية


  
  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;

    // ✅ إضافة كلاس للغة على body لتغيير الخط حسب اللغة
  document.body.classList.remove("lang-ar", "lang-en");
  document.body.classList.add(i18n.language === "ar" ? "lang-ar" : "lang-en");
  }, [i18n.language]);

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
      
        <Route path="/stripe-redirect" element={<StripeRedirectWrapper />} />
        <Route path="/stripe-booking-success" element={<StripeBookingSuccess />} />
        <Route path="/stripe-order-success" element={<StripeOrderSuccess />} />
        


    </Routes>
    </AnimatePresence>
  );
};

export default App;
