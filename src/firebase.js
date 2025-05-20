import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCv-2LD5nEwS8-Tpr-c68GbL58cRelNJFU",
  authDomain: "eartickle.firebaseapp.com",
  projectId: "eartickle",
  storageBucket: "eartickle.appspot.com",
  messagingSenderId: "91954294138",
  appId: "1:91954294138:web:d3e8f501792bc5b607bac3",
  measurementId: "G-XECDHDW03X"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
