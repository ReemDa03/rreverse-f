// 📁 components/MenuHeader.jsx

import React from "react";
import './MenuSection.css';

function MenuHeader({ title, description }) {
  return (
    <>
      <h2 className="menu-section__title fade-in">
        {title}
      </h2>

      <p className="menu-section__description fade-in delay">
        {description}
      </p>
    </>
  );
}

export default MenuHeader;
