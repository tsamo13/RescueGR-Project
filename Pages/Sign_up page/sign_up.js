document.addEventListener('DOMContentLoaded', function () {
    // Step 1.2: Initialize the map and set its view to a default location and zoom level
    const map = L.map('mapContainer').setView([38.2466, 21.7346], 13);

    // Add the OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);


    // Declare a marker variable (initially undefined)
    let marker;

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
    });

    // Step 1.3: Handle form submission
    document.getElementById('signupForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

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
                window.location.href = 'login_reg_page.html'; // Redirect to login page on success
            } else {
                alert('Sign up failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while signing up.');
        });
    });
});
