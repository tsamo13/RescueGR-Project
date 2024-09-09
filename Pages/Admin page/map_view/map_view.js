// Initialize the map and set its view to Patras, Greece
var map = L.map('map').setView([38.2466, 21.7346], 13);

// Set up the OSM layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to initialize the base marker
function initializeBaseMarker(lat, lng) {
    var baseMarker = L.marker([lat, lng], {
        draggable: false
    }).addTo(map)
      .bindPopup('Click here to confirm dragging the base location.').openPopup();

    // Add click event to the marker to ask for confirmation
baseMarker.on('click', function() {
    Swal.fire({
        title: 'Do you want to drag the marker?',
        text: "You can drag the marker to set a new base location.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, drag it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            baseMarker.dragging.enable(); // Enable dragging
            baseMarker.bindPopup('Drag the marker to set the new base location.').openPopup();
        } else {
            baseMarker.dragging.disable(); // Ensure dragging is disabled
            baseMarker.bindPopup('Drag cancelled. Click again to confirm dragging.').openPopup();
        }
    });
});

    // Event listener to update the marker position on drag end
    baseMarker.on('dragend', function(e) {
        var marker = e.target;
        var position = marker.getLatLng();
        marker.setLatLng(position, {draggable: true}).bindPopup(
            "Base location: " + position.lat.toFixed(4) + ", " + position.lng.toFixed(4)
        ).openPopup();

        // Save the new base location to the database
        saveBaseLocation(position.lat, position.lng);
    });
}

// Function to save the new base location to the server
function saveBaseLocation(lat, lng) {
    fetch('/baseLocation/update_base_location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lat: lat, lng: lng })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Base location updated successfully!");
        } else {
            console.log("Failed to update base location.");
        }
    })
    .catch(error => {
        console.error("Error updating base location:", error);
    });
}

// Fetch the stored base location from the server
fetch('/baseLocation/get_base_location')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.location) {
            // If a location is stored in the database, use it
            initializeBaseMarker(data.location.lat, data.location.lng);
        } else {
            // If no location is stored, use the default (Patras, Greece)
            initializeBaseMarker(38.2466, 21.7346);
        }
    })
    .catch(error => {
        console.error('Error fetching base location:', error);
        // On error, default to Patras, Greece
        initializeBaseMarker(38.2466, 21.7346);
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


var squareIconRed = L.divIcon({
    className: 'custom-square-marker',
    html: '<div style="width: 15px; height: 15px; background-color: red; border: 2px solid #555;"></div>',
    iconSize: [24, 24], // size of the icon
    iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
});


var circleIconRed = L.divIcon({
    className: 'custom-circle-marker',
    html: '<div style="width: 15px; height: 15px; background-color: red; border-radius: 50%; border: 2px solid #555;"></div>',
    iconSize: [24, 24], // size of the icon
    iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
});


var squareIconGreen = L.divIcon({
    className: 'custom-square-marker',
    html: '<div style="width: 15px; height: 15px; background-color: green; border: 2px solid #555;"></div>',
    iconSize: [24, 24], // size of the icon
    iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
});


var circleIconGreen = L.divIcon({
    className: 'custom-circle-marker',
    html: '<div style="width: 15px; height: 15px; background-color: green; border-radius: 50%; border: 2px solid #555;"></div>',
    iconSize: [24, 24], // size of the icon
    iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
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


    document.addEventListener('DOMContentLoaded', function() {
        fetch('/requests/get_request_locations')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    data.requests.forEach(request => {
                         if (request.latitude && request.longitude) {
                            const markerIcon = request.is_accepted ? squareIconGreen : squareIconRed;
                            const marker = L.marker([request.latitude, request.longitude],{icon:markerIcon}).addTo(map);
                             marker.bindPopup(`
                                <h1>Request</h1><br>
                                <b>Name:</b> ${request.name}<br>
                                <b>Phone:</b> ${request.phone}<br>
                                <b>Created At:</b> ${new Date(request.created_at).toLocaleString()}<br>
                                <b>Item:</b> ${request.item_name}<br>
                                <b>Quantity:</b> ${request.quantity}<br>
                                <b>Status:</b> ${request.status}<br>
                                <b>Accepted At:</b> ${request.accepted_at ? new Date(request.accepted_at).toLocaleString() : 'Not accepted'}<br>
                                <b>Assigned Rescuer:</b> ${request.assigned_rescuer_id ? request.rescuer_username : 'Not assigned'}
                            `);
                        }
                    });
                } else {
                    console.error('Failed to load requests');
                }
            })
            .catch(error => console.error('Error fetching requests:', error));

    // Fetch rescuers data and add them to the map
    fetch('/admin_map/fetch_rescuers')
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

        // Fetch the offer locations and display them on the map
fetch('/offers/get_offer_locations')
.then(response => response.json())
.then(data => {
    if (data.success) {
        data.offers.forEach(offer => {
            if (offer.latitude && offer.longitude) {
                const markerIcon = offer.is_accepted ? circleIconGreen : circleIconRed;
                const marker = L.marker([offer.latitude, offer.longitude], { icon: markerIcon }).addTo(map);
                
                marker.bindPopup(`
                    <h1>Offer</h1><br>
                    <b>Name:</b> ${offer.name}<br>
                    <b>Phone:</b> ${offer.phone}<br>
                    <b>Created At:</b> ${new Date(offer.created_at).toLocaleString()}<br>
                    <b>Item:</b> ${offer.item_name}<br>
                    <b>Quantity:</b> ${offer.quantity}<br>
                    <b>Status:</b> ${offer.status}<br>
                    <b>Accepted At:</b> ${offer.accepted_at ? new Date(offer.accepted_at).toLocaleString() : 'Not accepted'}<br>
                    <b>Assigned Rescuer:</b> ${offer.assigned_rescuer_id ? offer.rescuer_username : 'Not assigned'}
                `);
            }
        });
    } else {
        console.error('Failed to load offers:', data.message);
    }
})
.catch(error => console.error('Error fetching offers:', error));

    });
       