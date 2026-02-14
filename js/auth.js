import { auth, db } from "./config.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * Helper: Create User Document in Firestore
 * Initializes user stats if the document does not exist.
 * @param {object} user - The Firebase Auth user object
 */
async function createUserDocument(user) {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    
    try {
        const userSnap = await getDoc(userRef);

        // Only create if it doesn't exist (prevents overwriting data on Google login)
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                email: user.email,
                currentLevel: 0,
                totalScore: 0,
                totalAttempts: 0,
                correctAnswers: 0,
                accuracy: 0,
                createdAt: serverTimestamp()
            });
            console.log("User document created in Firestore.");
        }
    } catch (error) {
        console.error("Error creating user document:", error);
        throw error;
    }
}

/**
 * 1) Register with Email & Password
 */
export async function registerUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserDocument(userCredential.user);
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Registration failed:", error);
        alert(`Registration Error: ${error.message}`);
    }
}

/**
 * 2) Login with Email & Password
 */
export async function loginUser(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Login failed:", error);
        alert(`Login Error: ${error.message}`);
    }
}

/**
 * 3) Login with Google
 */
export async function googleLogin() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        await createUserDocument(result.user);
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Google Login failed:", error);
        alert(`Google Login Error: ${error.message}`);
    }
}

/**
 * 4) Logout
 */
export async function logoutUser() {
    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (error) {
        console.error("Logout failed:", error);
    }
}

/**
 * 5) Auth State Listener
 * Used to protect routes and initialize UI state.
 * @param {function} callback - Function to execute with user object (or null)
 */
export function listenAuthState(callback) {
    onAuthStateChanged(auth, (user) => {
        if (callback) callback(user);
    });
}
