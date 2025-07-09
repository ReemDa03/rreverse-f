import { useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../context/StoreContext";

function StripeOrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const slug = params.get("slug");
  const orderId = params.get("orderId");
  const { clearCart } = useContext(StoreContext);

  useEffect(() => {
    const confirmOrder = async () => {
      try {
        const res = await axios.post("/api/stripe-order-success", {
          sessionId,
          slug,
          orderId,
        });

        if (res.data?.message) {
          toast.success("✅ تم تأكيد الطلب بنجاح!");
          clearCart(); // ✅ تمام
        }
      } catch (err) {
        console.error(err);
        toast.error("❌ حدث خطأ أثناء تأكيد الطلب.");
      }
    };

    confirmOrder();
  }, [sessionId]);

  return <h2>جارٍ تأكيد الطلب...</h2>;
}

export default StripeOrderSuccess;
