import React, { useContext, useState, useRef, useEffect } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./Cart.css";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const CartItem = ({ item, product }) => {
  const { addToCart, removeFromCart } = useContext(StoreContext);
  const { t } = useTranslation();

  const [showDescModal, setShowDescModal] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowDescModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getShortDescription = (desc) => {
    const words = desc.split(" ");
    return words.slice(0, 5).join(" ") + "...";
  };

  return (
    <div className="cart-item">
      <img src={product.image} alt={item.name} className="cart-item-image" />

      <div className="cart-item-info">
        <h4 className="cart-item-name">{item.name}</h4>

        <p
          className="cart-item-desc"
          onClick={() => setShowDescModal(true)}
          style={{
            color: "#555",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {getShortDescription(product.description)}
        </p>

        <p className="cart-item-price">
          {t("cart.price")}: ${item.price.toFixed(2)}
        </p>
        <p className="cart-item-size">
          {t("cart.size")}: {item.size}
        </p>

        <div className="cart-item-controls">
          <button
            className="cart-btn"
            onClick={() =>
              removeFromCart(item.id, item.size, item.collection)
            }
          >
            -
          </button>
          <span className="cart-quantity">{item.quantity}</span>
          <button
            className="cart-btn"
            onClick={() =>
              addToCart(
                {
                  id: item.id,
                  name: item.name,
                  image: product.image,
                },
                {
                  label: item.size,
                  price: item.price,
                  collection: item.collection,
                }
              )
            }
          >
            +
          </button>
        </div>

        <span className="cart-item-total">
          {t("cart.total")}: ${(item.price * item.quantity).toFixed(2)}
        </span>
      </div>

      <AnimatePresence>
        {showDescModal && (
          <div className="modal-overlay">
            <motion.div
              key="desc-modal"
              className="modal-content desc-modal"
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="modal-title">{t("cart.fullDescription")}</h4>
              <p>{product.description}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <hr className="cart-item-separator" />
    </div>
  );
};

export default CartItem;
