console.log("🔥 API handler is loading...");

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { total, currency, slug } = req.body;

  if (!total || !slug) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {

    console.log("➡️ Payload:", req.body);

    const docRef = db.collection("ReVerse").doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {

         console.log("🚫 Restaurant not found:", slug);


      return res.status(404).json({ error: "Restaurant not found" });
    }

    const data = docSnap.data();
  console.log("📄 Firestore data:", data);


    const {
      stripeSecretKey,
      success_url,
      cancel_url,
      currency: docCurrency,
    } = docSnap.data();

    
// 🪵 Debug log
console.log("🔍 Total:", total);
console.log("🔍 Slug:", slug);
console.log("🔍 stripeSecretKey:", stripeSecretKey);
console.log("🔍 success_url:", success_url);
console.log("🔍 cancel_url:", cancel_url);

    if (!stripeSecretKey || !success_url || !cancel_url) {
      return res.status(400).json({ error: "Stripe data missing" });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency || docCurrency || "usd",
            product_data: { name: "Order Total" },
            unit_amount: total * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url,
      cancel_url,
    });

    console.log("✅ Session created:", session.id);

    res.status(200).json({ id: session.id });
  } catch (err) {

     console.error("❌ Stripe error:", err.message);
  console.error(err); // 🧠 اطبعي كل تفاصيل الخطأ

    console.error("❌ Stripe error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

