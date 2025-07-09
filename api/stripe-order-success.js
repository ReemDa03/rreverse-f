// /api/stripe-order-success.js
import Stripe from "stripe";
import admin from "firebase-admin";

// ✅ تهيئة Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { sessionId, slug, orderId } = req.body;

  try {
    // ✅ جلب بيانات المطعم
    const docRef = db.collection("ReVerse").doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const { stripeSecretKey } = docSnap.data();

    // ✅ تأكيد الجلسة والدفع من Stripe
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    // ✅ جلب البيانات من TempOrders
    const tempOrderRef = db.collection("ReVerse").doc(slug).collection("TempOrders").doc(orderId);
    const tempOrderSnap = await tempOrderRef.get();

    if (!tempOrderSnap.exists) {
      return res.status(404).json({ error: "Temporary order not found" });
    }

    const tempData = tempOrderSnap.data();

    // ✅ تخزين الطلب في orders
    await db
  .collection("ReVerse")
  .doc(slug)
  .collection("orders")
  .doc(orderId)
  .set({
    items: tempData.cartItems || [],
    dineOption: tempData.dineOption || null,
    customerInfo: tempData.customerInfo || {},
    tableNumber: tempData.tableNumber || null,
    notes: tempData.notes || "",
    name: tempData.name,
    phone: tempData.phone,
    total: tempData.total,
    paymentStatus: "paid",
    paymentMethod: "Stripe",
    createdAt: admin.firestore.Timestamp.now(),
    isSeen: false,
    stripeSessionId: sessionId,
    paymentIntentId: session.payment_intent,
  });


    // ✅ حذف الطلب المؤقت
    await tempOrderRef.delete();

    res.status(200).json({ message: "Order confirmed" });
  } catch (error) {
    console.error("❌ Error confirming order:", error);
    res.status(500).json({ error: "Server error" });
  }
}
