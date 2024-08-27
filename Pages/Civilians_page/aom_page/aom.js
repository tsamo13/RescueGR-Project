// JavaScript to handle redirection to the civilian page
const params = new URLSearchParams(window.location.search);
const username = params.get('username');

if (username) {
    const mainPageLink = document.getElementById('mainPageLink');
    mainPageLink.href = `../civ_page?username=${encodeURIComponent(username)}`;
}

document.addEventListener('DOMContentLoaded', function() {
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

    let selectedRow = null;
    let selectedHistoryRow = null;

    rows.forEach(function(row) {
        row.addEventListener('click', function() {
            // Αφαίρεση της κλάσης 'selected' από όλες τις γραμμές
            rows.forEach(r => r.classList.remove('selected'));
            
            // Προσθήκη της κλάσης 'selected' στη γραμμή που κλικάρεται
            row.classList.add('selected');
            selectedRow = row;
        });
    });

    offerButton.addEventListener('click', function() {
        if (!selectedRow) {
            alert('Please select an item before making an offer.');
        } else {
            const itemName = selectedRow.querySelector('td:nth-child(3)').textContent;
            selectedItemInput.value = itemName;
            makeOfferPopup.style.display = 'flex';
        }
    });

    historyButton.addEventListener('click', function() {
        offersHistoryPopup.style.display = 'flex';
    });

    closeOfferPopupBtn.addEventListener('click', function() {
        makeOfferPopup.style.display = 'none';
        // Κατά το κλείσιμο του παραθύρου "Make an Offer", αποεπιλέγουμε την επιλεγμένη γραμμή και την κάνουμε null
        if (selectedRow) {
            selectedRow.classList.remove('selected');
            selectedRow = null;
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

    window.addEventListener('click', function(event) {
        if (event.target === makeOfferPopup) {
            makeOfferPopup.style.display = 'none';
            // Κατά το κλείσιμο του παραθύρου "Make an Offer" με κλικ έξω, αποεπιλέγουμε την επιλεγμένη γραμμή και την κάνουμε null
            if (selectedRow) {
                selectedRow.classList.remove('selected');
                selectedRow = null;
            }
        }
        if (event.target === offersHistoryPopup) {
            offersHistoryPopup.style.display = 'none';
            // Κατά το κλείσιμο του παραθύρου "Offers History" με κλικ έξω, αποεπιλέγουμε την επιλεγμένη γραμμή και την κάνουμε null
            if (selectedHistoryRow) {
                selectedHistoryRow.classList.remove('selected');
                selectedHistoryRow = null;
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
            alert('Please enter a valid quantity.');
            return;
        }

        // Λογική για το submit της φόρμας (π.χ. αποστολή δεδομένων σε διακομιστή)
        alert('Offer submitted successfully!');
        offerForm.reset();
        makeOfferPopup.style.display = 'none';
    });

    // Functionality for selecting a row in the "Offers history" table
    const historyRows = document.querySelectorAll('.history-table tbody tr');

    historyRows.forEach(function(row) {
        row.addEventListener('click', function() {
            // Remove 'selected' class from all rows
            historyRows.forEach(r => r.classList.remove('selected'));
            
            // Add 'selected' class to the clicked row
            row.classList.add('selected');
            selectedHistoryRow = row;
        });
    });

    // Functionality for the "Cancel offer" button
    document.getElementById('cancelOfferButton').addEventListener('click', function() {
        if (!selectedHistoryRow) {
            alert('Please select an offer to cancel.');
            return;
        }

        const status = selectedHistoryRow.querySelector('td:nth-child(3)').textContent;

        if (status === 'Pending') {
            selectedHistoryRow.remove(); // Remove the row if the status is Pending
            selectedHistoryRow = null; // Reset the selected row after removal
            alert('Offer canceled successfully.');
        } else {
            alert('You can only cancel a pending offer.');
        }
    });
});
