import { useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../context/StoreContext";
import { useTranslation } from "react-i18next"; // ✅

function StripeOrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const slug = params.get("slug");
  const orderId = params.get("orderId");
  const { clearCart } = useContext(StoreContext);
   const { t } = useTranslation(); // ✅

  useEffect(() => {
    const confirmOrder = async () => {
      try {
        const res = await axios.post("/api/stripe-order-success", {
          sessionId,
          slug,
          orderId,
        });

        if (res.data?.message) { 
          toast.success(t("orderStripe.confirmSuccess")); // ✅
          clearCart(); // ✅ تمام
        }
      } catch (err) {
        console.error(err); 
        toast.error(t("orderStripe.confirmFailed")); // ✅
      }
    };

    confirmOrder();
  }, [sessionId]);

  return <h2>{t("orderStripe.confirming")}</h2>;
}

export default StripeOrderSuccess;
