import { useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { StoreContext } from "../context/StoreContext";
import { useTranslation } from "react-i18next"; // ✅

const StripeRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useContext(StoreContext);
   const { t } = useTranslation(); // ✅

  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get("payment");
    const slug = queryParams.get("slug");
    const reservationId = queryParams.get("reservationId");
    const sessionId = queryParams.get("session_id");

  const handleSuccess = async () => {
  try {
    if (!sessionId || !slug || !reservationId) {
          toast.error(t("stripeRedirect.incompleteData")); // ✅
      return;
    }

    // ✅ استرجاع الجلسة لنشوف نوعها
    const sessionRes = await axios.post("/api/stripe-session-info", {
      slug,
      orderId: reservationId,
    });

    const { sessionId: realSessionId, metadata } = sessionRes.data;

    if (!realSessionId || !metadata) {
          toast.error(t("stripeRedirect.sessionFetchFailed")); // ✅
      return;
    }

    if (metadata.isBooking === "true") {
      // ✅ تأكيد الحجز
      const res = await axios.post("/api/verify-checkout-session", {
        sessionId: realSessionId,
        slug,
        reservationId,
      });

      if (res.status === 200) {
            toast.success(t("stripeRedirect.bookingConfirmed")); // ✅
            toast.info(t("stripeRedirect.bookingRefundInfo")); // ✅
      } else {
            toast.error(t("stripeRedirect.bookingFailed")); // ✅
      }
    } else {
      // ✅ تأكيد الطلب من السلة
      await axios.post("/api/stripe-order-success", {
        sessionId: realSessionId,
        slug,
        orderId: reservationId,
      });
 toast.success(t("stripeRedirect.orderConfirmed")); // ✅
      clearCart();
    }
  } catch (err) {
    console.error("❌ Error confirming:", err);
        toast.error(t("stripeRedirect.confirmationError")); // ✅
  }
};


    if (paymentStatus === "success") {
      handleSuccess();
    } else if (paymentStatus === "cancel") {
      toast.error(t("stripeRedirect.paymentCanceled")); // ✅
    }

    setTimeout(() => {
      if (slug) {
        if (reservationId) {
          navigate(`/reverse/${slug}`, { replace: true });
        } else {
          navigate(`/reverse/${slug}/cart`, { replace: true });
        }
      } else {
        navigate("/", { replace: true });
      }
    }, 3000);
  }, [location.search, navigate, clearCart]);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>{t("stripeRedirect.confirming")}</h2>
    </div>
  );
};

export default StripeRedirect;
