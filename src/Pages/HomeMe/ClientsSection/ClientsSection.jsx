import React, { useState, useEffect, useRef } from 'react';
import './ClientsSection.css';
import { useTranslation } from 'react-i18next';

const clients = [
  {
    name: "ReVerse Cafe",
    image: "https://res.cloudinary.com/dwupyymoc/image/upload/f_auto,q_auto,w_400,h_300,c_fill/v1751506509/Mehbud_Suspended_Ceilings_for_Your_Prestige_s7wqri.jpg",
    link: "https://rreverse.netlify.app/reverse/re-caffee"
  },
  {
    name: "ReVerse Rest",
    image: "https://res.cloudinary.com/dwupyymoc/image/upload/f_auto,q_auto,w_400,h_300,c_fill/v1751506509/Pub_Sustainable_Architecture_Design_Ideas_pvbwmn.jpg",
    link: "https://rreverse.netlify.app/reverse/re-rest"
  },
  {
    name: "Fake Sushi Corner",
    image: "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_400,h_300,c_fill/sample.jpg",
    link: "https://sushi-corner.reversesite.com"
  },
  {
    name: "Fake Coffee Spot",
    image: "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_400,h_300,c_fill/sample.jpg",
    link: "https://coffee-spot.reversesite.com"
  }
];

const ClientsSection = () => {
  const [showAll, setShowAll] = useState(false);
  const { t } = useTranslation();
  const visibleClients = showAll ? clients : clients.slice(0, 2);

  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

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
      className={`clients-section ${isVisible ? "animate-clients" : ""}`}
      id="clients"
      ref={sectionRef}
    >
      <h2 className="clients-title">{t("clients.title")}</h2>
      <p className="clients-subtext">{t("clients.description")}</p>

      <div className={`clients-scroll ${!showAll ? 'centered-scroll' : ''}`}>
        {visibleClients.map((client, index) => (
          <a
            key={index}
            href={client.link}
            className={`client-card fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={client.image} alt={client.name} />
            <p>{client.name}</p>
          </a>
        ))}
      </div>

      <div className="clients-buttons fade-in" style={{ animationDelay: '0.5s' }}>
        <a href="#pricing" className="btn-orange">{t("clients.cta")}</a>
        <button className="btn-outline" onClick={() => setShowAll(!showAll)}>
          {showAll ? t("clients.hide") : t("clients.viewMore")}
        </button>
      </div>
    </section>
  );
};

export default ClientsSection;
