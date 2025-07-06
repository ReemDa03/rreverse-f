// src/context/StoreContextWrapper.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { StoreContextProvider } from "./StoreContext";

const StoreContextWrapper = ({ children }) => {
  const { slug } = useParams();
  return <StoreContextProvider slug={slug}>{children}</StoreContextProvider>;
};

export default StoreContextWrapper;
