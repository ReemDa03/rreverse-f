import React from "react";
import {
  FaRocket,
  FaDollarSign,
  FaPalette,
  FaMobileAlt,
  FaHeadset,
  FaWhatsapp,
  FaInstagram,
  FaEnvelope,
} from "react-icons/fa";
import "./FooterSection.css";
import { useTranslation } from "react-i18next";

const FooterSection = () => {
  const { t } = useTranslation();

  const footerFeatures = [
    {
      icon: <FaRocket />,
      title: t("footerMe.features.fast.title"),
      description: t("footerMe.features.fast.desc"),
    },
    {
      icon: <FaDollarSign />,
      title: t("footerMe.features.pricing.title"),
      description: t("footerMe.features.pricing.desc"),
    },
    {
      icon: <FaPalette />,
      title: t("footerMe.features.ui.title"),
      description: t("footerMe.features.ui.desc"),
    },
    {
      icon: <FaMobileAlt />,
      title: t("footerMe.features.responsive.title"),
      description: t("footerMe.features.responsive.desc"),
    },
    {
      icon: <FaHeadset />,
      title: t("footerMe.features.support.title"),
      description: t("footerMe.features.support.desc"),
    },
  ];

  return (
    <footer className="footer-section">
      <h2 className="footer-title">{t("footerMe.title")}</h2>
      <p className="footer-subtext">{t("footerMe.description")}</p>

      <div className="footer-grid">
        {footerFeatures.map((feature, index) => (
          <div key={index} className="footer-card">
            <div className="icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="footer-cta" id="get-started">
        <h3>{t("footerMe.cta.title")}</h3>
        <p>{t("footerMe.cta.description")}</p>
        <a
          href="https://wa.me/201024208807?text=Hello%2C%20I'm%20interested%20in%20learning%20more%20about%20your%20services%20at%20ReVerse.%20Could%20you%20please%20provide%20more%20information%3F"
          className="footer-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("footerMe.cta.button")}
        </a>
      </div>

      <div className="footer-icons">
        <a href="https://wa.me/201024208807" target="_blank" rel="noopener noreferrer">
          <FaWhatsapp />
        </a>
        <a href="https://instagram.com/reverse.saas" target="_blank" rel="noopener noreferrer">
          <FaInstagram />
        </a>
        <a href="mailto:reemdarwish07@gmail.com">
          <FaEnvelope />
        </a>
      </div>

      <p className="footer-copy">
        &copy; {new Date().getFullYear()} ReVerse. {t("footerMe.copyright")}
      </p>
    </footer>
  );
};

export default FooterSection;
