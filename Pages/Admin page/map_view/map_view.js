// Initialize the map and set its view to Patras, Greece
var map = L.map('map').setView([38.2466, 21.7346], 13);

// Set up the OSM layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Create a marker for the base (initially not draggable)
var baseMarker = L.marker([38.2466, 21.7346], {
    draggable: false
}).addTo(map)
  .bindPopup('Click here to confirm dragging the base location.').openPopup();

// Add click event to the marker to ask for confirmation
baseMarker.on('click', function() {
    var confirmation = confirm("Do you want to drag the marker to set a new base location?");
    if (confirmation) {
        baseMarker.dragging.enable(); // Enable dragging
        baseMarker.bindPopup('Drag the marker to set the new base location.').openPopup();
    } else {
        baseMarker.dragging.disable(); // Ensure dragging is disabled
        baseMarker.bindPopup('Drag cancelled. Click again to confirm dragging.').openPopup();
    }
});

// Event listener to update the marker position on drag end
baseMarker.on('dragend', function(e) {
    var marker = e.target;
    var position = marker.getLatLng();
    marker.setLatLng(position, {draggable: true}).bindPopup(
        "Base location: " + position.lat.toFixed(4) + ", " + position.lng.toFixed(4)
    ).openPopup();
    
    // You can add code to save the new base location here
    console.log("New base location: ", position);
});


// JavaScript to handle redirection to the admin page
const params = new URLSearchParams(window.location.search);
const username = params.get('username');

if (username) {
    const mainPageLink = document.getElementById('mainPageLink');
    mainPageLink.href = `../admin_page?username=${encodeURIComponent(username)}`;
}

// Define a custom red marker icon
var redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    iconSize: [25, 41], // size of the icon
    iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41] // size of the shadow
});

var lightGrayIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png', // Replace with the actual URL
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41]
});


var squareIcon = L.divIcon({
    className: 'custom-square-marker',
    html: '<div style="width: 15px; height: 15px; background-color: red; border: 2px solid #555;"></div>',
    iconSize: [24, 24], // size of the icon
    iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
});


// Fetch rescuers data and add them to the map
fetch('/manage_data/fetch_rescuers')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            data.rescuers.forEach(rescuer => {
                L.marker([rescuer.lat, rescuer.lng], { icon: redIcon })
                    .addTo(map)
                    .bindPopup(`Rescuer: <b>${rescuer.name}</b><br>
                        Availability: <b>${rescuer.availability === 1 ? 'Available' : 'Unavailable'}</b>`)
                    .openPopup();
            });
        } else {
            console.error('Failed to fetch rescuers:', data.message);
        }
    })
    .catch(error => console.error('Error:', error));



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


/*
    // Fetch civilian locations from the server
    fetch('/civilians/locations')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                data.locations.forEach(civilian => {
                    // Create a marker for each civilian location
                    const marker = L.marker([civilian.latitude, civilian.longitude],{icon:lightGrayIcon}).addTo(map);
                    marker.bindPopup(`<b>${civilian.name}</b>`); // Show the civilian's name when the marker is clicked
                });
            } else {
                console.error('Failed to load civilian locations:', data.message);
            }
        })
        .catch(error => console.error('Error fetching locations:', error));

        */

        document.addEventListener('DOMContentLoaded', function() {
            fetch('/requests/get_request_locations')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        data.requests.forEach(request => {
                            if (request.latitude && request.longitude) {
                                const marker = L.marker([request.latitude, request.longitude],{icon:squareIcon}).addTo(map);
                                marker.bindPopup(`
                                    <h1>Request</h1><br>
                                    <b>Name:</b> ${request.name}<br>
                                    <b>Phone:</b> ${request.phone}<br>
                                    <b>Created At:</b> ${new Date(request.created_at).toLocaleString()}<br>
                                    <b>Item:</b> ${request.item_name}<br>
                                    <b>Quantity:</b> ${request.quantity}<br>
                                    <b>Status:</b> ${request.status}
                                `);
                            }
                        });
                    } else {
                        console.error('Failed to load requests');
                    }
                })
                .catch(error => console.error('Error fetching requests:', error));
        });
       