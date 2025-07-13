import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next"; // ✅

const StripeBookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
   const { t } = useTranslation(); // ✅

  const sessionId = searchParams.get("session_id");
  const slug = searchParams.get("slug");
  const reservationId = searchParams.get("reservationId");

  useEffect(() => {
    const confirmBooking = async () => {
      if (!sessionId || !slug || !reservationId) {
        toast.error(t("stripe.confirmLinkInvalid")); // ✅
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
          toast.success(t("stripe.confirmSuccess")); // ✅
          toast.info(t("stripe.refundInfo")); // ✅
        } else {
          toast.error(data.error || t("stripe.confirmFailed")); // ✅
        }
      } catch (err) {
        console.error(err);
        toast.error(t("stripe.serverError")); // ✅
      }

      setTimeout(() => {
        navigate(`/reverse/${slug}`, { replace: true });
      }, 4000);
    };

    confirmBooking();
  }, [sessionId, slug, reservationId, navigate]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>{t("stripe.confirming")}</h2>
      <p>{t("stripe.wait")}</p>
    </div>
  );
};

export default StripeBookingSuccess;
