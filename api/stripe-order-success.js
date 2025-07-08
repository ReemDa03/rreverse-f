// /api/stripe-order-success.js
import Stripe from "stripe";
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { sessionId, slug, orderId } = req.body;

  try {
    const docRef = db.collection("ReVerse").doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const { stripeSecretKey } = docSnap.data();
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    const { name, phone, cart, total, orderId } = session.metadata;

    if (!name || !phone || !cart || !total) {
      return res.status(400).json({ error: "Missing order metadata" });
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

    res.status(200).json({ message: "Order confirmed" });
  } catch (error) {
    console.error("Error confirming order:", error);
    res.status(500).json({ error: "Server error" });
  }
}
