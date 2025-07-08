import { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { StoreContext } from "../context/StoreContext"; // عدلي حسب مسارك

const StripeRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useContext(StoreContext); // ✅ اجلب الدالة

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get("payment");
    const slug = queryParams.get("slug");

    if (paymentStatus === "success") {
      toast.success("✅ Your order has been received and is now being prepared!");
      clearCart(); // ✅ افراغ السلة فقط عند النجاح
    } else if (paymentStatus === "cancel") {
      toast.error("❌ Payment was canceled or failed.");
    }

    // ✅ رجوع للسلة بعد 3 ثواني
    setTimeout(() => {
      if (slug) {
        navigate(`/reverse/${slug}/cart`, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }, 3000);
  }, [location.search, navigate, clearCart]);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>Redirecting you...</h2>
    </div>
  );
};

export default StripeRedirect;
