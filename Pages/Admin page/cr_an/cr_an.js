// JavaScript to handle 'Load Products' button click

const params = new URLSearchParams(window.location.search);
const username = params.get('username');
let allItems = [];                          // Global storage for all items

if (username) {
    const mainPageLink = document.getElementById('mainPageLink');
    mainPageLink.href = `../admin_page.html?username=${encodeURIComponent(username)}`;
}

document.addEventListener('DOMContentLoaded', function() {
    const products = [
        "Toothbrush", "Toothpaste", "Shampoo", "Soap", "Hand Sanitizer",
        "Tissues", "Deodorant", "Body Wash", "Face Mask", "Toilet Paper",
        "Moisturizer", "Shaving Cream", "Razors", "Mouthwash", "Cotton Swabs"
    ];

    const productSelect = document.getElementById('productSelect');
    const productSearch = document.getElementById('productSearch');
    const form = document.getElementById('announcementForm');

    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product;
        option.textContent = product;
        productSelect.appendChild(option);
    });

    productSelect.addEventListener('change', function() {
        const selectedProduct = productSelect.value;
        productSearch.value = selectedProduct;
    });

    productSearch.addEventListener('input', function() {
        filterProducts();
        const matchingOption = Array.from(productSelect.options).find(option => option.value.toLowerCase() === productSearch.value.toLowerCase());
        if (matchingOption) {
            productSelect.value = matchingOption.value;
        }
    });

    // Event listener για να αποτρέψουμε την προεπιλεγμένη ενέργεια της φόρμας και να την καθαρίσουμε
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Αποτροπή της προεπιλεγμένης ενέργειας υποβολής
        form.reset(); // Καθαρισμός της φόρμας
        resetProductList(); // Επαναφορά της πλήρους λίστας προϊόντων
    });

    function resetProductList() {
        // Επαναφορά της εμφάνισης όλων των προϊόντων στη λίστα
        for (let i = 0; i < productSelect.options.length; i++) {
            productSelect.options[i].style.display = ""; // Εμφανίζει όλα τα προϊόντα
        }
    }
});

function filterProducts() {
    const searchInput = document.getElementById('productSearch').value.toLowerCase();
    const productSelect = document.getElementById('productSelect');
    const options = productSelect.getElementsByTagName('option');

    for (let i = 0; i < options.length; i++) {
        const product = options[i].value.toLowerCase();
        if (product.includes(searchInput)) {
            options[i].style.display = ""; // Εμφανίζει την επιλογή
        } else {
            options[i].style.display = "none"; // Κρύβει την επιλογή
        }
    }
}
