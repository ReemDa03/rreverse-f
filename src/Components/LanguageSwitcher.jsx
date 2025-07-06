import React from "react";
import "./LanguageSwitcher.css";

const LanguageSwitcher = ({ language, setLanguage }) => {
  return (
    <div className="language-switcher">
      <button
        className={language === "ar" ? "active" : ""}
        onClick={() => setLanguage("ar")}
      >
        AR
      </button>
      <button
        className={language === "en" ? "active" : ""}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
