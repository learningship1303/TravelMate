// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdzpkMAcjMg1-SFFMPIiZ7_Om9-ML1qFY",
  authDomain: "aitripplanner-abda6.firebaseapp.com",
  projectId: "aitripplanner-abda6",
  storageBucket: "aitripplanner-abda6.firebasestorage.app",
  messagingSenderId: "640865070082",
  appId: "1:640865070082:web:b0620bde59d8ebbc418b1b",
  measurementId: "G-LVKYLPDCR9"
};

// Initialize Firebase
 export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export  const db = getFirestore(app);