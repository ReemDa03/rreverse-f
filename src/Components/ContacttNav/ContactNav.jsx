import React, { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import "./ContacttNav.css";
import { useTranslation } from "react-i18next"; // ✅

const ContacttNav = ({ onClose, slug }) => {
  const [socialLinks, setSocialLinks] = useState(null);
  const { t } = useTranslation(); // ✅
  const [show, setShow] = useState(false); // ✅ بديل motion

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const docRef = doc(db, "ReVerse", slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const links = data.footerSettings?.socialLinks || {};
          setSocialLinks(links);
          setTimeout(() => setShow(true), 10); // ✅ لإطلاق الأنيميشن
        }
      } catch (error) {
        console.error("🔥 Error fetching contact info:", error);
      }
    };

    fetchSocialLinks();
  }, [slug]);

  const hasAnyLink =
    socialLinks?.facebook || socialLinks?.instagram || socialLinks?.whatsapp;

  return (
    <div className="contact-modal">
      <div className={`contact-container ${show ? "fade-in-slide" : ""}`}>
        <button className="contact-close-btn" onClick={onClose}>✕</button>

        {socialLinks ? (
          <>
            <p className="contact-greeting">
              {t("contact.greeting")} <span>{t("contact.contactVia")}</span>
            </p>

            {hasAnyLink ? (
              <div className="contact-icons">
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noreferrer">
                    <FaFacebook className="contact-icon facebook" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noreferrer">
                    <FaInstagram className="contact-icon instagram" />
                  </a>
                )}
                {socialLinks.whatsapp && (
                  <a
                    href={`https://wa.me/${socialLinks.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaWhatsapp className="contact-icon whatsapp" />
                  </a>
                )}
              </div>
            ) : (
              <p className="contact-nodata">{t("contact.noData")}</p>
            )}
          </>
        ) : (
          <p className="contact-loading">{t("contact.loading")}</p>
        )}
      </div>
    </div>
  );
};

export default ContacttNav;
