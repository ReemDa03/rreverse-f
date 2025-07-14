// /api/create-cash-order.js
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
     console.log("📦 Incoming Order:", req.body); // 🔥 ضيفي هاد السطر هون
     
    const {
      slug,
      orderId,
      cartItems,
      name,
      phone,
      tableNumber,
      dineOption,
      customerInfo,
      notes,
      total,
    } = req.body;

    if (!slug || !orderId || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Missing order data" });
    }

    await db
      .collection("ReVerse")
      .doc(slug)
      .collection("orders")
      .doc(orderId)
      .set({
        items: cartItems,
        dineOption: dineOption || null,
        customerInfo: customerInfo || {},
        tableNumber: tableNumber || null,
        notes: notes || "",
        name,
        phone,
        total,
        paymentStatus: "unpaid",
        paymentMethod: "cash",
        createdAt: admin.firestore.Timestamp.now(),
        isSeen: false,
      });

    return res.status(200).json({ message: "Cash order created successfully" });
  } catch (err) {
    console.error("❌ Error creating cash order:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
