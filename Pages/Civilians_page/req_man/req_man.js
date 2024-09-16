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
    const categoryList = document.querySelector('.category-list');
    const productTableBody = document.querySelector('.product-table tbody');
    const requestForm = document.getElementById('requestForm');
    const quantityInput = document.getElementById('quantity');
    const selectedProductInput = document.getElementById('selectedProduct');

    
    // Fetch categories and items
    fetch('/requests/get_categories_items')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Populate categories
                categoryList.innerHTML = ''; 
                data.categories.forEach(category => {
                    const li = document.createElement('li');
                    li.classList.add('category-item');
                    li.textContent = category.category_name;
                    categoryList.appendChild(li);
                });
    
                // Populate products
                productTableBody.innerHTML = ''; 
                data.items.forEach(item => {
                    const tr = document.createElement('tr');
    
                    const nameTd = document.createElement('td');
                    nameTd.textContent = item.item_name;
                    tr.appendChild(nameTd);
    
                    const categoryTd = document.createElement('td');
                    categoryTd.textContent = item.category_name;
                    tr.appendChild(categoryTd);
    
                    productTableBody.appendChild(tr);
                });
    
                // Reattach event listeners for the newly added categories and products
                attachCategoryAndProductListeners();
            } else {
                console.error('Failed to load categories and items:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));

        // Add event listeners to category items for selection and filtering products
    function attachCategoryAndProductListeners() {
        const categoryItems = document.querySelectorAll('.category-item');
        const productRows = document.querySelectorAll('.product-table tbody tr');
    
        let selectedCategory = null;  // Track the currently selected category
    
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
        productRows.forEach(row => {
            row.addEventListener('click', function() {
                const currentlySelectedProduct = document.querySelector('.product-table tbody tr.selected');
                if (currentlySelectedProduct) {
                    currentlySelectedProduct.classList.remove('selected');
                }
    
                row.classList.add('selected');
                const productName = row.querySelector('td:nth-child(1)').textContent;
                document.getElementById('selectedProduct').value = productName;
            });
        });
    }
    
    // Custom validation message for the quantity input
    quantityInput.addEventListener('input', function() {
        if (!Number.isInteger(parseFloat(quantityInput.value))) {
            quantityInput.setCustomValidity('The number must be an integer');
        } else {
            quantityInput.setCustomValidity('');
        }
    });

    // Handle form submission
    requestForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Check if a product has been selected
        if (selectedProductInput.value === '' || quantityInput.value === '') {
            Swal.fire('Please select a product before submitting the form!');
            return;
        }

        const requestData = {
            item_name: selectedProductInput.value,
            quantity: quantityInput.value
        };

        fetch('/requests/submit_request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({title: 'Success!', text:'Request submitted successfully!', icon: 'success', confirmButtonText: 'OK'});
                requestForm.reset(); // Clear the form fields
                selectedProductInput.value = ''; // Also clear the selected product input
            } else {
                Swal.fire('Failed to submit request: ' + data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            Swal.fire('An error occurred while submitting the request.');
        });
    });
});
    
    
document.addEventListener('DOMContentLoaded', function() {
    const historyButton = document.querySelector('.history-btn');
    const popup = document.getElementById('requestsHistoryPopup');
    const closeButton = document.querySelector('.close-popup-btn');
    const historyTableBody = document.querySelector('.history-table tbody');

    historyButton.addEventListener('click', function(event) {
        event.preventDefault();

        // Fetch request history from the server
        fetch('/requests/get_request_history')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    historyTableBody.innerHTML = ''; 

                    data.requests.forEach(request => {
                        const row = document.createElement('tr');

                        const itemNameCell = document.createElement('td');
                        itemNameCell.textContent = request.item_name;
                        row.appendChild(itemNameCell);

                        const quantityCell = document.createElement('td');
                        quantityCell.textContent = request.quantity;
                        row.appendChild(quantityCell);

                        const statusCell = document.createElement('td');
                        statusCell.textContent = request.status;
                        row.appendChild(statusCell);

                        const createdAtCell = document.createElement('td');
                        createdAtCell.textContent = request.created_at ? new Date(request.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false,
                        }) : '';
                        row.appendChild(createdAtCell);

                        const acceptedAtCell = document.createElement('td');
                        acceptedAtCell.textContent = request.accepted_at ? new Date(request.accepted_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false,
                        }) : '';
                        row.appendChild(acceptedAtCell);

                        const completedAtCell = document.createElement('td');
                        completedAtCell.textContent = request.completed_at ? new Date(request.completed_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false,
                        }) : '';
                        row.appendChild(completedAtCell);

                        historyTableBody.appendChild(row);
                    });
                } else {
                    console.error('Failed to load request history:', data.message);
                }
            })
            .catch(error => console.error('Error:', error));

        popup.style.display = 'flex';
    });

    closeButton.addEventListener('click', function() {
        popup.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });
});

