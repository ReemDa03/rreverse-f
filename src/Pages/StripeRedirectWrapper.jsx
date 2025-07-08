import { useLocation } from "react-router-dom";
import StripeRedirect from "./StripeRedirect";
import { StoreContextProvider } from "../context/StoreContext";

const StripeRedirectWrapper = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const slug = queryParams.get("slug");

  return (
    <StoreContextProvider slug={slug}>
      <StripeRedirect />
    </StoreContextProvider>
  );
};

export default StripeRedirectWrapper;
