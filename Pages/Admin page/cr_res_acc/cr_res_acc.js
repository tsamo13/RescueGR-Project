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


// Event listener for the form submission
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('rescuerAccountForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission behavior

        // Capture form data
        const rescuerUsername = document.getElementById('rescuerUsername').value.trim();
        const password = document.getElementById('password').value.trim();
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();


        // Send the POST request to create a rescuer account
        fetch('/create_rescuer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: rescuerUsername,
                password: password,
                name: name,
                phone: phone
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Handle success
                alert('Rescuer account created successfully!');
                document.getElementById('rescuerAccountForm').reset();
            } else {
                // Handle error
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while creating the account.');
        });
    });
});

