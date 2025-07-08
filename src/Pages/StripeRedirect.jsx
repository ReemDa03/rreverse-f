import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const StripeRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get("payment");
    const slug = queryParams.get("slug");

    if (paymentStatus === "success") {
      toast.success("✅ Your order has been received and is now being prepared!");
    } else if (paymentStatus === "cancel") {
      toast.error("❌ Payment was canceled or failed.");
    }

    setTimeout(() => {
      if (slug) {
        navigate(`/reverse/${slug}/cart`, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }, 3000);
  }, [location.search, navigate]);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>Redirecting you...</h2>
    </div>
  );
};

export default StripeRedirect;
