// JavaScript to handle 'Load Products' button click

const params = new URLSearchParams(window.location.search);
const username = params.get('username');

if (username) {
    const mainPageLink = document.getElementById('mainPageLink');
    mainPageLink.href = `../admin_page.html?username=${encodeURIComponent(username)}`;
}

document.getElementById('loadProductsBtn').addEventListener('click', function() {
    fetch('/manage_data/insert_data', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            populateCategoryList(data.categories);
            populateProductList(data.items)
        } else {
            alert('Failed to load products');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

// Function to populate the category list
function populateCategoryList(categories) {
    const categoryList = document.querySelector('.category-list');
    categoryList.innerHTML = ''; // Clear any existing categories

    categories.forEach(category => {
        const li = document.createElement('li');
        li.className = 'category-item';
        li.textContent = category.category_name;
        categoryList.appendChild(li);

        // Add click event to select the category
        li.addEventListener('click', function() {
            // Remove 'selected' class from any previously selected item
            const currentlySelected = document.querySelector('.category-item.selected');
            if (currentlySelected) {
                currentlySelected.classList.remove('selected');
            }

            // Add 'selected' class to the clicked item
            li.classList.add('selected');
        });
    });
}

// Function to populate the products list
function populateProductList(items) {
    const productTableBody = document.querySelector('.product-table tbody');
    productTableBody.innerHTML = ''; // Clear any existing products

    items.forEach(item => {
        const tr = document.createElement('tr');

        const nameTd = document.createElement('td');
        nameTd.textContent = item.item_name;
        tr.appendChild(nameTd);

        const detailsTd = document.createElement('td');
        detailsTd.textContent = item.description;
        tr.appendChild(detailsTd);

        const quantityTd = document.createElement('td');
        quantityTd.textContent = item.quantity;
        tr.appendChild(quantityTd);

        const categoryTd = document.createElement('td');
        categoryTd.textContent = item.category_name; // Display the category name
        tr.appendChild(categoryTd);

        productTableBody.appendChild(tr);
    });
}


// Event listener for the "Clear Products" button
document.getElementById('clearProductsBtn').addEventListener('click', function() {
    fetch('/manage_data/delete_data', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            clearCategoryList();
            
            // Clear all products from the products table
            clearProductTable();
        } else {
            alert('Failed to clear products');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

// Function to clear the category list in the front-end
function clearCategoryList() {
    const categoryList = document.querySelector('.category-list');
    categoryList.innerHTML = ''; // Clear the list
}

// Function to clear the products table in the front-end
function clearProductTable() {
    const productTableBody = document.querySelector('.product-table tbody');
    productTableBody.innerHTML = ''; // Clear all products
}

// Event listener for the "Add Category" button to show the modal
document.getElementById('addCategoryBtn').addEventListener('click', function() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none'; // Hide the error message when opening the modal
    document.getElementById('addCategoryForm').reset();
    document.getElementById('addCategoryModal').style.display = 'flex';
});

// Event listener for the "Save" button in the category modal
document.getElementById('addCategoryForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const categoryName = document.getElementById('categoryName').value.trim();
    const errorMessage = document.getElementById('errorMessage');

    const categoryList = Array.from(document.querySelectorAll('.category-item')).map(item => item.textContent);

    if (!categoryName) {
        // Show error message if the category name is empty
        errorMessage.textContent = 'Category Name is required.';
        errorMessage.style.display = 'block';
    } else if (categoryList.includes(categoryName)) {
        // Show error message if the category name already exists
        errorMessage.textContent = 'Category Name already exists.';
        errorMessage.style.display = 'block';
    } else {
        // Send POST request to add category to the database
        fetch('/manage_data/add_category', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ categoryName: categoryName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Add the new category to the list in the frontend
                const newCategory = document.createElement('li');
                newCategory.className = 'category-item';
                newCategory.textContent = categoryName;
                document.querySelector('.category-list').appendChild(newCategory);

                // Add click event to select the new category
                newCategory.addEventListener('click', function() {
                    const currentlySelected = document.querySelector('.category-item.selected');
                    if (currentlySelected) {
                        currentlySelected.classList.remove('selected');
                    }
                    newCategory.classList.add('selected');
                });

                // Close the modal
                document.getElementById('addCategoryModal').style.display = 'none';

                // Reset the form fields
                document.getElementById('addCategoryForm').reset();
            } else {
                // Show error message if adding category failed
                errorMessage.textContent = data.message || 'Failed to add category.';
                errorMessage.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        });
    }
});

// Event listener for the close button (X) to hide the category modal
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('addCategoryModal').style.display = 'none';
});

// Event listener for the "Delete Category" button to remove the selected category
document.querySelector('.btn-bwm + .btn-bwm').addEventListener('click', function() {
    const selectedCategory = document.querySelector('.category-item.selected');
    if (selectedCategory) {
        const categoryName = selectedCategory.textContent;
        console.log('Deleting category:', categoryName);

        // Send POST request to delete the category from the database
        fetch('/manage_data/delete_category', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ categoryName: categoryName })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Delete category response:', data); // Log the response
            if (data.success) {
                // Remove products that belong to the deleted category
                const productRows = document.querySelectorAll('.product-table tbody tr');
                productRows.forEach(row => {
                    const productCategory = row.querySelector('td:nth-child(4)').textContent;
                    if (productCategory === categoryName) {
                        row.remove();
                    }
                });

                // Remove the selected category from the frontend
                selectedCategory.remove();
            } else {
                alert('Failed to delete category: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    } else {
        alert('Please select a category to delete.');
    }
});

// Event listener for the "Add" button in the products table
document.querySelector('.products-list-wrapper .btn-bwm').addEventListener('click', function() {
    const errorMessage = document.getElementById('productErrorMessage');
    errorMessage.style.display = 'none'; // Hide the error message when opening the modal

    // Clear the form fields
    document.getElementById('addProductForm').reset();

    // Populate the category dropdown list with existing categories
    populateCategoryDropdown();

    // Display the modal
    document.getElementById('addProductModal').style.display = 'flex';
});

// Function to populate the category dropdown list
function populateCategoryDropdown() {
    const categoryDropdown = document.getElementById('productCategory');
    categoryDropdown.innerHTML = ''; // Clear any existing options

    const categories = Array.from(document.querySelectorAll('.category-item')).map(item => item.textContent);

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryDropdown.appendChild(option);
    });
}

// Event listener for the close button (X) to hide the product modal
document.querySelector('.close-product-modal').addEventListener('click', function() {
    document.getElementById('addProductModal').style.display = 'none';
});

// Event listener for the "Save" button in the product modal
document.getElementById('addProductForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const productName = document.getElementById('productName').value.trim();
    const productDetails = document.getElementById('productDetails').value.trim();
    const productQuantity = parseInt(document.getElementById('productQuantity').value, 10);
    const productCategory = document.getElementById('productCategory').value;
    const errorMessage = document.getElementById('productErrorMessage');

    const productList = Array.from(document.querySelectorAll('.product-table tbody tr')).map(row => row.querySelector('td:nth-child(1)').textContent);

    if (!productName) {
        // Show error message if the product name is empty
        errorMessage.textContent = 'Product Name is required.';
        errorMessage.style.display = 'block';
    } else if (productList.includes(productName)) {
        // Show error message if the product name already exists
        errorMessage.textContent = 'Product Name already exists.';
        errorMessage.style.display = 'block';
    } else if (isNaN(productQuantity) || productQuantity < 0) {
        // Show error message if the quantity is not a valid number
        errorMessage.textContent = 'Quantity must be a valid integer greater than or equal to 0.';
        errorMessage.style.display = 'block';
    } else {
        // Add the new product to the list
        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td>${productName}</td>
            <td>${productDetails}</td>
            <td>${productQuantity}</td>
            <td>${productCategory}</td>
        `;

        document.querySelector('.product-table tbody').appendChild(newRow);

        // Close the modal
        document.getElementById('addProductModal').style.display = 'none';

        // Reset the form fields
        document.getElementById('addProductForm').reset();
    }
});

// Event listener for the "Edit" button in the products table to edit the selected product
document.querySelector('.products-list-wrapper .btn-bwm + .btn-bwm + .btn-bwm').addEventListener('click', function() {
    const selectedProduct = document.querySelector('.product-table tbody tr.selected');
    if (selectedProduct) {
        const productName = selectedProduct.querySelector('td:nth-child(1)').textContent;
        const productDetails = selectedProduct.querySelector('td:nth-child(2)').textContent;
        const productQuantity = selectedProduct.querySelector('td:nth-child(3)').textContent;

        // Pre-fill the form with the selected product's current values
        document.getElementById('editProductName').value = productName;
        document.getElementById('editProductDetails').value = productDetails;
        document.getElementById('editProductQuantity').value = productQuantity;

        const errorMessage = document.getElementById('editProductErrorMessage');
        errorMessage.style.display = 'none'; // Hide the error message when opening the modal

        // Display the modal
        document.getElementById('editProductModal').style.display = 'flex';
    } else {
        alert('Please select a product to edit.');
    }
});

// Event listener for the "Save" button in the edit product modal
document.getElementById('editProductForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const newProductName = document.getElementById('editProductName').value.trim();
    const newProductDetails = document.getElementById('editProductDetails').value.trim();
    const newProductQuantity = parseInt(document.getElementById('editProductQuantity').value, 10);
    const errorMessage = document.getElementById('editProductErrorMessage');

    const productList = Array.from(document.querySelectorAll('.product-table tbody tr')).map(row => row.querySelector('td:nth-child(1)').textContent);
    const selectedProduct = document.querySelector('.product-table tbody tr.selected');
    const originalProductName = selectedProduct.querySelector('td:nth-child(1)').textContent;

    // Validation checks
    if (!newProductName) {
        errorMessage.textContent = 'Product Name is required.';
        errorMessage.style.display = 'block';
    } else if (newProductName !== originalProductName && productList.includes(newProductName)) {
        errorMessage.textContent = 'Product Name already exists.';
        errorMessage.style.display = 'block';
    } else if (isNaN(newProductQuantity) || newProductQuantity < 0) {
        errorMessage.textContent = 'Quantity must be a valid integer greater than or equal to 0.';
        errorMessage.style.display = 'block';
    } else {
        // Update the product's information in the table
        selectedProduct.querySelector('td:nth-child(1)').textContent = newProductName;
        selectedProduct.querySelector('td:nth-child(2)').textContent = newProductDetails;
        selectedProduct.querySelector('td:nth-child(3)').textContent = newProductQuantity;

        // Close the modal
        document.getElementById('editProductModal').style.display = 'none';

        // Reset the form fields
        document.getElementById('editProductForm').reset();
    }
});

// Event listener for the close button (X) to hide the edit product modal
document.querySelector('.close-edit-modal').addEventListener('click', function() {
    document.getElementById('editProductModal').style.display = 'none';
});

// Event listener for the "Delete" button in the products table to remove the selected product
document.querySelector('.products-list-wrapper .btn-bwm + .btn-bwm').addEventListener('click', function() {
    const selectedProduct = document.querySelector('.product-table tbody tr.selected');
    if (selectedProduct) {
        selectedProduct.remove();
    } else {
        alert('Please select a product to delete.');
    }
});

// Add click event listener to product rows to allow selection
document.querySelector('.product-table tbody').addEventListener('click', function(event) {
    const row = event.target.closest('tr');
    if (row) {
        // Remove 'selected' class from any previously selected product
        const currentlySelected = document.querySelector('.product-table tbody tr.selected');
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
        }

        // Add 'selected' class to the clicked row
        row.classList.add('selected');
    }
});
