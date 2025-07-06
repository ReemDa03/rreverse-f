// src/Components/Layout/Layout.jsx
import React from "react";
import { Outlet, useParams } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import AdminClientH from "../../Pages/Admin/AdminClientH";

const Layout = () => {
  const { slug } = useParams();

  return (
    <>
      <Navbar slug={slug} />
      <Outlet /> {/* هون بتظهر كل الصفحات الداخلية مثل Home أو Cart */}
      
      <Footer slug={slug} />
    </>
  );
};

export default Layout;
