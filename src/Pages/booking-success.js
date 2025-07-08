import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BookingSuccess() {
  const router = useRouter();
  const { session_id } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session_id) return;

    const verifyAndSave = async () => {
      try {
        const res = await fetch("/api/verify-and-save-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: session_id }),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success("✅ تم الحجز بنجاح بعد الدفع!");
        } else {
          toast.error("❌ حدث خطأ أثناء التحقق من الدفع.");
        }
      } catch (err) {
        console.error("Error verifying booking:", err);
        toast.error("⚠️ مشكلة في التحقق من Stripe");
      } finally {
        setLoading(false);
      }
    };

    verifyAndSave();
  }, [session_id]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>🚀 شكراً لك!</h1>
      <p>{loading ? "جارٍ التحقق من الدفع..." : "تمت العملية"}</p>
      <ToastContainer position="top-center" />
    </div>
  );
}
