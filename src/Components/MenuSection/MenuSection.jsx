// 📁 components/MenuSection.jsx

import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { StoreContext } from "../../context/StoreContext";
import "./MenuSection.css";

import MenuHeader from "./MenuHeader";
import SpecialItems from "./SpecialItems";
import CategoryList from "./CategoryList";
import ProductList from "./ProductList";
import MenuModal from "./MenuModal";

function MenuSection() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [specialItems, setSpecialItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [sizeErrors, setSizeErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
  });
  const [planType, setPlanType] = useState("basic");

  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "ReVerse", slug);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return;

        const restaurantData = docSnap.data();
        setData(restaurantData);
        setPlanType(restaurantData.plan || "basic");

        const specialItemsSnap = await getDocs(
          collection(db, "ReVerse", slug, "specialItems")
        );
        const specialList = specialItemsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSpecialItems(specialList);

        const prodRef = collection(docRef, "products");
        const prodSnap = await getDocs(prodRef);
        const prodList = prodSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(prodList);
      } catch (error) {
        console.error("Error fetching menu data:", error);
      }
    };

    fetchData();
  }, [slug]);

  if (!data) return null;

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  const handleSizeSelect = (productId, sizeKey) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: sizeKey }));
    setSizeErrors((prev) => ({ ...prev, [productId]: false }));
  };

  const handleAddToCart = (product, availableSizes, collectionName) => {
    const selectedSizeKey = selectedSizes[product.id];

    if (Object.keys(availableSizes).length && !selectedSizeKey) {
      setSizeErrors((prev) => ({ ...prev, [product.id]: true }));
      return;
    }

    const sizeData = availableSizes[selectedSizeKey];
    addToCart(product, {
      label: selectedSizeKey,
      price: sizeData?.price || product.price,
      collection: collectionName,
    });
  };

  const truncateText = (text, wordLimit) => {
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const handleViewMore = (title, description) => {
    setModalContent({ title, description });
    setShowModal(true);
  };

  const renderDescription = (item) => {
    const desc = item.description || "";
    const words = desc.trim().split(" ");
    const isLong = words.length > 3;
    const shortText = truncateText(desc, 3);

    return (
      <p
        onClick={() => isLong && handleViewMore(item.name, desc)}
        style={{ cursor: isLong ? "pointer" : "default", color: "#444" }}
        className="menu-item__desc"
      >
        {shortText}
      </p>
    );
  };

  return (
    <section id="menu" className="menu-section">
      <MenuHeader
        title={data.menuHeaderTitle}
        description={data.menuHeaderDesc}
      />

      {planType === "premium" && (
        <SpecialItems
          key="special-items"
          items={specialItems}
          selectedSizes={selectedSizes}
          sizeErrors={sizeErrors}
          cartItems={cartItems}
          handleSizeSelect={handleSizeSelect}
          handleAddToCart={handleAddToCart}
          removeFromCart={removeFromCart}
          renderDescription={renderDescription}
          specialTitle={data.specialTitle}
        />
      )}

      <CategoryList
        categories={data.categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <hr />

      {data.topDishesTitle && <h3>{data.topDishesTitle}</h3>}

      <ProductList
        products={filteredProducts}
        selectedSizes={selectedSizes}
        sizeErrors={sizeErrors}
        cartItems={cartItems}
        handleSizeSelect={handleSizeSelect}
        handleAddToCart={handleAddToCart}
        removeFromCart={removeFromCart}
        renderDescription={renderDescription}
      />

      <MenuModal
        showModal={showModal}
        setShowModal={setShowModal}
        modalContent={modalContent}
      />
    </section>
  );
}

export default MenuSection;
