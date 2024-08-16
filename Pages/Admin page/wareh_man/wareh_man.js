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
