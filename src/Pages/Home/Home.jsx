// ✅ src/Pages/Home/Home.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

import Header from "../../Components/Hero/Hero";
import MenuSection from "../../Components/MenuSection/MenuSection";
import ReservationForm from "../../Components/BookClick/ReservationForm";
import { db } from "../../../firebase"; 
import { doc, getDoc } from "firebase/firestore";


const Home = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [planType, setPlanType] = useState(null);

  useEffect(() => {
  const fetchPlan = async () => {
    const docRef = doc(db, "ReVerse", slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setPlanType(data.plan  || "basic"); // أو default
    }
  };

  if (slug) fetchPlan();
}, [slug]);


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

  if (!planType) return null; // أو ممكن سبينر مؤقت

  return (
    <div>
      <Header slug={slug} />
      <MenuSection slug={slug} />
      <ReservationForm slug={slug}  planType={planType}/>
    </div>
  );
};

export default Home;
