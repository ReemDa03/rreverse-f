import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import { db } from "../../../firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

import CartItem from "./CartItem";
import CartDetails from "./CartDetails";
import InsideForm from "./InsideForm";
import DeliveryForm from "./DeliveryForm";
import PaymentModal from "./PaymentModal";
import { useTranslation } from "react-i18next"; // فوق في الكومبوننت
import axios from "axios"; // إذا ما كنتِ ضايفته

import { useLocation } from "react-router-dom";

const CartPage = () => {
  const { t } = useTranslation();

  const { cartItems, addToCart, removeFromCart, clearCart } =
    useContext(StoreContext);
  const [productsData, setProductsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [dineOption, setDineOption] = useState(null);
  const [tableNumber, setTableNumber] = useState(1);
  const [notes, setNotes] = useState("");
  const [showCashModal, setShowCashModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    country: "",
    address: "",
  });
  const [restaurantData, setRestaurantData] = useState(null);
  const { slug } = useParams();
  const location = useLocation();

  const planType = restaurantData?.plan || "basic";

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get("payment");

    if (paymentStatus === "success") {
      clearCart();
      toast.success(
        "✅ Your order has been received and is now being prepared!"
      );
    }

    if (paymentStatus === "cancel") {
      toast.error("❌ Payment was canceled or failed.");
    }
  }, [location.search]);

  const handleCardPayment = async () => {
    try {
      if (
        !restaurantData?.stripePublicKey ||
        !restaurantData?.success_url ||
        !restaurantData?.cancel_url
      ) {
        toast.error("Stripe data missing. Please contact the restaurant.");
        return;
      }

      const orderId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const res = await axios.post("/api/create-checkout-session", {
        total: total,
        currency: restaurantData.currency || "usd",
        slug: slug,
        isBooking: false, // ✅ هذا الفرق بين الحجز والطلب
        reservationId: orderId, // نستخدمه كـ orderId
        name: customerInfo.name,
        phone: customerInfo.phone,

        cartItems: cartItems, // ✅ أرسل السلة
      });

      const sessionId = res.data.id;
      const stripe = window.Stripe(restaurantData.stripePublicKey);
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.error("Stripe Error:", err);
      toast.error(t("payment.errorCard"));
    }
  };

  // ✅ تحميل بيانات المنتجات
  useEffect(() => {
    const fetchData = async () => {
      const productMap = {};
      for (const key in cartItems) {
        const item = cartItems[key];
        if (!item || !item.id) continue;
        const collectionName =
          typeof item.collection === "string" ? item.collection : "products";
        try {
          const docRef = doc(db, "ReVerse", slug, collectionName, item.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            productMap[item.id] = { id: docSnap.id, ...docSnap.data() };
          }
        } catch (err) {
          console.error("Error fetching product:", err);
        }
      }
      setProductsData(productMap);
      setLoading(false);
    };
    fetchData();
  }, [cartItems, slug]);

  // ✅ تحميل بيانات المطعم
  useEffect(() => {
    const fetchRestaurant = async () => {
      const docRef = doc(db, "ReVerse", slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setRestaurantData(docSnap.data());
      }
    };
    fetchRestaurant();
  }, [slug]);

  // ✅ حساب Subtotal و Total
  const deliveryFee = 3.0;
  const subtotal = Object.values(cartItems).reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const total = subtotal + (dineOption === "outside" ? deliveryFee : 0);

  // ✅ الدفع النقدي
  const handleCashPayment = async () => {
    const orderData = {
      items: Object.values(cartItems).map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
      })),
      dineOption,
      ...(dineOption === "inside" ? { tableNumber } : { customerInfo }),
      notes,
      total,
      paymentMethod: "cash",
      paymentStatus: "pending",
      createdAt: serverTimestamp(),
      isSeen: false, // ✅ أضف هذا السطر لتمييز الطلب الجديد
    };

    try {
      await addDoc(collection(db, "ReVerse", slug, "orders"), orderData);
      clearCart();
      setNotes("");
      setShowCashModal(false);
      toast.success("Your order has been received and is now being prepared!");
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(
        "An error occurred while submitting your order. Please try again!"
      );
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="cart-page"
    >
      <ToastContainer position="top-center" autoClose={3000} />
      <h2 className="cart-title">Your Cart</h2>

      {Object.keys(cartItems).length === 0 ? (
        <div className="cart-empty">
          <p>{t("cart.emptyMessage")}</p>
          <hr />
        </div>
      ) : (
        <>
          {Object.entries(cartItems).map(([key, item]) => {
            const product = productsData[item.id];
            return (
              <CartItem
                key={key}
                item={item}
                product={product}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            );
          })}

          <div className="cart-bottom">
            {/* ✅ الصورة والنص التعريفي */}
            <div className="cart-summary-section">
              {restaurantData?.checkoutImage && (
                <div className="cart-image-box">
                  <img src={restaurantData.checkoutImage} alt="Checkout" />
                  {restaurantData?.CartText && <p>{restaurantData.CartText}</p>}
                </div>
              )}

              <CartDetails
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                total={total}
                dineOption={dineOption}
                setDineOption={setDineOption}
              />
            </div>

            {/* ✅ اختيار النوع + النموذج المناسب */}
            <div className="cart-forms">
              <AnimatePresence mode="wait">
                {dineOption === "inside" && (
                  <InsideForm
                    key="inside-form"
                    tableNumber={tableNumber}
                    setTableNumber={setTableNumber}
                    notes={notes}
                    setNotes={setNotes}
                    setShowCashModal={setShowCashModal}
                    setDineOption={setDineOption}
                  />
                )}
                {dineOption === "outside" && (
                  <DeliveryForm
                    key="delivery-form"
                    customerInfo={customerInfo}
                    setCustomerInfo={setCustomerInfo}
                    notes={notes}
                    setNotes={setNotes}
                    setShowCashModal={setShowCashModal}
                    setDineOption={setDineOption}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ✅ مودال الدفع */}
          {showCashModal && (
            <AnimatePresence mode="wait">
              <PaymentModal
                key="payment-modal"
                onConfirm={handleCashPayment}
                onClose={() => setShowCashModal(false)}
                onCardPayment={handleCardPayment}
                planType={planType}
              />
            </AnimatePresence>
          )}
        </>
      )}
    </motion.div>
  );
};

export default CartPage;
