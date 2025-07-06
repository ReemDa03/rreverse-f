import React, { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next"; // ✅


function CategoryList() {

  const { t } = useTranslation(); // ✅

  const { slug } = useParams();
  const [categories, setCategories] = useState([]);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);
  const [productCounts, setProductCounts] = useState({});

  const fetchCategories = async () => {
    try {
      const docRef = doc(db, "ReVerse", slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCategories(data.categories || []);
      } else {
        toast.error("No categories found.");
      }
    } catch (err) {
      toast.error("Failed to fetch categories.");
    }
  };

  const fetchProductCounts = async () => {
    try {
      const colRef = collection(db, "ReVerse", slug, "products");
      const snap = await getDocs(colRef);
      const products = snap.docs.map((doc) => doc.data());

      const countMap = {};
      products.forEach((p) => {
        const cat = p.category;
        if (cat) {
          countMap[cat] = (countMap[cat] || 0) + 1;
        }
      });

      setProductCounts(countMap);
    } catch (err) {
      toast.error("Failed to fetch product counts.");
    }
  };

  const deleteCategory = async (indexToDelete) => {
    try {
      const updated = categories.filter((_, i) => i !== indexToDelete);
      const docRef = doc(db, "ReVerse", slug);
      await updateDoc(docRef, { categories: updated });
      setCategories(updated);
      toast.success("Category deleted.");
      setConfirmDeleteIndex(null);
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProductCounts();
  }, [slug]);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "10px" }}>{t("categories.title")}</h2>

      {categories.length === 0 ? (
        <p>{t("categories.noCategories")}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {categories.map((cat, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #eee",
                borderRadius: "8px",
                padding: "10px",
                gap: "20px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                style={{
                  width: "70px",
                  height: "70px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />

              <div style={{ flexGrow: 1 }}>
                <strong>{cat.name}</strong>
                <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                  {productCounts[cat.name] || 0} product(s)
                </p>
              </div>

              <button
                onClick={() => setConfirmDeleteIndex(index)}
                style={{
                  background: "#eee",
                  border: "1px solid #ccc",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                X
              </button>

              {confirmDeleteIndex === index && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    background: "#fff4f4",
                    border: "1px solid #ffcccc",
                    borderRadius: "6px",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <span style={{ fontSize: "12px" }}>
                    Are you sure you want to delete{" "}
                    <strong>"{cat.name}"</strong>?
                  </span>
                  <button
                    onClick={() => deleteCategory(index)}
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDeleteIndex(null)}
                    style={{
                      background: "gray",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryList;
