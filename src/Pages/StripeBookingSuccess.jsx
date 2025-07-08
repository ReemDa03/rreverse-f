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
      if (!sessionId || !slug || !reservationId) {
        toast.error("❌ رابط التأكيد غير مكتمل");
        return;
      }

      try {
        const res = await fetch("/api/verify-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            slug,
            reservationId,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success("✅ تم تأكيد الحجز بنجاح!");
          toast.info("💳 سيتم إعادة المبلغ خلال 24 ساعة إذا تم رفض الحجز.");
        } else {
          toast.error(data.error || "❌ فشل تأكيد الحجز.");
        }
      } catch (err) {
        console.error(err);
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
