// ✅ src/Components/SideMenu/SideMenu.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import './SideMenu.css';
import { useTranslation } from "react-i18next"; // ✅ أضفنا الترجمة


const SideMenu = ({ onClose, onOpenContact, onOpenAdmin, slug }) => {

  const { t } = useTranslation(); // ✅ استخدم الترجمة

  const navigate = useNavigate();
  const menuRef = useRef(); // ✅ ضروري لنعرف عنصر المينيو
  const [closing, setClosing] = useState(false); // ✅ لتفعيل الأنميشن



  const handleClose = () => {
    setClosing(true); // ✅ شغلي أنميشن الخروج
    setTimeout(() => {
      onClose(); // ✅ سكري المينيو فعليًا بعد الأنميشن
    }, 300); // لازم تكون نفس مدة الأنميشن بالـ CSS
  };

  // ✅ إغلاق عند الضغط خارج القائمة
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ التنقل إلى صفحة معينة
  const goTo = (path) => {
    navigate(`/reverse/${slug}${path}`);
    handleClose();
  };

  // ✅ التنقل للهوم والتمرير لقسم معين
  const goToHomeAndScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      handleClose();
    } else {
      navigate(`/reverse/${slug}?scrollTo=${id}`);
      handleClose();
    }
  };

  console.log("✅ SideMenu mounted with slug:", slug);

  return (
    <div className={`side-overlay ${closing ? "fade-out" : "fade-in"}`}>
      <div ref={menuRef} className={`sidemenu ${closing ? "slide-out" : ""}`}>
        <button className="close-btn" onClick={handleClose}>✕</button>

        <ul>
          <li>
            <button onClick={() => goTo("")}>{t("sidemenu.home")}</button>
          </li>
          <li>
            <button onClick={() => goTo("/cart")}>{t("sidemenu.cart")}</button>
          </li>
          <li>
            <button onClick={() => goToHomeAndScroll("menu")}>{t("sidemenu.products")}</button>
          </li>
          <li>
            <button onClick={() => goToHomeAndScroll("book")}>{t("sidemenu.book_table")}</button>
          </li>
          <li>
            <button onClick={() => goToHomeAndScroll("footer")}>{t("sidemenu.about_us")}</button>
          </li>
          <li>
            <button onClick={onOpenAdmin}>{t("sidemenu.admin")}</button>
          </li>
          <li>
            <button onClick={onOpenContact}>{t("sidemenu.contact")}</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideMenu;
