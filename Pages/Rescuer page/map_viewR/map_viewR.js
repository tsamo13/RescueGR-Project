document.addEventListener('DOMContentLoaded', function () {
    const viewLoadButton = document.getElementById('viewLoadButton');  //button for viewing the load
    const viewLoadPopup = document.getElementById('viewLoadPopup');    // popup for viewing the load of vehicle
    const closeViewLoadPopupBtn = document.querySelector('.close-view-load-popup-btn'); // button to close the popup window
    const loadButton = document.getElementById('loadButton');
    const unloadButton = document.getElementById('unloadButton');
    let baseLatLng = null; // To store base marker's position

    viewLoadButton.addEventListener('click', function () {
        // Display data in the table (could be replaced with dynamic data from the server)
        const viewLoadTableBody = document.querySelector('.view-load-table tbody');
        viewLoadTableBody.innerHTML = `
            <tr>
                <td>Example Item 1</td>
                <td>10</td>
            </tr>
            <tr>
                <td>Example Item 2</td>
                <td>5</td>
            </tr>
        `;

        viewLoadPopup.style.display = 'flex';
    });

    closeViewLoadPopupBtn.addEventListener('click', function () {
        viewLoadPopup.style.display = 'none';
    });

    window.addEventListener('click', function (event) {  //If the user clicks outside the pop-up (but inside the overlay), the pop-up is hidden.
        if (event.target === viewLoadPopup) {
            viewLoadPopup.style.display = 'none';
        }
    });

    const tableBody = document.querySelector('.a-table tbody');
    let currentTaskId = null;
    let rescuerId;
    let acceptedRequests = {};

    // Fetch the signed-in rescuer's location and initialize the map
    fetch('/take_location_of_signed_rescuer/get_rescuer_location')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const rescuerLatLng = L.latLng(data.location.longitude, data.location.latitude);
                rescuerId = data.rescuerId;
                console.log('Rescuer id: ', rescuerId);

                fetchPendingTasks(rescuerId);

                const map = L.map('map').setView(rescuerLatLng, 13);

                // Set up the OSM layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                // Add the rescuer marker to the map (draggable)
                const rescuerMarker = L.marker(rescuerLatLng, {
                    icon: redIcon,
                    draggable: true
                }).addTo(map)
                    .bindPopup('You are here')
                    .openPopup();

                // Fetch and display the base marker
                fetch('/baseLocation/get_base_location')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && data.location) {
                            baseLatLng = L.latLng(data.location.lat, data.location.lng); // Store base position
                            L.marker(baseLatLng, {
                                draggable: false,
                            }).addTo(map)
                                .bindPopup('Base location')
                                .openPopup();

                                fetchOffers();
                        } else {
                            console.error('No base location found.');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching base location:', error);
                    });

                    // Fetch offers and display them on the map
function fetchOffers() {
    fetch('/admin_map/get_offer_locations') // Ensure the backend endpoint exists for rescuer
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                data.offers.forEach(offer => {
                    if (offer.latitude && offer.longitude) {
                        const marker = L.marker([offer.latitude, offer.longitude], { icon: circleIcon }).addTo(map);

                        marker.bindPopup(`
                            <h1>Offer</h1><br>
                            <b>Name:</b> ${offer.name}<br>
                            <b>Phone:</b> ${offer.phone}<br>
                            <b>Created At:</b> ${new Date(offer.created_at).toLocaleString()}<br>
                            <b>Item:</b> ${offer.item_name}<br>
                            <b>Quantity:</b> ${offer.quantity}<br>
                            <b>Accepted At:</b> ${offer.accepted_at ? new Date(offer.accepted_at).toLocaleString() : 'Not accepted'}<br>
                            <b>Assigned Rescuer:</b> ${offer.assigned_rescuer_id ? offer.assigned_rescuer_id : 'Not assigned'}
                        `);
                    }
                });
            } else {
                console.error('Failed to load offers:', data.message);
            }
        })
        .catch(error => console.error('Error fetching offers:', error));
}

                    

                // Handle rescuer marker dragend event to update rescuer's location
                rescuerMarker.on('dragend', function (e) {
                    const newLatLng = rescuerMarker.getLatLng();
                    console.log('New rescuer position:', newLatLng);

                    // Send the new location to the server to update the database
                    fetch('/take_location_of_signed_rescuer/update_rescuer_location', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            rescuer_id: rescuerId,
                            latitude: newLatLng.lat,
                            longitude: newLatLng.lng
                        })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (!data.success) {
                                console.error('Failed to update rescuer location:', data.message);
                            } else {
                                console.log('Rescuer location updated successfully!');
                            }
                        })
                        .catch(error => console.error('Error updating rescuer location:', error));

                    // Check distance to base
                    if (baseLatLng) {
                        const distance = newLatLng.distanceTo(baseLatLng); // Distance in meters
                        console.log('Distance to base:', distance);
                        if (distance <= 100) {
                            loadButton.disabled = false;
                            unloadButton.disabled = false;
                        } else {
                            loadButton.disabled = true;
                            unloadButton.disabled = true;
                        }
                    }
                });

                // Fetch and display request markers
                fetch('/requests/get_request_locations')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            data.requests.forEach(request => {
                                if (request.latitude && request.longitude) {
                                    const requestId = `${request.request_id}`; // Unique ID based on request ID

                                    const generatePopupContent = () => `
                                        <h1>Request</h1><br>
                                        <b>Name:</b> ${request.name}<br>
                                        <b>Phone:</b> ${request.phone}<br>
                                        <b>Created At:</b> ${new Date(request.created_at).toLocaleString()}<br>
                                        <b>Item:</b> ${request.item_name}<br>
                                        <b>Quantity:</b> ${request.quantity}<br>
                                        <b>Status:</b> ${request.status}<br>
                                        ${request.is_accepted ? '' : `<button class="accept-request" data-request-id="${requestId}" style="display:inline-block;">Accept</button>`}
                                    `;

                                    const marker = L.marker([request.latitude, request.longitude], { icon: squareIcon })
                                        .addTo(map)
                                        .bindPopup(generatePopupContent())
                                        .on('popupopen', function () {
                                            const acceptButton = document.querySelector(`.accept-request[data-request-id="${requestId}"]`);

                                            if (acceptButton && request.is_accepted) {
                                                acceptButton.style.display = 'none';
                                            }
                                        });
                                }
                            });
                        } else {
                            console.error('Failed to load requests');
                        }
                    })
                    .catch(error => console.error('Error fetching requests:', error));
            } else {
                console.error('Failed to fetch rescuer location');
            }
        })
        .catch(error => console.error('Error fetching rescuer location:', error));

        

    // Fetch and display pending tasks
    function fetchPendingTasks(rescuerId) {
        fetch(`/tasks/get_pending_tasks?rescuerId=${rescuerId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    data.tasks.forEach(task => {
                        const row = document.createElement('tr');
                        row.setAttribute('data-task-id', task.task_id);

                        row.innerHTML = `
                        <td>${task.civilian_name}</td>
                        <td>${task.civilian_phone}</td>
                        <td>${new Date(task.created_at).toLocaleString()}</td>
                        <td>${task.type}</td>
                        <td>${task.item_name}</td>
                        <td>${task.quantity}</td>
                    `;
                        tableBody.appendChild(row);
                    });
                } else {
                    console.error('Failed to load tasks:', data.message);
                }
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    // Handle task row selection
    tableBody.addEventListener('click', function (event) {
        const row = event.target.closest('tr');

        if (row) {
            // Remove 'selected' class from all rows
            Array.from(tableBody.getElementsByTagName('tr')).forEach(r => r.classList.remove('selected'));

            // Add 'selected' class to clicked row
            row.classList.add('selected');

            // Enable the task buttons
            document.getElementById('completeTaskBtn').disabled = false;
            document.getElementById('cancelTaskBtn').disabled = false;

            // Set the current task ID
            currentTaskId = row.getAttribute('data-task-id');
        }
    });

    // Handle the "Cancel Task" button click event
    document.querySelector('.cancel-task-btn').addEventListener('click', function () {
        if (currentTaskId) {
            const intTaskId = parseInt(currentTaskId, 10);  //Ensure the request ID is an integer
            console.log('Canceling task with ID:', currentTaskId); //Debug log
            // Update the task status in the database
            fetch('/tasks/update_task_status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rescuer_id: rescuerId, // Use the actual rescuer's ID
                    task_id: intTaskId,
                    status: 'Canceled'
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log('Task canceled successfully!');
                        acceptedRequests[currentTaskId] = false; // Reset the acceptedRequests object for that task
                        document.querySelector(`tr[data-task-id="${currentTaskId}"]`).remove(); // Remove task from table
                        currentTaskId = null; // Clear the current task ID

                        // Set rescuer as available again
                        updateRescuerAvailability(rescuerId, true); // Set rescuer availability to true

                        // Disable the task buttons
                        document.getElementById('completeTaskBtn').disabled = true;
                        document.getElementById('cancelTaskBtn').disabled = true;
                    } else {
                        console.error('Failed to cancel task:', data.message);
                    }
                })
                .catch(error => console.error('Error canceling task:', error));
        } else {
            console.error('No task is currently selected.');
        }
    });

    // JavaScript to handle redirection to the rescuer page
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');

    if (username) {
        const mainPageLink = document.getElementById('mainPageLink');
        if (mainPageLink) { // Ensure the element exists
            mainPageLink.href = `../res_page?username=${encodeURIComponent(username)}`;
        }
    }

    // Handle the logout button click event
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) { // Ensure the element exists
        logoutButton.addEventListener('click', function (event) {
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
    }

    // Handle the "Accept" button click event
    document.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('accept-request')) {
            const requestId = event.target.getAttribute('data-request-id'); // Unique ID 

            // Hide the "Accept" button and set the task as accepted
            event.target.style.display = 'none';

            acceptedRequests[requestId] = true; // Mark the request as accepted
            currentTaskId = requestId; // Set the current task ID

            // Create the task in the database
            fetch('/tasks/create_task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rescuer_id: rescuerId, // Use the actual rescuer's ID
                    request_id: requestId
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (!data.success) {

                        Swal.fire({ title: 'Error!', text: data.message, icon: 'error', confirmButtonText: 'OK' });
                        console.error('Failed to create task:', data.message);

                        // If the task creation failed, show the "Accept" button again
                        event.target.style.display = 'inline-block';
                        acceptedRequests[requestId] = false;

                    } else {
                        console.log('Task created successfully!');
                        Swal.fire({ title: 'Success!', text: 'Task created successfully!', icon: 'success', confirmButtonText: 'OK' });


                        // After accepting the request, set rescuer availability to false
                        updateRescuerAvailability(rescuerId, false); // Set rescuer as unavailable
                    }
                })
                .catch(error => console.error('Error creating task:', error));
            event.target.style.display = 'inline-block'; // Re-show the button if there was an error
            acceptedRequests[requestId] = false;
        }
    });



    // Function to update rescuer availability
    function updateRescuerAvailability(rescuerId, availability) {
        fetch('/manage_data/update_rescuer_availability', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rescuer_id: rescuerId,
                availability: availability
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Rescuer availability updated successfully!');
                } else {
                    console.error('Failed to update rescuer availability:', data.message);
                }
            })
            .catch(error => console.error('Error updating rescuer availability:', error));
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

    var squareIcon = L.divIcon({
        className: 'custom-square-marker',
        html: '<div style="width: 15px; height: 15px; background-color: red; border: 2px solid #555;"></div>',
        iconSize: [24, 24], // size of the icon
        iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
    });
});

var circleIcon = L.divIcon({
    className: 'custom-circle-marker',
    html: '<div style="width: 15px; height: 15px; background-color: red; border-radius: 50%; border: 2px solid #555;"></div>',
    iconSize: [24, 24], // size of the icon
    iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
});