// Function to toggle password visibility
function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('showPassword');
    if (showPasswordCheckbox.checked) {
        passwordField.type = 'text';
    } else {
        passwordField.type = 'password';
    }
}

// JavaScript to handle redirection to the admin page
const params = new URLSearchParams(window.location.search);
const username = params.get('username');

if (username) {
    const mainPageLink = document.getElementById('mainPageLink');
    mainPageLink.href = `../admin_page.html?username=${encodeURIComponent(username)}`;
}

// Prevent form submission from doing anything and clear the form fields
document.getElementById('rescuerAccountForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Αποτρέπει οποιαδήποτε ενέργεια να γίνει κατά την υποβολή της φόρμας

    // Καθαρίζει όλα τα πεδία της φόρμας
    document.getElementById('rescuerAccountForm').reset();
});
