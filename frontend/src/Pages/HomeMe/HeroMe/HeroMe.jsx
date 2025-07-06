import React from "react";
import "./HeroMe.css";
import { useTranslation } from "react-i18next";

const HeroMe = () => {
  const { t } = useTranslation();

  return (
    <section className="hero-me animate-hero-bg">
      <div className="hero-content animate-hero-text">
        <h1>{t("heroMe.title")}</h1>
        <p>{t("heroMe.subtitle")}</p>
        <a href="#get-started" className="hero-button">
          {t("heroMe.button")}
        </a>
      </div>
    </section>
  );
};

export default HeroMe;
