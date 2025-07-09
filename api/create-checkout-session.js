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
    phone,
    cartItems,
    dineOption, // ✅ أضفها
  customerInfo, // ✅ أضفها
  notes, // ✅
  tableNumber, // ✅
  } = req.body;

  // ✅ تحقق من الحقول المطلوبة
  if (!slug) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!isBooking && (!phone || !cartItems || cartItems.length === 0)) {
    return res.status(400).json({ error: "Missing order details" });
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

    // ✅ روابط النجاح والإلغاء
    const finalSuccessUrl = isBooking
  ? `https://rreverse-f.vercel.app/stripe-booking-success?slug=${slug}&reservationId=${reservationId}&session_id=${session.id}`
  : `https://rreverse-f.vercel.app/stripe-order-success?slug=${slug}&orderId=${reservationId}&session_id=${session.id}`;

    let finalCancelUrl = `https://rreverse-f.vercel.app/stripe-redirect?payment=cancel&slug=${slug}`;

    // ✅ احفظ بيانات الطلب الحقيقية مؤقتًا في Firestore (مش داخل Stripe)
    if (!isBooking) {
  await db
    .collection("ReVerse")
    .doc(slug)
    .collection("TempOrders")
    .doc(reservationId)
    .set({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      cartItems,
      phone,
      name,
      total,
      dineOption,
      customerInfo,
      notes,
      tableNumber,
    });
}


    // ✅ تحديد السعر بالدولار أو حسب إعدادات المطعم
    const unitAmount = isBooking
      ? (depositAmount || 1) * 100
      : (total || 1) * 100;

    // ✅ تجهيز metadata آمنة ومختصرة
    const cartArray = Array.isArray(cartItems) ? cartItems : Object.values(cartItems || {});

const metadata = isBooking
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
      orderId: reservationId,
      name,
      phone,
      total: total.toString(),
      itemsCount: cartArray.length.toString(),
      cartSummary: cartArray
        .map((item) => `${item.name} (${item.quantity})`)
        .join(", ")
        .slice(0, 400),
    };


    // ✅ إنشاء الجلسة مع Stripe
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
      metadata,
    });

    console.log("✅ Stripe Session Created:", session.id);
    console.log("➡️ Success URL:", finalSuccessUrl);

    res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("❌ Stripe Error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
