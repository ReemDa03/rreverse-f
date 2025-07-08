import Stripe from "stripe";
import admin from "firebase-admin";

// ✅ تهيئة Firebase Admin SDK لمرة وحدة
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
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

    const ref = db.collection("ReVerse").doc(slug).collection("bookTable").doc(reservationId);
    await ref.update({
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
