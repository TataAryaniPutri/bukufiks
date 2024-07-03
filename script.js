import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getFirestore,
    doc,
    setDoc,
    getDocs,
    collection,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBHJlaAVe3oFbQSHv7qoiUAhhA-SwD_K7o",
        authDomain: "hitomanager-a4e66.firebaseapp.com",
        databaseURL: "https://hitomanager-a4e66-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "hitomanager-a4e66",
        storageBucket: "hitomanager-a4e66.appspot.com",
        messagingSenderId: "1003083816407",
        appId: "1:1003083816407:web:9823633ac65171b7647f92"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Get the modal
    const modal = document.getElementById("myModal");
    const span = document.getElementsByClassName("close")[0];
    let targetElement;

    // Get the buttons that open the modal
    const btns = document.querySelectorAll(".tmbhbtn");

    // When the user clicks on the button, open the modal
    btns.forEach(btn => {
        btn.onclick = () => {
            targetElement = document.getElementById(btn.getAttribute("data-target"));
            modal.style.display = "block";
        };
    });

    // When the user clicks on <span> (x), close the modal
    span.onclick = () => {
        modal.style.display = "none";
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    // Function to write review
    async function writeReview(username, rating, ulasan, targetElementId) {
        try {
            const reviewId = Date.now().toString(); // Unique ID for each review
            await setDoc(doc(db, "bookstore", reviewId), {
                username: username,
                rating: rating,
                ulasan: ulasan,
                targetElementId: targetElementId
            });
            console.log("Review successfully written!");
            return reviewId;
        } catch (error) {
            console.error("Error writing document: ", error);
        }
    }

    // Function to delete review
    async function deleteReview(reviewId) {
        try {
            await deleteDoc(doc(db, "bookstore", reviewId));
            console.log("Review successfully deleted!");
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    }

    // Handle form submission
    document.getElementById("reviewForm").addEventListener('submit', async function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const rating = document.getElementById('rating').value;
        const ulasan = document.getElementById('ulasan').value;

        const reviewId = await writeReview(username, rating, ulasan, targetElement.id);

        // Add review to the target element with delete button
        const reviewHtml = `
            <div id="${reviewId}">
                <p><strong>${username}</strong> (${rating}/5): ${ulasan}</p>
                <button class="deleteReview" data-id="${reviewId}">Delete</button>
            </div>`;
        targetElement.innerHTML += reviewHtml;

        // Close modal
        modal.style.display = "none";

        // Clear form
        document.getElementById('username').value = '';
        document.getElementById('rating').value = '';
        document.getElementById('ulasan').value = '';
    });

    // Load reviews from Firestore on page load
    const querySnapshot = await getDocs(collection(db, "bookstore"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const targetElement = document.getElementById(data.targetElementId);
        if (targetElement) {
            const reviewHtml = `
                <div id="${doc.id}">
                    <p><strong>${data.username}</strong> (${data.rating}/5): ${data.ulasan}</p>
                    <button class="deleteReview" data-id="${doc.id}">Delete</button>
                </div>`;
            targetElement.innerHTML += reviewHtml;
        }
    });

    // Event listener for delete buttons
    document.addEventListener('click', async function(event) {
        if (event.target && event.target.className === 'deleteReview') {
            const reviewId = event.target.getAttribute('data-id');
            await deleteReview(reviewId);

            // Remove review from the page
            document.getElementById(reviewId).remove();
        }
    });
});