import React, { useState, useEffect } from "react";
import { doc, updateDoc, collection,  addDoc, Timestamp  } from "firebase/firestore";
import { db } from "../../../firebase";
import "./BookClick.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next"; // ✅

const BookClick = ({ onClose, settings, reservationId, slug, onBookingSuccess, planType }) => {

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

  const tempReservation = JSON.parse(localStorage.getItem("pendingReservation"));
  if (!tempReservation) {
    toast.error("لا يوجد بيانات حجز محفوظة.");
    return;
  }

  if (paymentMethod === "Stripe") {
  const reservationId = Math.random().toString(36).substring(2, 10); // ID مؤقت

  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      total: settings.depositAmount,
      currency: settings.currency || "usd",
      slug,
      reservationId,
      isBooking: true,
      name: tempReservation.name,
      tableSize: tempReservation.tableSize,
      date: tempReservation.date,
      time: tempReservation.time,
    }),
  });

    const data = await res.json();

    if (data.id) {
      localStorage.setItem("reservationId", reservationId);
      localStorage.setItem("selectedPaymentMethod", "Stripe");
      window.location.href = data.url;
    } else {
      toast.error("حدث خطأ أثناء تجهيز الدفع.");
    }

    return;
  }

  // ✅ لو Cash → أرسل الآن للـ Firestore
  try {
    const ref = collection(doc(db, "ReVerse", slug), "bookTable");
    const newDoc = await addDoc(ref, {
      ...tempReservation,
      createdAt: Timestamp.now(),
      paymentMethod: "Cash",
      status: "pending",
    });

    toast.success("تم استلام طلب الحجز. يُرجى التواصل معنا للدفع وتأكيد الحجز.");
localStorage.removeItem("pendingReservation");


// ✨ أفرغ الفورم:
onBookingSuccess();


setTimeout(() => {
  onClose();
}, 2300); // 1.5 ثانية تأخير

  } catch (err) {
    console.error("Error saving cash booking:", err);
    toast.error("فشل في إنشاء الحجز.");
  }
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
          
           {planType === "premium" && (
    <button
      className={`method-btn ${paymentMethod === "Stripe" ? "active" : ""}`}
      onClick={() => setPaymentMethod("Stripe")}
    >
      💳 Pay with Card
    </button>
  )}
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
