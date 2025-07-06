// 📁 AddProOne.jsx
import React from "react";
import "./AddPro.css";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useTranslation } from "react-i18next"; // ✅ الترجمة

function AddProOne({
  name,
  description,
  sizes,
  useUnifiedSize,
  unifiedPrice,
  category,
  categoriesList,
  uploadedImageURL,
  imageFile,
  isImageUploading,
  setName,
  setDescription,
  setSizes,
  setUseUnifiedSize,
  setUnifiedPrice,
  setCategory,
  setImageFile,
  setUploadedImageURL,
  handleImageUpload,
  handleSubmit
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <form onSubmit={handleSubmit} className="add-product-form">
      {/* <button
        type="button"
        className="back-btn"
        onClick={() => navigate(-1)}
      >
        <IoArrowBack className="back-icon" />
        {t("addProduct.back")}
      </button> */}

      <p className="form-label">{t("addProduct.uploadImage")}</p>
      <input
        type="file"
        accept="image/*"
        className="input-file"
        onChange={(e) => {
          const file = e.target.files[0];
          setImageFile(file);
          handleImageUpload(file);
        }}
      />

      {uploadedImageURL && (
        <div className="image-preview">
          <img src={uploadedImageURL} alt="Uploaded Preview" className="preview-img" />
          <button
            type="button"
            className="change-image-btn"
            onClick={() => {
              setUploadedImageURL("");
              setImageFile(null);
            }}
          >
            {t("addCategory.changeImage")}
          </button>
        </div>
      )}

      <p className="form-label">{t("addProduct.name")}</p>
      <input
        type="text"
        placeholder={t("addProduct.namePlaceholder")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input-text"
      />

      <p className="form-label">{t("addProduct.description")}</p>
      <textarea
        placeholder={t("addProduct.descriptionPlaceholder")}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="textarea"
      />

      <p className="form-label">{t("addProduct.sizesTitle")}</p>

      {/*<label className="checkbox-label">
        <input
          type="checkbox"
          checked={useUnifiedSize}
          onChange={() => {
            setUseUnifiedSize((prev) => !prev);
            setUnifiedPrice("");
          }}
        />
        {t("addProduct.standard")}
      </label>

      {useUnifiedSize && (
        <input
          type="number"
          placeholder={t("addProduct.price")}
          value={unifiedPrice}
          onChange={(e) => setUnifiedPrice(e.target.value)}
          className="input-price"
        />
      )}*/}

      {["S", "M", "L"].map((sizeKey) => (
        <div key={sizeKey} className="size-option">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={sizes[sizeKey].selected}
              disabled={useUnifiedSize}
              onChange={() =>
                setSizes((prev) => ({
                  ...prev,
                  [sizeKey]: {
                    ...prev[sizeKey],
                    selected: !prev[sizeKey].selected,
                    price: !prev[sizeKey].selected ? "" : prev[sizeKey].price,
                  },
                }))
              }
            />
            {sizeKey}
          </label>

          {sizes[sizeKey].selected && !useUnifiedSize && (
            <input
              type="number"
              placeholder={`${t("addProduct.priceFor")} ${sizeKey}`}
              value={sizes[sizeKey].price}
              onChange={(e) =>
                setSizes((prev) => ({
                  ...prev,
                  [sizeKey]: {
                    ...prev[sizeKey],
                    price: e.target.value,
                  },
                }))
              }
              className="input-price"
            />
          )}
        </div>
      ))}

      <p className="form-label">{t("addProduct.category")}</p>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="select-category"
      >
        <option value="">{t("addProduct.selectCategory")}</option>
        {categoriesList.map((cat, index) => (
          <option key={index} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>

      <button type="submit" className="submit-btn">
        {t("addProduct.submit")}
      </button>
    </form>
  );
}

export default AddProOne;