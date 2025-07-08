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

  const { paymentIntentId, slug, reservationId } = req.body;

  try {
    // ✅ جلب stripeSecretKey من Firestore
    const docRef = db.collection("ReVerse").doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const stripeSecretKey = docSnap.data().stripeSecretKey;

    if (!stripeSecretKey) {
      return res.status(400).json({ error: "Stripe secret key missing" });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // ✅ تنفيذ الاسترداد
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    // ✅ فقط إذا نجح الاسترداد، نحدث الحالة في Firestore
    if (refund.status === "succeeded") {
      await db
        .collection("ReVerse")
        .doc(slug)
        .collection("bookTable")
        .doc(reservationId)
        .update({
          paymentStatus: "refunded",
          refundId: refund.id,
        });

      return res.status(200).json({ message: "تم الاسترداد بنجاح" });
    } else {
      return res
        .status(400)
        .json({ error: "فشل في تنفيذ الاسترداد من Stripe" });
    }
  } catch (error) {
    console.error("Refund Error:", error);

    // 🟠 لو Stripe قال إنو الدفع تم استرداده مسبقًا
    if (
      error.code === "charge_already_refunded" ||
      error.raw?.code === "charge_already_refunded"
    ) {
      return res
        .status(400)
        .json({ error: "هذا الدفع تم استرداده مسبقًا." });
    }

    return res.status(500).json({ error: "فشل في الاسترداد" });
  }
}
