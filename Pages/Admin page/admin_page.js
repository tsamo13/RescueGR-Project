document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Αποφυγή της προεπιλεγμένης συμπεριφοράς της φόρμας

    // Παίρνουμε τις τιμές των πεδίων εισαγωγής
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Δημιουργούμε το σώμα του αιτήματος
    const data = {
        username: username,
        password: password
    };

    // Αποστολή των δεδομένων στον server
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        // Ελέγξτε την απάντηση από τον server και κάντε την κατάλληλη ενέργεια
        if (data.success) {
            if (data.role === 'administrator') {
                // Ανακατεύθυνση στη σελίδα του διαχειριστή
                window.location.href = 'admin_page.html';
            } else {
                // Ανακατεύθυνση σε άλλη σελίδα για τους χρήστες που δεν είναι διαχειριστές
                window.location.href = 'user_dashboard.html';
            }
        } else {
            // Εμφάνιση μηνύματος λάθους
            alert('Invalid login credentials');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
