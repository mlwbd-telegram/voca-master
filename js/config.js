// Import Firebase SDKs via CDN for a static setup without bundlers
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * Firebase Configuration
 * REPLACE these values with your actual Firebase project configuration.
 * You can find this in Firebase Console > Project Settings > General > Your Apps.
 */
const firebaseConfig = {
    apiKey: "AIzaSyDCYfLcfbBGj8HmRyuGv65pMeaghlOy37Y",
    authDomain: "voca-master-e2c47.firebaseapp.com",
    projectId: "voca-master-e2c47",
    storageBucket: "voca-master-e2c47.firebasestorage.app",
    messagingSenderId: "373797855962",
    appId: "1:373797855962:web:69e2ab2609e1d0ae9abbe3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);
const db = getFirestore(app);

// Export instances to be used by other modules
export { app, auth, db };
