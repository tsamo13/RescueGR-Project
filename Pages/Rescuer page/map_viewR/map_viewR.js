document.addEventListener('DOMContentLoaded', function () {
    const viewLoadButton = document.getElementById('viewLoadButton');  
    const viewLoadPopup = document.getElementById('viewLoadPopup');    
    const closeViewLoadPopupBtn = document.querySelector('.close-view-load-popup-btn'); 
    const loadButton = document.getElementById('loadButton');
    const unloadButton = document.getElementById('unloadButton');
    let baseLatLng = null; // To store base marker's position


    viewLoadButton.addEventListener('click', function () {
        // Fetch rescuer load from the server
        fetch('/rescuer_form/get_rescuer_load') 
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const viewLoadTableBody = document.querySelector('.view-load-table tbody');
                    viewLoadTableBody.innerHTML = ''; 

                    // Populate the table with rescuer's load data
                    data.load.forEach(loadItem => {
                        if (loadItem.quantity > 0) {
                            viewLoadTableBody.innerHTML += `
                                <tr>
                                    <td>${loadItem.item_name}</td>
                                    <td>${loadItem.quantity}</td>
                                </tr>
                            `;
                        }
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

                            enableBaseButtons();    
                            fetchOffers();
                        } else {
                            console.error('No base location found.');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching base location:', error);
                    });

            // Check distance to base
            function enableBaseButtons(){
                if (baseLatLng) {
                    const distance = rescuerMarker.getLatLng().distanceTo(baseLatLng); // Distance in meters
                    if (distance <= 100) {
                        loadButton.disabled = false;
                        unloadButton.disabled = false;

                    } else {
                        loadButton.disabled = true;
                        unloadButton.disabled = true;
                    }
                }
                return;
            }    

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

                                    // Fetch to check if items are already unloaded
                                    fetch(`/rescuer_form/check_if_unloaded?rescuer_id=${rescuerId}&request_id=${requestId}`)
                                        .then(response => response.json())
                                        .then(result => {
                                            let alreadyUnloaded = result.alreadyUnloaded;

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
                            ${request.is_accepted && !alreadyUnloaded ? `<button class="unload-items" data-request-id="${requestId}" style="display:none;">Unload Items</button>` : ''}
                        `;

                                            const marker = L.marker([request.latitude, request.longitude], { icon: markerIcon })
                                                .addTo(map)
                                                .bindPopup(generatePopupContent())
                                                .on('popupopen', function () {
                                                    const acceptButton = document.querySelector(`.accept-request[data-request-id="${requestId}"]`);
                                                    const unloadItemsButton = document.querySelector(`.unload-items[data-request-id="${requestId}"]`);


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

                                                    if (unloadItemsButton && !alreadyUnloaded) {
                                                        checkProximityToRequest(marker, unloadItemsButton);  // Pass marker and button

                                                        // Add "Unload Items" button functionality once
                                                        if (!unloadItemsButton.hasListener) {
                                                            unloadItemsButton.hasListener = true;  // Prevent re-adding the listener

                                                            unloadItemsButton.addEventListener('click', function () {
                                                                const itemName = request.item_name;
                                                                const itemQuantity = request.quantity;

                                                                // Send the data to the backend to store in the rescuer_unload table
                                                                fetch('/rescuer_form/unload_items', {
                                                                    method: 'POST',
                                                                    headers: {
                                                                        'Content-Type': 'application/json'
                                                                    },
                                                                    body: JSON.stringify({
                                                                        rescuer_id: rescuerId,
                                                                        item_name: itemName,  
                                                                        quantity: itemQuantity, 
                                                                        request_id: requestId  
                                                                    })
                                                                })
                                                                    .then(response => response.json())
                                                                    .then(data => {
                                                                        if (data.success) {
                                                                            Swal.fire({
                                                                                title: 'Success!',
                                                                                text: 'Items successfully unloaded.',
                                                                                icon: 'success',
                                                                                confirmButtonText: 'OK'
                                                                            });

                                                                            // Hide the "Unload Items" button after successful insertion
                                                                            unloadItemsButton.style.display = 'none';

                                                                            
                                                                            unloadItemsButton.disabled = true;
                                                                            alreadyUnloaded = true;
                                                                        } else {
                                                                            Swal.fire({
                                                                                title: 'Error!',
                                                                                text: data.message,
                                                                                icon: 'error',
                                                                                confirmButtonText: 'OK'
                                                                            });
                                                                        }
                                                                    })
                                                                    .catch(error => console.error('Error unloading items:', error));
                                                            });
                                                        }
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
                                        })
                                        .catch(error => console.error('Error checking if items are unloaded:', error));
                                }
                            });
                        } else {
                            console.error('Failed to load requests');
                        }
                    })
                    .catch(error => console.error('Error fetching requests:', error));

                // Function to check the rescuer's proximity to the request marker
                function checkProximityToRequest(marker, unloadItemsButton) {
                    const proximityCheckInterval = setInterval(() => {
                        const distance = rescuerMarker.getLatLng().distanceTo(marker.getLatLng());  // Updated position

                        if (distance <= 50) {
                            unloadItemsButton.style.display = 'inline-block'; // Show the "Unload Items" button when conditions are met
                        } else {
                            unloadItemsButton.style.display = 'none'; // Hide otherwise
                        }
                    }, 1000); // Check every second

                    unloadItemsButton.addEventListener('click', () => {
                        clearInterval(proximityCheckInterval); // Stop checking proximity after unloading
                    });
                }
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
            currentTaskIdentifier = row.getAttribute('data-offer-id') || row.getAttribute('data-request-id');
            type = row.getAttribute('data-type');

            completeTaskBtn.disabled = true;

            if (type === 'Offer') {
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
            } else if (type === 'Request') {
                // Check if items from the request have been unloaded by the rescuer
                fetch(`/rescuer_form/check_if_unloaded?rescuer_id=${rescuerId}&request_id=${currentTaskIdentifier}`)
                    .then(response => response.json())
                    .then(result => {
                        if (result.alreadyUnloaded) {
                            completeTaskBtn.disabled = false;
                            cancelTaskBtn.disabled = true; // Disable "Cancel Task" button for unloaded items
                        } else {
                            completeTaskBtn.disabled = true;
                        }
                    })
                    .catch(error => console.error('Error checking if items are unloaded:', error));
            }
        }

    });

    // Handle "Complete Task" button click
    completeTaskBtn.addEventListener('click', function () {
        if (!currentTaskIdentifier) {
            console.error('No task selected');
            return;
        }

        const row = document.querySelector(`tr[data-offer-id="${currentTaskIdentifier}"], tr[data-request-id="${currentTaskIdentifier}"]`);

        // 1. Send request to update the task status (and offer or request) in the backend
        const url = type === 'Offer' ? '/tasks/complete_offer_task' : '/tasks/complete_request_task';

        // 1. Send request to update the task status and offer status in the backend
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                task_id: currentTaskId,
                offer_id: type === 'Offer' ? currentTaskIdentifier : null,
                request_id: type === 'Request' ? currentTaskIdentifier : null,
                rescuer_id: rescuerId
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
                        text: 'Task and associated action have been marked as completed!',
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
                    rescuer_id: rescuerId, 
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
                        updateRescuerAvailability(rescuerId, true);

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
        iconSize: [24, 24], 
        iconAnchor: [12, 12], 
        popupAnchor: [0, -12] 
    });

    var squareIconGreen = L.divIcon({
        className: 'custom-square-marker',
        html: '<div style="width: 15px; height: 15px; background-color: green; border: 2px solid #555;"></div>',
        iconSize: [24, 24], 
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });

    var circleIconRed = L.divIcon({
        className: 'custom-circle-marker',
        html: '<div style="width: 15px; height: 15px; background-color: red; border-radius: 50%; border: 2px solid #555;"></div>',
        iconSize: [24, 24], 
        iconAnchor: [12, 12], 
        popupAnchor: [0, -12]
    });

    var circleIconGreen = L.divIcon({
        className: 'custom-circle-marker',
        html: '<div style="width: 15px; height: 15px; background-color: green; border-radius: 50%; border: 2px solid #555;"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12] 
    });

});

document.addEventListener('DOMContentLoaded', function () {
    const loadButton = document.getElementById('loadButton');  
    const loadItemsPopup = document.getElementById('loadItemsPopup');   
    const closeLoadPopupBtn = document.querySelector('.close-load-popup-btn');
    const loadTableBody = document.querySelector('.load-table tbody'); 
    const selectedItemInput = document.getElementById('selectedItem'); 
    const selectQuantityInput = document.getElementById('selectQuantity'); 
    const itemError = document.getElementById('item-error');  
    const quantityError = document.getElementById('quantity-error'); 

    // Function to deselect the selected row
    function deselectRow() {
        const selectedRow = loadTableBody.querySelector('tr.selected');
        if (selectedRow) {
            selectedRow.classList.remove('selected');
            selectedItemInput.value = ''; 
        }
    }

    // Close the popup when the close button is clicked
    closeLoadPopupBtn.addEventListener('click', function () {
        loadItemsPopup.style.display = 'none';
        deselectRow();  // Call the function to deselect the row
        selectQuantityInput.value = ''; 
    });

    // Close the popup if clicked outside of the modal
    window.addEventListener('click', function (event) {
        if (event.target === loadItemsPopup) {
            loadItemsPopup.style.display = 'none';
            deselectRow();  
            selectQuantityInput.value = '';
        }
    });

    // Event listener for row selection in the table
    loadTableBody.addEventListener('click', function (event) {
        const row = event.target.closest('tr');  

        if (row) {
           
            Array.from(loadTableBody.getElementsByTagName('tr')).forEach(r => r.classList.remove('selected'));

            row.classList.add('selected');

            const itemName = row.cells[0].textContent; 
            selectedItemInput.value = itemName;
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const loadSelectedItemButton = document.getElementById('loadSelectedItemButton');
    const selectQuantityInput = document.getElementById('selectQuantity');
    const selectedItemInput = document.getElementById('selectedItem');
    const loadTableBody = document.querySelector('.load-table tbody');

    // Event listener for "Load Items" button to open the modal
    loadButton.addEventListener('click', function () {
        // Display the popup
        loadItemsPopup.style.display = 'flex';
    
    // Fetch database stock from the server
    fetch('/manage_data/get_stock')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
              
                loadTableBody.innerHTML = '';

                // Loop through the stock data and populate the table
                data.stock.forEach(item => {
                    const row = document.createElement('tr');

                    const itemNameCell = document.createElement('td');
                    itemNameCell.textContent = item.item_name;
                    row.appendChild(itemNameCell);

                    const quantityCell = document.createElement('td');
                    quantityCell.textContent = item.quantity;
                    row.appendChild(quantityCell);

                    // Append the row to the table body
                    loadTableBody.appendChild(row);
                });
            } else {
                console.error('Failed to load warehouse stock:', data.message);
            }
        })
        .catch(error => console.error('Error fetching warehouse stock:', error));
    });

    // Event listener for row selection in the table
    loadTableBody.addEventListener('click', function (event) {
        const row = event.target.closest('tr'); 

        if (row) {
            
            Array.from(loadTableBody.getElementsByTagName('tr')).forEach(r => r.classList.remove('selected'));

          
            row.classList.add('selected');

            const itemName = row.cells[0].textContent; 
            selectedItemInput.value = itemName;
        }
    });
    
    // Event listener to clear the error message when the user types in the quantity field
    selectQuantityInput.addEventListener('input', function () {
        selectQuantityInput.setCustomValidity('');  
    });

    loadSelectedItemButton.addEventListener('click', function () {
        let isValid = true;
        const itemName = selectedItemInput.value;
        const quantity = selectQuantityInput.value;

        // Check if an item is selected
        if (selectedItemInput.value.trim() === "") {
            selectedItemInput.setCustomValidity('Please select an item from the table above.');
            selectedItemInput.reportValidity(); 
            isValid = false;
        } else {
            selectedItemInput.setCustomValidity('');  
        }

        // Check if the quantity is a positive number
        if (!selectQuantityInput.checkValidity()) {
            selectQuantityInput.reportValidity();
            isValid = false;
        }

        // Check if a product has been selected
        if (selectedItemInput.value === '' && selectQuantityInput.value !== '') {
            Swal.fire('Please select a product from the list above!');
            return;
        }

        // Get the quantity from the selected row in the table
        const selectedRow = loadTableBody.querySelector('tr.selected');
        if (selectedRow) {
            const availableQuantity = parseInt(selectedRow.cells[1].textContent, 10); 
            const enteredQuantity = parseInt(selectQuantityInput.value, 10);

            // Check if the entered quantity is greater than the available quantity
            if (enteredQuantity > availableQuantity) {
                selectQuantityInput.setCustomValidity(`The entered quantity (${enteredQuantity}) exceeds the available quantity (${availableQuantity}).`);
                selectQuantityInput.reportValidity();  
                isValid = false;
            } else {
                selectQuantityInput.setCustomValidity('');  
            }
        }

        // If all is valid, proceed
        if (isValid) {
            const availableQuantity = parseInt(selectedRow.cells[1].textContent, 10);
            // Send the data to the back-end to process the load item request
        fetch('/manage_data/load_item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                item_name: itemName,
                quantity: quantity
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                selectedRow.cells[1].textContent = availableQuantity - quantity; // Update the quantity in the UI
                Swal.fire({title: 'Success!', text:'Item loaded successfully!', icon: 'success', confirmButtonText: 'OK'});
            } else {
                Swal.fire('Failed to load the item. Please try again!');
            }
        })
        .catch(error => console.error('Error loading item:', error));

            // Clear the form fields
            selectedItemInput.value = '';
            selectQuantityInput.value = '';

            // Deselect the selected row from the table
            if (selectedRow) {
                selectedRow.classList.remove('selected');
            }
        }
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const unloadButton = document.getElementById('unloadButton');  
    const unloadItemsPopup = document.getElementById('unloadItemsPopup'); 
    const closeUnloadPopupBtn = document.querySelector('.close-unload-popup-btn'); 
    const unloadTableBody = document.querySelector('.unload-table tbody'); 
    const unloadSelectedItemInput = document.getElementById('unloadSelectedItem');
    const unloadQuantityInput = document.getElementById('unloadQuantity'); 
    const unloadSelectedItemButton = document.getElementById('unloadSelectedItemButton'); 

    // Event listener to open the unload items window
    unloadButton.addEventListener('click', function () {
        
        unloadItemsPopup.style.display = 'flex';

    // Fetch the rescuer's load from the back-end
    fetch('/rescuer_form/get_rescuer_load')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                unloadTableBody.innerHTML = ''; 
                data.load.forEach(item => {
                    if (item.quantity > 0) {  // Only show items with quantity greater than 0
                        const row = document.createElement('tr');
                        const itemNameCell = document.createElement('td');
                        const quantityCell = document.createElement('td');

                        itemNameCell.textContent = item.item_name;
                        quantityCell.textContent = item.quantity;

                        row.appendChild(itemNameCell);
                        row.appendChild(quantityCell);

                        unloadTableBody.appendChild(row);
                    }
                });
            }
        })
        .catch(error => console.error('Error fetching rescuer load:', error));
    });


    // Function to remove the selection from the selected line
    function deselectUnloadRow() {
        const selectedRow = unloadTableBody.querySelector('tr.selected');
        if (selectedRow) {
            selectedRow.classList.remove('selected');
            unloadSelectedItemInput.value = ''; 
        }
    }

    // Closes the window when we click the close button
    closeUnloadPopupBtn.addEventListener('click', function () {
        unloadItemsPopup.style.display = 'none';
        deselectUnloadRow();  
        unloadSelectedItemInput.value = '';
        unloadQuantityInput.value = ''; 
    });

    // Closes the window if we click outside the window
    window.addEventListener('click', function (event) {
        if (event.target === unloadItemsPopup) {
            unloadItemsPopup.style.display = 'none';
            deselectUnloadRow();  
            unloadSelectedItemInput.value = '';
            unloadQuantityInput.value = ''; 
        }
    });

    // Event listener for selecting a row in the unload items table
    unloadTableBody.addEventListener('click', function (event) {
        const row = event.target.closest('tr');  

        if (row) {
           
            Array.from(unloadTableBody.getElementsByTagName('tr')).forEach(r => r.classList.remove('selected'));

            row.classList.add('selected');

            // Updates the "Selected Item" field with the name of the item from the selected line
            const itemName = row.cells[0].textContent;
            unloadSelectedItemInput.value = itemName;
        }
    });

    // Event listener for the "Unload Item" button
    unloadSelectedItemButton.addEventListener('click', function () {
        let isValid = true;


        // Check if a product has been selected
        if (unloadSelectedItemInput.value === '' && unloadQuantityInput.value !== '') {
            Swal.fire('Please select a product from the list above!');
            isValid = false;
            return;
        }
        // Check if the quantity is a positive
        if (!unloadQuantityInput.checkValidity()) {
            unloadQuantityInput.reportValidity(); 
            isValid = false;
        }

        // Gets the quantity from the selected row in the table
        const selectedRow = unloadTableBody.querySelector('tr.selected');
        if (selectedRow) {
            const availableQuantity = parseInt(selectedRow.cells[1].textContent, 10); 
            const enteredQuantity = parseInt(unloadQuantityInput.value, 10);

            // Check if the imported quantity is greater than the available quantity
            if (enteredQuantity > availableQuantity) {
                unloadQuantityInput.setCustomValidity(`The entered quantity (${enteredQuantity}) exceeds the available quantity (${availableQuantity}).`);
                unloadQuantityInput.reportValidity();  
                isValid = false;
            } else {
                unloadQuantityInput.setCustomValidity(''); 
            }
        }

        if (isValid) {
            const itemName = unloadSelectedItemInput.value;
            const quantity = unloadQuantityInput.value;
            const availableQuantity = parseInt(selectedRow.cells[1].textContent, 10);
    
            // Send data to the backend
            fetch('/manage_data/unload_item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemName, quantity })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {

                    const newQuantity = availableQuantity - quantity; // Calculate the new quantity

                    if (newQuantity <= 0) {
                        
                        selectedRow.remove();   // Remove the row if the new quantity is 0 or less
                    } else {
                    
                        selectedRow.cells[1].textContent = newQuantity;    // Otherwise, just update the quantity in the UI
                    }
                    
                    Swal.fire({title: 'Success!', text:'Item unloaded successfully!', icon: 'success', confirmButtonText: 'OK'});
                    // Clear the form fields
                    unloadSelectedItemInput.value = '';
                    unloadQuantityInput.value = '';
    
                    // Deselect the selected row from the table
                    selectedRow.classList.remove('selected');
                } else {
                    console.error('Failed to unload item:', data.message);
                }
            })
            .catch(error => console.error('Error unloading item:', error));
        };
    });    
});

document.addEventListener('DOMContentLoaded', function () {
    const unloadAllItemsButton = document.getElementById('unloadAllItemsButton');
    const unloadTableBody = document.querySelector('.unload-table tbody'); 
    const unloadItemsPopup = document.getElementById('unloadItemsPopup');

    const unloadSelectedItemInput = document.getElementById('unloadSelectedItem'); 
    const unloadQuantityInput = document.getElementById('unloadQuantity'); 

   
    const originalTableContent = unloadTableBody.innerHTML;


// Event listener for the "Unload All Items" button
unloadAllItemsButton.addEventListener('click', function () {
    Swal.fire({
        title: 'Are you sure?',
        text: "This will unload all items from your vehicle.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, unload all!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Send request to unload all items
            fetch('/manage_data/unload_all_items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire('All items have been unloaded!');

                    // Clear the table UI
                    unloadTableBody.innerHTML = '';

                    // Clear form fields
                    unloadSelectedItemInput.value = '';
                    unloadQuantityInput.value = '';
                } else {
                    Swal.fire('Failed!', data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error unloading all items:', error);
                Swal.fire('Error!', 'An error occurred while unloading items.', 'error');
            });
        }
    });
});


    // When the window is closed and reopened, it restores the data
    unloadItemsPopup.addEventListener('click', function (event) {
        if (event.target === unloadItemsPopup) {
            unloadTableBody.innerHTML = originalTableContent;
        }
    });
});