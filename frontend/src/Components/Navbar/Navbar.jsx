import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import SideMenu from "../SideMenu/SideMenu";
import AdminLogin from "../Admin/AdminLogin";
import ContacttNav from "../ContacttNav/ContactNav";
import LanguageSwitcher from "../LanguageSwitcher";
import "./Navbar.css";
import { useTranslation } from "react-i18next";

function Navbar() {
  const { t, i18n } = useTranslation(); // ✅

  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // ✅ تخزين اللغة في localStorage
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "ReVerse", slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          console.error("Restaurant not found");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [slug]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    i18n.changeLanguage(lang); // ✅ بدل reload
  };

  if (!data) return null;

  return (
    <>
      <nav className="navbar fade-in-footer">
        <img className="logo" src={data.logo} alt="logo" width="100" />

        <div className="menusec">
          <LanguageSwitcher
            language={language}
            setLanguage={handleLanguageChange}
          />
          <button onClick={() => navigate(`/reverse/${slug}/cart`)}>
            {t("navbar.cart")}
          </button>
          <button onClick={() => setIsMenuOpen(true)}>≡</button>
        </div>
      </nav>

      {isMenuOpen && (
        <SideMenu
          slug={slug}
          onClose={() => setIsMenuOpen(false)}
          onOpenContact={() => setIsContactOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
      )}

      {isAdminOpen && (
        <AdminLogin
          slug={slug}
          onClose={() => setIsAdminOpen(false)}
          adminEmail={data.adminEmail}
          onOpenAdmin={() => {
            console.log("📩 Open Admin Component");
          }}
        />
      )}

      {isContactOpen && (
        <ContacttNav slug={slug} onClose={() => setIsContactOpen(false)} />
      )}
    </>
  );
}

export default Navbar;
