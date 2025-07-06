// 📁 AddProduct.jsx
import React, { useRef, useState, useEffect } from "react";
import { db } from "../../../../firebase";
import { doc, getDoc, collection, addDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

import AddSpecial from "./AddSpecial";

import UpgradeNotice from "./UpgradeNotice";

import AddProOne from "./AddProOne";
import AddCategory from "./AddCategory";
import "./AddCategory.css";
import { IoArrowBack } from "react-icons/io5";
import { motion } from "framer-motion";

import { useTranslation } from "react-i18next"; // ✅


function AddProduct() {

   const { t } = useTranslation(); // ✅

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sizes, setSizes] = useState({
    S: { selected: false, price: "" },
    M: { selected: false, price: "" },
    L: { selected: false, price: "" },
  });
  const [useUnifiedSize, setUseUnifiedSize] = useState(false);
  const [unifiedPrice, setUnifiedPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageURL, setUploadedImageURL] = useState("");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);

  const categorySectionRef = useRef(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryImageURL, setCategoryImageURL] = useState("");

  const { slug } = useParams();
  const navigate = useNavigate();
  const [planType, setPlanType] = useState("basic");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const docRef = doc(db, "ReVerse", slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCategoriesList(data.categories || []);
          setPlanType(data.plan || "basic"); // ← أضفنا هاد السطر
        } else {
          toast.error("Categories not found.");
        }
      } catch (err) {
        toast.error("Failed to fetch categories.");
      }
    };

    fetchCategories();
  }, [slug]);

  const handleImageUpload = async (file) => {
    if (!file) return;
    setIsImageUploading(true);
    toast.info("Uploading image... Please wait");
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
      const imageUrl = `https://res.cloudinary.com/dwupyymoc/image/upload/f_auto,q_auto,dpr_auto/v${version}/${publicId}.jpg`;
      setUploadedImageURL(imageUrl);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Image upload failed.");
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleCategoryImageUpload = async (file) => {
    setIsImageUploading(true);
    toast.info("Uploading category image...");
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

      setCategoryImageURL(imageUrl);
      toast.success("Category image uploaded!");
    } catch (err) {
      toast.error("Image upload failed.");
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !categoryImageURL) {
      toast.error("Please enter category name and upload an image.");
      return;
    }

    try {
      const docRef = doc(db, "ReVerse", slug);
      const docSnap = await getDoc(docRef);
      let existingCategories = [];

      if (docSnap.exists()) {
        const data = docSnap.data();
        existingCategories = data.categories || [];
      }

      const updatedCategories = [
        ...existingCategories,
        {
          name: newCategoryName,
          image: categoryImageURL,
        },
      ];

      await updateDoc(docRef, {
        categories: updatedCategories,
      });

      toast.success("Category added successfully!");
      setCategoriesList(updatedCategories);
      setNewCategoryName("");
      setCategoryImageURL("");
    } catch (err) {
      toast.error("Failed to add category.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isImageUploading) {
      toast.warn("Please wait until image finishes uploading.");
      return;
    }

    const selectedSizes = useUnifiedSize
      ? [
          {
            label: "Standard",
            price: parseFloat(unifiedPrice),
          },
        ]
      : Object.entries(sizes)
          .filter(([_, val]) => val.selected && val.price)
          .map(([label, val]) => ({
            label,
            price: parseFloat(val.price),
          }));

    if (
      !name.trim() ||
      !description.trim() ||
      !category ||
      !uploadedImageURL ||
      selectedSizes.length === 0 ||
      (useUnifiedSize && !unifiedPrice)
    ) {
      toast.error("Please fill in all fields and set the size price.");
      return;
    }

    try {
      const newProduct = {
        name,
        description,
        sizes: selectedSizes,
        category,
        image: uploadedImageURL,
      };

      const colRef = collection(db, "ReVerse", slug, "products");
      await addDoc(colRef, newProduct);

      toast.success("Product added successfully!");

      setName("");
      setDescription("");
      setSizes({
        S: { selected: false, price: "" },
        M: { selected: false, price: "" },
        L: { selected: false, price: "" },
      });
      setUseUnifiedSize(false);
      setUnifiedPrice("");
      setCategory("");
      setImageFile(null);
      setUploadedImageURL("");
    } catch (err) {
      toast.error("Failed to add product.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <button type="button" className="back-btn" onClick={() => navigate(-1)}>
        <IoArrowBack className="back-icon" />
        {t("addProduct.back")}
      </button>

      <div className="nav-buttons">
        <button
          onClick={() =>
            document
              .getElementById("add-product-section")
              .scrollIntoView({ behavior: "smooth" })
          }
        >
         {t("addProduct.tabs.product")}
        </button>
        <button
          onClick={() =>
            document
              .getElementById("add-category-section")
              .scrollIntoView({ behavior: "smooth" })
          }
        >
           {t("addProduct.tabs.category")}
        </button>
        <button
          onClick={() =>
            document
              .getElementById("add-special-section")
              .scrollIntoView({ behavior: "smooth" })
          }
        >
          {t("addProduct.tabs.special")}
        </button>
      </div>

      <div id="add-product-section">
        <AddProOne
          name={name}
          description={description}
          sizes={sizes}
          useUnifiedSize={useUnifiedSize}
          unifiedPrice={unifiedPrice}
          category={category}
          categoriesList={categoriesList}
          uploadedImageURL={uploadedImageURL}
          imageFile={imageFile}
          isImageUploading={isImageUploading}
          setName={setName}
          setDescription={setDescription}
          setSizes={setSizes}
          setUseUnifiedSize={setUseUnifiedSize}
          setUnifiedPrice={setUnifiedPrice}
          setCategory={setCategory}
          setImageFile={setImageFile}
          setUploadedImageURL={setUploadedImageURL}
          handleImageUpload={handleImageUpload}
          handleSubmit={handleSubmit}
        />
      </div>

      <div id="add-category-section">
        <AddCategory
          categoryImageURL={categoryImageURL}
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
          setCategoryImageURL={setCategoryImageURL}
          handleCategoryImageUpload={handleCategoryImageUpload}
          handleAddCategory={handleAddCategory}
          categorySectionRef={categorySectionRef}
        />
      </div>

      <div id="add-special-section">
        {planType === "premium" ? (
          <AddSpecial slug={slug} />
        ) : (
          <UpgradeNotice slug={slug} />
        )}
      </div>
    </motion.div>
  );
}

export default AddProduct;
