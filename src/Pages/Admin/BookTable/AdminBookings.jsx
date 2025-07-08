import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import "./AdminBookings.css";
import { IoArrowBack } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next"; // ✅



const AdminBookings = () => {

   const { t } = useTranslation(); // ✅

  const { slug } = useParams();
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!slug) {
        console.warn("🚫 slug غير موجود");
        return;
      }
      try {
        const docRef = doc(db, "ReVerse", slug);
        const bookingsRef = collection(docRef, "bookTable");
        const snapshot = await getDocs(bookingsRef);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(data);
        console.log("✅ الحجوزات التي تم سحبها:", data);
      } catch (err) {
        console.error("❌ خطأ في سحب الحجوزات:", err);
      }
    };

    fetchBookings();
  }, [slug]);

  const handleStatusChange = async (id, status) => {
    const ref = doc(db, "ReVerse", slug, "bookTable", id);
    await updateDoc(ref, { status });
    setBookings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const confirmDelete = async () => {
    const ref = doc(db, "ReVerse", slug, "bookTable", deleteId);
    await deleteDoc(ref);
    setBookings((prev) => prev.filter((item) => item.id !== deleteId));
    setShowModal(false);
    setDeleteId(null);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const matchDate = !filterDate || b.date === filterDate;
    return matchStatus && matchDate;
  });

  const handleReject = async (booking) => {
  try {
    // 1. إذا الدفع Stripe، نعمل Refund
    if (booking.paymentMethod === "Stripe" && booking.paymentIntentId) {
      const res = await fetch("/api/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: booking.paymentIntentId,
          slug,
          reservationId: booking.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refund failed");
    }

    // 2. نحدث الحالة في Firestore
    const ref = doc(db, "ReVerse", slug, "bookTable", booking.id);
    await updateDoc(ref, {
      status: "rejected",
      paymentStatus:
        booking.paymentMethod === "Stripe" ? "refunded" : "not_paid",
    });

    // 3. تحديث الواجهة
    setBookings((prev) =>
      prev.map((item) =>
        item.id === booking.id
          ? {
              ...item,
              status: "rejected",
              paymentStatus:
                booking.paymentMethod === "Stripe" ? "refunded" : "not_paid",
            }
          : item
      )
    );
  } catch (err) {
    console.error("❌ خطأ في الرفض:", err);
  }
};


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="admin-bookings"
    >
      <button type="button" className="back-btn" onClick={() => navigate(-1)}>
        <IoArrowBack className="back-icon" />
       {t("bookings.back")}
      </button>
      <h2>{t("bookings.title")}</h2>

      <div className="filters">
        <motion.select
          onChange={(e) => setFilterStatus(e.target.value)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <option value="all">{t("bookings.filters.all")}</option>
          <option value="pending">{t("bookings.filters.pending")}</option>
          <option value="confirmed">{t("bookings.filters.confirmed")}</option>
          <option value="rejected">{t("bookings.filters.rejected")}</option>
        </motion.select>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      <AnimatePresence mode="wait">
        {filteredBookings.length === 0 ? (
          <motion.p
            key="no-bookings"
            className="no-bookings"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {t("bookings.noBookings")}
          </motion.p>
        ) : (
          <motion.div
            key="bookings-table"
            className="table-wrapper"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
          >
            <table>
              <thead>
                <tr>
                  <th>{t("bookings.table.name")}</th>
                  <th>{t("bookings.table.seats")}</th>
                  <th>{t("bookings.table.date")}</th>
                  <th>{t("bookings.table.time")}</th>
                  <th>{t("bookings.table.payment")}</th>
                  <th>{t("bookings.table.status")}</th>
                  <th>{t("bookings.table.actions")}</th>
                  <th>{t("bookings.table.paymentStatus")}</th>

                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td>{b.name}</td>
                    <td>{b.tableSize}</td>
                    <td>{b.date}</td>
                    <td>{b.time}</td>
                    <td>{b.paymentMethod}</td>
                    <td>
                      <span className={`status ${b.status}`}>{b.status}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleStatusChange(b.id, "confirmed")}
                      >
                        ✅
                      </button>
                      <button onClick={() => handleReject(b)}>❌</button>

                      <button
                        onClick={() => {
                          setDeleteId(b.id);
                          setShowModal(true);
                        }}
                      >
                        {t("buttons.delete")}
                      </button>
                    </td>
                    <td>{b.paymentStatus || "-"}</td>

                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ المودال - خارج الجدول */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to delete this booking?</p>
            <div className="modal-actions">
              <button onClick={confirmDelete} className="yes-btn">
                Yes
              </button>
              <button onClick={() => setShowModal(false)} className="no-btn">
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminBookings;
