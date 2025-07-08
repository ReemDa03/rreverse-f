import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const StripeBookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get("session_id");
  const slug = searchParams.get("slug");
  const reservationId = searchParams.get("reservationId");

  useEffect(() => {
    const confirmBooking = async () => {
      if (!sessionId || !slug || !reservationId) return;

      try {
        const res = await fetch("/api/verify-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            slug,
            reservationId,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success("✅ تم تأكيد الحجز بنجاح!");
          toast.info("💳 سيتم إعادة المبلغ خلال 24 ساعة في حال تم رفض الحجز.");

          // ✅ بعد نجاح الدفع، أرسل الحجز إلى Firestore
          const stored = localStorage.getItem("pendingReservation");
let bookingData = null;

if (stored) {
  const parsed = JSON.parse(stored);
  const savedTime = new Date(parsed.createdAt).getTime();
  const now = Date.now();

  if (now - savedTime < 5 * 60 * 1000) {
    bookingData = parsed; // ✅ فقط إذا أقل من 5 دقايق
  } else {
    localStorage.removeItem("pendingReservation"); // منتهية الصلاحية
  }
}

          if (bookingData) {
  await fetch("/api/save-booking-after-stripe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...bookingData,
      slug,
      reservationId,
    }),
  });

  localStorage.removeItem("pendingReservation");
}

        } else {
          toast.error(data.error || "❌ حدث خطأ أثناء تأكيد الحجز.");
        }
      } catch (err) {
        toast.error("❌ مشكلة في الاتصال بالخادم.");
      }

      setTimeout(() => {
        navigate(`/reverse/${slug}`, { replace: true });
      }, 4000);
    };

    confirmBooking();
  }, [sessionId, slug, reservationId, navigate]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>جارٍ تأكيد حجزك...</h2>
      <p>يرجى الانتظار لحظة</p>
    </div>
  );
};

export default StripeBookingSuccess;
