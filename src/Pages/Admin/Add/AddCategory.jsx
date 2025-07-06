import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // ✅
import "./AddCategory.css";
import { toast } from "react-toastify";

function AddCategory({
  categoryImageURL,
  newCategoryName,
  setNewCategoryName,
  setCategoryImageURL,
  handleCategoryImageUpload,
  handleAddCategory,
  categorySectionRef,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation(); // ✅

  return (
    <div className="add-category-wrapper" ref={categorySectionRef}>
      <button style={{ display: "none" }} className="close-category-btn" onClick={() => navigate(-1)}>
        ✕
      </button>

      <h3 className="add-category-title">{t("addCategory.title")}</h3>
      <p className="add-category-note">
        {t("addCategory.note")} <strong>1:1</strong>
      </p>

      <input
        className="add-category-input"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) handleCategoryImageUpload(file);
        }}
      />

      {categoryImageURL && (
        <div className="category-preview">
          <img
            src={categoryImageURL}
            alt={t("addCategory.previewAlt")}
            className="category-preview-img"
          />
          <button
            type="button"
            className="change-image-btn"
            onClick={() => setCategoryImageURL("")}
          >
            {t("addCategory.changeImage")}
          </button>
        </div>
      )}

      <input
        className="add-category-name"
        type="text"
        placeholder={t("addCategory.namePlaceholder")}
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
      />

      <button
        type="button"
        className="add-category-submit"
        onClick={() => {
          if (!newCategoryName?.trim() || !categoryImageURL) {
            if (!newCategoryName?.trim() && !categoryImageURL) {
              toast.error(t("addCategory.errors.nameAndImage"));
            } else if (!newCategoryName?.trim()) {
              toast.error(t("addCategory.errors.nameOnly"));
            } else {
              toast.error(t("addCategory.errors.imageOnly"));
            }
            return;
          }

          handleAddCategory();
        }}
      >
        {t("addCategory.submit")}
      </button>
    </div>
  );
}

export default AddCategory;
