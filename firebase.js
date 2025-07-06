// firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDgaiFJLZ9c23CFHxylywvMJo6qKk19ORc",
  authDomain: "reverse-saas-98918.firebaseapp.com",
  projectId: "reverse-saas-98918",
  storageBucket: "reverse-saas-98918.firebasestorage.app",
  messagingSenderId: "536068162304",
  appId: "1:536068162304:web:29928e71ffa3d4c6b5a9e5",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db,};
