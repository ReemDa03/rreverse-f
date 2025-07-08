import Stripe from "stripe";
import admin from "firebase-admin";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// ✅ Firebase Admin Init
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { session_id, slug, reservationId } = req.body;

  try {
    // ✅ جلب بيانات المطعم
    const docRef = db.collection("ReVerse").doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const { stripeSecretKey } = docSnap.data();

    if (!stripeSecretKey) {
      return res.status(400).json({ error: "Stripe secret key missing" });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // ✅ استرجاع جلسة الدفع
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    const metadata = session.metadata;

    if (!metadata) {
      return res.status(400).json({ error: "Missing metadata" });
    }

    const { name, tableSize, date, time } = metadata;

    // ✅ الحجز النهائي (set with merge)
    const ref = db
      .collection("ReVerse")
      .doc(slug)
      .collection("bookTable")
      .doc(reservationId);

    await ref.set(
      {
        name,
        tableSize,
        date,
        time,
        paymentStatus: "paid",
        paymentMethod: "Stripe",
        createdAt: Timestamp.now(),
        stripeSessionId: session_id,
        paymentIntentId: session.payment_intent,
      },
      { merge: true }
    );

    return res.status(200).json({ message: "Booking confirmed" });
  } catch (error) {
    console.error("Error verifying session:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
