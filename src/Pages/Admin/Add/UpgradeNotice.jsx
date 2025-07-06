// 📁 components/admin/UpgradeNotice.jsx

import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import "./UpgradeNotice.css";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next"; // ✅ جديد


function UpgradeNotice() {

 const { t } = useTranslation(); // ✅ جديد

  const { slug } = useParams();

  if (!slug) return null;

  const message = encodeURIComponent(
    `Hello, I want to upgrade the plan for my restaurant: ${slug}`
  );

  const whatsappLink = `https://wa.me/201024208807?text=${message}`;

  return (
    <div className="upgrade-notice">
      <h3 className="upgrade-title">{t("upgrade.specialItemsTitle")}</h3>
      <p className="upgrade-text">
         {t("upgrade.description")}</p>
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="upgrade-btn"
      >
        <FaWhatsapp className="whatsapp-icon" />
        {t("upgrade.contactBtn")}
      </a>
    </div>
  );
}
export default UpgradeNotice;
