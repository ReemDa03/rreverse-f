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
  const { slug, orderId } = req.body;

  try {
    const docSnap = await db.collection("ReVerse").doc(slug).get();
    if (!docSnap.exists) return res.status(404).json({ error: "Restaurant not found" });

    const stripeSecretKey = docSnap.data().stripeSecretKey;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    const sessions = await stripe.checkout.sessions.list({ limit: 10 });

    const session = sessions.data.find(
  (s) =>
    s.metadata?.orderId === orderId ||
    s.metadata?.reservationId === orderId
);

    if (!session) return res.status(404).json({ error: "Session not found" });

    
    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error("❌ stripe-session-info error:", err);
    res.status(200).json({ sessionId: session.id, metadata: session.metadata });
 }
}
