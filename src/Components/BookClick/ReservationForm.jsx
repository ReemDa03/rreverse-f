import React, { useEffect, useState, useRef } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BookClick from "./BookClick";
// حذفنا framer-motion
import { useTranslation } from "react-i18next"; // ✅

function ReservationForm({ slug }) {
  const [settings, setSettings] = useState(null);
  const [tableSize, setTableSize] = useState("2");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("08:00 PM");
  const [name, setName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [reservationId, setReservationId] = useState(null);
  const sectionRef = useRef(null);
  const { t } = useTranslation(); // ✅

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, "ReVerse", slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data().reservationSettings;
        setSettings(data);
      }
    };
    fetchSettings();
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !date || !time) {
      toast.error(t("reservation.errors.requiredFields"));
      return;
    }

    try {
      const ref = collection(doc(db, "ReVerse", slug), "bookTable");
      const newDoc = await addDoc(ref, {
        name,
        tableSize,
        date,
        time,
        depositAmount: settings.depositAmount,
        createdAt: Timestamp.now(),
        status: "pending",
      });

      setReservationId(newDoc.id);
      setShowModal(true);

      setTableSize("2");
      setDate("");
      setTime("08:00 PM");
      setName("");
    } catch (err) {
      console.error("Reservation error:", err);
      toast.error(t("reservation.errors.general"));
    }
  };

  if (!settings) return null;

  return (
    <section id="book" className="reservation-section" ref={sectionRef}>
      <h2 className="reservation-title fade-up">
        —{t("reservation.title")}—
      </h2>
      <div className="reservation-wrapper">
        <div className="left-side fade-left">
          <img
            className="reservation-image"
            src={settings.reservationImage}
            alt="Restaurant"
          />
          <p className="reservation-info">
            <strong>{t("reservation.info.openingHours")}:</strong>
            <br />
            {settings.openingHours}
          </p>
          <p className="reservation-info">
            <strong>{t("reservation.info.additionalInfo")}:</strong>
            <br />
            {settings.additionalInfo}
          </p>
        </div>

        <div className="right-side fade-right">
          <form onSubmit={handleSubmit}>
            <label className="reservation-label">
              {t("reservation.labels.yourName")}:
            </label>
            <input
              className="reservation-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label className="reservation-label">
              {t("reservation.labels.tableSize")}:
            </label>
            <select
              value={tableSize}
              onChange={(e) => setTableSize(e.target.value)}
            >
              {[2, 4, 6, 8, 10, 12].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <label className="reservation-label">
              {t("reservation.labels.chooseADay")}:
            </label>
            <input
              className="reservation-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <label className="reservation-label">
              {t("reservation.labels.chooseATime")}:
            </label>
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              {[
                "01:00 PM",
                "02:00 PM",
                "03:00 PM",
                "04:00 PM",
                "05:00 PM",
                "06:00 PM",
                "06:30 PM",
                "07:00 PM",
                "07:30 PM",
                "08:00 PM",
                "08:30 PM",
                "09:00 PM",
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <button className="reservation-button" type="submit">
              {t("buttons.submit")}
            </button>
          </form>
        </div>
      </div>

      {showModal && (
        <BookClick
          onClose={() => setShowModal(false)}
          settings={settings}
          reservationId={reservationId}
          slug={slug}
        />
      )}

      <ToastContainer />
    </section>
  );
}

export default ReservationForm;
