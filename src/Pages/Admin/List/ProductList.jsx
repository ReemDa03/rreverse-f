import React, { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import { useParams } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import CategoryList from "./CategoryList";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "./ProductList.css";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next"; // ✅

function ProductList() {

  const { t } = useTranslation(); // ✅

  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchProducts = async () => {
    try {
      const colRef = collection(db, "ReVerse", slug, "products");
      const snap = await getDocs(colRef);
      const prodList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(prodList);
    } catch (err) {
      toast.error("Failed to fetch products.");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "ReVerse", slug, "products", id));
      toast.success("Item deleted.");
      fetchProducts();
      setConfirmDeleteId(null);
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [slug]);

  const categories = [...new Set(products.map((p) => p.category))];

  const filtered = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  const getShortDescription = (text) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length <= 3 ? text : words.slice(0, 3).join(" ") + " ...";
  };

  return (
    <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }} className="product-list-container">
      <button type="button" className="back-btn" onClick={() => navigate(-1)}>
        <IoArrowBack className="back-icon" />
       {t("orders.back")}
      </button>
      <h2 className="product-list-title">{t("products.title")}</h2>

      <div className="filter-container">
        <label className="filter-label">{t("products.filterByCategory")}</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p>{t("products.noProducts")}</p>
      ) : (
        <div className="product-cards-wrapper">
          {filtered.map((prod) => (
            <div
              key={prod.id}
              className="product-card"
            >
              <div
                className={`product-card-inner ${isMobileView ? "mobile" : ""}`}
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                 className="product-image"
                />

                <div
                  className="product-info"
                >
                  <strong>{prod.name}</strong>
                  <span
                    className="product-description-preview"
                    onClick={() => setExpandedId(prod.id)}
                  >
                    {getShortDescription(prod.description)}
                  </span>
                </div>

                <span>-</span>

                <span>
                  {Array.isArray(prod.sizes)
                    ? prod.sizes
                        .map((s) => `${s.label} ($${s.price})`)
                        .join(", ")
                    : "-"}
                </span>

                <span>{prod.category}</span>

                <div>
                  <button
                    onClick={() => setConfirmDeleteId(prod.id)}
                    className="delete-btn"
                  >
                    X
                  </button>
                </div>
              </div>

              {confirmDeleteId === prod.id && (
                <div
                   className="confirm-delete-box"
                >
                  <span className="delete-warning-text">
                    Are you sure you want to delete{" "}
                    <strong>"{prod.name}"</strong>?
                  </span>
                  <button
                    onClick={() => deleteProduct(prod.id)}
                    className="btn-delete-yes"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                     className="btn-delete-no"
                  >
                    No
                  </button>
                </div>
              )}

              {expandedId === prod.id && (
                <div className="overlay" onClick={() => setExpandedId(null)}>
                  <div
                    className="description-modal"
                    onClick={(e) => e.stopPropagation()} // ما يسكر لما نكبس جوه المودال
                  >
                    <strong>{t("products.fullDescription")}</strong> {prod.description}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ */}
      <hr className="divider-line" />
      <CategoryList />
      {/* ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ */}
    </motion.div>
  );
}

export default ProductList;
