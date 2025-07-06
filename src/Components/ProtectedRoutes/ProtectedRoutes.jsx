// 📁 src/components/ProtectedAdminRoute.jsx

import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { auth, db } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function ProtectedAdminRoute({ children }) {
  const { slug } = useParams();
  const [isAllowed, setIsAllowed] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !slug) {
        setIsAllowed(false);
        return;
      }

      const docRef = doc(db, "ReVerse", slug);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().adminEmail === user.email) {
        setIsAllowed(true);
      } else {
        setIsAllowed(false);
      }
    });

    return () => unsubscribe();
  }, [slug]);

  if (isAllowed === null) return null; // أو ممكن loader
  return isAllowed ? children : <Navigate to={`/reverse/${slug}`} replace />;
}

export default ProtectedAdminRoute;
