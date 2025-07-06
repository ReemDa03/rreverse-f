import React, { useEffect, useState } from "react";
import "../Footer/Footer.css";

const AboutLa = ({ sectionTitle, sectionContent, onClose }) => {
  const [fadeClass, setFadeClass] = useState("fade-in-modal");

  useEffect(() => {
    return () => {
      setFadeClass("fade-out-modal");
    };
  }, []);

  const handleClose = () => {
    setFadeClass("fade-out-modal");
    setTimeout(() => {
      onClose();
    }, 300); // نفس مدة الأنيميشن
  };

  return (
    <div className="AboutLa" onClick={handleClose}>
      <div
        className={`about-container ${fadeClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close-btn"
          onClick={handleClose}
          aria-label="Close About Section"
        >
          ×
        </button>
        <h2>{sectionTitle || "Info"}</h2>
        <p>
          {sectionContent ||
            "Sorry, we couldn't find the information you're looking for."}
        </p>
      </div>
    </div>
  );
};

export default AboutLa;
