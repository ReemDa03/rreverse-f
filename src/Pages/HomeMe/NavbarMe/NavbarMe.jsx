import React, { useEffect, useRef, useState } from "react";
import "./NavbarMe.css";
import { FaBars } from "react-icons/fa";
import LanguageSwitcher from "../../../Components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const NavbarMe = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { t, i18n } = useTranslation();

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  return (
    <nav className="navbar-me">
      <div className="navbar__container animate-slideDown">
        <div className="navbar__logo">
          <img
            src="https://res.cloudinary.com/dwupyymoc/image/upload/f_auto,q_auto,w_100/v1750008470/ReVerseLogo_ettejm.png"
            alt="ReVerse Logo"
          />
        </div>

        <div className="navbar__right">
          <div className="navbar__toggle" onClick={toggleMenu}>
            <FaBars />
          </div>
        </div>

        <div className={`navbar__menu ${menuOpen ? "open" : ""}`} ref={menuRef}>
          <LanguageSwitcher
            language={i18n.language}
            setLanguage={(lang) => i18n.changeLanguage(lang)}
          />

          <a href="#features">{t("navbarMe.features")}</a>
          <a href="#pricing">{t("navbarMe.pricing")}</a>
          <a href="#clients">{t("navbarMe.clients")}</a>
          <a href="#get-started" className="navbar__cta">
            {t("navbarMe.getStarted")}
          </a>
        </div>
      </div>
    </nav>
  );
};

export default NavbarMe;
