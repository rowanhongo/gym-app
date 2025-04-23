// Import necessary Firebase modules (modular approach)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDidIFKMAAIkupCsJb1P1RV7zcpYx4as8g",
    authDomain: "gym-system-92b4f.firebaseapp.com",
    projectId: "gym-system-92b4f",
    storageBucket: "gym-system-92b4f.firebasestorage.app",
    messagingSenderId: "969893486977",
    appId: "1:969893486977:web:bce5970b3a668941160880"
};

// Initialize Firebase with the modular approach
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to load users and display them in tables
async function loadUsers() {
    let tableBody = document.getElementById("membersTableBody");
    let expiredTableBody = document.getElementById("expiredUsersTableBody");
    tableBody.innerHTML = "";  // Clear the table
    expiredTableBody.innerHTML = "";  // Clear the expired users table

    try {
        // Get the users collection from Firestore
        const usersCol = collection(db, "users");
        const snapshot = await getDocs(usersCol);
        const currentDate = new Date();

        let activeCount = 0;
        let expiredCount = 0;

        snapshot.forEach(doc => {
            let data = doc.data();
            let expiryDate = data.expiry_date.toDate();
            
            // Determine which table to insert the user into
            let targetTableBody = expiryDate < currentDate ? expiredTableBody : tableBody;

            // Increment counts
            if (expiryDate < currentDate) {
                expiredCount++;
            } else {
                activeCount++;
            }

            // Creating table row elements instead of using innerHTML for better performance and security
            let row = document.createElement('tr');
            
            let nameCell = document.createElement('td');
            nameCell.textContent = data.name;
            row.appendChild(nameCell);

            let phoneCell = document.createElement('td');
            phoneCell.textContent = data.phone;
            row.appendChild(phoneCell);

            let subscriptionCell = document.createElement('td');
            subscriptionCell.textContent = data.subscription_type;
            row.appendChild(subscriptionCell);

            let startDateCell = document.createElement('td');
            startDateCell.textContent = data.start_date.toDate().toISOString().split("T")[0];
            row.appendChild(startDateCell);

            let expiryDateCell = document.createElement('td');
            expiryDateCell.textContent = expiryDate.toISOString().split("T")[0];
            row.appendChild(expiryDateCell);

            let statusCell = document.createElement('td');
            statusCell.textContent = expiryDate < currentDate ? "Expired" : "Not Expired";
            row.appendChild(statusCell);

            // Append the row to the appropriate table body
            targetTableBody.appendChild(row);

            // Add Renew button only to expired members
            if (expiryDate < currentDate) {
                let actionsCell = document.createElement('td');
                let renewButton = document.createElement('button');
                renewButton.textContent = "Renew";
                renewButton.onclick = function() {
                    renewSubscription(doc.id, data.name, data.phone);
                };
                actionsCell.appendChild(renewButton);
                row.appendChild(actionsCell);
            }
        });

        // Update the counts in the HTML
        document.getElementById("totalMembersCount").textContent = `Total Active Users: ${activeCount}`;
        document.getElementById("expiredMembersCount").textContent = `Total Expired Members: ${expiredCount}`;
    } catch (error) {
        console.error("Error fetching users: ", error);
    }
}

// Function to renew a subscription
function renewSubscription(userId, name, phone) {
    const renewalForm = document.createElement('div');
    renewalForm.innerHTML = `
        <h3>Renew Subscription</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <label for="subscriptionType">Subscription Type:</label>
        <select id="subscriptionType">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
        </select>
        <label for="renewalDate">Renewal Date:</label>
        <input type="date" id="renewalDate" required>
        <button onclick="submitRenewal('${userId}')">Submit</button>
        <button onclick="closeRenewalForm()">Cancel</button>
    `;
    document.body.appendChild(renewalForm);
}

async function submitRenewal(userId) {
    const subscriptionType = document.getElementById('subscriptionType').value;
    const renewalDate = document.getElementById('renewalDate').value;

    if (subscriptionType && renewalDate) {
        try {
            const userDoc = doc(db, "users", userId);
            await updateDoc(userDoc, {
                subscription_type: subscriptionType,
                expiry_date: new Date(renewalDate)
            });
            alert("Subscription renewed successfully.");
            closeRenewalForm();
            loadUsers(); // Reload the tables to reflect the changes
        } catch (error) {
            console.error("Error renewing subscription: ", error);
            alert("Error renewing subscription. Please try again.");
        }
    } else {
        alert("All fields are required. Please try again.");
    }
}

function closeRenewalForm() {
    const renewalForm = document.querySelector('div');
    if (renewalForm) {
        document.body.removeChild(renewalForm);
    }
}

// Function to search members by name or phone number
async function searchMembers() {
    const searchInput = document.getElementById("searchInput").value.trim().toLowerCase();
    let userDetails = document.getElementById("userDetails");
    userDetails.innerHTML = "";  // Clear the user details section

    try {
        // Get the users collection from Firestore
        const usersCol = collection(db, "users");
        const snapshot = await getDocs(usersCol);
        const currentDate = new Date();
        let userFound = false;

        // Clear previous table data
        loadUsers();

        snapshot.forEach(doc => {
            let data = doc.data();
            let name = data.name.toLowerCase();
            let phone = data.phone;
            let expiryDate = data.expiry_date.toDate();

            // Check if the search input matches the user's name or phone number
            if (name.includes(searchInput) || phone.includes(searchInput)) {
                userFound = true;

                // Determine if the user is expired or not
                let status = expiryDate < currentDate ? "Expired" : "Not Expired";

                // Display user credentials at the top of the page with status
                userDetails.innerHTML = `
                    <h2>User Details</h2>
                    <p><strong>Name:</strong> ${data.name}</p>
                    <p><strong>Phone:</strong> ${data.phone}</p>
                    <p><strong>Subscription:</strong> ${data.subscription_type}</p>
                    <p><strong>Start Date:</strong> ${data.start_date.toDate().toISOString().split("T")[0]}</p>
                    <p><strong>Expiry Date:</strong> ${expiryDate.toISOString().split("T")[0]}</p>
                    <p><strong>Status:</strong> ${status}</p>
                    <button onclick="promptPasswordAndDelete('${doc.id}')">Delete</button> <!-- Add Delete Button -->
                `;

                // Highlight the matched user in the table
                let tableBody = expiryDate < currentDate ? document.getElementById("expiredUsersTableBody") : document.getElementById("membersTableBody");
                let rows = tableBody.getElementsByTagName("tr");

                for (let row of rows) {
                    if (row.cells[0].textContent.toLowerCase() === name || row.cells[1].textContent === phone) {
                        row.style.backgroundColor = "#ffff99";  // Highlight the matched row
                    }
                }
            }
        });

        // If no user is found, display an error message
        if (!userFound) {
            userDetails.innerHTML = `<p style="color: red;">User not found. Please check the spelling or try a different name/phone number.</p>`;
        }
    } catch (error) {
        console.error("Error searching users: ", error);
    }
}

// Function to prompt for password and delete user
async function promptPasswordAndDelete(userId) {
    let password = prompt("Please re-enter your password to delete this user:");

    if (password) {
        try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);

            await deleteDoc(doc(db, "users", userId));
            alert("User deleted successfully.");
            document.getElementById("userDetails").innerHTML = "";  // Clear the user details section
            location.reload();  // Reload the page to reset the table
        } catch (error) {
            console.error("Error deleting user: ", error);
            alert("Error deleting user. Please check your password and try again.");
        }
    }
}

// Attach the searchMembers function to the window object to make it globally accessible
window.searchMembers = searchMembers;

// Attach the promptPasswordAndDelete function to the window object to make it globally accessible
window.promptPasswordAndDelete = promptPasswordAndDelete;

// Attach the renewSubscription function to the window object to make it globally accessible
window.renewSubscription = renewSubscription;
window.submitRenewal = submitRenewal;
window.closeRenewalForm = closeRenewalForm;

// Function to clear the search input and user details
function clearSearch() {
    document.getElementById("searchInput").value = "";  // Clear the search input
    document.getElementById("userDetails").innerHTML = "";  // Clear the user details section
    loadUsers();  // Reload the users to reset the table
}

// Attach the clearSearch function to the window object to make it globally accessible
window.clearSearch = clearSearch;

// Event listener for loading users once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadUsers);