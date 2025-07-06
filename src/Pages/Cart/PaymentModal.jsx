import React, { useState } from "react";
import "./PaymentModal.css";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const PaymentModal = ({ onClose, onConfirm, onCardPayment }) => {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState("");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        key="payment-modal"
        className="modal-content payment-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="modal-title">{t("payment.title")}</h3>

        <p className="modal-text">{t("payment.selectMethod")}</p>

        <div className="payment-options">
          <button
            className={`method-btn ${selectedMethod === "cash" ? "active" : ""}`}
            onClick={() => setSelectedMethod("cash")}
          >
            💵 {t("payment.cash")}
          </button>
          <button
            className={`method-btn ${selectedMethod === "card" ? "active" : ""}`}
            onClick={() => setSelectedMethod("card")}
          >
            💳 {t("payment.card")}
          </button>
        </div>

        {selectedMethod && (
          <button
            className="confirm-btn"
            onClick={selectedMethod === "cash" ? onConfirm : onCardPayment}
          >
            ✅ {selectedMethod === "cash" ? t("payment.confirmCash") : t("payment.confirmCard")}
          </button>
        )}

        <button className="cancel-btn" onClick={onClose}>
          {t("payment.cancel")}
        </button>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
