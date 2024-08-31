document.addEventListener('DOMContentLoaded', function() {
    const tableRows = document.querySelectorAll('.a-table tbody tr');

    tableRows.forEach(function(row) {
        row.addEventListener('click', function() {
            // Αφαίρεση της κλάσης 'selected' από όλες τις γραμμές
            tableRows.forEach(r => r.classList.remove('selected'));
            
            // Προσθήκη της κλάσης 'selected' στη γραμμή που κλικάρεται
            row.classList.add('selected');
        });
    });
});



// JavaScript to handle redirection to the rescuer page
const params = new URLSearchParams(window.location.search);
const username = params.get('username');

if (username) {
    const mainPageLink = document.getElementById('mainPageLink');
    mainPageLink.href = `../res_page?username=${encodeURIComponent(username)}`;
}

// Global variables
let routeControl;
let movementStopped = false; // Flag to check if movement is stopped
let acceptedRequests = {}; // Object to track accepted requests
let rescuerInitialLatLng; // Variable to store the rescuer's initial position

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

// Fetch the signed-in rescuer's location and initialize the map
fetch('/take_location_of_signed_rescuer/get_rescuer_location')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const rescuerLatLng = L.latLng(data.location.longitude, data.location.latitude);

            rescuerInitialLatLng = rescuerLatLng; // Store the rescuer's initial position

            // Initialize the map and set its view to the rescuer's location
            var map = L.map('map').setView(rescuerLatLng, 13);

            // Set up the OSM layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Add the rescuer marker to the map
            rescuerMarker = L.marker(rescuerLatLng, { icon: redIcon })
                .addTo(map)
                .bindPopup('You are here')
                .openPopup();

            // Create a marker for the base (initially not draggable)
            var baseMarker = L.marker([38.2466, 21.7346], {
                draggable: false
            }).addTo(map)
                .bindPopup('Click here to confirm dragging the base location.');

            // Add click event to the marker to ask for confirmation
            baseMarker.on('click', function () {
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
            baseMarker.on('dragend', function (e) {
                var marker = e.target;
                var position = marker.getLatLng();
                marker.setLatLng(position, { draggable: true }).bindPopup(
                    "Base location: " + position.lat.toFixed(4) + ", " + position.lng.toFixed(4)
                ).openPopup();

                // You can add code to save the new base location here
                console.log("New base location: ", position);
            });

           
// Fetch and display request markers
fetch('/requests/get_request_locations')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            data.requests.forEach(request => {
                if (request.latitude && request.longitude) {
                    
                    const requestId = `${request.latitude}-${request.longitude}`; // Unique ID based on location

                    const generatePopupContent = () => `
                        <h1>Request</h1><br>
                        <b>Name:</b> ${request.name}<br>
                        <b>Phone:</b> ${request.phone}<br>
                        <b>Created At:</b> ${new Date(request.created_at).toLocaleString()}<br>
                        <b>Item:</b> ${request.item_name}<br>
                        <b>Quantity:</b> ${request.quantity}<br>
                        <b>Status:</b> ${request.status}<br>
                        <button class="accept-request" data-lat="${request.latitude}" data-lng="${request.longitude}" data-request-id="${requestId}">Accept</button>          
                        <button class="reject-request" data-request-id="${requestId}" style="display:none;">Reject</button>
                    `;

                    const marker = L.marker([request.latitude, request.longitude], { icon: squareIcon })
                        .addTo(map)
                        .bindPopup(generatePopupContent())
                        .on('popupopen', function() {
                            const acceptButton = document.querySelector(`.accept-request[data-request-id="${requestId}"]`);
                            const rejectButton = document.querySelector(`.reject-request[data-request-id="${requestId}"]`);
            
                            if (acceptButton && rejectButton) {
                                // Check the state and update the visibility of buttons accordingly
                                if (acceptedRequests[requestId]) {
                                    acceptButton.style.display = 'none';
                                    rejectButton.style.display = 'inline-block';

                                    // Make sure the initialLatLng is set in the reject button
                                    rejectButton.setAttribute('data-initial-latlng', `${rescuerInitialLatLng.lat},${rescuerInitialLatLng.lng}`);
                                } else {
                                    acceptButton.style.display = 'inline-block';
                                    rejectButton.style.display = 'none';
                                }
                            }
                        });
                }
            });
        } else {
            console.error('Failed to load requests');
        }
    })
    .catch(error => console.error('Error fetching requests:', error));

// Handle the "Accept" button click event
document.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('accept-request')) {
        const lat = parseFloat(event.target.getAttribute('data-lat'));
        const lng = parseFloat(event.target.getAttribute('data-lng'));
        const requestId = event.target.getAttribute('data-request-id'); // Unique ID 

        console.log('Request Lat:', lat, 'Lng:', lng); // Debugging

        // Store the initial location of the rescuer
        const initialLatLng = rescuerMarker.getLatLng();

        // Hide the "Accept" button and show the "Reject" button
        event.target.style.display = 'none';
        const rejectButton = event.target.nextElementSibling;
        rejectButton.style.display = 'inline-block';


        acceptedRequests[requestId] = true; // Mark the request as accepted

        // Reset movement stopped flag
        movementStopped = false;

        // Move the rescuer to the request location
        moveRescuerToRequest(rescuerMarker.getLatLng(), L.latLng(lat, lng));
    }
});

// Handle the "Reject" button click event
document.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('reject-request')) {
        const requestId = event.target.getAttribute('data-request-id'); // Unique ID

        // Stop the current route control and return the rescuer to the initial position
        if (routeControl) {
            map.removeControl(routeControl);
        }
        movementStopped = true; // Stop the movement

        rescuerMarker.setLatLng(rescuerInitialLatLng);

        // Hide the "Reject" button and show the "Accept" button again
        event.target.style.display = 'none';
        const acceptButton = event.target.previousElementSibling;
        acceptButton.style.display = 'inline-block';

        acceptedRequests[requestId] = false; // Allow the "Accept" button to be shown again
    }
});


            // Function to move rescuer to the request location
            function moveRescuerToRequest(startLatLng, targetLatLng, initialLatLng) {
                routeControl = L.Routing.control({
                    waypoints: [
                        startLatLng,
                        targetLatLng
                    ],
                    createMarker: function() { return null; }, // We create our own marker below
                    routeWhileDragging: false,
                    draggableWaypoints: false,
                    addWaypoints: false,
                    show: false  // This hides the instructions table
                }).addTo(map);

                // Hide the small close button
                document.querySelectorAll('.leaflet-routing-container-hide').forEach(function(element) {
                    element.style.display = 'none';
                });

                routeControl.on('routesfound', function(e) {
                    const route = e.routes[0];
                    const routeCoordinates = route.coordinates;
                    let index = 0;

                    // Function to move the marker
                    function moveMarker() {
                        if (movementStopped) return; // Stop movement if flag is set

                        if (index >= routeCoordinates.length) {
                            console.log('Rescuer has arrived at the request location');
                            return; // End of route
                        }
                        const latlng = routeCoordinates[index];
                        rescuerMarker.setLatLng(latlng); // Move the existing rescuer marker to the next coordinate
                        index++;
                        setTimeout(moveMarker, 200); // Adjust speed by changing the timeout value
                    }

                    moveMarker(); // Start the movement

                });
            }
        } else {
            console.error('Failed to fetch rescuer location');
        }
    })
    .catch(error => console.error('Error fetching rescuer location:', error));

// Define a custom red marker icon
var redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    iconSize: [25, 41], // size of the icon
    iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41] // size of the shadow
});

var squareIcon = L.divIcon({
    className: 'custom-square-marker',
    html: '<div style="width: 15px; height: 15px; background-color: red; border: 2px solid #555;"></div>',
    iconSize: [24, 24], // size of the icon
    iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
});
