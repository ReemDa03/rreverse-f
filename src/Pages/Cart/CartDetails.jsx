import React from "react";
import "./Cart.css";
import { useTranslation } from "react-i18next";

const CartDetails = ({
  subtotal,
  dineOption,
  deliveryFee,
  total,
  setDineOption,
  pricesign // ✅
}) => {
  const { t } = useTranslation();

  return (
    <div className="cart-details">
      <h3 className="summary-title">{t("cart.totalTitle")}</h3>
      <p className="summary-line">
        {t("cart.subtotal")}: {pricesign}{subtotal.toFixed(2)}
      </p>
      {dineOption === "outside" && (
        <p className="summary-line">
          {t("cart.deliveryFee")}: {pricesign}{deliveryFee.toFixed(2)}
        </p>
      )}
      <p className="summary-total">
        {t("cart.total")}: {pricesign}{total.toFixed(2)}
      </p>

      {!dineOption && (
        <div className="dine-option-buttons">
          <button
            onClick={() => {
              setDineOption("inside");
              console.log("✅ dineOption set to inside");
            }}
          >
            {t("cart.inside")}
          </button>
          <button
            onClick={() => {
              setDineOption("outside");
              console.log("✅ dineOption set to outside");
            }}
          >
            {t("cart.outside")}
          </button>
        </div>
      )}
    </div>
  );
};

export default CartDetails;
