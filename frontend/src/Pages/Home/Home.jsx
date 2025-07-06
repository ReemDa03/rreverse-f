// ✅ src/Pages/Home/Home.jsx
import React, { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

import Header from "../../Components/Hero/Hero";
import MenuSection from "../../Components/MenuSection/MenuSection";
import ReservationForm from "../../Components/BookClick/ReservationForm";

const Home = () => {
  const { slug } = useParams();
  const location = useLocation();

  // ✅ هي الإضافة المهمة لتفعيل السكروول حسب الـ query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollTo = params.get("scrollTo");
    if (scrollTo) {
      const section = document.getElementById(scrollTo);
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  }, [location]);

  return (
    <div>
      <Header slug={slug} />
      <MenuSection slug={slug} />
      <ReservationForm slug={slug} />
    </div>
  );
};

export default Home;
