// 📁 components/ProductList.jsx

import React, { useState } from "react";
import "./ProductList.css";
import { assets } from "../../assets/assets";
import { useTranslation } from "react-i18next";

function ProductList({
  products,
  selectedSizes,
  sizeErrors,
  cartItems,
  handleSizeSelect,
  handleAddToCart,
  removeFromCart,
  renderDescription,
}) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  if (!products?.length) return <p>{t("productList.noProduct")}</p>;

  const visibleProducts = showAll ? products : products.slice(0, 5);

  return (
    <div className="menu-items-wrapper">
      <div className="menu-items-container">
        {visibleProducts.map((prod, index) => {
          const selectedSize = selectedSizes[prod.id];
          const showError = sizeErrors[prod.id];

          const availableSizes = (prod.sizes || []).reduce((acc, sizeObj) => {
            if (sizeObj.label && sizeObj.price) {
              acc[sizeObj.label] = { price: sizeObj.price };
            }
            return acc;
          }, {});

          const key = selectedSize ? `${prod.id}_${selectedSize}` : null;
          const quantity =
            key && cartItems[key]?.quantity ? cartItems[key].quantity : 0;

          return (
            <div
              key={`${prod.id}-${selectedSize || "default"}`}
              className="food-item fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="food-item-image-container">
                <img
                  className="food-item-image"
                  src={prod.image}
                  alt={prod.name}
                />

                {!quantity ? (
                  <img
                    className="add"
                    onClick={() =>
                      handleAddToCart(prod, availableSizes, "products")
                    }
                    src={assets.add_icon_white}
                    alt="add"
                  />
                ) : (
                  <div className="food-item-counter">
                    <img
                      onClick={() =>
                        removeFromCart(prod.id, selectedSize, "products")
                      }
                      src={assets.remove_icon_red}
                      alt="remove"
                    />
                    <p>{quantity}</p>
                    <img
                      onClick={() =>
                        handleAddToCart(prod, availableSizes, "products")
                      }
                      src={assets.add_icon_green}
                      alt="add"
                    />
                  </div>
                )}
              </div>

              <div className="food-item-info">
                <div className="food-item-name-only">
                  <p>{prod.name}</p>
                </div>

                <div className="food-item-desc">{renderDescription(prod)}</div>

                <div className="price-and-sizes">
                  <p className="food-item-price">
                    {selectedSize
                      ? `$${availableSizes[selectedSize]?.price.toFixed(2)}`
                      : t("productList.priceLabel")}
                  </p>

                  <div className="food-item-sizes">
                    {Object.entries(availableSizes).map(([sizeKey]) => (
                      <button
                        key={sizeKey}
                        className={`size-btn ${
                          selectedSize === sizeKey ? "selected" : ""
                        } ${showError ? "error-border" : ""}`}
                        onClick={() => handleSizeSelect(prod.id, sizeKey)}
                      >
                        {sizeKey}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {products.length > 5 && (
        <button
          className="view-toggle-button fade-in"
          onClick={() => setShowAll((prev) => !prev)}
          style={{ animationDelay: `${visibleProducts.length * 0.05}s` }}
        >
          {showAll ? t("productList.viewLess") : t("productList.viewMore")}
        </button>
      )}
    </div>
  );
}

export default ProductList;
