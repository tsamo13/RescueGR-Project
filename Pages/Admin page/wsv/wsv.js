// JavaScript to handle redirection to the admin page
const params = new URLSearchParams(window.location.search);
const username = params.get('username');


if (username) {
    const mainPageLink = document.getElementById('mainPageLink');
    mainPageLink.href = `../admin_page.html?username=${encodeURIComponent(username)}`;
}
 
document.addEventListener('DOMContentLoaded', function() {
    const categoriesList = document.querySelector('.category-list');
    const productTableBody = document.getElementById('productTableBody');

    // Fetch categories and products from the server
    fetch('/warehouse_status')
        .then(response => response.json())
        .then(data => {
            // Populate categories list
            data.categories.forEach(category => {
                const li = document.createElement('li');
                li.textContent = category.category_name;
                li.classList.add('category-item');
                categoriesList.appendChild(li);
            });

            // Populate products table
            data.products.forEach(product => {
                const tr = document.createElement('tr');

                const nameTd = document.createElement('td');
                nameTd.textContent = product.name;
                tr.appendChild(nameTd);

                const categoryTd = document.createElement('td');
                categoryTd.textContent = product.category;
                tr.appendChild(categoryTd);

                const atBaseTd = document.createElement('td');
                atBaseTd.textContent = product.at_base;
                tr.appendChild(atBaseTd);

                productTableBody.appendChild(tr);
            });

            // Attach event listeners to categories after they are added to the DOM
            const categories = document.querySelectorAll('.category-item');
            categories.forEach(category => {
                category.addEventListener('click', function() {
                    this.classList.toggle('selected'); // Toggle 'selected' class
                    updateTable();
                });
            });

            function updateTable() {
                const selectedCategories = Array.from(document.querySelectorAll('.category-item.selected'))
                    .map(category => category.textContent.trim());
    
                const rows = productTableBody.querySelectorAll('tr');

                rows.forEach(row => {
                    const productCategory = row.querySelector('td:nth-child(2)').textContent.trim();
                    if (selectedCategories.length === 0 || selectedCategories.includes(productCategory)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error fetching warehouse status:', error);
        });
});


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