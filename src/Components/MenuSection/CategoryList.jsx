// 📁 components/CategoryList.jsx

import React from "react";
import './MenuSection.css';

function CategoryList({ categories = [], selectedCategory, setSelectedCategory }) {
  if (!categories.length) return null;

  return (
    <div className="category-list">
      {categories.map((cat, i) => {
        const name = typeof cat === "string" ? cat : cat.name;
        const image = typeof cat === "object" && cat.image;

        return (
          <button
            key={name}
            onClick={() =>
              setSelectedCategory((prev) => (prev === name ? null : name))
            }
            className={`category-btn fade-in ${selectedCategory === name ? "active" : ""}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {image && (
              <img
                className="category-btn__img"
                src={image}
                alt={name}
                width="50"
              />
            )}
            <p>{name}</p>
          </button>
        );
      })}
    </div>
  );
}

export default CategoryList;
