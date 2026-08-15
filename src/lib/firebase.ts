import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC3vTBzb6TPI9ZSGgQD1fkCc9OuGTyRLyM",
  authDomain: "click-suvidha-5885f.firebaseapp.com",
  projectId: "click-suvidha-5885f",
  storageBucket: "click-suvidha-5885f.firebasestorage.app",
  messagingSenderId: "776666219788",
  appId: "1:776666219788:web:7ea007ebe96018286cb529"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
