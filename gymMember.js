import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, setDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration
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

document.getElementById('loginBtn').addEventListener('click', function() {
    const phone = document.getElementById('phone').value.trim();
    console.log("Phone input:", phone); // Debug log

    if (phone === '') {
        displayErrorMessage('Phone number is required.');
        return;
    }

    // Fetch member data from Firestore
    loginMember(phone).then(memberData => {
        if (memberData) {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('memberContent').style.display = 'flex';
            document.getElementById('memberName').innerText = memberData.name || 'N/A';
            displayMemberDetails(memberData);
            loadAvailableClasses();
            loadBookedClasses(phone);
        } else {
            displayErrorMessage('❌ Login failed. Please check your phone number.');
        }
    }).catch(error => {
        displayErrorMessage('❌ Login failed. Please try again later.');
        console.error(error);
    });
});

function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('loginErrorMessage');
    errorMessageElement.innerText = message;
    errorMessageElement.style.display = 'block';
}

function displaySuccessMessage(message) {
    const successMessageElement = document.getElementById('bookingSuccessMessage');
    successMessageElement.innerText = message;
    successMessageElement.style.display = 'block';
}

// Function to fetch member data from Firestore
async function loginMember(phone) {
    try {
        const docRef = doc(db, "users", phone);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        throw error;
    }
}

// Function to display member details
function displayMemberDetails(memberData) {
    const subscriptionTypeElement = document.getElementById('subscriptionType');
    const startDateElement = document.getElementById('startDate');
    const expiryDateElement = document.getElementById('expiryDate');

    subscriptionTypeElement.innerText = memberData.subscriptionType || 'N/A';
    startDateElement.innerText = memberData.startDate ? formatDate(memberData.startDate.toDate()) : 'N/A';
    expiryDateElement.innerText = memberData.expiryDate ? formatDate(memberData.expiryDate.toDate()) : 'N/A';
}

// Function to format date
function formatDate(date) {
    return date.toISOString().split("T")[0];
}

// Logout function
document.querySelector(".logout").addEventListener("click", function() {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    }).catch((error) => {
        console.error("Error logging out: ", error);
    });
});

// Redirect to risk warning page
document.getElementById('documentsIcon').addEventListener('click', function() {
    window.location.href = "risk-warning.html";
});

// Function to load available classes
async function loadAvailableClasses() {
    try {
        const classesSnapshot = await getDocs(collection(db, "classes"));
        const classSelect = document.getElementById('classSelect');
        classSelect.innerHTML = ''; // Clear existing options
        classesSnapshot.forEach((doc) => {
            const classData = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.text = `${classData.Class} - ${classData.Day} - ${classData.Time} (${classData.Instructor})`;
            classSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading classes: ", error);
    }
}

// Function to book a class
document.getElementById('bookingForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    console.log("Book Class button clicked"); // Debug log
    const phone = document.getElementById('phone').value.trim();
    const classId = document.getElementById('classSelect').value;
    console.log("Phone:", phone); // Debug log
    console.log("Class ID:", classId); // Debug log
    try {
        const memberRef = doc(db, "users", phone);
        const classRef = doc(db, "classes", classId);
        await setDoc(doc(collection(memberRef, "bookedClasses"), classId), {
            classRef: classRef,
            bookedAt: new Date()
        });
        await incrementClassBookingCount(classId);
        displaySuccessMessage("✔️ Class booked successfully!");
        loadBookedClasses(phone);
    } catch (error) {
        displayErrorMessage("❌ Failed to book class. Please try again.");
        console.error("Error booking class:", error);
    }
});

// Function to increment the class booking count
async function incrementClassBookingCount(classId) {
    const classBookingRef = doc(db, "booked", classId);
    const classBookingSnap = await getDoc(classBookingRef);

    if (classBookingSnap.exists()) {
        await updateDoc(classBookingRef, {
            count: classBookingSnap.data().count + 1
        });
    } else {
        await setDoc(classBookingRef, {
            count: 1,
            lastUpdated: serverTimestamp()
        });
    }
}

// Function to load booked classes
async function loadBookedClasses(phone) {
    try {
        const bookedClassesList = document.getElementById('bookedClassesList');
        bookedClassesList.innerHTML = '';
        const bookedClassesSnapshot = await getDocs(collection(doc(db, "users", phone), "bookedClasses"));
        bookedClassesSnapshot.forEach(async (doc) => {
            const classData = (await getDoc(doc.data().classRef)).data();
            const listItem = document.createElement('div');
            listItem.classList.add('booked-class-item');
            listItem.innerText = `${classData.Class} - ${classData.Day} - ${classData.Time} (${classData.Instructor})`;
            bookedClassesList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error loading booked classes:", error);
    }
}

// Function to reset class booking counts every Sunday
async function resetClassBookingCounts() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 0) { // Sunday
        const classesSnapshot = await getDocs(collection(db, "booked"));
        classesSnapshot.forEach(async (doc) => {
            await updateDoc(doc.ref, {
                count: 0
            });
        });
    }
}

// Call the reset function at initialization
resetClassBookingCounts();