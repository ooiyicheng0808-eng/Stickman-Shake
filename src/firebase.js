// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1-oRxy187L6_JMI54-Lp9vOXVEtcXO8Q",
  authDomain: "chess-2d9c3.firebaseapp.com",
  projectId: "chess-2d9c3",
  storageBucket: "chess-2d9c3.firebasestorage.app",
  messagingSenderId: "1023612889919",
  appId: "1:1023612889919:web:da47993b6bb07710b9018a",
  measurementId: "G-80EHLY36VG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);