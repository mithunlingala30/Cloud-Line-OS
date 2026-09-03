import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQd26G-KFe4fto0akSBD18MdKTaSGwfP8",
  authDomain: "leetcod-cec3f.firebaseapp.com",
  projectId: "leetcod-cec3f",
  storageBucket: "leetcod-cec3f.firebasestorage.app",
  messagingSenderId: "950711951342",
  appId: "1:950711951342:web:cc2e53c9f84f578165f8ff",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    console.log("Fetching problems...");
    const querySnapshot = await getDocs(collection(db, "problems"));
    console.log(`Fetched ${querySnapshot.size} problems`);
    querySnapshot.forEach((doc) => {
      console.log(`ID: ${doc.id}`);
      console.log(JSON.stringify(doc.data(), null, 2));
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
  }
}

test();
