// JavaScript to handle redirection to the admin page
const params = new URLSearchParams(window.location.search);
const username = params.get('username');

if (username) {
    const mainPageLink = document.getElementById('mainPageLink');
    mainPageLink.href = `../admin_page.html?username=${encodeURIComponent(username)}`;
}

document.addEventListener('DOMContentLoaded', function() {
    const categories = document.querySelectorAll('.category-item');
    const productTableBody = document.getElementById('productTableBody');

    // Function to toggle selection of categories
    categories.forEach(category => {
        category.addEventListener('click', function() {
            this.classList.toggle('selected'); // Toggle 'selected' class
            updateTable();
        });
    });

    function updateTable() {
        const selectedCategories = Array.from(document.querySelectorAll('.category-item.selected'))
            .map(category => category.textContent);

        const rows = productTableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const productCategory = row.querySelector('td:nth-child(2)').textContent;

            if (selectedCategories.length === 0 || selectedCategories.includes(productCategory)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
});
