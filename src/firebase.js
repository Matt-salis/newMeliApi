// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, doc, writeBatch, getDocs, getDoc, setDoc, updateDoc, query, where, arrayUnion } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCP-bHROB02e7AcgSiulCRHWZj3M4wBOf4",
  authDomain: "meliapp-d1e77.firebaseapp.com",
  projectId: "meliapp-d1e77",
  storageBucket: "meliapp-d1e77.appspot.com",
  messagingSenderId: "204429319513",
  appId: "1:204429319513:web:da86d4e41b1b23f9d0c048",
  measurementId: "G-FML98F787G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export {
  db,
  collection,
  doc,
  writeBatch,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  arrayUnion,
  updateDoc
};