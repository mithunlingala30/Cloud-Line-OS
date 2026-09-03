// Firebase client SDK — safe to expose in frontend bundles.
// Security is enforced by Firestore rules, not by hiding this config.
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCQd26G-KFe4fto0akSBD18MdKTaSGwfP8",
  authDomain: "leetcod-cec3f.firebaseapp.com",
  projectId: "leetcod-cec3f",
  storageBucket: "leetcod-cec3f.firebasestorage.app",
  messagingSenderId: "950711951342",
  appId: "1:950711951342:web:cc2e53c9f84f578165f8ff",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
