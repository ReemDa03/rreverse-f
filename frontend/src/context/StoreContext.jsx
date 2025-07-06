// ✅ StoreContext.js (مُحسَّن تمامًا لدعم slug والأحجام والسعر والـ collection)
import { createContext, useState, useEffect } from "react";

export const StoreContext = createContext();

export const StoreContextProvider = ({ children, slug }) => {
  // ✅ استرجاع السلة من التخزين المحلي بناءً على slug
  const getInitialCart = () => {
    const saved = localStorage.getItem(`cartItems_${slug}`);
    return saved ? JSON.parse(saved) : {};
  };

  const [cartItems, setCartItems] = useState(getInitialCart);

  // ✅ حفظ السلة في localStorage عند أي تعديل
  useEffect(() => {
    if (slug) {
      localStorage.setItem(`cartItems_${slug}`, JSON.stringify(cartItems));
    }
  }, [cartItems, slug]);

  // ✅ إضافة عنصر إلى السلة (بالحجم والسعر والـ collection)
  const addToCart = (product, sizeObj) => {
    if (!product || !sizeObj?.label || !sizeObj?.price) return;

    const key = `${product.id}_${sizeObj.label}`;

    setCartItems((prev) => {
      const existingItem = prev[key] || {
        id: product.id,
        name: product.name,
        size: sizeObj.label,
        price: sizeObj.price,
        quantity: 0,
        image: product.image || "",
        collection: sizeObj.collection || "products",
      };

      return {
        ...prev,
        [key]: {
          ...existingItem,
          quantity: existingItem.quantity + 1,
        },
      };
    });
  };

  // ✅ إزالة عنصر واحد من السلة
  const removeFromCart = (productId, sizeLabel, collection = "products") => {
    const key = `${productId}_${sizeLabel}`;

    setCartItems((prev) => {
      const existingItem = prev[key];
      if (!existingItem) return prev;

      if (existingItem.quantity <= 1) {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      }

      return {
        ...prev,
        [key]: {
          ...existingItem,
          quantity: existingItem.quantity - 1,
        },
      };
    });
  };

  // ✅ تفريغ السلة تمامًا لهذا المطعم فقط
  const clearCart = () => {
    setCartItems({});
    localStorage.removeItem(`cartItems_${slug}`);
  };

  return (
    <StoreContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
