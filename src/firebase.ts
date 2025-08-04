import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDmynR9eARHWRndnsz9dMfK1Np9IxDeOao",
  authDomain: "union-task-app.firebaseapp.com",
  projectId: "union-task-app",
  storageBucket: "union-task-app.firebasestorage.app",
  messagingSenderId: "772485439083",
  appId: "1:772485439083:web:7d60b51a86e9a071a11b2e",
  measurementId: "G-6BL5212EVW"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);