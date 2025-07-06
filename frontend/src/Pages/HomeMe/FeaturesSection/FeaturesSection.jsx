import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaUtensils,
  FaShoppingCart,
  FaCalendarAlt,
  FaTags,
  FaLock,
  FaGlobe,
  FaCloud,
  FaBolt
} from "react-icons/fa";
import "./FeaturesSection.css";

const FeaturesSection = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const features = [
    {
      icon: <FaUtensils />,
      title: t("features.cards.0.title"),
      description: t("features.cards.0.description")
    },
    {
      icon: <FaShoppingCart />,
      title: t("features.cards.1.title"),
      description: t("features.cards.1.description")
    },
    {
      icon: <FaCalendarAlt />,
      title: t("features.cards.2.title"),
      description: t("features.cards.2.description")
    },
    {
      icon: <FaTags />,
      title: t("features.cards.3.title"),
      description: t("features.cards.3.description")
    },
    {
      icon: <FaLock />,
      title: t("features.cards.4.title"),
      description: t("features.cards.4.description")
    },
    {
      icon: <FaGlobe />,
      title: t("features.cards.5.title"),
      description: t("features.cards.5.description")
    },
    {
      icon: <FaCloud />,
      title: t("features.cards.6.title"),
      description: t("features.cards.6.description")
    },
    {
      icon: <FaBolt />,
      title: t("features.cards.7.title"),
      description: t("features.cards.7.description")
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`features-section ${isVisible ? "animate-features" : ""}`}
      id="features"
      ref={sectionRef}
    >
      <div className="features-header">
        <h2>{t("features.title1")}</h2>
        <p>{t("features.description")}</p>
        <h2>{t("features.title2")}</h2>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`feature-card ${isVisible ? "fade-in" : ""}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
