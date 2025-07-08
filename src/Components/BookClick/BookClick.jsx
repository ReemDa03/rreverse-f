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

    
  if (paymentMethod === "Stripe") {
    // ✅ نوجه المستخدم لـ Stripe
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        total: settings.depositAmount,
        currency: settings.currency || "usd",
        slug,
        // إضافات مهمة:
        reservationId,
        isBooking: true, // تمييز نوع الطلب
      }),
    });

    const data = await res.json();

    if (data.id) {
  const ref = doc(db, "ReVerse", slug, "bookTable", reservationId);
  await updateDoc(ref, {
    paymentMethod: "Stripe",
    paymentIntentId: data.id, // لازم Stripe يرجع session.payment_intent في الـ API
    paymentStatus: "pending",
  });

  window.location.href = data.url;
}
 else {
      toast.error("Something went wrong with Stripe.");
    }

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
<div className="payment-buttons">
  <button
    className={`method-btn ${paymentMethod === "Cash" ? "active" : ""}`}
    onClick={() => setPaymentMethod("Cash")}
  >
    💵 Pay with Cash
  </button>
  <button
    className={`method-btn ${paymentMethod === "Stripe" ? "active" : ""}`}
    onClick={() => setPaymentMethod("Stripe")}
  >
    💳 Pay with Card
  </button>
</div>
{triedToSubmit && !paymentMethod && (
  <p className="error-msg">{t("modal.error")}</p>
)}


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
