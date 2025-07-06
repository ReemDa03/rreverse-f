import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";
import { StoreContextProvider } from "./context/StoreContext";

// ✅ استدعاء i18n
import "./i18n/i18n";


import RedirectIfQuery from "./Components/RedirectIfQuery" ;

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <>
    <StoreContextProvider>
      <RedirectIfQuery /> {/* ✅ هون الاستدعاء */}
      <App />
      <ToastContainer />
      </StoreContextProvider>
    </>
  </BrowserRouter>
);
