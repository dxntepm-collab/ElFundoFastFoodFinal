import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyARwmtRZVPMt5OrM9_fgh3QEcUvz9hcX4s",
  authDomain: "el-fundo-pedidos.firebaseapp.com",
  projectId: "el-fundo-pedidos",
  storageBucket: "el-fundo-pedidos.firebasestorage.app",
  messagingSenderId: "436737582661",
  appId: "1:436737582661:web:6e253124372522ad49e52c",
  measurementId: "G-3MSPLW5NXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;