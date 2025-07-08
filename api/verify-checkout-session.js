import Stripe from "stripe";
import { db } from "../firebase"; // عدلي المسار حسب مشروعك
import { doc, updateDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { session_id, slug, reservationId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not successful" });
    }

    const paymentIntentId = session.payment_intent;

    const ref = doc(db, "ReVerse", slug, "bookTable", reservationId);
    await updateDoc(ref, {
      paymentStatus: "paid",
      paymentIntentId,
      paymentMethod: "Stripe",
    });

    return res.status(200).json({ message: "Booking confirmed" });
  } catch (error) {
    console.error("Error verifying Stripe session:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
