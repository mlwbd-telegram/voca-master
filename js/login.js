import { registerUser, loginUser, googleLogin } from './auth.js';

// DOM Elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const googleBtn = document.getElementById('googleBtn');

/**
 * Validate Inputs
 * @returns {object|null} Returns object with email/pass if valid, else null
 */
const getValidatedInputs = () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email) {
        alert("Please enter your email address.");
        return null;
    }

    if (!password) {
        alert("Please enter your password.");
        return null;
    }

    return { email, password };
};

// --- Event Listeners ---

// 1. Login Logic
loginBtn.addEventListener('click', () => {
    const creds = getValidatedInputs();
    if (creds) {
        // Basic loading state (optional UI enhancement)
        loginBtn.disabled = true;
        loginBtn.innerText = "Logging in...";
        
        loginUser(creds.email, creds.password)
            .catch(() => {
                // Reset button on failure (success redirects)
                loginBtn.disabled = false;
                loginBtn.innerText = "Log In";
            });
    }
});

// 2. Registration Logic
registerBtn.addEventListener('click', () => {
    const creds = getValidatedInputs();
    if (creds) {
        if (creds.password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        registerBtn.disabled = true;
        registerBtn.innerText = "Creating...";

        registerUser(creds.email, creds.password)
            .catch(() => {
                registerBtn.disabled = false;
                registerBtn.innerText = "Create Account";
            });
    }
});

// 3. Google Logic
googleBtn.addEventListener('click', () => {
    googleLogin();
});

// Initialization Log
console.log("Login module loaded.");
