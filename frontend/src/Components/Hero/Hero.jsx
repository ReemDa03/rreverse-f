import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import "./Header.css";

function Header() {
  const { slug } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const docRef = doc(db, "ReVerse", slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          console.error("Document not found");
        }
      } catch (error) {
        console.error("Error fetching hero data:", error);
      }
    };

    fetchHeaderData();
  }, [slug]);

  if (!data) return null;

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-text">
          <h1>{data.heroTitle}</h1>
          <p>{data.heroSubtitle}</p>
        </div>

        <div className="header-image">
          <LazyLoadImage src={data.heroImage} alt="Hero" effect="blur" />
        </div>
      </div>
    </header>
  );
}

export default Header;
