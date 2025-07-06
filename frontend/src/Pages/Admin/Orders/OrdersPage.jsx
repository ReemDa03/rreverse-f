import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../../firebase";

import { useParams, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

import "./OrdersPage.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

const OrdersPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const toggleOpen = (id) => {
    setOpenId(openId === id ? null : id);
  };

  const playSound = () => {
    const audio = new Audio("/sounds/notify.mp3");
    audio.play().catch((err) => {
      console.warn("🔇 فشل تشغيل الصوت:", err);
    });
  };

  const fetchOrders = async () => {
    try {
      const q = query(
        collection(db, "ReVerse", slug, "orders"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        isSeen: doc.data().isSeen || false,
        ...doc.data(),
      }));
      setOrders(data);

      // حذف الطلبات الزائدة
      if (data.length > 80) {
        const extraOrders = data.slice(80);
        for (const order of extraOrders) {
          await deleteDoc(doc(db, "ReVerse", slug, "orders", order.id));
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, "ReVerse", slug, "orders", id), {
      status: newStatus,
    });
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    await deleteDoc(doc(db, "ReVerse", slug, "orders", id));
    toast.success("Order deleted successfully ✅");
    fetchOrders();
  };

  useEffect(() => {
  let initialized = false;

  const q = query(
    collection(db, "ReVerse", slug, "orders"),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (!initialized) {
      initialized = true;
      return; // ❌ أول مرة لا تعمل شي (ما تعتبره New Order)
    }

    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        toast.info("🚨 New Order");
        playSound();
        fetchOrders();
      }
    });
  });

  return () => unsubscribe();
}, [slug]);


  useEffect(() => {
    fetchOrders();
  }, [slug]);

  const filteredOrders = orders.filter((order) => {
    const matchStatus =
      filterStatus === "all" ||
      order.status?.toLowerCase().trim() === filterStatus;
    const matchType = filterType === "all" || order.dineOption === filterType;
    return matchStatus && matchType;
  });

  const filterButtonStyle = (active) => ({
    backgroundColor: active ? "#ccc" : "#f1f1f1",
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginRight: "6px",
    fontSize: "14px",
    cursor: "pointer",
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="orders-container"
    >
      <button type="button" className="back-btn" onClick={() => navigate(-1)}>
        <IoArrowBack className="back-icon" />
        {t("orders.back")}
      </button>

      <h2 className="orders-title">Welcome to Admin Panel for: {slug}</h2>
      <h3 className="orders-count">Orders: {filteredOrders.length}</h3>
      <p className="orders-note">{t("orders.note")}</p>

      <div className="orders-filter">
        <b>Filter by Status:</b>{" "}
        {["all", "pending", "preparing", "ready", "delivered", "cancelled"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={filterButtonStyle(filterStatus === status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      <div className="orders-type-filter">
        <b>Order Type:</b>{" "}
        {["all", "inside", "outside"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={filterButtonStyle(filterType === type)}
          >
            {type === "inside"
              ? "Inside"
              : type === "outside"
              ? "Delivery"
              : "All"}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {filteredOrders.map((order, index) => {
          const items = order.items || [];
          const total = order.total || 0;
          const customer = order.customerInfo || {};

          return (
            <motion.div
              key={order.id}
              className={`order-card ${!order.isSeen ? "unseen-order" : ""}`}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div
                onClick={() => {
                  toggleOpen(order.id);
                  if (!order.isSeen) {
                    updateDoc(doc(db, "ReVerse", slug, "orders", order.id), {
                      isSeen: true,
                    });
                  }
                }}
                className="order-header"
              >
                {index + 1}. items {items.length} – Date :{" "}
                {order.createdAt?.seconds
                  ? new Date(order.createdAt.seconds * 1000).toLocaleString()
                  : "—"}{" "}
                – {order.status || "*"}
              </div>

              {openId === order.id && (
                <motion.div
                  className="order-details"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <hr />
                  {items.map((p, i) => (
                    <p key={i}>
                      🍽 {p.name} | {p.size} | quantity : {p.quantity} | $
                      {p.price}
                      {p.notes && <> – 📝 Notes: {p.notes}</>}
                    </p>
                  ))}

                  {order.notes && (
                    <p className="order-notes"> Notes: {order.notes}</p>
                  )}

                  <p>
                    <b> Total:</b> ${total.toFixed(2)}
                  </p>

                  {order.dineOption === "outside" && (
                    <>
                      <p>{t("orders.name")}: {customer.name}</p>
                      <p>{t("orders.address")}: {customer.address}</p>
                      <p>{t("orders.phone")}: {customer.phone}</p>
                    </>
                  )}

                  {order.dineOption === "inside" && (
                    <p>{t("orders.tableNumber")} : {order.tableNumber}</p>
                  )}

                  {order.note && (
                    <p>📝 {t("orders.note")}: {order.note}</p>
                  )}

                  <p>
                    💳 {t("orders.payment")}:{" "}
                    {order.paymentMethod === "online" &&
                      (order.paymentStatus === "paid"
                        ? "✅ Paid Online"
                        : "❗ Unpaid - Online Selected")}
                    {order.paymentMethod === "cash" && "💵 Cash on Delivery"}
                    {!order.paymentMethod && "—"}
                  </p>

                  <div className="order-status-controls">
                    <b> {t("orders.changeStatus")}:</b>
                    <br />
                    {["preparing", "pending", "delivered", "cancelled"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(order.id, status)}
                          className="status-btn"
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      )
                    )}
                  </div>

                  {order.status === "cancelled" && (
                    <div className="cancelled-order-box">
                      <p>{t("orders.cancelled")}</p>
                      <button
                        className="delete"
                        onClick={() => deleteOrder(order.id)}
                      >
                        {t("orders.delete")}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      <ToastContainer position="top-center" autoClose={2000} />
    </motion.div>
  );
};

export default OrdersPage;
