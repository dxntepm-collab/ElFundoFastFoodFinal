import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyARwmtRZVPMt5OrM9_fgh3QEcUvz9hcX4s",
  authDomain: "el-fundo-pedidos.firebaseapp.com",
  projectId: "el-fundo-pedidos",
  storageBucket: "el-fundo-pedidos.firebasestorage.app",
  messagingSenderId: "436737582661",
  appId: "1:436737582661:web:6e253124372522ad49e52c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };