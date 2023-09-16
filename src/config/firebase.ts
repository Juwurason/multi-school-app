// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getStorage, ref } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCSgbl8bj5FDIpCRBovBQd1nDLWgJgsmDw",
    authDomain: "grapple-a4d53.firebaseapp.com",
    projectId: "grapple-a4d53",
    storageBucket: "grapple-a4d53.appspot.com",
    messagingSenderId: "1044421142459",
    appId: "1:1044421142459:web:dc47d8563e49f6d47dc69e",
    measurementId: "G-ZFWKMMZ2ND"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const Storage = getStorage(app);

export const Bucket_url = "gs://grapple-a4d53.appspot.com"
