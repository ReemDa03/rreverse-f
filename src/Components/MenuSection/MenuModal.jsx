// 📁 components/MenuModal.jsx

import React from "react";
import './MenuSection.css';
import { useTranslation } from "react-i18next";

function MenuModal({ showModal, setShowModal, modalContent }) {
  const { t } = useTranslation();

  if (!showModal) return null;

  return (
    <div
      className="menu-modal fade-in-modal"
      onClick={() => setShowModal(false)}
    >
      <div
        className="menu-modal-content scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="menu-modal-title">{modalContent.title}</h3>
        <p className="menu-modal-description">{modalContent.description}</p>
        <button
          className="menu-modal-close"
          onClick={() => setShowModal(false)}
        >
          {t("buttons.close")}
        </button>
      </div>
    </div>
  );
}

export default MenuModal;
