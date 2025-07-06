import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  query,
  collection,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminClientH.css";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const AdminClientH = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [hasNewOrders, setHasNewOrders] = useState(false);

  const notifySound = new Audio("/sounds/notify.mp3");
  const lastPlayedOrderId = useRef(null); // 🔁 لمنع التكرار

  

  const [adminInfo, setAdminInfo] = useState({
    name: "",
    email: "",
  });

  const handleNavigate = (page) => {
    setActivePage(page);
    navigate(`/reverse/${slug}/adminClientH/${page}`);
  };

  const confirmLogout = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("slug");
      toast.success("You have been logged out.");
      navigate(`/reverse/${slug}`);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong while logging out.");
    }
  };

  const checkNewOrders = async () => {
    try {
      const q = query(
        collection(db, "ReVerse", slug, "orders"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const unseenOrder = snapshot.docs.find((doc) => !doc.data().isSeen);

      setHasNewOrders(!!unseenOrder);

      if (unseenOrder && unseenOrder.id !== lastPlayedOrderId.current) {
        notifySound.play().catch((err) =>
          console.warn("🔇 مشكلة تشغيل الصوت", err)
        );
        lastPlayedOrderId.current = unseenOrder.id;
      }
    } catch (error) {
      console.error("Error checking new orders:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !localStorage.getItem("slug")) {
        await signOut(auth);
        toast.error("Session expired. Please log in again.");
        navigate(`/reverse/${slug}`);
        return;
      }

      try {
        const docRef = doc(db, "ReVerse", slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAdminInfo({
            name: data.adminName || "Admin",
            email: data.adminEmail || "admin@example.com",
          });
        } else {
          await signOut(auth);
          toast.error("Project not found!");
          navigate(`/reverse/${slug}`);
        }
      } catch (err) {
        console.error("Error fetching admin info:", err);
        await signOut(auth);
        toast.error("Error while verifying admin!");
        navigate(`/reverse/${slug}`);
      }
    });

    return () => unsubscribe();
  }, [slug]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkNewOrders();
    }, 10000); // كل 10 ثواني

    return () => clearInterval(interval);
  }, [slug]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="admin-dashboard"
    >
      <div className="admin-header">
        <h2>{t("admin.title", { slug })}</h2>
        <div className="admin-info">
          <p>👤 {adminInfo.name}</p>
          <p>📧 {adminInfo.email}</p>
          <button className="logout-btn" onClick={confirmLogout}>
            {t("admin.logout")}
          </button>
        </div>
      </div>

      {!activePage && (
        <div className="button-grid">
          <button onClick={() => handleNavigate("add")}>
            ➕ {t("admin.add")}
          </button>
          <button onClick={() => handleNavigate("list")}>
            📦 {t("admin.list")}
          </button>
          <button onClick={() => handleNavigate("orders")} className="order-btn">
            🧾 {t("admin.orders")}
            {hasNewOrders && <span className="new-order-alert">•</span>}
          </button>
          <button onClick={() => handleNavigate("booking")}>
            📅 {t("admin.bookings")}
          </button>
        </div>
      )}

      {activePage && (
        <button
          className="back-btn"
          onClick={() => {
            setActivePage(null);
            navigate(`/reverse/${slug}/adminClientH`);
          }}
        >
          ← Back
        </button>
      )}

      {showLogoutModal && (
        <div className="logout-modal">
          <div className="logout-modal-content">
            <p>{t("admin.logoutConfirm")}</p>
            <div className="logout-modal-buttons">
              <button onClick={handleLogout}>{t("admin.logoutYes")}</button>
              <button onClick={cancelLogout}>{t("admin.cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminClientH;
