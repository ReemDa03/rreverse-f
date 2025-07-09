import { useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { StoreContext } from "../context/StoreContext";

const StripeRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useContext(StoreContext);

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
      toast.error("❌ بيانات غير مكتملة لتأكيد الدفع.");
      return;
    }

    // ✅ استرجاع الجلسة لنشوف نوعها
    const sessionRes = await axios.post("/api/stripe-session-info", {
      slug,
      orderId: reservationId,
    });

    const { sessionId: realSessionId, metadata } = sessionRes.data;

    if (!realSessionId || !metadata) {
      toast.error("❌ فشل الحصول على بيانات الجلسة.");
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
        toast.success("✅ تم تأكيد الحجز بنجاح!");
        toast.info("💳 سيتم إعادة المبلغ خلال 24 ساعة إذا تم رفض الحجز.");
      } else {
        toast.error("❌ فشل تأكيد الحجز.");
      }
    } else {
      // ✅ تأكيد الطلب من السلة
      await axios.post("/api/stripe-order-success", {
        sessionId: realSessionId,
        slug,
        orderId: reservationId,
      });

      toast.success("✅ تم تأكيد الطلب بنجاح!");
      clearCart();
    }
  } catch (err) {
    console.error("❌ Error confirming:", err);
    toast.error("❌ حدث خطأ أثناء التأكيد.");
  }
};


    if (paymentStatus === "success") {
      handleSuccess();
    } else if (paymentStatus === "cancel") {
      toast.error("❌ Payment was canceled or failed.");
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
      <h2>جارٍ التأكيد...</h2>
    </div>
  );
};

export default StripeRedirect;
