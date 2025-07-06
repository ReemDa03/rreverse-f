// src/Components/Layout/AdminLayout.jsx
import React from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { Outlet, useParams } from "react-router-dom";

const AdminLayout = () => {
  const { slug } = useParams();

  return (
    <>
      <Navbar slug={slug} />
      <Outlet /> {/* هون بتنحط صفحات Admin مثل AdminClientH وغيرها */}
      <Footer slug={slug} />
    </>
  );
};

export default AdminLayout;
