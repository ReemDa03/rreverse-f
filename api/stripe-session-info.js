// /api/stripe-session-info.js
import Stripe from "stripe";
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { sessionId } = req.body;

  try {
    const session = await new Stripe(
      process.env.STRIPE_SECRET_KEY, // مافينا نعرف stripeSecretKey من هون مباشرة، بس نستخدم default key
      { apiVersion: "2023-10-16" }
    ).checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    const metadata = session.metadata;
    if (!metadata) {
      return res.status(400).json({ error: "Missing session metadata" });
    }

    const {
      slug,
      orderId,
      name,
      phone,
      cart,
      total
    } = metadata;

    if (!slug || !orderId || !name || !phone || !cart || !total) {
      return res.status(400).json({ error: "Missing metadata fields" });
    }

    await db
      .collection("ReVerse")
      .doc(slug)
      .collection("orders")
      .doc(orderId)
      .set({
        name,
        phone,
        cart: JSON.parse(cart),
        total,
        paymentStatus: "paid",
        paymentMethod: "Stripe",
        createdAt: admin.firestore.Timestamp.now(),
        stripeSessionId: sessionId,
        paymentIntentId: session.payment_intent,
      });

    return res.status(200).json({ message: "Order confirmed" });
  } catch (error) {
    console.error("❌ Error in stripe-session-info:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
