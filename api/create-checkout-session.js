import Stripe from "stripe";
import admin from "firebase-admin";

// ✅ تهيئة Firebase Admin SDK مرة وحدة
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

  // ✅ جلب البيانات من الطلب
  const {
    total,
    currency,
    slug,
    reservationId,
    isBooking,
    success_url,
    cancel_url,
    name,
    tableSize,
    date,
    time,
  } = req.body;

  // ✅ تحقق من البيانات الأساسية
  if (!slug) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // ✅ جلب بيانات المطعم من Firestore
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

    // ✅ تحقق من وجود بيانات Stripe الأساسية
    if (!stripeSecretKey || !fallbackSuccessUrl || !fallbackCancelUrl) {
      return res.status(400).json({ error: "Stripe data missing" });
    }

    // ✅ إنشاء اتصال مع Stripe باستخدام المفتاح السري الخاص بكل مطعم
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // ✅ تخصيص روابط النجاح والإلغاء
    let finalSuccessUrl = success_url || fallbackSuccessUrl;
    let finalCancelUrl = cancel_url || fallbackCancelUrl;

    if (isBooking && reservationId) {
  finalSuccessUrl = `https://rreverse-f.vercel.app/stripe-booking-success?slug=${slug}&reservationId=${reservationId}&session_id={CHECKOUT_SESSION_ID}`;
  finalCancelUrl = `https://rreverse-f.vercel.app/stripe-redirect?payment=cancel&slug=${slug}`;
} else {
  finalSuccessUrl = `https://rreverse-f.vercel.app/stripe-order-success?slug=${slug}&orderId=${reservationId}&session_id={CHECKOUT_SESSION_ID}`;
  finalCancelUrl = `https://rreverse-f.vercel.app/stripe-redirect?payment=cancel&slug=${slug}`;
}

    // ✅ تحديد السعر: هل هو مبلغ الحجز أم مبلغ طلب عادي؟
    const unitAmount = isBooking
      ? (depositAmount || 1) * 100
      : (total || 1) * 100;

    // ✅ إنشاء جلسة الدفع مع Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      line_items: [
        {
          price_data: {
            currency: currency || docCurrency || "usd",
            product_data: {
              name: isBooking ? "Reservation Deposit" : "Order Total",
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      // ✅ تمرير بيانات الحجز داخل metadata حتى نسترجعها لاحقًا من Stripe
      metadata: isBooking
  ? {
      slug,
      reservationId,
      name,
      tableSize,
      date,
      time,
    }
  : {
      slug,
      orderId: reservationId, // نفسه orderId
      name,
      phone,
      cart: JSON.stringify(cartItems),
      total,
    },

    });

    console.log("✅ Stripe Session Created:", session.id);
    console.log("➡️ Success URL:", finalSuccessUrl);
    console.log("⛔ Cancel URL:", finalCancelUrl);

    // ✅ أرسل session ID و URL إلى الواجهة
    res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("❌ Stripe Error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
