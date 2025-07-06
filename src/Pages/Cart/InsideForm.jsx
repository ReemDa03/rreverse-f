import React, { useEffect, useRef, useState } from "react";
import "./InsideForm.css";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next"; // ✅

const InsideForm = ({
  tableNumber,
  setTableNumber,
  notes,
  setNotes,
  setShowCashModal,
  setDineOption,
}) => {
  const { t } = useTranslation(); // ✅
  const modalRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setDineOption(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setDineOption]);

  const handleProceed = () => {
    if (!tableNumber || tableNumber === "") {
      setError(true);
      return;
    }
    setError(false);
    setShowCashModal(true);
  };

  return (
    <div className="modal-overlay">
      <motion.div
        key="inside-modal"
        ref={modalRef}
        className="modal-content inside-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="modal-title">{t("dinein.title")}</h3>

        <p className="para" style={{ color: "#666" }}>
          {t("dinein.instruction")}
        </p>

        <label>
          <p style={{ marginBottom: "10px" }}>{t("dinein.label")}</p>
          <input
            type="number"
            placeholder={t("dinein.placeholder")}
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className={error && !tableNumber ? "error-border" : ""}
            min="1"
            max="20"
          />
        </label>

        <textarea
          placeholder={t("dinein.notesPlaceholder")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="order-notes-input"
        />

        {error && <p className="error-text">{t("dinein.errorMsg")}</p>}

        <button className="confirm-btn" onClick={handleProceed}>
          {t("dinein.proceedBtn")}
        </button>
      </motion.div>
    </div>
  );
};

export default InsideForm;
