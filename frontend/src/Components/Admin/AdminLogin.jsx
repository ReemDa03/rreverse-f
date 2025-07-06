import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import "./Login.css";

function Login({ onClose }) {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState("");
  const [agree, setAgree] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();
  const { slug: routeSlug } = useParams();

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setAgree(false);
  };

  useEffect(() => {
    if (routeSlug) setSlug(routeSlug);
  }, [routeSlug]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const storedSlug = localStorage.getItem("slug");
        if (storedSlug) {
          try {
            const docRef = doc(db, "ReVerse", storedSlug);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              setAdminName(data.adminName || "Admin");
              setSlug(storedSlug);
              setIsLoggedIn(true);
            } else {
              toast.error(t("errors.storedProjectNotFound"));
              handleLogout();
            }
          } catch (err) {
            toast.error(t("errors.sessionCheck"));
            handleLogout();
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const storedSlug = localStorage.getItem("slug");
    if (isLoggedIn && routeSlug && storedSlug && routeSlug !== storedSlug) {
      toast.info(t("messages.projectSwitched"));
      handleLogout();
    }
  }, [routeSlug, isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!agree) {
      toast.error(t("errors.privacyPolicy"));
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const docRef = doc(db, "ReVerse", slug);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.adminEmail === email) {
          toast.success(t("messages.loginSuccess"));
          clearForm();
          setAdminName(data.adminName || "Admin");
          setIsLoggedIn(true);
          localStorage.setItem("slug", slug);
        } else {
          toast.error(t("errors.notAuthorized"));
          clearForm();
          await signOut(auth);
        }
      } else {
        toast.error(t("errors.projectNotFound"));
        clearForm();
        await signOut(auth);
      }
    } catch (error) {
      toast.error(t("errors.loginFailed"));
      clearForm();
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
    setAdminName("");
    clearForm();
    localStorage.removeItem("slug");
    toast.success(t("messages.loggedOut"));
  };

  if (isLoggedIn) {
    return (
      <div className="admin-overlay">
        <div className="admin-container">
          <button className="admin-close-btn" onClick={onClose}>
            ✕
          </button>

          {showLogoutConfirm ? (
            <div className="logout-confirm">
              <p className="confirm-text">{t("confirm.logout")}</p>
              <div className="confirm-actions">
                <button className="admin-btn danger" onClick={handleLogout}>
                  {t("buttons.yes")}
                </button>
                <button
                  className="admin-btn"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  {t("buttons.no")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="admin-title">
                {t("adminO.hello", { name: adminName })}
              </h2>
              <p className="admin-subtitle">{t("adminO.nowYouCan")}</p>
              <div className="admin-actions">
                {slug && (
                  <button
                    className="admin-btn primary"
                    onClick={() => navigate(`/reverse/${slug}/adminClientH`)}
                  >
                    {t("buttons.goToAdmin")}
                  </button>
                )}
                <p className="admin-or">{t("buttons.or")}</p>
                <button
                  className="admin-btn danger"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  {t("buttons.logout")}

                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-overlay">
      <div className="admin-container">
        <button className="admin-close-btn" onClick={onClose}>
          ✕
        </button>

        <p>{t("adminO.welcome")}</p>
        <p>{t("adminO.loginPrompt")}</p>

        <form onSubmit={handleLogin} className="admin-form">
          <input
            type="email"
            placeholder={t("placeholders.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder={t("placeholders.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p>
            {t("adminO.willLogInto")} <strong>{slug}</strong>
          </p>

          <label className="admin-agree">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            {t("privacy.agree")}
          </label>

          <button type="submit">{t("buttons.login")}</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
