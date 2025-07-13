import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next"; // ✅

export default function BookingSuccess() {
    const { t } = useTranslation(); // ✅
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
           toast.success(t("booking.success")); // ✅
        } else {
          toast.error(t("booking.verifyError")); // ✅
        }
      } catch (err) {
        console.error("Error verifying booking:", err);
        toast.error(t("booking.stripeError")); // ✅
      } finally {
        setLoading(false);
      }
    };

    verifyAndSave();
  }, [session_id]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>{t("booking.thankYou")}</h1>
      <p>{loading ? t("booking.checking") : t("booking.done")}</p>
      <ToastContainer position="top-center" />
    </div>
  );
}
