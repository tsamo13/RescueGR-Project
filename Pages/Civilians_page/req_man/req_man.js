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

    // Add event listeners to category items for selection and filtering products
    const categoryItems = document.querySelectorAll('.category-item');
    const productRows = document.querySelectorAll('.product-table tbody tr');

    let selectedCategory = null; // Track the currently selected category

    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // If the clicked category is already selected, deselect it
            if (selectedCategory === item) {
                item.classList.remove('selected');
                selectedCategory = null;
                // Show all products
                productRows.forEach(row => {
                    row.style.display = '';
                });
            } else {
                // Remove 'selected' class from any previously selected item
                if (selectedCategory) {
                    selectedCategory.classList.remove('selected');
                }

                // Add 'selected' class to the clicked item
                item.classList.add('selected');
                selectedCategory = item;

                // Filter products based on the selected category
                const selectedCategoryName = item.textContent;
                productRows.forEach(row => {
                    const productCategory = row.querySelector('td:nth-child(2)').textContent;
                    if (productCategory === selectedCategoryName) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            }
        });
    });

    // Handle product selection and update the form
    const selectedProductInput = document.getElementById('selectedProduct');
    productRows.forEach(row => {
        row.addEventListener('click', function() {
            // Remove 'selected' class from any previously selected product
            const currentlySelectedProduct = document.querySelector('.product-table tbody tr.selected');
            if (currentlySelectedProduct) {
                currentlySelectedProduct.classList.remove('selected');
            }

            // Add 'selected' class to the clicked product
            row.classList.add('selected');

            // Update the form input with the selected product name
            const productName = row.querySelector('td:nth-child(1)').textContent;
            selectedProductInput.value = productName;
        });
    });

    // Handle form submission
    const requestForm = document.getElementById('requestForm');
    const quantityInput = document.getElementById('quantity');

    // Custom validation message for the quantity input
    quantityInput.addEventListener('input', function() {
        if (!Number.isInteger(parseFloat(quantityInput.value))) {
            quantityInput.setCustomValidity('The number must be an integer');
        } else {
            quantityInput.setCustomValidity('');
        }
    });

    requestForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Check if a product has been selected
        if (selectedProductInput.value === '') {
            alert('Please select a product before submitting the form.');
            return;
        }

        // Clear the form fields
        requestForm.reset();

        // Also clear the selected product input
        selectedProductInput.value = '';
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const historyButton = document.querySelector('.history-btn');
    const popup = document.getElementById('requestsHistoryPopup');
    const closeButton = document.querySelector('.close-popup-btn');

    historyButton.addEventListener('click', function(event) {
        event.preventDefault();
        popup.style.display = 'flex';
    });

    closeButton.addEventListener('click', function() {
        popup.style.display = 'none';
    });

    // Κλείσιμο του pop-up αν ο χρήστης κάνει κλικ έξω από το παράθυρο
    window.addEventListener('click', function(event) {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });
});
