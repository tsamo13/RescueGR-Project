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
    mainPageLink.href = `../admin_page?username=${encodeURIComponent(username)}`;
}


// Event listener for the form submission
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('rescuerAccountForm').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent the default form submission behavior

        // Capture form data
        const rescuerUsername = document.getElementById('rescuerUsername').value.trim();
        const password = document.getElementById('password').value.trim();
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();

        try {
            const response = await fetch('/create_rescuer', {
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
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({title: 'Success!', text:'Rescuer account created successfully!', icon: 'success', confirmButtonText: 'OK'});
                document.getElementById('rescuerAccountForm').reset();
            } else {
                Swal.fire({title: 'Error!', text:'This username already exists!', icon: 'error', confirmButtonText: 'OK'});
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({title: 'Error!', text:'An error occurred while creating the account. Please try again', icon: 'error', confirmButtonText: 'OK'});
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Handle the logout button click event
    const logoutButton = document.getElementById('logoutButton');
    
    logoutButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent any default behavior
        
        fetch('/logout', {
            method: 'GET',
        })
        .then(response => {
            if (response.ok) {
                window.location.href = '/login'; // Redirect to the login page after logout
            } else {
                console.error('Logout failed');
            }
        })
        .catch(error => {
            console.error('Error during logout:', error);
        });
    });
});
