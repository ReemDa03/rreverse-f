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

  if (!slug) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const docRef = db.collection("ReVerse").doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const data = docSnap.data();

    const {
      stripeSecretKey,
      success_url: fallbackSuccessUrl,
      cancel_url: fallbackCancelUrl,
      currency: docCurrency,
      depositAmount,
    } = data;

    if (!stripeSecretKey || !fallbackSuccessUrl || !fallbackCancelUrl) {
      return res.status(400).json({ error: "Stripe data missing" });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // ✅ قراءة نوع العملية من الطلب
    const isBooking = req.body.isBooking === true;
    const reservationId = req.body.reservationId;

    let successUrl = req.body.success_url || fallbackSuccessUrl;
    let cancelUrl = req.body.cancel_url || fallbackCancelUrl;

    // ✅ تخصيص روابط النجاح والإلغاء عند الحجز
    if (isBooking && reservationId) {
      successUrl = `https://rreverse-f.vercel.app/stripe-booking-success?session_id={CHECKOUT_SESSION_ID}&slug=${slug}&reservationId=${reservationId}`;
      cancelUrl = `https://rreverse-f.vercel.app/stripe-redirect?payment=cancel&slug=${slug}`;
    }

    // ✅ تحديد المبلغ حسب نوع العملية
    const unitAmount = isBooking
      ? (depositAmount || 1) * 100
      : (total || 1) * 100;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency || docCurrency || "usd",
            product_data: { name: "Order Total" },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    console.log("✅ Stripe Success URL:", successUrl);
    console.log("❌ Stripe Cancel URL:", cancelUrl);

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error("❌ Stripe Error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
