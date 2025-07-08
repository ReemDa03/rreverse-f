import Stripe from "stripe";
import { db } from "../firebase"; // عدلي المسار حسب مشروعك
import { doc, updateDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { paymentIntentId, slug, reservationId } = req.body;

  try {
    // تنفيذ الاسترداد
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    // تحديث حالة الحجز في Firestore
    const ref = doc(db, "ReVerse", slug, "bookTable", reservationId);
    await updateDoc(ref, {
      paymentStatus: "refunded",
      refundId: refund.id,
    });

    return res.status(200).json({ message: "تم الاسترداد بنجاح" });
  } catch (error) {
    console.error("Refund Error:", error);
    return res.status(500).json({ error: "فشل في الاسترداد" });
  }
}
