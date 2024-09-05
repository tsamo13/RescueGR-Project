// Existing code

const params = new URLSearchParams(window.location.search);
const username = params.get('username');
let allItems = []; // Global storage for all items

if (username) {
    const mainPageLink = document.getElementById('mainPageLink');
    mainPageLink.href = `../admin_page?username=${encodeURIComponent(username)}`;
}

document.addEventListener('DOMContentLoaded', function () {
    const productSelect = document.getElementById('productSelect');
    const productSearch = document.getElementById('productSearch');
    const form = document.getElementById('announcementForm');

    // Fetch products from the database and populate the dropdown
    fetch('/manage_data/get_products')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allItems = data.products; // Store all items globally
                productSelect.innerHTML = ''; // Clear any existing options

                allItems.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.id;
                    option.textContent = product.name;
                    productSelect.appendChild(option);
                });
            } else {
                console.error('Failed to load products:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));

    productSelect.addEventListener('change', function () {
        const selectedProduct = productSelect.options[productSelect.selectedIndex].text;
        productSearch.value = selectedProduct;
    });

    productSearch.addEventListener('input', function () {
        filterProducts();
        const matchingOption = Array.from(productSelect.options).find(option => option.text.toLowerCase() === productSearch.value.toLowerCase());
        if (matchingOption) {
            productSelect.value = matchingOption.value;
        }
    });

   // Handle form submission for creating an announcement
   form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const selectedProduct = productSelect.options[productSelect.selectedIndex].text;

    // Prepare data to be sent to the server
    const announcementData = {
        title: title,
        description: description,
        item_name: selectedProduct
    };

    // Send data to the server
    fetch('/announcements/create_announcement', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(announcementData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                title: 'Success!',
                text: 'Announcement created successfully!',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            form.reset(); // Reset the form
            resetProductList(); // Reset the product list display
        } else {
           Swal.fire({
            title: 'Error!',
            text: 'Failed to create announcement: ' + data.message,
            icon: 'error',
            confirmButtonText: 'OK'
           });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({title: 'Error!', text:'An error occurred while creating the anouncement!', icon: 'error', confirmButtonText: 'OK'});
    });
});

    function resetProductList() {
        // Display all products in the list
        for (let i = 0; i < productSelect.options.length; i++) {
            productSelect.options[i].style.display = ""; // Show all products
        }
    }
});

function filterProducts() {
    const searchInput = document.getElementById('productSearch').value.toLowerCase();
    const productSelect = document.getElementById('productSelect');
    const options = productSelect.getElementsByTagName('option');

    for (let i = 0; i < options.length; i++) {
        const product = options[i].text.toLowerCase();
        if (product.includes(searchInput)) {
            options[i].style.display = ""; // Show the option
        } else {
            options[i].style.display = "none"; // Hide the option
        }
    }
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
    const announcementTableBody = document.getElementById('announcementTableBody');
    let selectedRow = null;

    // Fetch and display announcements
    fetch('/announcements/get_announcements')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                data.announcements.forEach(announcement => {
                    const tr = document.createElement('tr');

                    const titleTd = document.createElement('td');
                    titleTd.textContent = announcement.title;
                    tr.appendChild(titleTd);

                    const productTd = document.createElement('td');
                    productTd.textContent = announcement.item_name;
                    tr.appendChild(productTd);

                    announcementTableBody.appendChild(tr);
                });
            } else {
                console.error('Failed to load announcements:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));

    // Handle row selection for deletion
    announcementTableBody.addEventListener('click', function(e) {
        const targetRow = e.target.closest('tr');

        if (selectedRow) {
            selectedRow.classList.remove('selected'); // Deselect the previously selected row
        }

        if (targetRow && targetRow !== selectedRow) {
            targetRow.classList.add('selected'); // Select the new row
            selectedRow = targetRow;
        } else {
            selectedRow = null; // Deselect if the same row is clicked
        }
    });

    // Handle Delete button click
    const deleteButton = document.getElementById('deleteButton');
    deleteButton.addEventListener('click', function() {
        if (selectedRow) {
            const title = selectedRow.querySelector('td:first-child').textContent;
    
            fetch('/announcements/delete_announcement', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    selectedRow.remove(); // Remove the selected row from the table
                    selectedRow = null; // Reset the selected row
                    Swal.fire('Announcement deleted successfully!');
                } else {
                    Swal.fire({title: 'Error!', text:'Failed to delete announcement!', icon: 'error', confirmButtonText: 'OK'});
                }
            })
            .catch(error => {
                console.error('Error deleting announcement:', error);
                Swal.fire({title: 'Error!', text:'An error occurred while deleting the announcement!', icon: 'error', confirmButtonText: 'OK'});
            });
        } else {
            Swal.fire('Please select an announcement to delete!');
        }
    });
});
