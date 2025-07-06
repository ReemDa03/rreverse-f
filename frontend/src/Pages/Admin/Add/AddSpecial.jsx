// ✅ AddSpecial.jsx بعد التعديل الكامل

import React, { useState, useEffect } from "react";
import { db } from "../../../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./AddSpecial.css";
import { useTranslation } from "react-i18next"; // ✅ إضافة

function AddSpecial() {

    const { t } = useTranslation(); // ✅ استخدام

  const { slug } = useParams();
  const [specialTitle, setSpecialTitle] = useState("");
  const [existingTitle, setExistingTitle] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemImageURL, setItemImageURL] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [price, setPrice] = useState("");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [specialItems, setSpecialItems] = useState([]);
  const [confirmDeleteTitle, setConfirmDeleteTitle] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [expandedDescriptionId, setExpandedDescriptionId] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getShortDescription = (text) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length <= 2 ? text : words.slice(0, 2).join(" ") + " ...";
  };

  useEffect(() => {
    const fetchSpecial = async () => {
      const docRef = doc(db, "ReVerse", slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.specialTitle) {
          setExistingTitle(data.specialTitle);
          const itemsSnapshot = await getDocs(
            collection(db, "ReVerse", slug, "specialItems")
          );
          const items = itemsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSpecialItems(items);
        }
      }
    };
    fetchSpecial();
  }, [slug]);

  const handleImageUpload = async (file) => {
    if (!file) return;
    setIsImageUploading(true);
    toast.info("Uploading image...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "react_upload");
    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dwupyymoc/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      const publicId = data.public_id;
      const version = data.version;
      const imageUrl = `https://res.cloudinary.com/dwupyymoc/image/upload/f_auto,q_auto,w_400,dpr_auto/v${version}/${publicId}.jpg`;
      setItemImageURL(imageUrl);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleAddTitle = async () => {
    if (existingTitle) {
      toast.error("Special title already exists. Delete it first.");
      return;
    }
    if (!specialTitle.trim()) {
      toast.error("Please enter special title");
      return;
    }
    try {
      await updateDoc(doc(db, "ReVerse", slug), {
        specialTitle: specialTitle,
      });
      setExistingTitle(specialTitle);
      toast.success("Special title added");
    } catch {
      toast.error("Failed to save title");
    }
  };

  const handleAddItem = async () => {
    if (!existingTitle) {
      toast.error("You must add a special title first");
      return;
    }
    // ✅ تحديد الحد الأقصى
    if (specialItems.length >= 3) {
      toast.error("You can only add up to 3 special items");
      return;
    }
    if (!itemName || !itemDescription || !itemImageURL || !price) {
      toast.error("Fill all fields");
      return;
    }
    try {
      const newItem = {
        name: itemName,
        description: itemDescription,
        image: itemImageURL,
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        price: parseFloat(price),
        sizes: [{ label: "Standard", price: parseFloat(price) }],
      };
      const docRef = await addDoc(
        collection(db, "ReVerse", slug, "specialItems"),
        newItem
      );
      setSpecialItems((prev) => [...prev, { id: docRef.id, ...newItem }]);
      setItemName("");
      setItemDescription("");
      setItemImageURL("");
      setOldPrice("");
      setPrice("");
      toast.success("Special item added");
    } catch {
      toast.error("Failed to add item");
    }
  };

  const handleDeleteItem = async (item) => {
    try {
      await deleteDoc(doc(db, "ReVerse", slug, "specialItems", item.id));
      setSpecialItems((prev) => prev.filter((i) => i.id !== item.id));
      setConfirmDeleteItem(null);
      toast.success("Item deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleDeleteAll = async () => {
    try {
      const itemsSnapshot = await getDocs(
        collection(db, "ReVerse", slug, "specialItems")
      );
      for (const docSnap of itemsSnapshot.docs) {
        await deleteDoc(doc(db, "ReVerse", slug, "specialItems", docSnap.id));
      }
      await updateDoc(doc(db, "ReVerse", slug), {
        specialTitle: "",
      });
      setSpecialItems([]);
      setExistingTitle("");
      setConfirmDeleteTitle(false);
      toast.success("Special section deleted");
    } catch {
      toast.error("Failed to delete section");
    }
  };

  return (
    <div className="special-wrapper">
      <h2>{t("special.addSpecialItems")}</h2>

      {!existingTitle ? (
        <div className="add-product-form">
          <input
            className="input-text"
            placeholder={t("special.sectionTitlePlaceholder")}
            value={specialTitle}
            onChange={(e) => setSpecialTitle(e.target.value)}
          />
          <button className="submit-btn" onClick={handleAddTitle}>
            {t("special.saveTitle")}
          </button>
        </div>
      ) : (
        <div className="special-title-box">
          <h3>{existingTitle}</h3>
          <button
            className="special-delete-btn"
            onClick={() => setConfirmDeleteTitle(true)}
          >
              {t("buttons.delete")}
          </button>
        </div>
      )}

      {existingTitle && (
        <div className="add-product-form">
          <input
            className="input-text"
            placeholder={t("special.name")}
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <textarea
            className="textarea"
            placeholder={t("special.description")}
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
          />
          <input
            className="input-price"
            placeholder={t("special.oldPrice")}
            value={oldPrice}
            onChange={(e) => setOldPrice(e.target.value)}
            type="number"
          />
          <input
            className="input-price"
            placeholder={t("special.price")}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
          />
          <input
            className="input-file"
            type="file"
            onChange={(e) => handleImageUpload(e.target.files[0])}
          />
          {itemImageURL && (
            <div className="image-preview">
              <img src={itemImageURL} className="preview-img" alt="Preview" />
              <button
                type="button"
                className="change-image-btn"
                onClick={() => setItemImageURL("")}
              >
                {t("special.changeImage")}

              </button>
            </div>
          )}
          <button
            className="submit-btn"
            onClick={handleAddItem}
            disabled={isImageUploading}
          >
            {t("special.addItem")}

          </button>

          <div className="special-items-list">
            {specialItems.map((item, index) => (
              <div className="special-item-card" key={index}>
                <div className="special-item-content">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="special-item-img"
                  />
                  <div className="special-item-details">
                    <strong>{item.name}</strong>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "gray",
                        cursor: isMobileView ? "pointer" : "default",
                        whiteSpace: isMobileView ? "nowrap" : "normal",
                        overflow: isMobileView ? "hidden" : "visible",
                        textOverflow: isMobileView ? "ellipsis" : "unset",
                      }}
                      onClick={() =>
                        isMobileView && setExpandedDescriptionId(item.id)
                      }
                    >
                      {isMobileView
                        ? getShortDescription(item.description)
                        : item.description}
                    </span>
                  </div>
                  <span className="special-item-price">
                    {item.oldPrice && <s>${item.oldPrice}</s>}
                    <b>${item.price}</b>
                  </span>
                  <div>
                    {expandedDescriptionId === item.id && (
                      <div
                        className="description-modal-overlay"
                        onClick={() => setExpandedDescriptionId(null)}
                      >
                        <div
                          className="description-modal"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <strong>{t("special.fullDescription")}</strong>
                          <p style={{ marginTop: "6px" }}>{item.description}</p>
                        </div>
                      </div>
                    )}
                    <button
                      className="special-delete-btn"
                      onClick={() => setConfirmDeleteItem(item)}
                    >
                      X
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* مودال حذف القسم كامل */}
      {confirmDeleteTitle && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>
              Are you sure you want to delete the entire section{" "}
              <strong>"{existingTitle}"</strong>?
            </p>
            <div className="modal-buttons">
              <button
                onClick={handleDeleteAll}
                style={{
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDeleteTitle(false)}
                style={{
                  background: "gray",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال حذف عنصر واحد */}
      {confirmDeleteItem && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>
              Are you sure you want to delete{" "}
              <strong>"{confirmDeleteItem.name}"</strong>?
            </p>
            <div className="modal-buttons">
              <button
                className="yes"
                onClick={() => handleDeleteItem(confirmDeleteItem)}
              >
                Yes
              </button>
              <button className="no" onClick={() => setConfirmDeleteItem(null)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddSpecial;
