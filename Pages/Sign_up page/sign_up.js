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

document.addEventListener('DOMContentLoaded', function () {
    // Step 1.2: Initialize the map and set its view to a default location and zoom level
    const map = L.map('mapContainer').setView([38.2466, 21.7346], 13);

    // Add the OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);


    // Declare a marker variable (initially undefined)
    let marker;

    let locationSelected = false;

    // Update the marker's location and hidden fields when the user clicks on the map
    map.on('click', function (e) {
        // If the marker doesn't exist, create it
        if (!marker)
        {
            marker = L.marker(e.latlng).addTo(map);
        } else {
            // If the marker exists, move it to the new location
            marker.setLatLng(e.latlng);
        }
        marker.setLatLng(e.latlng);
        document.getElementById('latitude').value = e.latlng.lat;
        document.getElementById('longitude').value = e.latlng.lng;

        locationSelected = true;
    });

    // Step 1.3: Handle form submission
    document.getElementById('signupForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        if (!locationSelected) {
            Swal.fire({title: 'Error!', text:'Please select your location on the map before signing up.', icon: 'error', confirmButtonText: 'OK'});
            return;
        }
        

        const formData = {
            name: document.getElementById('name').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            telephone: document.getElementById('telephone').value,
            latitude: document.getElementById('latitude').value,
            longitude: document.getElementById('longitude').value
        };

        fetch('/civilians/sign_up', { // Assuming /sign_up is the endpoint for handling sign-ups
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({title: 'Success!', text:'Civilian account created successfully!', icon: 'success', confirmButtonText: 'OK'});
                document.getElementById('signupForm').reset();

            } else {
                Swal.fire({title: 'Error!', text:'This username already exists!', icon: 'error', confirmButtonText: 'OK'});
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({title: 'Error!', text:'An error occurred while signing up. Please try again', icon: 'error', confirmButtonText: 'OK'});
        });
    });
});
