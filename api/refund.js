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

  const { paymentIntentId, slug, reservationId } = req.body;

  try {
    // تنفيذ الاسترداد
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    // تحديث حالة الحجز في Firestore
    const ref = db.collection("ReVerse").doc(slug).collection("bookTable").doc(reservationId);
    await ref.update({
      paymentStatus: "refunded",
      refundId: refund.id,
    });

    return res.status(200).json({ message: "تم الاسترداد بنجاح" });
  } catch (error) {
    console.error("Refund Error:", error);
    return res.status(500).json({ error: "فشل في الاسترداد" });
  }
}
