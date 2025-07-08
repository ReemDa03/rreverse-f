import Stripe from "stripe";
import admin from "firebase-admin";

// ✅ Firebase Admin Init
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { session_id, slug, reservationId } = req.body;

  try {
    // ✅ Get restaurant data from Firestore
    const docRef = db.collection("ReVerse").doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const restaurantData = docSnap.data();
    const stripeSecretKey = restaurantData.stripeSecretKey;

    if (!stripeSecretKey) {
      return res.status(400).json({ error: "Stripe secret key missing" });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // ✅ Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not successful" });
    }

    const paymentIntentId = session.payment_intent;

    // ✅ Update reservation in Firestore
    await db
      .collection("ReVerse")
      .doc(slug)
      .collection("bookTable")
      .doc(reservationId)
      .update({
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
