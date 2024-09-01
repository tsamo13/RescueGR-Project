// JavaScript to handle redirection to the civilian page
const params = new URLSearchParams(window.location.search);
const username = params.get('username');

if (username) {
    const mainPageLink = document.getElementById('mainPageLink');
    mainPageLink.href = `../civ_page?username=${encodeURIComponent(username)}`;
}

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

    // Fetch announcements from the server
    fetch('/aof_page/get_announcements')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const announcementsTableBody = document.querySelector('.a-table tbody');
                announcementsTableBody.innerHTML = ''; // Clear existing table rows

                data.announcements.forEach(announcement => {
                    const row = document.createElement('tr');

                    const titleCell = document.createElement('td');
                    titleCell.textContent = announcement.title;
                    row.appendChild(titleCell);

                    const descriptionCell = document.createElement('td');
                    descriptionCell.textContent = announcement.description;
                    row.appendChild(descriptionCell);

                    const itemCell = document.createElement('td');
                    itemCell.textContent = announcement.item_name;
                    row.appendChild(itemCell);

                    const createdAtCell = document.createElement('td');
                    createdAtCell.textContent = new Date(announcement.created_at).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    row.appendChild(createdAtCell);

                    // Attach click event listener to the row
                    row.addEventListener('click', function() {
                        // Remove 'selected' class from all rows
                        const allRows = announcementsTableBody.querySelectorAll('tr');
                        allRows.forEach(r => r.classList.remove('selected'));

                        // Add 'selected' class to the clicked row
                        row.classList.add('selected');
                        selectedRow = row;
                    });

                    announcementsTableBody.appendChild(row);
                });
            } else {
                console.error('Failed to load announcements:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));


    const rows = document.querySelectorAll('.a-table tbody tr');
    const offerButton = document.querySelector('.offer-button');
    const historyButton = document.querySelector('.history-button');
    const makeOfferPopup = document.getElementById('makeOfferPopup');
    const offersHistoryPopup = document.getElementById('offersHistoryPopup');
    const closeOfferPopupBtn = document.querySelector('.close-popup-btn');
    const closeHistoryPopupBtn = document.querySelector('.close-history-popup-btn');
    const offerForm = document.getElementById('offerForm');
    const selectedItemInput = document.getElementById('selectedItem');
    const offerQuantityInput = document.getElementById('offerQuantity');


    offerButton.addEventListener('click', function() {
        if (!selectedRow) {
            Swal.fire('Please select an item before making an offer!');
        } else {
            const itemName = selectedRow.querySelector('td:nth-child(3)').textContent;
            selectedItemInput.value = itemName;
            makeOfferPopup.style.display = 'flex';
            selectedRow.classList.remove('selected');
            selectedRow = null;
        }
    });

    historyButton.addEventListener('click', function() {
        offersHistoryPopup.style.display = 'flex';
    
        // Fetch offers history from the server
        fetch('/aof_page/get_offers_history')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const historyTableBody = document.querySelector('.history-table tbody');
                    historyTableBody.innerHTML = ''; // Clear existing table rows
    
                    data.offers.forEach(offer => {
                        const row = document.createElement('tr');
    
                        const itemNameCell = document.createElement('td');
                        itemNameCell.textContent = offer.item_name;
                        row.appendChild(itemNameCell);
    
                        const quantityCell = document.createElement('td');
                        quantityCell.textContent = offer.quantity;
                        row.appendChild(quantityCell);
    
                        const statusCell = document.createElement('td');
                        statusCell.textContent = offer.status;
                        row.appendChild(statusCell);
    
                        const createdAtCell = document.createElement('td');
                        createdAtCell.textContent = new Date(offer.created_at).toLocaleDateString('en-GB', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        row.appendChild(createdAtCell);
    
                        const acceptedAtCell = document.createElement('td');
                        acceptedAtCell.textContent = offer.accepted_at ? new Date(offer.accepted_at).toLocaleString() : '';
                        row.appendChild(acceptedAtCell);
    
                        const completedAtCell = document.createElement('td');
                        completedAtCell.textContent = offer.completed_at ? new Date(offer.completed_at).toLocaleString() : '';
                        row.appendChild(completedAtCell);

                    // Attach event listener for row selection
                    row.addEventListener('click', function() {
                    // Remove 'selected' class from all rows
                    document.querySelectorAll('.history-table tbody tr').forEach(r => r.classList.remove('selected'));
                    
                    // Add 'selected' class to the clicked row
                    row.classList.add('selected');
                    selectedHistoryRow = row; // Store the selected row in the variable
                    });
                         historyTableBody.appendChild(row);
                     });
                    } else {
                        console.error('Failed to load offers history:', data.message);
                     }
                })
                .catch(error => console.error('Error:', error));
            });
    

    closeOfferPopupBtn.addEventListener('click', function() {
        makeOfferPopup.style.display = 'none';
        // Κατά το κλείσιμο του παραθύρου "Make an Offer", αποεπιλέγουμε την επιλεγμένη γραμμή και την κάνουμε null
        if (selectedRow) {
            selectedRow.classList.remove('selected');
            selectedRow = null;
        }
    });

    window.addEventListener('click', function(event) {
        if (event.target === makeOfferPopup) {
            makeOfferPopup.style.display = 'none';
            // Κατά το κλείσιμο του παραθύρου "Make an Offer" με κλικ έξω, αποεπιλέγουμε την επιλεγμένη γραμμή και την κάνουμε null
            if (selectedRow) {
                selectedRow.classList.remove('selected');
                selectedRow = null;
            }
        }
    });

    offerQuantityInput.addEventListener('input', function() {
        const quantityValue = Number(offerQuantityInput.value);

        if (quantityValue < 1 || !Number.isInteger(quantityValue)) {
            offerQuantityInput.setCustomValidity('The number must be a positive integer');
        } else {
            offerQuantityInput.setCustomValidity('');
        }
    });

    offerForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
    
        if (offerQuantityInput.value === '' || offerQuantityInput.value < 1) {
            Swal.fire('Please enter a valid quantity!');
            return;
        }
    
        const offerData = {
            item_name: selectedItemInput.value,
            quantity: offerQuantityInput.value
        };
    
        fetch('/aof_page/create_offer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(offerData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({title: 'Success!', text:'Offer submitted successfully!', icon: 'success', confirmButtonText: 'OK'});
                offerForm.reset();
                makeOfferPopup.style.display = 'none';
            } else {
                Swal.fire('Failed to submit offer: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('An error occurred while submitting the offer!');
        });
    });
    

    // Functionality for selecting a row in the "Offers history" table
    let selectedHistoryRow = null;
    const historyRows = document.querySelectorAll('.history-table tbody tr');

    historyRows.forEach(function(row) {
        row.addEventListener('click', function() {
            // Remove 'selected' class from all rows
            historyRows.forEach(r => r.classList.remove('selected'));
            
            // Add 'selected' class to the clicked row
            row.classList.add('selected');
            selectedHistoryRow = row; // Store the selected row in the variable
        });
    });

// Functionality for the "Cancel offer" button
document.getElementById('cancelOfferButton').addEventListener('click', function() {
    if (!selectedHistoryRow) {
        Swal.fire('Please select an offer to cancel!');
        return;
    }
    const status = selectedHistoryRow.querySelector('td:nth-child(3)').textContent;
    const itemName = selectedHistoryRow.querySelector('td:nth-child(1)').textContent;

    if (status === 'Pending') {

        // Send a DELETE request to the backend to remove the offer from the database
        fetch('/aof_page/delete_offer', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ item_name: itemName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                selectedHistoryRow.remove(); // Remove the row if the status is Pending
                selectedHistoryRow = null; // Reset the selected row after removal
                Swal.fire('Offer canceled successfully!');
            } else {
                Swal.fire('Failed to cancel offer!');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('An error occurred while canceling the offer!');
        });
    } else {
        Swal.fire('You can only cancel a pending offer!');
    }
});

    closeHistoryPopupBtn.addEventListener('click', function() {
        offersHistoryPopup.style.display = 'none';
        // Κατά το κλείσιμο του παραθύρου "Offers History", αποεπιλέγουμε την επιλεγμένη γραμμή και την κάνουμε null
        if (selectedHistoryRow) {
            selectedHistoryRow.classList.remove('selected');
            selectedHistoryRow = null;
        }
    });

});
