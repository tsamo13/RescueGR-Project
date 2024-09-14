document.addEventListener('DOMContentLoaded', function () {
    const viewLoadButton = document.getElementById('viewLoadButton');  //button for viewing the load
    const viewLoadPopup = document.getElementById('viewLoadPopup');    // popup for viewing the load of vehicle
    const closeViewLoadPopupBtn = document.querySelector('.close-view-load-popup-btn'); // button to close the popup window
    const loadButton = document.getElementById('loadButton');
    const unloadButton = document.getElementById('unloadButton');
    let baseLatLng = null; // To store base marker's position

    viewLoadButton.addEventListener('click', function () {
        // Fetch rescuer load from the server
        fetch('/rescuer_form/get_rescuer_load') // Send the signed-in rescuer's ID
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const viewLoadTableBody = document.querySelector('.view-load-table tbody');
                    viewLoadTableBody.innerHTML = ''; // Clear existing content

                    // Populate the table with rescuer's load data
                    data.load.forEach(loadItem => {
                        viewLoadTableBody.innerHTML += `
                            <tr>
                                <td>${loadItem.item_name}</td>
                                <td>${loadItem.quantity}</td>
                            </tr>
                        `;
                    });

                    // Display the popup
                    viewLoadPopup.style.display = 'flex';
                } else {
                    console.error('Failed to load rescuer data:', data.message);
                }
            })
            .catch(error => console.error('Error fetching rescuer load:', error));
    });

    // Close the popup when the close button is clicked
    closeViewLoadPopupBtn.addEventListener('click', function () {
        viewLoadPopup.style.display = 'none';
    });

    // Close the popup if clicked outside of the modal
    window.addEventListener('click', function (event) {
        if (event.target === viewLoadPopup) {
            viewLoadPopup.style.display = 'none';
        }
    });


    let currentTaskId = null;
    let rescuerId;
    let acceptedRequests = {};
    let currentTaskIdentifier = null;
    let type = null;
    let markers = {};
    let acceptedOfferId;

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
                    fetch(`/offers/get_offer_locations?rescuerId=${rescuerId}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                data.offers.forEach(offer => {
                                    if (offer.latitude && offer.longitude) {
                                        const offerId = `${offer.offer_id}`;

                                        // Set marker to green if the task is accepted, otherwise red
                                        const markerIcon = offer.is_accepted ? circleIconGreen : circleIconRed;

                                        // Fetch to check if items are already loaded
                                        fetch(`/rescuer_form/check_if_loaded?rescuer_id=${rescuerId}&offer_id=${offerId}`)
                                            .then(response => response.json())
                                            .then(result => {
                                                let alreadyLoaded = result.alreadyLoaded;

                                                // Now generate the popup content
                                                const generatePopupContent = () => `
                                    <h1>Offer</h1><br>
                                    <b>Name:</b> ${offer.name}<br>
                                    <b>Phone:</b> ${offer.phone}<br>
                                    <b>Created At:</b> ${new Date(offer.created_at).toLocaleString()}<br>
                                    <b>Item:</b> ${offer.item_name}<br>
                                    <b>Quantity:</b> ${offer.quantity}<br>
                                    <b>Status:</b> ${offer.status}<br>
                                    <b>Accepted At:</b> ${offer.accepted_at ? new Date(offer.accepted_at).toLocaleString() : 'Not accepted'}<br>
                                    <b>Assigned Rescuer:</b> ${offer.assigned_rescuer_id ? offer.rescuer_username : 'Not assigned'}<br>
                                    ${offer.is_accepted ? '' : `<button class="accept-offer" data-offer-id="${offerId}" style="display:inline-block;">Accept</button>`}
                                    ${offer.is_accepted && !alreadyLoaded ? `<button class="load-items" data-offer-id="${offerId}" style="display:none;">Load Items</button>` : ''}
                                `;

                                                const marker = L.marker([offer.latitude, offer.longitude], { icon: markerIcon })
                                                    .addTo(map)
                                                    .bindPopup(generatePopupContent())
                                                    .on('popupopen', function () {
                                                        const acceptButton = document.querySelector(`.accept-offer[data-offer-id="${offerId}"]`);
                                                        const loadItemsButton = document.querySelector(`.load-items[data-offer-id="${offerId}"]`);

                                                        if (acceptButton && offer.is_accepted) {
                                                            acceptButton.style.display = 'none';
                                                        }

                                                        if (acceptButton) {
                                                            acceptButton.addEventListener('click', function () {
                                                                fetch('/tasks/accept_offer_task', {
                                                                    method: 'POST',
                                                                    headers: {
                                                                        'Content-Type': 'application/json'
                                                                    },
                                                                    body: JSON.stringify({
                                                                        rescuer_id: rescuerId,
                                                                        offer_id: offerId
                                                                    })
                                                                })
                                                                    .then(response => response.json())
                                                                    .then(data => {
                                                                        if (data.success) {
                                                                            Swal.fire({ title: 'Success!', text: 'Offer accepted successfully!', icon: 'success', confirmButtonText: 'OK' });
                                                                            acceptButton.style.display = 'none'; // Hide the button after successful acceptance
                                                                            marker.setIcon(circleIconGreen); // Change marker to green after accepting

                                                                            acceptedOfferId = offerId;  //Store the accepted offer ID

                                                                            // Draw line between the rescuer and the accepted task
                                                                            L.polyline([rescuerLatLng, L.latLng(offer.latitude, offer.longitude)], {
                                                                                color: 'blue',
                                                                                weight: 2.5,
                                                                                opacity: 0.8
                                                                            }).addTo(map);
                                                                        } else {
                                                                            Swal.fire({ title: 'Error!', text: data.message, icon: 'error', confirmButtonText: 'OK' });
                                                                            console.error('Failed to accept offer:', data.message);
                                                                        }
                                                                    })
                                                                    .catch(error => console.error('Error accepting offer:', error));
                                                            });
                                                        }

                                                        if (loadItemsButton && !alreadyLoaded) {
                                                            checkProximityToOffer(marker, loadItemsButton, alreadyLoaded);  // Pass marker and button
                                                            // Add "Load Items" button functionality once, only if it's not already loaded
                                                            if (!loadItemsButton.hasListener) {
                                                                loadItemsButton.hasListener = true;  // Prevent re-adding the listener

                                                                // Add "Load Items" button functionality
                                                                loadItemsButton.addEventListener('click', function () {
                                                                    const itemName = offer.item_name;
                                                                    const itemQuantity = offer.quantity;

                                                                    // Send the data to the backend to store in the rescuer_load table
                                                                    fetch('/rescuer_form/load_items', {
                                                                        method: 'POST',
                                                                        headers: {
                                                                            'Content-Type': 'application/json'
                                                                        },
                                                                        body: JSON.stringify({
                                                                            rescuer_id: rescuerId,
                                                                            item_name: itemName,
                                                                            quantity: itemQuantity,
                                                                            offer_id: offerId
                                                                        })
                                                                    })
                                                                        .then(response => response.json())
                                                                        .then(data => {
                                                                            if (data.success) {
                                                                                Swal.fire({
                                                                                    title: 'Success!',
                                                                                    text: 'Items successfully loaded into your vehicle.',
                                                                                    icon: 'success',
                                                                                    confirmButtonText: 'OK'
                                                                                });

                                                                                // Hide the "Load Items" button after successful insertion
                                                                                loadItemsButton.style.display = 'none';
                                                                                loadItemsButton.disabled = true;

                                                                                // Mark as already loaded and stop proximity check
                                                                                alreadyLoaded = true;
                                                                            } else {
                                                                                Swal.fire({
                                                                                    title: 'Error!',
                                                                                    text: data.message,
                                                                                    icon: 'error',
                                                                                    confirmButtonText: 'OK'
                                                                                });
                                                                            }
                                                                        })
                                                                        .catch(error => console.error('Error loading items:', error));
                                                                });
                                                            }
                                                        }
                                                    });

                                                markers[offerId] = marker;

                                                // If the offer is already accepted, draw the line immediately
                                                if (offer.is_accepted && offer.assigned_rescuer_id === rescuerId) {
                                                    L.polyline([rescuerLatLng, L.latLng(offer.latitude, offer.longitude)], {
                                                        color: 'blue',
                                                        weight: 2.5,
                                                        opacity: 0.8
                                                    }).addTo(map);
                                                }
                                            })
                                            .catch(error => console.error('Error checking if items are loaded:', error));
                                    }
                                });
                            } else {
                                console.error('Failed to load offers:', data.message);
                            }
                        })
                        .catch(error => console.error('Error fetching offers:', error));
                }


                // Function to check the rescuer's proximity to the offer marker
                function checkProximityToOffer(marker, loadItemsButton, alreadyLoaded) {
                    // Declare proximityCheckInterval here to ensure it's in scope
                    const proximityCheckInterval = setInterval(() => {
                        const distance = rescuerMarker.getLatLng().distanceTo(marker.getLatLng());  // Updated position

                        if (distance <= 50 && !alreadyLoaded) {
                            loadItemsButton.style.display = 'inline-block'; // Show the "Load Items" button when conditions are met
                        } else {
                            loadItemsButton.style.display = 'none'; // Hide otherwise
                        }
                    }, 1000); // Check every second

                    // Clear interval when button is clicked
                    loadItemsButton.addEventListener('click', () => {
                        clearInterval(proximityCheckInterval);  // Stop proximity checking after items are loaded
                    });
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
                fetch(`/requests/get_request_locations?rescuerId=${rescuerId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            data.requests.forEach(request => {
                                if (request.latitude && request.longitude) {
                                    const requestId = `${request.request_id}`; // Unique ID based on request ID

                                    // Set marker to green if the task is accepted, otherwise red
                                    const markerIcon = request.is_accepted ? squareIconGreen : squareIconRed;

                                    const generatePopupContent = () => `
                                        <h1>Request</h1><br>
                                        <b>Name:</b> ${request.name}<br>
                                        <b>Phone:</b> ${request.phone}<br>
                                        <b>Created At:</b> ${new Date(request.created_at).toLocaleString()}<br>
                                        <b>Item:</b> ${request.item_name}<br>
                                        <b>Quantity:</b> ${request.quantity}<br>
                                        <b>Status:</b> ${request.status}<br>
                                        <b>Accepted At:</b> ${request.accepted_at ? new Date(request.accepted_at).toLocaleString() : 'Not accepted'}<br>
                                        <b>Assigned Rescuer:</b> ${request.assigned_rescuer_id ? request.rescuer_username : 'Not assigned'}<br>
                                        ${request.is_accepted ? '' : `<button class="accept-request" data-request-id="${requestId}" style="display:inline-block;">Accept</button>`}
                                    `;

                                    const marker = L.marker([request.latitude, request.longitude], { icon: markerIcon })
                                        .addTo(map)
                                        .bindPopup(generatePopupContent())
                                        .on('popupopen', function () {
                                            const acceptButton = document.querySelector(`.accept-request[data-request-id="${requestId}"]`);

                                            if (acceptButton && request.is_accepted) {
                                                acceptButton.style.display = 'none';
                                            }

                                            if (acceptButton) {
                                                acceptButton.addEventListener('click', function () {
                                                    fetch('/tasks/accept_request_task', {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json'
                                                        },
                                                        body: JSON.stringify({
                                                            rescuer_id: rescuerId,
                                                            request_id: requestId
                                                        })
                                                    })
                                                        .then(response => response.json())
                                                        .then(data => {
                                                            if (data.success) {
                                                                Swal.fire({ title: 'Success!', text: 'Request accepted successfully!', icon: 'success', confirmButtonText: 'OK' });
                                                                acceptButton.style.display = 'none'; // Hide the button after successful acceptance
                                                                marker.setIcon(squareIconGreen); // Change marker to green after accepting

                                                                // Draw line between the rescuer and the accepted task
                                                                L.polyline([rescuerLatLng, L.latLng(request.latitude, request.longitude)], {
                                                                    color: 'blue',
                                                                    weight: 2.5,
                                                                    opacity: 0.8
                                                                }).addTo(map);

                                                            } else {
                                                                Swal.fire({ title: 'Error!', text: data.message, icon: 'error', confirmButtonText: 'OK' });
                                                                console.error('Failed to accept request:', data.message);
                                                            }
                                                        })
                                                        .catch(error => console.error('Error accepting request:', error));
                                                });
                                            }
                                        });

                                    markers[requestId] = marker;

                                    // If the request is already accepted, draw the line immediately
                                    if (request.is_accepted && request.assigned_rescuer_id === rescuerId) {
                                        L.polyline([rescuerLatLng, L.latLng(request.latitude, request.longitude)], {
                                            color: 'blue',
                                            weight: 2.5,
                                            opacity: 0.8
                                        }).addTo(map);
                                    }
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
                        row.setAttribute('data-offer-id', task.task_identifier);
                        row.setAttribute('data-type', task.type);

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


    // Get references to buttons
    const completeTaskBtn = document.getElementById('completeTaskBtn');
    const tableBody = document.getElementById('tasks-table-body');

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
            currentTaskIdentifier = row.getAttribute('data-offer-id');
            type = row.getAttribute('data-type');

            completeTaskBtn.disabled = true;

            // Check if the items for this offer/task have been loaded by the rescuer
            fetch(`/rescuer_form/check_if_loaded?rescuer_id=${rescuerId}&offer_id=${currentTaskIdentifier}`)
                .then(response => response.json())
                .then(result => {
                    if (result.alreadyLoaded) {
                        // If the items are loaded, enable the "Complete Task" button
                        completeTaskBtn.disabled = false;
                        cancelTaskBtn.disabled = true; // Disable the "Cancel Task" button
                    } else {
                        // If not loaded, keep the button disabled
                        completeTaskBtn.disabled = true;
                    }
                })
                .catch(error => console.error('Error checking if items are loaded:', error));
        }
    });

    // Handle "Complete Task" button click
completeTaskBtn.addEventListener('click', function () {
    if (!currentTaskIdentifier) {
        console.error('No task selected');
        return;
    }

    const row = document.querySelector(`tr[data-offer-id="${currentTaskIdentifier}"]`);

    // 1. Send request to update the task status and offer status in the backend
    fetch('/tasks/complete_task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            task_id: currentTaskId,
            offer_id: currentTaskIdentifier,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 2. Remove the row from the table
            if (row) {
                row.remove(); // Removes the task row from the table
            }

            // 3. Show success message
            Swal.fire({
                title: 'Success!',
                text: 'Task and Offer have been marked as completed!',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            // Optionally, disable the "Complete Task" button after the row is removed
            completeTaskBtn.disabled = true;
        } else {
            Swal.fire({
                title: 'Error!',
                text: data.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
            console.error('Failed to complete the task:', data.message);
        }
    })
    .catch(error => console.error('Error completing task:', error));
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
                    offer_id: currentTaskIdentifier,
                    request_id: currentTaskIdentifier,
                    type: type,
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

                        const marker = markers[currentTaskIdentifier];

                        // Change marker back to red based on task type
                        if (type === 'Offer') {
                            marker.setIcon(circleIconRed);  // Revert to red circle for offers
                        } else if (type === 'Request') {
                            marker.setIcon(squareIconRed);  // Revert to red square for requests
                        }

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

    var squareIconRed = L.divIcon({
        className: 'custom-square-marker',
        html: '<div style="width: 15px; height: 15px; background-color: red; border: 2px solid #555;"></div>',
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

    var circleIconRed = L.divIcon({
        className: 'custom-circle-marker',
        html: '<div style="width: 15px; height: 15px; background-color: red; border-radius: 50%; border: 2px solid #555;"></div>',
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

});

document.addEventListener('DOMContentLoaded', function () {
    const loadButton = document.getElementById('loadButton');  // button for loading items
    const loadItemsPopup = document.getElementById('loadItemsPopup');    // popup for loading items
    const closeLoadPopupBtn = document.querySelector('.close-load-popup-btn'); // button to close the load popup window
    const loadTableBody = document.querySelector('.load-table tbody'); // body of the table
    const selectedItemInput = document.getElementById('selectedItem'); // Input for the selected item
    const selectQuantityInput = document.getElementById('selectQuantity'); // Input for the quantity
    const itemError = document.getElementById('item-error');  // Στοιχείο για το μήνυμα σφάλματος προϊόντος
    const quantityError = document.getElementById('quantity-error');  // Στοιχείο για μηνύματα λάθους ποσότητας (αν υπάρχει)

    // Event listener for "Load Items" button to open the modal
    loadButton.addEventListener('click', function () {
        // Display the popup
        loadItemsPopup.style.display = 'flex';
    });

    // Function to deselect the selected row
    function deselectRow() {
        const selectedRow = loadTableBody.querySelector('tr.selected');
        if (selectedRow) {
            selectedRow.classList.remove('selected');
            selectedItemInput.value = ''; // Clear the selected item field when deselected
        }
    }

    // Close the popup when the close button is clicked
    closeLoadPopupBtn.addEventListener('click', function () {
        loadItemsPopup.style.display = 'none';
        deselectRow();  // Call the function to deselect the row
        selectQuantityInput.value = ''; // Καθαρισμός του πεδίου ποσότητας
    });

    // Close the popup if clicked outside of the modal
    window.addEventListener('click', function (event) {
        if (event.target === loadItemsPopup) {
            loadItemsPopup.style.display = 'none';
            deselectRow();  // Call the function to deselect the row
            selectQuantityInput.value = ''; // Καθαρισμός του πεδίου ποσότητας
        }
    });

    // Event listener για την επιλογή γραμμής στον πίνακα
    loadTableBody.addEventListener('click', function (event) {
        const row = event.target.closest('tr');  // Παίρνει την κλικαρισμένη γραμμή

        if (row) {
            // Αφαιρεί την κλάση 'selected' από όλες τις γραμμές
            Array.from(loadTableBody.getElementsByTagName('tr')).forEach(r => r.classList.remove('selected'));

            // Προσθέτει την κλάση 'selected' στην κλικαρισμένη γραμμή
            row.classList.add('selected');

            // Ενημερώνει το πεδίο "Selected Item" με το όνομα του αντικειμένου από την επιλεγμένη γραμμή
            const itemName = row.cells[0].textContent; // Πρώτη στήλη είναι το όνομα του αντικειμένου
            selectedItemInput.value = itemName;
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const loadSelectedItemButton = document.getElementById('loadSelectedItemButton');
    const selectQuantityInput = document.getElementById('selectQuantity');
    const selectedItemInput = document.getElementById('selectedItem');
    const loadTableBody = document.querySelector('.load-table tbody');

    // Event listener για να καθαρίζεται το μήνυμα λάθους όταν ο χρήστης πληκτρολογεί στο πεδίο ποσότητας
    selectQuantityInput.addEventListener('input', function () {
        selectQuantityInput.setCustomValidity('');  // Καθαρισμός του μηνύματος λάθους
    });

    loadSelectedItemButton.addEventListener('click', function () {
        let isValid = true;

        // Check if an item is selected
        if (selectedItemInput.value.trim() === "") {
            selectedItemInput.setCustomValidity('Please select an item from the table above.');
            selectedItemInput.reportValidity();  // Show the message with the browser style
            isValid = false;
        } else {
            selectedItemInput.setCustomValidity('');  // Clear the message if valid
        }

        // Check if the quantity is a positive number
        if (!selectQuantityInput.checkValidity()) {
            selectQuantityInput.reportValidity();  // Use browser's message for quantity
            isValid = false;
        }

        // Get the quantity from the selected row in the table
        const selectedRow = loadTableBody.querySelector('tr.selected');
        if (selectedRow) {
            const availableQuantity = parseInt(selectedRow.cells[1].textContent, 10); // Ποσότητα από τη δεύτερη στήλη
            const enteredQuantity = parseInt(selectQuantityInput.value, 10);

            // Check if the entered quantity is greater than the available quantity
            if (enteredQuantity > availableQuantity) {
                selectQuantityInput.setCustomValidity(`The entered quantity (${enteredQuantity}) exceeds the available quantity (${availableQuantity}).`);
                selectQuantityInput.reportValidity();  // Εμφάνιση του μηνύματος μόνο όταν πατηθεί το κουμπί
                isValid = false;
            } else {
                selectQuantityInput.setCustomValidity('');  // Clear any previous error message
            }
        }

        // If all is valid, proceed
        if (isValid) {
            console.log('Product selected and valid quantity entered.');

            // Proceed with the item load (your existing logic to handle the item load goes here)
            // ...

            // Clear the form fields
            selectedItemInput.value = '';
            selectQuantityInput.value = '';

            // Deselect the selected row from the table
            if (selectedRow) {
                selectedRow.classList.remove('selected');
            }

            console.log('Forms and table selection cleared.');
        }
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const unloadButton = document.getElementById('unloadButton');  // κουμπί για το unload items
    const unloadItemsPopup = document.getElementById('unloadItemsPopup');  // παράθυρο του unload items
    const closeUnloadPopupBtn = document.querySelector('.close-unload-popup-btn'); // κουμπί για το κλείσιμο του unload popup
    const unloadTableBody = document.querySelector('.unload-table tbody'); // σώμα του πίνακα unload
    const unloadSelectedItemInput = document.getElementById('unloadSelectedItem'); // πεδίο για το επιλεγμένο αντικείμενο
    const unloadQuantityInput = document.getElementById('unloadQuantity'); // πεδίο για την ποσότητα
    const unloadSelectedItemButton = document.getElementById('unloadSelectedItemButton'); // κουμπί για unload item

    // Event listener για να ανοίξει το παράθυρο unload items
    unloadButton.addEventListener('click', function () {
        // Εμφανίζει το παράθυρο
        unloadItemsPopup.style.display = 'flex';
    });

    // Λειτουργία για να αφαιρεθεί η επιλογή από την επιλεγμένη γραμμή
    function deselectUnloadRow() {
        const selectedRow = unloadTableBody.querySelector('tr.selected');
        if (selectedRow) {
            selectedRow.classList.remove('selected');
            unloadSelectedItemInput.value = ''; // Καθαρίζει το πεδίο επιλεγμένου αντικειμένου
        }
    }

    // Κλείνει το παράθυρο όταν κάνουμε κλικ στο κουμπί κλεισίματος
    closeUnloadPopupBtn.addEventListener('click', function () {
        unloadItemsPopup.style.display = 'none';
        deselectUnloadRow();  // Καλεί τη λειτουργία για να αφαιρεθεί η επιλογή
        unloadQuantityInput.value = ''; // Καθαρίζει το πεδίο ποσότητας
    });

    // Κλείνει το παράθυρο αν κάνουμε κλικ έξω από το παράθυρο
    window.addEventListener('click', function (event) {
        if (event.target === unloadItemsPopup) {
            unloadItemsPopup.style.display = 'none';
            deselectUnloadRow();  // Καλεί τη λειτουργία για να αφαιρεθεί η επιλογή
            unloadQuantityInput.value = ''; // Καθαρίζει το πεδίο ποσότητας
        }
    });

    // Event listener για την επιλογή γραμμής στον πίνακα unload items
    unloadTableBody.addEventListener('click', function (event) {
        const row = event.target.closest('tr');  // Παίρνει την κλικαρισμένη γραμμή

        if (row) {
            // Αφαιρεί την κλάση 'selected' από όλες τις γραμμές
            Array.from(unloadTableBody.getElementsByTagName('tr')).forEach(r => r.classList.remove('selected'));

            // Προσθέτει την κλάση 'selected' στην κλικαρισμένη γραμμή
            row.classList.add('selected');

            // Ενημερώνει το πεδίο "Selected Item" με το όνομα του αντικειμένου από την επιλεγμένη γραμμή
            const itemName = row.cells[0].textContent;
            unloadSelectedItemInput.value = itemName;
        }
    });

    // Event listener για το κουμπί "Unload Item"
    unloadSelectedItemButton.addEventListener('click', function () {
        let isValid = true;

        // Έλεγχος αν έχει επιλεχθεί αντικείμενο
        if (unloadSelectedItemInput.value.trim() === "") {
            unloadSelectedItemInput.setCustomValidity('Please select an item from the table above.');
            unloadSelectedItemInput.reportValidity();  // Εμφάνιση μηνύματος σφάλματος μόνο όταν πατηθεί το κουμπί
            isValid = false;
        } else {
            unloadSelectedItemInput.setCustomValidity('');  // Καθαρισμός του μηνύματος αν είναι έγκυρο
        }

        // Έλεγχος αν η ποσότητα είναι θετικός αριθμός
        if (!unloadQuantityInput.checkValidity()) {
            unloadQuantityInput.reportValidity();  // Χρήση του browser μηνύματος για ποσότητα
            isValid = false;
        }

        // Παίρνει την ποσότητα από την επιλεγμένη γραμμή στον πίνακα
        const selectedRow = unloadTableBody.querySelector('tr.selected');
        if (selectedRow) {
            const availableQuantity = parseInt(selectedRow.cells[1].textContent, 10); // Ποσότητα από τη δεύτερη στήλη
            const enteredQuantity = parseInt(unloadQuantityInput.value, 10);

            // Έλεγχος αν η εισαχθείσα ποσότητα είναι μεγαλύτερη από την διαθέσιμη
            if (enteredQuantity > availableQuantity) {
                unloadQuantityInput.setCustomValidity(`The entered quantity (${enteredQuantity}) exceeds the available quantity (${availableQuantity}).`);
                unloadQuantityInput.reportValidity();  // Εμφάνιση μηνύματος μόνο όταν πατηθεί το κουμπί
                isValid = false;
            } else {
                unloadQuantityInput.setCustomValidity('');  // Καθαρισμός του μηνύματος σφάλματος αν η ποσότητα είναι έγκυρη
            }
        }

        // Εάν όλα είναι έγκυρα, προχωράμε
        if (isValid) {
            console.log('Item selected and valid quantity entered for unloading.');

            // Υλοποίηση λογικής unload εδώ
            // ...

            // Καθαρισμός των πεδίων της φόρμας
            unloadSelectedItemInput.value = '';
            unloadQuantityInput.value = '';

            // Αφαίρεση της επιλογής από την επιλεγμένη γραμμή του πίνακα
            if (selectedRow) {
                selectedRow.classList.remove('selected');
            }

            console.log('Forms and table selection cleared.');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const unloadAllItemsButton = document.getElementById('unloadAllItemsButton');
    const unloadTableBody = document.querySelector('.unload-table tbody'); // Αναφορά στο σώμα του πίνακα
    const unloadItemsPopup = document.getElementById('unloadItemsPopup');

    const unloadSelectedItemInput = document.getElementById('unloadSelectedItem'); // Πεδίο επιλεγμένου αντικειμένου
    const unloadQuantityInput = document.getElementById('unloadQuantity'); // Πεδίο ποσότητας

    // Αποθήκευση του αρχικού HTML για να το επαναφέρουμε
    const originalTableContent = unloadTableBody.innerHTML;

    // Event listener για το κουμπί "Unload All Items"
    unloadAllItemsButton.addEventListener('click', function () {
        // Κρύβει όλα τα στοιχεία του πίνακα προσωρινά
        unloadTableBody.innerHTML = '';
        console.log('Όλα τα στοιχεία έχουν κρυφτεί προσωρινά.');

        // Καθαρίζει τα πεδία της φόρμας
        unloadSelectedItemInput.value = '';
        unloadQuantityInput.value = '';
        console.log('Τα πεδία "Selected Item" και "Quantity" καθαρίστηκαν.');
    });

    // Όταν κλείνει το παράθυρο και ξανανοίγει, επαναφέρει τα δεδομένα
    unloadItemsPopup.addEventListener('click', function (event) {
        if (event.target === unloadItemsPopup) {
            // Επαναφορά του αρχικού περιεχομένου όταν ξανανοίγει το παράθυρο
            unloadTableBody.innerHTML = originalTableContent;
        }
    });
});