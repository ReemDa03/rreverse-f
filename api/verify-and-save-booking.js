import Stripe from "stripe";
import admin from "firebase-admin";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "الدفع غير مكتمل بعد" });
    }

    const metadata = session.metadata;

    if (!metadata) {
      return res.status(400).json({ error: "لا يوجد بيانات داخل metadata" });
    }

    const { slug, reservationId, name, tableSize, date, time } = metadata;

    const ref = db
      .collection("ReVerse")
      .doc(slug)
      .collection("bookTable")
      .doc(reservationId);

    await ref.set({
      name,
      tableSize,
      date,
      time,
      paymentMethod: "Stripe",
      paymentStatus: "paid",
      createdAt: Timestamp.now(),
      stripeSessionId: sessionId,
    });

    return res.status(200).json({ message: "تم الحجز بعد التحقق من الدفع" });
  } catch (error) {
    console.error("Error verifying Stripe session:", error);
    return res.status(500).json({ error: "فشل في التحقق من الدفع" });
  }
}
