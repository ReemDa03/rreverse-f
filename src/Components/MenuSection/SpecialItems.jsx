// 📁 components/SpecialItems.jsx

import React, { useEffect } from "react";
import './MenuSection.css';

function SpecialItems({
  items,
  selectedSizes,
  sizeErrors,
  cartItems,
  handleSizeSelect,
  handleAddToCart,
  removeFromCart,
  renderDescription,
  specialTitle
}) {
  if (!items?.length) return null;

  // تعيين الحجم التلقائي للعناصر ذات حجم واحد
  useEffect(() => {
    items.forEach(item => {
      const selectedSize = selectedSizes[item.id];

      const availableSizes = (item.sizes || []).reduce((acc, sizeObj) => {
        if (sizeObj.label && sizeObj.price) {
          acc[sizeObj.label] = { price: sizeObj.price };
        }
        return acc;
      }, {});

      const sizeKeys = Object.keys(availableSizes);
      const singleSize = sizeKeys.length === 1 ? sizeKeys[0] : null;

      if (singleSize && !selectedSize) {
        handleSizeSelect(item.id, singleSize);
      }
    });
  }, [items, selectedSizes, handleSizeSelect]);

  return (
    <div className="menu-special-section">
      <h3 className="menu-special-section__title fade-in">
        {specialTitle}
      </h3>

      <div className="menu-products-container">
        {items.map((item, i) => {
          const selectedSize = selectedSizes[item.id];
          const showError = sizeErrors[item.id] || false;

          const availableSizes = (item.sizes || []).reduce((acc, sizeObj) => {
            if (sizeObj.label && sizeObj.price) {
              acc[sizeObj.label] = { price: sizeObj.price };
            }
            return acc;
          }, {});

          const sizeKeys = Object.keys(availableSizes);
          const key = selectedSize ? `${item.id}_${selectedSize}` : null;
          const quantity =
            key && cartItems[key]?.quantity ? cartItems[key].quantity : 0;

          return (
            <div
              key={`${item.id}`}
              className="menu-item-special fade-in"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <img
                loading="lazy"
                className="menu-item__image"
                src={item.image}
                alt={item.name}
              />
              <h4 className="menu-item__name">{item.name}</h4>
              {renderDescription(item)}

              <div>
                {item.oldPrice && (
                  <span className="menu-item__old-price">${item.oldPrice}</span>
                )}
                <span className="menu-item__price">
                  {selectedSize
                    ? `$${availableSizes[selectedSize]?.price.toFixed(2)}`
                    : `$${item.price}`}
                </span>
              </div>

              {sizeKeys.length > 1 && (
                <div className="choices">
                  {Object.entries(availableSizes).map(([sizeKey, sizeData]) => (
                    <button
                      key={sizeKey}
                      className={`choice-button ${
                        selectedSize === sizeKey ? "selected" : ""
                      } ${showError ? "error-border" : ""}`}
                      onClick={() => handleSizeSelect(item.id, sizeKey)}
                    >
                      {sizeKey} (${parseFloat(sizeData.price).toFixed(2)})
                    </button>
                  ))}
                </div>
              )}

              <div className="menu-item__actions">
                {quantity === 0 ? (
                  <button
                    className="add-btn"
                    onClick={() =>
                      handleAddToCart(item, availableSizes, "specialItems")
                    }
                  >
                    +
                  </button>
                ) : (
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() =>
                        removeFromCart(item.id, selectedSize, "specialItems")
                      }
                    >
                      -
                    </button>
                    <span className="qty-count">{quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() =>
                        handleAddToCart(item, {
                          label: selectedSize,
                          price:
                            availableSizes[selectedSize]?.price || item.price,
                          collection: "specialItems",
                        })
                      }
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SpecialItems;
