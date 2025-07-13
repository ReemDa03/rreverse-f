import React, { useEffect, useRef, useState } from "react";
import "./Cart.css";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ReactDOM from "react-dom"; // ✅ أضف هذا السطر

const DeliveryForm = ({
  dineOption, // ✅ أضيفي هاد السطر

  customerInfo,
  setCustomerInfo,
  notes,
  setNotes,
  setShowCashModal,
  setDineOption,
}) => {
  const { t } = useTranslation();
  const modalRef = useRef(null);
  const [error, setError] = useState(false);

  // ✅ إغلاق النموذج عند الضغط خارج المودال
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setDineOption(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setDineOption]);

  // ✅ التحقق من الحقول المطلوبة
  const handleProceed = () => {
    if (!dineOption || (dineOption !== "inside" && dineOption !== "outside")) {
      console.log("🚨 dineOption in payment:", dineOption);
      toast.error(t("delivery.chooseDineOption"));

      return;
    }

    const { name, phone, address } = customerInfo;
    if (!name || !phone || !address) {
      setError(true);
      return;
    }
    setError(false);
    setDineOption("outside"); // ✅ أضف هذا السطر
    setShowCashModal({ show: true, dineOption: "outside" });
  };

  // ✅ جمعنا المودال في متغير لاستخدامه في Portal
  const modalContent = (
    <div className="modal-overlay">
      <motion.div
        key="delivery-modal"
        ref={modalRef}
        className="modal-content delivery-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="modal-title">{t("delivery.title")}</h3>

        <p className="para" style={{ color: "#666" }}>
          {t("delivery.instruction")}
        </p>

        <input
          type="text"
          placeholder={t("delivery.namePlaceholder")}
          value={customerInfo.name}
          onChange={(e) =>
            setCustomerInfo({ ...customerInfo, name: e.target.value })
          }
          className={error && !customerInfo.name ? "error-border" : ""}
        />

        <input
          type="tel"
          placeholder={t("delivery.phonePlaceholder")}
          value={customerInfo.phone}
          onChange={(e) =>
            setCustomerInfo({ ...customerInfo, phone: e.target.value })
          }
          className={error && !customerInfo.phone ? "error-border" : ""}
        />

        <input
          type="text"
          placeholder={t("delivery.addressPlaceholder")}
          value={customerInfo.address}
          onChange={(e) =>
            setCustomerInfo({ ...customerInfo, address: e.target.value })
          }
          className={error && !customerInfo.address ? "error-border" : ""}
        />

        <textarea
          placeholder={t("delivery.notesPlaceholder")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="order-notes-input"
        />

        {error && <p className="error-text">{t("delivery.errorMsg")}</p>}

        <button className="confirm-btn" onClick={handleProceed}>
          {t("delivery.proceedBtn")}
        </button>
      </motion.div>
    </div>
  );

  // ✅ رجعنا المحتوى عبر Portal
  return ReactDOM.createPortal(modalContent, document.body);
};

export default DeliveryForm;
