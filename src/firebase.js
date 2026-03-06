// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBP7hgY39bMxLX41Zxg5WD5kQ5iLxabjIU",
  authDomain: "ainp-dc8dd.firebaseapp.com",
  projectId: "ainp-dc8dd",
  storageBucket: "ainp-dc8dd.firebasestorage.app",
  messagingSenderId: "239428629866",
  appId: "1:239428629866:web:e56f81d7252892bc676113",
  measurementId: "G-7T9GHG2P1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);