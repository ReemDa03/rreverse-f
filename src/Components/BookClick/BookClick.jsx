import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import "./BookClick.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next"; // ✅

const BookClick = ({ onClose, settings, reservationId, slug }) => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [show, setShow] = useState(false); // ✅ بديل motion
  const { t } = useTranslation(); // ✅

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 10); // ✅ simulate animation delay
    return () => clearTimeout(timeout);
  }, []);

  const getPaymentInstructions = () => {
    const instructions = {
      "Vodafone Cash": settings.vodafoneNumber
        ? t("modal.instructions.vodafone", { number: settings.vodafoneNumber })
        : null,
      PayPal: settings.paypalAccount
        ? t("modal.instructions.paypal", { account: settings.paypalAccount })
        : null,
      Stripe: settings.stripeLink
        ? t("modal.instructions.stripe", { link: settings.stripeLink })
        : null,
      Fawry: settings.fawryCode
        ? t("modal.instructions.fawry", { code: settings.fawryCode })
        : null,
    };

    return instructions[paymentMethod] || null;
  };

  const handleConfirm = async () => {
    if (!paymentMethod) {
      setTriedToSubmit(true);
      toast.error(t("modal.error"));
      return;
    }

    const ref = doc(db, "ReVerse", slug, "bookTable", reservationId);
    await updateDoc(ref, { paymentMethod });

    toast.success(t("modal.success"));
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${show ? "fade-scale-in" : ""}`}>
        <h3 className="modal-title">{t("modal.title")}</h3>

        <p className="modal-text">
          {t("modal.depositNotice", { amount: settings.depositAmount })}
        </p>

        <label className="modal-label">{t("modal.selectMethod")}</label>
        <select
          className={`modal-select ${
            triedToSubmit && !paymentMethod ? "error-border" : ""
          }`}
          value={paymentMethod}
          onChange={(e) => {
            setPaymentMethod(e.target.value);
            setTriedToSubmit(false);
          }}
        >
          <option value="">{t("modal.chooseMethod")}</option>
          {settings.paymentOptions?.map((method, i) => (
            <option key={i} value={method}>
              {method}
            </option>
          ))}
        </select>

        {paymentMethod && getPaymentInstructions() && (
          <p className="payment-instructions">{getPaymentInstructions()}</p>
        )}

        <div className="modal-buttons">
          <button onClick={handleConfirm} className="confirm-btn">
            {t("modal.confirm")}
          </button>
          <button onClick={onClose} className="cancel-btn">
            {t("modal.cancel")}
          </button>
        </div>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default BookClick;
