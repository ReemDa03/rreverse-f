import admin from "firebase-admin";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Firebase Admin init
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { slug, reservationId, name, tableSize, time, date } = req.body;

  if (!slug || !reservationId || !name || !tableSize || !time || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const ref = db
      .collection("ReVerse")
      .doc(slug)
      .collection("bookTable")
      .doc(reservationId);

    await ref.set(
      {
        name,
        tableSize,
        time,
        date,
        paymentStatus: "paid",
        paymentMethod: "Stripe",
        createdAt: Timestamp.now(),
      },
      { merge: true }
    );

    res.status(200).json({ message: "تم حفظ الحجز بعد الدفع" });
  } catch (error) {
    console.error("Error saving booking:", error);
    res.status(500).json({ error: "فشل في حفظ الحجز" });
  }
}
