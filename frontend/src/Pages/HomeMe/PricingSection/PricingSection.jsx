import React, { useState } from 'react';
import './PricingSection.css';
import { useTranslation } from 'react-i18next';

const PricingSection = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { t, i18n } = useTranslation();

  const handlePlanClick = (plan) => {
    setSelectedPlan(plan);
  };

  const getWhatsAppLink = (planKey) => {
    const message =
      i18n.language === "ar"
        ? `مرحبًا، أنا مهتم بباقه ${t(`pricing.plans.${planKey}.title`)}. هل يمكنك تزويدي بمزيد من التفاصيل؟`
        : `Hello, I'm interested in the ${t(`pricing.plans.${planKey}.title`)} plan. Could you please share more details?`;

    return `https://wa.me/201024208807?text=${encodeURIComponent(message)}`;
  };

  return (
    <section className="pricing-section" id="pricing">
      <div className="section-title">
        <h2>{t("pricing.title")}</h2>
      </div>

      <div className="pricing-grid">
        {["basic", "pro", "vip"].map((planKey) => (
          <div
            key={planKey}
            className={`pricing-card ${selectedPlan === planKey ? 'active' : ''}`}
            onClick={() => handlePlanClick(planKey)}
          >
            <h3>{t(`pricing.plans.${planKey}.title`)}</h3>
            <p className="price">
              {t(`pricing.plans.${planKey}.price`)}
              {planKey !== "vip" && <span> /{t("pricing.month")}</span>}
            </p>
            <a
              href={getWhatsAppLink(planKey)}
              target="_blank"
              rel="noopener noreferrer"
              className="start-now-btn"
              onClick={(e) => e.stopPropagation()}
            >
              {t("pricing.startNow")}
            </a>
            <ul className="features-list">
              {t(`pricing.plans.${planKey}.features`, { returnObjects: true }).map(
                (feature, index) => (
                  <li key={index}>{feature}</li>
                )
              )}
            </ul>
          </div>
        ))}
      </div>

      <p className="cta-text">
        {t("pricing.cta")}
      </p>
    </section>
  );
};

export default PricingSection;
