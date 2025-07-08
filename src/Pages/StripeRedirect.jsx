import { useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";

const StripeRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useContext(StoreContext);

  // ✅ نمنع التكرار
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get("payment");
    const slug = queryParams.get("slug");

    if (paymentStatus === "success") {
      toast.success("✅ Your order has been received and is now being prepared!");
      clearCart(); // ✅ تفضية السلة مرة وحدة
    } else if (paymentStatus === "cancel") {
      toast.error("❌ Payment was canceled or failed.");
    }

    // ✅ نرجع للسلة بعد 2 ثانية بس
    setTimeout(() => {
      if (slug) {
        navigate(`/reverse/${slug}/cart`, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }, 2000);
  }, [location.search, navigate, clearCart]);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>Redirecting to your cart...</h2>
    </div>
  );
};

export default StripeRedirect;
