import { useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { StoreContext } from "../context/StoreContext";

const StripeRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useContext(StoreContext);

  // ✅ نمنع التكرار في التنفيذ
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get("payment");
    const slug = queryParams.get("slug");
    const reservationId = queryParams.get("reservationId");
    const sessionId = queryParams.get("session_id"); // ✅ الجلسة من Stripe

    const handleSuccess = async () => {
  try {
    // ✅ نطلب sessionId الحقيقي من السيرفر باستخدام orderId
    const sessionRes = await axios.post("/api/stripe-session-info", {
      slug,
      orderId: reservationId,
    });

    const { sessionId } = sessionRes.data;

    // ✅ نرسل sessionId للـ stripe-order-success
    if (sessionId) {
      await axios.post("/api/stripe-order-success", {
        sessionId,
        slug,
        orderId: reservationId,
      });

      toast.success("✅ تم تأكيد الطلب بنجاح!");
      clearCart();
    } else {
      toast.error("❌ فشل الحصول على جلسة الدفع.");
    }
  } catch (err) {
    console.error("❌ Error confirming order:", err);
    toast.error("❌ فشل تأكيد الدفع.");
  }
};

    if (paymentStatus === "success") {
      handleSuccess();
    } else if (paymentStatus === "cancel") {
      toast.error("❌ Payment was canceled or failed.");
    }

    // ✅ الرجوع للصفحة المناسبة بعد 2 ثانية
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
    }, 2000);
  }, [location.search, navigate, clearCart]);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>Redirecting...</h2>
    </div>
  );
};

export default StripeRedirect;
