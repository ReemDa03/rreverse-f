import { useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
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
    const reservationId = queryParams.get("reservationId"); // ✅ نضيفها هون

    if (paymentStatus === "success") {
      toast.success("✅ Your order has been received and is now being prepared!");
      if (!reservationId) clearCart(); // ✅ تفضية السلة فقط إذا مش حجز
    } else if (paymentStatus === "cancel") {
      toast.error("❌ Payment was canceled or failed.");
    }

    // ✅ الرجوع للصفحة المناسبة بعد 2 ثانية
    setTimeout(() => {
      if (slug) {
        if (reservationId) {
          // ✅ حجز طاولة
          navigate(`/${slug}/book-table`, { replace: true });
        } else {
          // ✅ طلب من السلة
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
