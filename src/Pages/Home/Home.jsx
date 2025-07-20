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
 
  if (planType === "off") {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
        backgroundColor: "#f9f9f9",
        color: "#333",
        padding: "20px"
      }}
    >
      <div>
        <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>
          الموقع غير متاح حالياً
        </h1>
        <p style={{ fontSize: "1rem", color: "#666" }}>
          يرجى المحاولة لاحقاً أو التواصل مع المطعم لمعرفة التفاصيل.
        </p>
      </div>
    </div>
  );
}

  return (
    <div>
      <Header slug={slug} />
      <MenuSection slug={slug} />
      <ReservationForm slug={slug}  planType={planType}/>
    </div>
  );
};

export default Home;
