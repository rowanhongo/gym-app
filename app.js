//v18
// Register the service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, (err) => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

// Add to Home Screen prompt handling
let deferredPrompt;
const installButton = document.getElementById('installButton');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installButton.style.display = 'block';

  installButton.addEventListener('click', () => {
    installButton.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  });
});

// Firebase initialization code
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDidIFKMAAIkupCsJb1P1RV7zcpYx4as8g",
  authDomain: "gym-system-92b4f.firebaseapp.com",
  projectId: "gym-system-92b4f",
  storageBucket: "gym-system-92b4f.firebasestorage.app",
  messagingSenderId: "969893486977",
  appId: "1:969893486977:web:bce5970b3a668941160880"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Calculate expiry date based on subscription type
function calculateExpiry() {
    let startDate = document.getElementById("start_date").value;
    let subscription = document.getElementById("subscription").value;

    if (!startDate) return;

    startDate = new Date(startDate);

    if (subscription === "daily") startDate.setDate(startDate.getDate() + 1);
    else if (subscription === "weekly") startDate.setDate(startDate.getDate() + 7);
    else if (subscription === "monthly") startDate.setMonth(startDate.getMonth() + 1);
    else if (subscription === "quarterly") startDate.setMonth(startDate.getMonth() + 3);
    else if (subscription === "annually") startDate.setMonth(startDate.getMonth() + 12);
    
    document.getElementById("expiry_date").value = startDate.toISOString().split("T")[0];  // Update expiry date
}

// Register user
async function registerUser() {
    let phone = document.getElementById("phone").value.trim();
    let name = document.getElementById("name").value.trim();
    let subscription = document.getElementById("subscription").value;
    let startDate = document.getElementById("start_date").value;
    let expiryDate = document.getElementById("expiry_date").value;

    // Validate phone number
    if (!/^\d{10}$/.test(phone)) {
        alert("Phone number must be exactly 10 digits.");
        return;
    }

    // Validate full name
    if (name.trim().split(" ").length < 2) {
        alert("Please enter your full name (e.g., John Doe).");
        return;
    }

    // Validate start date
    let selectedDate = new Date(startDate);
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        document.getElementById("dateErrorMessage").style.display = "block"; // Show error message
        return;
    } else {
        document.getElementById("dateErrorMessage").style.display = "none"; // Hide error message if valid
    }

    try {
        const userDoc = await getDoc(doc(db, "users", phone));
        if (userDoc.exists()) {
            document.getElementById("signupErrorMessage").innerText = "❌ Phone number already registered.";
            document.getElementById("signupErrorMessage").style.display = "block";
            document.getElementById("signupSuccessMessage").style.display = "none";
            return;
        }

        // Save user data to Firestore
        await setDoc(doc(db, "users", phone), {
            name,
            phone,
            subscription_type: subscription,
            start_date: new Date(startDate),
            expiry_date: new Date(expiryDate),
            registered_by: auth.currentUser.email
        });

        document.getElementById("signupSuccessMessage").innerText = "✅ Registration successful!";
        document.getElementById("signupSuccessMessage").style.display = "block";
        document.getElementById("signupErrorMessage").style.display = "none";

        // Reset the form
        document.getElementById("signupForm").reset();
        document.getElementById("expiry_date").value = "";

        loadTotalMembers();
    } catch (error) {
        console.error("Error registering user: ", error);
        document.getElementById("signupErrorMessage").innerText = "❌ Error registering user.";
        document.getElementById("signupErrorMessage").style.display = "block";
        document.getElementById("signupSuccessMessage").style.display = "none";
    }
}

// Load total members count
async function loadTotalMembers() {
    let snapshot = await getDocs(collection(db, "users"));
    document.getElementById("totalMembers").innerText = snapshot.size;
}

// Validate start date for today or future date
function validateStartDate() {
    let startDateInput = document.getElementById("start_date");
    let dateErrorMessage = document.getElementById("dateErrorMessage");
    let selectedDate = new Date(startDateInput.value);
    let today = new Date();
    
    // Reset the error message in case the user changes the date
    dateErrorMessage.style.display = "none";

    // Set the time to 00:00:00 to avoid time differences affecting the validation
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // Check if the selected date is in the past
    if (selectedDate < today) {
        dateErrorMessage.style.display = "block"; // Show error message
        startDateInput.setCustomValidity("Please select today or a future date.");
    } else {
        dateErrorMessage.style.display = "none"; // Hide error message if valid
        startDateInput.setCustomValidity(""); // Clear error message if valid
    }
}

// Attach event listeners when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Attach event listener for the subscription dropdown
    document.getElementById("subscription").addEventListener('change', () => {
        calculateExpiry();
    });

    // Attach event listener for the start date input
    document.getElementById("start_date").addEventListener('change', () => {
        calculateExpiry();
        validateStartDate();
    });

    // Attach event listener for the register button
    document.getElementById("registerBtn").addEventListener('click', registerUser);

    // Attach event listener for the login button
    document.getElementById("loginBtn").addEventListener('click', loginUser);

    // Attach event listener for the logout button
    document.getElementById("logoutBtn").addEventListener('click', logoutUser);

    // Monitor auth state
    onAuthStateChanged(auth, (user) => {
        if (user) {
            document.getElementById("usernameDisplay").innerText = `Logged in as: ${user.email}`;
            document.getElementById("signupForm").style.display = "block";
            document.getElementById("loginForm").style.display = "none";
            loadTotalMembers();
        } else {
            document.getElementById("usernameDisplay").innerText = "";
            document.getElementById("signupForm").style.display = "none";
            document.getElementById("loginForm").style.display = "block";
        }
    });
});

// Function to log in user
async function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        document.getElementById("loginErrorMessage").style.display = "none";
    } catch (error) {
        if (error.code === "auth/wrong-password") {
            document.getElementById("loginErrorMessage").innerText = "Incorrect password. Please try again.";
        } else if (error.code === "auth/user-not-found") {
            document.getElementById("loginErrorMessage").innerText = "User not registered. Please register first.";
        } else if (error.code === "auth/network-request-failed") {
            document.getElementById("loginErrorMessage").innerText = "Network error. Please try again.";
        } else {
            document.getElementById("loginErrorMessage").innerText = "Login failed. Please check your credentials.";
        }
        document.getElementById("loginErrorMessage").style.display = "block";
    }
}

// Function to log out user
function logoutUser() {
    signOut(auth).then(() => {
        console.log("User signed out.");
    }).catch((error) => {
        console.error("Sign out error: ", error);
    });
}