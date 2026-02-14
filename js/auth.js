import { auth, db } from './config.js';
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
 * Creates a user document in Firestore if it doesn't already exist.
 * This sets up the initial statistics for the vocabulary app.
 */
async function createUserDocument(user) {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

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
    }
}

/**
 * Registers a new user with email and password.
 * Creates Firestore document and redirects to dashboard.
 */
export async function registerUser(email, password) {
    // Error propagation handled by caller
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDocument(userCredential.user);
    window.location.href = "dashboard.html";
}

/**
 * Logs in an existing user.
 * Redirects to dashboard on success.
 */
export async function loginUser(email, password) {
    // Error propagation handled by caller
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
}

/**
 * Logs in with Google Popup.
 * Creates Firestore document if first time and redirects to dashboard.
 */
export async function googleLogin() {
    const provider = new GoogleAuthProvider();
    // Error propagation handled by caller
    const result = await signInWithPopup(auth, provider);
    await createUserDocument(result.user);
    window.location.href = "dashboard.html";
}

/**
 * Logs out the current user and redirects to login page.
 */
export async function logoutUser() {
    await signOut(auth);
    window.location.href = "login.html";
}

/**
 * Listens for authentication state changes.
 * @param {Function} callback - Function called with user object or null
 */
export function listenAuthState(callback) {
    return onAuthStateChanged(auth, callback);
}
